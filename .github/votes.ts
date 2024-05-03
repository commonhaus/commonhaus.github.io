import { ensureDirSync } from "https://deno.land/std@0.114.0/fs/mod.ts";

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
interface Item {
    id: string;
    title: string;
    number: number;
    closed: boolean;
    closedAt: string;
    labels: {
        nodes: Label[];
    };
    repository: {
        nameWithOwner: string;
    }
    url: string;
}
interface Result {
    errors?: Error[];
    data?: {
        node: {
            discussion?: Item,
            issue?: Item,
            body: string;
            createdAt: string;
            id: string;
            updatedAt: string;
            url: string;
        };
    };
}
interface VoteRecord {
    login: string;
    url: string;
    createdAt: string;
    reaction: string;
}
interface VoteCategory {
    reactions: string[];
    team: VoteRecord[];
    teamTotal: number;
    total: number;
}
interface VoteData {
    voteType: string;
    hasQuorum: boolean;
    group: string;
    groupSize: number;
    groupVotes: number;
    countedVotes: number;
    droppedVotes: number;
    votingThreshold: string;
    categories?: Record<string, VoteCategory>;
    duplicates: VoteRecord[]
    missingGroupActors: VoteRecord[];

    // Fields are added (or modified) by this script for rendering
    closed?: boolean;
    closedAt?: string;
    commentId?: string;
    date?: string;
    github?: string;
    ignored?: VoteCategory;
    itemId?: string;
    itemTitle?: string;
    number?: number;
    repoName?: string;
    sortedCategories?: [string, VoteCategory][];
    tags?: string[];
    type?: string;
    updated?: string;
    url?: string;
}

// Get last commit date for a file
function runGraphQL(commentId: string, filePath: string): string {
    const command = new Deno.Command('gh', {
        args: [
            'api', 'graphql',
            '-F', "owner=commonhaus",
            '-F', "name=foundation",
            '-F', `commentId=${commentId}`,
            '-F', `query=@${filePath}`,
        ]
    });

    const { code, stdout, stderr } = command.outputSync();
    const output = new TextDecoder().decode(stdout).trim();
    console.log(code, filePath, new TextDecoder().decode(stderr));
    console.log(output);
    console.assert(code === 0);
    return output;
}

const commentId = Deno.args[0];
console.log(`Check vote data in comment ${commentId}`);

const result: Result = JSON.parse(runGraphQL(commentId, '.github/graphql/query.comment.graphql'));
console.log(result);

// If we have errors, we're done.
if (result.errors || !result.data) {
    console.error(result);
    Deno.exit(1);
}
// If we can't find the parent item, we're done
const comment = result.data.node;
const item = comment.discussion || comment.issue;
if (!item) {
    console.error(comment);
    Deno.exit(1);
}

const match = comment.body.match(/<!-- vote::data ([\s\S]*?)-->/);
const voteData: VoteData = JSON.parse(match ? match[1].trim() : '');

voteData.commentId = comment.id;
voteData.github = item.url;
voteData.itemId = item.id;
voteData.itemTitle = item.title;
voteData.number = item.number;
voteData.repoName = item.repository.nameWithOwner;
voteData.type = 'vote';
voteData.date = comment.createdAt;
voteData.updated = comment.updatedAt ? comment.updatedAt : comment.createdAt;
voteData.url = `/votes/${item.repository.nameWithOwner}/${item.number}.html`;

voteData.tags = item.labels.nodes.map(label => label.name);
voteData.tags.push('vote');
voteData.closed = item.closed;
if (item.closed) {
    voteData.tags.push('closed');
    voteData.closedAt = item.closedAt;
}

if (voteData.categories) {
    const ignored: VoteCategory | undefined = voteData.categories['ignored'];
    if (ignored) {
        voteData.ignored = ignored;
        delete voteData.categories['ignored'];
    }

    for (const category of Object.values(voteData.categories)) {
        // +1, -1, laugh, confused, heart, hooray, rocket, eyes
        // thumbs_up, plus_one, thumbs_down, minus_one
        category.reactions = category.reactions.map((r: string) =>
            r.toLowerCase().replace('+1', '👍')
                .replace('thumbs_up', '👍')
                .replace('plus_one', '👍')
                .replace('-1', '👎')
                .replace('thumbs_down', '👎')
                .replace('minus_one', '👎')
                .replace('laugh', '😄')
                .replace('confused', '😕')
                .replace('heart', '❤️')
                .replace('hooray', '🎉')
                .replace('rocket', '🚀')
                .replace('eyes', '👀')
        );
    }
}

// The relative path for the vote file
const relativeVotePath = `./site/votes/${item.repository.nameWithOwner}/`;
const fileName = `${item.number}.json`;
console.log(`Writing vote data to ${relativeVotePath}${fileName}`);
ensureDirSync(relativeVotePath);
Deno.writeTextFileSync(`${relativeVotePath}${fileName}`, JSON.stringify(voteData, null, 2));