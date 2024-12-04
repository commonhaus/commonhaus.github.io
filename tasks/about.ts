import { parse, stringify } from "@std/yaml";
import { runGraphQL } from "./queryLib.ts";

const aboutPath = './site/_generated/about.yml';
const aboutYaml = Deno.readTextFileSync(aboutPath);
const about: Record<string, User> = parse(aboutYaml) as Record<string, User> ?? {};

function addGroup(user: User, group: string) {
    user.groups = user.groups ?? [];
    if (!user.groups.includes(group)) {
        user.groups.push(group);
        user.groups.sort();
    }
}

function updateTeamMembers(data: TeamData, group: string) {
    const members = data.data.organization.team.members.nodes;
    for (const a of members) {
        addGroup(a, group);
        about[a.login] = a;
    }
}
function updateTeamInvites(data: InviteData, group: string) {
    const invitations = data.data.organization.team.invitations.nodes;
    for (const invite of invitations) {
        if (invite && invite.invitee && invite.invitee.login) {
            addGroup(invite.invitee, group);
            about[invite.invitee.login] = invite.invitee;
        }
    }
}

const groups = ['cf-officers', 'cf-egc', 'cf-egc-second', 'advisory-board'];
for(const group of groups) {
    console.log(`Updating ${group}`);
    const data: TeamData = JSON.parse(runGraphQL('tasks/graphql/query.team.graphql', ['-F', `teamName=${group}`]));
    if (data.errors || !data.data) {
        console.error(data);
        Deno.exit(1);
    }
    updateTeamMembers(data, group);

    const pendingData: InviteData = JSON.parse(runGraphQL('tasks/graphql/query.team.invitations.graphql', ['-F', `teamName=${group}`]));
    if (pendingData.errors || !pendingData.data) {
        console.error(pendingData);
        Deno.exit(1);
    }
    updateTeamInvites(pendingData, group);
}

const sorted = Object.fromEntries(Object.entries(about).sort())
Deno.writeTextFileSync(aboutPath, stringify(sorted));