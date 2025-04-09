import { basename, extname } from "@std/path";
import { extract, test } from "lume/deps/front_matter.ts";
import { parse } from "@std/yaml";
import { Data, RawData } from "lume/core/file.ts";
import { xml_node } from "https://deno.land/x/xml@6.0.4/parse.ts";

// Add foundation pages (from _foundation.yml) to the site.

// -------------------
// Foundation Data: submodule pages
// - foundation.json is generated by ./.github/lastmod.ts
// - foundation.yml  is manually maintained: descriptions, resulting page url, etc.
const DATA_ROOT = "./foundation-content";
const FOUNDATION_DATA = parse(Deno.readTextFileSync("./site/_generated/foundation.json")) as  Record<string, Data>;
const FOUNDATION_PAGES = parse(Deno.readTextFileSync("./site/_foundation.yml")) as  Record<string, Data>;
const EMAIL_REGEX = /(send an email to|email) the \[`?.+?`? mailing list\]\[CONTACTS.yaml\]/g;
const FORM_REPLACEMENT = '[use our online form](https://forms.gle/t2d4DR6CxXSag26s5)';

export const renderOrder = -1;

export default async function* () {
    console.log("🏛️ Adding foundation pages");

    for(const [key, metaData] of Object.entries(FOUNDATION_PAGES)) {
        const relativePath = `${key}.md`;
        const fullPath = `${DATA_ROOT}/${relativePath}`;
        const stat = await fileExists(fullPath);
        if (!stat) {
            console.log(`💥 🫣 File ${fullPath} does not exist`);
            continue;
        }

        // Read file content from foundation submodule
        // this will include the data (body) and the frontmatter
        // as attributes
        const rawData = await toRawData(fullPath);
        if (rawData.content === undefined) {
            return null;
        }

        // Merge file metadata
        const jsonData = FOUNDATION_DATA[relativePath];
        let data: Partial<Data> = {
            ...jsonData, // foundation.json
            ...rawData,  // *.md (with frontmatter)
            ...metaData,     // _foundation.yaml
            foundationPage: true,
        };
        data.basename = basename(relativePath);
        data.date = typeof data.date === "string" ? new Date(data.date) : data.date;
        if (!data.title) {
            extractTitle(data);
        }
        // set template engine(s) and layout if not explicitly set otherwise
        data.templateEngine = data.templateEngine || ['md', 'vto'];
        if (data.url?.includes("bylaws")) {
            const bylawsData = parse(Deno.readTextFileSync("site/bylaws/_data.yml")) as Partial<Data>;
            data = { ...data, ...bylawsData };
            data.ord = bylawsData.bylaws_nav.find((x) => x.href === data.url)?.ord;
        } else if (data.url?.includes("policies")) {
            const policiesData = parse(Deno.readTextFileSync("site/policies/_data.yml")) as Partial<Data>;
            data = { ...data, ...policiesData };
        } else {
            data.layout = data.layout || 'layouts/foundation.vto';
            data.cssclasses = (metaData.cssclasses || []).concat(jsonData.cssclasses || []);
        }
        // merge rather than replace

        const content = data.content as string;
        data.content = content.replace(EMAIL_REGEX, FORM_REPLACEMENT);
        console.log(" 📄 ", data.layout, data.url, data.ord);
        yield data;
    }
}

export async function toRawData(path: string, extractFrontMatter = true): Promise<Partial<Data>> {
    const content = isBinaryFile(path)
        ? await Deno.readFile(path)
        : await Deno.readTextFile(path);

    if (extractFrontMatter && getExt(path) === '.md' && test(content as string)) {
        const extracted: RawData = extract<RawData>(content as string);
        const bodyContent = extracted.body as string;
        return {
            ...extracted.attrs,
            content: bodyContent,
        };
    }

    return {
        content
    };
}

export function getExt(path: string): string {
    return extname(path);
}

export function isBinaryFile(path: string): boolean {
    const ext = getExt(path).toLowerCase();
    return BINARY_EXTENSIONS.includes(ext);
}

export function extractTitle(data: Partial<Data>) {
    const content = data.content as string;
    const match = content.match(/^#\s+(.*)$/m);
    if (match) {
        data.title = match[1].replace(/^Commonhaus Foundation /, '');
    } else {
        data.title = data.basename;
    }
}

async function fileExists(path: string): Promise<boolean> {
    try {
      const stat = await Deno.stat(path);
      return stat.isFile; // Check if it's a file
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return false; // File does not exist
      }
      throw error; // Re-throw other errors
    }
  }

export const BINARY_EXTENSIONS = [
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.webp',
    '.ico',
    '.avif',
    '.pdf',
    '.mp4',
    '.webm',
    '.mov',
    '.zip',
    '.gz',
    '.tar',
    '.tgz',
    '.rar',
    '.7z',
    '.bz2',
    '.mp3',
    '.wav',
    '.ogg',
    '.flac',
];