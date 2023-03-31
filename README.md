# Novel Scraper
This repository is meant for parsing novels from web to put them on a kindle

## Requirements
- nodejs
- [calibre](https://calibre-ebook.com/) (if you want to put resulting files on your reader)

## Usage
Install package
```bash
npm install
```
Run scraping
```bash
npm start -- \
--novelTitle="The title" \
--startUrl="https://example.com/novel-path/" \
--contentSelector=".entry-content" \
--volumeTitleSelector='h2:contains("Volume ")' \
--chapterSelector='a[href*="vol-"]' \
--chapterBodySelector="#content .page" \
--chapterTitleSelector='h2:contains("Chapter ")' \
--adSelector='p:contains("Table of Content")' \ 
--adSelector='p:contains("Some other useless stuff")'
```

To import book to the ebook reader use Calibre.
Select add books and .html files from the output folder, set cover.jpg as a cover and convert to ebook using "Structure Detection" > "Detect Chapters" > "//*[@class = 'chapter']"
