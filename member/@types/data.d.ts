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
    roles?: string[];
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
    forward_email: ForwardEmail;
}

export interface ForwardEmail {
    active: boolean;
    alt_alias: string[];
}

export interface Attestation {
    with_status: string;
    date: string;
    version: string;
}

export interface CommonhausMember {
    status?: string;
    good_until?: GoodStanding;
    services?: Services;
    attestations?: Attestation[];
}

export interface AttestationInfo {
    version: string;
    rolePriority: string[];
    role: Record<string, RoleDescription>;
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

export interface ErrorFlags {
    info?: boolean;
    haus?: boolean;
    alias?: boolean;
    unknown?: boolean;
}
