<script>
  import { load, uriBase } from "../lib/stores";

  async function cfcProjectAliases(event) {
    event.preventDefault();
    await load(uriBase + "/keeper/projectAliases");
  }
  async function cfcVerifyLogins(event) {
    event.preventDefault();
    await load(uriBase + "/keeper/verifyLogins");
  }
  async function cfcInstallations(event) {
    event.preventDefault();
    await load(uriBase + "/manager/installations");
  }
  async function cfcOrg(event) {
    event.preventDefault();
    await load(uriBase + "/manager/org");
  }
  async function cfcProjects(event) {
    event.preventDefault();
    await load(uriBase + "/manager/projects");
  }
  async function cfcSponsors(event) {
    event.preventDefault();
    await load(uriBase + "/manager/sponsors");
  }
  async function cfcVotes(event) {
    event.preventDefault();
    await load(uriBase + "/rules/votes");
  }
</script>

<div class="information">
  <strong>Admin</strong>
  <ul>
    <li><a href="#/" on:click={cfcProjectAliases}>Keeper: Resync project aliases</a></li>
    <li><a href="#/" on:click={cfcVerifyLogins}>Keeper: Verify logins</a></li>
  </ul>
  <ul>
    <li><a href="#/" on:click={cfcInstallations}>Manager: Verify HausManager installations</a></li>
    <li><a href="#/" on:click={cfcOrg}>Manager: Resync organization membership</a></li>
    <li><a href="#/" on:click={cfcProjects}>Manager: Resync project configuration</a></li>
    <li><a href="#/" on:click={cfcSponsors}>Manager: Resync sponsors</a></li>
  </ul>
  <ul>
    <li><a href="#/" on:click={cfcVotes}>Rules: Count votes</a></li>
  </ul>
</div>
