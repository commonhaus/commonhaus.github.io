<script>
    import {
    checkRecent,
    checkRecentAttestation,
    getAttestationTitle,
    getNext,
    getNextAttestationDate,
    getRequiredAttestations,
  } from "../lib/attestations";
  import {
    getPrimaryRole,
    mayHaveAttestations,

    showApplication

  } from "../lib/memberStatus";
  import { commonhausData, gitHubData } from "../lib/stores";
  import ControlButton from "./ControlButton.svelte";

  let primaryRole, attestIds, roles, localGood, hasApplication;

  $: {
    roles = $gitHubData.roles || [];
    localGood = $commonhausData.goodUntil || {};
    primaryRole = getPrimaryRole(roles);
    attestIds = getRequiredAttestations(primaryRole);
    hasApplication =  $gitHubData.hasApplication;
  }
</script>

<section class="info-block">
  <h2 class="control-heading">
    <span>Membership status</span>
    <div class="control">
      <ControlButton target="#/status" />
    </div>
  </h2>

  <div class="information">
    <p><span class="label">Status</span> {$commonhausData.status}</p>
    <p><span class="label">All roles</span> {roles.join(", ")}</p>
    {#if mayHaveAttestations($commonhausData.status) && localGood}
      <ul>
        {#each attestIds as id}
          {@const date = getNextAttestationDate(id, $commonhausData)}
          {@const ok = checkRecentAttestation(id, $commonhausData)}
          <li class="good-until">
            <span>{getAttestationTitle(id)}</span>
            <span class:ok class:required={!ok}>{date}</span>
          </li>
        {/each}
      </ul>
    {/if}
    {#if roles.includes('member')}
      {@const contrib = getNext(localGood.contribution)}
      {@const dues = getNext(localGood.dues)}
      {@const contribOk = contrib.includes("due")}
      {@const duesOk = dues.includes("due")}
      <ul>
        <li class="good-until">
          <span>Membership: Contributions</span>
          <span class:ok={contribOk} class:required={!contribOk}>(coming soon)</span>
        </li>
        <li class="good-until">
          <span>Membership: Dues</span>
          <span class:ok={duesOk} class:required={!duesOk}>(coming soon)</span>
        </li>
      </ul>
    {:else if showApplication($commonhausData.status, roles)}
      {@const text = hasApplication ? "Review application" : "Apply"}
      <p><a href="#/apply">{text} for Commonhaus Foundation Membership</a></p>
    {/if}
  </div>
</section>
