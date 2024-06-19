<script>
  import { COUNCIL, load } from "../lib/stores";
  async function cfcResync(event) {
    event.preventDefault();
    await load(COUNCIL + "/teams");
  }
</script>

<div class="information">
  <ul>
    <li>Admin: <a href="#/" on:click={cfcResync}>Resync team lists</a></li>
  </ul>
</div>
