import { parse, stringify } from "@std/yaml";
import { queryOpenCollectiveGraphQL, runGraphQL } from "./queryLib.ts";
import { InviteData, SocialLink, SponsorData, TeamData, User } from "./@types/index.d.ts";
import { MEMBERS } from "./constants.ts";

const args = Deno.args;
const updateMembers = args.includes('--members') || !args.includes('--skip-members');
const updateSupporters = args.includes('--supporters') || !args.includes('--skip-supporters');

const aboutPath = './site/_generated/about.yml';
const aboutYaml = Deno.readTextFileSync(aboutPath);
const about: Record<string, User> = parse(aboutYaml) as Record<string, User> ?? {};

const supportersPath = './site/_generated/supporters.yml';
const supportersYaml = Deno.readTextFileSync(supportersPath);
const supporters: Record<string, User> = parse(supportersYaml) as Record<string, User> ?? {};

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
        const merge = about[a.login] ? { ...about[a.login], ...a } : a;
        addGroup(merge, group);
        about[a.login] = merge;
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
function updateGroup(group: string) {
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

function ghSponsors() {
    console.log('Updating GitHub sponsors');
    const data: SponsorData = JSON.parse(runGraphQL('tasks/graphql/query.sponsors.graphql', ['-F', 'login=commonhaus']));
    if (data.errors || !data.data) {
        console.error(data);
        Deno.exit(1);
    }
    const details = data.data.organization?.sponsorshipsAsMaintainer?.nodes;
    for(const entity of details) {
        const s = entity.sponsorEntity;
        if (about[s.login] && about[s.login].groups?.includes(MEMBERS)) {
            console.log(s.login, " is a member, skipping");
            delete supporters[s.login];
            continue;
        }
        supporters[s.login] = supporters[s.login] ? { ...supporters[s.login], ...s } : s;
    }
}

function gitHubLogin(links: SocialLink[]): string | undefined {
    const ghLink = links.find((link) => link.type.toLowerCase() === 'github');
    if (ghLink) {
        const ghLogin = ghLink.url.split('/').pop();
        return ghLogin;
    }
    return undefined;
}

async function updateOpenCollectiveContributors(): Promise<void> {
    const ocQuery = Deno.readTextFileSync('tasks/graphql/query.opencollective.graphql');

    // Process supporters from GitHub sponsors and OpenCollective
    let offset = 0;
    let limit = 0;
    let totalCount = 0
    let hasMore = true;

    while(hasMore) {
        // Fetch data from OpenCollective
        const response = await queryOpenCollectiveGraphQL(ocQuery, offset);
        if (response.errors) {
            console.error('Error fetching OpenCollective backers:', response.errors);
            break;
        }
        const members = response.data.account?.members;
        const currentCount = members.nodes.length;

        if (!members || !members.nodes || members.nodes.length === 0) {
          hasMore = false;
          break;
        }
        if (totalCount == 0) {
            totalCount = members.totalCount;
            limit = members.limit;
        }
        for (const backer of members.nodes) {
            const supporter = backer.account;
            if (supporter && !supporter.isIncognito) {
                const ghLogin = gitHubLogin(supporter.socialLinks);
                if (ghLogin && about[ghLogin] && about[ghLogin].groups?.includes(MEMBERS)) {
                    console.log(ghLogin, " is a member, skipping");
                    delete supporters[ghLogin];
                    continue;
                }
                if (supporter.slug.match(/(commonhaus-foundation|.*github-sponsors.*|.*buy-me-a-coffee.*)/)) {
                    continue;
                }
                const user: User = {
                    login: supporter.slug,
                    name: supporter.name,
                    url: `https://opencollective.com/${supporter.slug}`,
                    avatarUrl: supporter.imageUrl,
                };
                console.log("adding supporter", user.login);
                supporters[user.login] = user;
            }
        }
        offset += limit;
        hasMore = currentCount === limit;
    }
}

const groups = ['cf-officers', 'cf-egc', 'cf-egc-second', 'advisory-board'];
for (const group of groups) {
    updateGroup(group);
}
if (updateMembers) {
    updateGroup(MEMBERS);
}
if (updateSupporters) {
    console.log('Updating supporters...');
    ghSponsors();
    // await updateOpenCollectiveContributors();
}

// Write files

const sorted = Object.fromEntries(Object.entries(about).sort());
Deno.writeTextFileSync(aboutPath, stringify(sorted));

const sortedSupporters = Object.fromEntries(Object.entries(supporters).sort());
Deno.writeTextFileSync(supportersPath, stringify(sortedSupporters));