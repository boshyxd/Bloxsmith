# GuiForge — Business Plan

## Executive Summary

A web-based tool that generates production-ready Roblox UIs using Claude Sonnet with curated style presets. Users pick a visual style (cartoony, stud, modern flat, anime, etc.), describe their UI in plain English, and get a complete, importable UI they can drop straight into Studio via a plugin.

**Price:** $5/month (Creator) / $10/month (Pro) — pricing under review, see Cost Structure
**Target:** 29,000 DevEx-eligible Roblox developers + growing 18+ demographic
**Revenue target:** $300K–$1.8M/year at moderate penetration
**Window:** 6–12 months before Roblox's native AI likely absorbs the use case

---

## The Problem

1. Roblox UI development is tedious — manually creating Instance hierarchies, tweaking properties, wiring up animations
2. Existing AI tools generate generic, inconsistent "AI slop" UIs with no style coherence
3. No tool lets you say "make this look like Adopt Me" or "Blox Fruits style" and get consistent results
4. Non-dev creators (builders, artists, game designers) can't make UIs at all without scripting knowledge

## The Product

### Core Loop

```
Pick Style Preset → Describe UI → Generate → Preview → Export to Studio
```

### Style Preset System (The Moat)

Built from real production game UIs — not AI guesses. See [STYLE_EXTRACTION_PIPELINE.md](./STYLE_EXTRACTION_PIPELINE.md) for the full technical pipeline.

Each preset is a structured design token system defining:
- Color palette (background, accent, text, borders)
- Typography (font family, sizes, weights)
- Corner radii, padding, spacing
- UIStroke/UIGradient patterns
- Animation style (tween easing, duration conventions)
- Component patterns (how buttons, cards, lists, modals look in this style)
- Real image assets (button backgrounds, icons, borders) — not placeholders

Presets at launch:
- **Cartoony** — bright colors, rounded corners, bouncy animations (Adopt Me, MeepCity)
- **Modern Flat** — clean minimalism, sharp geometry, subtle shadows (Arsenal, Phantom Forces)
- **Stud/Classic** — retro Roblox aesthetic, 2012-era styling
- **Anime** — gradient-heavy, dynamic layouts, particle accents (Blox Fruits, Anime Adventures)
- **Horror/Dark** — muted palette, glitch effects, atmospheric (Doors, Apeirophobia)

Users do NOT see raw code during generation. They see a visual preview, then export.

### Studio Plugin Bridge (Required)

A free Roblox Studio plugin that:
- Connects to the web app via local HTTP
- One-click imports generated UI into Studio's hierarchy
- Serves as a discovery funnel via Creator Store (free listing)
- Provides screenshot capture for AI context (reference existing UI)

### Technical Architecture

```
Web App (Next.js 16, App Router, TypeScript, Tailwind v4, shadcn/ui)
  ├── Auth (Supabase Auth — email + Discord OAuth)
  ├── Database (Supabase Postgres + RLS)
  ├── Style preset library (structured JSON design tokens + asset manifests)
  ├── Generation engine
  │   ├── Claude Sonnet 4.6 via @anthropic-ai/sdk (direct, not Vercel AI SDK)
  │   ├── Prompt caching on system prompt + style tokens (~20-25% input cost savings)
  │   ├── Stream server-side → validate against style spec → deliver to client
  │   └── Static validation (property checks, asset ID verification, API checks)
  ├── Preview renderer (canvas-based approximate preview)
  ├── Export (Luau code + .rbxmx file + plugin bridge)
  └── Payments (Stripe webhooks → Supabase subscription table)

Studio Plugin (free)
  ├── HTTP listener for web app connection
  ├── Import generated UI instances
  └── Screenshot capture for reference
```

#### Stack Decisions (Rationale)

