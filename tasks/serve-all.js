// Launches `lume -s` and `vite-watch` directly as sibling processes, each
// given the same explicit dev-mode env. Going through `deno task lumeWatch`
// (a `taskA & taskB` shell string) does not reliably propagate custom env
// from Deno.Command down to the grandchild `deno` processes it spawns, so
// _config.ts / devBackend.ts / vite.config.mjs would see DEV_MODE,
// VITE_APP_DEV_MODE, and MOCK_BACKEND as unset despite being passed here.
const env = {
  ...Deno.env.toObject(),
  VITE_APP_DEV_MODE: "true",
  MOCK_BACKEND: "true",
  DEV_MODE: "true",
  VITE_WATCH_ACTIVE: "true",
};

const lume = new Deno.Command("deno", {
  args: ["task", "lume", "-s"],
  env,
}).spawn();

const viteWatch = new Deno.Command("deno", {
  args: ["task", "vite-watch"],
  env,
}).spawn();

await Promise.all([lume.status, viteWatch.status]);
