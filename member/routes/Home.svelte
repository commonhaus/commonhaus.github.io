<script>
  import {
    errorFlags,
    gitHubData,
    hasResponse,
    knownUser,
  } from "../lib/stores";
  import Discord from "../components/Discord.svelte";
  import ForwardEmail from "../components/ForwardEmail.svelte";
  import Loading from "../components/Loading.svelte";
  import Membership from "../components/Membership.svelte";
  import Oops from "../components/Oops.svelte";
</script>

{#if !$hasResponse}
  <Loading>Loading user data...</Loading>
{:else if $knownUser && $errorFlags.info}
  <Oops>There was an error loading your user data.</Oops>
{:else}
  {#if $gitHubData.avatarUrl}
    <img src={$gitHubData.avatarUrl} alt="{$gitHubData.login}'s avatar" />
  {/if}
  <h1>Hello, {$gitHubData.name}!</h1>

  <p>It's great to have you here.</p>

  <div class="information">
    <p><span class="label">Login</span>: {$gitHubData.login}</p>
  </div>
{/if}

<!-- User status -->

{#if $hasResponse && !$knownUser}
  <h1>Join the Commonhaus Foundation!</h1>

  <p>You aren't a member or a sponsor yet, but we hope you will be soon.</p>

  <section>
    <h2>Become a Sponsor</h2>

    <p>
      Every contribution powers the sustainable growth of our open source
      projects. Even a small contribution can have a significant impact.
    </p>

    <a href="https://github.com/sponsors/commonhaus" class="text button"
      >Become a Sponsor</a
    >

    <p>
      Sponsors directly support our initiatives and gain access to our exclusive
      Discord server—a community space for engaging with fellow supporters and
      our team.
    </p>
  </section>

  <section>
    <h2>Become a Member</h2>

    <p>
      By joining as a member, you gain voting rights, the ability to hold CF
      offices, and a <code>@commonhaus.dev</code> email address. Your participation
      helps shape the future of our open source projects.
    </p>

    <p>
      Once you are a sponsor, you will be able to complete your membership
      registration on this page.
    </p>

    <p>Your involvement makes a difference. Join us today!</p>
  </section>
{:else if $knownUser && $errorFlags.haus}
  <Oops>There was an error loading your membership data.</Oops>
{:else if $knownUser}
  <Membership />
  <ForwardEmail />
  <Discord />
{/if}
