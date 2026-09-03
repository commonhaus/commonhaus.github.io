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
    postPassword,
    toastMessage,
  } from "../lib/stores";
  import Attestation from "../components/Attestation.svelte";
  import CloseButton from "../components/CloseButton.svelte";
  import Loading from "../components/Loading-coffee.svelte";
  import Oops from "../components/Oops.svelte";
  import { mayHaveEmail,
    mayHaveCommonhausEmail
  } from "../lib/memberStatus";
  import { aliasUpdatePayload } from "../lib/forwardEmail";
  import ManagePassword from "../components/ManagePassword.svelte";
  import EditAlias from "../components/EditAlias.svelte";
  import CreateAlias from "../components/CreateAlias.svelte";

  const emailAttestation = getAttestationText("email");

  let aliasesLoaded = false;
  let recentAttestation = false;
  let recentVersion = emailAttestation.version;
  let versionChanged = false;
  let nextDate = "due";
  let keys = {};

  let eligible = false;
  let eligibleForDefault = false;
  let hasDefaultAlias = false;
  let createDefaultAlias = false;
  let passwordAlias = null;
  let passwordError = "";
  let editAlias = null;
  let editError = "";
  let creatingAlias = false;
  let createError = "";

  $: {
    // Check overall email eligibility
    eligible = mayHaveEmail($commonhausData.status);

    // Check eligibility for default email alias
    eligibleForDefault = mayHaveCommonhausEmail($commonhausData.status);
    hasDefaultAlias = $commonhausData.services?.forwardEmail?.hasDefaultAlias;
    createDefaultAlias = !JSON.stringify($aliasTargets).includes("commonhaus.dev");

    keys = Object.keys($aliasTargets);

    recentAttestation = checkRecentAttestation("email", $commonhausData);
    nextDate = getNextAttestationDate("email", $commonhausData);

    recentVersion = getRecentAttestationVersion("email", $commonhausData);
    versionChanged = recentVersion !== emailAttestation.version;
  }

  onMount(async () => {
    await load(ALIASES);
    aliasesLoaded = true;
  });

  function generatePassword(alias) {
    passwordError = "";
    passwordAlias = alias;
  }

  async function submitPassword(event) {
    passwordError = "";
    try {
      await postPassword(event.detail);
      passwordAlias = null;
    } catch (error) {
      passwordError = error.message || "Unable to manage the Password.";
    }
  }

  function openEditAlias(alias) {
    editError = "";
    editAlias = alias;
  }

  async function submitEditAlias(event) {
    editError = "";
    try {
      const { alias, recipients, has_imap } = event.detail;
      const updates = aliasUpdatePayload({ [alias]: { recipients, has_imap } });
      await post(ALIASES, updates, true);
      editAlias = null;
      toastMessage("success", "Alias updated.");
    } catch (error) {
      editError = error.message || "Unable to update this alias.";
    }
  }

  function openCreateAlias() {
    createError = "";
    creatingAlias = true;
  }

  async function submitCreateAlias(event) {
    createError = "";
    try {
      const { alias, recipients, has_imap } = event.detail;
      const updates = aliasUpdatePayload({ [alias]: { recipients, has_imap } });
      await post(ALIASES, updates, true);
      creatingAlias = false;
      toastMessage("success", "Alias created.");
    } catch (error) {
      createError = error.message || "Unable to create this alias.";
    }
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

{#if isForbidden($errorFlags.alias) || !eligible}
  <section class="information">
    <p>You are not eligible for ForwardEmail service (membership status or role).</p>
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
      <div class="header setting">
        <div>Alias</div>
      </div>
      {#if keys.length > 0}
        {#each keys as alias (alias)}
          {@const aliasData = $aliasTargets[alias]}
          {@const hasVerifiedRecipients =
            aliasData.verified_recipients?.length > 0}
          {@const canManagePassword = hasVerifiedRecipients || aliasData.has_imap}
          {@const targetRecipients = aliasData.recipients || []}
          {@const target = targetRecipients.join(", ")}
          {@const verifiedTargets = targetRecipients.filter((r) =>
            aliasData.verified_recipients?.includes(r))}
          {@const unverifiedTargets = targetRecipients.filter((r) =>
            !aliasData.verified_recipients?.includes(r))}
          <div class="no-title setting">
            <span class="label">{alias}</span>
            <span class="control">
              <button
                class="input-square"
                aria-label="Edit this alias"
                disabled={$outboundPost}
                on:click={() => openEditAlias(alias)}
              >
                <svg width="20" height="20"
                  ><use xlink:href="/assets/icon-symbol.svg#icon-pencil" /></svg
                >
              </button>
              <div class="tooltip">
                <button
                  class="input-square"
                  aria-label="Manage Password for this alias"
                  disabled={$outboundPost || !canManagePassword}
                  on:click={() => generatePassword(alias)}
                >
                  <svg width="20" height="20"
                    ><use
                      xlink:href="/assets/icon-symbol.svg#icon-square-asterisk"
                    /></svg
                  >
                  <span class="tooltiptext"
                    >Manage Password for this alias</span
                  >
                </button>
              </div>
            </span>
            {#if target}
              <div class="alias-details">
                → {target}
              </div>
              {#if verifiedTargets.length > 0}
                <div class="alias-details">
                  Verified: <span class="ok">{verifiedTargets.join(", ")}</span>
                </div>
              {/if}
              {#if unverifiedTargets.length > 0}
                <div class="alias-details">
                  Pending verification: <span class="required">{unverifiedTargets.join(", ")}</span>
                </div>
              {/if}
            {/if}
            {#if aliasData.has_imap}
              <div class="alias-details">
                IMAP/POP3/CalDAV/CardDAV: enabled
              </div>
            {/if}
          </div>
        {/each}
      {/if}
      {#if eligibleForDefault && createDefaultAlias }
        {@const alias = $gitHubData.login}
        <div class="no-title setting">
          <span class="label">{alias}</span>
          <span class="control">
            <span class="alias-summary required">Not yet created&nbsp;</span>
            <button class="input" on:click={openCreateAlias} disabled={$outboundPost}>
              Create
            </button>
          </span>
        </div>
      {/if}
      </section>
  {/if}

  <Attestation id="email" />
{/if}

{#if passwordAlias}
  <ManagePassword
    alias={passwordAlias}
    hasImap={$aliasTargets[passwordAlias]?.has_imap}
    verifiedRecipients={$aliasTargets[passwordAlias]?.verified_recipients || []}
    busy={$outboundPost}
    error={passwordError}
    on:submit={submitPassword}
    on:close={() => (passwordAlias = null)}
  />
{/if}

{#if editAlias}
  <EditAlias
    alias={editAlias}
    recipients={$aliasTargets[editAlias]?.recipients || []}
    hasImap={$aliasTargets[editAlias]?.has_imap || false}
    verifiedRecipients={$aliasTargets[editAlias]?.verified_recipients || []}
    busy={$outboundPost}
    error={editError}
    on:submit={submitEditAlias}
    on:close={() => (editAlias = null)}
  />
{/if}

{#if creatingAlias}
  <CreateAlias
    alias={$gitHubData.login}
    busy={$outboundPost}
    error={createError}
    on:submit={submitCreateAlias}
    on:close={() => (creatingAlias = false)}
  />
{/if}

<div class="information" id="faq">
  <h2>About Forward Email</h2>
  <dl>
    <dt>
      <a href="https://forwardemail.net/en/faq#what-is-forward-email"
        >What is Forward Email?</a
      >
    </dt>

    <dt>Do I need an account with Forward Email?</dt>
    <dd>
      <p>
        No, you do not need an account with Forward Email to use this service.
      </p>
    </dd>

    <dt>I haven't been receiving any email (forwarding)</dt>
    <dd>
      <p>
        You need to verify your email address with Forward Email. Check your
        spam folder if you haven't received the verification email.
      </p>
    </dd>

    <dt>How do I use my alias with an email client?</dt>
    <dd>
      <ul>
        <li>
          To send mail, use the Forward Email SMTP servers. Forward Email uses DMARC,
          so other outgoing servers are likely to be rejected.
        </li>
        <li>
          Inbox: IMAP/POP3/CalDAV/CardDAV storage is optional and can be enabled at the
          same time as, or instead of, forwarding.
        </li>
      </ul>
      <p>
        The <kbd>[*]</kbd> button manages your password for sending (SMTP)
        or receiving (IMAP/POP3 only) email.
        Use your full alias email address as the username when configuring
        your client.
      </p>
      <p>
        See Forward Email's
        <a href="https://forwardemail.net/en/faq#email-clients"
          >email client instructions</a
        > for server and port settings.
      </p>
    </dd>
  </dl>
</div>
