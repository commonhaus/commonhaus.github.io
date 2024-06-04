<script>
  import { onMount } from "svelte";
  import {
    checkRecent,
    checkRecentAttestation,
    getAttestationText,
    getAttestationVersion,
    getRecentAttestationVersion,
    getRequiredAttestations,
    signAllAttestations,
  } from "../lib/attestations";
  import {
    getPrimaryRole,
    getRoleDescription,
    mayHaveAttestations,
    showApplication } from "../lib/memberStatus";
  import {
    commonhausData,
    errorFlags,
    fetchLatestStatus,
    gitHubData,
    hasError,
    hasResponse,
  } from "../lib/stores";
  import CloseButton from "../components/CloseButton.svelte";
  import Loading from "../components/Loading.svelte";
  import MemberApplicationForm from "../components/MemberApplicationForm.svelte";
  import Oops from "../components/Oops.svelte";

  let primaryRole, roles, attestIds, missing, description;

  $: {
    roles = $gitHubData.roles || [];
    primaryRole = getPrimaryRole(roles);
    description = getRoleDescription(primaryRole);
    attestIds = getRequiredAttestations(primaryRole);
    console.log("role change", $gitHubData.roles, primaryRole, description, attestIds)
  }

  $: missing = attestIds.some(
    (id) => !checkRecentAttestation(id, $commonhausData),
    console.log("attest change", $commonhausData, missing)
  );

  onMount(async () => {
    await fetchLatestStatus();
  });

  async function iAgree() {
    await signAllAttestations(attestIds);
  }
</script>

<CloseButton />

<h1>Membership status</h1>

{#if !$hasResponse }
<Loading>Loading membership information</Loading>
{:else if hasError($errorFlags.haus)}
  <Oops>There was an error loading your membership data.</Oops>
{:else }
  <p>
    <span class="label">Status</span>: {$commonhausData.status}
  </p>
  <p>
    <span class="label">All Roles</span>: {roles ? roles.join(", ") : "none"}
  </p>

  {#if showApplication($commonhausData.status)}
    <MemberApplicationForm />
  {:else if roles.includes("member")}
    {#if $commonhausData.goodUntil?.contribution}
      {@const ok = checkRecent($commonhausData.goodUntil.contribution)}
      <p>
        <span class="label">Contributions</span>:
        <span class:ok class:required={!ok}
          >{$commonhausData.goodUntil.contribution}</span
        >
      </p>
    {/if}
    {#if $commonhausData.goodUntil?.dues}
      {@const ok = checkRecent($commonhausData.goodUntil.dues)}
      <p>
        <span class="label">Dues</span>:
        <span class:ok class:required={!ok}
          >{$commonhausData.goodUntil.dues}</span
        >
      </p>
    {/if}
  {/if}

  {#if mayHaveAttestations($commonhausData.status)}
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
            <span class="ok"
              >{$commonhausData.goodUntil.attestation[id].date}</span
            >
          {:else}
            <span class="required"
              >due{#if versionChanged}
                (updated){/if}</span
            >
          {/if}
        </h3>
        {@html attestation.body}
        <footer class="agreement-version">
          version <a
            href="https://github.com/commonhaus/foundation/blob/main/agreements/membership/members.yaml"
            >{currentVersion}</a
          >
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
  {/if}
{/if}
