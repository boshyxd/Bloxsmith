# Bloxsmith — Business Plan

## Executive Summary

An all-in-one web platform for Roblox development. Generate production-ready UIs with curated style presets, build 3D environments, create game music via Suno, and publish directly to Studio through a single plugin (powered by the existing robloxstudio-mcp server). Users bring their own AI keys (OpenAI, Anthropic) so we pay $0 in API costs.

**Price:** $5/month (Creator) / $15/month (Pro) — pure margin, no API cost burden
**Target:** 29,000 DevEx-eligible Roblox developers + growing 18+ demographic
**Revenue target:** $300K–$1.8M/year at moderate penetration
**Window:** 6–12 months before Roblox's native AI likely absorbs individual use cases

---

## The Problem

1. Roblox development requires juggling multiple disconnected tools (UI editors, building tools, audio sourcing, scripting, publishing)
2. Existing AI tools are single-purpose and generate generic, inconsistent "AI slop" with no style coherence
3. No tool lets you say "make this look like Adopt Me" or "Blox Fruits style" and get consistent results across UI, builds, and audio
4. Non-dev creators (builders, artists, game designers) can't make UIs or complex builds without scripting knowledge
5. Current AI tools either eat your money with token/credit systems or charge high subscriptions to cover their own API costs

## The Product

### Tools

```
Bloxsmith Platform
  ├── UI Forge    — generate styled Roblox UIs from text descriptions
  ├── Build Forge — generate 3D environments/maps from text descriptions
  ├── Sound Forge — generate game music and SFX via Suno integration
  └── Publish     — one-click push to Studio via plugin (auto-publish, insert, update)
```

All tools share the same style preset system, the same Studio plugin, and the same BYOK AI connection.

### UI Forge (Primary Tool)

Pick a style preset, describe your UI, get a complete importable UI.

Built from real production game UIs — not AI guesses. See [STYLE_EXTRACTION_PIPELINE.md](./STYLE_EXTRACTION_PIPELINE.md) for the full technical pipeline.

Each preset is a structured design token system defining:
- Color palette (background, accent, text, borders)
- Typography (font family, sizes, weights)
- Corner radii, padding, spacing
- UIStroke/UIGradient patterns
- Animation style (tween easing, duration conventions)
- Component patterns (how buttons, cards, lists, modals look in this style)
- Real image assets (button backgrounds, icons, borders) — not placeholders

Style presets at launch:
- **Cartoony** — bright colors, rounded corners, bouncy animations (Adopt Me, MeepCity)
- **Modern Flat** — clean minimalism, sharp geometry, subtle shadows (Arsenal, Phantom Forces)
- **Anime** — gradient-heavy, dynamic layouts, particle accents (Blox Fruits, Anime Adventures)

Additional presets post-launch:
- **Stud/Classic** — retro Roblox aesthetic, 2012-era styling
- **Horror/Dark** — muted palette, glitch effects, atmospheric (Doors, Apeirophobia)

Users do NOT see raw code during generation. They see a visual preview, then export/publish.

### Build Forge

Describe an environment or map, get generated 3D builds pushed to Studio.

- Leverages the MCP server's existing building tools (create parts, models, terrain)
- Style presets extend to builds (a "cartoony" tycoon plot vs a "horror" hallway)
- Outputs Instance hierarchies that get inserted via the plugin

### Sound Forge

Generate game music and SFX via Suno API integration.

- Describe the vibe ("upbeat tycoon lobby music", "horror ambient drone")
- Style presets suggest audio direction matching the visual style
- Generated audio uploads to Roblox and returns an asset ID ready to use

### Studio Plugin Bridge

A single free Roblox Studio plugin that:
- Connects to the web app via local HTTP (uses robloxstudio-mcp infrastructure)
- One-click imports generated UIs, builds, and audio into Studio
- Auto-publish: push directly to a live game from the web platform
- Screenshot/workspace capture for AI context (reference existing UI or builds)
- Serves as a discovery funnel via Creator Store (free listing)

### BYOK (Bring Your Own Key)

Users connect their own AI provider accounts via OAuth or API key:
- **Anthropic** (Claude) — recommended for UI and code generation
- **OpenAI** (GPT) — alternative provider, user's choice

This means:
- $0 API cost for us per generation
- Users control their own usage and billing with their AI provider
- No token/credit anxiety on our side — flat subscription covers platform access
- Power users who already have API keys get immediate value
- Platform fee covers infrastructure, presets, plugin, and the tooling — not API pass-through

### Technical Architecture

