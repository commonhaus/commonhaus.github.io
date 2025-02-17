const { run } = Deno;

const serveAll = run({
  cmd: ["deno", "task", "lumeWatch"],
  env: {
    VITE_APP_DEV_MODE: "true",
    MOCK_BACKEND: "true",
    DEV_MODE: "true"
  },
});

await serveAll.status();