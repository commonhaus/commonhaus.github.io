import { safeLoad } from "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js";
import * as path from "https://deno.land/std@0.107.0/path/mod.ts";
import { defineConfig } from 'npm:vite';
import denoResolve from 'https://deno.land/x/vite_plugin_deno_resolve@0.5.0/mod.ts';
import { svelte, vitePreprocess } from 'npm:@sveltejs/vite-plugin-svelte';
import markdownIt from "npm:markdown-it";
import preprocess from "npm:svelte-preprocess";


import "npm:svelte";
import yaml from "lume/plugins/yaml.ts";

function yamlPlugin() {
    const yamlFilePath = path.resolve('site/foundation/agreements/membership/members.yaml');
    return {
      name: 'yaml-plugin',
      resolveId(source) {
        if (source === 'attest-yaml') {
          return yamlFilePath;
        }
      },
      async load(id) {
        if (id === yamlFilePath) {
          const yamlText = await Deno.readTextFile(id);
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
        minify: false,
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
        })
    ]
});