```
Web App (Next.js 16, App Router, TypeScript, Tailwind v4, shadcn/ui)
  ├── Auth (Supabase Auth — email + Discord OAuth)
  ├── Database (Supabase Postgres + RLS)
  ├── BYOK key management (encrypted storage, per-user provider config)
  ├── UI Forge
  │   ├── Style preset library (structured JSON design tokens + asset manifests)
  │   ├── Generation via user's AI key (Anthropic SDK / OpenAI SDK)
  │   ├── Prompt caching on system prompt + style tokens
  │   ├── Stream server-side → validate against style spec → deliver to client
  │   └── Static validation (property checks, asset ID verification, API checks)
  ├── Build Forge
  │   ├── Generation via user's AI key
  │   ├── Output: Instance hierarchy (Parts, Models, Terrain)
  │   └── Style-aware environment generation
  ├── Sound Forge
  │   ├── Suno API integration
  │   ├── Auto-upload to Roblox → return asset ID
  │   └── Style-suggested audio prompts
  ├── Preview renderer (canvas-based approximate preview)
  ├── Export (Luau code + .rbxmx file + plugin bridge + auto-publish)
  └── Payments (Stripe webhooks → Supabase subscription table)

Studio Plugin (free, single plugin for everything)
  ├── HTTP listener for web app connection (MCP server infrastructure)
  ├── Import generated UIs, builds, audio
  ├── Auto-publish to live games
  └── Screenshot/workspace capture for reference
```

#### Stack Decisions (Rationale)

- **Supabase**: auth + DB + RLS in one place. Discord OAuth is a dashboard toggle. $25/mo Pro covers everything.
- **BYOK over managed API**: eliminates the entire API cost problem. Subscription revenue is pure margin minus infrastructure. Users who are serious about Roblox dev already have or can get API keys.
- **Single Studio plugin**: one install covers all tools. Leverages existing MCP server infrastructure for the HTTP bridge, building tools, and publishing. No need for users to install multiple plugins.
- **Suno for audio**: only viable AI music generation API with quality output. Separate from the BYOK AI providers (we either absorb this cost or pass it through).

---

## Competitive Positioning

### What Exists Today

| Tool | Price | Focus | Weakness |
|------|-------|-------|----------|
| Metain | $5-20/mo (credits) | General game building | Credit-based, generic output, no style system |
| Rebirth | $7.99/mo | Scripting assistant | No UI/build/audio, scripting only |
| SuperbulletAI | Free-$20/mo (tokens) | General game building | "Not functional" per reviews, token burn |
| AI Gen UI Plugin | $4.99 one-time | UI generation (Gemini) | Basic, no style system, single-purpose |
| Uilify | $0.01-0.10/gen | UI generation | Indie beta, minimal users |
| Roblox Assistant | Free (BYOK) | General Studio AI | No style presets, no build/audio tools |

### Our Differentiation

1. **All-in-one platform** — UI + builds + audio + publishing in one place, one plugin
2. **Style presets** — no one else has curated, opinionated design systems that span UI and builds
3. **BYOK = flat pricing** — no credit anxiety, no token burn, no API cost pass-through
4. **Single plugin** — leverages our MCP server (10K+ installs, 200+ stars) for everything
5. **Auto-publish** — generate and push to a live game without touching Studio manually

### What We're NOT

- Not a scripting assistant (Rebirth owns that)
- Not competing with the free MCP server (that stays open source, acts as funnel and infrastructure)

---

## Pricing

### Tiers

| | Free | Creator ($5/mo) | Pro ($15/mo) |
|--|------|-----------------|-------------|
| Generations/day | 3 | 25 | Unlimited (fair-use) |
| Tools | UI Forge only | UI + Build + Sound Forge | All tools |
| Style presets | 2 basic | All presets | All + custom presets |
| Export formats | Luau code only | Code + .rbxmx + plugin | Code + .rbxmx + plugin + auto-publish |
| Generation history | Last 10 | Unlimited | Unlimited |
| Component/build library | - | Save & reuse | Save & reuse + share |
| Annual discount | - | $48/yr (20% off) | $144/yr (20% off) |

### BYOK Requirement

All tiers require users to connect their own AI provider (Anthropic or OpenAI). The free tier includes 3 generations/day using a shared platform key to let users try before setting up BYOK.

### Why This Pricing

