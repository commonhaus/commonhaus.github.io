import { crypto } from "jsr:@std/crypto";
import { encodeBase64 } from "jsr:@std/encoding/base64";
import { walk } from "@std/fs";
import { DOMParser, Element } from "jsr:@b-fuze/deno-dom";

const PUBLIC_FOLDER = "./public"; // Adjust path if necessary

const scriptHashes: Map<string, string[]> = new Map();
const styleHashes: Map<string, string[]> = new Map();

async function calculateCspHashes() {
    // Walk through all files in the public folder
    for await (const entry of walk(PUBLIC_FOLDER, { exts: ["html", "js"], includeDirs: false })) {
        const content = await Deno.readTextFile(entry.path);

        const parser = new DOMParser();
        const document = parser.parseFromString(content, "text/html");
        if (!document) {
            console.error("Failed to parse HTML file", entry.path);
            continue;
        }

        // Match inline <script> tags
        const scriptElements = document.querySelectorAll("script:not([src])");
        for (const script of scriptElements) {
            const scriptContent = script.textContent?.trim();
            if (!scriptContent || scriptContent.includes("@context")) {
                continue;
            }
            const contentBuffer = new TextEncoder().encode(scriptContent);
            const fileHashBuffer = await crypto.subtle.digest("SHA-256", contentBuffer);
            const base64Encoded = encodeBase64(fileHashBuffer);
            const sha = `'sha256-${base64Encoded}'`;
            const values = scriptHashes.get(sha) || [];
            if (values.length == 0) {
                values.push(scriptContent.substring(0,100));
                console.log("script", entry.path, `\n\t${sha}\n\t\t`, scriptContent.substring(0,100));
                scriptHashes.set(sha, values);
            }
        }

        // Match inline <style> tags
        const elementsWithStyle = document.querySelectorAll("[style]");
        for (const element of elementsWithStyle) {
            const styleContent = element.getAttribute("style")?.trim();
            if (!styleContent) {
                continue;
            }

            const contentBuffer = new TextEncoder().encode(styleContent);
            const fileHashBuffer = await crypto.subtle.digest("SHA-256", contentBuffer);
            const base64Encoded = encodeBase64(fileHashBuffer);
            const sha = `'sha256-${base64Encoded}'`;
            const values = styleHashes.get(sha) || [];
            if (values.length == 0) {
                values.push(styleContent.substring(0,100));
                console.log("style", entry.path, `\n\t${sha}\n\t\t`, styleContent.substring(0,100));
                styleHashes.set(sha, values);
            }
        }
    }
}

async function main() {
    await calculateCspHashes();
    console.log("CSP Hashes for Inline Scripts:");
    console.log([ ... scriptHashes.keys() ].sort().join("\n"));
    console.log("\nCSP Hashes for Inline Styles:");
    console.log([ ... styleHashes.keys() ].sort().join("\n"));
}

main().catch((err) => console.error(err));