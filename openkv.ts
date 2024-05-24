import { GP } from "./interfaces.ts";

// Deno.env.set(
//   "DENO_KV_ACCESS_TOKEN",
//   "ddp_cT3JXelgGT26RjP1S4K7ZYQ4C3xMbw3hRZWi",
// );
// const formule1 = "https://api.deno.com/databases/59849518-4816-42e8-84cf-4a0609d33c93/connect";
// export const kv = await Deno.openKv(formule1);
export const kv = await Deno.openKv();

export const getGPS = async (year: number) => {
  const entries = kv.list<GP>({ prefix: ["gps", year] });
  const gps: GP[] = [];
  for await (const gp of entries) {
    // console.log(gp.key, gp.value);
    gps.push(gp.value);
  }
  return gps;
};
