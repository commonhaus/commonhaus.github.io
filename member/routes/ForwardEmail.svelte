<script>
  import { onMount } from "svelte";
  import {
    checkRecentAttestation,
    getAttestationText,
    getNextAttestationDate,
    getRecentAttestationVersion,
  } from "../lib/attestations";
  import {
    ALIASES,
    aliasTargets,
    commonhausData,
    errorFlags,
    gitHubData,
    hasError,
    isForbidden,
    isOk,
    load,
    outboundPost,
    post,
  } from "../lib/stores";
  import Attestation from "../components/Attestation.svelte";
  import CloseButton from "../components/CloseButton.svelte";
  import Loading from "../components/Loading-coffee.svelte";
  import Oops from "../components/Oops.svelte";
  import { debounce } from "../lib/debounce";
  import { mayHaveEmail } from "../lib/memberStatus";

  const emailAttestation = getAttestationText("email");

  let aliasesLoaded = false;
  let recentAttestation = false;
  let recentVersion = emailAttestation.version;
  let versionChanged = false;
  let nextDate = "due";
  let aliasUpdates = {};
  let allRecipients = {};
  let emailErrors = {};
  let keys = {};

  $: {
    recentAttestation = checkRecentAttestation("email", $commonhausData);
    nextDate = getNextAttestationDate("email", $commonhausData);

    recentVersion = getRecentAttestationVersion("email", $commonhausData);
    versionChanged = recentVersion !== emailAttestation.version;
  }

  $: aliasUpdates = JSON.parse(JSON.stringify($aliasTargets));
  $: keys = Object.keys($aliasTargets)

  onMount(async () => {
    await load(ALIASES);
    aliasesLoaded = true;
    resetAll();
  });

  async function generatePassword(alias) {
    console.log("Generate password for", alias);
    if (window.confirm("Are you sure you want to generate a new password?")) {
      await post(ALIASES + "/password", { alias: alias });
    }
  }

  async function saveAll() {
    // send only the email alias and the updated target recipients
    const recipients = {};
    for (const [email, alias] of Object.entries(aliasUpdates)) {
      recipients[email] = alias.recipients;
    }
    await post(ALIASES, recipients);
    resetAll();
  }

  function resetAll() {
    aliasUpdates = JSON.parse(JSON.stringify($aliasTargets));
  }

  const handleInputChange = debounce((alias, event) => {
    const emails = event.target.value.split(",").map((email) => email.trim()) || [];
    aliasUpdates[alias].recipients = emails;
    allRecipients[alias] = event.target.value;
    emailErrors[alias] = !isValidEmailList(emails);
    console.log("Update alias", alias, allRecipients[alias], aliasUpdates[alias]?.recipients, emailErrors[alias]);
  }, 300);

  function isValidEmailList(emails) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.every((email) => emailRegex.test(email));
  }
</script>

<CloseButton />

<h1>Forward Email</h1>

<p>
  The Commonhaus Foundation uses <a href="https://forwardemail.net"
    >Forward Email</a
  >
  (<a href="https://forwardemail.net">https://forwardemail.net</a>) to provide
  email aliases for our members.
</p>

{#if isForbidden($errorFlags.alias) || !mayHaveEmail($commonhausData.status)}
  <section class="information">
    <p>You are not eligible for ForwardEmail service (membership status).</p>
  </section>
{:else if $outboundPost}
  <Loading>Processing...</Loading>
{:else if hasError($errorFlags.alias)}
  <Oops>There was an error working with your email addresses.</Oops>
{:else if !aliasesLoaded}
  <Loading>Fetching your email aliases</Loading>
{:else if isOk($errorFlags.alias)}
  {#if recentAttestation}
    <section class="information">
      <p>
        Your email {keys.length <= 1
          ? "alias"
          : "aliases"}:
      </p>
      {#each keys as alias (alias)}
        {@const aliasData = aliasUpdates[alias]}
        {@const hasVerifiedRecipients = aliasData.verified_recipients?.length > 0}
        <div class="no-title setting">
          <label class="label" for={alias}>{alias}</label>
          <span class="control">
            <input
              id={alias}
              type="text"
              bind:value={allRecipients[alias]}
              on:input={(event) => handleInputChange(alias, event)}
              class:error={emailErrors[alias]}
            />
            <div class="tooltip">
              <button
                class="input-square"
                aria-label="Generate a SMTP Password for this alias"
                disabled={$outboundPost || !hasVerifiedRecipients}
                on:click={generatePassword(alias)}
              >
                <svg width="20" height="20"
                  ><use
                    xlink:href="/assets/icon-symbol.svg#icon-square-asterisk"
                  /></svg
                >
                <span class="tooltiptext"
                  >Generate SMTP Password for this alias; requires verified email
                  address</span
                >
              </button>
            </div>
          </span>
          <footer>
            Verified recipients: <code
              >{aliasData.verified_recipients?.join(", ") || ""}</code
            >
          </footer>
        </div>
      {/each}

      <div class="setting">
        <span></span>
        <span class="control">
          <button
            name="saveAll"
            class="input"
            on:click={saveAll}
            disabled={$outboundPost}>Save</button
          >
          <div class="tooltip">
            <button
              name="reset"
              class="input"
              on:click={resetAll}
              disabled={$outboundPost}>
              <span>Reset</span>
              <span class="tooltiptext">Reset to previous values</span>
              </button>
          </div>
        </span>
      </div>
    </section>
  {/if}

  <Attestation id="email" />
{/if}

<div class="information">
  <h2>References</h2>
  <ul>
    <li>
      <a href="https://forwardemail.net/en/faq#what-is-forward-email"
        >What is Forward Email?</a
      >
    </li>
    <li>
      <a
        href="https://forwardemail.net/en/guides/send-mail-as-gmail-custom-domain"
        >Send Mail As with Gmail</a
      >
    </li>
    <li>
      <a
        href="https://forwardemail.net/en/guides/send-email-with-custom-domain-smtp"
        >Send email with custom domain (SMTP)</a
      >
    </li>
  </ul>
</div>
