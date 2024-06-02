<!-- ForwardEmail.svelte -->
<script>
  import {
    checkRecentAttestation,
    commonhausData,
    gitHubData,
  } from "../lib/stores";
  import ControlButton from "./ControlButton.svelte";

  let eligible = false;
  let service = {};
  let status = "UNKNOWN";
  let hasAttestation = false;

  $: {
    service = $commonhausData.services?.forward_email || {};
    status = $commonhausData.status;
    eligible =
      (status !== "UNKNOWN" && status !== "PENDING" && status !== "SPONSOR") ||
      (service && service.active);
  }
  $: hasAttestation = checkRecentAttestation("email", $commonhausData);
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
      {#if !hasAttestation}
        <p class="required">Requires signed service agreement</p>
      {/if}
      {#if service && service.active}
        <p>
          <span class="label">Active</span>:
          <code>{$gitHubData.login}@commonhaus.dev</code
          >{#if service.alt_alias && service.alt_alias.length > 0}
            {#each service.alt_alias as alias (alias)},
              <code>{alias}</code
              >{#if alias !== service.alt_alias[service.alt_alias.length - 1]},
              {/if}
            {/each}
          {/if}
        </p>
      {:else}
        <p>Not configured</p>
      {/if}
    </div>
  {:else}
    <div class="information">
      <p>You are not eligible for ForwardEmail service (membership status).</p>
    </div>
  {/if}
</section>
