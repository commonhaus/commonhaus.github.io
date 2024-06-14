<script>
  import {
    clear,
    refresh,
  } from "../lib/stores";

  async function reset() {
    clear();      // clear all stores
    await refresh(); // re-initialize
  }
</script>

<footer class="member-footer">
  <span>
    This application makes round-trips to GitHub. It won't win any races.
    If things get weird, try the reload button (it does more than just refreshing the page).
    If that doesn't work, let us know.
  </span>
  <div class="tooltip">
    <button name="reset"
      class="input-square"
      aria-label="Force reload of data"
      on:click={reset}
    >
    <svg width="20" height="20"><use xlink:href="/assets/icon-symbol.svg#icon-refresh"/></svg>
    <span class="tooltiptext">Force reload of data</span>
    </button>
  </div>
</footer>
