import Site from "lume/core/site.ts";
import { parse } from "@std/yaml";
import { Page } from "lume/core/file.ts";

interface Author {
    login: string;
    url: string;
    avatar: string;
}

const AUTHOR_DATA: Record<string, Author> = parse(Deno.readTextFileSync("site/_generated/authors.yml")) as Record<string, Author>;

export default function () {

    return (site: Site) => {
        console.log("Author metadata");
        site.filter("authorAvatar", (login: string) => {
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