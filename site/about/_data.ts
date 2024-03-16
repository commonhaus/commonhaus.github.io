import { safeLoad } from "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js";

// Merge contents of CONTACTS.yaml and ./_data/authors.yml
// into a single data structure for Project Representatives and Councilors

interface CouncilContact {
    'gh-id': string;
    'term-start': number;
    role?: string;
}
interface ProjectContact {
    name: string;
    url: string;
    'gh-id': string;
}
interface Author {
    login: string;
    url: string;
    avatar: string;
    description?: string;
}
interface Councilor {
    login: string;
    url: string;
    avatar: string;
    termStart: number;
    role?: string;
    description?: string;
}
interface ProjectRep {
    login: string;
    url: string;
    avatar: string;
    description?: string;
    projectName: string;
    projectUrl: string;
}

const CONTACT_DATA: Record<string, unknown> = safeLoad(Deno.readTextFileSync("./site/foundation/CONTACTS.yaml"));
const AUTHOR_DATA: Record<string, unknown> = safeLoad(Deno.readTextFileSync("./site/_data/authors.yml"));

const councilors: Councilor[] = [];
const egc: ProjectRep[] = [];

const cfcData: CouncilContact[] = CONTACT_DATA['cf-council'] as CouncilContact[];
for(const contact of cfcData) {
    const author = AUTHOR_DATA[contact['gh-id']] as Author;
    if (!author) {
        console.log("No author data for", contact['gh-id']);
        continue;
    }
    const councilor: Councilor = {
        login: author.login,
        url: author.url,
        avatar: author.avatar,
        termStart: contact['term-start'],
    }
    if (contact.role) {
        councilor.role = contact.role;
    }
    if (author.description) {
        councilor.description = author.description;
    }
    councilors.push(councilor);
}

const prData: ProjectContact[] = CONTACT_DATA['egc'] as ProjectContact[];
for(const project of prData) {
    const author = AUTHOR_DATA[project['gh-id']] as Author;
    if (!author) {
        console.log("No author data for", project['gh-id']);
        continue;
    }
    const rep: ProjectRep = {
        login: author.login,
        url: author.url,
        avatar: author.avatar,
        projectName: project.name,
        projectUrl: project.url,
    }
    if (author.description) {
        rep.description = author.description;
    }
    egc.push(rep);
}

export {
    councilors,
    egc
}
