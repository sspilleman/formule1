import * as tz from "npm/ical-timezones/index.ts";
import iCal, {
  ICalAlarm,
  ICalAlarmType,
  ICalDescription,
  ICalEvent,
  ICalEventData,
  ICalEventTransparency,
} from "ical-generator";
import { GP } from "./interfaces.ts";

const newline = `\n`;
const x = { "X-APPLE-TRAVEL-ADVISORY-BEHAVIOR": "AUTOMATIC" };

// function TzGenerator(tx: string) {
//   const lines = [
//     "BEGIN:VTIMEZONE",
//     "TZID:Europe/Amsterdam",
//     "TZURL:http://tzurl.org/zoneinfo-outlook/Europe/Amsterdam",
//     "X-LIC-LOCATION:Europe/Amsterdam",
//     "BEGIN:DAYLIGHT",
//     "TZOFFSETFROM:+0100",
//     "TZOFFSETTO:+0200",
//     "TZNAME:CEST",
//     "DTSTART:19700329T020000",
//     "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
//     "END:DAYLIGHT",
//     "BEGIN:STANDARD",
//     "TZOFFSETFROM:+0200",
//     "TZOFFSETTO:+0100",
//     "TZNAME:CET",
//     "DTSTART:19701025T030000",
//     "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
//     "END:STANDARD",
//     "END:VTIMEZONE",
//     "END:VCALENDAR",
//   ];
//   return lines.join("\n");
// }

function getIcal(gps: GP[]) {
  const timezone = "Europe/Amsterdam";
  const cal = iCal({
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
      const description: ICalDescription = { plain: lines.join(newline) };
      const current = new Date();
      const data: ICalEventData = {
        allDay: false,
        start: event.start,
        end: event.end,
        summary: `${gp.name}: ${event.name}`,
        description,
        created: current,
        lastModified: current,
        transparency: ICalEventTransparency.OPAQUE,
        x,
        // location: "https://viaplay.com/sport/motorsport/formula-1",
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