- **$5 anchors to Roblox Premium** ($4.99/mo, 14.8M subscribers — this audience pays this)
- **$15 Pro is justified** by all-in-one tooling (UI + builds + audio + auto-publish)
- **Flat subscription works** because BYOK means we don't eat API costs
- **Free tier is essential** — 3 gens/day on our dime lets users try without BYOK setup
- Budget AI tools show 8-15% monthly churn; annual billing at 20% discount drops churn from ~6.8% to ~2.1%

### Revenue Projections (Conservative → Optimistic)

| Metric | Conservative | Moderate | Optimistic |
|--------|-------------|----------|-----------|
| Paying users (month 6) | 200 | 800 | 2,000 |
| Paying users (month 12) | 500 | 2,000 | 5,000 |
| Avg revenue/user | $8/mo | $10/mo | $12/mo |
| Annual revenue (year 1) | $48K | $240K | $720K |
| Annual revenue (year 2) | $160K | $720K | $2.4M |

### Cost Structure

**BYOK eliminates API costs.** Users pay their own AI provider directly. Our costs are infrastructure only.

**Platform costs (free tier subsidy):**
- Free tier uses a shared platform key: ~3 gens/day × $0.006-0.025/gen = ~$0.02-0.08/free user/day
- At 1,000 free users: ~$20-80/mo in shared key costs (acceptable as acquisition cost)

**Suno API costs (Sound Forge):**
- Suno pricing TBD — either absorb into Pro tier or pass through as a small per-generation fee
- Limit Sound Forge to Creator/Pro tiers to control costs

**Infrastructure:**
- **Supabase Pro**: $25/mo (auth + DB + storage + RLS)
- **Vercel**: $0-20/mo early stage
- **Stripe fees**: 2.9% + $0.30 per transaction
- **Domain + misc**: ~$15/mo
- **Total fixed costs**: ~$60-80/mo (covered by ~8-16 Creator subscriptions)

---

## Go-To-Market Strategy

### Phase 1: Build & Validate (Weeks 1-4)

1. Build MVP web app — UI Forge with 2-3 style presets + BYOK setup
2. Build/adapt Studio plugin bridge (single plugin, Creator Store listing)
3. Record one killer 60-second demo video: "I described a cartoony shop UI and got this in 30 seconds"
4. Private alpha with 10-20 users from existing MCP server community

### Phase 2: Launch (Weeks 5-8)

1. **DevForum post** — Community Resources thread with demo GIFs, credentials (10K MCP installs, 200+ GitHub stars). Highest-conversion channel.
2. **Short-form video blitz** — 3-5 TikTok/YouTube Shorts showing before/after. "Before: empty StarterGui. After: full Blox Fruits-style inventory in 30 seconds."
3. **Discord seeding** — Post in HiddenDevs (263K), RoDevs (140K), Roblox Studio Community (123K)
4. **Cross-promote from MCP server** — README mention, GitHub discussions, existing user base
5. Free tier live, paid tiers gated behind waitlist to create scarcity
6. **Launch Build Forge** alongside or shortly after UI Forge

### Phase 3: Growth (Months 3-6)

1. **Creator partnerships** — reach out to Roblox dev YouTubers (AlvinBlox, TheDevKing, GnomeCode) for demo videos
2. **Sound Forge launch** — Suno integration, new marketing push
3. **Community preset submissions** — let users submit style presets, vote on them
4. **Template marketplace** — pre-built UI/build templates in each style
5. **Referral program** — give 1 month free for each referred paying user

### Phase 4: Moat Deepening (Months 6-12)

1. Expand preset library based on usage data
2. Multi-component generation (full game UI systems, not just individual panels)
3. Screenshot-to-style extraction ("upload a screenshot, we'll match the style")
4. Full game scaffolding (combine UI + builds + audio into a complete game starter)

---

## Risk Assessment

### Critical Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|-----------|
| Roblox ships native AI tools | 10/10 | HIGH (6-18 months) | Style presets + all-in-one integration create differentiation native tools won't match on day one. Position as "enhances" Roblox AI. |
| BYOK friction kills conversion | 7/10 | MEDIUM | Free tier with shared key lets users try without BYOK. Clear setup guides. OAuth flow for Anthropic/OpenAI if available. |
| Scope too large, slow to ship | 7/10 | MEDIUM | Ship UI Forge first as primary tool. Build Forge and Sound Forge can launch weeks later. Don't block launch on all tools. |
| Low conversion from free to paid | 7/10 | HIGH | Make free tier useful but constrained (3 gens, UI only). Style presets + Build/Sound Forge are the paywall levers. |
| High monthly churn (8-15%) | 7/10 | HIGH | Annual billing discounts, sticky component/build library, push for yearly plans |
| Suno API changes/costs | 5/10 | MEDIUM | Sound Forge is additive, not core. Can swap providers or drop if economics don't work. |

