import { writable, derived, get } from "svelte/store";
import { Alias } from "../@types/forwardemail.d.ts";
import {
    ApplicationData,
    CommonhausMember,
    ErrorFlags,
    ErrorStatus,
    GitHubUser,
} from "../@types/data.d.ts";

export const uriBase = window.location.hostname.includes("localhost")
    ? "http://localhost:8082/member"
    : "https://haus-keeper.commonhaus.org/member";

export const ALIASES = uriBase + "/aliases";
export const APPLY = uriBase + "/apply";
export const COMMONHAUS = uriBase + "/commonhaus";
export const COUNCIL = uriBase + "/council";
export const INFO = uriBase + "/me";
export const REFRESH = uriBase + "/commonhaus/status?refresh=true";

export const gitHubData = writable<GitHubUser>({});
export const commonhausData = writable<CommonhausMember>({});
export const applicationData = writable<ApplicationData>({});

export const errorFlags = writable<ErrorFlags>({});
export const outboundPost = writable<boolean>(false);

export const hasResponse = derived([gitHubData, errorFlags], ([$data, $errors]) => $data.name || $errors.unknown);
export const knownUser = derived([gitHubData, errorFlags], ([$data, $errors]) => $data.name && !$errors.unknown);

export const cookies = writable<Record<string, string>>({});
export const aliasTargets = writable<Record<string, Alias>>({});

export const toaster = writable({ show: false, message: '', type: '' });

export const fetchLatestStatus = async () => {
    const URI = `${COMMONHAUS}/status`;
    const body = {};

    await post(URI, body);
}

// watch for hash changes
export const location = writable(
    window.document.location.hash,
    function start(set) {
        const update = () => {
            set(window.document.location.hash);
        };
        window.addEventListener("hashchange", update, false);
        return function stop() {
            window.removeEventListener("hashchange", update, false);
        };
    },
);

export const getCookies = (cookieStr: string): void => {
    const parsedCookies = cookieStr
        .split(";")
        .map((str) => {
            const p = str.indexOf("=");
            return [str.substring(0, p).trim(), str.substring(p + 1).trim()];
        })
        .reduce((acc: Record<string, string>, curr) => {
            acc[curr[0]] = curr[1];
            return acc;
        }, {});

    cookies.update((_) => (parsedCookies));
}

const errorFlag = (flag: keyof ErrorFlags, value: ErrorStatus) => {
    errorFlags.update((flags) => {
        const newFlags = { ...flags };
        if (value === ErrorStatus.OK) {
            delete newFlags[flag];
        } else {
            newFlags[flag] = value;
        }
        return newFlags;
    });
};

export const isForbidden = (e: ErrorStatus): boolean => {
    return e !== undefined && e === ErrorStatus.FORBIDDEN;
}

export const hasError = (e: ErrorStatus): boolean => {
    return e !== undefined && e !== ErrorStatus.OK && e !== ErrorStatus.FORBIDDEN;
}

export const hasOtherError = (e: ErrorStatus): boolean => {
    return e !== undefined && e === ErrorStatus.OTHER;
}

export const isOk = (e: ErrorStatus): boolean => {
    return e === undefined || e === ErrorStatus.OK;
}

export const clear = () => {
    console.debug("Clearing data");
    gitHubData.set({});
    applicationData.set({});
    commonhausData.set({});
    aliasTargets.set({});
    errorFlags.set({});
}

export const init = async () => {
    console.debug("Initializing user data");
    const controller1 = await load(INFO);
    const controller2 = await load(COMMONHAUS);

    return () => {
        controller1.abort();
        controller2.abort();
    };
}

export const refresh = async () => {
    console.debug("Refreshing user data");
    await post(REFRESH, {});
}

export const load = async (uri: string): Promise<AbortController> => {
    const controller = new AbortController();
    const signal = controller.signal;

    try {
        const response = await fetch(uri, {
            credentials: "include",
            mode: "cors",
            signal
        });

        await handleResponse('GET', uri, response);
    } catch (error) {
        handleErrors('GET', uri, error);
    }
    return controller;
}

export const post = async (uri: string, body: unknown): Promise<void> => {
    outboundPost.set(true);
    try {
        const response = await fetch(uri, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
            credentials: "include",
            mode: "cors"
        });

        await handleResponse('POST', uri, response);
    } catch (error) {
        handleErrors('POST', uri, error);
    }
    outboundPost.set(false);
}

