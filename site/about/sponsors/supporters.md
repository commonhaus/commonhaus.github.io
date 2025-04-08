---
title: Our Supporters
description: List of individuals supporting the Commonhaus Foundation.
templateEngine: [vto, md]
index: false
metas:
  robots: false
cssclasses:
- projects
- sponsors
---

We deeply appreciate the contributions of our Supporters, whose financial
support helps sustain the work of the Commonhaus Foundation and our projects.

We also extend our thanks to our <a href="index.md">Sponsors</a> and <a href="providers.md">Infrastructure & Service Providers</a>.

{{- set supporters = page.data.supporters() }}
{{- if supporters && supporters.length }}
<section class="cards avatars">
{{- for user of supporters }}
<div class="card avatar-only">
{{- include "layouts/display-avatar.vto" { user } -}}
</div>
{{- /for }}
</section>
{{ else }}
<p>Coming soon 🚀 </p>
{{ /if }}
