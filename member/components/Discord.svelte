<script>
  import ControlButton from "./ControlButton.svelte";
  export let service;
</script>

<section class="info-block">
  <h2>Discord</h2>

  {#if service}
    <div class="information">
      <p>ID: {service.id}</p>
      <p>Username: {service.username}</p>
      <p>Discriminator: {service.discriminator}</p>
      <p>Verified: {service.verified ? "Yes" : "No"}</p>
    </div>
  {:else}
    <div class="information">
      <p>Not set</p>
    </div>
  {/if}

  <div class="control">
    <ControlButton target="#/discord" />
  </div>
</section>
