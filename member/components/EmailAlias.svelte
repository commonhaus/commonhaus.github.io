<script>
  import { ALIASES, post } from "../lib/stores";
  import { debounce } from "../lib/debounce";

  export let alias = "";
  export let aliasUpdates = {};

  let emailErrors = {};
  let recipients = "";
  let previousRecipients = [];

  $: aliasData = aliasUpdates[alias] || {
    recipients: []
  };

  $: {
    if (aliasData?.recipients !== previousRecipients) {
      recipients = aliasData?.recipients?.join(", ") || "";
      previousRecipients = aliasData?.recipients;
    }
  }

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
        disabled={!aliasData.verified_recipients || aliasData.verified_recipients.length === 0}
        on:click={() => generatePassword(alias)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-asterisk"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="m8.5 14 7-4"/><path d="m8.5 10 7 4"/></svg>
        <span class="tooltiptext">Generate a SMTP Password for this alias (requires verified email address)</span>
      </button>
    </div>
    {/if}
  </span>
  <footer>
    Verified recipients: <code>{aliasData.verified_recipients?.join(", ") || ''}</code>
  </footer>
</div>
