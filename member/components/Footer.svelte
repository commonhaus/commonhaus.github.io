<script>
  import {
    COMMONHAUS,
    load,
  } from "../lib/stores";
  async function refresh() {
    await load(COMMONHAUS + "?refresh=true");
  }
</script>

<footer class="member-footer">
  <div class="tooltip">
    <button name="reset"
      class="input-square"
      aria-label="Force reload of data"
      on:click={refresh}
    >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-ccw-dot"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/><circle cx="12" cy="12" r="1"/></svg>
    <span class="tooltiptext">Force reload of data</span>
    </button>
  </div>
</footer>
