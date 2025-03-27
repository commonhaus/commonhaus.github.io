<script>
  export let target = '';
</script>

<button on:click={() => { window.location.assign(window.location.pathname + target); }}>
  Update
</button>