const handleResponse = async (method: string, uri: string, response: Response) => {
    processResponseStatus(method, uri, response);
    errorFlag("unknown", ErrorStatus.OK);

    try {
        const text = await response.text();
        if (text) {
            const message = JSON.parse(text);
            for (const [key, value] of Object.entries(message)) {
                console.debug(key, value);
                if (key === "INFO") {
                    gitHubData.set(value as GitHubUser);
                    errorFlag("info", ErrorStatus.OK);
                } else if (key == "APPLY") {
                    applicationData.set(value as ApplicationData);
                    errorFlag("apply", ErrorStatus.OK);
                    errorFlag("unknown", ErrorStatus.OK);
                } else if (key === "HAUS") {
                    commonhausData.set(value as CommonhausMember);
                    errorFlag("haus", ErrorStatus.OK);
                    errorFlag("unknown", ErrorStatus.OK);
                } else if (key === "ALIAS") {
                    aliasTargets.set(value as Record<string, Alias>);
                    errorFlag("alias", ErrorStatus.OK);
                }
            }
        }
    } catch (error) {
        handleErrors(method, uri, error);
    }
}

const processResponseStatus = (method: string, uri: string, response: Response) => {
    if (response.status == 404) {
        console.debug("Not found");
        if (uri.includes(APPLY)) {
            applicationData.set({});
        }
    } else if (response.status === 409) {
        console.error("A conflict occurred")
        toastMessage("warning",
            "There was a conflict when trying to save your changes. We've pulled the latest data for you. Try again?");
    } else if (response.status === 429) {
        if (uri.includes(APPLY)) {
            toastMessage("warning", "An update is already in progress, give it a moment.");
        }
    } else if (response.status === 503) {
        console.debug("Service unavailable: trouble with the GitHub API");
        toastMessage("caution", "Our connection to GitHub is having a hiccup. Please try again in a little while.");
    } else if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    } else if (method === 'POST') {
        toastMessage("success", "So far, so good.");
    }
}

const handleErrors = (method: string, uri: string, error: Error) => {
    const status = flagValue(error);
    if (method === 'GET') {
        if (uri.includes(INFO)) {
            errorFlag("info", status);
        } else if (uri.includes(APPLY)) {
            errorFlag("apply", status);
        } else if (uri.includes(COMMONHAUS)) {
            errorFlag("haus", status);
        } else if (uri.includes(ALIASES)) {
            errorFlag("alias", status);
        }
    } else if (status === ErrorStatus.SERVER) {
        toastMessage("caution", "It seems we've hit a snag on our end. If you could report this, we'd appreciate it!");
    } else if (status === ErrorStatus.OTHER) {
        toastMessage("caution", "Oops, something unexpected happened. If you could report this, we'd be grateful!");
    }
}

const flagValue = (error: Error): ErrorStatus => {
    if (error.name === 'AbortError') {
        console.debug('Fetch aborted');
        return ErrorStatus.ABORT;
    }
    console.error(error);
    if (error.message.startsWith("403")) {
        return ErrorStatus.FORBIDDEN;
    } else if (error.message.startsWith("5")) {
        return ErrorStatus.SERVER;
    }
    return ErrorStatus.OTHER;
}

export const toastMessage = (type: string, message: string) => {
    toaster.set({ show: true, message, type });

    setTimeout(() => {
        toaster.set({ show: false, message: '', type: '' });
    }, type === 'success' ? 3000 : 4000);
};

// ---- Testing

export const testData = async (method: string, uri: string, status: number, message: string, data: unknown) => {
    try {
        const response = new Response(JSON.stringify(data), {
            status,
            statusText: message,
            headers: {
                'Content-type': 'application/json'
            }
        });
        console.debug("TEST", data, uri, status, message);
        await handleResponse(method, uri, response);
    } catch (error) {
        handleErrors(method, uri, error);
    }
}

export const appendData = (key: string, data: object) => {
    const newData: Record<string, object> = {};
    if (key === "INFO") {
        newData[key] = { ...get(gitHubData), ...data };
    } else if (key == "APPLY") {
        newData[key] = { ...get(applicationData), ...data };
    } else if (key === "HAUS") {
        newData[key] = { ...get(commonhausData), ...data };
    } else if (key === "ALIAS") {
        newData[key] = { ...get(aliasTargets), ...data };
    }
    return newData;
};