- **Supabase over Clerk**: auth + DB + RLS in one place eliminates user sync problems. RLS enforces data isolation at the DB level (safety net for solo dev). Discord OAuth is a dashboard toggle. $25/mo Pro covers auth + 8GB Postgres + 100K MAUs.
- **Sonnet 4.6 over Opus**: Sonnet is the cost/quality sweet spot at $3/$15 per MTok. A complex UI generation costs ~$0.025 with caching vs ~$0.09 on Opus. Defer Opus until Sonnet demonstrably fails on complex UIs. Add Haiku for free tier later.
- **Anthropic SDK over Vercel AI SDK**: one-shot code generation, not chat. Direct SDK gives full control over prompt caching placement. Vercel AI SDK's `useChat`/`useCompletion` hooks add no value here.
- **Prompt caching**: system prompt + style tokens (~2,500 tokens) cached and shared across all users of the same style preset. Workspace-level cache, not per-user.

---

## Competitive Positioning

### What Exists Today

| Tool | Price | Focus | UI Quality |
|------|-------|-------|-----------|
| Metain | $5-20/mo (credits) | General game building | Generic |
| Rebirth | $7.99/mo | Scripting assistant | No UI focus |
| SuperbulletAI | Free-$20/mo (tokens) | General game building | "Not functional" per reviews |
| AI Gen UI Plugin | $4.99 one-time | UI generation (Gemini) | Basic, no style system |
| Uilify | $0.01-0.10/gen | UI generation | Indie beta, minimal users |
| Roblox Assistant | Free (BYOK) | General Studio AI | No style presets |

### Our Differentiation

1. **Style presets** — no one else has curated, opinionated design systems
2. **UI-first** — not a general coding tool that also does UI
3. **Flat pricing** — no credit anxiety, no token burn
4. **Claude Sonnet 4.6** — strong code generation at a sustainable cost, with prompt caching for style presets
5. **Visual preview** — see before you export, not "hope the code works"

### What We're NOT

- Not a general Roblox AI coding assistant (Rebirth, SuperbulletAI own that)
- Not a game builder (Metain is trying that)
- Not competing with the free MCP server (that stays open source, acts as funnel)

---

## Pricing

### Tiers

| | Free | Creator ($5/mo) | Pro ($10/mo) |
|--|------|-----------------|-------------|
| Generations/day | 3 | 50 | Unlimited (fair-use) |
| Style presets | 2 basic | All presets | All + custom presets |
| Export formats | Luau code only | Code + .rbxmx + plugin | Code + .rbxmx + plugin |
| Component library | - | Save & reuse | Save & reuse + share |
| Priority generation | - | - | Yes |
| Annual discount | - | $48/yr (20% off) | $96/yr (20% off) |

### Why This Pricing

- **$5 anchors to Roblox Premium** ($4.99/mo, 14.8M subscribers — this audience pays this)
- **Flat subscription beats tokens/credits** — SuperbulletAI and Bolt.new users hate token burn anxiety
- **BYOK is a non-starter** — most of the audience is under 24, many are teenagers without API keys
- **Free tier is essential** — expect 3-5% freemium-to-paid conversion, young audience needs to try first
- Budget AI tools show 8-15% monthly churn; annual billing at 20% discount drops churn from ~6.8% to ~2.1%

### Revenue Projections (Conservative → Optimistic)

| Metric | Conservative | Moderate | Optimistic |
|--------|-------------|----------|-----------|
| Paying users (month 6) | 200 | 800 | 2,000 |
| Paying users (month 12) | 500 | 2,000 | 5,000 |
| Avg revenue/user | $6/mo | $7/mo | $8/mo |
| Annual revenue (year 1) | $36K | $168K | $480K |
| Annual revenue (year 2) | $120K | $500K | $1.8M |

### Cost Structure

**Claude API costs (Sonnet 4.6 with prompt caching):**

| Generation complexity | Est. cost/generation |
|---|---|
| Simple (button, label) | ~$0.006 |
| Medium (card, form) | ~$0.025 |
| Complex (shop, inventory) | ~$0.025-0.05 |

**Cost per user per month (Sonnet 4.6, with caching):**

| Generations/day | Monthly cost/user |
|---|---|
| 5 (free tier, Haiku) | ~$0.90 |
| 10 | ~$7.20 |
| 25 | ~$18.00 |
| 50 | ~$36.00 |

