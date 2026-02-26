# Bloxsmith — UI Forge Architecture

## Overview

UI Forge lets users build Roblox UIs by extracting styles from their existing games and reusing them as generation presets. The core loop:

1. Connect Roblox Studio to Bloxsmith via a session code
2. Browse and select ScreenGuis from the live game
3. Extract full UI styling into a portable format
4. Save styles to a personal library
5. Generate new UIs guided by saved styles + layout references

---

## System Diagram

```
┌─────────────────┐     HTTP poll      ┌──────────────────────┐
│  Roblox Studio   │◄──────────────────►│  Next.js API Routes  │
│  (Luau Plugin)   │  localhost/remote  │  /api/studio/*       │
└─────────────────┘                     └──────────┬───────────┘
                                                   │
                                        ┌──────────▼───────────┐
                                        │  UI Forge Frontend   │
                                        │  /forge/ui           │
                                        └──────────────────────┘
```

---

## 1. Studio Connection

### Plugin (Luau)

A lightweight Roblox Studio plugin that:
- Shows a toolbar button / widget with a code input field
- On submit, begins polling `{host}/api/studio/poll?code={code}`
- Executes commands received from poll responses (extract hierarchy, read properties)
- Posts results back to `/api/studio/response`

The plugin reuses the proven HTTP bridge pattern from robloxstudio-mcp:
- GET `/api/studio/poll?code={code}` — long-poll for pending commands
- POST `/api/studio/response` — return command results with requestId

### API Routes (Next.js)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/studio/session` | POST | Create session, return 6-char code |
| `/api/studio/poll` | GET | Plugin polls for pending commands |
| `/api/studio/response` | POST | Plugin returns command results |
| `/api/studio/command` | POST | Frontend queues a command for the plugin |
| `/api/studio/status` | GET | Check if plugin is connected |

Sessions are in-memory (Map) for MVP. Each session:
```ts
{
  code: string           // 6-char alphanumeric
  createdAt: number
  lastPing: number       // last poll timestamp
  pending: Command[]     // queued commands
  responses: Map<string, Response>
}
```

### Connection Flow

1. User clicks "Connect Studio" on /forge/ui
2. Frontend POSTs `/api/studio/session` → receives `{ code: "A3X9K2" }`
3. User enters code in Roblox Studio plugin
4. Plugin starts polling `/api/studio/poll?code=A3X9K2`
5. Frontend polls `/api/studio/status?code=A3X9K2` — detects connection
6. UI updates to "Connected" state

---

## 2. UI Extraction

### Strategy: Full Luau Serialization

Instead of reading properties one-by-one via bridge calls, the plugin serializes the entire ScreenGui tree into a Luau-compatible JSON blob in a single round-trip. This is faster and captures everything.

### Extraction Command

Frontend sends command: `{ type: "extract_ui", path: "game.StarterGui.ScreenGui" }`

Plugin executes a recursive serializer that captures:
- Instance hierarchy (parent-child tree)
- All UI properties: Position, Size, AnchorPoint, BackgroundColor3, BackgroundTransparency, BorderSizePixel, BorderColor3, ZIndex, LayoutOrder, Visible, ClipsDescendants
- Text properties: Text, TextColor3, TextSize, TextXAlignment, TextYAlignment, Font, RichText, TextWrapped, TextScaled
- Image properties: Image (asset ID), ImageColor3, ImageTransparency, ScaleType, SliceCenter
- Modifier properties: UICorner (CornerRadius), UIStroke (Color, Thickness, Transparency), UIPadding (all sides), UIListLayout/UIGridLayout (all props), UIGradient (Color, Rotation, Transparency), UIScale, UIAspectRatioConstraint, UISizeConstraint
- Attributes and tags

### Output Format

```json
{
  "className": "ScreenGui",
  "name": "MainMenu",
  "properties": { "IgnoreGuiInset": true },
  "children": [
    {
      "className": "Frame",
      "name": "Container",
      "properties": {
        "Size": { "XScale": 1, "XOffset": 0, "YScale": 1, "YOffset": 0 },
        "BackgroundColor3": { "R": 0.1, "G": 0.1, "B": 0.12 },
        "BackgroundTransparency": 0
      },
      "children": [...]
    }
  ]
}
```

---

## 3. Style Library

