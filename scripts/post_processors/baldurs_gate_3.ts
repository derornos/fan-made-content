import type { Card } from "../lib/post_process_helpers";

export default function mapper(cards: Card[]) {
  return cards.map((card) => {
    if (card.text.includes("Permanent.")) {
      card.permanent = true;
    }

    return card;
  });
}
