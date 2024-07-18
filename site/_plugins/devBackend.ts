import { Middleware } from "lume/core/server.ts";

const devMode = Deno.env.get("VITE_APP_DEV_MODE") === "true";
const mockBackend = Deno.env.get("MOCK_BACKEND") === "true";

function createMockBackend(): Middleware {
    console.log("devMode:", devMode, "mockBackend:", mockBackend);
    if (!mockBackend) {
        return async (request, next) => {
            return await next(request);
        }
    }

    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    const dateString = date.toISOString().split('T')[0];

    const user = {
        "id": 808713,
        "login": "commonhaus-bot",
        "nodeId": "U_kgDOCVHtbA",
        "name":  "Commonhaus Bot",
        "avatarUrl": "https://avatars.githubusercontent.com/u/156364140?v=4",
        "company": "Commonhaus Foundation",
        "roles": []
    };

    const haus = {
        "status": "UNKNOWN",
        "services": {
            "forwardEmail": {
                "active": false
            }
        },
        "goodUntil": {
            "attestation": {
            }
        }
    };

    const alias = {
        "commonhaus-bot@commonhaus.dev": {
            "name": "commonhaus-bot",
            "description": "Commonhaus Bot",
            "is_enabled": false,
            "recipients": [
                "test@commonhaus.dev"
            ]
        }
    };

    const state: {
        HAUS?: any,
        INFO?: any,
        APPLY?: any,
        ALIAS?: any
    } = {
        HAUS: { ...haus },
        INFO: { ...user },
        APPLY: {},
        ALIAS: {}
    }

    function stateResponse(request: Request): Response {
        console.log(request.method, request.url, JSON.stringify(state, null, 2));
        state.INFO.roles = [...new Set(state.INFO.roles)];
        return new Response(JSON.stringify(state), {
            status: 200,
            statusText: "OK",
            headers: {
                'Content-type': 'application/json'
            }
        });
    }

    return async (request, next) => {
        if (request.url.endsWith("/member/github")) {
            return new Response("{}", {
                status: 303,
                statusText: "SEE OTHER",
                headers: {
                    'Location': '/member/login',
                }
            });
        } else if (request.url.endsWith("/member/login")) {
            return new Response("{}", {
                status: 303,
                statusText: "SEE OTHER",
                headers: {
                    'Location': '/member/',
                    'Set-Cookie': "id=U_kgDOCVHtbA; Domain=localhost; Path=/; Secure; Max-Age=60"
                }
            });
        } else if (request.url.endsWith("/member/me")) {
            // "INFO": {
            //     "id": 808713,
            //     "login": "ebullient",
            //     "nodeId": "MDQ6VXNlcjgwODcxMw==",
            //     "name": "Erin Schnabel",
            //     "avatarUrl": "https://avatars.githubusercontent.com/u/808713?v=4",
            //     "url": "https://github.com/ebullient",
            //     "roles": [
            //         "egc",
            //         "sponsor",
            //         "cfc"
            //     ],
            //     "hasApplication": false
            // }
            state.INFO = state.INFO || { ...user };
            return stateResponse(request);
        } else if (request.url.endsWith("/member/aliases")) {
            // "ALIAS": {
            //     "ebullient@commonhaus.dev": {
            //         "name": "ebullient",
            //         "description": "ebullient First Alias"
            //     }
            // }
            // "ALIAS": {
            //     "ebullient@commonhaus.dev": {
            //         "name": "ebullient",
            //         "description": "Erin Schnabel",
            //         "recipients": [
            //             "test@commonhaus.org"
            //         ],
            //         "has_recipient_verification": true
            //     }
            // }
            if (request.method === "POST" || request.method === "PUT") {
                const body = await request.json();
                // { "commonhaus-bot": [ "something@other" ] }
                const recipients = body["commonhaus-bot"] || body["commonhaus-bot@commonhaus.dev"] || [];
                state.ALIAS = { ...alias };
                state.ALIAS["commonhaus-bot@commonhaus.dev"].recipients = recipients;
                state.HAUS.services.forwardEmail.active = recipients.length > 0;
            }
            return stateResponse(request);
        } else if (request.url.endsWith("/member/aliases?verify=true")) {
            state.ALIAS["commonhaus-bot@commonhaus.dev"].verified_recipients =
                state.ALIAS["commonhaus-bot@commonhaus.dev"].recipients;
            return stateResponse(request);
        } else if (request.url.endsWith("/member/aliases/password")) {
            console.log("password", request.method);
            return new Response("{}", {
                status: 200,
                statusText: "OK"
            });
        } else if (request.url.endsWith("/member/apply")) {
            if (request.method === "POST" || request.method === "PUT") {
                const body = await request.text();
                const post = JSON.parse(body);
                state.APPLY = {
                    "created": new Date(),
                    "contributions": post.contributions,
                    "additionalNotes": post.additionalNotes
                }
                state.INFO.hasApplication = true;
            }
            return stateResponse(request);
        } else if (request.url.endsWith("/member/commonhaus/attest")) {
            // "goodUntil": {
            //     "attestation": {
            //         "coc": {
            //             "withStatus": "COMMITTEE",
            //             "date": "2025-06-20",
            //             "version": "cf-2024-06-07"
            //         },
            //         "email": {
            //             "withStatus": "COMMITTEE",
            //             "date": "2025-06-20",
            //             "version": "fe-2024-05-31"
            //         }
            //     }
            // },
            if (request.method === "POST") {
                // {"id":"coc","version":"cf-2024-06-07"}
                const body = await request.text();
                const post = JSON.parse(body);
                state.HAUS.goodUntil.attestation[post.id] = {
                    "date": dateString,
                    "version": post.version,
                    "withStatus": state.HAUS.status
                }
            }
            return stateResponse(request);
        } else if (request.url.includes("/member/commonhaus/status")) {
            if (request.url.includes("refresh=true")) {
                console.log("refreshing state");
                state.ALIASES = {};
                state.APPLY = {};
                state.HAUS = { ...haus };
                state.INFO = { ...user };
            }
            if (request.url.includes("role=sponsor")) {
                state.HAUS.status = "SPONSOR";
                state.INFO.roles.push("sponsor");
            }
            if (request.url.includes("role=member")) {
                state.HAUS.status = "ACTIVE";
                state.INFO.roles.push("member");
            }
            if (request.url.includes("role=egc")) {
                state.HAUS.status = "COMMITTEE";
                state.INFO.roles.push("egc");
            }
            if (request.url.includes("role=cfc")) {
                state.HAUS.status = "COMMITTEE";
                state.INFO.roles.push("cfc");
            }
            return stateResponse(request);
        } else if (request.url.endsWith("/member/commonhaus") && request.method === "GET") {
            return stateResponse(request);
        }

        return await next(request);
    };
}

export default function () {
    return {
        middlewares: [
            createMockBackend(),
        ],
    };
}