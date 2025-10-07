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

<p>We also extend our thanks to our <a href="#providers">Infrastructure & Service Providers</a> and <a href="#supporters">Community Supporters</a>.</p>

{{- for key, tier of tiers }}
{{- if tieredSponsors[key] }}
{{- set sponsorGroup = tieredSponsors[key] }}
<hr />
<h2 id="{{key}}-tier"><a class="header-anchor" href="#{{key}}-tier">{{ tier.name }} Sponsors</a></h2>
<p>{{ tier.description }}</p>

{{ include "layouts/display-sponsors.vto" { tier: tier, sponsorGroup: sponsorGroup } }}
{{ /if -}}
{{ /for -}}

<hr />
<h2 id="providers"><a class="header-anchor" href="#providers">Infrastructure & Service Providers</a></h2>

{{- set inKind = page.data.inKind() }}
{{- set tier = page.data.tier("inKind") }}
<p>{{ tier.description }}</p>

{{- if inKind }}
{{ include "layouts/display-sponsors.vto" {
        tier: tier,
        sponsorGroup: inKind } }}
{{ else }}
<p>Coming soon 🚀 </p>
{{ /if }}

<hr />
<h2 id="supporters"><a class="header-anchor" href="#supporters">Supporters</a></h2>

We deeply appreciate the contributions of our Supporters, whose financial
support helps sustain the work of the Commonhaus Foundation and our projects.

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

