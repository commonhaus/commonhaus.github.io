import { ensureDirSync } from "@std/fs";

const apiUrlPattern = /https:\/\/api.github.com\/users\/([a-zA-Z0-9_-]+)/g;
const normalUrl = "https://github.com/$1";

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
    if (code !== 0) {
        console.log(code, filePath, new TextDecoder().decode(stderr));
        console.log(output);
    }
    console.assert(code === 0);
    return output;
}

// Function to fetch the vote data from the GitHub API
// and transform/normalize it for further processing
export function fetchVoteData(commentId: string): VoteData {
    console.log(` == [${commentId}]`);
    const result: Result = JSON.parse(runGraphQL(commentId, 'tasks/graphql/query.comment.graphql'));

    // If we have errors, we're done.
    if (result.errors || !result.data || result.data.node === null) {
        console.error(result);
        return {} as VoteData;
    }
    // If we can't find the parent item, we're done
    const comment = result.data.node;
    const item = comment.discussion || comment.issue;
    if (!item || comment.author?.login !== 'haus-rules-bot') {
        console.error(comment);
        return {} as VoteData;
    }

    comment.body = comment.body.replaceAll(apiUrlPattern, normalUrl);

    const match = comment.body.match(/<!-- vote::data ([\s\S]*?)-->/);
    const voteData: VoteData = match ? JSON.parse(match[1].trim()) : {};

    voteData.commentId = comment.id;
    voteData.github = item.url;
    voteData.itemId = item.id;
    if (!voteData.title) {
        voteData.title = item.title;
    }
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

        const ignored: VoteCategory | undefined = voteData.categories['ignored'];
        if (ignored) {
            voteData.ignored = ignored;
            delete voteData.categories['ignored'];
        }
    }

    return voteData;
}

export function processVote(voteData: VoteData) {
    if (!voteData || !voteData.commentId) {
        return;
    }
    // The relative path for the vote file
    const relativeVotePath = `./site/_generated/votes/${voteData.repoName}/`;
    const fileName = `${voteData.number}.json`;
    console.log(`<-- ${voteData.repoName}#${voteData.number} to ${relativeVotePath}${fileName}`);
    ensureDirSync(relativeVotePath);
    Deno.writeTextFileSync(`${relativeVotePath}${fileName}`, JSON.stringify(voteData, null, 2));
}

