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

export const isCfc = (roles: MemberRole[]): boolean => {
    return roles && roles.indexOf(MemberRole.CFC) !== -1;
}

export const mayHaveAttestations = (status: MemberStatus): boolean => {
    return status == MemberStatus.COMMITTEE
        || status == MemberStatus.ACTIVE    // member
        || status == MemberStatus.INACTIVE; // member
}

export const mayHaveEmail = (status: MemberStatus): boolean => {
    return mayHaveCommonhausEmail(status) || mayHaveAlternateEmail(status);
}

export const mayHaveCommonhausEmail = (status: MemberStatus): boolean => {
    return mayHaveAttestations(status);
}

export const mayHaveAlternateEmail = (status: MemberStatus): boolean => {
    return mayHaveAttestations(status) || status == MemberStatus.CONTRIBUTOR;
}

export const showDiscord = (status: MemberStatus): boolean => {
    return mayHaveAttestations(status)
        || status == MemberStatus.SPONSOR;
}

export const hasRole = (roles: string[], role: string): boolean => {
    return roles?.includes(role);
}

export const showApplication = (status: MemberStatus, roles: string[]): boolean => {
    if (!roles) {
        return false; // not loaded/logged in yet.
    }
    if (roles.includes("member")) {
        return status === MemberStatus.INACTIVE;
    }
    return status == MemberStatus.COMMITTEE
        || status == MemberStatus.SPONSOR
        || status == MemberStatus.PENDING
        || status == MemberStatus.DECLINED;
}
