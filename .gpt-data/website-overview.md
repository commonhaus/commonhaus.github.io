# Commonhaus Foundation Website - Technical Overview

This document provides comprehensive technical context for AI assistants working on the Commonhaus Foundation website.

## Core Technologies

- **Runtime**: Deno - A modern JavaScript/TypeScript runtime
- **Static Site Generator**: Lume - A flexible static site generator for Deno  
- **Templating Engine**: Vento - A template engine with syntax similar to Nunjucks/Liquid
- **UI Framework**: Svelte - Used for the membership UI component
- **Build Tool**: Vite - Used to build the Svelte components
- **Styling**: SCSS - Sass preprocessing for CSS

## Project Architecture

- **Static Site Generation**: Content is pre-rendered into static HTML
- **Svelte SPA front end**: The `member` directory contains a Svelte-based UI that serves as the front-end for a GitHub App
- **GitHub Integration**: Uses GitHub APIs to fetch data about project activities, contributions, and votes
- **Content Sources**:
    - Markdown files in the repository
    - Generated content from GitHub data (discussions, PRs, etc.)
    - Foundation submodule for governance documents
    - SVG icons compiled into sprites

## Build and Deployment

- **Site Config**: `_config.ts` defines how Lume processes the site
- **Dependency Management**: `deno.json` specifies dependencies and tasks
- **GitHub Actions**: Automates content generation and deployment
- **Content Refresh**: Automatically updates site content from GitHub via scheduled jobs

## Technical Constraints

- **JavaScript/TypeScript**: All code should be written in modern JS/TS
- **Deno Native**: Use Deno's standard library and APIs where possible
- **Task Automation**: Create Deno scripts for repetitive tasks
- **Do not use React**: The project uses Svelte for interactive components

## Development Tasks

Available tasks (run with `deno task <name>`):

- `serve` - Builds and serves the website; watches for changes
- `serve-all` - Builds and serves the website with mock backend for Membership UI
- `build` - Builds the website (first Lume, then Vite+Svelte)
- `about` - Update metadata about members of the foundation
- `activity` - Query latest discussions and PRs from foundation repository
- `lastmod` - Update information about the contents of the foundation submodule
- `checkCsp` - Recompute CSP hashes

## AI Working Relationship Guidelines

When working as a pair programming partner:
- Review code thoroughly using file system access when possible
- Analyze information flow and system interactions
- Identify any inconsistencies between documentation and implementation
- Ask for clarification rather than making assumptions
- Note important system facts that should be documented
- Suggest focused approaches but let me implement the code
- Leave test execution to me

## Important Notes

- Ignore files in `public`, `node_modules`, and `.vscode` directories
- Review `./CONTRIBUTING.md` for project structure and conventions

## Project Structure

- `foundation-content` - git submodule. Contains bylaws, policies, and other governance documents.
- `member` - Svelte-based Membership UI. Requires a backend
- `site` - source
    - `_data` - data shared by / available to all pages
        - `bylaws.yml` - sidebar TOC for bylaws (manual)
        - `menu.yml` - site navigation menu (manual)
        - `metas.yml` - default metadata configuration
        - `svg.yml` - common/reusable svg
    - `_generated` - Foundation submodule metadata
        - `activity/<number>.json` - PRs and Discussion content as json files
        - `votes/<repo>/<item>.json` - vote results as json files
        - `about.yml` - maintained by `tasks/about.ts`
        - `authors.yml` - maintained by `tasks/activity.ts`
        - `foundation.json` - generated metadata (from git) for files in the foundation submodule
        - `foundation.yml` - metadata sidecar for files that should be rendered on the website (SEO descriptions, specific URL assignments, etc.)
    - `_includes` - rendering artifacts
        - `layouts` - content layout templates
        - `scss` - sass css fragments
    - `about` - "About the foundation"
        - `_data.ts` - Dynamic metadata based on merging generated sources (see below)
        - `index.md` - About Us landing page
        - `branding.md` - Branding guidelines
        - `codehaus.md` - Codehaus legacy
        - Other content from the foundation repo is placed into this section by `site/_plugins/foundationData.ts`
    - `activity` - Generated pages for discussions and PRs.
        - `_data.yml` - Common/default metadata for all pages in this section
        - `announcements.md` - Filtered view of announcements
        - `index.md` - Landing page (overview of all activity)
        - `index.page.js` - Generate pages from `site/_generated/activity/*.json`
        - `notices.md` - Filtered view of notices
    - `assets` - static source files (processed by Lume)
        - `svg` the svg icon files in this folder are combined into a single sprite by SVGSpriter in `index.page.js`
    - `community` - empty directory. The landing page for this section is `foundation-content/COMMUNICATION.md` (See `site/_foundation.yml`)
        - Canonical sources: CONTACTS.yaml, PROJECTS.yaml, etc.
        - See  `site/_plugins/foundationData.ts`
    - `static` - static files (copied to output directory)
    - `votes` - vote result summaries
        - `index.page.js` - parses all json files in `site/_generated/votes`, and creates a page and an svg for each vote result.
- `_config.ts` - Lume site config (static site generation)
- `deno.json` - Deno dependency and task configuration (akin to package.json)
- `vite.config.mjs` - Vite configuration used to build the Svelte files for the Membership UI

## Content Transformation Pipeline

The website processes content from multiple sources through several transformation steps:

### Foundation Content Processing

Foundation content from the `foundation-content/` submodule undergoes several transformations:

1. **Metadata Generation**: `tasks/lastmod.ts` generates `site/_generated/foundation.json` with git metadata
2. **URL Mapping**: `site/_foundation.yml` manually defines which foundation files become web pages and their URLs
3. **Page Generation**: `site/foundation.page.ts` combines foundation content with metadata and applies transformations:
   - Extracts frontmatter from markdown files
   - Replaces email links with online form links
   - Merges multiple data sources (git metadata, manual metadata, file frontmatter)
   - Applies appropriate layouts (bylaws, policies, foundation)

### Key Plugin Files

- **`site/_plugins/foundationPages.ts`** - Manages foundation content rendering, logo caching, URL fixing
- **`site/_plugins/authorData.ts`** - Processes author/contributor data 
- **`site/_plugins/devBackend.ts`** - Provides mock backend for development (when `MOCK_BACKEND=true`)
- **`site/_plugins/contentHash.ts`** - Handles content hashing for cache busting

### Activity/Vote Content Processing

1. **GitHub Data Fetching**: `tasks/activity.ts` queries GitHub GraphQL API for discussions, PRs, issues
2. **Vote Processing**: External workflow generates vote JSON files in `site/_generated/votes/`
3. **Page Generation**:
   - `site/activity/index.page.js` generates pages from activity JSON files
   - `site/votes/index.page.js` generates vote summary pages and SVG visualizations

### Asset Processing

- **SVG Sprites**: `site/assets/svg/index.page.js` combines individual SVG icons into sprites
- **SCSS Compilation**: Sass files in `site/_includes/scss/` are processed by Lume

## Build System Notes

The project uses dual build systems that run concurrently:
- **Lume**: Processes static site content, markdown, templates, and assets
- **Vite**: Builds Svelte components for the membership UI

**Troubleshooting Build Issues**:

- File watching conflicts may occur between Lume and Vite watchers
- Check `tasks/serve.js` and `tasks/serve-all.js` for build orchestration
- Environment variables affect build behavior (`VITE_APP_DEV_MODE`, `MOCK_BACKEND`, `DEV_MODE`)
- `deno.json` defines task permissions and may need adjustment if build tools access new directories

