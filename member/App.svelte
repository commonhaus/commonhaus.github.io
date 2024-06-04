<script>
  import { onMount, onDestroy } from "svelte";
  import Footer from "./components/Footer.svelte";
  import Home from "./routes/Home.svelte";
  import Status from "./routes/MembershipStatus.svelte";
  import Email from "./routes/ForwardEmail.svelte";
  import {
    COMMONHAUS,
    INFO,
    cookies,
    getCookies,
    hasResponse,
    knownUser,
    load,
    location,
    uriBase,
  } from "./lib/stores";

  let cleanup;
  let loaded = false;

  const logger = (message, event) => {
    console.error(message, event.reason);
    console.debug(event);
  };

  const loadData = async () => {
    const controller1 = await load(INFO);
    const controller2 = await load(COMMONHAUS);

    window.addEventListener(
      "error",
      (event) => {
        logger("Global Error", event);
      }
    );
    window.addEventListener(
      "unhandledrejection",
      (event) => {
        logger("Unhandled rejection", event);
      }
    );

    return () => {
      controller1.abort();
      controller2.abort();
    };
  };

  onMount(async () => {
    getCookies(document.cookie);
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
    if ($location !== "" && !$knownUser) {
      window.location.hash = "";
    }
  }
</script>

<div class="content">
  {#if $location === ""}
    <Home />
  {:else if $location === "#/status"}
    <Status />
  {:else if $location === "#/email"}
    <Email />
  {/if}
</div>

{#if $hasResponse}
  <Footer />
{/if}
