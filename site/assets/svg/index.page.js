import SVGSpriter from "npm:svg-sprite";
import { path } from "vento";


async function compileSprites(files, scope) {
    const spriter = new SVGSpriter({
        log: 'info',
        mode: {
            defs: true,
            symbol: true
        },
    });

    for (const file of files) {
        spriter.add(file, null, Deno.readTextFileSync(file, { encoding: 'utf-8' }));
    }

    try {
        const pages = [];
        const { result } = await spriter.compileAsync();
        for (const [mode, resource] of Object.entries(result)) {
            const svgContent = resource.sprite.contents.toString('utf-8');

            // Add the new page to the pages array
            pages.push({
                url: `/assets/${scope}-${mode}.svg`,
                content: svgContent
            });
        }
        return pages;
    } catch (error) {
        console.error(error);
    }
    return;
}


export default async function* ({ page }) {
    const dir = path.dirname(path.fromFileUrl(import.meta.url));

    const icons = [];
    const illustrations = [];

    const files = Deno.readDirSync(dir);
    for (const file of files) {
        if (file.isDirectory) {
            console.error("found a directory", file);
        } else if (file.name.endsWith('.svg')) {
            const fullPath = path.join(dir, file.name);
            if (file.name.startsWith('icon-')) {
                icons.push(fullPath);
            } else {
                illustrations.push(fullPath);
            }
        }
    }

    if (icons.length > 0) {
        const iconPages = await compileSprites(icons, 'icon');
        for (const page of iconPages) {
            yield page;
        }
    }
    if (illustrations.length > 0) {
        const illustrationSprite = await compileSprites(illustrations, 'illustration');
        for (const page of illustrationSprite) {
            yield page;
        }
    }
}
