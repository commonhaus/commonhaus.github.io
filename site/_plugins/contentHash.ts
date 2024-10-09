import binaryLoader from "lume/core/loaders/binary.ts";
import { getPathAndExtension } from "lume/core/utils/path.ts";
import { merge } from "lume/core/utils/object.ts";
import { encodeHex } from "lume/deps/hex.ts";
import { posix } from "lume/deps/path.ts";
import modifyUrls from "lume/plugins/modify_urls.ts";
import { Page } from "lume/core/file.ts";

export interface Options {
    attribute: string;
    hashLength: number;
}

const defaults: Options = {
    attribute: "hash",
    hashLength: 10,
};

const cache = new Map<string, Promise<string>>();

export default function (userOptions?: Partial<Options>): Lume.Plugin {
    const options = merge(defaults, userOptions);

    return (site: Lume.Site) => {
        const selector = `[${options.attribute}]`;

        site.use(modifyUrls({ fn: replaceUrls }));

        async function replaceUrls(url: string, page: Page, element: Element) {
            if (url && element.matches(selector)) {
                return await addHashToUrl(url, page);
            }
            return url;
        }

        async function addHashToUrl(url: string, page: Page) {
            if (page.data.url && url.startsWith(".")) {
                url = posix.join(page.data.url, url);
            }
            url = posix.join("/", url);

            if (!cache.has(url)) {
                cache.set(url, generateHash(url));
            }

            const hash = await cache.get(url)!;
            const [path, ext] = getPathAndExtension(url);
            return `${path}-${hash}${ext}`;
        }

        async function generateHash(url: string) {
            const content = await fetchContent(url);
            const contentHash = await computeHash(content);
            updateFileUrl(url, contentHash);
            return contentHash;
        }

        async function fetchContent(url: string): Promise<Uint8Array> {
            const content = await site.getContent(url, binaryLoader);
            if (!content) {
                throw new Error(`Unable to find the file "${url}"`);
            }

            return typeof content === "string"
                    ? new TextEncoder().encode(content)
                    : content as Uint8Array;
        }

        function updateFileUrl(url: string, hash: string) {
            const [path, ext] = getPathAndExtension(url);
            const page = site.pages.find((page) => page.data.url === url);
            if (page) {
                page.data.url = `${path}-${hash}${ext}`;
                return;
            }

            const staticFile = site.files.find((file) => file.outputPath === url);
            if (staticFile) {
                staticFile.outputPath = `${path}-${hash}${ext}`;
                return;
            }

            throw new Error(`Unable to find the file "${url}"`);
        }

        async function computeHash(content: Uint8Array): Promise<string> {
            const hashBuffer = await crypto.subtle.digest("SHA-1", content);
            const hash = encodeHex(new Uint8Array(hashBuffer));
            return hash.substring(0, options.hashLength);
        }
    };
}