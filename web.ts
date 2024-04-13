import { Application, Context, Router, Status } from "https://deno.land/x/oak@14.2.0/mod.ts";
import { getIcal } from "./ical.ts";

const router: Router = new Router();
router.get("/", async (ctx: Context) => {
  console.log(`IP: ${ctx.request.ip}`);
  const ical = await getIcal(2024);
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

const app = new Application();
app.addEventListener("listen", (e) => console.log(`Listen: ${e.port}`));
app.use(router.routes());
app.use(router.allowedMethods());
app.listen({ port: 10101 });

// deno bundle --config ./deno.tsconfig.json --import-map deps.json formule1/web.ts formule1/deploy.ts
