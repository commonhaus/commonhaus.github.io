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
scripts:
- /assets/random-sponsor.js
---

Want to become a sponsor? Learn more about our <a href="/about/sponsorship.html">sponsorship tiers and benefits</a>.

{{- set tieredSponsors = page.data.tieredSponsors() }}
{{- set tiers = page.data.filteredTiers(tieredSponsors) }}
{{- set inKind = page.data.inKind() }}
{{- if Object.keys(tieredSponsors).length == 0 && !inKind }}
<p>Coming soon 🚀 </p>
{{ else }}
<ul class="three-columns plain-list">
{{- for key, tier of tiers }}
{{- if tieredSponsors[key] }}
<li><a href="#{{key}}-tier">{{ tier.name }} Sponsors</a></li>
{{ /if -}}
{{ /for -}}
</ul>
{{ /if }}

<p>We also extend our thanks to our <a href="providers.md">Infrastructure & Service Providers</a> and <a href="supporters.md">Community Supporters</a>.</p>

{{- for key, tier of tiers }}
{{- if tieredSponsors[key] }}
{{- set sponsorGroup = tieredSponsors[key] }}
<hr />
<h2 id="{{key}}-tier"><a class="header-anchor" href="#{{key}}-tier">{{ tier.name }} Sponsors</a></h2>
<p>{{ tier.description }}</p>

{{ include "layouts/display-sponsors.vto" { tier: tier, sponsorGroup: sponsorGroup } }}
{{ /if -}}
{{ /for -}}
