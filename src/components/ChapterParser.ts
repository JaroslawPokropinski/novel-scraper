import axios from "axios";
import { CheerioAPI, load, SelectorType } from "cheerio";
import fs from "fs";
import Utils from "./Utils";

type ChapterParserOptions = {
  chapterBodySelector: SelectorType;
  chapterTitleSelector: SelectorType | undefined;
  chapterCacheLocation: string;
  volumeOutput: string;
};

export default class ChapterParser {
  constructor(
    private volumeNumber: number,
    private chapterNumber: number,
    private url: string,
    private options: ChapterParserOptions
  ) {}

  async loadFromCache() {
    try {
      return await fs.promises.readFile(
        `${this.options.chapterCacheLocation}/volume_${this.volumeNumber}_chapter_${this.chapterNumber}.html`,
        "utf8"
      );
    } catch {
      return null;
    }
  }

  async saveToCache(html: string) {
    fs.mkdirSync(this.options.chapterCacheLocation, { recursive: true });
    await fs.promises.writeFile(
      `${this.options.chapterCacheLocation}/volume_${this.volumeNumber}_chapter_${this.chapterNumber}.html`,
      html,
      "utf8"
    );
  }

  parseTitle($: CheerioAPI) {
    if (!this.options.chapterTitleSelector) return "";

    return `<h1>${$(this.options.chapterTitleSelector).first().text()}</h1>`;
  }

  async fetchImage(url: string, path: string) {
    // fetch and save the image
    const response = await axios.get(url);
    await fs.promises.writeFile(path, response.data, "binary");
  }

  async parseContent($: CheerioAPI) {
    // clean ads
    $("#jp-post-flair").remove();

    // promise array to fetch images
    const imageFetchPromises = new Array<Promise<unknown>>();
    // make sure the image folder is created
    fs.mkdirSync(`${this.options.volumeOutput}/images`, {
      recursive: true,
    });

    $(this.options.chapterBodySelector)
      .find("img")
      .each((_, image) => {
        const attrs = $(image).attr();
        if (attrs && attrs.src) {
          // create image name form url
          const name = attrs.src
            .match(/.*\/(.*png|.*jpg)/)?.[1]
            .replace(":", "")
            .replace("?", "")
            .replace('"', "")
            .replace("|", "")
            .replace("*", "")
            .replace(" ", "_");

          // handle only images matching the pattern
          if (name) {
            const savePath = `images/${name}`;
            imageFetchPromises.push(
              Utils.downloadImage(
                attrs.src,
                `${this.options.volumeOutput}/${savePath}`
              )
            );

            attrs.src = savePath;
          }

          // remove unneded attributes (they may be used as source otherwise)
          const attrsToRemove = [
            "data-large-file",
            "data-medium-file",
            "data-orig-file",
            "data-permalink",
            "srcset",
            "alt",
          ];
          attrsToRemove.forEach((attr) => delete attrs[attr]);
        }
      });
    await Promise.allSettled(imageFetchPromises);

    return $(this.options.chapterBodySelector);
  }

  async parse() {
    const cached = await this.loadFromCache();
    if (cached) return cached;

    const page = await axios.get(this.url);
    const $ = load(page.data);

    const title = this.parseTitle($);
    const chapterContent = (await this.parseContent($)).html();

    const html = `<div class=chapter>\n${title}\n${chapterContent}\n</div>`;
    await this.saveToCache(html);

    return html;
  }
}
