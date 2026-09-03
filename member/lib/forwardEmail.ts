export interface AliasUpdate {
  recipients: string[];
  has_imap: boolean;
}

export function aliasUpdatePayload(
  aliases: Record<string, Partial<AliasUpdate>>,
): Record<string, Partial<AliasUpdate>> {
  return Object.fromEntries(
    Object.entries(aliases).map(([email, alias]) => [email, {
      recipients: alias.recipients,
      has_imap: alias.has_imap ?? false,
    }]),
  );
}

export function isValidNewPassword(password: string): boolean {
  return password.length <= 128 &&
    !/^\s|\s$/.test(password) &&
    !/["']/.test(password);
}

export function isValidRecipientList(
  recipients: string[],
  hasImap = false,
): boolean {
  if (recipients.length === 0) return hasImap;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return recipients.every((email) => emailRegex.test(email));
}
