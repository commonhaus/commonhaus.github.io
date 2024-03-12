import lume from "lume/mod.ts";
import { Page } from "lume/core/file.ts";
import { safeLoad } from "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js";

import date from "lume/plugins/date.ts";
import favicon from "lume/plugins/favicon.ts";
import feed from "lume/plugins/feed.ts";
import inline from "lume/plugins/inline.ts";
import metas from "lume/plugins/metas.ts";
import modifyUrls from "lume/plugins/modify_urls.ts";
import nav from "lume/plugins/nav.ts";
import resolveUrls from "lume/plugins/resolve_urls.ts";
import sass from "lume/plugins/sass.ts";
import sitemap from "lume/plugins/sitemap.ts";
import slugify_urls from "lume/plugins/slugify_urls.ts";
import toc from "https://deno.land/x/lume_markdown_plugins@v0.7.0/toc.ts";

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
    prettyUrls: false,
    location: new URL("https://www.commonhaus.org")
}, { markdown });

site.ignore("foundation/node_modules", "foundation/templates");

// Copy the content of "static" directory to the root of your site
site.copy("static", "/");
site.mergeKey("cssclasses", "stringArray");

site
    .use(date())
    .use(metas())
    .use(resolveUrls())
    .use(modifyUrls({
        fn: (url) => {
            if (url.includes('CONTACTS.yaml')) {
                return 'https://github.com/commonhaus/foundation/blob/main/CONTACTS.yaml';
            }
            if (url.includes('../../templates')) {
                return url.replace('../../templates', 'https://github.com/commonhaus/foundation/blob/main/templates');
            }
            return url;
        },
    }))
    .use(toc())
    .use(slugify_urls({
        replace: {
            "&": "and",
            "@": "",
        },
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
            title: "=rss-title",
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
            title: "=rss-title",
            published: "=date",
            updated: "=updated",
        },
    }))
    .use(feed({
        output: ["/feed/review.rss", "/feed/review.json"],
        query: "post reviews",
        limit: 10,
        info: {
            title: "=metas.site",
            description: "=description",
        },
        items: {
            title: "=rss-title",
            published: "=date",
            updated: "=updated",
        },
    }))
    .use(inline(/* Options */))
    .use(nav())
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
    if (page.src.ext !== ".md"
            || page.src.path.indexOf("templates") >= 0
            || page.data.ignore === true) {
        return false;
    }
    page.data.url = page.data.url
            .replace("/foundation", "")
            .replace(/\/\d+-/, "/");
    if (page.data.basename == "README") {
        return page.data.url.replace("README.html", "")
    }
    return page.data.url;
}, "/foundation");

const FOUNDATION_DATA: Record<string, unknown> = safeLoad(Deno.readTextFileSync("./site/_includes/foundation.yml"));

// Ignore pages based on the foundation.yml file
site.addEventListener("beforeBuild", () => {
    const structure: Record<string, unknown> | undefined = FOUNDATION_DATA;
    if (structure) {
        ignorePages(structure, "foundation/");
    }
});

function ignorePages(structure: Record<string, unknown>, path: string) {
    Object.entries(structure).forEach(([key, value]) => {
        const obj = value as Record<string, unknown>;
        if (obj != null) {
            if (obj["ignore"]) {
                console.log(`Ignoring ${path}${key}.md`);
                site.ignore(`${path}${key}.md`);
            } else if (!obj["layout"]) {
                // this is not a page, it is a nested type
                ignorePages(value as Record<string, unknown>, `${path}${key}/`);
            }
        }
    });
}

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

            const entry = page.data.bylaws.nav.find((x: { href: string }) => x.href === page.data.url);
            if (entry) {
                page.data.ord = entry.ord;
            }

            page.data.github = page.src.entry?.path.replace("/foundation/", "https://github.com/commonhaus/foundation/blob/main/");
        }

        // For all pages, set a value if the updated date is different from the published date
        if (page.data.date && page.data.updated) {
            page.data.hasUpdate = page.data.date.toDateString() !== page.data.updated.toDateString();
        }
    }
});

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
    return result ? `<span class="act-status-icon">${result}</span>` : '';
});
site.filter("testLock", (page: Page) => {
    return `<span class="act-status-icon">
    <span aria-label="pinned">${page.data.svg.pin}</span>
    <span aria-label="closed">${page.data.svg.closed}</span>
    <span aria-label="locked">${page.data.svg.lock}</span>
    </span>`;
});
site.filter("authorAvatar", (page: Page) => {
    const login = page.data.author;
    const author = page.data.authors[login];
    if (author) {
        return `<a class="avatar" href="${author.url}" target="_top">
            <img src="${author.avatar}" />
            <span>${login}</span>
        </a>`;
    } else {
        return `<div class="avatar">${login}</div>\n`;
    }
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