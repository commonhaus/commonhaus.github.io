import lume from "lume/mod.ts";
import { Page } from "lume/core/file.ts";

import date from "lume/plugins/date.ts";
import feed from "lume/plugins/feed.ts";
import inline from "lume/plugins/inline.ts";
import metas from "lume/plugins/metas.ts";
import minifyHTML from "lume/plugins/minify_html.ts";
import nav from "lume/plugins/nav.ts";
import pagefind from "lume/plugins/pagefind.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import sass from "lume/plugins/sass.ts";
import sitemap from "lume/plugins/sitemap.ts";
import slugify_urls from "lume/plugins/slugify_urls.ts";

import toc from "toc";

import anchor from "npm:markdown-it-anchor";
import footnote from "npm:markdown-it-footnote";
import callouts from "npm:markdown-it-obsidian-callouts";
import authorData from "./site/_plugins/authorData.ts";
import foundationData from "./site/_plugins/foundationData.ts";
import devBackend from "./site/_plugins/devBackend.ts";

const markdown = {
    options: {
        breaks: false,
        linkify: true,
        xhtmlOut: true
    }, plugins: [
        [callouts, {
            icons: {
                caution: '<svg width="24" height="24"><use xlink:href="/assets/icon-symbol.svg#icon-caution"/></svg>',
                important: '<svg width="24" height="24"><use xlink:href="/assets/icon-symbol.svg#icon-important"/></svg>',
                note: '<svg width="24" height="24"><use xlink:href="/assets/icon-symbol.svg#icon-note"/></svg>',
                tip: '<svg width="24" height="24"><use xlink:href="/assets/icon-symbol.svg#icon-tip"/></svg>',
                warning: '<svg width="24" height="24"><use xlink:href="/assets/icon-symbol.svg#icon-warning"/></svg>',
            }
        }],
        [anchor, { level: 1 }],
        footnote,
    ]
};

// -------------------
// Site Configuration

const site = lume({
    src: "site",
    dest: "public",
    prettyUrls: false,
    location: new URL("https://www.commonhaus.org"),
    server: devBackend()
}, { markdown });

// Copy the content of "static" directory to the root of your site
site.copy("static", "/");
site.mergeKey("cssclasses", "stringArray");

// Build or rebuild the Svelte Membership UI
site.addEventListener("afterBuild", "deno task vite-build");
site.addEventListener("afterUpdate", "deno task vite-build");

site
    .use(date())
    .use(inline(/* Options */))
    .use(metas())
    .use(toc())
    .use(nav())
    .use(resolveUrls())
    .use(foundationData()) // Foundation submodule pages + URL munging
    .use(authorData())     // Author data for activities
    .use(slugify_urls({
        extensions: [".html"],
        replace: {
            "&": "and",
            "@": "",
        },
    }))
    .use(sass({
        includes: "_includes/scss",
        format: "compressed",
        options: {
            sourceMap: false,
            sourceMapIncludeSources: true,
        }
    }))
    .use(pagefind({
        indexing: {
            verbose: true,
        },
        ui: {
            containerId: "search",
            showImages: false,
            showEmptyFilters: true,
            resetStyles: true,
        },
    }))
    .use(sitemap({
        query: "metas.robots!=false",
    }))
    .use(minifyHTML({
        options: {
            keep_closing_tags: true,
            keep_html_and_head_opening_tags: true,
            keep_spaces_between_attributes: true,
        }
    }))
    .use(feed({
        output: ["/feed/index.rss", "/feed/index.json"],
        query: "post",
        limit: 10,
        info: {
            title: "=metas.site",
            description: "=description",
        },
        items: {
            title: "=rss_title",
            published: "=date",
            updated: "=updated",
        },
    }))
    .use(feed({
        output: ["/feed/notice.rss", "/feed/notice.json"],
        query: "post notice",
        limit: 10,
        info: {
            title: "=metas.site",
            description: "=description",
        },
        items: {
            title: "=rss_title",
            published: "=date",
            updated: "=updated",
        },
    }));

site.filter("pageLock", (page: Page) => {
    let result = '';
    if (page.data.pinned) {
        result += `<span aria-label="pinned">${page.data.svg.pin}</span> `;
    }
    if (page.data.closedAt) {
        result += `<span aria-label="closed">${page.data.svg.closed}</span> `;
    }
    if (page.data.lockReason) {
        result += `<span aria-label="locked">${page.data.svg.lock}</span> `;
    }
    return result ? `<span class="act-status-icon">${result}</span>` : '';
});

site.filter("postLock", (data: Record<string, unknown>) => {
    let result = '';
    const svg = data.svg as any;
    if (data.pinned) {
        result += `<span aria-label="pinned">${svg.pin}</span> `;
    }
    if (data.closedAt) {
        result += `<span aria-label="closed">${svg.closed}</span> `;
    }
    if (data.lockReason) {
        result += `<span aria-label="locked">${svg.lock}</span> `;
    }
    return result ? `<span class="act-status-icon">${result}</span>` : `<span class="act-status-icon">${svg.blank}</span>`;
});

site.filter("testLock", (page: Page) => {
    return `<span class="act-status-icon">
    <span aria-label="pinned">${page.data.svg.pin}</span>
    <span aria-label="closed">${page.data.svg.closed}</span>
    <span aria-label="locked">${page.data.svg.lock}</span>
    </span>`;
});

site.filter("listVoters", (voters: unknown) => {
    if (voters && Array.isArray(voters)) {
        return voters
            .map((voter: { login: string; url: string; }) =>
                `<a href="${voter.url}" target="_top">${voter.login}</a>`)
            .join(", ");
    } else {
        console.log(voters, "is not an array");
    }
});

export default site;