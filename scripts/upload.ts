import path from "node:path";
import fs from "node:fs/promises";
import { Upload } from "@aws-sdk/lib-storage";
import { type PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import assert from "node:assert";

assert(process.env.AWS_ACCESS_KEY_ID, "AWS_ACCESS_KEY_ID is required");
assert(process.env.AWS_SECRET_ACCESS_KEY, "AWS_SECRET_ACCESS_KEY is required");
assert(process.env.AWS_REGION, "AWS_REGION is required");
assert(process.env.AWS_ENDPOINT, "AWS_ENDPOINT is required");
assert(process.env.AWS_BUCKET, "AWS_BUCKET is required");
assert(process.env.CDN_BASE_URL, "CDN_BASE_URL is required");

const CUSTOM_CONTENT_PREFIX = "fan_made_content";
const PROJECT_DIR = path.join(process.cwd(), "projects");

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: process.env.AWS_ENDPOINT,
  region: process.env.AWS_REGION,
});

const seenUrls = new Set();

await rehostProject(
  JSON.parse(
    await fs.readFile(
      path.join(PROJECT_DIR, `${process.argv[2]}.json`),
      "utf-8",
    ),
  ),
);

async function rehostProject(project: Project) {
  await Promise.all([
    rehostBanner(project),
    rehostCardImages(project),
    rehostEncounterSets(project),
    rehostPacks(project),
  ]);

  const projectPath = makeS3Path(project.meta.code, "project.json");

  project.meta.url = makeCdnUrl(projectPath);

  await upload(
    {
      s3Path: makeS3Path(project.meta.code, "project.json"),
      sourceUrl: "project.json",
    },
    JSON.stringify(project),
  );
}

async function rehostBanner(project: Project) {
  const meta = project.meta;
  const projectCode = meta.code;

  if (meta.banner_url) {
    const ext = path.extname(meta.banner_url);
    const s3Path = makeS3Path(projectCode, `banner${ext}`);
    if (ext) {
      await rehostFile({ sourceUrl: meta.banner_url, s3Path });
      project.meta.banner_url = makeCdnUrl(s3Path);
    } else {
      console.warn(`No file extension: ${projectCode} / ${meta.banner_url}`);
    }
  }
}

async function rehostCardImages(project: Project) {
  const projectCode = project.meta.code;

  const imageKeys = [
    { key: "image_url", suffix: "" },
    { key: "back_image_url", suffix: "_back" },
    { key: "thumbnail_url", suffix: "_thumb" },
    { key: "back_thumbnail_url", suffix: "_back_thumb" },
  ];

  await Promise.all(
    project.data.cards.map(async (card, index) => {
      const code = card.code;

      const images = imageKeys.reduce(
        (acc, { key, suffix }) => {
          const sourceUrl = card[key];
          if (!sourceUrl) return acc;

          const ext = path.extname(sourceUrl);

          if (!ext) {
            console.warn(`No file extension: ${code} / ${sourceUrl}`);
            return acc;
          }

          const s3Path = makeS3Path(projectCode, `${code}${suffix}${ext}`);
          acc.push({ sourceUrl, s3Path, key });

          return acc;
        },
        [] as (UploadParams & { key: string })[],
      );

      for (const image of images) {
        await rehostFile(image);
        const { s3Path, key } = image;
        project.data.cards[index][key] = makeCdnUrl(s3Path);
      }
    }),
  );
}

async function rehostEncounterSets(project: Project) {}
async function rehostPacks(project: Project) {}

async function rehostFile(params: UploadParams) {
  const { sourceUrl } = params;

  if (seenUrls.has(sourceUrl)) {
    console.info(`Skip (already uploaded): ${sourceUrl}`);
    return;
  }

  seenUrls.add(sourceUrl);

  const response = await fetch(sourceUrl);
  assert(response.ok, `${sourceUrl} returned bad status: ${response.status}`);
  assert(response.body, `${sourceUrl} returned empty body.`);
  await upload(params, response.body);
}

async function upload(
  params: UploadParams,
  body: PutObjectCommandInput["Body"],
) {
  const { s3Path, sourceUrl } = params;

  console.info(`Uploading: ${sourceUrl}`);

  const upload = new Upload({
    client: s3Client,
    params: {
      Body: body,
      Bucket: process.env.AWS_BUCKET,
      ContentType: inferContentType(sourceUrl),
      Key: s3Path,
    },
    leavePartsOnError: false,
  });

  await upload.done();
}

function inferContentType(url: string) {
  const ext = path.extname(url);
  if (ext === ".json") return "application/json";

  const type = ext.slice(1);
  return `image/${type}`;
}

function makeS3Path(code: string, filePath: string) {
  return `${CUSTOM_CONTENT_PREFIX}/${code}/${filePath}`;
}

function makeCdnUrl(filePath: string) {
  return `${process.env.CDN_BASE_URL}/${filePath}`;
}

type Project = {
  meta: {
    code: string;
    banner_url?: string;
    url?: string;
  };
  data: {
    cards: Array<{
      code: string;
      image_url?: string;
      back_image_url?: string;
      thumbnail_url?: string;
      back_thumbnail_url?: string;
    }>;
  };
};

type UploadParams = {
  sourceUrl: string;
  s3Path: string;
};
