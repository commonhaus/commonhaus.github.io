<script>
  import { createEventDispatcher } from "svelte";
  import { onDestroy, onMount } from "svelte";
  import { isValidRecipientList } from "../lib/forwardEmail";
  import CloseButton from "./CloseButton.svelte";

  export let alias = "";
  export let busy = false;
  export let error = "";

  const dispatch = createEventDispatcher();
  let recipientText = "";
  let imapEnabled = false;
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
  $: canSubmit = !recipientError && (recipientList.length > 0 || imapEnabled);
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
  aria-labelledby="create-alias-title"
  on:cancel|preventDefault={close}
>
  <div class="password-modal-content">
    <CloseButton
      onClose={close}
      buttonId="create-alias-close"
      ariaLabel="Close create alias dialog"
    />
    <h2 id="create-alias-title">Create Alias</h2>
    <p>Set up the <code>{alias}</code> alias. Choose email forwarding, Inbox behavior, or both.</p>

    <section>
      <h3>Email forwarding <span class="password-help">(optional)</span></h3>
      <label for="create-recipients">Forward to
      <input
        id="create-recipients"
        name="recipients"
        type="text"
        placeholder="forward-to-me@test.org"
        aria-invalid={!!recipientError}
        bind:value={recipientText}
        bind:this={recipientInput}
        on:input={onFieldChange}
      />
      </label>
      <p class="password-help">
        This address will need to be verified &mdash; you'll receive a
        verification email after submitting.
      </p>
    </section>

    <section>
      <h3>Inbox <span class="password-help">(optional)</span></h3>
      <label class="checkbox-label">
        <input type="checkbox" bind:checked={imapEnabled} on:change={onFieldChange} />
        <span>
          Enable IMAP/POP3/CalDAV/CardDAV
          <span class="password-help checkbox-help">
            Adds mailbox storage, no verification needed. You'll set a
            password after creating this alias &mdash; see the
            <a href="https://forwardemail.net/en/faq#do-you-support-receiving-email-with-imap"
              >Forward Email docs</a
            > for details on managing it.
          </span>
        </span>
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
