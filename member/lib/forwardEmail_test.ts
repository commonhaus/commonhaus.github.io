import { deepStrictEqual } from "node:assert/strict";
import {
  aliasUpdatePayload,
  isValidNewPassword,
  isValidRecipientList,
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
