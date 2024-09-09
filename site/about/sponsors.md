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
{{- for key, tier of page.data.tiers }}
{{- if page.data.groupedSponsors[key] }}
<li><a href="#section-{{key}}">{{ tier.name }} Sponsors</a></li>
{{ /if -}}
{{ /for -}}
</ul>

{{- for key, tier of page.data.tiers }}
{{- if page.data.groupedSponsors[key] }}
{{- set sponsorGroup = page.data.groupedSponsors[key] }}
<hr />
<h2 id="section-{{key}}"><a class="header-anchor" href="#section-{{key}}">{{ tier.name }} Sponsors</a></h2>
<p>{{ tier.description }}</p>
{{- if tier.layout == 1 }}
<section class="cards wide">
{{- for sponsor of sponsorGroup }}
    <div class="card wide">
        {{ include "layouts/display-logo.vto" { name: sponsor.name, display: sponsor.display } }}
        <div class="text-content">
            <h3><a href="{{ sponsor.display.home }}">{{ sponsor.name }}</a></h3>
            <p>{{ sponsor.display.description |> md(true) }}</p>
        </div>
    </div>
{{- /for }}
{{- else if tier.layout == 2 }}
<section class="cards wrapped">
{{- for sponsor of sponsorGroup }}
    <div class="card two">
        {{ include "layouts/display-logo.vto" { name: sponsor.name, display: sponsor.display } }}
        <div class="text-content">
            <p><a href="{{ sponsor.display.home }}">{{ sponsor.name }}</a>. 
                {{- if sponsor.display[key] }} {{ sponsor.display[key] |> md(true) }}
                {{- else }} {{ sponsor.display.description |> md(true) }}
                {{- /if -}}</p>
        </div>
    </div>
{{- /for }}
{{- else if tier.layout == 3 }}
<section class="cards wrapped">
{{- for sponsor of sponsorGroup }}
    <div class="card three">
        {{ include "layouts/display-logo.vto" { name: sponsor.name, display: sponsor.display } }}
    </div>
{{- /for }}
{{ /if -}}
{{ /if -}}
</section>
{{ /for -}}
