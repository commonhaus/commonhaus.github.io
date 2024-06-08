<script>
  import { onMount } from "svelte";
  import { MemberRole } from "../@types/data.d.ts";
  import {
    getAttestationText,
    getRequiredAttestations,
    getNext,
  } from "../lib/attestations";
  import {
    getPrimaryRole,
    getRoleDescription,
    mayHaveAttestations,
  } from "../lib/memberStatus";
  import {
    commonhausData,
    errorFlags,
    fetchLatestStatus,
    gitHubData,
    hasError,
    hasResponse,
  } from "../lib/stores";
  import Attestation from "../components/Attestation.svelte";
  import CloseButton from "../components/CloseButton.svelte";
  import Loading from "../components/Loading.svelte";
  import Oops from "../components/Oops.svelte";

  let primaryRole, roles, attestIds, description;

  $: {
    roles = $gitHubData.roles || [];
    primaryRole = getPrimaryRole(roles);
    description = getRoleDescription(primaryRole);
    attestIds = getRequiredAttestations(primaryRole);
  }

  onMount(async () => {
    await fetchLatestStatus();
  });
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
</script>

<CloseButton />

<h1>Membership status</h1>

{#if !$hasResponse}
  <Loading>Loading membership information</Loading>
{:else if hasError($errorFlags.haus)}
  <Oops>There was an error loading your membership data.</Oops>
{:else}
  <p>
    <span class="label">Current status</span>: {$commonhausData.status}
  </p>
  <p>
    <span class="label">All roles</span>: {roles ? roles.join(", ") : "none"}
  </p>

  {#if roles.includes("member")}
    {@const contrib = getNext($commonhausData.goodUntil?.contribution)}
    {@const dues = getNext($commonhausData.goodUntil?.dues)}
    {@const contribOk = contrib.includes("due")}
    {@const duesOk = dues.includes("due")}
    <section class="information">
      <h2>Membership Eligibility</h2>
      <p class="good-until">
        <span>Contributions</span>:
        <span class:ok={contribOk} class:required={!contribOk}
          >(coming soon)</span
        >
      </p>
      <p class="good-until">
        <span>Dues</span>:
        <span class:ok={duesOk} class:required={!duesOk}>(coming soon)</span>
      </p>
      <footer>
        <a
          href="#/"
          role="button"
          tabindex="0"
          on:click|preventDefault={() => scrollToSection("with-member-role")}
        >
          See membership responsibilities
        </a>
      </footer>
    </section>
  {/if}

  {#if mayHaveAttestations($commonhausData.status)}
    {#if description}
      <div class="information">
        <h2>{@html description.title}</h2>
        {@html description.preamble}
      </div>
    {/if}
    {#each attestIds as id}
      <Attestation {id} />
    {/each}
    {#if primaryRole != MemberRole.MEMBER && roles.includes("member")}
      <Attestation id="with-member-role" />
    {/if}
  {/if}
{/if}
