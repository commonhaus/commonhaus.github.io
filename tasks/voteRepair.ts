import { join } from "@std/path";
import { fetchVoteData, processVote } from "./voteLib.ts";

const votePath = `./site/_generated/votes/`;
const jsonFiles: string[] = [];

try {
    console.log('reading path ', votePath);
    findFiles(votePath, jsonFiles);
    console.log('files found ', jsonFiles);

    // Process each JSON file
    jsonFiles.forEach(filePath => {
        const fileContent = Deno.readTextFileSync(filePath);
        let voteData = JSON.parse(fileContent);
        if (voteData && voteData.commentId) {
            console.log(voteData);
            // Re-fetch the vote data to ensure we have the latest data
            // then reprocess the data to rewrite the file
            voteData = fetchVoteData(voteData.commentId);
            processVote(voteData);
        } else {
            console.warn(`No commentId found in file ${filePath}`);
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