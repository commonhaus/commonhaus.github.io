import { parse } from "@std/yaml";
import { MEMBERS } from "../../tasks/constants.ts";

// Merge contents of CONTACTS.yaml, PROJECTS.yaml, SPONSORS.yaml and ./site/_generated/about.yml
// into a single data structure for Project Representatives and Councilors

interface Contact {
    login: string;
    bio?: string;
    avatarAlt?: string;
    see?: string;
}
interface CouncilContact extends Contact {
    'term-start': number;
    role?: string;
}
interface ProjectContact extends Contact {
    project: string;
    projects?: ProjectData[];
}
interface OfficerContact extends Contact {
    role?: string;
}
interface AdvisorContact extends Contact {
    organization: string;
}
interface ProjectData {
    name?: string;
    repo?: string;
    display?: Record<string, string>;
    draft?: boolean;
}
interface User {
    login: string;
    url: string;
    avatar: string;
    bio?: string;
    name?: string;
    company?: string;
    see?: string;
    groups?: string[];
}
interface SponsorData {
    tiers: Record<string, SponsorTier>;
    sponsors: Record<string, Sponsor>;
}
interface SponsorTier {
    name: string;
    description: string;
}
interface Display {
    draft?: boolean;
    home?: string;
    logo?: string;
    "logo-dark"?: string;
    description?: string;
}
interface Sponsor {
    name: string;
    description: string;
    tier?: string[];
    display?: Display;
    inKind?: Display;
    reps: AdvisorContact[];
}
interface GroupedSponsors {
    [key: string]: Sponsor[];
}

function augmentReference<T extends Contact>(data: Record<string, Contact[]>, item: T): T {
    if (item.see) {
        // if there is a reference to contact details from another section, merge it
        const aux = data[item.see].find((x: Contact) => x.login === item.login);
        if (aux) {
            item = {
                ...item,
                ...aux,
            };
        }
    }
    return item as T;
}

const devMode = Deno.env.get("DEV_MODE") || false;

const CONTACT_DATA = parse(Deno.readTextFileSync("./foundation-content/CONTACTS.yaml")) as Record<string, Contact[]>;
const SPONSOR_DATA = parse(Deno.readTextFileSync("./foundation-content/SPONSORS.yaml")) as SponsorData;
const PROJECT_DATA = parse(Deno.readTextFileSync("./foundation-content/PROJECTS.yaml")) as Record<string, ProjectData>;
const USER_DATA = parse(Deno.readTextFileSync("./site/_generated/about.yml")) as Record<string, User>;
const SUPPORTER_DATA = parse(Deno.readTextFileSync("./site/_generated/supporters.yml")) as Record<string, User>;

// Create a map for sort order
const tiers = SPONSOR_DATA.tiers;

const cfcData = CONTACT_DATA['cf-council'] as CouncilContact[];
const councilors = cfcData.map(item => augmentReference<CouncilContact>(CONTACT_DATA, item));
for (const councilor of councilors) {
    if (councilor.login.includes(".")) {
        continue;
    }
    const user = USER_DATA[councilor.login] as User;
    if (!user) {
        console.log("CFC: No about data for", councilor.login);
        continue;
    }
    Object.assign(councilor, {
        ...user,
        ...councilor // make sure these take precedence
    });
}
councilors.sort((a, b) => a.login.localeCompare(b.login));

const repData = [
    ...CONTACT_DATA['egc'],
    ...CONTACT_DATA['egc-second']] as ProjectContact[];
const augmentedRepData = repData.map(item => augmentReference<ProjectContact>(CONTACT_DATA, item));
const egc = augmentedRepData.reduce((acc: ProjectContact[], current: ProjectContact) => {
    if (current.login.includes(".")) {
        return acc;
    }

    const index = acc.findIndex(x => x.login === current.login);
    const project = PROJECT_DATA[current.project] || {};
    const data = {
        ...project,
        ...project.display,
    }
    if (!data) {
        console.log("No project data for", current.project);
    }
    if (index !== -1 && acc[index]) {
        acc[index].projects?.push(data);
    } else {
        const user = USER_DATA[current.login] as User;
        if (!user) {
            console.log("EGC: No about data for", current.login);
        }
        acc.push({
            ...user,
            ...current,
            projects: [data]
        });
    }
    return acc;
}, []);
egc.sort((a, b) => a.login.localeCompare(b.login));

