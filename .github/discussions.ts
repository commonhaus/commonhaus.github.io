import { ensureDirSync } from "https://deno.land/std@0.114.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.114.0/path/mod.ts";
import { safeLoad, safeDump } from "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js";

interface Comment {
  id: string;
  body: string;
  author: {
    login: string;
  };
  createdAt: string;
}

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

function filterDiscussionsByCategory(data: DiscussionsData, categoryName: string): Discussion[] {
  return data.data.repository.discussions.nodes.filter(
    (discussion) => discussion.category.name.toLowerCase() === categoryName
  );
}

function slugifyTitle(title: string): string {
  // Remove emoji
  const titleWithoutEmoji = title.replace(/[^\w\s\p{P}]/gu, "");

  // Split at first punctuation or first 4 words
  const splitTitle = titleWithoutEmoji.split(/[\.;,](?=\s)/);
  const words = titleWithoutEmoji.trim().split(/\s+/);
  const shortTitle = splitTitle.length == 0
      ? words.slice(0, 4).join(' ')
      : splitTitle[0];

  // Slugify the result
  return shortTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

function generateDiscussionContent(discussion: Discussion, slug: string): string {
  return `---
title: ${discussion.title}
github: ${discussion.url}
author: ${discussion.author.login}
date: ${discussion.createdAt}
url: /announcements/${slug}.html
---
${discussion.body}
`;
}

function writeDiscussionsToFiles(discussions: Discussion[], outputDir: string): void {
  ensureDirSync(outputDir);
  for (const discussion of discussions) {
    const id = discussion.url.substring(discussion.url.lastIndexOf('/') + 1);
    const slug = id + slugifyTitle(discussion.title);
    const content = generateDiscussionContent(discussion, slug);
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

// Usage:
// First, use a deno task to download the discussions from GitHub > discussions.json
// Parse the discussions.json file
const data: DiscussionsData = JSON.parse(Deno.readTextFileSync('discussions.json'));
// Filter discussions by category (Announcements)
const discussions = filterDiscussionsByCategory(data, 'announcements');
// Write markdown for discussions by id (will replace, we're only fetching 10)
writeDiscussionsToFiles(discussions, './site/announcements');
// Update authors.yml (add/update author of last 10 discussions)
updateAuthors(discussions);
