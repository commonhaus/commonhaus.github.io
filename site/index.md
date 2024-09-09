---
templateEngine: [vto]
layout: layouts/base.vto
title: Building a forever home for open source projects
preload:
- <link rel="preload" fetchpriority="high" as="image" href="/images/hero_mainimage.webp" type="image/webp">
cssclasses:
- site-main
---
<div class="hero">
  <section class="text">
    <h1>Building a forever home for open source projects</h1>
    <div class="subhead">We are a non-profit organization dedicated to the sustainability of open source libraries and frameworks.</div>
    <p class="button-container"><a href="https://github.com/sponsors/commonhaus" class="button">Build with us</a></p>
  </section>
</div>

<!-- not hero -->

<section class="why">
  <h2 id="succeed-on-your-terms" tabindex="-1">
    <a class="header-anchor" href="#succeed-on-your-terms">We want projects to succeed on their own terms</a>
  </h2>
  <div class="text">
    <p>
      At the Commonhaus Foundation (CF), we're committed to creating a collaborative environment that nurtures the growth and sustainability of projects and their communities.
    </p>
    <p>Our guiding principles are straightforward yet impactful:</p>
    <ul class="two-columns">
      <li>Honor project and community identity</li>
      <li>Offer guidance and support instead of imposing mandates</li>
      <li>Maintain transparency in all of our actions</li>
      <li>Encourage long-term thinking for sustained project impact</li>
    </ul>
  </div>
</section>

<hr />

<section class="what">
  <div>
    <h2 id="what-sets-commonhaus-apart" tabindex="-1">
      <a class="header-anchor" href="#what-sets-commonhaus-apart">What sets Commonhaus apart</a>
    </h2>
    <p>Inspired by the <a href="./about/codehaus.md">legacy of Codehaus</a>, the Commonhaus Foundation offers a balanced approach to governance and support, designed for the unique needs of established open source projects.</p>
  </div>
  <div class="cards">
    <div class="card">
      <img src="/images/home_homeburst.svg" aria-hidden="true" alt="a house">
      <div class="text-content">
        <h3>Stable, long-term home</h3>
        <p>We acknowledge the evolving nature of projects. By providing a neutral home, we offer an anchor supporting growth over time. We're committed to ensuring smooth transitions and fostering long-term project health with thoughtful succession planning.</p>
      </div>
    </div>
    <div class="card">
      <img src="/images/home_minimal.svg" aria-hidden="true" alt="a compressed block representing minimal/reduced overhead">
      <div class="text-content">
        <h3>Minimum viable governance</h3>
        <p>Adhering to a "community-first" model, we offer support that respects project autonomy, ensuring governance is effective without being restrictive.</p>
      </div>
    </div>
    <div class="card">
      <img src="/images/home_access.svg" aria-hidden="true" alt="A piggy bank with a sprouting plant">
      <div class="text-content">
        <h3>Streamlined access to funding</h3>
        <p>As a fiscal host with connections to platforms like GitHub Sponsors and OpenCollective, we simplify the process of securing funding, providing your project with the resources it needs for sustainability and growth.</p>
      </div>
    </div>
  </div>
</section>

<hr />

<section class="projects">
  <h2 id="our-projects" tabindex="-1">
    <a class="header-anchor" href="#our-projects">Our Projects</a>
  </h2>
  <div class="cards wide">
    <!-- Highlighted Project Card -->
    <!-- <div class="card featured">
      <div class="text-content">
        <h3>Featured Project Name</h3>
        <p>Short description of the featured project, highlighting its goals, recent achievements, or unique features.</p>
        <a href="project_link.html" class="button">Learn More</a>
      </div>
    </div> -->
    <!-- Other Project Cards -->
    {{- for project of page.data.listProjects() }}
    <div class="card wide">
      <span class="logo">
      {{- if project["logo-dark"] }}
        <a href="{{ project.home }}" class='dark-only'><img src='{{ project["logo-dark"] }}' alt="" aria-hidden="true" /></a>
      {{ /if }}
      {{ if project.logo }}
        <a href="{{ project.home }}" class='{{- if project["logo-dark"] }}light-only{{ /if }}'><img src="{{ project.logo }}" alt="" aria-hidden="true"/></a>
      {{ else }}
        <a href="{{ project.home }}" class="wordmark">{{ project.name }}</a>
      {{ /if }}
      </span>
      <div class="text-content">
        <h3><a href="{{ project.home }}">{{ project.name }}</a></h3>
        <p>{{ project.description }}</p>
      </div>
    </div>
    {{- /for }}
  </div>
</section>
