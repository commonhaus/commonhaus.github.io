<script>
  import { onMount } from "svelte";
  import {
    checkRecent,
    checkRecentAttestation,
    commonhausData,
    fetchLatestStatus,
    getRoleDescription,
    getRequiredAttestations,
    getAttestationText,
    getPrimaryRole,
    gitHubData,
    signAttestations,
    getRecentAttestationVersion,
    getAttestationVersion,
  } from "../lib/stores";
  import CloseButton from "../components/CloseButton.svelte";

  let primaryRole, roles, attestIds, missing, description;

  $: {
    roles = $gitHubData.roles || [];
    primaryRole = getPrimaryRole(roles);
    description = getRoleDescription(primaryRole);
    attestIds = getRequiredAttestations(primaryRole);
  }

  $: missing = attestIds.some((id) => !checkRecentAttestation(id, $commonhausData));

  onMount(async () => {
    await fetchLatestStatus();
  });

  async function iAgree() {
    await signAttestations(attestIds);
  }
</script>

<CloseButton />

<h1>Membership status</h1>

<p>
  <span class="label">Status</span>: {$commonhausData.status}
</p>
<p>
  <span class="label">All Roles</span>: {roles ? roles.join(", ") : "none"}
</p>

{#if $commonhausData.good_until?.contribution}
  {@const ok = checkRecent($commonhausData.good_until.contribution)}
  <p>
    <span class="label">Contributions</span>: <span class:ok={ok} class:required={!ok}>{$commonhausData.good_until.contribution}</span>
  </p>
{/if}
{#if $commonhausData.good_until?.dues}
  {@const ok = checkRecent($commonhausData.good_until.dues)}
  <p>
    <span class="label">Dues</span>: <span class:ok={ok} class:required={!ok}>{$commonhausData.good_until.dues}</span>
  </p>
{/if}
<div class="information">
  <h2>{@html description.title}</h2>
  {@html description.preamble}
</div>
{#each attestIds as id}
  {@const attestation = getAttestationText(id)}
  {@const currentVersion = getAttestationVersion(id)}
  {@const recentVersion = getRecentAttestationVersion(id, $commonhausData)}
  {@const versionChanged = recentVersion != currentVersion}
  <section class="information">
    <h3 class="good-until">
      <span>{@html attestation.title}</span>
      {#if checkRecentAttestation(id, $commonhausData)}
        <span class="ok">{$commonhausData.good_until.attestation[id].date}</span>
      {:else}
        <span class="required">due{#if versionChanged } (updated){/if}</span>
      {/if}
    </h3>
    {@html attestation.body}
    <footer class="agreement-version">
      version <a href="https://github.com/commonhaus/foundation/blob/main/agreements/membership/members.yaml">{currentVersion}</a>
    </footer>
  </section>
{/each}
{#if missing}
  <div class="setting">
    <span></span>
    <span>
      <button name="agree" on:click={iAgree}>I Agree</button>
    </span>
  </div>
{/if}
