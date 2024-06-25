---
title: About us
description: Mission and vision of The Commonhaus Foundation, including a list of current board members and project leaders.
templateEngine: [vto, md]
cssclasses:
- about
---

The Commonhaus Foundation champions the growth and stability of open source projects by fostering a community where developers, contributors, and users support each other.
Together, we ensure the sustainable development of essential open source libraries and frameworks.

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

## Current Councilors

Commonhaus Foundation [Councilors][cfc] represent community interests and ensure the foundation operates responsibly. Elected by CF Members, they serve as the voice of our community, prioritizing the CF community's interests in their decision-making.

<div class="cards">
{{- for councilor of page.data.councilors }}
  <div class="card">
    {{- if councilor.avatarAlt }}
    <div class="avatar-flip">
        <img class="avatar-front" src="{{ councilor.avatarUrl }}" alt="{{ councilor.login }}'s avatar" />
        <img class="avatar-back" src="{{ councilor.avatarAlt }}" alt="{{ councilor.login }}'s second avatar" />
    {{- else }}
    <div class="avatar">
      <img src="{{ councilor.avatarUrl }}" alt="{{ councilor.login }}'s avatar" />
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
</div>

_Note: Founding councilors will stand for election as their terms expire._

## Current Project Representatives

Our project representatives play a pivotal role in the Commonhaus Foundation's [Extended Governance Committee][egc] (EGC), ensuring that the perspectives of each foundation project are represented in foundation-wide decisions.

<div class="cards">
{{- for representative of page.data.egc }}
  <div class="card">
    {{- if representative.avatarAlt }}
    <div class="avatar-flip">
      <img class="avatar-front" src="{{ representative.avatarUrl }}" alt="{{ representative.login }}'s avatar" />
      <img class="avatar-back" src="{{ representative.avatarAlt }}" alt="{{ representative.login }}'s second avatar" />
    {{- else }}
    <div class="avatar">
      <img src="{{ representative.avatarUrl }}" alt="{{ representative.login }}'s avatar" />
    {{- /if }}
    </div>
    <div class="text-content">
      <h3><a href="{{ representative.url }}">{{ representative.login }}</a></h3>
      <div class="subhead">
          {{- if representative.name }}{{ representative.name }}<br />{{ /if -}}
          {{- representative.projects.map(p => '<a href="' + p.home + '">' + p.name + '</a>').join(', ') -}}
      </div>
      <p>
        {{- if representative.bio }}{{ representative.bio }}
        {{- else if representative.company }}<br />{{ representative.company }}{{ /if -}}
      </p>
    </div>
  </div>
{{- /for }}
</div>

## Get involved

The Commonhaus Foundation relies on the participation of a global community.
Whether you're a developer, contributor, project leader, or simply passionate about open source, there are many ways to contribute and make an impact.
From joining discussions, contributing to projects, or participating in governance, your voice and contributions are valued here.

<a href="https://github.com/sponsors/commonhaus" class="text button">Build with us</a>

[Bylaws]: ../foundation/bylaws/0-preface.md
[cfab]: ../foundation/bylaws/4-cf-advisory-board.md
[cfc]: ../foundation/bylaws/3-cf-council.md
[egc]: ../foundation/bylaws/3-cf-council.md#extended-governance-committee-egc
