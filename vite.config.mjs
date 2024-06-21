import { safeLoad } from "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js";
import * as path from "https://deno.land/std@0.107.0/path/mod.ts";
import { defineConfig } from 'npm:vite';
import denoResolve from 'https://deno.land/x/vite_plugin_deno_resolve@0.5.0/mod.ts';
import { svelte, vitePreprocess } from 'npm:@sveltejs/vite-plugin-svelte';
import markdownIt from "npm:markdown-it";
import preprocess from "npm:svelte-preprocess";
import { replaceCodePlugin } from "npm:vite-plugin-replace";

import "npm:svelte";

const devMode = Deno.env.get("VITE_APP_DEV_MODE") === "true";
const mockBackend = Deno.env.get("MOCK_BACKEND") === "true";
console.log("devMode:", devMode, "mockBackend:", mockBackend);

const devUrl = mockBackend
    ? "http://localhost:3000/member"  // Lume middleware
    : "http://localhost:8082/member"; // Local Quarkus backend

const baseUrl = devMode
    ? devUrl
    : "https://haus-keeper.commonhaus.org/member";

const devModeHook = mockBackend
    ? Deno.readTextFileSync("member/dev-mode.js")
    : "";
console.log("baseUrl:", baseUrl, ", devModeHook:", devModeHook === "");

function yamlPlugin() {
  const virtualModuleId = 'virtual:attest-yaml';
  const resolvedVirtualModuleId = '\0' + virtualModuleId
  const yamlFilePath = path.resolve('site/foundation/agreements/membership/members.yaml');
  return {
    name: 'yaml-plugin',
    resolveId(source) {
      if (source === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    async load(id) {
      if (id === resolvedVirtualModuleId) {
        const yamlText = await Deno.readTextFile(yamlFilePath);
        const yamlData = safeLoad(yamlText) || {};
        const md = markdownIt();

        // Iterate over the values in yamlData.status and convert
        // markdown to HTML
        for (const value of Object.values(yamlData.role)) {
          if (value.preamble) {
            value.preamble = md.render(value.preamble);
          }
        }

        // Iterate over the values in yamlData.attestations and convert
        // markdown to HTML
        for (const value of Object.values(yamlData.attestations)) {
          if (value.body) {
            value.body = md.render(value.body);
          }
        }

        return `export default ${JSON.stringify(yamlData)};`;
      }
    },
  };
}

export default defineConfig({
  publicDir: false,
  build: {
    outDir: 'public',
    emptyOutDir: false,
    ssr: false,
    minify: !devMode,
    sourcemap: devMode,
    rollupOptions: {
      input: 'member/member.ts',
      output: {
        entryFileNames: 'assets/member.js'
      },
    }
  },
  isWorker: false,
  plugins: [
    yamlPlugin(),
    denoResolve(),
    svelte({
      /* plugin options */
      preprocess: [
        vitePreprocess(),
        preprocess()
      ]
    }),
    replaceCodePlugin({
      replacements: [
        {
          from: "__BASE_URL__",
          to: baseUrl,
        },
        {
          from: "window.devMode = {};",
          to: devModeHook,
        },
      ],
    }),
  ]
});