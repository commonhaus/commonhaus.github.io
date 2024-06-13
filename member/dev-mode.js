import { APPLY, COMMONHAUS, appendData, clear, init, testData } from './lib/stores.ts';
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
    blank: () => {
        clear();
    },
    reset: async () => {
        clear();
        await refresh();
    },
    get404: async () => {
        await testData('GET', COMMONHAUS, 404, "NOT_FOUND", {});
    },
    get500: async () => {
        await testData('GET', COMMONHAUS, 500, "INTERNAL_SERVER_ERROR", {});
    },
    get503: async () => {
        await testData('GET', COMMONHAUS, 503, "GATEWAY_TIMEOUT", {});
    },
    post404: async () => {
        await testData('POST', COMMONHAUS, 404, "NOT_FOUND", {});
    },
    post409: async () => {
        await testData('POST', COMMONHAUS, 409, "CONFLICT", {
            HAUS: appendData("HAUS", {}),
        });
    },
    post429: async () => {
        await testData('POST', APPLY, 429, "TOO_MANY_REQUESTS", {
            HAUS: appendData("HAUS", {}),
            APPLY: appendData("APPLY", {}),
        });
    },
    post500: async () => {
        await testData('POST', COMMONHAUS, 500, "INTERNAL_SERVER_ERROR", {});
    },
    post503: async () => {
        await testData('POST', COMMONHAUS, 503, "GATEWAY_TIMEOUT", {});
    },
    unauth: async () => {
        await testData('GET', COMMONHAUS, 403, "FORBIDDEN", {
            HAUS: {
                ...haus
            },
            INFO: {
                ...user,
            }
        });
    },
    unknown: async () => {
        await testData('GET', COMMONHAUS, 200, "OK", {
            HAUS: {
                ...haus
            },
            INFO: {
                ...user,
            }
        });
    },
    sponsor: async () => {
        await testData('GET', COMMONHAUS, 200, "OK", {
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
        await testData('GET', COMMONHAUS, 200, "OK", {
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
        await testData('GET', COMMONHAUS, 200, "OK", {
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
        await testData('GET', COMMONHAUS, 200, "OK", {
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
        await testData('GET', COMMONHAUS, 200, "OK", {
            HAUS: appendData("HAUS", {
                "goodUntil": {
                    "attestation": {
                        "bylaws": {
                            "date": "2025-06-03",
                            "version": "cf-YYYY-MM-DD",
                            "withStatus": "COMMITTEE"
                        }
                    }
                }
            })
        });
    },
    appendCouncil: async () => {
        await testData('GET', COMMONHAUS, 200, "OK", {
            HAUS: appendData("HAUS", {
                "goodUntil": {
                    "attestation": {
                        "council": {
                            "date": "2025-06-03",
                            "version": "cf-YYYY-MM-DD",
                            "withStatus": "COMMITTEE"
                        },
                    }
                }
            })
        });
    },
    appendEgc: async () => {
        await testData('GET', COMMONHAUS, 200, "OK", {
            HAUS: appendData("HAUS", {
                "goodUntil": {
                    "attestation": {
                        "egc": {
                            "date": "2025-06-03",
                            "version": "cf-YYYY-MM-DD",
                            "withStatus": "COMMITTEE"
                        },
                    }
                }
            })
        });
    },
    appendCoc: async () => {
        await testData('GET', COMMONHAUS, 200, "OK", {
            HAUS: appendData("HAUS", {
                "goodUntil": {
                    "attestation": {
                        "coc": {
                            "date": "2025-06-03",
                            "version": "cf-YYYY-MM-DD",
                            "withStatus": "COMMITTEE"
                        },
                    }
                }
            })
        });
    },
    appendEmail: async () => {
        await testData('GET', COMMONHAUS, 200, "OK", {
            HAUS: appendData("HAUS", {
                "goodUntil": {
                    "attestation": {
                        "email": {
                            "date": "2025-06-03",
                            "version": "fe-YYYY-MM-DD",
                            "withStatus": "COMMITTEE"
                        },
                    }
                }
            })
        });
    },
    appendAlias: async () => {
        await testData('GET', COMMONHAUS, 200, "OK", {
            ALIAS: appendData("ALIAS", alias)
        });
    },
    appendAppClear: async () => {
        await testData('GET', COMMONHAUS, 200, "OK", {
            APPLY: appendData("APPLY", {})
        });
    },
    appendAppSubmitted: async () => {
        await testData('GET', COMMONHAUS, 200, "OK", {
            APPLY: appendData("APPLY", application)
        });
    },
    appendAppFeedback: async () => {
        await testData('GET', COMMONHAUS, 200, "OK", {
            APPLY: appendData("APPLY", {
                "feedback": {
                    "date": "2024-06-03",
                    "htmlContent": "<p>Some feedback</p>"
                },
            })
        });
    },
    appendAppUpdated: async () => {
        await testData('GET', COMMONHAUS, 200, "OK", {
            APPLY: appendData("APPLY", {
                "contributions": "Revise content",
                "updated": "2024-06-04"
            })
        });
    },
    changeRoles: async (roles, status) => {
        await testData('GET', COMMONHAUS, 200, "OK", {
            INFO: appendData("INFO", {
                    roles
            }),
            HAUS: appendData("HAUS", {
                status
            })
        });
    },
    // Define more methods...
};



