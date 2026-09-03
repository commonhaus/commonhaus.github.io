import type { PasswordResponse } from "../@types/forwardemail.d.ts";

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

export function computeResetFlag(
  hasImap: boolean,
  hasCurrentPassword: boolean,
  resetConfirmed: boolean,
): boolean {
  return hasImap && !hasCurrentPassword && resetConfirmed;
}

export function extractErrorReason(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const reason = (body as Record<string, unknown>).ERROR;
  return typeof reason === "string" ? reason : undefined;
}

export function unwrapPasswordResponse(body: unknown): PasswordResponse {
  const alias = (body as { ALIAS?: unknown } | null | undefined)?.ALIAS;
  if (
    typeof alias === "object" &&
    alias !== null &&
    typeof (alias as PasswordResponse).username === "string" &&
    typeof (alias as PasswordResponse).password === "string"
  ) {
    return alias as PasswordResponse;
  }
  throw new Error("Unexpected password response shape from server.");
}