### The Roblox Platform Risk (The Big One)

Roblox runs 400+ AI models, open-sourced their Cube Foundation Model, and Baszucki personally announced MCP + BYOK support. Their pattern is clear: absorb successful plugin concepts into native features.

**The survival strategy:**
- Ship before RDC 2026 (likely September-October)
- All-in-one platform is harder to replicate than a single-purpose tool
- Style preset library depth is genuinely hard to match
- Position as complementary to Roblox's AI Assistant, not competing
- If Roblox ships native generation tools, pivot to "design system manager" that works WITH their tools
- Maintain the open-source MCP server as goodwill + funnel regardless

---

## Relationship to the Open-Source MCP Server

The MCP server (robloxstudio-mcp) stays **free and open source forever**. It's the funnel, the credibility, the community trust, AND the infrastructure backbone.

```
Open Source MCP Server (free)          Bloxsmith Platform (paid)
├── 10K+ installs                      ├── UI Forge (styled UI generation)
├── 200+ GitHub stars                  ├── Build Forge (environment generation)
├── 39 tools for Studio                ├── Sound Forge (Suno music/SFX)
├── HTTP bridge infrastructure         ├── Auto-publish from web
├── Building tools                     ├── Style preset library
├── Community trust                    ├── BYOK AI management
└── Discovery funnel ──────────────────└── Monetization
```

The MCP server provides the plugin infrastructure. Bloxsmith provides the web UI, presets, and tooling on top. They're symbiotic.

---

## MVP Scope (What to Build First)

### Must Have (Week 1-2)
- [ ] Supabase project setup (auth, DB schema, RLS policies)
- [ ] Auth flow (email + Discord OAuth via Supabase Auth)
- [ ] BYOK key management (connect Anthropic/OpenAI key, encrypted storage)
- [ ] 1 style preset fully built (Cartoony) with design tokens + asset manifest
- [ ] UI Forge: pick style, describe UI, generate via user's AI key
- [ ] Luau code output with copy button
- [ ] Basic preview (syntax-highlighted code is fine for MVP)

### Must Have (Week 3-4)
- [ ] 2 more style presets (Modern Flat, Anime)
- [ ] Studio plugin (single plugin, imports generated UIs)
- [ ] .rbxmx export
- [ ] Build Forge: describe environment, generate via user's AI key, push to Studio
- [ ] Stripe integration (webhooks → Supabase subscription table)
- [ ] Generation history (save past generations, RLS-protected)
- [ ] Free tier with shared platform key (3 gens/day)

### Must Have (Week 5-6)
- [ ] Sound Forge: Suno integration, generate music/SFX
- [ ] Auto-publish to live games via plugin
- [ ] Daily generation caps enforced per tier

### Nice to Have (Post-Launch)
- [ ] Visual canvas preview
- [ ] Component/build library (save + reuse)
- [ ] Screenshot-to-style extraction
- [ ] Custom preset builder
- [ ] Community preset marketplace
- [ ] Full game scaffolding (UI + builds + audio combined)

### Explicitly NOT in MVP
- No general scripting assistant (Rebirth territory)
- No visual scripting / logic builder
- No multiplayer/networking generation

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
| Month 6 | MRR | $5,000+ |
| Month 12 | Paying users | 2,000+ |
| Month 12 | Annual run rate | $200K+ |
| Month 12 | Style presets available | 15+ |
| Month 12 | Tools live | 3 (UI + Build + Sound) |

---

## Decision Points

- **Month 3**: If <50 paying users, reassess product-market fit. Talk to free users about why they won't pay. Is BYOK the friction point?
- **Month 6**: If MRR <$3,000, consider dropping to UI Forge only and simplifying.
- **RDC 2026**: If Roblox announces native AI generation, pivot to "design system manager" that enhances their native tools with curated presets.
- **Month 12**: If MRR >$15,000, consider expanding beyond Roblox (Unity, Unreal indie devs).

---

## Summary

The play: **own the all-in-one AI-powered Roblox dev platform before Roblox absorbs individual use cases**. Style presets are the quality moat. BYOK eliminates the API cost problem. The MCP server is the trust, funnel, and infrastructure backbone. Ship UI Forge fast, stack Build Forge and Sound Forge on top, and build the preset library deeper than anyone wants to compete with.

The window is 6-12 months. Ship fast.
