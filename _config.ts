import lume from "lume/mod.ts";
import { Data, Page } from "lume/core/file.ts";
import { safeLoad } from "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js";

import date from "lume/plugins/date.ts";
import favicon from "lume/plugins/favicon.ts";
import feed from "lume/plugins/feed.ts";
import metas from "lume/plugins/metas.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import sass from "lume/plugins/sass.ts";
import sitemap from "lume/plugins/sitemap.ts";
import slugify_urls from "lume/plugins/slugify_urls.ts";

import anchor from "npm:markdown-it-anchor";
import footnote from "npm:markdown-it-footnote";
import callouts from "npm:markdown-it-obsidian-callouts";
import { load } from "https://deno.land/std@0.208.0/yaml/_loader/loader.ts";
import { customByTagNameSym } from "https://deno.land/x/deno_dom@v0.1.43/src/dom/selectors/custom-api.ts";

const markdown = {
    options: {
        breaks: false,
        linkify: true,
        xhtmlOut: true
    }, plugins: [
        callouts,
        [anchor, { level: 2 }],
        footnote,
    ]
};

const site = lume({
    src: "site",
    dest: "public",
    includes: "_includes",
    prettyUrls: false,
}, { markdown });

site.ignore("foundation/node_modules", "foundation/.git", "foundation/.github", "foundation/.pandoc", "foundation/templates");

// Copy the content of "static" directory to the root of your site
site.copy("static", "/");

site
    .use(date())
    .use(metas())
    .use(resolveUrls())
    .use(slugify_urls({
        replace: {
            "&": "and",
            "@": "",
        },
    }))
    .use(feed({
        output: ["/posts.rss", "/posts.json"],
        query: "post",
        limit: 10,
        info: {
            title: "=metas.site",
            description: "=description",
        },
        items: {
            title: "=title",
            published: "=date",
            updated: "=status.updated",
        },
    }))
    .use(sass({
        includes: "_includes/scss",
    }))
    .use(sitemap({
        query: "indexable=true",
        // }))
        // favicon.svg file must have 1/1 aspect ratio
        // https://lume.land/plugins/favicon/
        // .use(favicon({
        //     input: "/my-custom-favicon.png",
    }));

// Update URLs for foundation pages (third parameter)
// If it isn't markdown, or is a template, disable it (return false)
// If it is a README, remove readme.html from the URL (index.html instead)
// Otherwise, just return the URL
site.data("url", (page: Page) => {
    if (page.src.ext !== ".md" || page.src.path.indexOf("templates") >= 0) {
        return false;
    }
    if (page.data.basename == "README") {
        return page.data.url.toLocaleLowerCase().replace("readme.html", "")
    }
    return page.data.url;
}, "/foundation");

// deno-lint-ignore no-explicit-any
const FOUNDATION_DATA: Record<string, any> = safeLoad(Deno.readTextFileSync("./site/_includes/foundation.yml"));

site.preprocess([".html"], (pages) => {
    for (const page of pages) {
        // For foundation pages:
        if (page.src.path.startsWith("/foundation")) {

            // deno-lint-ignore no-explicit-any
            let structure: Record<string, any> | undefined = FOUNDATION_DATA;

            // Populate page metadata from the side file
            const keys = page.src.path.substring(1).replace("foundation/", "").split("/");
            for (const key of keys) {
                if (structure && structure[key] !== undefined) {
                    structure = structure[key];
                } else {
                    structure = undefined;
                    break
                }
            }
            if (structure) {
                page.data = { ...page.data, ...structure };
                page.data.tags = page.data.tags || [];
                if (keys.length > 1) {
                    page.data.tags.push(keys[0]);
                }
            }

            // If the title hasn't been set, set it to the first H1 in the content
            // Add the link to the github page based on the src path
            if (!page.data.title) {
                const content = page.data.content as string;
                const match = content.match(/#\s(.*)$/m); // 'm' flag for multiline
                if (match) {
                    page.data.title = match[1];
                } else {
                    page.data.title = page.data.basename;
                }
            }
            page.data.github = page.src.entry?.path.replace("/foundation/", "https://github.com/commonhaus/foundation-draft/blob/main/");
        }

        if (page.data.date && page.data.updated) {
           if (page.data.date.getFullYear() == page.data.updated.getFullYear()
                && page.data.date.getMonth() == page.data.updated.getMonth()
                && page.data.date.getDate() == page.data.updated.getDate()) {
                page.data.updated = undefined;
            } else {
                console.log("Same-day revision", page.src.path, page.data.date, page.data.updated);
            }
        }
    }
});

export default site;

