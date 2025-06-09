import type { Card } from "../lib/post_process_helpers";

const CARD_POOL_EXPANSIONS = {
  "70b5bb78-8b12-40e4-a567-85f6996e836f": "card",
  "c0cf9323-5f01-4d19-a967-e09a1b439414": "card",
  "798eba12-1ccb-4a52-87d8-b4fc262e5916": "card",
  "a2ab773f-3420-43e9-ab8e-342927687e46": "card",
  "fdd09839-a4cd-4144-82eb-e8232950c31f": "card",
  "0ddf93ab-39ef-4b3d-9e73-fcb300f5fa4b": "card",
  "cefcfe23-7514-42c2-a70e-6e9967796414": "card",
  "0cb1d7a3-56e1-44d3-9373-a5acc2045ada": "card",
};

export default function mapper(cards: Card[]) {
  return cards
    .map((card) => {
      const expansion = CARD_POOL_EXPANSIONS[card.expansion_code];

      if (expansion) {
        card.card_pool_extension = [{ type: expansion }];
      }

      return card;
    })
}
