export interface Alias {
    domain: AliasDomain;
    name: string;
    is_enabled: boolean;
    has_recipient_verification: boolean;
    has_imap: boolean;
    verified_recipients: Set<string>;
    recipients: Set<string>;
    id: string;
    object: string;
    created_at: string;
    updated_at: string;
}

export interface AliasOwner {
    email: string;
    display_name: string;
    id: string;
}

export interface AliasDomain {
    name: string;
    id: string;
}

export interface PasswordRequest {
    alias: string;
    password?: string;
    new_password: string;
    reset: boolean;
    email?: string;
}

export interface PasswordResponse {
    username: string;
    password: string;
}
