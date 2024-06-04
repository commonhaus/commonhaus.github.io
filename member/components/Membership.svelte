<script>
  import { mayHaveAttestations } from "../lib/memberStatus";
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
    {#if mayHaveAttestations($commonhausData.status) && $commonhausData.goodUntil}
    <GoodUntil
        goodUntil={$commonhausData.goodUntil}
        roles={$gitHubData.roles || []} />
    {/if}
  </div>
</section>
