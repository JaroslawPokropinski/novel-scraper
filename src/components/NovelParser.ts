import axios from "axios";
import { load, SelectorType } from "cheerio";
import CheerioUtils from "./CheerioUtils";
import VolumeParser from "./VolumeParser";

type NovelParserSelectors = {
  name: string;
  contentSelector: SelectorType;
  volumeTitleSelector: SelectorType;
  chapterSelector: SelectorType;
  chapterBodySelector: SelectorType;
  chapterTitleSelector: SelectorType | undefined;
};

export default class NovelParser {
  constructor(
    private startUrl: string,
    private options: NovelParserSelectors
  ) {}

  async parse() {
    const response = await axios.get(this.startUrl);
    const $ = load(response.data);

    const sections = CheerioUtils.splitBySelector(
      $,
      this.options.contentSelector,
      this.options.volumeTitleSelector
    );

    sections.forEach((section, volumeIdx) => {
      const volumeParser = new VolumeParser(
        $,
        section,
        $(section).find(this.options.volumeTitleSelector).text(),
        volumeIdx,
        $(section).find("img").first().attr()?.["src"],
        {
          ...this.options,
          novelOutput: `output/${this.options.name}`,
        }
      );

      volumeParser.parse();
    });
  }
}
