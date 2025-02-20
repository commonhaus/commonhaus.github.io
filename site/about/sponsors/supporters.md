---
title: Our Supporters
description: List of individuals supporting the Commonhaus Foundation.
templateEngine: [vto]
index: false
metas:
  robots: false
cssclasses:
- projects
- sponsors
---

{{- set supporters = page.data.supporters() }}
{{- set tier = page.data.tier("supporter") }}
<p>{{ tier.description }}</p>

<p>We also extend our thanks to our <a href="index.md">Sponsors</a> and <a href="providers.md">Infrastructure & Service Providers</a>.</p>

{{- if supporters }}
<section class="cards wrapped">
{{- for user of supporters }}
<div class="card avatar-only">
{{ include "layouts/display-avatar.vto" { user } }}
</div>
{{- /for }}
</section>
{{ else }}
<p>Coming soon 🚀 </p>
{{ /if }}
