<script>
  export let target = '';
</script>

<button on:click={() => { window.location.hash = target; }}>
  Update
</button>