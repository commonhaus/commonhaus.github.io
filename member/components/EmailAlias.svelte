<script>
  import { ALIASES, outboundPost, post } from "../lib/stores";
  import { debounce } from "../lib/debounce";

  export let alias = "";
  export let aliasUpdates = {};

  let emailErrors = {};
  let recipients = "";
  let previousRecipients = [];
  let hasRecipients = false;

  $: aliasData = aliasUpdates[alias] || {
    recipients: []
  };

  $: {
    if (aliasData?.recipients !== previousRecipients) {
      recipients = aliasData?.recipients?.join(", ") || "";
      previousRecipients = aliasData?.recipients;
    }
  }
  $: hasRecipients = aliasData.verified_recipients && aliasData.verified_recipients.length > 0;

  const handleInputChange = debounce((alias, event) => {
    const emails = event.target.value.split(",").map((email) => email.trim());
    aliasUpdates[alias].recipients = emails;
    emailErrors[alias] = !isValidEmailList(emails);
    recipients = event.target.value;
  }, 300);

  const generatePassword = async (alias) => {
    if (window.confirm('Are you sure you want to generate a new password?')) {
      await post(ALIASES + "/password", { alias: alias });
    }
  };

  function isValidEmailList(emails) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every((email) => emailRegex.test(email));
  }
</script>

<div class="no-title setting">
  <label class="label" for={alias}>{alias}</label>
  <span class="control">
    <input
      id={alias}
      type="text"
      bind:value={recipients}
      on:input={(event) => handleInputChange(alias, event)}
      class:error={emailErrors[alias]}
    />
    {#if false} <!-- generate password API is not available yet -->
    <div class="tooltip">
      <button
        class="input-square"
        aria-label="Generate a SMTP Password for this alias"
        disabled={$outboundPost || !hasRecipients}
        on:click={() => generatePassword(alias)}
      >
        <svg width="20" height="20"><use xlink:href="/assets/icon-symbol.svg#icon-square-asterisk"/></svg>
        <span class="tooltiptext">Generate a SMTP Password for this alias (requires verified email address)</span>
      </button>
    </div>
    {/if}
  </span>
  <footer>
    Verified recipients: <code>{aliasData.verified_recipients?.join(", ") || ''}</code>
  </footer>
</div>
