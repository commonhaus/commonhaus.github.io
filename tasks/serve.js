const { run } = Deno;

const serve = run({
  cmd: ["deno", "task", "lumeWatch"],
  env: {
    VITE_APP_DEV_MODE: "true",
    DEV_MODE: "true"
  },
});

await serve.status();