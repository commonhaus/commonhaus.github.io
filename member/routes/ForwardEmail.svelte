<script>
  import { onMount } from "svelte";
  import {
    checkRecentAttestation,
    getAttestationText,
    getNextAttestationDate,
    getRecentAttestationVersion,
    signAttestation,
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

  async function refresh() {
    console.debug("refreshing");
    await load(ALIASES + "?refresh=true");
  }

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
        Your email {Object.keys(aliasUpdates).length === 1
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
          <div class="tooltip">
            <button
              class="input-square"
              aria-label="Refetch email information"
              on:click={refresh}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-list-restart"
                ><path d="M21 6H3" /><path d="M7 12H3" /><path
                  d="M7 18H3"
                /><path
                  d="M12 18a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L11 14"
                /><path d="M11 10v4h4" /></svg
              >
              <span class="tooltiptext">Refresh email information</span>
            </button>
          </div>
          <button
            name="saveAll"
            class="input"
            on:click={saveAll}
            disabled={$outboundPost}>Save</button
          >
          <button
            name="reset"
            class="input"
            on:click={resetAll}
            disabled={$outboundPost}>Cancel</button
          >
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
