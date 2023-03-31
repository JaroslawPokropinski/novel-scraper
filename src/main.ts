import NovelParser from "./components/NovelParser";
import yargs from "yargs/yargs";

async function main() {
  const argsParser = yargs(process.argv.slice(2)).options({
    novelTitle: { type: "string", demandOption: true },
    startUrl: { type: "string", demandOption: true },
    contentSelector: { type: "string", demandOption: true },
    volumeTitleSelector: { type: "string", demandOption: true },
    chapterSelector: { type: "string", demandOption: true },
    chapterBodySelector: { type: "string", demandOption: true },
    chapterTitleSelector: { type: "string" },
    adSelector: { type: "array", default: [] },
  });

  const argv = await argsParser.parseAsync();

  const novelParser = new NovelParser(argv.novelTitle, argv.startUrl, {
    ...argv,
    adSelectors: argv.adSelector.map((adSelector) => adSelector.toString()),
  });

  novelParser.parse();
}

main();
