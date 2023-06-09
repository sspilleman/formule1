// import {
//   Application,
//   Context,
//   Router,
//   Status,
// } from "https://deno.land/x/oak@v12.5.0/mod.ts";

import {
  Application,
  Context,
  Router,
  Status,
} from "oak/mod.ts";

// const url = "https://s3.spilleman.nl/shared/gps.ical";
// let ical: string | undefined = undefined;

// async function getIcal() {
//   const now = new Date().getTime();
//   if (ical && (now - updated) < 1000 * 1800) {
//     return ical;
//   }
//   const response = await fetch(url);
//   if (response.ok) {
//     ical = await response.text();
//     updated = now;
//     return ical;
//   } else {
//     console.log(`Error: ${url}`);
//     if (ical) return ical;
//     return undefined;
//   }
// }

async function getIcal() {
  const file = await Deno.readTextFile("./gps.ical");
  if (file) {
    return file;
  }
  return undefined;
}

const router: Router = new Router();
router.get("/", async (ctx: Context) => {
  console.log(`IP: ${ctx.request.ip}`);
  const ical = await getIcal();
  if (ical) {
    ctx.response.headers.set("content-type", "text/calendar; charset=utf-8");
    ctx.response.status = Status.OK;
    ctx.response.body = ical;
  } else {
    ctx.response.headers.set("content-type", "text/plain; charset=utf-8");
    ctx.response.status = Status.NotFound;
    ctx.response.body = "ical not found";
  }
});

console.log(Deno.cwd());
const app = new Application();
app.addEventListener("listen", (e) => console.log(`Listen: ${e.port}`));
app.use(router.routes());
app.use(router.allowedMethods());
app.listen({ port: 10101 });


// http://localhost:10101

// deno bundle --config ./deno.tsconfig.json --import-map deps.json formule1/web.ts formule1/deploy.ts