import Site from "lume/core/site.ts";
import modifyUrls from "lume/plugins/modify_urls.ts";
import { parse } from "@std/yaml";
import { Data, Page } from "lume/core/file.ts";

interface Project {
    name: string;
    repo: string;
    display?: ProjectDisplay;
    draft?: boolean;
}
interface ProjectDisplay {
    home?: string;
    logo?: string;
    "logo-dark"?: string;
    description?: string;
}
interface SponsorData {
    sponsors: Record<string, Sponsor>;
}
interface Sponsor {
    display?: ProjectDisplay;
}

const EMAIL_REGEX = /(send an email to|email) the \[`?.+?`? mailing list\]\[CONTACTS.yaml\]/g;
const FORM_REPLACEMENT = '[use our online form](https://forms.gle/t2d4DR6CxXSag26s5)';

// -------------------
// Foundation Data: submodule pages
// - foundation.json is generated by ./.github/lastmod.ts
// - foundation.yml  is manually maintained: descriptions, resulting page url, etc.
const FOUNDATION_DATA: Record<string, unknown> = parse(Deno.readTextFileSync("./site/_generated/foundation.json")) as  Record<string, unknown>;
const FOUNDATION_PAGES: Record<string, unknown> = parse(Deno.readTextFileSync("./site/_generated/foundation.yml")) as  Record<string, unknown>;
const PROJECT_DATA: Record<string, Project> = parse(Deno.readTextFileSync("./site/foundation/PROJECTS.yaml")) as Record<string, Project>;
const SPONSOR_DATA: SponsorData = parse(Deno.readTextFileSync("./site/foundation/SPONSORS.yaml")) as SponsorData;

const IMPORTED_LOGO_URLS: Record<string, string> = {};

const rawUrl = (url: string) => {
    if (url.includes("/github.com/") && !url.endsWith("?raw=true")) {
        url += "?raw=true";
    }
    return url;
}

const unrawUrl = (url: string) => {
    return url.replace("?raw=true", "");
}

const fixFoundationUrls = (url: string) => {
    const cachedLocalImg = IMPORTED_LOGO_URLS[unrawUrl(url)];
    if (cachedLocalImg) {
        // Fix sponsor and project logo URLs to reference local images
        return cachedLocalImg;
    }
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
    // (after markdown processing has occurred, but before the page is rendered to html)
    // 1. merge the data from the foundation.json and foundation.yml files
    // 2. set the date to a Date object
    // 3. set the title to the first H1 in the content if it hasn't been set
    // 4. if the page matches a bylaws entry (_data/bylaws.yml), set that ordinal as a page attribute

    const srcPath = page.src.path.replace("/foundation/", "");
    const metaData = FOUNDATION_DATA[srcPath + ".md"] as Data;
    const pageData = FOUNDATION_PAGES[srcPath] as Data;

    if (!pageData || !metaData) {
        // Skip/Remove any pages that don't have a corresponding entry
        console.log("IGNORE: No page data for", srcPath);
        allPages.splice(allPages.indexOf(page), 1);
        return;
    }

    page.data = {
        ...page.data,
        ...metaData,
        ...pageData,
        stylesheets: [ "/assets/bylaws-policies.css"]
    };
    // Date read from git log is a string, convert to Date object
    page.data.date = new Date(page.data.date);
    // Merge css classes from both sources
    page.data.cssclasses = (metaData.cssclasses || []).concat(pageData.cssclasses || []);

    // If the title hasn't been set, set it to the first H1 in the content
    // Add the link to the github page based on the src path
    if (!page.data.title) {
        const content = page.data.content as string;
        const match = content.match(/#\s(.*)$/m); // 'm' flag for multiline
        if (match) {
            page.data.title = match[1].replace('Commonhaus Foundation', '');
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

const urlBaseName = (url: string) => {
    return new URL(url).pathname.split('/').pop();
}

const importLogo = (name: string, url: string | undefined, segment: string, site: Site) => {
    if (url && url.startsWith("http")) {
        if (url.startsWith("https://www.commonhaus.org")) {
            IMPORTED_LOGO_URLS[url] = url.replace("https://www.commonhaus.org", "");
            return;
        }
        url = rawUrl(url);
        const baseName = urlBaseName(url);
        if (!baseName) {
            return;
        }
        const file = baseName.startsWith(name)
                ? baseName
                : `${name}-${baseName}`;
        const target = `/images/${segment}/${file}`.replace(/%20/, '-');
        console.log("Importing logo", url, file, target);
        site.remoteFile(file, url);
        site.copy(file, target);
        IMPORTED_LOGO_URLS[unrawUrl(url)] = target;
    }
}

/**
 * Define the foundationData plugin
 */
export default function () {

    return (site: Site) => {
        console.log("Foundation Submodule data");

        // Copy sponsor and project logos to the local site
        for(const [k, v] of Object.entries(SPONSOR_DATA.sponsors)) {
            if (v.display) {
                importLogo(k, v.display.logo, "sponsors", site);
                importLogo(k, v.display["logo-dark"], "sponsors", site);
            }
        }
        for(const [k, v] of Object.entries(PROJECT_DATA)) {
            if (v.display) {
                importLogo(k, v.display.logo, "projects", site);
                importLogo(k, v.display["logo-dark"], "projects", site);
            }
        }

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
                if (page.src.path.startsWith("/foundation")) {
                    const content = page.data.content as string;
                    page.data.content = content.replace(EMAIL_REGEX, FORM_REPLACEMENT);
                }
                // add function to get list of projects
                page.data.listProjects = () => {
                    return Object.values(PROJECT_DATA)
                        .filter((project) => !project.draft)
                        .map((project) => ({
                            ...project,
                            ...project.display
                        }));
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
                            if ( post.index === false ) {
                                return;
                            }
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