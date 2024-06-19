import Site from "lume/core/site.ts";
import { safeLoad } from "https://deno.land/x/js_yaml_port@3.14.0/js-yaml.js";
import { Data, Page } from "lume/core/file.ts";

interface Author {
    login: string;
    url: string;
    avatar: string;
}

const AUTHOR_DATA: Record<string, Author> = safeLoad(Deno.readTextFileSync("site/_generated/authors.yml"));

export default function () {

    return (site: Site) => {
        console.log("Author metadata");
        site.filter("authorAvatar", (page: Page) => {
            const login = page.data.author;
            const author = AUTHOR_DATA[login];
            if (author) {
                return `<a class="avatar" href="${author.url}" target="_top">
                    <img src="${author.avatar}" />
                    <span>${login}</span>
                </a>`;
            } else {
                return `<div class="avatar">${login}</div>\n`;
            }
        });
    };
}