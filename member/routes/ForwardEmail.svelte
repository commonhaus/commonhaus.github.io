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
  import { mayHaveEmail,
    mayHaveCommonhausEmail
  } from "../lib/memberStatus";
  import { scrollToSection } from "../lib/scrollToSection";

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

  async function generatePassword(alias) {
    console.log("Generate password for", alias);
    if (window.confirm("Are you sure you want to generate a new password?")) {
      await post(ALIASES + "/password", { email: alias });
    }
  }

  async function saveAll() {
    // send only the email alias and the updated target recipients
    const recipients = {};
    for (const [email, alias] of Object.entries(aliasUpdates)) {
      recipients[email] = alias.recipients;
    }
    console.debug("save all", aliasUpdates, recipients);
    await post(ALIASES, recipients);
    resetAll();
  }

  function resetAll() {
    keys = Object.keys($aliasTargets);
    aliasUpdates = JSON.parse(JSON.stringify($aliasTargets));
    noRecipients = true;

    for (const alias of keys) {
      if (aliasUpdates[alias].recipients) {
        noRecipients = false;
        allRecipients[alias] = aliasUpdates[alias].recipients.join(", ");
        emailErrors[alias] = !isValidEmailList(aliasUpdates[alias].recipients);
      }
    }
  }

  const handleInputChange = debounce((alias, event) => {
    const emails =
      event.target.value.split(",").map((email) => email.trim()) || [];
    if (!aliasUpdates[alias]) {
      aliasUpdates[alias] = {};
    }
    noRecipients = false;
    aliasUpdates[alias].recipients = emails;
    allRecipients[alias] = event.target.value;
    emailErrors[alias] = !isValidEmailList(emails);
    hasErrors = Object.values(emailErrors).some((error) => error === true);
    console.debug(
      "Update alias",
      alias,
      allRecipients[alias],
      aliasUpdates[alias]?.recipients,
      emailErrors[alias],
    );
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
            📝 Specifiy the target address for your alias below, and press <kbd
              >Submit</kbd
            >.
          </li>
          <li>📥 Check for a verification email from Forward Email.</li>
          <li>✅ Follow the instructions to verify your email address.</li>
        </ol>
        <p>
          🎉 You will begin to receive email after you have verified your
          email address.<br /><br />
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
                    >Generate SMTP Password for this alias; requires verified
                    email address</span
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
              bind:value={allRecipients[alias]}
              on:input={(event) => handleInputChange(alias, event)}
              class:error={emailErrors[alias]}
            />
          </span>
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

    <dt>I haven't been receiving any email</dt>
    <dd>
      <p>
        You need to verify your email address with Forward Email. Check your
        spam folder if you haven't received the verification email.
      </p>
    </dd>

    <dt>How do I send email using my alias?</dt>
    <dd>
      <p>
        Forward Email uses DMARC. You must use the forwardemail.net SMTP server
        to send emails or your outgoing emails are likely to get rejected.
      </p>
      <p>
        You must have verified your target email address to send mail as your
        alias.
      </p>
      <ol>
        <li>
          Use the <kbd>[*]</kbd> button on the form above to trigger SMTP password
          generation.
        </li>
        <li>
          An email from Forward Email will be sent to your verified email
          address. <br />Note: When you click the link in that email, it will
          show you the generated SMTP password for only <em>30 seconds</em>.
        </li>
        <li>
          Set up your SMTP server (or Gmail) as follows:
          <ul>
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
        </li>
      </ol>
    </dd>
  </dl>
</div>