### What is a "Style"?

A saved style is a snapshot of UI design patterns extracted from a real game UI. It contains:
- The full serialized UI tree (source of truth)
- Computed design tokens: color palette, font stack, corner radii, spacing patterns, stroke usage
- A thumbnail (rendered server-side or screenshot)
- User-assigned name and tags

### Storage (MVP)

localStorage for MVP, migrating to Supabase later:
```ts
{
  id: string
  name: string
  createdAt: number
  sourceGame?: string
  tree: SerializedUI        // full extraction
  tokens: DesignTokens      // computed summary
  thumbnail?: string        // base64 or URL
}
```

### Design Token Extraction

Computed from the serialized tree:
- **Colors**: unique BackgroundColor3 / TextColor3 / ImageColor3 values, sorted by frequency
- **Fonts**: unique Font values with usage counts
- **Corner radii**: unique UICorner CornerRadius values
- **Spacing**: UIPadding and UIListLayout.Padding patterns
- **Strokes**: UIStroke patterns (color, thickness)
- **Transparency patterns**: common BackgroundTransparency values

---

## 4. Generation (Future — Not in Scope Now)

Users will prompt for new UIs referencing a saved style:
- "Build a settings menu in this style" + attach style
- "Match this layout" + attach reference image
- AI generates Luau UI code matching the style tokens

---

## File Structure

```
bloxsmith-frontend/
├── app/
│   ├── api/
│   │   └── studio/
│   │       ├── session/route.ts      # POST: create session
│   │       ├── poll/route.ts         # GET: plugin polls
│   │       ├── response/route.ts     # POST: plugin responds
│   │       ├── command/route.ts      # POST: frontend sends command
│   │       └── status/route.ts       # GET: connection status
│   ├── forge/
│   │   └── ui/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   └── auth/
│       └── page.tsx
├── components/
│   └── forge/
│       ├── studio-toolbar.tsx        # Top bar: style dropdown, connection status
│       ├── asset-sidebar.tsx         # Left: elements + layers tabs
│       ├── layer-tree.tsx            # Layer hierarchy viewer
│       ├── canvas-viewport.tsx       # Center: device frame preview
│       ├── properties-panel.tsx      # Right: property inspector
│       ├── connect-dialog.tsx        # Studio connection modal
│       └── style-picker.tsx          # Style library dropdown/browser
├── lib/
│   ├── utils.ts                     # cn() utility
│   └── studio/
│       ├── session-store.ts          # In-memory session management
│       ├── types.ts                  # Shared types for bridge protocol
│       └── extract.ts               # UI tree → design tokens
├── hooks/
│   ├── use-studio-connection.ts      # Poll connection status, send commands
│   └── use-style-library.ts         # CRUD for saved styles (localStorage)
└── studio-plugin/
    └── plugin.luau                   # Roblox Studio plugin source
```

---

## Implementation Order

### Phase 1 — Shell & Cleanup (now)
- Clean up forge UI: remove icons, minimalist design
- Scaffold all directories and stub files
- Style dropdown (hardcoded presets for now)

### Phase 2 — Bridge API
- Session store (in-memory Map)
- 5 API routes with request/response queue
- Plugin Luau source (HTTP polling, command execution)

### Phase 3 — Connection UI
- Connect dialog component
- `useStudioConnection` hook (poll status, send commands)
- Connection indicator in toolbar

### Phase 4 — Extraction
- Plugin-side recursive UI serializer
- `extract.ts` — parse tree into design tokens
- ScreenGui dropdown populated from live Studio data

### Phase 5 — Style Library
- `useStyleLibrary` hook (localStorage CRUD)
- Style picker component
- Save extracted style flow

---

## Design Decisions

- **Single round-trip extraction**: Serialize entire UI tree in Luau on the plugin side, send as one JSON blob. Avoids dozens of bridge calls.
- **In-memory sessions**: No database for MVP. Sessions expire after 30 minutes of inactivity.
- **localStorage styles**: No auth/database dependency for MVP. Styles are per-browser.
- **Plugin is read-only**: The extraction plugin never modifies the game. Write operations are a separate concern.
- **Luau plugin, not roblox-ts**: The plugin is simple enough that raw Luau is cleaner than adding a TypeScript compilation step for a single file.
