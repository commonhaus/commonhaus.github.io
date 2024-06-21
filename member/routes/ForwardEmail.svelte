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
  import EmailAlias from "../components/EmailAlias.svelte";
  import Loading from "../components/Loading-coffee.svelte";
  import Oops from "../components/Oops.svelte";
  import { mayHaveEmail } from "../lib/memberStatus";

  const emailAttestation = getAttestationText("email");

  let aliasesLoaded = false;
  let recentAttestation = false;
  let recentVersion = emailAttestation.version;
  let versionChanged = false;
  let nextDate = "due";
  let aliasUpdates = {};

  $: {
    recentAttestation = checkRecentAttestation("email", $commonhausData);
    nextDate = getNextAttestationDate("email", $commonhausData);

    recentVersion = getRecentAttestationVersion("email", $commonhausData);
    versionChanged = recentVersion !== emailAttestation.version;
  }

  $: aliasUpdates = JSON.parse(JSON.stringify($aliasTargets));

  onMount(async () => {
    await load(ALIASES);
    aliasesLoaded = true;
  });

  async function saveAll() {
    // send only the email alias and the updated target recipients
    const recipients = {};
    for (const [email, alias] of Object.entries(aliasUpdates)) {
      recipients[email] = alias.recipients;
    }
    await post(ALIASES, recipients);
  }

  function resetAll() {
    aliasUpdates = JSON.parse(JSON.stringify($aliasTargets));
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
        Your email {Object.keys(aliasUpdates).length <= 1
          ? "alias"
          : "aliases"}:
      </p>
      {#if Object.keys(aliasUpdates).length > 0}
        {#each Object.keys(aliasUpdates) as alias}
          <EmailAlias {alias} {aliasUpdates} />
        {/each}
      {:else}
        <EmailAlias alias={$gitHubData.login} {aliasUpdates} />
      {/if}

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
              <span>Cancel</span>
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
