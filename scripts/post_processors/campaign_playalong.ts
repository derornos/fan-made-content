import type { Card } from "../lib/post_process_helpers";

const CARD_POOL_EXTENSIONS = {
  "70b5bb78-8b12-40e4-a567-85f6996e836f": "card",
  "c0cf9323-5f01-4d19-a967-e09a1b439414": "card",
  "798eba12-1ccb-4a52-87d8-b4fc262e5916": "card",
  "fdd09839-a4cd-4144-82eb-e8232950c31f": "card",
  "0ddf93ab-39ef-4b3d-9e73-fcb300f5fa4b": "card",
  "cefcfe23-7514-42c2-a70e-6e9967796414": "card",
  "0cb1d7a3-56e1-44d3-9373-a5acc2045ada": "card",
  "581e4bf9-2736-4086-8364-93399201a510": "card",
  "676974a0-aada-424f-b1bf-295c20782614": "card",
};

export default function mapper(cards: Card[]) {
  return cards.map((card) => {
    const type = CARD_POOL_EXTENSIONS[card.code];
    if (type) card.card_pool_extension = { type };

    if (card.text.includes("Ultimatum") || card.text.includes("Permanent.")) {
      card.permanent = true;
    }

    return card;
  });
}
