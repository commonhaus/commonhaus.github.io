# Contributing to Commonhaus Foundation Website

We appreciate your interest in contributing to our project! This document provides some basic guidelines for contributing.

## Deno, Lume and Vento

This project uses [Deno](https://deno.land/) as the runtime, the [Lume static site generator](https://lume.land/) and [Vento templating engine](https://vento.js.org/).

## Setup

1. **Checkout this repository and all recursive submodules**

   You can do this by running the following command:

   \`\`\`bash
   git clone --recursive https://github.com/commonhaus/commonhaus.github.io.git
   \`\`\`

2. **Install Deno**

   Install it by following the instructions on the [Deno website](https://deno.land/#installation).

3. **Serve the website**

   You can serve the website locally by running the following command:

   \`\`\`bash
   deno task serve
   \`\`\`

  Other tasks are available (in `deno.json`, list with `deno task`):
  
  - `attach`: Attaches a debugger to lume.
  - `build`: Builds the website.
  - `debug`: Allows you to attach a debugger to a deno task.
  - `serve`: Builds and serves the website, and watch for changes.
  
  - `checklocal`: test links against a running local server.
  - `lastmod`: update information about the contents of the foundation submodule (requires GH CLI).
  - `activity`: Query the latest discussions and PRs from the foundation repository and update corresponding site pages (requires GH CLI).

## Project Structure

- `site/activity`: Pages are generated from PRs and other activity in other Commonhaus Foundation repositories.
- `site/foundation`: This is a GitHub submodule. It is the source for bylaws, policies, and other governance documents.
- `site/votes`: This contains generated vote results.

### Weird things

- **Foundation pages** have to render properly in both the original repository (and in pdfs) and on the website. That means, some weirdness. 
  - `bylaws.vto` and `foundation.vto` both assume the content already contains the h1/title (which these pages do). 
  - `_includes/foundation.json` is generated/updated with the last modified information for the foundation repository.
  - `_includes/foundation.yml` is hand-tended to specify the pages from the foundation repository that should be included in the website (and to specify the URL they should use and provide a meta description, etc.).
- **Activities** are GH Discussions, Pull Requestsm and Vote Results. All are generated as a result of GraphQL queries.
  - Discussions and Pull Requests are stored as markdown files in the `site/activity` directory.
  - Vote results are captured as JSON files in `site/votes` and then rendered as both html and svg files.
- **Sidebars**: 
  - `bylaws.vto' defines a navigation sidebar for bylaws and policies.
  - `activityVote.vto` and `activity.vto` both use `activitySidebar.vto` to define a sidebar for individual activity pages.


## Contributing

Once you've set up the project, you're ready to start contributing! Please make sure to read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

If you're fixing a bug or implementing a feature, please create a branch and submit a pull request. If you're not sure where to start, take a look at the [issues](https://github.com/commonhaus/commonhaus.github.io/issues) in this repository.

Thank you for your contribution!