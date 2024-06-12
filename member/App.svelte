<script>
  if (import.meta.env.VITE_APP_DEV_MODE) {
    import("./dev-mode.js");
  }
  import { onMount, onDestroy } from "svelte";
  import Apply from "./routes/MemberApplicationForm.svelte";
  import Email from "./routes/ForwardEmail.svelte";
  import Footer from "./components/Footer.svelte";
  import Home from "./routes/Home.svelte";
  import Status from "./routes/MembershipStatus.svelte";
  import Callout from "./components/Callout.svelte";
  import {
    COMMONHAUS,
    INFO,
    cookies,
    errorFlags,
    getCookies,
    hasResponse,
    isForbidden,
    knownUser,
    load,
    location,
    toaster,
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

    window.addEventListener("error", (event) => {
      logger("Global Error", event);
    });
    window.addEventListener("unhandledrejection", (event) => {
      logger("Unhandled rejection", event);
    });

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
    if (
      $location !== "" &&
      (!$knownUser ||
        isForbidden($errorFlags.info) ||
        isForbidden($errorFlags.haus))
    ) {
      window.location.hash = "";
    }
  }
</script>
<div class="toaster {$toaster.show ? 'show' : ''}">
  <Callout type={$toaster.type} title={$toaster.message}/>
</div>
<div class="content">
  {#if $location === ""}
    <Home />
  {:else if $location === "#/status"}
    <Status />
  {:else if $location === "#/apply"}
    <Apply />
  {:else if $location === "#/email"}
    <Email />
  {/if}
</div>
{#if $hasResponse}
  <Footer />
{/if}
