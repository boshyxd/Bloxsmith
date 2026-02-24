# Style Extraction Pipeline

How we turn real production Roblox UIs into reusable style presets that power AI generation.

---

## Overview

The core insight: AI can generate UI layout and code, but it can't generate the custom image assets, fine-tuned gradients, and visual polish that make production UIs look professional. We extract those non-reproducible elements from real games and build them into our style presets so every generation ships with real assets instead of placeholders.

```
Production Game UI
       │
       ▼
┌─────────────────────┐
│  MCP Server Extract  │  ← execute_luau via robloxstudio-mcp
│  (full Instance tree)│
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Decompose & Classify│
│  into asset types    │
└─────────┬───────────┘
          │
    ┌─────┴──────┐
    ▼            ▼
┌────────┐  ┌──────────┐
│ Design │  │  Asset   │
│ Tokens │  │ Catalog  │
│ (JSON) │  │ (images, │
│        │  │ sounds)  │
└───┬────┘  └────┬─────┘
    │            │
    ▼            ▼
┌─────────────────────┐
│   Style Preset       │
│   (tokens + assets   │
│    + component specs)│
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Injected into Claude│
│  system prompt per   │
│  generation request  │
└──────────────────────┘
```

---

## Step 1: Extract the Full UI Tree

Use the MCP server's `execute_luau` tool to run an extraction script in Studio that walks the entire UI hierarchy and serializes it.

