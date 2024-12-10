import { ensureDirSync } from "@std/fs";
import { join } from "@std/path";
import { parse, stringify } from "@std/yaml";
import { runGraphQL } from "./queryLib.ts";

const authorsPath = './site/_generated/authors.yml';
const authorsYaml = Deno.readTextFileSync(authorsPath);
const authors = parse(authorsYaml) as Record<string, Author> || {};
let authorsUpdated = false;

const prefixMap: Record<string, string> = {
    announcements: '📣  ',
    'consensus building': '🗳️  ',
};

const pins: PinnedItemData = JSON.parse(runGraphQL('tasks/graphql/query.pinned.graphql'));
if (pins.errors || !pins.data) {
    console.error(pins);
    Deno.exit(1);
}

const htmlComment = /<!--([\s\S]*?)-->/g;
const pinnedIds = pins.data.repository.pinnedDiscussions.nodes.map((node) => node.discussion.id);

function getItemCategory(category: string | undefined, vote: boolean): string {
    if (vote) {
        return '🗳️  ';
    }
    if (category) {
        return prefixMap[category.toLowerCase()] || '';
    }
    return '';
}

function generateContent(item: ItemWithAuthor, id: string, type: string): string {
    const match = item.body.match(/<!-- meta::description ([\s\S]*?)-->/);
    const description = match ? match[1].trim() : '';

    const tags = ['post'];
    let vote = false;
    if (item.category) {
        tags.push(item.category.name.toLowerCase());
    }
    if (item.labels.nodes) {
        for (const label of item.labels.nodes) {
            tags.push(label.name.toLowerCase());
            vote = vote || label.name.toLowerCase().startsWith('vote');
        }
    }

    const prefix = getItemCategory(item.category?.name, vote);

    console.log(`Generating ${type} ${id} with ${item.category?.name} and ${prefix}`);

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
                avatarUrl: a.avatarUrl,
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

    writeItemsToFiles(prs, `site/_generated/activity`, "pullRequest");

    // Update authors.yml (add/update author of last 10 discussions)
    updateAuthors(prs.map((pr) => pr.author));
}

// Usage:
// First, use a deno task to download the last 10 discussions from GitHub > discussions.json
// Parse the discussions.json file

const discuss: DiscussionsData = JSON.parse(runGraphQL('tasks/graphql/query.discussions.graphql'));
if (discuss.errors || !discuss.data) {
    console.error(discuss);
    Deno.exit(1);
}
updateDiscussions(discuss);

const prs: PullRequestData = JSON.parse(runGraphQL('tasks/graphql/query.pullrequests.graphql'));
if (prs.errors || !prs.data) {
    console.error(prs);
    Deno.exit(1);
}
updatePullRequests(prs);

if (authorsUpdated) {
    const sorted = Object.fromEntries(Object.entries(authors).sort())
    Deno.writeTextFileSync(authorsPath, stringify(sorted));
}