<script>
  import { createEventDispatcher } from "svelte";
  import { onDestroy, onMount } from "svelte";
  import { isValidNewPassword } from "../lib/forwardEmail";
  import CloseButton from "./CloseButton.svelte";

  export let alias = "";
  export let hasImap = false;
  export let verifiedRecipients = [];
  export let busy = false;
  export let error = "";

  const dispatch = createEventDispatcher();
  let currentPassword = "";
  let newPassword = "";
  let resetConfirmed = false;
  let selectedEmail = verifiedRecipients[0] || "";
  let dialog;
  let newPasswordInput;

  onMount(() => {
    dialog?.showModal();
    newPasswordInput?.focus();
  });
  onDestroy(() => {
    if (dialog?.open) dialog.close();
  });

  $: hasCurrentPassword = currentPassword.trim().length > 0;
  $: newPasswordError = newPassword.length > 0 && !isValidNewPassword(newPassword)
    ? "Passwords must be 128 characters or fewer, cannot start or end with whitespace, and cannot contain quotes or apostrophes."
    : "";
  $: canSubmit = newPassword.length > 0 && !newPasswordError &&
    (!hasImap || hasCurrentPassword || resetConfirmed);

  function submit() {
    if (!canSubmit || busy) return;
    dispatch("submit", {
      alias,
      password: currentPassword || undefined,
      new_password: newPassword,
      reset: hasImap && !hasCurrentPassword && resetConfirmed,
      email: selectedEmail || undefined,
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
  aria-labelledby="manage-password-title"
  on:cancel|preventDefault={close}
>
  <div class="password-modal-content">
    <CloseButton
      onClose={close}
      buttonId="manage-password-close"
      ariaLabel="Close password management dialog"
    />
    <h2 id="manage-password-title">Manage Password</h2>
    <p>Manage the Password for <code>{alias}</code>.</p>

    <section>
      <h3>New Password</h3>
      <label for="new-password">New Password</label>
      <input
        id="new-password"
        name="new_password"
        type="password"
        autocomplete="new-password"
        maxlength="128"
        aria-invalid={!!newPasswordError}
        bind:value={newPassword}
        bind:this={newPasswordInput}
      />
      <p class="password-help">
        Must be 128 characters or fewer, cannot start or end with whitespace, and cannot contain
        quotes or apostrophes.
      </p>
      {#if newPasswordError}
        <div class="password-callout error">{newPasswordError}</div>
      {/if}
    </section>

    <section>
      <h3>Current Password</h3>
      <label for="current-password">Current Password <span>(optional)</span></label>
      <input
        id="current-password"
        name="password"
        type="password"
        autocomplete="current-password"
        bind:value={currentPassword}
      />
      {#if hasCurrentPassword}
        <div class="password-callout success">
          {#if hasImap}
            This will change the Password while preserving the existing mailbox and messages.
          {:else}
            This will change the Password for this alias.
          {/if}
        </div>
      {:else if hasImap}
        <div class="confirmation">
        <label class="password-callout warning checkbox-label">
          <input type="checkbox" bind:checked={resetConfirmed} />
          <span>
            IMAP/POP3: I understand that, if this alias already has a mailbox, continuing without the
            current Password will reset the existing mailbox and delete all messages.
          </span>
        </label>
        </div>
      {/if}
    </section>

    {#if verifiedRecipients.length > 0}
      <section>
        <h3>Email instructions</h3>
        <div class="radio-group">
          {#each verifiedRecipients as recipient (recipient)}
            <label class="checkbox-label">
              <input type="radio" name="email-instructions" value={recipient} bind:group={selectedEmail} />
              <span>Send instructions to <code>{recipient}</code></span>
            </label>
          {/each}
          <label class="checkbox-label">
            <input type="radio" name="email-instructions" value="" bind:group={selectedEmail} />
            <span>Don't send instructions</span>
          </label>
        </div>
      </section>
    {/if}

    {#if error}
      <div class="password-callout error">{error}</div>
    {/if}

    <hr />
    <div class="password-modal-actions">
      <button type="button" class="input" on:click={close} disabled={busy}>Cancel</button>
      <button type="button" class="input" on:click={submit} disabled={!canSubmit || busy}>
        {hasCurrentPassword ? "Change Password" : "Generate Password"}
      </button>
    </div>
  </div>
</dialog>