The extraction script captures per-Instance:
- **ClassName** (Frame, TextLabel, ImageLabel, TextButton, ScrollingFrame, etc.)
- **All visual properties** — Size, Position, AnchorPoint, BackgroundColor3, BackgroundTransparency, BorderSizePixel
- **Text properties** — Text, Font/FontFace, TextSize, TextColor3, TextXAlignment, TextYAlignment, TextWrapped, RichText
- **Image properties** — Image (rbxassetid://), ImageColor3, ImageTransparency, ScaleType, SliceCenter (for 9-slice)
- **UI modifiers** — UICorner.CornerRadius, UIStroke (Color, Thickness, ApplyStrokeMode), UIGradient (Color, Rotation, Offset), UIPadding, UIListLayout/UIGridLayout (Padding, SortOrder, FillDirection, HorizontalAlignment)
- **Tween/animation data** — if scripts reference TweenService on UI elements, capture the TweenInfo parameters (Time, EasingStyle, EasingDirection)
- **Hierarchy** — parent-child relationships, ZIndex, LayoutOrder
- **Sound IDs** — any Sounds parented to UI elements (click, hover, transition sounds)

Output format: structured JSON, one file per screen/ScreenGui.

```json
{
  "source_game": "GameName",
  "screen_name": "ShopUI",
  "instances": [
    {
      "name": "MainFrame",
      "class": "Frame",
      "properties": {
        "Size": {"Scale": [0.4, 0.6], "Offset": [0, 0]},
        "Position": {"Scale": [0.3, 0.2], "Offset": [0, 0]},
        "AnchorPoint": [0.5, 0.5],
        "BackgroundColor3": [30, 30, 40],
        "BackgroundTransparency": 0,
        "BorderSizePixel": 0
      },
      "modifiers": {
        "UICorner": {"CornerRadius": {"Scale": 0, "Offset": 12}},
        "UIStroke": {"Color": [60, 60, 80], "Thickness": 2},
        "UIPadding": {"Top": 12, "Bottom": 12, "Left": 16, "Right": 16}
      },
      "children": ["TitleLabel", "ItemGrid", "CloseButton"]
    }
  ]
}
```

---

## Step 2: Classify Into Reproducible vs Non-Reproducible

Not everything extracted goes into the same bucket. AI can reproduce some things perfectly; others need to be stored as-is.

### Reproducible by AI (→ Design Tokens)

These get abstracted into style rules that Claude follows during generation:

- **Color palette** — extract all unique Color3 values, cluster them into roles (background, surface, accent, text-primary, text-secondary, border, error, success)
- **Typography scale** — extract all Font + TextSize combinations, map to a scale (heading-xl, heading-lg, body, caption, etc.)
- **Spacing system** — extract all UIPadding and UIListLayout.Padding values, identify the spacing scale (4, 8, 12, 16, 24, 32...)
- **Corner radii** — extract all UICorner.CornerRadius values, identify the radius scale
- **Stroke patterns** — UIStroke thickness/color patterns per component type
- **Gradient patterns** — UIGradient ColorSequence/Rotation patterns (these are reproducible but tricky — store exact values)
- **Layout patterns** — how components are arranged (UIListLayout vs manual positioning, common Size/Position ratios)
- **Animation patterns** — TweenInfo parameters (EasingStyle, Duration) per interaction type (open, close, hover, click)

### Non-Reproducible by AI (→ Asset Catalog)

These get stored as references that Claude injects into generated code:

- **Image assets** (rbxassetid:// URLs) — button backgrounds, icons, decorative borders, background textures, character frames, item slot backgrounds
- **9-slice images** — with their SliceCenter values (critical for scaling correctly)
- **Sound assets** — UI click sounds, hover sounds, open/close transition sounds
- **Custom font assets** — if using non-default fonts uploaded as assets

---

## Step 3: Build Design Tokens

Design tokens are the structured representation of a style that gets injected into Claude's system prompt.

Each style preset produces a token file:

```json
{
  "preset_name": "cartoony",
  "source_games": ["GameA", "GameB", "GameC"],
  "colors": {
    "background": {"primary": [30, 30, 40], "secondary": [45, 45, 60], "tertiary": [60, 60, 80]},
    "accent": {"primary": [255, 170, 50], "secondary": [100, 200, 255]},
    "text": {"primary": [255, 255, 255], "secondary": [180, 180, 200], "disabled": [100, 100, 120]},
    "border": {"default": [60, 60, 80], "focus": [255, 170, 50]},
    "status": {"success": [80, 200, 120], "error": [255, 80, 80], "warning": [255, 200, 50]}
  },
  "typography": {
    "heading_xl": {"font": "GothamBold", "size": 28},
    "heading_lg": {"font": "GothamBold", "size": 22},
    "heading_md": {"font": "GothamBold", "size": 18},
    "body": {"font": "Gotham", "size": 14},
    "caption": {"font": "Gotham", "size": 11}
  },
  "spacing": {
    "xs": 4, "sm": 8, "md": 12, "lg": 16, "xl": 24, "xxl": 32
  },
  "radii": {
    "sm": 4, "md": 8, "lg": 12, "xl": 16, "full": 9999
  },
  "stroke": {
    "default": {"thickness": 1.5, "color_role": "border.default"},
    "accent": {"thickness": 2, "color_role": "border.focus"}
  },
  "gradients": {
    "surface": {"colors": [[45, 45, 60], [30, 30, 40]], "rotation": 90},
    "accent_button": {"colors": [[255, 190, 70], [255, 150, 30]], "rotation": 90}
  },
  "animations": {
    "open": {"time": 0.3, "easing_style": "Back", "easing_direction": "Out"},
    "close": {"time": 0.2, "easing_style": "Quad", "easing_direction": "In"},
    "hover": {"time": 0.15, "easing_style": "Quad", "easing_direction": "Out"},
    "click": {"time": 0.1, "easing_style": "Quad", "easing_direction": "Out"}
  },
  "component_patterns": {
    "button": {
      "default_radius": "lg",
      "default_stroke": "accent",
      "padding": {"horizontal": "lg", "vertical": "sm"},
      "text_style": "heading_md"
    },
    "card": {
      "default_radius": "lg",
      "default_stroke": "default",
      "padding": "lg",
      "background": "background.secondary"
    },
    "modal": {
      "default_radius": "xl",
      "overlay_transparency": 0.5,
      "background": "background.primary",
      "padding": "xl"
    }
  }
}
```

### Aggregation Across Multiple Games

A single style preset is built from **multiple source games** in the same aesthetic category:
1. Extract tokens from 3-5 games that share the same visual style
2. Cluster similar values (e.g., three games use corner radii of 10, 12, 14 → pick 12 as the canonical value)
3. Identify consensus patterns (all cartoony games use bouncy Back easing for opens)
4. Fill gaps from the strongest source (if only one game has sound assets, use those)

This produces a preset that captures the *genre* aesthetic, not any single game's exact UI.

---

## Step 4: Build Asset Catalog

Assets are organized per style preset and categorized by component role.

```
assets/
  cartoony/
    buttons/
      primary_bg.png        → rbxassetid://12345
      secondary_bg.png      → rbxassetid://12346
      close_icon.png        → rbxassetid://12347
    backgrounds/
      panel_bg.png          → rbxassetid://12348
      header_bg.png         → rbxassetid://12349
    icons/
      coin.png              → rbxassetid://12350
      gem.png               → rbxassetid://12351
      arrow_right.png       → rbxassetid://12352
    borders/
      ornate_frame.png      → rbxassetid://12353  (9-slice, center: 20,20,80,80)
    sounds/
      click.ogg             → rbxassetid://12354
      hover.ogg             → rbxassetid://12355
      open.ogg              → rbxassetid://12356
  manifest.json
```

The manifest maps each asset to its role and metadata:

```json
{
  "preset": "cartoony",
  "assets": [
    {
      "id": "rbxassetid://12345",
      "role": "button_background_primary",
      "type": "Image",
      "scale_type": "Slice",
      "slice_center": {"Min": [20, 20], "Max": [80, 80]},
      "usage": "Primary action button background. Use with ImageColor3 = accent.primary."
    },
    {
      "id": "rbxassetid://12350",
      "role": "icon_currency_coin",
      "type": "Image",
      "scale_type": "Fit",
      "usage": "Currency coin icon. 64x64 base resolution."
    }
  ]
}
```

### Asset Ownership

Images extracted from production games belong to the original developers. Two paths:

1. **Licensed assets** — developer grants permission to reference their uploaded asset IDs (simplest, assets stay on their account)
2. **Re-uploaded assets** — developer provides source files, we upload under our own Roblox account (full control, survives if original dev deletes theirs)

Path 2 is preferred for reliability. The asset catalog should only contain assets we control.

---

## Step 5: Prompt Assembly

When a user requests a generation, the system assembles the prompt from:

1. **Base system prompt** — Roblox UI generation rules, API conventions, common pitfalls to avoid
2. **Style design tokens** — the full token JSON for the selected preset
3. **Asset manifest** — available image/sound assets for this style, with roles and usage instructions
4. **Component specs** — how each component type (button, card, modal, list, grid) is built in this style
5. **User's description** — what they actually want generated

The key instruction to Claude: **reference design tokens by role name, use asset IDs from the manifest, never hardcode color/font/spacing values, never use placeholder asset IDs.**

Example assembled prompt structure:

```
[System: Base Roblox UI generation rules]
[System: Style tokens for "cartoony" preset — colors, typography, spacing, radii, animations]
[System: Asset catalog for "cartoony" — 15 available images with roles and IDs]
[System: Component patterns — how to build buttons, cards, modals in this style]
[User: "Make a shop UI with a grid of items, each showing an icon, name, price, and buy button. Include a header with the shop title and a close button."]
```

Claude generates Luau code that:
- Uses `Color3.fromRGB(30, 30, 40)` from `colors.background.primary`, not a random dark color
- Uses `rbxassetid://12345` for button backgrounds (a real asset that renders)
- Uses `Enum.Font.GothamBold` at size 22 from `typography.heading_lg`
- Uses `UDim.new(0, 12)` corner radius from `radii.lg`
- Uses `TweenInfo.new(0.3, Enum.EasingStyle.Back, Enum.EasingDirection.Out)` from `animations.open`

---

## Step 6: Validation

After generation, validate the output against the style spec before showing to the user:

1. **Property check** — parse generated Luau, verify all Color3/Font/TextSize/CornerRadius values match the design token set (flag deviations)
2. **Asset check** — verify all rbxassetid:// references exist in the asset manifest (catch hallucinated IDs)
3. **Structure check** — verify parent-child hierarchy follows Roblox conventions (ScreenGui → Frame → children, modifiers parented correctly)
4. **API check** — flag deprecated APIs (wait() → task.wait(), Instance.new("x", parent) → Instance.new("x") + .Parent)

Validation failures trigger a re-generation pass with the specific issues flagged, not a silent fallback.

---

## Scaling the Preset Library

### Launch (3 presets)
- Cartoony (sourced from 3-5 games)
- Modern Flat (sourced from 3-5 games)
- Anime (sourced from 3-5 games)

### Month 2-3 (5-7 presets)
- Add Horror/Dark and Stud/Classic
- Refine existing presets based on user feedback and generation quality

### Month 4-6 (10-15 presets)
- Niche styles: Tycoon, Simulator, RPG, Obby, Military/Tactical
- Community-requested styles based on usage data

### Month 6+ (15+ presets)
- Custom preset builder (Pro tier) — users upload reference screenshots, system extracts tokens
- Community preset submissions — curated and approved before publishing

Each new preset requires:
1. 3-5 source game UIs extracted and decomposed
2. Design tokens aggregated and validated
3. Asset catalog built with controlled asset IDs
4. 10+ test generations reviewed for quality before publishing
