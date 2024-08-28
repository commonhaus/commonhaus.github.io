<script>
  import { onMount } from "svelte";
  import { MemberRole } from "../@types/data.d.ts";
  import { scrollToSection } from "../lib/scrollToSection";
  import {
    getRequiredAttestations,
    getNext,
  } from "../lib/attestations";
  import {
    getPrimaryRole,
    getRoleDescription,
    mayHaveAttestations,
    showApplication,
  } from "../lib/memberStatus";
  import {
    commonhausData,
    errorFlags,
    fetchLatestStatus,
    gitHubData,
    hasError,
    hasResponse,
    outboundPost
  } from "../lib/stores";
  import Attestation from "../components/Attestation.svelte";
  import CloseButton from "../components/CloseButton.svelte";
  import Loading from "../components/Loading-coffee.svelte";
  import Oops from "../components/Oops.svelte";

  let primaryRole, roles, attestIds, description, hasApplication;

  $: {
    roles = $gitHubData.roles || [];
    primaryRole = getPrimaryRole(roles);
    description = getRoleDescription(primaryRole);
    attestIds = getRequiredAttestations(primaryRole);
    hasApplication = $gitHubData.hasApplication;
  }

  $: if ($outboundPost) {
    window.scrollTo(0, 0);
  }

  onMount(async () => {
    await fetchLatestStatus();
  });
</script>

<CloseButton />

<h1>Membership status</h1>

{#if !$hasResponse}
  <Loading>Rummaging for your membership information</Loading>
{:else if $outboundPost}
  <Loading>Processing...</Loading>
{:else if hasError($errorFlags.haus)}
  <Oops>There was an error loading your membership data.</Oops>
{:else}
  <p>
    <span class="label">Current status</span>
    <span>{$commonhausData.status}</span>
  </p>
  <p>
    <span class="label">All roles</span>
    <span>{roles ? roles.join(", ") : "none"}</span>
  </p>

  {#if roles.includes("member")}
    {@const contrib = getNext($commonhausData.goodUntil?.contribution)}
    {@const dues = getNext($commonhausData.goodUntil?.dues)}
    {@const contribOk = contrib.includes("due")}
    {@const duesOk = dues.includes("due")}
    <section class="information">
      <h2>Membership Eligibility</h2>
      <p class="good-until">
        <span>Contributions</span>
        <span class:ok={contribOk} class:required={!contribOk}
          >(coming soon)</span
        >
      </p>
      <p class="good-until">
        <span>Dues</span>
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
  {:else if showApplication($commonhausData.status, roles)}
    {@const text = hasApplication ? "Review application" : "Apply"}
    <p><a href="#/apply">{text} for Commonhaus Foundation Membership</a></p>
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
