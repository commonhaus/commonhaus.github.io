import { Writable, writable, derived, get } from "svelte/store";
import { Alias } from "../@types/forwardemail.d.ts";
import {
    ApplicationData,
    CommonhausMember,
    DataType,
    ErrorFlags,
    ErrorStatus,
    GitHubUser,
} from "../@types/data.d.ts";

export const uriBase = window.location.hostname.includes("localhost")
    ? "http://localhost:8082/member"
    : "https://haus-keeper.commonhaus.org/member";

export const INFO = uriBase + "/me";
export const ALIASES = uriBase + "/aliases";
export const COMMONHAUS = uriBase + "/commonhaus";
export const APPLY = uriBase + "/apply";

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

export const load = async (uri: string): Promise<AbortController> => {
    const controller = new AbortController();
    const signal = controller.signal;

    try {
        const response = await fetch(uri, {
            credentials: "include",
            mode: "cors",
            signal
        });

        await handleResponse(uri, response, 'GET');
    } catch (error) {
        handleErrors(uri, error);
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

        await handleResponse(uri, response, 'POST');
    } catch (error) {
        handleErrors(uri, error);
    }
    outboundPost.set(false);
}

const uri = (k: string) => {
    switch (k) {
        case "INFO":
            return INFO;
        case "APPLY":
            return APPLY;
        case "ALIAS":
            return ALIASES;
        default:
            return COMMONHAUS;
    }
};

export const testData = async (uri: string, status: number, message: string, data: unknown) => {
    try {
        const response = new Response(JSON.stringify(data), {
            status,
            statusText: message,
            headers: {
                'Content-type': 'application/json'
            }
        });
        console.debug("TEST", data, uri, status, message);
        await handleResponse(uri, response, 'POST');
    } catch (error) {
        handleErrors(uri, error);
    }
}

export const appendData = async (key: string, data: object) => {
    try {
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

        const response = new Response(JSON.stringify(newData), {
            status: 200,
            statusText: "OK",
            headers: {
                'Content-type': 'application/json'
            }
        });
        console.debug("APPEND", newData);
        await handleResponse(uri(key), response, 'POST');
    } catch (error) {
        handleErrors(uri(key), error);
    }
}

export const toastMessage = (type: string, message: string) => {
    toaster.set({ show: true, message, type });

    setTimeout(() => {
        toaster.set({ show: false, message: '', type: '' });
    }, 3000);
};

const handleResponse = async (uri: string, response: Response, method: string) => {
    handleErrorResponse(uri, response);

    errorFlag("unknown", ErrorStatus.OK);

    try {
        if (response.body) {
            const message = await response.json();
            for (const [key, value] of Object.entries(message)) {
                if (key === "INFO") {
                    console.debug("INFO", value);
                    gitHubData.set(value as GitHubUser);
                    errorFlag("info", ErrorStatus.OK);
                } else if (key == "APPLY") {
                    console.debug("APPLY", value);
                    applicationData.set(value as ApplicationData);
                    errorFlag("apply", ErrorStatus.OK);
                    errorFlag("unknown", ErrorStatus.OK);
                } else if (key === "HAUS") {
                    console.debug("HAUS", value);
                    commonhausData.set(value as CommonhausMember);
                    errorFlag("haus", ErrorStatus.OK);
                    errorFlag("unknown", ErrorStatus.OK);
                } else if (key === "ALIAS") {
                    console.debug("ALIAS", value);
                    aliasTargets.set(value as Record<string, Alias>);
                    errorFlag("alias", ErrorStatus.OK);
                }
            }
            if (method === 'POST') {
                toastMessage("success", "So far, so good.");
            }
        }
    } catch (error) {
        handleErrors(uri, error);
    }
}

const handleErrorResponse = (uri: string, response: Response) => {
    if (response.status === 429) {
        console.debug("Another membership application is in progress");
    } else if (response.status === 503) {
        console.debug("Service unavailable: trouble with the GitHub API");
        toastMessage("caution", "Our connection to GitHub is having a hiccup. Please try again in a little while.");
    } else if (response.status == 404) {
        console.debug("Not found");
        if (uri.includes(APPLY)) {
            applicationData.set({});
        }
    } else if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }
}

const handleErrors = (uri: string, error: Error) => {
    if (uri.includes(INFO)) {
        errorFlag("info", flagValue(error));
    } else if (uri.includes(APPLY)) {
        errorFlag("apply", flagValue(error));
    } else if (uri.includes(COMMONHAUS)) {
        errorFlag("haus", flagValue(error));
    } else if (uri.includes(ALIASES)) {
        errorFlag("alias", flagValue(error));
    }
}

const flagValue = (error: Error): ErrorStatus => {
    if (error.name === 'AbortError') {
        console.debug('Fetch aborted');
    } else {
        console.error(error.message);
        if (error.message.startsWith("403")) {
            return ErrorStatus.FORBIDDEN;
        } else if (error.message.startsWith("5")) {
            toastMessage("caution", "It seems we've hit a snag on our end. If you could report this, we'd appreciate it!");
            return ErrorStatus.SERVER;
        }
    }
    toastMessage("caution", "Oops, something unexpected happened. If you could report this, we'd be grateful!");
    return ErrorStatus.OTHER;
}
