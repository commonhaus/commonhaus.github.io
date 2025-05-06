<!-- ForwardEmail.svelte -->
<script>
  import { MemberStatus } from "../@types/data.d.ts";
  import {
    checkRecentAttestation,
    getAttestationTitle,
    getNextAttestationDate,
  } from "../lib/attestations";
  import { mayHaveEmail } from "../lib/memberStatus";
  import { commonhausData, gitHubData } from "../lib/stores";
  import ControlButton from "./ControlButton.svelte";

  let eligible = false;
  let date = "due";
  let hasRecent = false;
  let service = {};
  let status = MemberStatus.UNKNOWN;
  let title = getAttestationTitle("email");
  let aliases = [];

  $: {
    date = getNextAttestationDate("email", $commonhausData);
    hasRecent = checkRecentAttestation("email", $commonhausData);
    status = $commonhausData.status;

    console.debug($commonhausData.services);
    service = $commonhausData.services?.forwardEmail || {};
    aliases = [
      ...(service.hasDefaultAlias ? [`<code>${$gitHubData.login}@commonhaus.dev</code>`] : []),
      ...(service.altAlias?.map(a => `<code>${a}</code>`) || [])
    ];
    eligible = mayHaveEmail(status) || aliases.length > 0;
  }
</script>

<section class="info-block">
  <h2 class="control-heading">
    <span>Forward Email</span>
    {#if eligible}
      <div class="control">
        <ControlButton target="#/email" />
      </div>
    {/if}
  </h2>

  {#if eligible}
    <div class="information">
      {#if aliases.length > 0}
      <p>
        <span class="label">Alias{#if aliases.length > 1}es{/if}</span>
        {@html aliases.join(", ")}
      </p>
      {/if}
      <ul>
        <li class="good-until">
          <span>{title}</span>
          <span class:ok={hasRecent} class:required={!hasRecent}>{date}</span>
        </li>
      </ul>
    </div>
  {:else}
    <div class="information">
      <p>You are not eligible for ForwardEmail service (membership status).</p>
    </div>
  {/if}
</section>
