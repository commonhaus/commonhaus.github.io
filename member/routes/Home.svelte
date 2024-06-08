<script>
  import {
    commonhausData,
    errorFlags,
    gitHubData,
    hasError,
    hasResponse,
    isForbidden,
    isOk,
    knownUser,
  } from "../lib/stores";
  import Discord from "../components/Home-Discord.svelte";
  import ForwardEmail from "../components/Home-ForwardEmail.svelte";
  import Membership from "../components/Home-Membership.svelte";
  import Oops from "../components/Oops.svelte";
  import Loading from "../components/Loading.svelte";
  import Unknown from "../components/Unknown.svelte";
  import { showDiscord } from "../lib/memberStatus";
</script>

{#if !$hasResponse}
<Loading>Loading user data...</Loading>
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
    <p><span class="label">Login</span>: {$gitHubData.login}</p>
  </div>

  {#if !$knownUser || isForbidden($errorFlags.haus)}
    <Unknown />
  {:else}
    <Membership />
    <ForwardEmail />
    {#if showDiscord($commonhausData.status)}
      <Discord />
    {/if}
  {/if}
{/if}
