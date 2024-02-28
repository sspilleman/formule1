import cheerio, {} from "cheerio";
import { getText } from "../lib/http/mod.ts";

import { parse } from "date-fns/index.js";
import enUS from "date-fns/locale/en-US/index.js";

import { GP } from "./interfaces.ts";

const year = "2024";
const calender = `https://www.formule1.nl/wk-kalender/${year}/`;

const selectors = {
  gps: {
    rows: "div.stack ul.table-list.mt-min10 li.table-list__row",
    link: "div.table-list__row__td a.table-list__row__td__grandprix",
  },
  gp: {
    image: "div.stats img.stats__image",
    stats: "div.stats div.stats__content ul.stats__items li.stats__item",
    key: 'p[class="stats__item__left"]',
    value: 'p[class="stats__item__right"]',
    events:
      "div.post-heading.post-heading--big a.post-heading__link div.post-heading__content div.post-heading__table div.post-heading__table__row",
    name: "p.post-heading__table__cell:nth-child(1)",
    date: "p.post-heading__table__cell:nth-child(2)",
    time: "p.post-heading__table__cell:nth-child(3)",
  },
};

async function getGPS(url: string) {
  const txt = await getText(url);
  const $ = cheerio.load(txt);
  const $rows = $(selectors.gps.rows);
  const gps: GP[] = [];
  $rows.each(function (_i, e) {
    const $row = $(e);
    const name = $row.find(selectors.gps.link).text().trim();
    const url = <string> $row.find(selectors.gps.link).attr("href")?.trim();
    gps.push({ name, url, stats: [], events: [] });
  });
  return gps;
}

async function getGP(gp: GP) {
  const txt = await getText(gp.url);
  const $ = cheerio.load(txt);
  const image = $(selectors.gp.image);
  if (image) {
    gp.image = $(selectors.gp.image).first().attr("src") as string;
  }
  const $stats = $(selectors.gp.stats);
  if ($stats && $stats.length > 0) {
    $stats.each(function (_i, e) {
      const $stat = $(e);
      const name = $stat.find(selectors.gp.key).text().trim();
      const value = $stat.find(selectors.gp.value).text().trim();
      gp.stats.push({ name, value });
    });
  }
  const $events = $(selectors.gp.events);
  if ($events && $events.length > 0) {
    $events.each(function (_i, e) {
      const $event = $(e);
      const name = $event.find(selectors.gp.name).text().trim();
      const date = $event.find(selectors.gp.date).text().trim();
      const time = $event.find(selectors.gp.time).text().trim();
      const d: Date | undefined = parse(
        date
          .replace("mrt", "mar")
          .replace("mei", "may")
          .replace("okt", "oct"),
        "dd MMM yyyy",
        new Date(),
        { locale: enUS },
      );
      // console.log({ name, date, time, d });
      // const r = /^(\d{1,2}:\d{1,2})\n {0,1}- (\d{1,2}:\d{1,2})$/i;
      const r = /^(\d{1,2}:\d{1,2}) - (\d{1,2}:\d{1,2})$/i;
      if (d && r.exec(time)) {
        const [_, startStr, endStr] = r.exec(time) as RegExpExecArray;
        const days = startStr > endStr ? 1 : 0;
        const start = parse(startStr, "HH:mm", d, { locale: enUS });
        const end = addDays(parse(endStr, "HH:mm", d, { locale: enUS }), days);
        const event = { name, start, end };
        // console.log({ event });
        gp.events.push(event);
      } else console.log(time);
    });
  }
}

function addDays(src: Date, count: number) {
  const milliseconds = (24 * 60 * 60 * 1000) * count;
  return new Date(src.getTime() + milliseconds);
}

async function create() {
  const gps = await getGPS(calender);
  for (const gp of gps) {
    // if (gp.name === `GP Miami`) {
    //   console.log(gp.name);
    //   await getGP(gp);
    // }
    console.log(gp.name);
    await getGP(gp);
  }
  // console.log(gps);
  await Deno.writeTextFile(
    "./formule1/gps.json",
    JSON.stringify(gps, undefined, "  "),
  );
}

await create();
