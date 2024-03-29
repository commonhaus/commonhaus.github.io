---
templateEngine: [vto]
layout: layouts/base.vto
title: Welcome!
cssclasses: 
- site-main
---
<div class="hero">
  <section class="text">
    <h1>Nurture projects in a community that evolves together</h1>
    <div class="subhead">Join a vibrant open-source ecosystem where flexibility and collaboration drive mutual growth for projects and their communities.</div>
    <p>
      Explore ways to contribute to, and benefit from, our collective endeavor. Your journey toward making a meaningful impact starts here.
    </p>
    <p class="button-container"><a href="foundation/COMMUNICATION.md" class="button">Get involved</a></p>
  </section>
</div>

<!-- not hero -->

<section class="why">
  <h2>We want projects to succeed on their own terms</h2>
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
    <h2>What sets Commonhaus apart</h2>
    <p>Inspired by the <a href="./codehaus.md">legacy of Codehaus</a>, the Commonhaus Foundation offers a balanced approach to governance and support, designed for the unique needs of established open-source projects.</p>
  </div>
  <div class="cards">
    <div class="card">
      <img src="/images/home_homeburst.svg" aria-hidden="true" alt="a house">
      <div class="text-content">
        <h3>Stable, long-term home</h3>
        <p>CF acknowledges the evolving nature of projects. By providing a neutral home, we offer an anchor supporting growth over time. We're committed to ensuring smooth transitions and fostering long-term resilience with thoughtful succession planning.</p>
      </div>
    </div>
    <div class="card">
      <img src="/images/home_minimal.svg" aria-hidden="true" alt="a compressed block representing minimal/reduced overhead">
      <div class="text-content">
        <h3>Minimum viable governance</h3>
        <p>Adhering to a "community-first" model, CF offers foundational support that respects project autonomy, ensuring governance is effective without being restrictive.</p>
      </div>
    </div>
    <div class="card">
      <img src="/images/home_access.svg" aria-hidden="true" alt="A piggy bank with a sprouting plant">
      <div class="text-content">
        <h3>Streamlined access to funding</h3>
        <p>As a fiscal host with connections to platforms like GitHub Sponsors and OpenCollective, CF simplifies the process of securing funding, providing your project with the resources it needs for sustainability and growth.</p>
      </div>
    </div>
  </div>
</section>

<hr />

<section class="projects">
  <h2>Our Projects</h2>
  <div class="cards">
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
    <div class="card">
      <span class="logo">
      {{ if project.logo }}<img src="{{ project.logo }}" aria-hidden="true"{{ if project.wordmark }} class="wordmark"{{ /if }}>{{ /if }}
      </span>
      <div class="text-content">
        <h3>{{ project.name }}</h3>
        <p>{{ project.description }}</p>
        <a href="{{ project.home }}" class="button">Learn More</a>
      </div>
    </div>
    {{- /for }}
  </div>
</section>
