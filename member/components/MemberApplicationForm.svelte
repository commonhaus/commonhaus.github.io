<script>
  import { onMount } from "svelte";
  import { applicationData, commonhausData, load, APPLY } from "../lib/stores";
  import { showApplication } from "../lib/memberStatus";

  let contributions = "";
  let additionalNotes = "";

  onMount(async () => {
    if (showApplication($commonhausData.status)) {
      await load(APPLY);
    }
  });

  $: {
    contributions = $applicationData.contributions;
    additionalNotes = $applicationData.additionalNotes;
    console.log("application data:", $applicationData);
  }

  const submitForm = async () => {
    await post(APPLY, {
      contributions,
      additionalNotes,
    });
  };
  const resetForm = () => {
    contributions = JSON.parse(JSON.stringify($applicationData.contributions));
    additionalNotes = JSON.parse(
      JSON.stringify($applicationData.additionalNotes),
    );
  };
</script>

<p>
  By joining as a member, you gain voting rights, the ability to hold CF
  offices, and a <code>@commonhaus.dev</code> email address. Your participation helps
  shape the future of our open source projects.
</p>

<h2>Apply to be a member</h2>

{#if $applicationData.feedback}
<div class="callout" data-callout="note">
  <div class="callout-content">
    {@html $applicationData.feedback.htmlContent}

    <footer class="modified">
      updated {new Date($applicationData.feedback.date).toDateString()}
    </footer>
  </div>
</div>
{/if}


<form on:submit|preventDefault={submitForm}>
  <section class="information">
    <h3><label for="contributions">Contribution Details</label></h3>
    <p>
      Briefly describe your contributions to CF or its projects over the past
      three months. Include links to pull requests, issues, discussions, or
      other relevant activities.
    </p>
    <textarea
      class="setting"
      id="contributions"
      bind:value={contributions}
      required
    ></textarea>
  </section>

  <section class="information">
    <h3><label for="additionalNotes">Additional Notes:</label></h3>
    <p>(Optional) Any other information or comments you'd like to add?</p>
    <textarea class="setting" id="additionalNotes" bind:value={additionalNotes}
    ></textarea>
  </section>

  <div class="setting">
    <span></span>
    <span class="control">
      <button name="saveAll" class="input" on:click={submitForm}>Save</button>
      <button name="reset" class="input" on:click={resetForm}>Cancel</button>
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
