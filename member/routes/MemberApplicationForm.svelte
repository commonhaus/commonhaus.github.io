<script>
  import { onMount } from "svelte";
  import {
    APPLY,
    applicationData,
    commonhausData,
    errorFlags,
    gitHubData,
    hasOtherError,
    load,
    outboundPost,
    post,
  } from "../lib/stores";
  import { hasRole, showApplication } from "../lib/memberStatus";
  import Callout from "../components/Callout.svelte";
  import CloseButton from "../components/CloseButton.svelte";
  import Loading from "../components/Loading-coffee.svelte";
  import Oops from "../components/Oops.svelte";

  let contributions = "";
  let additionalNotes = "";
  let roleString = "";
  let loaded = false;
  let applicationReady = false;

  $: {
    if ($commonhausData.status || $gitHubData.roles || $applicationData) {
      roleString = $gitHubData.roles?.join(", ") || "none";
      resetForm();
    }
  }

  $: applicationReady =
    ($gitHubData.hasApplication && $applicationData.created) ||
    !$gitHubData.hasApplication;

  $: if ($outboundPost) {
    window.scrollTo(0, 0);
  }

  onMount(async () => {
    if (showApplication($commonhausData.status, $gitHubData.roles)) {
      await load(APPLY);
      resetFormFields();
      loaded = true;
    }
  });
  const submitForm = async () => {
    await post(APPLY, {
      contributions,
      additionalNotes,
    });
    resetFormFields();
  };
  const resetForm = () => {
    resetFormFields();
  };
  const resetFormFields = () => {
    additionalNotes = $applicationData.additionalNotes;
    contributions = $applicationData.contributions;
    if (!additionalNotes) {
      const status = $commonhausData.status;
      additionalNotes = `Status: ${status}\r\nRoles: ${roleString}`;
    }
  };
</script>

<CloseButton />

<h1>Join the Commonhaus Foundation</h1>

<p>
  By joining as a member, you gain voting rights, the ability to hold CF
  offices, and a <code>@commonhaus.dev</code> email address.
</p>

{#if !loaded && !applicationReady}
  <Loading>Finding up your membership application</Loading>
{:else if $outboundPost}
  <Loading>Processing...</Loading>
{:else if hasOtherError($errorFlags.apply)}
  <Oops>There was an error processing your membership application.</Oops>
{:else}
  <p>
    <span class="label">Status</span>
    <span>{$commonhausData.status}</span>
  </p>
  <p>
    <span class="label">All roles</span>
    <span>{roleString}</span>
  </p>

  {#if showApplication($commonhausData.status, $gitHubData.roles)}
    {#if $applicationData.feedback}
      <Callout>
        {@html $applicationData.feedback.htmlContent}

        <footer class="modified">
          updated {new Date($applicationData.feedback.date).toDateString()}
        </footer>
      </Callout>
    {/if}

    <div>
      <section class="information">
        <h3><label for="contributions">Contribution details</label></h3>
        <p>
          Briefly describe your contributions to CF or its projects over the
          past three months.
        </p>
        <textarea id="contributions" bind:value={contributions} required
        ></textarea>
        <p>
          <span aria-hidden="true">💖</span> Remember: Contributions aren't limited
          to code! Participation in our online community (such as Discord or GitHub
          Discussions), or other activities related to CF projects are also considered
          contributions.
        </p>
      </section>

      <section class="information">
        <h3><label for="additionalNotes">Additional notes</label></h3>
        <p>(Optional) Any other information or comments you'd like to add?</p>
        <textarea id="additionalNotes" bind:value={additionalNotes}></textarea>
      </section>

      <div class="setting">
        <span></span>
        <span class="control">
          <button
            name="saveAll"
            class="input"
            on:click={submitForm}
            disabled={$outboundPost}>Save</button
          >
          <div class="tooltip">
            <button
              name="reset"
              class="input"
              on:click={resetForm}
              disabled={$outboundPost}
            >
              <span>Cancel</span>
              <span class="tooltiptext">Reset to previous values</span>
            </button>
          </div>
        </span>
      </div>
      <footer class="modified">
        {#if $applicationData.updated}
          last updated {new Date($applicationData.updated).toDateString()}
        {/if}
        <br />
        {#if $applicationData.created}
          submitted {new Date($applicationData.created).toDateString()}
        {/if}
      </footer>
    </div>
  {:else if hasRole($gitHubData.roles, "member")}
    <Callout type="success">
      <p>
        <strong
          >🎉 You are already a member of the Commonhaus Foundation. 🎉</strong
        >
      </p>
      <p>Thank you for your support and participation!</p>
    </Callout>
  {:else}
    <Callout type="note">
      <p>You are not eligible to apply for membership at this time.</p>
      <p>Please contact the council for more information.</p>
    </Callout>
  {/if}
{/if}
