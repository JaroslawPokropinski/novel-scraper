import axios from "axios";
import { load, SelectorType } from "cheerio";
import CheerioUtils from "./CheerioUtils";
import VolumeParser from "./VolumeParser";

export type NovelParserSelectors = {
  contentSelector: SelectorType;
  volumeTitleSelector: SelectorType;
  chapterSelector: SelectorType;
  chapterBodySelector: SelectorType;
  chapterTitleSelector?: SelectorType;
  adSelectors?: SelectorType[];
};

export default class NovelParser {
  constructor(
    private title: string,
    private startUrl: string,
    private selectors: NovelParserSelectors
  ) {}

  async parse() {
    const response = await axios.get(this.startUrl);
    const $ = load(response.data);

    const sections = CheerioUtils.splitBySelector(
      $,
      this.selectors.contentSelector,
      this.selectors.volumeTitleSelector
    );

    sections.forEach((section, volumeIdx) => {
      const volumeParser = new VolumeParser(
        $,
        section,
        $(section).find(this.selectors.volumeTitleSelector).text(),
        volumeIdx,
        $(section).find("img").first().attr()?.["src"],
        `output/${this.title}`,
        this.selectors
      );

      volumeParser.parse();
    });
  }
}
