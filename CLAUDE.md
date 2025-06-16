# Commonhaus Foundation Website - Claude Context

This is the technical context file for Claude Code when working on the Commonhaus Foundation website.

## Quick Reference

For comprehensive technical details, see:
- **[Website Overview](.gpt-data/website-overview.md)** - Complete technical context including:
  - Core technologies (Deno, Lume, Vento, Svelte)
  - Project architecture and constraints
  - Development tasks and build process
  - Detailed project structure
  - AI working relationship guidelines
- **[Contributing Guide](CONTRIBUTING.md)** - Setup instructions and contribution guidelines

## Key Points for Claude

- **Runtime**: Deno with Lume static site generator and Vento templating
- **UI Framework**: Svelte (in `member/` directory) - serves as GitHub App frontend
- **No React**: Use Svelte for interactive components
- **Ignore**: Files in `public`, `node_modules`, and `.vscode` directories
- **Foundation Content**: Located in `foundation-content/` git submodule
- **Task Scripts**: Located in `tasks/` directory

## Available Commands

- `deno task serve` - Build and serve with file watching
- `deno task serve-all` - Build and serve with mock backend for membership UI
- `deno task build` - Build the website (Lume + Vite/Svelte)
- `deno task about` - Update member metadata
- `deno task activity` - Update discussion/PR data
- `deno task lastmod` - Update foundation submodule metadata
- `deno task checkCsp` - Recompute CSP hashes