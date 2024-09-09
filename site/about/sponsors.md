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

{{- for key, tier of page.data.tiers }}
{{- if page.data.groupedSponsors[key] }}
{{- set sponsorGroup = page.data.groupedSponsors[key] }}
<hr />
<h2>{{ tier.name }} Sponsors</h2>
<p>{{ tier.description }}</p>
{{- if tier.layout == 1 }}
<section class="cards wide">
{{- for sponsor of sponsorGroup }}
    <div class="card wide">
        <span class="logo">
        {{- if sponsor.display["logo-dark"] }}
            <a href="{{ sponsor.display.home }}" class='dark-only'><img src='{{ sponsor.display["logo-dark"] }}' alt="" aria-hidden="true" /></a>
        {{ /if }}{{- if sponsor.display.logo }}
            <a href="{{ sponsor.display.home }}" class='{{- if sponsor.display["logo-dark"] }}light-only{{ /if }}'><img src="{{ sponsor.display.logo }}" alt="" aria-hidden="true"  /></a>
        {{ else }}
            <a href="{{ sponsor.display.home }}" class="wordmark">{{ sponsor.name }}</a>
        {{ /if -}}
        </span>
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
        <span class="logo">
        {{- if sponsor.display["logo-dark"] }}
            <a href="{{ sponsor.display.home }}" class='dark-only'><img src='{{ sponsor.display["logo-dark"] }}' alt="" aria-hidden="true" /></a>
        {{ /if }}{{- if sponsor.display.logo }}
            <a href="{{ sponsor.display.home }}" class='{{- if sponsor.display["logo-dark"] }}light-only{{ /if }}'><img src="{{ sponsor.display.logo }}" alt="" aria-hidden="true"  /></a>
        {{ else }}
            <a href="{{ sponsor.display.home }}" class="wordmark">{{ sponsor.name }}</a>
        {{ /if -}}
        </span>
        <div class="text-content">
            <p><a href="{{ sponsor.display.home }}">{{ sponsor.name }}</a>. 
                {{- if sponsor.display[key] }}{{ sponsor.display[key] |> md(true) }}
               {{- else }}{{ sponsor.display.description |> md(true) }}
               {{- /if -}}</p>
        </div>
    </div>
{{- /for }}
{{- else if tier.layout == 3 }}
<section class="cards wrapped">
{{- for sponsor of sponsorGroup }}
    <div class="card three">
        <span class="logo">
        {{- if sponsor.display["logo-dark"] }}
            <a href="{{ sponsor.display.home }}" class='dark-only'><img src='{{ sponsor.display["logo-dark"] }}' alt="" aria-hidden="true" /></a>
        {{ /if }}{{- if sponsor.display.logo }}
            <a href="{{ sponsor.display.home }}" class='{{- if sponsor.display["logo-dark"] }}light-only{{ /if }}'><img src="{{ sponsor.display.logo }}" alt="" aria-hidden="true"  /></a>
        {{ else }}
            <a href="{{ sponsor.display.home }}" class="wordmark">{{ sponsor.name }}</a>
        {{ /if -}}
        </span>
    </div>
{{- /for }}
{{ /if -}}
{{ /if -}}
</section>
{{ /for -}}