**Pricing tension**: at $10/mo Pro with 50 gens/day, API costs exceed revenue by ~$26/user. Options to resolve:
1. Raise Pro to $19-29/mo and cap at 25-30 gens/day
2. Keep $10/mo but cap Creator at 15 gens/day, Pro at 30 gens/day
3. Test real usage patterns before committing (most users won't hit 50/day)

**Other costs:**
- **Supabase Pro**: $25/mo (auth + DB + storage + RLS)
- **Infrastructure**: Vercel ~$0-20/mo early stage
- **Stripe fees**: 2.9% + $0.30 per transaction
- **Domain + misc**: ~$15/mo

---

## Go-To-Market Strategy

### Phase 1: Build & Validate (Weeks 1-4)

1. Build MVP web app — core generation loop with 2-3 style presets
2. Build Studio plugin bridge (free, Creator Store listing)
3. Record one killer 60-second demo video: "I typed 'cartoony shop UI' and got this"
4. Private alpha with 10-20 users from existing MCP server community

### Phase 2: Launch (Weeks 5-8)

1. **DevForum post** — Community Resources thread with demo GIFs, your credentials (10K MCP installs, 200+ GitHub stars). This is the highest-conversion channel.
2. **Short-form video blitz** — 3-5 TikTok/YouTube Shorts showing before/after UI generation. "Before: empty StarterGui. After: full Blox Fruits-style inventory in 30 seconds."
3. **Discord seeding** — Post in HiddenDevs (263K), RoDevs (140K), Roblox Studio Community (123K)
4. **Cross-promote from MCP server** — README mention, GitHub discussions, existing user base
5. Free tier live, paid tiers gated behind waitlist to create scarcity

### Phase 3: Growth (Months 3-6)

1. **Creator partnerships** — reach out to Roblox dev YouTubers (AlvinBlox, TheDevKing, GnomeCode) for demo videos. Even one video from a 100K+ channel changes everything.
2. **Community preset submissions** — let users submit style presets, vote on them, build community ownership
3. **Template marketplace** — pre-built UI templates (shop system, inventory, settings menu) in each style, some free, some Pro-only
4. **Referral program** — give 1 month free for each referred paying user

### Phase 4: Moat Deepening (Months 6-12)

1. Expand preset library based on usage data (which styles get requested most?)
2. Multi-component generation (full game UI systems, not just individual panels)
3. Screenshot-to-style extraction ("upload a screenshot of a UI you like, we'll match the style")
4. Integration with the open-source MCP server for end-to-end workflows

---

## Risk Assessment

### Critical Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|-----------|
| Roblox ships native UI generation | 10/10 | HIGH (6-18 months) | Style presets create differentiation native tools won't match. Position as "enhances" Roblox AI, not competes. |
| API costs exceed revenue per user | 8/10 | MEDIUM | Sonnet 4.6 (not Opus) cuts costs ~60%. Prompt caching saves ~20-25% on input. Daily generation caps. Add Haiku for free tier. Monitor real usage before committing to pricing. |
| Low conversion from free to paid | 7/10 | HIGH | Make free tier useful but constrained. Style presets are the paywall lever. |
| High monthly churn (8-15%) | 7/10 | HIGH | Annual billing discounts, sticky component library, push for yearly plans |
| "AI slop" perception | 6/10 | MEDIUM | Style presets ARE the quality control. Curate aggressively, reject low-quality presets. |

### The Roblox Platform Risk (The Big One)

Roblox runs 400+ AI models, open-sourced their Cube Foundation Model, and Baszucki personally announced MCP + BYOK support. Their pattern is clear: absorb successful plugin concepts into native features.

**The survival strategy:**
- Ship before RDC 2026 (likely September-October)
- Build the style preset library deep enough that it's genuinely hard to replicate
- Position as complementary to Roblox's AI Assistant, not competing
- If Roblox ships native UI generation, pivot the style system into a "design system manager" that works WITH their tools
- Maintain the open-source MCP server as goodwill + funnel regardless of what happens

---

## Relationship to the Open-Source MCP Server

The MCP server (robloxstudio-mcp) stays **free and open source forever**. It's the funnel, the credibility, and the community trust.

```
Open Source MCP Server (free)          GuiForge (paid)
├── 10K+ installs                      ├── Style-preset UI generation
├── 200+ GitHub stars                  ├── Visual preview
├── 39 tools for Studio                ├── Studio plugin bridge
├── Community trust                    ├── Component library
└── Discovery funnel ──────────────────└── Monetization
```

The MCP server README links to the UI tool. The UI tool's Studio plugin uses MCP server infrastructure. They're complementary, not competing.

---

## MVP Scope (What to Build First)

### Must Have (Week 1-2)
- [ ] Supabase project setup (auth, DB schema, RLS policies)
- [ ] Auth flow (email + Discord OAuth via Supabase Auth)
- [ ] 1 style preset fully built (Cartoony) with design tokens + asset manifest
- [ ] Generation engine (Sonnet 4.6 via @anthropic-ai/sdk, prompt caching enabled)
- [ ] Basic UI: pick style, type description, get generated UI back
- [ ] Luau code output with copy button
- [ ] Basic preview (syntax-highlighted code is fine for MVP)

### Must Have (Week 3-4)
- [ ] 2 more style presets (Modern Flat, Anime)
- [ ] Studio plugin that imports generated UI
- [ ] .rbxmx export
- [ ] Stripe integration (webhooks → Supabase subscription table)
- [ ] Generation history (save past generations, RLS-protected)
- [ ] Daily generation caps enforced per tier

### Nice to Have (Post-Launch)
- [ ] Visual canvas preview
- [ ] Component library (save + reuse)
- [ ] Screenshot-to-style extraction
- [ ] Custom preset builder
- [ ] Community preset marketplace

### Explicitly NOT in MVP
- No voxel/map generation (separate product, later)
- No general scripting (Rebirth/SuperbulletAI territory)
- No game builder features (Metain territory)
- No BYOK option (adds complexity, audience doesn't have API keys)

---

## Marketing Budget & Allocation

### Phase 1-2 (Months 1-2): $0-500
- Organic only: DevForum, Discord, cross-promo from MCP server
- Self-recorded demo videos (TikTok, YouTube Shorts)
- Budget: domain ($15), hosting ($0-50 on free tiers)

### Phase 3 (Months 3-6): $500-2,000/month
- Creator sponsorships: $200-500 per video from mid-tier Roblox YouTubers
- TikTok ads: $10-20/day testing short-form video ads
- Discord server boosts/partnerships

### Phase 4 (Months 6-12): Reinvest 20-30% of revenue
- Scale what's working from Phase 3
- Consider hiring a part-time Roblox content creator for consistent video output

---

## Success Metrics

| Timeframe | Metric | Target |
|-----------|--------|--------|
| Month 1 | Free signups | 500+ |
| Month 2 | Free signups | 2,000+ |
| Month 3 | Paying users | 100+ |
| Month 3 | Free-to-paid conversion | 3%+ |
| Month 6 | Paying users | 500+ |
| Month 6 | Monthly churn | <10% |
| Month 6 | MRR | $3,000+ |
| Month 12 | Paying users | 2,000+ |
| Month 12 | Annual run rate | $150K+ |
| Month 12 | Style presets available | 15+ |

---

## Decision Points

- **Month 3**: If <50 paying users, reassess product-market fit. Talk to free users about why they won't pay.
- **Month 6**: If MRR <$2,000, consider pivoting style system into a plugin/preset marketplace instead of SaaS.
- **RDC 2026**: If Roblox announces native UI generation, pivot to "design system manager" that enhances their native tools with curated presets.
- **Month 12**: If MRR >$10,000, consider voxel map generation as second product line.

---

## Summary

The play is simple: **own the style-preset UI niche before Roblox absorbs it**. The MCP server is the trust and funnel. The UI tool is the monetization. Ship fast, make the demo video undeniable, launch on DevForum, and build the preset library deeper than anyone wants to compete with.

The window is 6-12 months. Every week of delay is a week closer to Roblox shipping this for free.
