// import * as tz from "npm/ical-timezones-obsolete/index.ts";
import tz from "npm:@touch4it/ical-timezones@1.9.0";
import ical, {
  ICalAlarm,
  ICalAlarmType,
  ICalEvent,
  ICalEventTransparency,
} from "npm:ical-generator@5.0.0";
import { GP } from "./interfaces.ts";
import { getGPS } from "./openkv.ts";

const newline = `\n`;
const x = { "X-APPLE-TRAVEL-ADVISORY-BEHAVIOR": "AUTOMATIC" };

function getText(gps: GP[]) {
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

export const getIcal = async (year: number) => {
  const gps = await getGPS(year);
  const txt = getText(gps);
  return txt;
};

// console.log(await getIcal(2024));
