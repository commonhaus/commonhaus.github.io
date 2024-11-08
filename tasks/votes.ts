import { fetchVoteData, processVote } from "./voteLib.ts";

const commentId = Deno.args[0];
const voteData = fetchVoteData(commentId);
processVote(voteData);
