import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import type { Card } from "./lib/post_process_helpers";

interface Bag {
  ContainedObjects?: Bag[];
  GMNotes?: string;
  Name?: string;
  Nickname?: string;
  Description?: string;
}

const args = parseArgs({
  options: {
    tts: { type: "string", required: true },
    name: { type: "string", required: true },
  },
});

assert(args.values.tts, "TTS file path is required. Use --tts <path>");
assert(args.values.name, "Project name is required. Use --name <project-name>");

const project = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), `projects/${args.values.name}.json`),
    "utf-8",
  ),
);

const ttsFile = JSON.parse(fs.readFileSync(args.values.tts, "utf-8"));

walkBag(ttsFile, (obj) => {
  const notes = JSON.parse(obj.GMNotes || "{}");
  const id = notes.TtsZoopGuid ?? notes.id;
  if (!id) return;

  if (obj.Name === "Card" && id.length !== 36) {
    const name = obj.Nickname;
    const subname = obj.Description;

    const matches = project.data.cards.filter(
      (c: Card) =>
        c.name.trim() === name?.trim() &&
        (c.subname?.trim() ?? "") === (subname?.trim() ?? ""),
    );

    if (matches.length === 1) {
      const match = matches[0];
      obj.GMNotes = JSON.stringify({
        ...notes,
        TtsZoopGuid: match.code,
        id: undefined,
      });
    } else {
      console.log(
        `Card not matched conclusively: ${id} ${name}${subname ? ` (${subname})` : ""}`,
      );
    }
  }
});

const outFilePath = path.join(
  process.cwd(),
  `${args.values.name}-tts-updated.json`,
);

fs.writeFileSync(outFilePath, JSON.stringify(ttsFile, null, 2));

function walkBag(bag: Bag, cb: (bag: Bag) => void): void {
  if (bag.ContainedObjects) {
    for (const contained of bag.ContainedObjects) {
      walkBag(contained, cb);
    }
  } else {
    cb(bag);
  }
}
