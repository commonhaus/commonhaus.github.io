<script>
  import { onMount, onDestroy } from "svelte";
  import Home from "./routes/Home.svelte";
  import Status from "./routes/MembershipStatus.svelte";
  import Email from "./routes/ForwardEmail.svelte";
  import {
    COMMONHAUS,
    INFO,
    cookies,
    getCookies,
    knownUser,
    load,
    location,
    uriBase
  } from "./lib/stores";

  let cleanup;
  let loaded = false;

  const loadData = async () => {
    const controller1 = await load(INFO);
    const controller2 = await load(COMMONHAUS);

    return () => {
      controller1.abort();
      controller2.abort();
    };
  };

  onMount(async () => {
    getCookies(document.cookie);
    console.debug("Cookies", $cookies);
    if (!$cookies["id"]) {
      window.location.assign(`${uriBase}/github`);
    } else {
      loaded = true;
      cleanup = await loadData();
    }
  });
  onDestroy(async () => {
    if (cleanup) {
      cleanup();
    }
  });

  $: {
    console.debug("location", $location, "knownUser", $knownUser);
    if ($location !== "" && !$knownUser) {
      window.location.hash = "";
    }
  }
</script>

{#if $location === ""}
  <Home />
{:else if $location === "#/status"}
  <Status />
{:else if $location === "#/email"}
  <Email />
{/if}
