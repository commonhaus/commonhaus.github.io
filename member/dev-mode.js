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
    // 400 regression baseline for the alias-password-management QRSPI change.
    // Real backend 400 bodies today: INFO/COMMONHAUS never 400; APPLY and
    // COMMONHAUS/attest return a bare 400 with no body; only ALIASES sends
    // {"ERROR": "..."}. Run these before and after touching stores.ts's
    // 400 handling and diff the console output + store state (errorFlags,
    // applicationData) to confirm non-ALIASES paths are unchanged.
    info400: async () => {
        await testData('GET', INFO, 400, "BAD_REQUEST", undefined);
    },
    apply400: async () => {
        await testData('POST', APPLY, 400, "BAD_REQUEST", undefined);
    },
    commonhaus400: async () => {
        await testData('POST', COMMONHAUS, 400, "BAD_REQUEST", undefined);
    },
    alias400: async () => {
        await testData('POST', ALIASES, 400, "BAD_REQUEST", {
            ERROR: "recipients exceeds max_recipients_per_alias (10) for name@commonhaus.dev",
        });
    },
    alias400NoReason: async () => {
        // Not currently produced by the real backend for ALIASES, but
        // exercises the fallback (no ERROR field) path on this URI too.
        await testData('POST', ALIASES, 400, "BAD_REQUEST", {});
    },
    // Mirrors devBackend.ts's /member/aliases empty-recipients check
    // (site/_plugins/devBackend.ts), which the UI's own client-side
    // validation (isValidRecipientList) never lets a real request reach.
    // NOTE: called from the console, not from an open dialog's submit
    // event, so this only verifies stores.ts's handling (console output,
    // errorFlags/aliasTargets state) — no editError/createError is set and
    // no dialog is open to show it, since those are populated by
    // ForwardEmail.svelte's submitEditAlias/submitCreateAlias catch
    // blocks, which only run in response to a real dialog submit.
    aliasEmpty400: async () => {
        await testData('POST', ALIASES, 400, "BAD_REQUEST", {
            ERROR: "alias must have at least one recipient or have_imap enabled",
        });
    },
    // postPassword does its own fetch/parsing (see stores.ts) rather than
    // going through handleResponse — the password endpoint's success body
    // reuses the "ALIAS" envelope key for a {username, password} payload,
    // a different shape than the alias-directory endpoint's Record<string,
    // Alias>, so it can't share handleResponse's generic key dispatch
    // without corrupting aliasTargets. testData()/handleResponse can't
    // exercise this path at all — call postPassword directly instead,
    // against devBackend.ts's real malformed-alias check (§5.3), using an
    // alias the UI's own selection flow would never let you submit.
    // NOTE: same caveat as aliasEmpty400 — called from the console, not
    // from ManagePassword's submit event, so the thrown error only shows
    // in the console log below, not in passwordError/the modal.
    passwordAlias400: async () => {
        try {
            await postPassword({
                alias: "not-an-email",
                new_password: "test-password-123",
                reset: false,
            });
        } catch (error) {
            console.log("postPassword threw:", error.message);
        }
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
    dumpState: () => {
        const state = {
            gitHubData: get(gitHubData),
            commonhausData: get(commonhausData),
            applicationData: get(applicationData),
            aliasTargets: get(aliasTargets),
            errorFlags: get(errorFlags),
        };
        console.log("STATE", JSON.stringify(state, null, 2));
        return state;
    },
    // Define more methods...
};

console.log("DEV MODE: MOCKED BACKEND");
console.log("Use functions on the window to trigger server behavior", window.commonhaus);
