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

<section class="cards wide">
{{- for key, tier of page.data.tiers }}
{{- if page.data.groupedSponsors[key] }}
{{- set sponsorGroup = page.data.groupedSponsors[key] }}
    <header>
        <h2>{{ tier.name }} Sponsors</h2>
        <p>{{ tier.description }}</p>
    </header>
{{- for sponsor of sponsorGroup }}
    <div class="card wide">
        <span class="logo"><a href="{{ sponsor.display.home }}">
        {{- if sponsor.display["logo-dark"] }}
            <img src='{{ sponsor.display["logo-dark"] }}' alt="" aria-hidden="true" class='dark-only' />
        {{ /if }}{{- if sponsor.display.logo }}
            <img src="{{ sponsor.display.logo }}" alt="" aria-hidden="true" class='{{- if sponsor.display["logo-dark"] }}light-only{{ /if }}' />
        {{ else }}
            <div class="wordmark">{{ sponsor.name }}</div>
        {{ /if -}}
        </a></span>
        <div class="text-content">
            <h3><a href="{{ sponsor.display.home }}">{{ sponsor.name }}</a></h3>
            <p>{{ sponsor.display.description |> md }}</p>
            {{- if sponsor.reps.length > 0 }}
            <div class="indented">
                <h4>{{ sponsor.name }} Advisory Board members</h4>
                <div class="cards wrapped">
                {{- for rep of sponsor.reps }}
                    <div class="card profile mini">
                        {{- if rep.avatarAlt }}
                        <div class="avatar-flip">
                        <img class="avatar avatar-front" src="{{ rep.avatarUrl }}" alt="{{ rep.login }}'s avatar" />
                        <img class="avatar avatar-back" src="{{ rep.avatarAlt }}" alt="{{ rep.login }}'s second avatar" />
                        {{- else }}
                        <div class="avatar">
                        <img class="avatar" src="{{ rep.avatarUrl }}" alt="{{ rep.login }}'s avatar" />
                        {{- /if }}
                        </div>
                        <div class="text-content">
                        <h5><a href="{{ rep.url }}">{{ rep.login }}</a></h5>
                        <div class="subhead">
                            {{- if rep.name }}{{ rep.name }}<br />{{ /if -}}
                        </div>
                        {{- if rep.bio }}<p>{{ rep.bio }}</p>{{ /if -}}
                        </div>
                    </div>
                {{ /for -}}
                </div>
            </div>
            {{ /if -}}
        </div>
    </div>
{{- /for }}
{{ /if -}}
{{ /for -}}
</section>
