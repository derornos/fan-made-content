import path from "node:path";
import fs from "node:fs";

export type Card = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [key: string]: any;
};

export type Mapper = (cards: Card[]) => Card[];

export class Processor {
  constructor(
    private fileName: string,
    private mapper?: Mapper,
  ) {}

  run() {
    const filePath = path.join(
      process.cwd(),
      "projects",
      `${this.fileName}.json`,
    );

    const fileContent = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (this.mapper) {
      fileContent.data.cards = this.mapper(fileContent.data.cards);
    }

    fileContent.data.cards = fileContent.data.cards.map((card: Card) => {
      if (card.text) card.text = fixCommonTextIssues(card.text);
      if (card.back_text) card.back_text = fixCommonTextIssues(card.back_text);
      if (card.subname) card.subname = fixCommonTextIssues(card.subname);
      card.name = fixCommonTextIssues(card.name);
      if (card.flavor) card.flavor = fixCommonTextIssues(card.flavor);
      if (card.back_flavor) {
        card.back_flavor = fixCommonTextIssues(card.back_flavor);
      }
      return card;
    });

    fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2));
  }
}

function fixCommonTextIssues(str: string) {
  return str
    .replaceAll("\n     \n", "\n")
    .replaceAll("<hdr>", "<b>")
    .replaceAll("</hdr>", "</b>")
    .replaceAll("<right>", "")
    .replaceAll("</right>", "")
    .replaceAll("<left>", "")
    .replaceAll("</left>", "")
    .replaceAll("<center>", "")
    .replaceAll("</center>", "")
    .replaceAll("<hdr></hdr>", "")
    .replaceAll("<b></b>", "")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replaceAll("</blockquote><hr>", "</blockquote>\n");
}
