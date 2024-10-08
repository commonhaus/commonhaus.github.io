---
title: In-Kind Supporters
description: List of companies providing infrastructure services to the Commonhaus Foundation.
templateEngine: [vto]
index: false
metas:
  robots: false
cssclasses:
- projects
- sponsors
---

<p>{{ page.data.tiers["in-kind"].description }}</p>

<p>Please see our other <a href="sponsors.md">Sponsors</a>, as well.</p>

{{ include "layouts/display-sponsors.vto" { 
        tier: page.data.tiers["in-kind"], 
        sponsorGroup: page.data.groupedSponsors["in-kind"] } }}