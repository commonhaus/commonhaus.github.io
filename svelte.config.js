import { vitePreprocess } from "npm:@sveltejs/vite-plugin-svelte";
import preprocess from "npm:svelte-preprocess";

export default {
  preprocess: [
    vitePreprocess(),
    preprocess(),
  ],
};
