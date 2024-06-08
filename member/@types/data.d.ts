export interface Message {
    type: string;
    payload: string | GitHubUser;
}

export interface GitHubUser {
    id?: number;
    login?: string;
    nodeId?: string;
    name?: string;
    avatarUrl?: string;
    company?: string;
    roles?: MemberRole[];
}

export interface GoodStanding {
    attestation: Record<string, Attestation>;
    contribution: string;
    dues: string;
}

export interface Discord {
    id: string;
    username: string;
    discriminator: string;
    verified: boolean;
}

export interface Services {
    discord: Discord;
    forwardEmail: ForwardEmail;
}

export interface ForwardEmail {
    configured: boolean;
    altAlias: string[];
}

export interface Attestation {
    withStatus: string;
    date: string;
    version: string;
}

export enum MemberRole {
    CFC = 'cfc',
    EGC = 'egc',
    MEMBER = 'member',
    SPONSOR = 'sponsor'
}

export enum MemberStatus {
    COMMITTEE = 'COMMITTEE',
    ACTIVE = 'ACTIVE',
    DECLINED = 'DECLINED',
    PENDING = 'PENDING',
    INACTIVE = 'INACTIVE',
    REVOKED = 'REVOKED',
    SUSPENDED = 'SUSPENDED',
    SPONSOR = 'SPONSOR',
    UNKNOWN = 'UNKNOWN'
}

export interface CommonhausMember {
    status?: MemberStatus;
    goodUntil?: GoodStanding;
    services?: Services;
    attestations?: Attestation[];
    applicationId?: string;
}

export interface AttestationInfo {
    version: string;
    rolePriority: MemberRole[];
    role: Record<string, RoleDescription>;
    agreement: string,
    attestations: Record<string, AttestationText>;
}

export interface RoleDescription {
    title: string;
    preamble: string;
    attestations: string[];
}

export interface AttestationText {
    version?: string;
    title: string;
    body: string;
}

export interface ApplicationData {
    created?: string;
    updated?: string;
    contributions?: string;
    additionalNotes?: string;
    feedback?: {
        htmlContent: string;
        date: string;
    }
}

export enum DataType {
    INFO = 'INFO',
    ALIAS = 'ALIAS',
    HAUS = 'HAUS',
    APPLY = 'APPLY'
}

export enum ErrorStatus {
    OK = 'OK',
    FORBIDDEN = 'FORBIDDEN',
    NOT_FOUND = 'NOT_FOUND',
    SERVER = 'SERVER',
    OTHER = 'OTHER'
}

export interface ErrorFlags {
    apply?: ErrorStatus;
    info?: ErrorStatus;
    haus?: ErrorStatus;
    alias?: ErrorStatus;
    unknown?: ErrorStatus;
}