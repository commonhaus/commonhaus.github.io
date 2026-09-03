<script>
  import { createEventDispatcher } from "svelte";
  import { onDestroy, onMount } from "svelte";
  import { isValidRecipientList } from "../lib/forwardEmail";
  import CloseButton from "./CloseButton.svelte";

  export let alias = "";
  export let recipients = [];
  export let hasImap = false;
  export let verifiedRecipients = [];
  export let busy = false;
  export let error = "";

  const dispatch = createEventDispatcher();
  let recipientText = recipients.join(", ");
  let imapEnabled = hasImap;
  let dialog;
  let recipientInput;
  let dismissedError = false;

  onMount(() => {
    dialog?.showModal();
    recipientInput?.focus();
  });
  onDestroy(() => {
    if (dialog?.open) dialog.close();
  });

  $: recipientList = recipientText.trim()
    ? recipientText.split(",").map((email) => email.trim())
    : [];
  $: recipientError = !isValidRecipientList(recipientList, imapEnabled)
    ? "Enter a valid target address, or enable IMAP/POP3/CalDAV/CardDAV."
    : "";
  $: canSubmit = !recipientError;
  $: displayedError = dismissedError ? "" : error;

  function onFieldChange() {
    dismissedError = true;
  }

  function submit() {
    if (!canSubmit || busy) return;
    dismissedError = false;
    dispatch("submit", {
      alias,
      recipients: recipientList,
      has_imap: imapEnabled,
    });
  }

  function close() {
    if (dialog?.open) dialog.close();
    dispatch("close");
  }
</script>

<dialog
  bind:this={dialog}
  class="password-modal"
  aria-labelledby="edit-alias-title"
  on:cancel|preventDefault={close}
>
  <div class="password-modal-content">
    <CloseButton
      onClose={close}
      buttonId="edit-alias-close"
      ariaLabel="Close edit alias dialog"
    />
    <h2 id="edit-alias-title">Edit Alias</h2>
    <p>Update settings for <code>{alias}</code>.</p>

    <section>
      <h3>Email forwarding <span class="password-help">(optional)</span></h3>
      <label for="edit-recipients">Forward to
      <input
        id="edit-recipients"
        name="recipients"
        type="text"
        placeholder="forward-to-me@test.org"
        aria-invalid={!!recipientError}
        bind:value={recipientText}
        bind:this={recipientInput}
        on:input={onFieldChange}
      />
      </label>
      {#if verifiedRecipients.length > 0}
        <p class="password-help">
          Verified recipients: <code>{verifiedRecipients.join(", ")}</code>
        </p>
      {/if}
    </section>

    <section>
      <h3>Inbox <span class="password-help">(optional)</span></h3>
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={imapEnabled} on:change={onFieldChange} />
        <span>Enable IMAP/POP3/CalDAV/CardDAV</span>
      </label>
    </section>

    <hr />

    {#if recipientError}
      <div class="password-callout error">{recipientError}</div>
    {/if}
    {#if displayedError}
      <div class="password-callout error">{displayedError}</div>
    {/if}

    <div class="password-modal-actions">
      <button type="button" class="input" on:click={close} disabled={busy}>Cancel</button>
      <button type="button" class="input" on:click={submit} disabled={!canSubmit || busy}>
        Submit
      </button>
    </div>
  </div>
</dialog>
