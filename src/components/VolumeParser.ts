import { Cheerio, CheerioAPI, Element, SelectorType } from "cheerio";
import ChapterParser from "./ChapterParser";
import fs from "fs";
import Utils from "./Utils";
import { NovelParserSelectors } from "./NovelParser";

export default class VolumeParser {
  private volumeOutput: string;

  constructor(
    private $: CheerioAPI,
    private section: Cheerio<Element>,
    private title: string,
    private volumeNumber: number,
    private coverUrl: string | undefined,
    private novelOutput: string,
    private selectors: NovelParserSelectors
  ) {
    this.volumeOutput = `${this.novelOutput}/${this.title}`;
  }

  async parse() {
    if (this.coverUrl) {
      fs.mkdirSync(`${this.volumeOutput}`, {
        recursive: true,
      });
      await Utils.downloadImage(
        this.coverUrl,
        `${this.volumeOutput}/cover.jpg`
      );
    }

    const urls = this.$(this.section)
      .find(this.selectors.chapterSelector)
      .toArray()
      .map((element) => element.attribs["href"]);

    const htmls = await Promise.allSettled(
      urls.map((url, idx) =>
        new ChapterParser(
          this.volumeNumber,
          idx,
          url,
          this.volumeOutput,
          `${this.novelOutput}/.chapter-cache`,
          this.selectors
        ).parse()
      )
    );

    // Save the result
    fs.mkdirSync(this.novelOutput, { recursive: true });
    await fs.promises.writeFile(
      `${this.volumeOutput}/content.html`,
      htmls
        .map((html) => (html.status === "fulfilled" ? html.value : null))
        .filter((value): value is string => value !== null)
        .join("\n"),
      "utf8"
    );
  }
}
