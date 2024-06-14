<script>
  function goHome(event) {
    event.preventDefault();
    window.location.hash = "";
  }
</script>

<a class="close" href="#/" on:click={goHome} aria-label="Close and go to home page">
  <svg width="24" height="24"><use xlink:href="/assets/icon-symbol.svg#icon-circle-x"/></svg>
</a>