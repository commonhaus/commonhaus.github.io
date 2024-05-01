interface Alias {
    domain: AliasDomain;
    name: string;
    is_enabled: boolean;
    has_recipient_verification: boolean;
    verified_recipients: Set<string>;
    recipients: Set<string>;
    id: string;
    object: string;
    created_at: string;
    updated_at: string;
}

interface AliasOwner {
    email: string;
    display_name: string;
    id: string;
}

interface AliasDomain {
    name: string;
    id: string;
}