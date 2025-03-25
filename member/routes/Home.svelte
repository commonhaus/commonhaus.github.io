<script>
  import {
    commonhausData,
    errorFlags,
    gitHubData,
    hasError,
    hasResponse,
    isForbidden,
    isOk,
    isServerError,
    knownUser,
    outboundPost,
  } from "../lib/stores";
  import Council from "../components/Council.svelte";
  import Discord from "../components/Home-Discord.svelte";
  import ForwardEmail from "../components/Home-ForwardEmail.svelte";
  import Membership from "../components/Home-Membership.svelte";
  import Oops from "../components/Oops.svelte";
  import Loading from "../components/Loading-coffee.svelte";
  import Unknown from "../components/Unknown.svelte";
  import { showDiscord, isCfc } from "../lib/memberStatus";

</script>

{#if $knownUser === undefined && isServerError($errorFlags.info)}
  <Oops></Oops>
{:else if $knownUser === undefined && isForbidden($errorFlags.info)}
  <Unknown />
{:else if !$hasResponse}
  <Loading>Fetching your user data</Loading>
{:else if $outboundPost}
  <Loading>Processing...</Loading>
{:else if hasError($errorFlags.info) || hasError($errorFlags.haus)}
  <Oops>There was an error loading your user data.</Oops>
{:else if isOk($errorFlags.info)}
  <h1>
    {#if $gitHubData.avatarUrl}
      <img src={$gitHubData.avatarUrl} alt="{$gitHubData.login}'s avatar" />
    {/if}
    <span>Hello, {$gitHubData.name}!</span>
  </h1>

  <p>It's great to have you here.</p>

  <div class="information">
    <p><span class="label">Login</span> {$gitHubData.login}</p>
  </div>

  {#if !$knownUser}
    <Unknown />
  {:else}
    {#if isCfc($gitHubData.roles)}
      <Council />
    {/if}
    <Membership />
    <ForwardEmail />
    {#if showDiscord($commonhausData.status)}
      <Discord />
    {/if}
  {/if}
{/if}
