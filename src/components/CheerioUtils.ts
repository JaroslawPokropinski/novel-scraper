import { CheerioAPI, load, SelectorType } from "cheerio";
import { ChildNode } from "domhandler";

export default class CheerioUtils {
  static splitBySelector(
    $: CheerioAPI,
    mainSelector: SelectorType,
    splitSelector: string
  ) {
    let currentSection: ChildNode[] = [];
    const sections: ChildNode[][] = [];

    $(mainSelector)[0].childNodes.forEach((node) => {
      if ($(node).is(splitSelector)) {
        currentSection = [];
        sections.push(currentSection);
      }
      currentSection.push(node);
    });

    const cheerioSections = sections.map((section) => {
      const cheerioSection = load("<div></div>", { decodeEntities: false })(
        "div"
      ).eq(0);
      section.forEach((el) => cheerioSection.append(el));

      return cheerioSection;
    });

    return cheerioSections;
  }
}
