import fs from "node:fs";
import path from "node:path";

const file = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "projects/ordinary_citizens.json"),
    "utf-8",
  ),
);

const cards: unknown[] = [];

function fixText(s: string) {
  return s
    .replaceAll("\n     \n", "\n")
    .replaceAll("<hdr>", "")
    .replaceAll("</hdr>", "")
    .replaceAll("“", '"');
}

for (const card of file.data.cards) {
  if (card.text) card.text = fixText(card.text);
  if (card.back_text) card.back_text = fixText(card.back_text);
  card.name = card.name.replaceAll("“", '"');
  cards.push(card);
}

file.data.cards = cards;
fs.writeFileSync(
  path.join(process.cwd(), "projects/ordinary_citizens.json"),
  JSON.stringify(file, null, 2),
);
