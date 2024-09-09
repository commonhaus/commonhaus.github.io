---
title: About us
description: Mission and vision of The Commonhaus Foundation, including a list of current board members and project leaders.
templateEngine: [vto, md]
cssclasses:
- about
---

The Commonhaus Foundation champions the growth and stability of open source projects by fostering a community where developers, contributors, and users support each other.
Together, we ensure the sustainable development of essential open source libraries and frameworks.

- [Councilors](#councilors)
- [Officers](#officers)
- [Project Representatives](#project-representatives)
- [Advisory Board](#advisory-board)

## Our guiding principles

By embodying these principles, the Commonhaus Foundation aims to provide a nurturing home for open source projects, where innovation is celebrated, collaboration is encouraged, and long-term success is achieved.

- **Honor project and community identity**

    We celebrate the distinctiveness of each project and its community, and respect their right to evolve according to their own vision and leadership.

- **Offer guidance and support instead of imposing mandates**

    Our role is to provide support and guidance, facilitating project growth without overbearing governance. By offering resources, connections, and expertise, we help projects navigate challenges while ensuring they remain in control of their path.

- **Maintain transparency in all of our actions**

    Transparency is key to building trust and fostering an open environment. We commit to clear communication, open decision-making processes, and accessible documentation, ensuring our actions and intentions are always visible to our community.

- **Encourage long-term thinking for sustained project impact**

    We advocate for forward-looking strategies that ensure projects are not just successful today but continue to thrive and evolve. Through succession planning, mentorship, and strategic guidance, we support projects in building a legacy that lasts.

## Our mission, vision and focus

We want to empower a diverse community of developers, contributors, and users to create, maintain, and evolve open source libraries and frameworks, ensuring long-term growth and stability through shared stewardship and community collaboration.

We envision a welcoming ecosystem where open source projects grow through collaboration and mutual support, simplifying participation for all by moving beyond conventional governance hurdles.

We prioritize **Application Frameworks** and **Libraries** that are critical for developers. We support self-governing, code-centric projects, steering clear of specifications and standards debates to focus on tangible outcomes.

## Community and sponsorship

Our doors are open to everyone passionate about open source innovation. We invite all individuals, not just code contributors, to participate and help shape our organization.
Our [Bylaws][] detail membership and governance, emphasizing collaboration, diverse perspectives, and advisory input from our [Advisory Board][cfab] to align sponsorship with community interests.

## Get involved

The Commonhaus Foundation relies on the participation of a global community.
Whether you're a developer, contributor, project leader, or simply passionate about open source, there are many ways to contribute and make an impact.
From joining discussions, contributing to projects, or participating in governance, your voice and contributions are valued here.

<a href="https://github.com/sponsors/commonhaus" class="text button">Build with us</a>

## Councilors

Commonhaus Foundation [Councilors][cfc] represent community interests and ensure the foundation operates responsibly. Elected by CF Members, they serve as the voice of our community, prioritizing the CF community's interests in their decision-making.

<section class="cards wrapped">
{{- for councilor of page.data.councilors }}
  <div class="card profile">
    {{- if councilor.avatarAlt }}
    <div class="avatar-flip">
        <img class="avatar avatar-front" src="{{ councilor.avatarUrl }}" alt="{{ councilor.login }}'s avatar" />
        <img class="avatar avatar-back" src="{{ councilor.avatarAlt }}" alt="{{ councilor.login }}'s second avatar" />
    {{- else }}
    <div class="avatar">
      <img class="avatar" src="{{ councilor.avatarUrl }}" alt="{{ councilor.login }}'s avatar" />
    {{- /if }}
    </div>
    <div class="text-content">
      <h3><a href="{{ councilor.url }}">{{ councilor.login }}</a></h3>
      <div class="subhead">
        {{- if councilor.name }}{{ councilor.name }}<br />{{ /if -}}
        {{- if councilor['term-start'] == 2023 }}Founder{{ if councilor.role }}, {{ /if }}{{ /if -}}
        {{- if councilor.role }}{{ councilor.role }}{{ /if -}}
      </div>
      <p>
        {{- if councilor.bio }}{{ councilor.bio |> md }}
        {{- else if councilor.company }}<br />{{ councilor.company }}{{ /if -}}
      </p>
      <footer>Term start: {{ councilor['term-start'] }}</footer>
    </div>
  </div>
{{- /for }}
</section>

_Note: Founding councilors will stand for election as their terms expire._

## Officers

<section class="cards wrapped">
{{- for officer of page.data.officers }}
  <div class="card profile">
    {{- if officer.avatarAlt }}
    <div class="avatar-flip">
      <img class="avatar avatar-front" src="{{ officer.avatarUrl }}" alt="{{ officer.login }}'s avatar" />
      <img class="avatar avatar-back" src="{{ officer.avatarAlt }}" alt="{{ officer.login }}'s second avatar" />
    {{- else }}
    <div class="avatar">
      <img class="avatar" src="{{ officer.avatarUrl }}" alt="{{ officer.login }}'s avatar" />
    {{- /if }}
    </div>
    <div class="text-content">
      <h3><a href="{{ officer.url }}">{{ officer.login }}</a></h3>
      <div class="subhead">
        {{- if officer.name }}{{ officer.name }}<br />{{ /if -}}
        {{- if officer.role }}{{ officer.role }}{{ /if -}}
      </div>
      <p>
        {{- if officer.bio }}{{ officer.bio }}
        {{- else if officer.company }}<br />{{ officer.company }}{{ /if -}}
      </p>
    </div>
  </div>
{{- /for }}
</section>

## Project Representatives

Our project representatives play a pivotal role in the Commonhaus Foundation's [Extended Governance Committee][egc] (EGC), ensuring that the perspectives of each foundation project are represented in foundation-wide decisions.

<section class="cards wrapped">
{{- for representative of page.data.egc }}
  <div class="card profile">
    {{- if representative.avatarAlt }}
    <div class="avatar-flip">
      <img class="avatar avatar-front" src="{{ representative.avatarUrl }}" alt="{{ representative.login }}'s avatar" />
      <img class="avatar avatar-back" src="{{ representative.avatarAlt }}" alt="{{ representative.login }}'s second avatar" />
    {{- else }}
    <div class="avatar">
      <img class="avatar" src="{{ representative.avatarUrl }}" alt="{{ representative.login }}'s avatar" />
    {{- /if }}
    </div>
    <div class="text-content">
      <h3><a href="{{ representative.url }}">{{ representative.login }}</a></h3>
      <div class="subhead">
          {{- if representative.name }}{{ representative.name }}<br />{{ /if -}}
          {{- representative.projects.map(p => '<a href="' + p.home + '">' + p.name + '</a>').join(', ') -}}
      </div>
      {{- if representative.bio || representative.company}}
      <p>
        {{- if representative.bio }}{{ representative.bio }}{{ /if -}}
        {{- if representative.bio && representative.company}}<br />{{ /if -}}
        {{- if representative.company }}<br />{{ representative.company }}{{ /if -}}
      </p>
      {{ /if -}}
    </div>
  </div>
{{- /for }}
</section>

## Advisory Board

The individuals listed below are representatives nominated by our sponsors to the Commonhaus Foundation's [Advisory Board][ab].
They bring industry perspectives and expertise to the conversation, to help us ensure that the foundation remains aligned with the needs of the community.

<section class="cards wrapped">
{{- for rep of page.data.advisoryBoard }}
    <div class="card profile">
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
            <h3><a href="{{ rep.url }}">{{ rep.login }}</a></h3>
            <div class="subhead">
                {{- if rep.name }}{{ rep.name }}<br />{{ /if -}}
                {{- if rep.sponsorHome }}<a href="{{ sponsorHome }}">{{ rep.sponsorName }}</a>
                {{- else -}}{{ rep.sponsorName }}
                {{- /if -}}
            </div>
            {{- if rep.bio }}<p>{{ rep.bio }}</p>{{ /if -}}
        </div>
    </div>
{{- /for }}
</section>

[Bylaws]: ../foundation/bylaws/1-preface.md
[cfab]: ../foundation/bylaws/5-cf-advisory-board.md
[cfc]: ../foundation/bylaws/4-cf-council.md
[egc]: ../foundation/bylaws/4-cf-council.md#extended-governance-committee-egc
[ab]: ../foundation/bylaws/5-cf-advisory-board.md
