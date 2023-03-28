import { load } from "cheerio";
import axios from "axios";
import NovelParser from "./components/NovelParser";

async function main() {
  const startUrl =
    "https://bakapervert.wordpress.com/otome-game-no-heroine-de-saikyou-survival/";

  const novelParser = new NovelParser(startUrl, {
    name: "Otome Game no Heroine de Saikyou Survival",
    contentSelector: ".entry-content",
    volumeTitleSelector: 'h2:contains("Volume ")',
    chapterSelector: 'a[href*="vol-"]',
    chapterBodySelector: "#content .page",
    chapterTitleSelector: 'h2:contains("Chapter ")',
  });

  novelParser.parse();
}

main();
