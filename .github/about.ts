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
interface User {
    login: string;
    url: string;
    avatarUrl: string;
    company: string;
    companyHTML: string;
    name: string;
    bio: string;
}
interface TeamData {
    errors?: Error[];
    data: {
        organization: {
            team: {
                members: {
                    nodes: User[];
                };
            };
        };
    };
}
interface InviteData {
    errors?: Error[];
    data: {
        organization: {
            team: {
                invitations: {
                    nodes: Invitee[];
                };
            };
        };
    };
}
interface Invitee {
    invitee: User
}

const aboutPath = './site/_generated/about.yml';
const aboutYaml = Deno.readTextFileSync(aboutPath);
const about = safeLoad(aboutYaml) || {};

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

function updateEgcReps(data: TeamData) {
    const members = data.data.organization.team.members.nodes;
    for (const a of members) {
        about[a.login] = a;
    }
}
function updateEgcInvites(data: InviteData) {
    const invitees = data.data.organization.team.invitations.nodes;
    for (const a of invitees) {
        about[a.invitee.login] = a.invitee;
    }
}

const reps: TeamData = JSON.parse(runGraphQL('.github/graphql/query.egc.graphql'));
if (reps.errors || !reps.data) {
    console.error(reps);
    Deno.exit(1);
}
updateEgcReps(reps);
const invites: InviteData = JSON.parse(runGraphQL('.github/graphql/query.egc.invitations.graphql'));
if (invites.errors || !invites.data) {
    console.error(reps);
    Deno.exit(1);
}
updateEgcInvites(invites);
Deno.writeTextFileSync(aboutPath, safeDump(about));