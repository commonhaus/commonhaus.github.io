<script>
  export let type = "note";
  export let title = "";

  const icons = {
    caution: '<svg width="24" height="24"><use xlink:href="/assets/icon-symbol.svg#icon-caution"/></svg>',
    important: '<svg width="24" height="24"><use xlink:href="/assets/icon-symbol.svg#icon-important"/></svg>',
    note: '<svg width="24" height="24"><use xlink:href="/assets/icon-symbol.svg#icon-note"/></svg>',
    success: '<svg width="24" height="24"><use xlink:href="/assets/icon-symbol.svg#icon-success"/></svg>',
    tip: '<svg width="24" height="24"><use xlink:href="/assets/icon-symbol.svg#icon-tip"/></svg>',
    warning: '<svg width="24" height="24"><use xlink:href="/assets/icon-symbol.svg#icon-warning"/></svg>',
  };
</script>

<div class="callout" data-callout="{type}">
  {#if title}
    <div class="callout-title">
      <div class="callout-title-icon">{@html icons[type]}</div>
      <div class="callout-title-inner">{title}</div>
    </div>
  {/if}
  <div class="callout-content">
    <slot></slot>
  </div>
</div>
