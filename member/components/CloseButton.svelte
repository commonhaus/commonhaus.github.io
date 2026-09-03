<script>
  export let onClose = null;
  export let buttonId = "member-close";
  export let ariaLabel = "Close and go to home page";

  const handleClick = () => {
    if (onClose) {
      onClose();
    } else {
      window.location.assign(window.location.pathname);
    }
  };
</script>

<button
  class="close"
  id={buttonId}
  type="button"
  aria-label={ariaLabel}
  on:click={handleClick}
>
  <svg width="24" height="24"
    ><use xlink:href="/assets/icon-symbol.svg#icon-circle-x" /></svg
  >
</button>
