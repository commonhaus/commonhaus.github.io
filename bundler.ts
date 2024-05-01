import * as esbuild from 'https://deno.land/x/esbuild@v0.20.2/mod.js';
import { type BuildOptions } from "https://deno.land/x/esbuild@v0.20.2/mod.js";
import sveltePlugin from 'npm:esbuild-svelte';
import { typescript } from 'npm:svelte-preprocess-esbuild';
import preprocess from 'npm:svelte-preprocess';

const devMode = Deno.args.includes('--dev');

const options: BuildOptions = {
    entryPoints: [
        'member/app.ts'
    ],
    bundle: true,
    outfile: 'public/assets/member.js',
    mainFields: ["svelte", "browser", "module", "main"],
    conditions: ["svelte", "browser"],
    minify: !devMode,
    plugins: [(sveltePlugin as unknown as Function)({
        preprocess: [
            typescript({
                target: 'es2020',
                define: {
                    'process.browser': 'true'
                }
            }),
            (preprocess as unknown as Function)({ typescript: false })
        ],
    })],
    logLevel: "info"
};

if (devMode) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
} else {
    await esbuild.build(options);
    await esbuild.stop();
}