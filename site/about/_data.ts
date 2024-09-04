import { parse } from "@std/yaml";


// Merge contents of CONTACTS.yaml, PROJECTS.yaml and ./site/_generated/about.yml
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
interface ProjectData {
  name?: string;
  repo?: string;
  display?: Record<string, string>
}
interface User {
    login: string;
    url: string;
    avatar: string;
    bio?: string;
    name?: string;
    company?: string;
    see?: string;
}
interface Councilor extends User {
    'term-start': number;
    role?: string;
}
interface Officer extends User {
    role?: string;
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

const CONTACT_DATA: Record<string, Contact[]> = parse(Deno.readTextFileSync("./site/foundation/CONTACTS.yaml")) as Record<string, Contact[]>;
const PROJECT_DATA: Record<string, ProjectData> = parse(Deno.readTextFileSync("./site/foundation/PROJECTS.yaml")) as Record<string, ProjectData>;
const USER_DATA: Record<string, unknown> = parse(Deno.readTextFileSync("./site/_generated/about.yml")) as Record<string, unknown>;

const councilors: Councilor[] = [];
const officers: Officer[] = [];

const cfcData = CONTACT_DATA['cf-council'] as CouncilContact[];
const augmentedCfcData = cfcData.map(item => augmentReference<CouncilContact>(CONTACT_DATA, item));
for(const item of augmentedCfcData) {
    if (item.login.includes(".")) {
        continue;
    }
    const user = USER_DATA[item.login] as User;
    if (!user) {
        console.log("CFC: No about data for", item.login);
        continue;
    }
    const councilor: Councilor = {
        ...user,
        ...item,
    };
    councilors.push(councilor);
}

const repData = CONTACT_DATA['egc'] as ProjectContact[];
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

const officerData = CONTACT_DATA['officers'] as OfficerContact[];
const augmentedOfficerData = officerData.map(item => augmentReference<OfficerContact>(CONTACT_DATA, item));
for(const item of augmentedOfficerData) {
    if (item.login.includes(".")) {
        continue;
    }
    const user = USER_DATA[item.login] as User;
    if (!user) {
        console.log("Officer: No about data for", item.login);
        continue;
    }
    const officer: Officer = {
        ...user,
        ...item,
    };
    officers.push(officer);
}

export {
    councilors,
    egc,
    officers
}
