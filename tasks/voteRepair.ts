import { join } from "@std/path";
import { fetchVoteData, processVote } from "./voteLib.ts";

const activityPath = `./site/_generated/activity/`;
const votePath = `./site/_generated/votes/`;
const jsonFiles: string[] = [];
const all = Deno.args.length > 0 && Deno.args[0] == "all";

const seen: string[] = [];

try {
    if (all) {
        findFiles(activityPath, jsonFiles);
        console.log(jsonFiles.length, ' files found.');
        jsonFiles.forEach(filePath => {
            const fileContent = Deno.readTextFileSync(filePath);
            const pageData: PageData = JSON.parse(fileContent);
            if (pageData && pageData.tags.includes('vote/open')) {
                const match = pageData.content.match(/^\[!\[🗳️ Vote progress\].*?"([^"]+)"/);
                if (match && match[1]) {
                    const commentId = match[1];
                    console.log(` *  commonhaus/foundation#${pageData.number}`);
                    const voteData = fetchVoteData(commentId);
                    processVote(voteData);
                    seen.push(commentId);
                }
            }
        });
    }
} catch (err) {
    console.error(err);
}

try {
    console.log('--> ', votePath);
    findFiles(votePath, jsonFiles);
    console.log(jsonFiles.length, ' files found.');

    // Process each JSON file
    jsonFiles.forEach(filePath => {
        const fileContent = Deno.readTextFileSync(filePath);
        let voteData = JSON.parse(fileContent);
        if (voteData && voteData.commentId && !seen.includes(voteData.commentId)) {
            if (voteData.isDone) {
                console.log(` -  ${voteData.repoName}#${voteData.number}`);
            } else {
                // Re-fetch the vote data to ensure we have the latest data
                // then reprocess the data to rewrite the file
                voteData = fetchVoteData(voteData.commentId);
                processVote(voteData);
            }
        }
    });
} catch (err) {
    console.error(err);
}

function findFiles(from: string, fileList: string[]) {
    for (const entry of Deno.readDirSync(from)) {
        const filePath = join(from, entry.name);
        if (entry.isDirectory) {
            findFiles(filePath, fileList);
        } else if (entry.isFile && filePath.endsWith(".json")) {
            fileList.push(filePath);
        }
    }
}