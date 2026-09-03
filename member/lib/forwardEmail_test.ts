import { deepStrictEqual, throws } from "node:assert/strict";
import {
  aliasUpdatePayload,
  computeResetFlag,
  extractErrorReason,
  isValidNewPassword,
  isValidRecipientList,
  unwrapPasswordResponse,
} from "./forwardEmail.ts";

Deno.test("aliasUpdatePayload includes IMAP changes, including false", () => {
  deepStrictEqual(
    aliasUpdatePayload({
      "alice@commonhaus.dev": {
        recipients: ["alice@example.org"],
        has_imap: true,
      },
      "bob@commonhaus.dev": {
        recipients: ["bob@example.org"],
        has_imap: false,
      },
    }),
    {
      "alice@commonhaus.dev": {
        recipients: ["alice@example.org"],
        has_imap: true,
      },
      "bob@commonhaus.dev": {
        recipients: ["bob@example.org"],
        has_imap: false,
      },
    },
  );
});

Deno.test("isValidNewPassword enforces ForwardEmail password constraints", () => {
  deepStrictEqual(isValidNewPassword("a".repeat(128)), true);
  deepStrictEqual(isValidNewPassword("a".repeat(129)), false);
  deepStrictEqual(isValidNewPassword(" password"), false);
  deepStrictEqual(isValidNewPassword("password "), false);
  deepStrictEqual(isValidNewPassword("pass'word"), false);
  deepStrictEqual(isValidNewPassword('pass"word'), false);
});

Deno.test("isValidRecipientList allows an empty list only with IMAP", () => {
  deepStrictEqual(isValidRecipientList([], true), true);
  deepStrictEqual(isValidRecipientList([], false), false);
  deepStrictEqual(isValidRecipientList(["alice@example.org"], false), true);
  deepStrictEqual(isValidRecipientList(["not-an-email"], true), false);
});

Deno.test("computeResetFlag only resets when IMAP is on, no current password, and confirmed", () => {
  deepStrictEqual(computeResetFlag(false, false, true), false);
  deepStrictEqual(computeResetFlag(true, true, true), false);
  deepStrictEqual(computeResetFlag(true, false, false), false);
  deepStrictEqual(computeResetFlag(true, false, true), true);
});

Deno.test("extractErrorReason reads the ERROR field when present", () => {
  deepStrictEqual(extractErrorReason({ ERROR: "some reason" }), "some reason");
  deepStrictEqual(extractErrorReason({}), undefined);
  deepStrictEqual(extractErrorReason(undefined), undefined);
});

Deno.test("unwrapPasswordResponse unwraps the ALIAS envelope", () => {
  deepStrictEqual(
    unwrapPasswordResponse({
      ALIAS: { username: "a@b.com", password: "x" },
    }),
    { username: "a@b.com", password: "x" },
  );
  throws(() => unwrapPasswordResponse({}));
  throws(() => unwrapPasswordResponse(undefined));
});
