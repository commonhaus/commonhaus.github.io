<script>
  import { commonhausData, gitHubData } from "../lib/stores";
  import ControlButton from "./ControlButton.svelte";
  import GoodUntil from "./GoodUntil.svelte";
</script>

<section class="info-block">
  <h2 class="control-heading">
    <span>Membership status</span>
    <div class="control">
      <ControlButton target="#/status" />
    </div>
  </h2>

  <div class="information">
    <p><span class="label">Status</span>: {$commonhausData.status}</p>
    {#if $commonhausData.status !== 'UNKNOWN' && $commonhausData.good_until}
    <GoodUntil
        good_until={$commonhausData.good_until}
        roles={$gitHubData.roles || []} />
    {/if}
  </div>
</section>
