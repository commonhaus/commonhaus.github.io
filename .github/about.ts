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

const aboutPath = './site/_data/about.yml';
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

const reps: TeamData = JSON.parse(runGraphQL('.github/graphql/query.egc.graphql'));
if (reps.errors || !reps.data) {
    console.error(reps);
    Deno.exit(1);
}
updateEgcReps(reps);
Deno.writeTextFileSync(aboutPath, safeDump(about));