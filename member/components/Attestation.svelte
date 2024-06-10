<script>
  import {
    checkRecentAttestation,
    getAttestationText,
    getAttestationVersion,
    getNextAttestationDate,
    signAttestation,
    attestationInfo,
  } from "../lib/attestations";
  import {
    commonhausData,
  } from "../lib/stores";

  export let id;

  let pending = false;

  let attestation, currentVersion, date, ok;
  $: {
    attestation = getAttestationText(id);
    currentVersion = getAttestationVersion(id);
    date = getNextAttestationDate(id, $commonhausData);
    ok = checkRecentAttestation(id, $commonhausData);
  }

  const iAgree = async (id) => {
    pending = true;
    await signAttestation(id);
    pending = false;
  };
</script>

<section class="information" id="{id}">
  <h3 class="good-until">
    <span>{@html attestation.title}</span>
    <span class:ok class:required={!ok}>{date}</span>
  </h3>
  {@html attestation.body}
  {#if !ok}
    <div class="setting">
      <span class="prompt">{attestationInfo.agreement}</span>
      <span class="control">
        <button name="agree" on:click={iAgree(id)} disabled={pending}>I Agree</button>
      </span>
    </div>
  {/if}
  <footer class="agreement-version">
    version <a
      href="https://github.com/commonhaus/foundation/blob/main/agreements/membership/members.yaml"
      >{currentVersion}</a
    >
  </footer>
</section>
