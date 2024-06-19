import { path } from "https://deno.land/x/vento@v0.10.0/deps.ts";

function createPages(pages, dir, uri) {
    const files = Deno.readDirSync(dir);
    for (const file of files) {
        if (file.isDirectory) {
            createPages(pages, path.join(dir, file.name), path.join(uri, file.name));
        } else if (file.name.endsWith('.json')) {
            const data = JSON.parse(Deno.readTextFileSync(path.join(dir, file.name)));
            data.updated = new Date(data.updated);
            data.templateEngine = ['vto', 'md'];
            data.layout = "layouts/activity.vto";
            data.cssclasses = ['activity', 'has-aside'];
            if (!data.tags.includes('announcements')) {
                data.metas = {
                    robots: false
                }
            }
            pages.push(data);
        }
    }
}

export default function* ({ page }) {
    const genPages = [];
    const dir = path.resolve(import.meta.dirname, '../_generated/activity');

    // recurse to find/generate pages for individual vote results
    createPages(genPages, dir, "/activity");

    for (const gp of genPages) {
        yield gp;
    }
}