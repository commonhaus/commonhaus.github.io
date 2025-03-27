<script>
  const handleClick = (_) => {
    window.location.assign(window.location.pathname);
  };
</script>

<button
  class="close"
  id="member-close"
  aria-label="Close and go to home page"
  on:click={handleClick}
>
  <svg width="24" height="24"
    ><use xlink:href="/assets/icon-symbol.svg#icon-circle-x" /></svg
  >
</button>
