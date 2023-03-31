import { CheerioAPI, load, SelectorType } from "cheerio";
import { ChildNode } from "domhandler";

export default class CheerioUtils {
  static splitBySelector(
    $: CheerioAPI,
    mainSelector: string,
    splitSelector: string
  ) {
    let currentSection: ChildNode[] = [];
    const sections: ChildNode[][] = [];

    const mainNode = $(mainSelector)[0];
    if (mainNode.type !== "tag")
      throw new Error("Main selector does not resolve to a tag");

    mainNode.childNodes.forEach((node) => {
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
