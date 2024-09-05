import { parse, stringify } from "@std/yaml";

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
const about: Record<string, User> = parse(aboutYaml) as Record<string, User> ?? {};

// Get last commit date for a file
function runGraphQL(filePath: string, custom: string[] = []): string {
    const args = [
        'api', 'graphql',
        ...custom,
        '-F', "owner=commonhaus",
        '-F', "name=foundation",
        '-F', `query=@${filePath}`,
    ];

    const command = new Deno.Command('gh', { args });

    const { code, stdout, stderr } = command.outputSync();
    const output = new TextDecoder().decode(stdout).trim();
    console.log(code, filePath, new TextDecoder().decode(stderr));
    console.assert(code === 0);
    return output;
}

function updateTeamMembers(data: TeamData) {
    const members = data.data.organization.team.members.nodes;
    for (const a of members) {
        about[a.login] = a;
    }
}
function updateTeamInvites(data: InviteData) {
    const invitees = data.data.organization.team.invitations.nodes;
    console.log(invitees)
    for (const a of invitees) {
        if (a && a.invitee && a.invitee.login) {
            about[a.invitee.login] = a.invitee;
        }
    }
}

const officers: TeamData = JSON.parse(runGraphQL('.github/graphql/query.team.graphql', ['-F', "teamName=cf-officers"]));
if (officers.errors || !officers.data) {
    console.error(officers);
    Deno.exit(1);
}
updateTeamMembers(officers);

const reps: TeamData = JSON.parse(runGraphQL('.github/graphql/query.team.graphql', ['-F', "teamName=cf-egc"]));
if (reps.errors || !reps.data) {
    console.error(reps);
    Deno.exit(1);
}
updateTeamMembers(reps);

const advisors: TeamData = JSON.parse(runGraphQL('.github/graphql/query.team.graphql', ['-F', "teamName=advisory-board"]));
if (advisors.errors || !advisors.data) {
    console.error(advisors);
    Deno.exit(1);
}
updateTeamMembers(advisors);

const pendingEgc: InviteData = JSON.parse(runGraphQL('.github/graphql/query.team.invitations.graphql', ['-F', "teamName=cf-egc"]));
if (pendingEgc.errors || !pendingEgc.data) {
    console.error(reps);
    Deno.exit(1);
}
updateTeamInvites(pendingEgc);

const pendingAb: InviteData = JSON.parse(runGraphQL('.github/graphql/query.team.invitations.graphql', ['-F', "teamName=advisory-board"]));
if (pendingAb.errors || !pendingAb.data) {
    console.error(reps);
    Deno.exit(1);
}
updateTeamInvites(pendingAb);

Deno.writeTextFileSync(aboutPath, stringify(about));