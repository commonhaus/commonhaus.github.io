import { ensureDirSync } from "https://deno.land/std@0.114.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.114.0/path/mod.ts";
import { safeLoad, safeDump } from "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js";

interface Discussion {
  id: string;
  title: string;
  category: {
    name: string;
  };
  author: {
    login: string;
    url: string;
    avatarUrl: string;
  };
  url: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  closed: boolean;
  closedAt: string;
  isAnswered: boolean;
  answerChosenAt: string;
  locked: boolean;
  activeLockReason: string;
}

interface DiscussionsData {
  data: {
    repository: {
      discussions: {
        nodes: Discussion[];
      };
    };
  };
}

function filterDiscussionsByCategory(data: DiscussionsData, category: string): Discussion[] {
  return data.data.repository.discussions.nodes.filter(
    (discussion) => discussion.category.name.toLowerCase() === category
  );
}

const prefixMap: Record<string, string> = {
  announcements: '[📣 ]',
  reviews: '[🗳️ ]',
};

function generateDiscussionContent(discussion: Discussion, id: string, category: string): string {
  const title = discussion.title.replace(/"/g, '\\"')
  const prefix = prefixMap[category];
  let updated = '';
  if (discussion.updatedAt && discussion.updatedAt !== discussion.createdAt) {
    updated = `\nupdated: ${discussion.updatedAt}`;
  }

  let status = '';
  let data = `---
title: "${prefix} ${title}"
github: "${discussion.url}"
author: "${discussion.author.login}"
date: ${discussion.createdAt}${updated}
url: "/posts/${id}.html"
tags:
- ${category}`;

if (discussion.closed) {
  data += `\n- closed"`;
  status += `\n  closedAt: "${discussion.closedAt}"`
}
if (discussion.locked) {
  data += `\n- locked"`;
  status += `\n  lockReason: "${discussion.activeLockReason}"`
}
if (discussion.isAnswered) {
  data += `\n- answered"`;
  status += `\n  answeredAt: "${discussion.answerChosenAt}"`;
}
  // Add conditional data
  if (status) {
    data += `\nstatus:${status}`;
  }
  data += `\n---\n${discussion.body}\n`;
  console.log(data);
  return data;
}

function writeDiscussionsToFiles(discussions: Discussion[], outputDir: string, category: string): void {
  ensureDirSync(outputDir);
  for (const discussion of discussions) {
    const id = discussion.url.substring(discussion.url.lastIndexOf('/') + 1);
    // const slug = id + slugifyTitle(discussion.title);
    const content = generateDiscussionContent(discussion, id, category);
    const filePath = join(outputDir, `${id}.md`);
    Deno.writeTextFileSync(filePath, content);
  }
}

function updateAuthors(discussions: Discussion[]): void {
  const authorsPath = './site/_data/authors.yml';
  const authorsYaml = Deno.readTextFileSync(authorsPath);
  const authors = safeLoad(authorsYaml) || {};
  for(const discussion of discussions) {
    const author = discussion.author;
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

function updateCategory(data: DiscussionsData, category: string) {
  // Filter discussions by category (Announcements),
  const discussions = filterDiscussionsByCategory(data, category);
  writeDiscussionsToFiles(discussions, `./site/posts`, category);
  // Update authors.yml (add/update author of last 10 discussions)
  updateAuthors(discussions);
}

// Usage:
// First, use a deno task to download the last 10 discussions from GitHub > discussions.json
// Parse the discussions.json file
const data: DiscussionsData = JSON.parse(Deno.readTextFileSync('discussions.json'));
updateCategory(data, 'announcements');
updateCategory(data, 'reviews');