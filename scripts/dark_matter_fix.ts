import fs from "node:fs";
import path from "node:path";

const file = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "projects/dark_matter.json"),
    "utf-8",
  ),
);

const cards: unknown[] = [];

// 1. Remove card instances for scanning backs and add their images to the front card as back_image.
// 2. Remove <center>, <right>, and <left> from the card text.
for (const [i, card] of file.data.cards.entries()) {
  const isScanningBack =
    card.hidden && !card.text && !card.traits && !card.flavor;

  if (isScanningBack) {
    const front = file.data.cards[i - 1];
    front.back_link = undefined;
    front.back_image_url = card.image_url;
    front.back_thumbnail_url = card.thumbnail_url;
  } else {
    if (card.text) {
      card.text = card.text.replaceAll(/<(center|left|right)>/g, "");
    }
    cards.push(card);
  }
}

file.data.cards = cards;
fs.writeFileSync(
  path.join(process.cwd(), "projects/dark_matter.json"),
  JSON.stringify(file, null, 2),
);
