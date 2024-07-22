import Site from "lume/core/site.ts";
import modifyUrls from "lume/plugins/modify_urls.ts";
import { safeLoad } from "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js";
import { Data, Page } from "lume/core/file.ts";

interface Project {
    name: string;
    home: string;
    repo: string;
    logo: string;
    wordmark: string;
    description: string;
    draft: boolean;
}

// -------------------
// Foundation Data: submodule pages
// - foundation.json is generated by ./.github/lastmod.ts
// - foundation.yml  is manually maintained: descriptions, resulting page url, etc.
const FOUNDATION_DATA: Record<string, unknown> = safeLoad(Deno.readTextFileSync("./site/_generated/foundation.json"));
const FOUNDATION_PAGES: Record<string, unknown> = safeLoad(Deno.readTextFileSync("./site/_generated/foundation.yml"));
const PROJECT_DATA: Record<string, Project> = safeLoad(Deno.readTextFileSync("./site/foundation/PROJECTS.yaml"));

const fixFoundationUrls = (url: string) => {
    if (url.startsWith('http') || url.startsWith('#')) {
        return url;
    }
    // Replace references to CONTACTS.yaml with the URL from the foundation repo
    if (url.includes('CONTACTS.yaml')) {
        return 'https://github.com/commonhaus/foundation/blob/main/CONTACTS.yaml';
    }
    // Replace references to project templates with the URL from the foundation repo
    if (url.includes('../../templates')) {
        return url.replace('../../templates', 'https://github.com/commonhaus/foundation/blob/main/templates');
    }
    // remaining links to CONTRIBUTING.md (from foundation materials) should point to the foundation repo
    if (url.includes('CONTRIBUTING.md')) {
        return 'https://github.com/commonhaus/foundation/blob/main/CONTRIBUTING.md';
    }
    // remaining links to CONTRIBUTING.md (from foundation materials) should point to the foundation repo
    if (url.includes('CODE_OF_CONDUCT.md')) {
        return 'https://github.com/commonhaus/foundation/blob/main/CODE_OF_CONDUCT.md';
    }
    return url;
};

const mergeFoundationPageData = (page: Page, allPages: Page<Data>[]) => {
    // Called below when preprocessing html
    // (after markdown processing has occurred, but before the page is rendered to html)
    // 1. merge the data from the foundation.json and foundation.yml files
    // 2. set the date to a Date object
    // 3. set the title to the first H1 in the content if it hasn't been set
    // 4. if the page matches a bylaws entry (_data/bylaws.yml), set that ordinal as a page attribute

    const srcPath = page.src.path.replace("/foundation/", "");
    const metaData = FOUNDATION_DATA[srcPath + ".md"] as Data;
    const pageData = FOUNDATION_PAGES[srcPath] as Data;

    if (!pageData || !metaData) {
        // Skip/Remove any pages that don't have a corresponding entry in the foundation.yml file
        console.log("IGNORE: No page data for", srcPath);
        allPages.splice(allPages.indexOf(page), 1);
        return;
    }

    page.data = {
        ...page.data,
        ...metaData,
        ...pageData,
    };
    page.data.date = new Date(page.data.date);
    page.data.cssclasses = (metaData.cssclasses || []).concat(pageData.cssclasses || []);

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

    // Is this a page in the bylaws? Copy that ordinal into the page metadata if so
    const entry = page.data.bylaws.nav.find((x: { href: string }) => x.href === page.data.url);
    if (entry) {
        page.data.ord = entry.ord;
    }
};

export default function () {

    return (site: Site) => {
        console.log("Foundation Submodule data");

        site.use(modifyUrls({
            fn: fixFoundationUrls
        }));

        site.ignore("foundation/node_modules", "foundation/templates");

        site.preprocess([".html"], (filteredPages, allPages) => {
            for (const page of filteredPages) {
                if (page.src.path.startsWith("/foundation")) {
                    mergeFoundationPageData(page, allPages);
                } else if (page.data.date && page.data.updated) {
                    // For OTHER pages (actions, vote results),
                    // set a boolean value if the updated date is different from the published date
                    page.data.hasUpdate = page.data.date.toDateString() !== page.data.updated.toDateString();
                }
            }
        });

        // Fixup attributes at build time if necessary
        site.preprocess(['.md'], (pages) => {
            for (const page of pages) {
                if (typeof page.data.content !== "string") {
                    continue;
                }
                if (/^\/activity\/\d/.test(page.src.path)) {
                    page.data.cssclasses = page.data.cssclasses || [];
                    page.data.cssclasses.push('activity', 'has-aside');
                }
                if (page.src.path.startsWith("/foundation")) {
                    const regex = /(send an email to|email|be directed to) the \[`?.+?`? mailing list\]\[CONTACTS.yaml\]/g;
                    const replacement = '[use our online form](https://forms.gle/t2d4DR6CxXSag26s5)';
                    const content = page.data.content as string;
                    page.data.content = content.replace(regex, replacement);
                }
                // add function to get list of projects
                page.data.listProjects = () => {
                    return Object.values(PROJECT_DATA)
                        .filter((project) => !project.draft);
                }
                page.data.archiveByYear = () => {
                    if (!page.data.indexQuery) {
                        return [];
                    }
                    // Group posts matching the given query by year
                    const allPosts = site.search.pages(page.data.indexQuery, "number=desc");
                    const postsByYear: Record<string, Data[]> = {};
                    if (allPosts.length > 0) {
                        allPosts.forEach((post) => {
                            const year = new Date(post.date).getFullYear();
                            if (!postsByYear[year]) {
                                postsByYear[year] = [];
                            }
                            postsByYear[year].push(post);
                        });
                    }
                    return {
                        years: Object.keys(postsByYear).sort((a, b) => Number(b) - Number(a)),
                        posts: postsByYear
                    };
                }
                page.data.indexBySection = () => {
                    const allPosts = site.search.pages("", "url");
                    const postsBySection: Record<string, Data[]> = {};
                    if (allPosts.length > 0) {
                        allPosts.forEach((post) => {
                            const section = post.url.substring(1, post.url.indexOf('/', 1));
                            if (!postsBySection[section]) {
                                postsBySection[section] = [];
                            }
                            postsBySection[section].push(post);
                        });
                    }

                    return {
                        list: Object.keys(postsBySection).sort(),
                        posts: postsBySection
                    };
                }
            }
        });
    };
}