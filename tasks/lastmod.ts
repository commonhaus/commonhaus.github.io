
const interestingFiles = [
    '.md',
    '.yaml'
 ];
 const ignore = [
    'node_modules',
    'templates'
];

const foundationPath = './site/foundation';
const metaPath = './site/_generated/foundation.json';
const projectMeta = Deno.readTextFileSync(metaPath);
const now = new Date().toISOString();

// deno-lint-ignore no-explicit-any
const meta: Record<string, any> = JSON.parse(projectMeta);

// Get last commit date for a file
function gitLastCommitDate(filePath: string, repoDir: string): Date {
    const command = new Deno.Command('git', {
        args: ['--no-pager', 'log', '--format=%cI', '-1', '--', filePath],
        cwd: repoDir,
    });
    const { code, stdout, stderr } = command.outputSync();
    const output = new TextDecoder().decode(stdout).trim();
    console.assert(code === 0);
    return new Date(output);
}

function getGithubUrl(repoDir: string): string {
    const data = Deno.readFileSync(`${Deno.cwd()}/.gitmodules`);
    const gitmodules = new TextDecoder("utf-8").decode(data);

    // Extract the project name from the directory path
    const projectName = repoDir.substring(repoDir.lastIndexOf('/') + 1);

    // Use a regular expression to find the URL for the project
    const regex = new RegExp(`(https.*?/${projectName})\\.git`, 'i');
    const match = gitmodules.match(regex);
    const githubUrl = match ? match[1] + '/blob/main/' : '';
    console.log(`GitHub URL: ${githubUrl}`)

    return githubUrl;
}

async function readDir(path: string, relative: string, repo: string, repoRelative: string, ghUrl: string) {
    for await (const dirEntry of Deno.readDir(path)) {
        if(dirEntry.name.startsWith('.') || dirEntry.name.startsWith('_') || ignore.includes(dirEntry.name)) {
            continue;
        }
        if (dirEntry.isFile) {
            if (!interestingFiles.some((ext) => dirEntry.name.endsWith(ext))) {
                continue;
            }
            const filePath = `${relative}${dirEntry.name}`;
            const struct = meta[filePath] = meta[filePath] || {};
            const repoPath = `${repoRelative}${dirEntry.name}`;

            console.log(`Reading ${dirEntry.name}`);

            struct.visited = now;
            struct.date = gitLastCommitDate(repoPath, repo);
            struct.srcPath = filePath;
            struct.githubUrl = `${ghUrl}`;
            struct.repoUrl = `${ghUrl}${repoPath}`;

            if (dirEntry.name.endsWith('.md')) {
                struct.type = 'submodule';
                if (filePath.includes('bylaws')) {
                    struct.layout = 'layouts/bylaws.vto';
                    struct.cssclasses = ['bylaws', 'has-aside'];
                    struct.tags = ['bylaws', 'legal'];
                } else if (filePath.includes('policies') || filePath.includes('agreements')) {
                    struct.layout = 'layouts/policies.vto';
                    struct.cssclasses = ['bylaws', 'has-aside'];
                    struct.tags = ['policies', 'legal'];
                } else {
                    struct.layout = 'layouts/foundation.vto';
                    struct.cssclasses = ['foundation'];
                }
                struct.genUrl = `/${filePath}.html`
                    .replace('.md', '')
                    .replace('README.html', '');
            } else {
                struct.genUrl = `/${filePath}`;
            }
        } else if (dirEntry.isDirectory) {
            const nextDir = `${path}/${dirEntry.name}`;
            const nextRepoRel = `${repoRelative}${dirEntry.name}/`;
            await readDir(nextDir, `${relative}${dirEntry.name}/`, repo, nextRepoRel, ghUrl);
        }
    }
}

const ghUrl = getGithubUrl(foundationPath);
await readDir(foundationPath, '', foundationPath, '', ghUrl);
for (const key in meta) {
    if (meta[key].visited !== now) {
        console.log(`Removing ${key}`);
        delete meta[key];
    } else {
        delete meta[key].visited;
    }
}

// Write updated foundation metadata
Deno.writeTextFileSync(metaPath, JSON.stringify(meta, null, 2));
