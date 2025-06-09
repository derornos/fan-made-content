import type { Card } from "../lib/post_process_helpers";

export default function mapper(_cards: Card[]) {
  const cards: Card[] = [];

  // 1. Remove card instances for scanning backs and add their images to the front card as back_image.
  // 2. Remove <center>, <right>, and <left> from the card text.
  for (const [i, card] of _cards.entries()) {
    const isScanningBack =
      card.hidden && !card.text && !card.traits && !card.flavor;

    if (isScanningBack) {
      const front = _cards[i - 1];
      front.back_link = undefined;
      front.deck_limit = undefined;
      front.back_image_url = card.image_url;
      front.back_thumbnail_url = card.thumbnail_url;
    } else {
      if (card.text) {
        card.text = card.text.replaceAll(/<(center|left|right)>/g, "");
      }

      if (
        card.double_sided &&
        !card.back_text &&
        !card.back_traits &&
        !card.back_flavor
      ) {
        card.double_sided = undefined;
      }

      cards.push(card);
    }
  }

  return cards;
}
