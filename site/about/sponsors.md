---
title: Our Sponsors
description: List of Commonhaus Foundation sponsors and their Advisory Board representatives.
templateEngine: [vto]
index: false
metas:
  robots: false
cssclasses:
- projects
- sponsors
---

<ul class="two-columns">
<li><a href="providers.md">In-Kind Supporters</a></li>
{{- for key, tier of page.data.tiers }}
{{- if page.data.groupedSponsors[key] && key !== "in-kind" }}
<li><a href="#section-{{key}}">{{ tier.name }} Sponsors</a></li>
{{ /if -}}
{{ /for -}}
</ul>

{{- for key, tier of page.data.tiers }}
{{- if page.data.groupedSponsors[key] && key !== "in-kind" }}
{{- set sponsorGroup = page.data.groupedSponsors[key] }}
<hr />
<h2 id="section-{{key}}"><a class="header-anchor" href="#section-{{key}}">{{ tier.name }} Sponsors</a></h2>
<p>{{ tier.description }}</p>

{{ include "layouts/display-sponsors.vto" { tier: tier, sponsorGroup: sponsorGroup } }}
{{ /if -}}
{{ /for -}}
