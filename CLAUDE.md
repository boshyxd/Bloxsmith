# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bloxsmith is a full-stack web app for AI-powered Roblox UI generation. Users connect Roblox Studio via a Luau plugin, extract UI styles from existing games, save them to a personal library, and (future) generate new UIs guided by those styles.

Three-layer architecture: **Luau plugin** (Roblox Studio) <-> **Next.js API routes** (HTTP bridge) <-> **React frontend** (UI Forge editor).

## Commands

All commands run from `bloxsmith-frontend/`:

```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint (v9, flat config)
npm run plugin:build    # Compile studio-plugin/plugin.luau -> .rbxmx
npm run plugin:install  # Build + copy plugin to local Roblox Plugins folder
```

No test framework is configured.

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict mode)
- **Tailwind CSS v4** + **shadcn/ui** (radix-mira style, HugeIcons)
- **Supabase** for auth (email/password + Discord/GitHub OAuth) and database (`styles` table)
- **Three.js** / React Three Fiber for 3D (landing page)
- **Luau** plugin for Roblox Studio (single file: `studio-plugin/plugin.luau`)

## Path Alias

`@/*` maps to `bloxsmith-frontend/*` root (configured in tsconfig.json).

## Architecture

### Studio Bridge Protocol

The Luau plugin and frontend communicate via HTTP polling through 5 API routes at `/api/studio/*`:

1. Frontend creates a session (`POST /session`) -> gets a 6-char code
2. User enters code in Roblox Studio plugin
3. Plugin polls `GET /poll?code=...` for commands (1s interval)
4. Frontend sends commands via `POST /command`
5. Plugin executes and posts results to `POST /response`
6. Frontend polls `GET /command?code=...&requestId=...` for results (500ms interval, 30s timeout)
7. `GET /status?code=...` checks if plugin is connected (connected = polled within 10s)

Sessions are **in-memory** (`Map` in `lib/studio/session-store.ts`), 30-minute TTL. No database backing.

### Plugin Commands

- `list_screenguis` - Lists all ScreenGuis in StarterGui + PlayerGui
- `extract_ui` - Serializes a full ScreenGui instance tree to JSON in one round-trip

### Style Extraction Pipeline

`lib/studio/extract.ts` walks a `SerializedInstance` tree and computes `DesignTokens`: color palette (by frequency), fonts, corner radii, stroke patterns, transparency values.

### Data Model

Styles stored in Supabase `styles` table: `id`, `user_id`, `name`, `source_game`, `tree` (jsonb - SerializedInstance), `tokens` (jsonb - DesignTokens), `created_at`.

### Key Hooks

- `useAuth()` - Supabase auth state, user object, sign-out
- `useStudioConnection()` - Session management, polling, command send/receive
- `useStyleLibrary()` - CRUD for saved styles from Supabase

### Frontend Layout (UI Forge at `/forge/ui`)

3-column layout: AssetSidebar (260px, elements + layers tabs) | CanvasViewport (1fr, device frame) | PropertiesPanel (280px). StudioToolbar spans top with style picker and connection button slots.

### Auth Flow

Supabase handles auth. Sign-up requires email verification. OAuth redirects back to `/forge/ui`. Protected routes check `useAuth()` and redirect to `/auth` if unauthenticated.

### Client Components

All interactive components use `"use client"` directive. Supabase client is browser-only (singleton via `getSupabase()`, throws if env vars missing).

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase public anon key
REACTBITS_LICENSE_KEY          # ReactBits premium component registry
```

## Deployment

Vercel. `NEXT_PUBLIC_*` vars are client-visible.

## Conventions

- 2-space indentation, no semicolons in most files
- Functional components + hooks, no class components
- Interfaces over type aliases
- Presentational components accept props; logic lives in hooks
- Slot pattern for composable toolbars (e.g., StudioToolbar accepts `styleSlot`, `connectionSlot`)
- Plugin hardcodes `http://localhost:3000` - development only
