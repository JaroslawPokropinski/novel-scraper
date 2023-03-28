import { Cheerio, CheerioAPI, Element, SelectorType } from "cheerio";
import ChapterParser from "./ChapterParser";
import fs from "fs";
import Utils from "./Utils";

type VolumeParserSelectors = {
  chapterSelector: SelectorType;
  chapterBodySelector: SelectorType;
  chapterTitleSelector: SelectorType | undefined;
  novelOutput: string;
};

export default class VolumeParser {
  constructor(
    private $: CheerioAPI,
    private section: Cheerio<Element>,
    private name: string,
    private volumeNumber: number,
    private coverUrl: string | undefined,

    private selectors: VolumeParserSelectors
  ) {}

  async parse() {
    if (this.coverUrl) {
      fs.mkdirSync(`${this.selectors.novelOutput}/${this.name}`, {
        recursive: true,
      });
      await Utils.downloadImage(
        this.coverUrl,
        `${this.selectors.novelOutput}/${this.name}/cover.jpg`
      );
    }

    const urls = this.$(this.section)
      .find(this.selectors.chapterSelector)
      .toArray()
      .map((element) => element.attribs["href"]);

    const htmls = await Promise.allSettled(
      urls.map((url, idx) =>
        new ChapterParser(this.volumeNumber, idx, url, {
          ...this.selectors,
          chapterCacheLocation: `${this.selectors.novelOutput}/.chapter-cache`,
          volumeOutput: `${this.selectors.novelOutput}/${this.name}`,
        }).parse()
      )
    );

    // Save the result
    fs.mkdirSync(this.selectors.novelOutput, { recursive: true });
    await fs.promises.writeFile(
      `${this.selectors.novelOutput}/${this.name}/content.html`,
      htmls
        .map((html) => (html.status === "fulfilled" ? html.value : null))
        .filter((value): value is string => value !== null)
        .join("\n"),
      "utf8"
    );
  }
}
