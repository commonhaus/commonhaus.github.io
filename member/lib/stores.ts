import attestData from 'attest-yaml'; // see vite.config.ts
import { Writable, writable, derived, get } from "svelte/store";
import { Alias } from "../@types/forwardemail.d.ts";
import {
    AttestationInfo,
    AttestationText,
    CommonhausMember,
    ErrorFlags,
    GitHubUser,
    RoleDescription
} from "../@types/data.d.ts";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const uriBase = window.location.hostname.includes("localhost")
    ? "http://localhost:8082/member"
    : "https://haus-keeper.commonhaus.org/member";

export const INFO = uriBase + "/me";
export const ALIASES = uriBase + "/aliases";
export const COMMONHAUS = uriBase + "/commonhaus";

export const gitHubData: Writable<GitHubUser> = writable({});
export const commonhausData: Writable<CommonhausMember> = writable({});

export const errorFlags = writable<ErrorFlags>({});

export const hasResponse = derived([gitHubData, errorFlags], ([$data, $errors]) => $data.name || $errors.unknown);
export const knownUser = derived([gitHubData, errorFlags], ([$data, $errors]) => $data.name && !$errors.unknown);

export const cookies = writable<Record<string, string>>({});
export const aliasTargets = writable<Record<string, Alias>>({});

export const attestationInfo: AttestationInfo = attestData;

export const getPrimaryRole = (roles: string[]): string => {
    const rolePriority = attestationInfo.rolePriority;
    const sortedRoles = roles.sort((a, b) => rolePriority.indexOf(a) - rolePriority.indexOf(b));
    return sortedRoles[0];
}

export const getRoleDescription = (role: string): RoleDescription => {
    return attestationInfo.role[role];
}

export const getRequiredAttestations = (role: string): string[] => {
    const roleDescription = getRoleDescription(role);
    return roleDescription?.attestations || [];
}

export const getAttestationTitle = (id: string): string => {
    const attestation = getAttestationText(id);
    return attestation?.title || id;
}

export const getAttestationVersion = (id: string): string => {
    const attestation = getAttestationText(id);
    return attestation?.version || attestationInfo.version;
}

export const getAttestationText = (id: string): AttestationText => {
    return attestationInfo.attestations[id];
}

export const getNextAttestationDate = (id: string): string => {
    const attestation = get(commonhausData)?.good_until?.attestation || {};
    return attestation
        ? (attestation[id]?.date || 'due')
        : 'due';
}

export const checkRecentAttestation = (id: string): boolean => {
    const attestation = get(commonhausData)?.good_until?.attestation || {};
    if (!attestation) {
        return false;
    }
    console.log(id,
        attestation[id]?.date, checkRecent(attestation[id]?.date),
        attestation[id]?.version, getAttestationVersion(id));
    return checkRecent(attestation[id]?.date) && attestation[id]?.version === getAttestationVersion(id);
}

export const getRecentAttestationVersion = (id: string): string => {
    const attestation = get(commonhausData)?.good_until?.attestation || {};
    if (attestation && attestation[id]) {
        return attestation[id].version;
    }
    return getAttestationVersion(id);
}

export const checkRecent = (date: string): boolean => {
    if (!datePattern.test(date)) {
        return false;
    }
    const now = new Date();
    const compare = new Date(date);
    return compare >= now;
}

export const signAttestation = async (id: string) => {
    const URI = `${COMMONHAUS}/attest`;
    const body = {
        id,
        version: getAttestationVersion(id)
    };

    await post(URI, body);
}

export const signAttestations = async (ids: string[]) => {
    const URI = `${COMMONHAUS}/attest/all`;
    const body = ids.map(id => ({
        id,
        version: getAttestationVersion(id)
    }));

    await post(URI, body);
}

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

const errorFlag = (flag: string, value: boolean) => {
    errorFlags.update((flags) => ({
        ...flags,
        [flag]: value
    }));
};

export const load = async (uri: string): Promise<AbortController> => {
    const controller = new AbortController();
    const signal = controller.signal;

    try {
        const response = await fetch(uri, {
            credentials: "include",
            mode: "cors",
            signal
        });

        await handleResponse(response);
    } catch (error) {
        handleErrors(uri, error);
    }
    return controller;
}

export const post = async (uri: string, body: unknown): Promise<void> => {
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

        await handleResponse(response);
    } catch (error) {
        handleErrors(uri, error);
    }
}

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        if (response.status === 405) {
            errorFlag("unknown", true);
        }
        throw new Error(response.statusText);
    }
    const message = await response.json();
    for (const [key, value] of Object.entries(message)) {
        if (key === "INFO") {
            gitHubData.set(value as GitHubUser);
            errorFlag("info", false);
        } else if (key === "HAUS") {
            commonhausData.set(value as CommonhausMember);
            errorFlag("haus", false);
        } else if (key === "ALIAS") {
            aliasTargets.set(value as Record<string, Alias>);
            errorFlag("alias", false);
        }
    }
}

const handleErrors = (uri: string, error: Error) => {
    if (error.name === 'AbortError') {
        console.log('Fetch aborted');
    } else {
        console.error(error.message);
    }

    if (uri.startsWith(INFO)) {
        errorFlag("info", true);
    } else if (uri.startsWith(COMMONHAUS)) {
        errorFlag("haus", true);
    } else if (uri.startsWith(ALIASES)) {
        errorFlag("alias", true);
    }
}
