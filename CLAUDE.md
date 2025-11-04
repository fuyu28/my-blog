# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
All responses should be in Japanese.

## Project Overview

This is a Next.js 15 blog application that fetches MDX content from a GitHub repository via the GitHub API. The blog uses the App Router architecture with TurboPack for optimized builds.

## Development Commands

```bash
# Start development server with TurboPack
npm run dev

# Build for production with TurboPack
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

Development server runs on http://localhost:3000

## Architecture

### Content Flow

The blog implements a GitHub-backed content management system:

1. **GitHub Content Fetching** (`src/lib/github/`)
   - `client.ts`: Creates an authenticated Octokit instance using GitHub App credentials
   - `contentFetch.ts`: Fetches MDX file lists and raw content from the configured GitHub repository
   - Uses environment variables to specify target repository and branch

2. **Content Processing** (`src/lib/content/`)
   - `parsePost.ts`: Parses raw MDX into frontmatter + content using gray-matter
   - `frontmatterSchema.ts`: Zod schema validation for frontmatter (title, type, visibility, accessMode, etc.)
   - `posts.ts`: High-level API for listing posts and fetching individual posts by slug

3. **Rendering** (`src/app/`)
   - App Router with dynamic routes: `/post/[slug]`
   - Static generation using `generateStaticParams` to pre-render all blog posts
   - MDX rendering via `next-mdx-remote-client`

### Key Design Patterns

- **Frontmatter Schema**: All blog posts must conform to the Zod schema in `frontmatterSchema.ts`. Required fields: `title`, `type`, `visibility`, `accessMode`. Optional: `thumbnail`, `publishedAt`, `updatedAt`, `description`, `topics`, `isDeep`
- **GitHub Authentication**: Uses GitHub App authentication (not personal access tokens) requiring App ID, private key, and installation ID
- **Static Site Generation**: Posts are fetched at build time from GitHub and statically generated

## Environment Variables

Required environment variables (see `src/env.d.ts` for type definitions):

```
GITHUB_APP_ID          - GitHub App ID number
GITHUB_PRIVATE_KEY     - GitHub App private key (PEM format)
GITHUB_INSTALLATION_ID - GitHub App installation ID
GITHUB_OWNER           - GitHub repository owner
GITHUB_REPO            - GitHub repository name
GITHUB_REF             - Branch/ref to fetch content from (defaults to "main")
```

## Path Aliases

Uses `@/*` alias for `./src/*` imports.

## Code Style

- TypeScript strict mode enabled
- Uses Zod for runtime validation of external data (GitHub content, frontmatter)
- Japanese comments are used in some files (this is intentional)
