<script>
  import {
    checkRecent,
    checkRecentAttestation,
    getAttestationTitle,
    getNextAttestationDate,
    getPrimaryRole,
    getRequiredAttestations,
  } from "../lib/stores";
  export let good_until;
  export let roles = [];

  let attestIds, primaryRole;

  let localGood = {...good_until};
  $: localGood = {...good_until};

  $: primaryRole = getPrimaryRole(roles);
  $: attestIds = getRequiredAttestations(primaryRole);
</script>

<ul>
  {#if localGood.contribution}
    {@const ok = checkRecent(localGood.contribution)}
    <li class="good-until">
      <span>Contributions</span> <span class:ok={ok} class:required={!ok}>{good_until.contribution}</span>
    </li>
  {/if}
  {#if localGood.dues}
    {@const ok = checkRecent(localGood.dues)}
    <li class="good-until">
      <span>Dues</span> <span class:ok={ok} class:required={!ok}>{localGood.dues}</span>
    </li>
  {/if}
  {#each attestIds as id}
    {@const ok = checkRecentAttestation(id)}
    <li class="good-until">
      <span>{getAttestationTitle(id)}</span> <span class:ok={ok} class:required={!ok}>{getNextAttestationDate(id)}</span>
    </li>
  {/each}
</ul>
