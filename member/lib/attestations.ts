import attestData from 'virtual:attest-yaml'; // see vite.config.ts
import { AttestationInfo, AttestationText, CommonhausMember } from "../@types/data.d.ts";
import { getRoleDescription } from "./memberStatus.ts";
import { COMMONHAUS, post } from "./stores.ts";

export const attestationInfo: AttestationInfo = attestData;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

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

export const getNextAttestationDate = (id: string, data: CommonhausMember): string => {
    const specificAttestation = data?.goodUntil?.attestation?.[id];
    if (specificAttestation) {
        if (specificAttestation.version !== getAttestationVersion(id)) {
            return 'due (updated)';
        }
        return checkRecent(specificAttestation.date) ? specificAttestation.date : 'due';
    }
    return 'due';
}

export const checkRecentAttestation = (id: string, data: CommonhausMember): boolean => {
    const attestation = data?.goodUntil?.attestation || {};
    if (!attestation) {
        return false;
    }
    return checkRecent(attestation[id]?.date) && attestation[id]?.version === getAttestationVersion(id);
}

export const getRecentAttestationVersion = (id: string, data: CommonhausMember): string => {
    const attestation = data?.goodUntil?.attestation || {};
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

export const getNext = (date: string): string => {
    return checkRecent(date) ? date : 'due';
}

export const signAttestation = async (id: string) => {
    const URI = `${COMMONHAUS}/attest`;
    const body = {
        id,
        version: getAttestationVersion(id)
    };

    await post(URI, body);
}

export const signAllAttestations = async (ids: string[]) => {
    const URI = `${COMMONHAUS}/attest/all`;
    const body = ids.map(id => ({
        id,
        version: getAttestationVersion(id)
    }));

    await post(URI, body);
}
