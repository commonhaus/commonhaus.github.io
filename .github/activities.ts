import { ensureDirSync } from "https://deno.land/std@0.114.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.114.0/path/mod.ts";
import { safeLoad, safeDump } from "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js";

interface Label {
  name: string;
}
interface Author {
  login: string;
  url: string;
  avatarUrl: string;
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
  data: {
    repository: {
      discussions: {
        nodes: ItemWithAuthor[];
      };
    };
  };
}
interface PullRequestData {
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
  data: {
    repository: {
      pinnedDiscussions: {
        nodes: PinnedItem[];
      };
    };
  };
}

const prefixMap: Record<string, string> = {
  announcements: '[📣  ]',
  reviews: '[🗳️  ]',
};

const pins: PinnedItemData = JSON.parse(Deno.readTextFileSync('./site/activity/activity-pinned.json'));
const pinnedIds = pins.data.repository.pinnedDiscussions.nodes
    .map((node) => node.discussion.id);


function generateContent(item: ItemWithAuthor, id: string, type: string): string {
  const title = item.title.replace(/"/g, '\\"')
  const prefix = item.category
    ? prefixMap[item.category.name.toLowerCase()]
    : '';
  let status = '';
  let data = `---
title: "${title}"
rss-title: "${prefix}${title}"
github: "${item.url}"
author: "${item.author.login}"
number: ${item.number}
date: ${item.createdAt}
updated: ${item.updatedAt ? item.updatedAt : item.createdAt}
url: "/activity/${id}.html"
type: ${type}
tags:
- post`;
  if (item.category) {
    data += `\n- ${item.category.name.toLowerCase()}`;
  }
  if (item.closed) {
    data += `\nclosedAt: ${item.closedAt}`
  }
  if (item.locked) {
    data += `\nlockReason: "${item.activeLockReason}"`
  }
  if (item.isAnswered) {
    data += `\nansweredAt: ${item.answerChosenAt}`;
  }
  if (pinnedIds.includes(item.id)) {
    data += `\npinned: true`;
  }
  data += `\n---\n${item.body}\n`;
  // console.log(data);
  return data;
}

function writeItemsToFiles(items: ItemWithAuthor[], outputDir: string, type: string): void {
  ensureDirSync(outputDir);
  for (const item of items) {
    const id = item.number.toString();
    // const slug = id + slugifyTitle(discussion.title);
    const content = generateContent(item, id, type);
    const filePath = join(outputDir, `${id}.md`);
    Deno.writeTextFileSync(filePath, content);
  }
}

function updateAuthors(items: ItemWithAuthor[]): void {
  const authorsPath = './site/_data/authors.yml';
  const authorsYaml = Deno.readTextFileSync(authorsPath);
  const authors = safeLoad(authorsYaml) || {};
  for (const item of items) {
    const author = item.author;
    if (!authors[author.login]) {
      authors[author.login] = {
        login: author.login,
        url: author.url,
        avatar: author.avatarUrl,
      };
    }
  }
  Deno.writeTextFileSync(authorsPath, safeDump(authors));
}

function updateDiscussions(data: DiscussionsData) {
  // Filter discussions by category (Announcements) or label (Notice),
  const discussions = data.data.repository.discussions.nodes
    .filter((discussion: ItemWithAuthor) =>
      (discussion.category && prefixMap[discussion.category.name.toLowerCase()])
      || discussion.labels.nodes.some((label: Label) => label.name.toLowerCase() === 'notice')
    );
  writeItemsToFiles(discussions, `./site/activity`, "discussion");
  // Update authors.yml (add/update author of last 10 discussions)
  updateAuthors(discussions);
}

function updatePullRequests(data: PullRequestData) {
  // Filter discussions by label (Notice),
  const prs = data.data.repository.pullRequests.nodes
    .filter((pr: ItemWithAuthor) =>
      pr.labels.nodes.some((label: Label) => label.name.toLowerCase() === 'notice')
    );
  prs.forEach((pr: ItemWithAuthor) => pr.category = { name: 'reviews' });
  writeItemsToFiles(prs, `./site/activity`, "pullRequest");
  // Update authors.yml (add/update author of last 10 discussions)
  updateAuthors(prs);
}

// Usage:
// First, use a deno task to download the last 10 discussions from GitHub > discussions.json
// Parse the discussions.json file
const discuss: DiscussionsData = JSON.parse(Deno.readTextFileSync('./site/activity/activity-discussions.json'));
updateDiscussions(discuss);

const prs: PullRequestData = JSON.parse(Deno.readTextFileSync('./site/activity/activity-prs.json'));
updatePullRequests(prs);
