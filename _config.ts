import lume from "lume/mod.ts";
import { Page } from "lume/core/file.ts";

import date from "lume/plugins/date.ts";
import favicon from "lume/plugins/favicon.ts";
import metas from "lume/plugins/metas.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import sass from "lume/plugins/sass.ts";
import sitemap from "lume/plugins/sitemap.ts";
import slugify_urls from "lume/plugins/slugify_urls.ts";

import anchor from "npm:markdown-it-anchor";
import footnote from "npm:markdown-it-footnote";
import callouts from "npm:markdown-it-obsidian-callouts";

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

site.data("description",
`The Commonhaus Foundation is dedicated to nurturing and sustaining GitHub-style
open-source projects through community-driven collaboration and shared stewardship.
We unite developers, contributors, and users in a dynamic ecosystem, focusing on
the long-term growth and stability of essential open-source libraries and frameworks
without the overhead of traditional governance models.`.replace(/\n/g, ' '));

site.data("layout", "layouts/page.vto");
site.data("layout", "layouts/bylaws.vto", "/foundation");

site.data("url", (page: Page) => {
    if (page.src.ext !== ".md" || page.src.path.indexOf("templates") >= 0) {
        return false;
    }
    if (page.data.basename == "README") {
        return page.data.url.toLocaleLowerCase().replace("readme.html", "")
    }
    return page.data.url;
}, "/foundation");

site.preprocess([".html"], (pages) => {
    for (const page of pages) {
        // For foundation pages:
        // If the title hasn't been set, set it to the first H1 in the content
        // Add the link to the github page based on the src path
        if (page.src.path.startsWith("/foundation")) {
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
    }
});
export default site;

