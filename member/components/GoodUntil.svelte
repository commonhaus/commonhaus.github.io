<script>
  import {
    checkRecent,
    checkRecentAttestation,
    getAttestationTitle,
    getNextAttestationDate,
    getRequiredAttestations,
  } from "../lib/attestations";
  import {
    getPrimaryRole
  } from "../lib/memberStatus";
  import {
    commonhausData,
  } from "../lib/stores";
  export let goodUntil;
  export let roles = [];

  let attestIds, primaryRole;

  let localGood = { ...goodUntil };
  $: localGood = { ...goodUntil };

  $: primaryRole = getPrimaryRole(roles);
  $: attestIds = getRequiredAttestations(primaryRole);
</script>

<ul>
  {#if localGood.contribution}
    {@const ok = checkRecent(localGood.contribution)}
    <li class="good-until">
      <span>Contributions</span>
      <span class:ok class:required={!ok}>{goodUntil.contribution}</span>
    </li>
  {/if}
  {#if localGood.dues}
    {@const ok = checkRecent(localGood.dues)}
    <li class="good-until">
      <span>Dues</span>
      <span class:ok class:required={!ok}>{localGood.dues}</span>
    </li>
  {/if}
  {#each attestIds as id}
    {@const ok = checkRecentAttestation(id, $commonhausData)}
    <li class="good-until">
      <span>{getAttestationTitle(id)}</span>
      <span class:ok class:required={!ok}
        >{getNextAttestationDate(id, $commonhausData)}</span
      >
    </li>
  {/each}
</ul>
