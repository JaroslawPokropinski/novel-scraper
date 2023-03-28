import NovelParser from "./components/NovelParser";

async function main() {
  const novelTitle = "Otome Game no Heroine de Saikyou Survival";
  const startUrl =
    "https://bakapervert.wordpress.com/otome-game-no-heroine-de-saikyou-survival/";

  const novelParser = new NovelParser(novelTitle, startUrl, {
    contentSelector: ".entry-content",
    volumeTitleSelector: 'h2:contains("Volume ")',
    chapterSelector: 'a[href*="vol-"]',
    chapterBodySelector: "#content .page",
    chapterTitleSelector: 'h2:contains("Chapter ")',
    adSelectors: ['p:contains("Table of Content")'],
  });

  novelParser.parse();
}

main();
