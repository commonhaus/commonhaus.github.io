import { COMMONHAUS, INFO, appendData, load, testData } from './lib/stores.ts';
import app from "./member.ts";

const user = {
    "id": 808713,
    "login": "commonhaus-bot",
    "nodeId": "U_kgDOCVHtbA",
    "name":  "Commonhaus Bot",
    "avatarUrl": "https://avatars.githubusercontent.com/u/156364140?v=4",
    "company": "Commonhaus Foundation",
    "roles": [
    ]
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

const application = {
    "created": "2025-06-03",
    "contributions": "I am a bot",
    "additionalNotes": "other things"
}

// Define your namespace
window["commonhaus"] = {
    blank: async () => {
        await testData(COMMONHAUS, 200, "OK", {
            HAUS: {},
            INFO: {},
            ALIAS: {},
            APPLY: {}
        });
    },
    reset: async () => {
        await load(INFO + "?refresh=true");
        await load(COMMONHAUS + "?refresh=true");
    },
    unauth: async () => {
        await testData(COMMONHAUS, 403, "FORBIDDEN", {
            HAUS: {
                ...haus
            },
            INFO: {
                ...user,
            }
        });
    },
    unknown: async () => {
        await testData(COMMONHAUS, 200, "OK", {
            HAUS: {
                ...haus
            },
            INFO: {
                ...user,
            }
        });
    },
    sponsor: async () => {
        await testData(COMMONHAUS, 200, "OK", {
            HAUS: {
                ...haus,
                "status": "SPONSOR",
            },
            INFO: {
                ...user,
                roles: ["sponsor"]
            },
            ALIAS: {
            }
        });
    },
    member: async () => {
        await testData(COMMONHAUS, 200, "OK", {
            HAUS: {
                "status": "ACTIVE",
                "services": {
                    "forwardEmail": {
                    }
                },
                "goodUntil": {
                }
            },
            INFO: {
                ...user,
                "roles" : ["sponsor", "member"]
            },
            ALIAS: {
            }
        });
    },
    egc: async () => {
        await testData(COMMONHAUS, 200, "OK", {
            HAUS: {
                "status": "COMMITTEE",
                "services": {
                    "forwardEmail": {
                    }
                },
                "goodUntil": {
                }
            },
            INFO: {
                ...user,
                "roles" : ["sponsor", "member", "egc"]
            },
            ALIAS: {
            }
        });
    },
    cfc: async () => {
        await testData(COMMONHAUS, 200, "OK", {
            HAUS: {
                "status": "COMMITTEE",
                "services": {
                    "forwardEmail": {
                    }
                },
                "goodUntil": {
                }
            },
            INFO: {
                ...user,
                "roles" : ["sponsor", "member", "cfc"]
            },
            ALIAS: {
            }
        });
    },
    appendBylaws: async () => {
        await appendData("HAUS", {
            "goodUntil": {
                "attestation": {
                    "bylaws": {
                        "date": "2025-06-03",
                        "version": "cf-YYYY-MM-DD",
                        "withStatus": "COMMITTEE"
                    }
                }
            }
        });
    },
    appendCouncil: async () => {
        await appendData("HAUS", {
            "goodUntil": {
                "attestation": {
                    "council": {
                        "date": "2025-06-03",
                        "version": "cf-YYYY-MM-DD",
                        "withStatus": "COMMITTEE"
                    },
                }
            }
        });
    },
    appendEgc: async () => {
        await appendData("HAUS", {
            "goodUntil": {
                "attestation": {
                    "egc": {
                        "date": "2025-06-03",
                        "version": "cf-YYYY-MM-DD",
                        "withStatus": "COMMITTEE"
                    },
                }
            }
        });
    },
    appendCoc: async () => {
        await appendData("HAUS", {
            "goodUntil": {
                "attestation": {
                    "coc": {
                        "date": "2025-06-03",
                        "version": "cf-YYYY-MM-DD",
                        "withStatus": "COMMITTEE"
                    },
                }
            }
        });
    },
    appendEmail: async () => {
        await appendData("HAUS", {
            "goodUntil": {
                "attestation": {
                    "email": {
                        "date": "2025-06-03",
                        "version": "fe-YYYY-MM-DD",
                        "withStatus": "COMMITTEE"
                    },
                }
            }
        });
    },
    appendAlias: async () => {
        await appendData("ALIAS", alias);
    },
    appendAppClear: async () => {
        await appendData("APPLY", {});
    },
    appendAppSubmitted: async () => {
        await appendData("APPLY", application);
    },
    appendAppFeedback: async () => {
        await appendData("APPLY", {
            "feedback": {
                "date": "2024-06-03",
                "htmlContent": "<p>Some feedback</p>"
            },
        });
    },
    appendAppUpdated: async () => {
        await appendData("APPLY", {
            "contributions": "Revise content",
            "updated": "2024-06-04"
        });
    },
    changeRoles: async (roles, status) => {
        await appendData("INFO", {
            roles
        });
        await appendData("HAUS", {
            status
        });
    },
    // Define more methods...
};



