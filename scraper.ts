import cheerio from "cheerio";
import { GP } from "./interfaces.ts";
import { parse } from "date-fns/index.js";
import enUS from "date-fns/locale/en-US/index.js";
import nl from "date-fns/locale/nl/index.js";

Deno.env.set(
  "DENO_KV_ACCESS_TOKEN",
  "ddp_cT3JXelgGT26RjP1S4K7ZYQ4C3xMbw3hRZWi",
);

const formule1 =
  "https://api.deno.com/databases/59849518-4816-42e8-84cf-4a0609d33c93/connect";
const kv = await Deno.openKv(formule1);

const year = 2024;
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
  const response = await fetch(url);
  if (response.ok) {
    const txt = await response.text();
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
  } else return [];
}

async function getGP(gp: GP) {
  const response = await fetch(gp.url);
  if (response.ok) {
    const txt = await response.text();
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
            .replace("jan", "jan.")
            .replace("feb", "feb.")
            .replace("mrt", "mrt.")
            .replace("apr", "apr.")
            .replace("mei", "mei")
            .replace("jun", "jun.")
            .replace("jul", "jul.")
            .replace("aug", "aug.")
            .replace("sep", "sep.")
            .replace("okt", "okt.")
            .replace("nov", "nov.")
            .replace("dec", "dec."),
          "dd MMM yyyy",
          new Date(),
          { locale: nl },
        );
        if (isNaN(new Date(d).getTime())) console.log(date, d);
        const r = /^(\d{1,2}:\d{1,2}) - (\d{1,2}:\d{1,2})$/i;
        if (d && r.exec(time)) {
          const [_, startStr, endStr] = r.exec(time) as RegExpExecArray;
          const days = startStr > endStr ? 1 : 0;
          const start = parse(startStr, "HH:mm", d, { locale: nl }).getTime();
          const end = addDays(
            parse(endStr, "HH:mm", d, { locale: nl }),
            days,
          ).getTime();
          const event = { name, start, end };
          console.log({ name, start, end });
          gp.events.push(event);
        } else console.log(time);
      });
    }
  }
}

function addDays(src: Date, count: number) {
  const milliseconds = (24 * 60 * 60 * 1000) * count;
  return new Date(src.getTime() + milliseconds);
}

async function create() {
  const gps = (await getGPS(calender)).filter((g) => g.name === "GP Monaco");
  // const gps = await getGPS(calender);
  for (const gp of gps) {
    console.log(gp.name);
    await getGP(gp);
    if (gp.events.length > 0) {
      await kv.set(["gps", year, gp.name], gp);
    }
  }
  // console.log(gps);
  // await Deno.writeTextFile(
  //   "./formule1/gps.json",
  //   JSON.stringify(gps, undefined, "  "),
  // );
}

await create();
