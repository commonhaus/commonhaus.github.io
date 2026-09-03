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
  } from "../lib/stores";
  import Attestation from "../components/Attestation.svelte";
  import CloseButton from "../components/CloseButton.svelte";
  import Loading from "../components/Loading-coffee.svelte";
  import Oops from "../components/Oops.svelte";
  import { debounce } from "../lib/debounce";
  import { mayHaveEmail,
    mayHaveCommonhausEmail
  } from "../lib/memberStatus";
  import { scrollToSection } from "../lib/scrollToSection";
  import {
    aliasUpdatePayload,
    isValidRecipientList,
  } from "../lib/forwardEmail";
  import ManagePassword from "../components/ManagePassword.svelte";

  const emailAttestation = getAttestationText("email");

  let aliasesLoaded = false;
  let recentAttestation = false;
  let recentVersion = emailAttestation.version;
  let versionChanged = false;
  let nextDate = "due";
  let aliasUpdates = {};
  let allRecipients = {};
  let noRecipients = true;
  let emailErrors = {};
  let keys = {};
  let hasErrors = false;

  let eligible = false;
  let eligibleForDefault = false;
  let hasDefaultAlias = false;
  let createDefaultAlias = false;
  let passwordAlias = null;
  let passwordError = "";

  $: hasErrors = Object.values(emailErrors).some((error) => error === true);

  $: {
    // Check overall email eligibility
    eligible = mayHaveEmail($commonhausData.status);

    // Check eligibility for default email alias
    eligibleForDefault = mayHaveCommonhausEmail($commonhausData.status);
    hasDefaultAlias = $commonhausData.services?.forwardEmail?.hasDefaultAlias;
    createDefaultAlias = !JSON.stringify($aliasTargets).includes("commonhaus.dev");

    recentAttestation = checkRecentAttestation("email", $commonhausData);
    nextDate = getNextAttestationDate("email", $commonhausData);

    recentVersion = getRecentAttestationVersion("email", $commonhausData);
    versionChanged = recentVersion !== emailAttestation.version;
  }

  onMount(async () => {
    await load(ALIASES);
    aliasesLoaded = true;
    resetAll();
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

  async function saveAll() {
    // send only the email alias and the updated target recipients
    const updates = aliasUpdatePayload(aliasUpdates);
    console.debug("save all", aliasUpdates, updates);
    await post(ALIASES, updates);
    resetAll();
  }

  function resetAll() {
    keys = Object.keys($aliasTargets);
    aliasUpdates = JSON.parse(JSON.stringify($aliasTargets));
    const nextAllRecipients = {};
    const nextEmailErrors = {};

    for (const alias of keys) {
      const recipients = aliasUpdates[alias].recipients || [];
      nextAllRecipients[alias] = recipients.join(", ");
      nextEmailErrors[alias] = !isValidRecipientList(
        recipients,
        aliasUpdates[alias].has_imap,
      );
    }

    allRecipients = nextAllRecipients;
    emailErrors = nextEmailErrors;
    noRecipients = keys.every((alias) =>
      (aliasUpdates[alias].recipients || []).length === 0
    );
  }

  const handleInputChange = debounce((alias, event) => {
    const value = event.target.value.trim();
    const emails = value ? value.split(",").map((email) => email.trim()) : [];
    if (!aliasUpdates[alias]) {
      aliasUpdates[alias] = {};
    }
    noRecipients = false;
    aliasUpdates[alias].recipients = emails;
    allRecipients[alias] = event.target.value;
    emailErrors = {
      ...emailErrors,
      [alias]: !isValidRecipientList(emails, aliasUpdates[alias].has_imap),
    };
    console.debug(
      "Update alias",
      alias,
      allRecipients[alias],
      aliasUpdates[alias]?.recipients,
      emailErrors[alias],
    );
  }, 300);

  function handleImapChange(alias, event) {
    const hasImap = event.currentTarget.checked;
    aliasUpdates = {
      ...aliasUpdates,
      [alias]: {
        ...(aliasUpdates[alias] || {}),
        has_imap: hasImap,
      },
    };
    const recipients = aliasUpdates[alias].recipients || [];
    emailErrors = {
      ...emailErrors,
      [alias]: !isValidRecipientList(recipients, hasImap),
    };
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
      {#if noRecipients}
        <h3>Setting up Forward Email</h3>
        <ol>
          <li>
            📝 Enter a valid target address for your alias below. If you want
            mailbox storage, enable IMAP/POP3/CalDAV/CardDAV too, then press
            <kbd>Submit</kbd>.
          </li>
          <li>
            📥 Check the target address for a verification email from Forward
            Email, then follow its instructions.
          </li>
          <li>
            🔑 After the target address is verified, use the <kbd>[*]</kbd>
            button to generate a Password for your alias.
          </li>
          <li>
            📬 Configure your email client with the alias and Password using
            the <a href="https://forwardemail.net/en/faq#email-clients"
              >email client instructions</a
            >.
          </li>
        </ol>
        <p>
          🎉 Forwarding begins after you verify your target address. If enabled,
          mailbox storage works alongside forwarding.<br /><br />
          👀 See <a
              href="#/"
              role="button"
              tabindex="0"
              on:click|preventDefault={() => scrollToSection("faq")}
              >additional notes below</a
            > for how to send mail using your new alias.
        </p>
      {:else}
        <p>
          Your email {keys.length <= 1 ? "alias" : "aliases"}:
        </p>
      {/if}
      <div class="header setting">
        <div>Alias</div>
        <div>Target address</div>
      </div>
      {#if keys.length > 0}
        {#each keys as alias (alias)}
          {@const aliasData = aliasUpdates[alias]}
          {@const hasVerifiedRecipients =
            aliasData.verified_recipients?.length > 0}
          {@const canManagePassword = hasVerifiedRecipients || aliasData.has_imap}
          <div class="no-title setting">
            <label class="label" for={alias}>{alias}</label>
            <span class="control">
              <input
                id={alias}
                type="text"
                placeholder="forward-to-me@test.org"
                bind:value={allRecipients[alias]}
                on:input={(event) => handleInputChange(alias, event)}
                class:error={emailErrors[alias]}
              />
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
            <div class="alias-details">
              Verified recipients: <code
                >{aliasData.verified_recipients?.join(", ") || ""}</code
              >
              <div>
              <label>
                <input
                  type="checkbox"
                  checked={aliasUpdates[alias].has_imap}
                  on:change={(event) => handleImapChange(alias, event)}
                />
                Enable IMAP/POP3/CalDAV/CardDAV
              </label>
              </div>
            </div>
          </div>
        {/each}
      {/if}
      {#if eligibleForDefault && createDefaultAlias }
        {@const alias = $gitHubData.login}
        <!-- Assign a default value to alias -->
        <div class="no-title setting">
          <label class="label" for={alias}>{alias}</label>
          <span class="control">
            <input
              id={alias}
              type="text"
              placeholder="forward-to-me@test.org"
              bind:value={allRecipients[alias]}
              on:input={(event) => handleInputChange(alias, event)}
              class:error={emailErrors[alias]}
            />
          </span>
          <div class="alias-details">
            <label>
              <input
                type="checkbox"
                checked={aliasUpdates[alias]?.has_imap || false}
                on:change={(event) => handleImapChange(alias, event)}
              />
              Enable IMAP/POP3/CalDAV/CardDAV
            </label>
          </div>
        </div>
      {/if}

      <div class="setting">
        <span></span>
        <span class="control">
          <button
            name="saveAll"
            class="input"
            on:click={saveAll}
            disabled={$outboundPost || hasErrors}>Submit</button
          >
          <div class="tooltip">
            <button
              name="reset"
              class="input"
              on:click={resetAll}
              disabled={$outboundPost}
            >
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

{#if passwordAlias}
  <ManagePassword
    alias={passwordAlias}
    hasImap={aliasUpdates[passwordAlias]?.has_imap}
    validatedEmail={aliasUpdates[passwordAlias]?.verified_recipients?.[0] || ""}
    busy={$outboundPost}
    error={passwordError}
    on:submit={submitPassword}
    on:close={() => (passwordAlias = null)}
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
      <p>Forward Email works as an additional mailbox for your alias:</p>
      <ul>
        <li>
          IMAP/POP3/CalDAV/CardDAV storage is optional and can be enabled at the
          same time as forwarding.
        </li>
        <li>
          To send mail, use the Forward Email servers. Forward Email uses DMARC,
          so other outgoing servers are likely to be rejected.
        </li>
      </ul>
      <p>
        The <kbd>[*]</kbd> button generates the shared Password for sending and
        receiving. Forward Email sends a one-time link to the verified target
        address; the generated Password is shown for only <em>30 seconds</em>.
        Use your full alias email address as the username when configuring your
        client.
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
