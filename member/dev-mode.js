// This is a find-replace extension of stores.ts for local dev-mode testing

// Namespace. See site/_plugins/devBackend.ts when working w/ serve-all
window["commonhaus"] = {
    blank: () => {
        clear();
    },
    cfc: async () => await post(COMMONHAUS + "/status?role=cfc"),
    contributor: async () => await post(COMMONHAUS + "/status?role=contributor"),
    egc: async () => await post(COMMONHAUS + "/status?role=egc"),
    member: async () => await post(COMMONHAUS + "/status?role=member"),
    sponsor: async () => await post(COMMONHAUS + "/status?role=sponsor"),
    refresh: async () => await post(COMMONHAUS + "/status?refresh=true"),
    get403: async () => {
        await testData('GET', COMMONHAUS, 403, "FORBIDDEN", {});
    },
    get404: async () => {
        await testData('GET', COMMONHAUS, 404, "NOT_FOUND", {});
    },
    get500: async () => {
        await testData('GET', COMMONHAUS, 500, "INTERNAL_SERVER_ERROR", {});
    },
    get503: async () => {
        await testData('GET', COMMONHAUS, 503, "SERVICE_UNAVAILABLE", {});
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
        await testData('POST', COMMONHAUS, 503, "SERVICE_UNAVAILABLE", {});
    },
    alias_verify: async () => await load(ALIASES + "?verify=true"),
    // Define more methods...
};

console.log("DEV MODE: MOCKED BACKEND");
console.log("Use functions on the window to trigger server behavior", window.commonhaus);
