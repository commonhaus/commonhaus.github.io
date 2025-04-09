
const interestingFiles = [
    '.md',
    '.yml',
    '.yaml'
 ];
 const ignore = [
    'node_modules',
    'templates'
];

const foundationPath = './foundation-content';
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

const ghUrl = "https://github.com/commonhaus/foundation/blob/main/";
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
const sorted = Object.fromEntries(Object.entries(meta).sort())
Deno.writeTextFileSync(metaPath, JSON.stringify(sorted, null, 2));
