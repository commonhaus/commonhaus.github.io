import { MemberStatus, MemberRole, RoleDescription } from "../@types/data.d.ts";
import { attestationInfo } from "./attestations.ts";

export const getPrimaryRole = (roles: MemberRole[]): MemberRole => {
    const rolePriority = attestationInfo.rolePriority;
    roles.sort((a, b) => rolePriority.indexOf(a) - rolePriority.indexOf(b));
    return roles[0];
}

export const getRoleDescription = (role: string): RoleDescription => {
    return attestationInfo.role[role];
}

export const mayHaveAttestations = (status: MemberStatus): boolean => {
    return status !== MemberStatus.UNKNOWN
        && status !== MemberStatus.SPONSOR
        && status !== MemberStatus.PENDING
        && status !== MemberStatus.DECLINED;
}

export const mayHaveEmail = (status: MemberStatus): boolean => {
    return status !== MemberStatus.DECLINED
        && status !== MemberStatus.PENDING
        && status !== MemberStatus.REVOKED
        && status !== MemberStatus.SPONSOR
        && status !== MemberStatus.SUSPENDED
        && status !== MemberStatus.UNKNOWN;
}

export const showDiscord = (status: MemberStatus): boolean => {
    return status !== MemberStatus.REVOKED
        && status !== MemberStatus.SUSPENDED;
}

export const hasRole = (roles: string[], role: string): boolean => {
    return roles?.includes(role);
}

export const showApplication = (status: MemberStatus, roles: string[]): boolean => {
    if (!roles) {
        return false; // not loaded/logged in yet.
    }
    return (roles.includes("member") && status ===  MemberStatus.INACTIVE)
        || (!roles.includes("member") && status !== MemberStatus.REVOKED);
}
