<script>
  import { onMount, onDestroy } from "svelte";
  import { scrollToSection } from "./lib/scrollToSection";
  import Apply from "./routes/MemberApplicationForm.svelte";
  import Email from "./routes/ForwardEmail.svelte";
  import Footer from "./components/Footer.svelte";
  import Home from "./routes/Home.svelte";
  import Status from "./routes/MembershipStatus.svelte";
  import Callout from "./components/Callout.svelte";
  import {
    cookies,
    errorFlags,
    getCookies,
    hasResponse,
    init,
    isForbidden,
    isServerError,
    knownUser,
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

  onMount(async () => {
    getCookies(document.cookie);
    if (!$cookies["id"]) {
      window.location.assign(`${uriBase}/github`);
    } else {
      window.addEventListener("error", (event) => {
        logger("Global Error", event);
      });
      window.addEventListener("unhandledrejection", (event) => {
        logger("Unhandled rejection", event);
      });
      cleanup = await init();
      loaded = true;
    }
  });
  onDestroy(async () => {
    if (cleanup) {
      cleanup();
    }
  });

  $: {
    if (!$knownUser ||
        isServerError($errorFlags.info) ||
        isForbidden($errorFlags.info)) {
      window.location.hash = "";
    }
  }
</script>

<div class="toaster {$toaster.show ? 'show' : ''}">
  <Callout type={$toaster.type} title={$toaster.message} />
</div>
{#if $hasResponse}
  <a
  id="reset-info"
  href="#/"
  role="button"
  on:click|preventDefault={() => scrollToSection("member-reset")}
  >
  ✽
  </a>
{/if}
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
