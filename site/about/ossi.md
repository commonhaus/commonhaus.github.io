---
title: Open Source Sustainability Initiative
description: The Commonhaus Foundation OSSI connects organizations needing continued security support for end-of-life open source software with certified partners who provide CVE remediation and compatibility fixes.
templateEngine: [vto]
index: true
metas:
  robots: true
cssclasses:
- projects
- sponsors
scripts:
- /assets/random-sponsor.js
---
<p>The Commonhaus Foundation Open Source Sustainability Initiative (OSSI) recognizes organizations
that take responsibility for the security and stability of open source software beyond its end-of-life (EOL).
For organizations that depend on EOL software but cannot yet upgrade, OSSI partners provide continued security support and compatibility fixes.</p>

<p>Explore our partners below, or <a href="#about-the-initiative">learn more about the initiative</a> and <a href="#joining-the-initiative">how to join</a>.</p>

<hr />

{{- set ossiSponsors = page.data.ossiSponsors() }}
{{- set tiers = page.data.filteredTiers(ossiSponsors) }}
{{- if Object.keys(ossiSponsors).length == 0 }}
<p>Coming soon 🚀 </p>
{{ else }}
{{- for key, tier of tiers }}
{{- if ossiSponsors[key] }}
{{- set sponsorGroup = ossiSponsors[key] }}
<h2 id="{{key}}-initiative-partners"><a class="header-anchor" href="#{{key}}-initiative-partners">{{ tier.name }} Initiative Partners</a></h2>
{{ include "layouts/display-ossi-sponsors.vto" { tier: tier, sponsorGroup: sponsorGroup } }}
{{ /if -}}
{{ /for -}}
{{ /if }}

<hr />

<h2 id="about-the-initiative"><a class="header-anchor" href="#about-the-initiative">About the Initiative</a></h2>

<p>Legacy codebases, compliance requirements, and complex dependency chains can make immediate upgrades impractical.
Our OSSI partners bridge that gap, providing ongoing support for EOL software so that project maintainers can focus on what's next.</p>

<p>Commonhaus projects are expected to clearly identify end-of-life and unsupported releases and link to this initiative as a resource for users seeking continued support.</p>

<hr />

<h2 id="pertner-commitments"><a class="header-anchor" href="#partner-commitments">Partner commitments</a></h2>

<p>Each OSSI partner determines which software and versions it supports. Inclusion in OSSI does not mean that every partner supports every Commonhaus project or every EOL release.</p>

<p>For the software a partner does support, you can expect them to:</p>

<ul>
  <li>identify, triage, and remediate security vulnerabilities in EOL software;</li>
  <li>deliver security and compatibility fixes to users who cannot yet upgrade;</li>
  <li>coordinate vulnerability disclosure with Commonhaus projects and upstream maintainers.</li>
</ul>

<hr />

<h2 id="joining-the-initiative"><a class="header-anchor" href="#joining-the-initiative">Joining the Initiative</a></h2>

<p>Participation is open to organizations that meet all of the following requirements:</p>

<ul>
  <li>Active Gold or Silver annual sponsorship of the Commonhaus Foundation;</li>
  <li>Current SOC 2 Type 1 and Type 2 certification(s);</li>
  <li>Substantive prior work on at least two (2) CVEs affecting EOL open source software relevant to Commonhaus projects, including remediation, coordinated disclosure, or delivery of fixes; and</li>
  <li>Commitment to supporting the EOL software they cover and coordinating responsible CVE disclosure with project maintainers to minimize the window of unpatched vulnerability exposure.</li>
</ul>

<p>To apply, see our <a href="/about/sponsorship.html">sponsorship tiers and benefits</a>, the <a href="/about/sponsors/ossi-agreement/">OSSI sponsorship addendum</a> and contact us at <a href="mailto:sponsors@commonhaus.org">sponsors@commonhaus.org</a>.</p>

<hr />

<h2 id="governance-and-independence"><a class="header-anchor" href="#governance-and-independence">Governance and independence</a></h2>

<p>OSSI operates within the Commonhaus Foundation's existing governance structure.
Participation does not grant governance rights, authority over project roadmaps or technical direction, or endorsement beyond inclusion in this initiative.
Foundation governance and project stewardship remain defined by the <a href="/bylaws/">bylaws</a> and <a href="/policies/">policies</a>.</p>

<p>Services listed here are provided by the named partners directly, not by the Commonhaus Foundation.
Each partner determines the specific software they support — the Foundation makes no guarantees about coverage or availability.
Use of Commonhaus project names and logos must comply with Foundation trademark guidelines.</p>
