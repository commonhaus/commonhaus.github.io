import { safeLoad } from "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js";

// Merge contents of CONTACTS.yaml and ./_data/authors.yml
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
interface ProjectRep extends User {
    projectName: string;
    projectUrl: string;
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

const CONTACT_DATA: Record<string, Contact[]> = safeLoad(Deno.readTextFileSync("./site/foundation/CONTACTS.yaml"));
const PROJECT_DATA: Record<string, unknown> = safeLoad(Deno.readTextFileSync("./site/foundation/PROJECTS.yaml"));
const USER_DATA: Record<string, unknown> = safeLoad(Deno.readTextFileSync("./site/_data/about.yml"));

const councilors: Councilor[] = [];
const egc: ProjectRep[] = [];

const cfcData: CouncilContact[] = CONTACT_DATA['cf-council'] as CouncilContact[];
const augmentedCfcData = cfcData.map(item => augmentReference<CouncilContact>(CONTACT_DATA, item));
for(const item of augmentedCfcData) {
    const user = USER_DATA[item.login] as User;
    if (!user) {
        console.log("No about data for", item.login);
        continue;
    }
    const councilor: Councilor = {
        ...user,
        ...item,
    };
    councilors.push(councilor);
}

const repData: ProjectContact[] = CONTACT_DATA['egc'] as ProjectContact[];
const augmentedRepData = repData.map(item => augmentReference<ProjectContact>(CONTACT_DATA, item));
for(const item of augmentedRepData) {
    const user = USER_DATA[item.login] as User;
    const project = PROJECT_DATA[item.project] as Record<string, string>;
    if (!user) {
        console.log("No about data for", item.login);
        continue;
    }
    if (!project) {
        console.log("No project data for", item.project);
        continue;
    }
    const rep: ProjectRep = {
        ...user,
        ...item,
        projectName: project.name,
        projectUrl: project.home,
    };
    egc.push(rep);
}

export {
    councilors,
    egc
}