const officerData = CONTACT_DATA['officers'] as OfficerContact[];
const officers = officerData.map(item => augmentReference<OfficerContact>(CONTACT_DATA, item));
for (const officer of officers) {
    if (officer.login.includes(".")) {
        continue;
    }
    const user = USER_DATA[officer.login] as User;
    if (!user) {
        console.log("Officer: No about data for", officer.login);
        continue;
    }
    Object.assign(officer, {
        ...user,
        ...officer // make sure these take precedence
    });
}
officers.sort((a, b) => a.login.localeCompare(b.login));

// Augment advisory board user data
const advisorData = CONTACT_DATA['advisory-board'] as AdvisorContact[];
const augmentedAdvisorData = advisorData.map(item => augmentReference<AdvisorContact>(CONTACT_DATA, item));
for (const advisor of augmentedAdvisorData) {
    if (advisor.login.includes(".")) {
        continue;
    }
    // merge data related to the user retrieved from GitHub if available
    const user = USER_DATA[advisor.login] as User;
    if (!user) {
        console.log("Advisory Board: No about data for", advisor.login);
        continue;
    }
    Object.assign(advisor, {
        ...user,
        ...advisor // make sure these take precedence
    });
}

const groupedSponsors: GroupedSponsors = {};
const advisoryBoard: AdvisorContact[] = [];
Object.entries(SPONSOR_DATA.sponsors).forEach(([key, sponsor]) => {
    const display = sponsor.display || {};
    if (!display.draft) {
        const reps = augmentedAdvisorData.filter(x => x.organization === key);
        reps.forEach(x => Object.assign(x, {
            sponsorName: sponsor.name,
            sponsorHome: sponsor.display?.home || key,
        }));
        advisoryBoard.push(...reps);
    }

    if (sponsor.inKind) {
        sponsor.inKind.logo = sponsor.inKind.logo || sponsor.display?.logo;
        sponsor.inKind["logo-dark"] = sponsor.inKind["logo-dark"] || sponsor.display?.["logo-dark"];
        sponsor.inKind.home = sponsor.inKind.home || sponsor.display?.home;
    }

    if (sponsor.tier) {
        sponsor.tier.forEach(tier => {
            const display = tier == 'inKind' ? sponsor.inKind : sponsor.display;
            console.log(devMode, "Adding sponsor", sponsor.name, "to tier", tier, "with display", display?.draft);
            if (devMode || !display?.draft) {
                addToGroup(groupedSponsors, tier, sponsor);
            }
        });
    } else {
        addToGroup(groupedSponsors, 'supporter', sponsor);
    }
});
advisoryBoard.sort((a, b) => a.login.localeCompare(b.login));

function addToGroup(groups: GroupedSponsors, tier: string, sponsor: Sponsor) {
    if (!groups[tier]) {
        groups[tier] = [];
    }
    groups[tier].push(sponsor);
}

function tieredSponsors(): GroupedSponsors {
    const filteredGroups: GroupedSponsors = {};
    for (const [key, sponsors] of Object.entries(groupedSponsors)) {
        if (sponsors && key != 'inKind') {
            filteredGroups[key] = sponsors;
        }
    }
    return filteredGroups;
}

function filteredTiers(filteredSponsors: GroupedSponsors): Record<string, SponsorTier> {
    const tiers: Record<string, SponsorTier> = {};
    for (const [key, sponsor] of Object.entries(SPONSOR_DATA.tiers)) {
        if (filteredSponsors[key]) {
            tiers[key] = sponsor;
        }
    }
    return tiers;
}

function inKind(): Sponsor[] {
    return groupedSponsors['inKind'];
}

function tier(tier: string): SponsorTier {
    return tiers[tier];
}

function members(): User[] {
    return Object.values(USER_DATA)
        .filter((user: User) => user.groups?.includes(MEMBERS) && user.groups?.length === 1);
}

function supporters(): User[] {
    const result = [
        ...Object.values(SUPPORTER_DATA),
        ...Object.values(USER_DATA).filter((user: User) => user.groups?.includes(MEMBERS))
    ];
    return result;
}

export {
    councilors,
    egc,
    officers,
    tier,
    tieredSponsors,
    filteredTiers,
    inKind,
    members,
    supporters
}
