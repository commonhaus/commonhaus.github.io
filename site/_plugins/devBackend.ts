import { xml_node } from "https://deno.land/x/xml@6.0.4/parse.ts";
import { Middleware } from "lume/core/server.ts";

const devMode = Deno.env.get("VITE_APP_DEV_MODE") === "true";
const mockBackend = Deno.env.get("MOCK_BACKEND") === "true";
const MOCK_MAX_RECIPIENTS_PER_ALIAS = 10;

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
            ],
            "has_imap": false
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
                // { "commonhaus-bot": { recipients: ["something@other"], has_imap: true } }
                const update = body["commonhaus-bot"] || body["commonhaus-bot@commonhaus.dev"] || {};
                const recipients = Array.isArray(update) ? update : update.recipients || [];
                const hasImap = Array.isArray(update) ? false : update.has_imap === true;

                if (recipients.length === 0 && !hasImap) {
                    return new Response(JSON.stringify({
                        "ERROR": "alias must have at least one recipient or have_imap enabled"
                    }), {
                        status: 400,
                        statusText: "BAD_REQUEST",
                        headers: {
                            'Content-type': 'application/json'
                        }
                    });
                }
                if (recipients.length > MOCK_MAX_RECIPIENTS_PER_ALIAS) {
                    return new Response(JSON.stringify({
                        "ERROR": `recipients exceeds max_recipients_per_alias (${MOCK_MAX_RECIPIENTS_PER_ALIAS}) for commonhaus-bot@commonhaus.dev`
                    }), {
                        status: 400,
                        statusText: "BAD_REQUEST",
                        headers: {
                            'Content-type': 'application/json'
                        }
                    });
                }

                state.ALIAS = { ...alias };
                state.ALIAS["commonhaus-bot@commonhaus.dev"].recipients = recipients;
                state.ALIAS["commonhaus-bot@commonhaus.dev"].has_imap = hasImap;
                state.HAUS.services.forwardEmail.active = recipients.length > 0;
            }
            if (state.HAUS.services.forwardEmail?.altAlias) {
                for (const x of state.HAUS.services.forwardEmail.altAlias) {
                    state.ALIAS[x] = {
                        "name": `alt alias ${x}`,
                        "is_enabled": false,
                        "recipients": [x]
                    };
                }
            }
            const commonhaus = Object.keys(state.ALIAS).find((key) => key.endsWith("@commonhaus.dev"));
            state.HAUS.services.forwardEmail.hasDefaultAlias = !!commonhaus;

            return stateResponse(request);
        } else if (request.url.endsWith("/member/aliases?verify=true")) {
            state.ALIAS["commonhaus-bot@commonhaus.dev"].verified_recipients =
                state.ALIAS["commonhaus-bot@commonhaus.dev"].recipients;
            return stateResponse(request);
        } else if (request.url.endsWith("/member/aliases/password")) {
            console.log("password", request.method);
            const body = request.method === "POST" ? await request.json() : {};
            const passwordAlias = body.alias || "commonhaus-bot@commonhaus.dev";
            if (!/^[^\s@]+@[^\s@]+$/.test(passwordAlias)) {
                return new Response(JSON.stringify({
                    "ERROR": "alias is not a valid email address"
                }), {
                    status: 400,
                    statusText: "BAD_REQUEST",
                    headers: {
                        'Content-type': 'application/json'
                    }
                });
            }
            return new Response(JSON.stringify({
                "ALIAS": {
                    "username": passwordAlias,
                    "password": body.new_password || "mock-generated-password"
                }
            }), {
                status: 200,
                statusText: "OK",
                headers: {
                    'Content-type': 'application/json'
                }
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
                state.ALIAS = {};
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
            if (request.url.includes("role=contributor")) {
                state.INFO.roles.push("contributor");
                state.HAUS.status = "CONTRIBUTOR";
                state.HAUS.services.forwardEmail.hasDefaultAlias = false;
                state.HAUS.services.forwardEmail.altAlias = [
                  "postmaster@project.org",
                  "root@project.org",
                  "support@project.org",
                  "translators@project.org",
                  "webmaster@project.org",
                  "ci@project.org",
                  "training@project.org",
                  "paypal@project.org",
                  "admin@project.org",
                  "all@project.org"
                ];
                state.ALIAS = {};
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
