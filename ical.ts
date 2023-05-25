import * as tz from "npm/ical-timezones/index.ts";
import ical, {
  ICalAlarm,
  ICalAlarmType,
  ICalEvent,
  ICalEventTransparency,
} from "ical-generator";
// "ical-generator": "https://unpkg.com/ical-generator@4.1.0/dist/index.cjs",
import { GP } from "./interfaces.ts";

const newline = `\n`;
const x = { "X-APPLE-TRAVEL-ADVISORY-BEHAVIOR": "AUTOMATIC" };

function getIcal(gps: GP[]) {
  const timezone = "Europe/Amsterdam";
  const cal = ical({
    name: "Formula 1",
    description: "Race Events",
    // timezone,
    ttl: 3600 * 24,
    prodId: {
      company: "Sander Spilleman",
      product: "Formulta 1 Race Events",
      language: "NL",
    },
    // timezone: timezone,
    timezone: {
      name: timezone,
      generator: tz.getVtimezoneComponent,
    },
  });
  for (const gp of gps) {
    for (const event of gp.events) {
      let lines: string[] = [];
      if (gp.stats && gp.stats.length > 0) {
        lines = gp.stats.map((d) => `${d.name}: ${d.value}`);
      }
      lines.push(`${newline}https://viaplay.com/sport/motorsport/formula-1`);
      const description = { plain: lines.join(newline) };
      const current = new Date();
      const data = {
        allDay: false,
        start: event.start,
        end: event.end,
        summary: `${gp.name}: ${event.name}`,
        description,
        created: current,
        lastModified: current,
        transparency: ICalEventTransparency.OPAQUE,
        x,
        floating: false,
        timezone,
      };
      const e: ICalEvent = cal.createEvent(data);
      const display: ICalAlarm = e.createAlarm();
      display.trigger(3600);
      display.type(ICalAlarmType.display);
      const audio: ICalAlarm = e.createAlarm();
      audio.trigger(3600);
      audio.type(ICalAlarmType.audio);
    }
  }
  return cal.toString();
}

import gps from "./gps.json" assert { type: "json" };
const txt = getIcal(gps);
console.log(txt);
await Deno.writeTextFile("./formule1/gps.ical", txt);

// import * as tz from "npm/ical-timezones/index.ts";
// const vtimezone = tz.getVtimezone("Europe/Amsterdamn");
// console.log(vtimezone);
