import { ensureDirSync } from "https://deno.land/std@0.114.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.114.0/path/mod.ts";
import { safeLoad, safeDump } from "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js";

interface Problem {
    path: string[];
    explanation: string;
}
interface Error {
    message: string;
    extensions?: {
        "value": string;
        "problems": Problem[];
    },
    locations?: {
        line: number;
        column: number;
    }[];
}
interface Label {
    name: string;
}
interface Author {
    login: string;
    url: string;
    avatarUrl: string;
    company?: string;
    name?: string;
}
interface ItemWithAuthor {
    id: string;
    title: string;
    number: number;
    author: Author;
    labels: {
        nodes: Label[];
    };
    url: string;
    body: string;
    createdAt: string;
    updatedAt: string;
    closed: boolean;
    closedAt: string;
    locked: boolean;
    activeLockReason: string;
    category?: {
        name: string;
    };
    isAnswered?: boolean;
    answerChosenAt?: string;
}
interface DiscussionsData {
    errors?: Error[];
    data: {
        repository: {
            discussions: {
                nodes: ItemWithAuthor[];
            };
        };
    };
}
interface PullRequestData {
    errors?: Error[];
    data: {
        repository: {
            pullRequests: {
                nodes: ItemWithAuthor[];
            };
        };
    };
}
interface PinnedItem {
    discussion: {
        id: string;
    };
}
interface PinnedItemData {
    errors?: Error[];
    data: {
        repository: {
            pinnedDiscussions: {
                nodes: PinnedItem[];
            };
        };
    };
}
interface PageData {
    author: string;
    content: string;
    date: string;
    github: string;
    number: number;
    rss_title: string;
    tags: string[];
    title: string;
    type: string;
    updated: string;
    url: string;

    answeredAt?: string;
    closedAt?: string;
    description?: string;
    lockReason?: string;
    pinned?: boolean;
}

const authorsPath = './site/_generated/authors.yml';
const authorsYaml = Deno.readTextFileSync(authorsPath);
const authors = safeLoad(authorsYaml) || {};
let authorsUpdated = false;

const prefixMap: Record<string, string> = {
    announcements: '📣  ',
    'consensus building': '🗳️  ',
    reviews: '🗳️  ',
};

// Get last commit date for a file
function runGraphQL(filePath: string): string {
    const command = new Deno.Command('gh', {
        args: [
            'api', 'graphql',
            '-F', "owner=commonhaus",
            '-F', "name=foundation",
            '-F', `query=@${filePath}`,
        ]
    });

    const { code, stdout, stderr } = command.outputSync();
    const output = new TextDecoder().decode(stdout).trim();
    console.log(code, filePath, new TextDecoder().decode(stderr));
    console.assert(code === 0);
    return output;
}

const pins: PinnedItemData = JSON.parse(runGraphQL('.github/graphql/query.pinned.graphql'));
if (pins.errors || !pins.data) {
    console.error(pins);
    Deno.exit(1);
}

const htmlComment = /<!--([\s\S]*?)-->/g;
const pinnedIds = pins.data.repository.pinnedDiscussions.nodes.map((node) => node.discussion.id);

function generateContent(item: ItemWithAuthor, id: string, type: string): string {
    const prefix = item.category
        ? prefixMap[item.category.name.toLowerCase()]
        : '';

    const match = item.body.match(/<!-- meta::description ([\s\S]*?)-->/);
    const description = match ? match[1].trim() : '';

    const tags = ['post'];
    if (item.category) {
        tags.push(item.category.name.toLowerCase());
    }
    if (item.labels.nodes) {
        for (const label of item.labels.nodes) {
            tags.push(label.name.toLowerCase());
        }
    }

    const data: PageData = {
        title: item.title,
        rss_title: `${prefix}${item.title}`,
        github: item.url,
        author: item.author.login,
        number: item.number,
        date: item.createdAt,
        updated: item.updatedAt ? item.updatedAt : item.createdAt,
        url: `/activity/${id}.html`,
        type,
        tags,
        content: item.body.replaceAll(htmlComment, ''),
    };

    if (item.closed) {
        data.closedAt = item.closedAt
    }
    if (item.locked) {
        data.lockReason = item.activeLockReason;
    }
    if (item.isAnswered) {
        data.answeredAt = item.answerChosenAt;
    }
    if (pinnedIds.includes(item.id)) {
        data.pinned = true;
    }
    if (description) {
        data.description = description;
    }

    return JSON.stringify(data, null, 2);
}

function writeItemsToFiles(items: ItemWithAuthor[], outputDir: string, type: string): void {
    ensureDirSync(outputDir);
    for (const item of items) {
        if (item.body.includes('<!-- meta::draft -->')) {
            continue;
        }
        const id = item.number.toString();
        const content = generateContent(item, id, type);
        const filePath = join(outputDir, `${id}.json`);
        Deno.writeTextFileSync(filePath, content);
    }
}

function updateAuthors(newAuthors: Author[]): void {
    for (const a of newAuthors) {
        if (!authors[a.login]) {
            authorsUpdated = true;
            authors[a.login] = {
                login: a.login,
                url: a.url,
                avatar: a.avatarUrl,
            };
            if (a.name) {
                authors[a.login].name = a.name;
            }
            if (a.company) {
                authors[a.login].company = a.company;
            }
        }
    }
}

function updateDiscussions(data: DiscussionsData) {
    // Filter discussions by category (Announcements) or label (Notice),
    const discussions = data.data.repository.discussions.nodes
        .filter((discussion: ItemWithAuthor) =>
            (discussion.category && prefixMap[discussion.category.name.toLowerCase()])
            || discussion.labels.nodes.some((label: Label) => label.name.toLowerCase() === 'notice')
        );

    writeItemsToFiles(discussions, `site/_generated/activity`, "discussion");

    // Update authors.yml (add/update author of last 10 discussions)
    updateAuthors(discussions.map((discussion) => discussion.author));
}

function updatePullRequests(data: PullRequestData) {
    // Filter discussions by label (Notice),
    const prs = data.data.repository.pullRequests.nodes
        .filter((pr: ItemWithAuthor) =>
            pr.labels.nodes.some((label: Label) => label.name.toLowerCase() === 'notice')
        );

    prs.forEach((pr: ItemWithAuthor) => pr.category = { name: 'reviews' });
    writeItemsToFiles(prs, `site/_generated/activity`, "pullRequest");

    // Update authors.yml (add/update author of last 10 discussions)
    updateAuthors(prs.map((pr) => pr.author));
}

// Usage:
// First, use a deno task to download the last 10 discussions from GitHub > discussions.json
// Parse the discussions.json file

const discuss: DiscussionsData = JSON.parse(runGraphQL('.github/graphql/query.discussions.graphql'));
if (discuss.errors || !discuss.data) {
    console.error(discuss);
    Deno.exit(1);
}
updateDiscussions(discuss);

const prs: PullRequestData = JSON.parse(runGraphQL('.github/graphql/query.pullrequests.graphql'));
if (prs.errors || !prs.data) {
    console.error(prs);
    Deno.exit(1);
}
updatePullRequests(prs);

if (authorsUpdated) {
    Deno.writeTextFileSync(authorsPath, safeDump(authors));
}