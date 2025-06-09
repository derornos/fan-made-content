import assert from "node:assert";
import * as fs from "node:fs";
import * as path from "node:path";
import { parseArgs } from "node:util";

type Project = {
  meta: {
    types: string[];
    date_updated: string;
  };
  data: {
    cards: never[];
    packs: never[];
    encounter_sets: never[];
  };
}

const args = parseArgs({
  options: {
    dir: { type: "string", required: true },
    out: { type: "string", required: true },
  },
});

const { dir, out } = args.values;

assert(dir, "Directory argument is required.");
assert(out, "Output file argument is required.");

mergeProjects(dir, out);

function mergeProjects(dir: string, out: string) {
  const dirPath = path.join(process.cwd(), "projects", dir);
  const outPath = path.join(process.cwd(), "projects", `${out}.json`);

  assert(
    fs.existsSync(dirPath),
    `Directory ${dirPath} does not exist.`,
  )

  assert(
    fs.existsSync(outPath),
    `Output file ${outPath} does not exist.`,
  );

  const outFile = JSON.parse(fs.readFileSync(outPath, "utf-8"));

  const files = fs
    .readdirSync(dirPath)
    .filter((file) => file.endsWith(".json"));

  assert(
    files.length > 0,
    `No JSON files found in directory ${dirPath}.`,
  );

  const mergedProject: Project = {
    meta: {
      ...outFile.meta,
      types: [],
      date_updated: new Date().toISOString(),
    },
    data: {
      cards: [],
      packs: [],
      encounter_sets: [],
    },
  };

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const project: Project = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    mergedProject.data.cards.push(...project.data.cards);
    mergedProject.data.packs.push(...project.data.packs);
    mergedProject.data.encounter_sets.push(...project.data.encounter_sets);

    mergedProject.meta.types = Array.from(
      new Set([...mergedProject.meta.types, ...project.meta.types]),
    );
  }

  mergedProject.meta.date_updated = new Date().toISOString();

  fs.writeFileSync(outPath, JSON.stringify(mergedProject, null, 2));
  console.log(`Merged project written to ${outPath}`);
}
