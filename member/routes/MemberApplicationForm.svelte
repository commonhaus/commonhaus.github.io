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
    post
  } from "../lib/stores";
  import { hasRole, showApplication } from "../lib/memberStatus";
  import Callout from "../components/Callout.svelte";
  import CloseButton from "../components/CloseButton.svelte";
  import Loading from "../components/Loading-coffee.svelte";
  import Oops from "../components/Oops.svelte";

  let contributions = "";
  let additionalNotes = "";
  let roleString = "";
  let hasForm = false;

  $: {
    if ($commonhausData.status || $gitHubData.roles || $applicationData) {
      console.debug("application data changed", $commonhausData, $gitHubData.roles);
      roleString = $gitHubData.roles?.join(", ") || "none";
      resetForm();
    }
  }

  onMount(async () => {
    if (showApplication($commonhausData.status, $gitHubData.roles)) {
      hasForm = true;
      await load(APPLY);
      resetForm();
    }
  });
  const addNotes = () => {
    if (!additionalNotes) {
      const status = $commonhausData.status;
      additionalNotes = `Status: ${status}\r\nRoles: ${roleString}`;
    }
  };
  const submitForm = async () => {
    await post(APPLY, {
      contributions,
      additionalNotes,
    });
    resetForm();
  };
  const resetForm = () => {
    additionalNotes = $applicationData.additionalNotes;
    contributions = $applicationData.contributions;
    addNotes();
  };
</script>

<CloseButton />

<h1>Join the Commonhaus Foundation</h1>

<p>
  By joining as a member, you gain voting rights, the ability to hold CF
  offices, and a <code>@commonhaus.dev</code> email address.
</p>

{#if hasForm && !$applicationData}
  <Loading>membership information</Loading>
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

    <form on:submit|preventDefault={submitForm}>
      <section class="information">
        <h3><label for="contributions">Contribution details</label></h3>
        <p>
          Briefly describe your contributions to CF or its projects over the
          past three months. Include links to pull requests, issues,
          discussions, or other relevant activities.
        </p>
        <textarea
          class="setting"
          id="contributions"
          bind:value={contributions}
          required
        ></textarea>
      </section>

      <section class="information">
        <h3><label for="additionalNotes">Additional notes</label></h3>
        <p>(Optional) Any other information or comments you'd like to add?</p>
        <textarea
          class="setting"
          id="additionalNotes"
          bind:value={additionalNotes}
        ></textarea>
      </section>

      <div class="setting">
        <span></span>
        <span class="control">
          <button name="saveAll" class="input" on:click={submitForm}
            >Save</button
          >
          <button name="reset" class="input" on:click={resetForm}>Cancel</button
          >
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
    </form>
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
