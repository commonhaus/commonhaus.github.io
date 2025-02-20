---
title: Infrastructure & Service Providers
description: List of companies providing infrastructure services to the Commonhaus Foundation.
templateEngine: [vto]
index: false
metas:
  robots: false
cssclasses:
- projects
- sponsors
---

{{- set inKind = page.data.inKind() }}
{{- set tier = page.data.tier("in-kind") }}
<p>{{ tier.description }}</p>

<p>We also extend our thanks to our <a href="index.md">Sponsors</a> and <a href="supporters.md">Supporters</a>.</p>

{{- if inKind }}
{{ include "layouts/display-sponsors.vto" {
        tier: tier,
        sponsorGroup: inKind } }}
{{ else }}
<p>Coming soon 🚀 </p>
{{ /if }}