# GText Farms — Product Implementation Plan

> **Poultry Investment Web App**  
> Complete product flow, codebase assessment, and phased build plan.

**Document version:** 1.1  
**Last updated:** June 15, 2026  
**Brand:** GText Farms (client)  
**Repo:** `poultry-harvest-trust`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Positioning](#product-positioning)
3. [Core Problem & Design Principles](#core-problem--design-principles)
4. [User Types & Goals](#user-types--goals)
5. [Current Codebase State](#current-codebase-state)
6. [PRD Coverage Matrix](#prd-coverage-matrix)
7. [Design Continuity Rules](#design-continuity-rules)
8. [Technical Architecture](#technical-architecture)
9. [Route Map](#route-map)
10. [Data Model](#data-model)
11. [API & Server Functions](#api--server-functions)
12. [User Flows](#user-flows)
13. [Page Specifications](#page-specifications)
14. [Phased Implementation Plan](#phased-implementation-plan)
15. [Nigeria-Specific Requirements](#nigeria-specific-requirements)
16. [Security, Compliance & Trust](#security-compliance--trust)
17. [MVP Scope & Launch Criteria](#mvp-scope--launch-criteria)
18. [Success Metrics](#success-metrics)
19. [Risks & Mitigations](#risks--mitigations)
20. [Appendix: Design Tokens Reference](#appendix-design-tokens-reference)

---

## Executive Summary

GText Farms is an integrated agricultural company and investment platform aimed at the Nigerian market. The core user problem is not “where do I click to invest?” — it is:

> **“Can I trust this platform with my money?”**

The product must feel **transparent, real, professional, easy to understand, data-backed, and emotionally reassuring**.

### Current status (June 2026)

| Layer | Status |
|-------|--------|
| **Marketing landing page** | Done — DB-driven stats, opportunities, track record |
| **Public sub-pages** | Done — `/opportunities`, `/farms`, `/about`, `/contact`, `/legal/*`, `/performance` |
| **Auth & KYC** | Done — email/password signup, KYC form, admin review. Missing: ID upload, live BVN/NIN API |
| **Wallet & payments** | Done — Paystack deposit + webhook, withdrawals (request + admin approval) |
| **Investor dashboard** | Done — overview, investments, wallet, reports, profile, certificate, bank details |
| **Admin dashboard** | Done — farms, cycles, KYC, performance/payouts, withdrawal queue, analytics, audit logs |
| **Field officer tools** | Done — `/field` report create/submit workflow |
| **Email notifications** | Done — deposit, investment, KYC approved, report published (Resend) |
| **FAQ & team content** | Done — MongoDB-backed, seeded from mock data |
| **Backend / database** | Done — MongoDB + Mongoose, seed script, admin CRUD |
| **Vercel deployment** | Done — Nitro `vercel` preset in `vite.config.ts` |

### GText Farms PRD vs current build scope

The client's `GText_Farms_PRD.docx` defines **GText Farms** as an integrated agricultural company (vegetables, poultry, cassava, palm oil, processing, consulting, investments). **Public copy and branding use GText Farms** (`src/lib/brand.ts`). **Products** (`/products`) and **Gallery** (`/gallery`) are live with MongoDB-backed catalog. Investment product remains poultry cycle investing (Layer Poultry Investment Scheme). **News/blog** not built yet.

| PRD area | Current decision |
|----------|-------------------|
| Products catalogue | **Done** — `/products` with quote & bulk order flow |
| Gallery | **Done** — `/gallery` + landing preview |
| News & updates | Not started |
| Fixed packages (₦100k–₦5M tiers) | Replaced by **per-cycle** investing with custom amounts |
| Live payout countdown timer | Rejected — conflicts with trust positioning |
| Paystack + Flutterwave | Paystack only (MVP) |
| Withdrawals | **Implemented** — request, lock funds, admin approve/reject |
| Forgot password | **Implemented** — email via Resend (`RESEND_API_KEY`) |
| Field reports loop | **Implemented** — field → admin → investor |
| Mobile app, referral, marketplace, AI assistant | Phase 6+ backlog |

### Strategic direction

1. **Preserve the existing design** — do not redesign the landing page or introduce a second visual language.
2. **Extend the brand** into app surfaces (investor, admin, field) using the same tokens and shadcn/ui components themed accordingly.
3. **Build trust infrastructure first** — real data, weekly reports, transparent financials, realistic ROI — before growth features (referrals, live camera).
4. **Use Nigeria-appropriate stack** — Paystack for payments, MongoDB for data, licensed KYC provider (planned).

### Positioning reference

Think: **Stripe + PiggyVest + FarmTogether — for poultry investment in Nigeria.**

Not: a random farm website, crypto dashboard, or betting-style ROI platform.

---

## Product Positioning

### What GText Farms is (per client PRD)

- An **agricultural investment infrastructure** company
- A platform where investors fund **verified poultry production cycles**
- A transparency layer between **real farm operations** and **investor returns**

### Experience qualities

| Quality | Expression |
|---------|------------|
| Agricultural | Real farm imagery, operational vocabulary (FCR, mortality, cycles) |
| Financial | Wallet, ledger, ROI ranges, risk disclosure |
| Corporate | Compliance badges, team visibility, legal pages |
| Human | Field reports, weekly journals, named farm managers |
| Transparent | Line-item costs, live stats, honest risk language |

### What to avoid

- Betting-platform aesthetics (flashy gains, countdown timers, “double your money”)
- Crypto-style dashboards (neon, charts without context)
- Quick-rich scheme copy (unrealistic percentages, guaranteed returns)
- Rural/market flyer aesthetics (cartoon farms, dirty market imagery)

---

## Core Problem & Design Principles

### Investors must feel

1. Their money is **safe**
2. They **understand where profits come from**
3. **Real poultry operations exist**
4. The company is **organized and compliant**
5. Returns are **realistic, not fake**

### Product principles (implementation guardrails)

| Principle | Implementation |
|-----------|----------------|
| Transparency over hype | Show cost breakdowns, mortality rates, and risk disclaimers on every opportunity |
| Real over synthetic | Farm photos, field officer reports, named vets — not stock illustrations |
| Realistic ROI | Display ranges (e.g. 12–18%), never “guaranteed” or “2x” language |
| Progressive disclosure | Marketing → opportunity detail → KYC → invest → track |
| Mobile-first for investors | Wallet visibility, progress tracking, notifications |
| Audit everything | Admin actions on money, KYC, and payouts must be logged |

---

## User Types & Goals

### 1. Investor

People funding poultry cycles.

| Goal | Feature surface |
|------|-----------------|
| Understand opportunity | Public pages, opportunity detail, financial breakdown |
| Invest safely | KYC, wallet, review step, risk notice |
| Track returns | Investor dashboard, activity feed, reports |
| Withdraw profits | Wallet withdrawal flow |
| Build trust | Weekly farm journals, certificates, team pages |

### 2. Farm Admin / Operations Team

Internal staff managing farms, cycles, and investors.

| Goal | Feature surface |
|------|-----------------|
| Manage farms & cycles | Admin: farms CRUD, cycle lifecycle |
| Upload updates | Admin: approve field reports, publish journals |
| Track birds/feed/vaccination | Admin: operational dashboards |
| Manage payouts | Admin: payout queue, investor ledger |
| Investor communication | Admin: notifications, report publishing |

### 3. Field Officers

On-site staff at farms.

| Goal | Feature surface |
|------|-----------------|
| Upload live reports | Field app: report form |
| Images/videos | Field app: media upload |
| Mortality reports | Field app: mortality entry |
| Feed usage | Field app: feed consumption log |
| Egg production | Field app: production metrics |
| Vaccination status | Field app: vaccination checklist |

---

## Current Codebase State

### Tech stack

| Layer | Technology | Location |
|-------|------------|----------|
| Framework | TanStack Start + React 19 | `package.json`, `src/start.ts` |
| Routing | TanStack Router (file-based) | `src/routes/`, `src/routeTree.gen.ts` |
| Bundler | Vite 8 | `vite.config.ts` |
| SSR / Server | Nitro (Cloudflare Workers default) | `vite.config.ts` |
| Styling | Tailwind CSS v4 | `src/styles.css` |
| UI components | shadcn/ui (New York) + Radix | `src/components/ui/` (46 components) |
| Data fetching | TanStack React Query | Wired in `__root.tsx` — no queries yet |
| Forms | react-hook-form + zod | Installed, unused in routes |
| Charts | Recharts | `src/components/ui/chart.tsx` — scaffold only |
| Icons | Lucide React | Used on landing page |
| Typography | Inter (body) + Instrument Serif (display) | `src/routes/__root.tsx`, `src/styles.css` |

### What exists today

```
src/
├── routes/
│   ├── __root.tsx          # App shell, QueryClient, 404/error pages
│   └── index.tsx           # ONLY page — full Henhouse landing (~827 lines)
├── components/ui/          # 46 shadcn components (not used in pages yet)
├── hooks/use-mobile.tsx
├── lib/
│   ├── api/example.functions.ts   # Example server fn — unused
│   ├── config.server.ts           # Env scaffold (DB, Stripe commented out)
│   └── utils.ts
└── styles.css              # Full design token system
```

### Landing page sections (implemented)

All live in `src/routes/index.tsx` as inline components:

| Component | PRD section | Data source |
|-----------|-------------|-------------|
| `Nav` | Site navigation | Static |
| `Hero` | Hero + live funding card | Static mock |
| `TrustBar` | Trust bar + stats | Static mock |
| `HowItWorks` | 4-step flow | Static copy |
| `LiveFarm` | Farm transparency | Static mock |
| `Opportunities` | Opportunity cards (preview) | Static array (3 items) |
| `Reports` | ROI / operational transparency | Static |
| `Team` | Team visibility | Static (3 people) |
| `FAQ` | FAQ accordion | Static (5 items) |
| `CTA` | Bottom call-to-action | Static |
| `Footer` | Footer + legal links | Links are `href="#"` |

### Known blockers

| Issue | Impact | Resolution |
|-------|--------|------------|
| Missing `src/assets/` images | Build may fail | Add 9 JPG assets referenced in `index.tsx` |
| All CTAs point to `#` | No navigation to product | Wire to real routes in Phase 0 |
| No `.env` / backend | No live data | Supabase + env setup in Phase 0–1 |
| shadcn unused in pages | Dashboard work not started | Use for `/app` and `/admin` in Phase 4–5 |

---

## PRD Coverage Matrix

### Public website

| PRD page / section | Landing | Dedicated route | Backend | Priority |
|--------------------|---------|-----------------|---------|----------|
| Home / Landing | ✅ Done | `/` | Static → live stats | — |
| Hero | ✅ Done | — | — | — |
| Trust bar | ✅ Done | — | Live aggregates later | P2 |
| How it works | ✅ Done | `/how-it-works` optional | — | P3 |
| Live farm transparency | ✅ Section | `/farms`, `/farms/$id` | `farms`, `field_reports` | P1 |
| Opportunities list | ✅ Preview (3 cards) | `/opportunities` | `cycles` | P0 |
| Opportunity detail | ❌ | `/opportunities/$cycleId` | `cycles`, `cycle_financials` | P0 |
| ROI / returns section | ✅ Done | — | — | — |
| About | ❌ | `/about` | CMS or static | P2 |
| Team | ✅ Section | `/about#team` | `team_members` optional | P3 |
| FAQ | ✅ Done | `/faq` optional | `faq_items` optional | P3 |
| Contact | ❌ | `/contact` | Form → email/CRM | P2 |
| Legal (Terms, Privacy, Risk) | ❌ Footer only | `/legal/*` | Static markdown | P1 |

### Investment flow

| Step | PRD | Built | Priority |
|------|-----|-------|----------|
| KYC (name, BVN/NIN, address, ID) | ✅ Specified | Copy only | P0 |
| Wallet funding (bank, card) | ✅ Specified | Copy only | P0 |
| Review investment | ✅ Specified | Not started | P0 |
| Confirmation + certificate | ✅ Specified | Not started | P1 |

### Investor dashboard

| Section | PRD | Built | Priority |
|---------|-----|-------|----------|
| Overview cards | ✅ | Not started | P0 |
| Active investments | ✅ | Not started | P0 |
| Farm activity feed | ✅ | Not started | P1 |
| Wallet | ✅ | Not started | P0 |
| Reports | ✅ | Not started | P1 |
| Withdrawals | ✅ | Not started | P0 |
| Notifications | ✅ | Not started | P2 |
| Profile / KYC | ✅ | Not started | P0 |

### Admin dashboard

| Section | PRD | Built | Priority |
|---------|-----|-------|----------|
| Farms | ✅ | Not started | P1 |
| Poultry cycles | ✅ | Not started | P0 |
| Investors | ✅ | Not started | P1 |
| Reports (field) | ✅ | Not started | P1 |
| Payments / payouts | ✅ | Not started | P0 |
| Analytics | ✅ | Not started | P2 |
| Field report review | Implied | Not started | P1 |

### Field officer

| Feature | PRD | Built | Priority |
|---------|-----|-------|----------|
| Report submission | ✅ | Not started | P2 |
| Media upload | ✅ | Not started | P2 |
| Mortality / feed / eggs / vaccination | ✅ | Not started | P2 |
| Mobile-friendly UI | ✅ | Not started | P2 |

### Trust differentiators (extras)

| Feature | PRD | Built | Priority |
|---------|-----|-------|----------|
| Real farm media | ✅ | Static images | P1 (dynamic) |
| Live updates | ✅ | Static journal | P1 |
| Clear financials | ✅ | Copy only | P0 (detail page) |
| Realistic ROI | ✅ | Done on cards | — |
| Team visibility | ✅ | Done | — |
| FAQ | ✅ | Done | — |
| Legal & compliance | ✅ | Not started | P1 |
| Live farm camera | Optional | Not started | P4 |
| Investor certificates | Optional | Not started | P1 |
| Farm performance analytics | Optional | Static chart mock | P2 |
| Referral system | Optional | Not started | P4 |

**Priority key:** P0 = MVP blocker, P1 = launch-important, P2 = post-launch, P3 = nice-to-have, P4 = future

---

## Design Continuity Rules

> **Critical constraint:** The existing Henhouse design is approved. Do not redesign the landing page or introduce a conflicting visual language.

### Public marketing pages

**Keep these patterns from `src/routes/index.tsx`:**

- Page background: `bg-background` (cream)
- Section alternation: `bg-bone/60` for contrast sections
- Hero: `rounded-3xl`, `bg-primary`, gradient overlay on farm imagery
- Cards: `rounded-2xl`, `border-border`, `shadow-soft`, hover `shadow-lifted`
- Headings: `font-display` (Instrument Serif)
- Body: Inter via `font-sans`
- CTAs: `rounded-full`, `bg-primary` or `bg-accent` (lime)
- Section eyebrows: horizontal rule + uppercase tracking label via `SectionHeader`
- Stats / progress: `bg-forest-deep` bars, `text-forest-deep` accents
- Nav: sticky, `backdrop-blur`, `border-b border-border/60`

### App surfaces (investor, admin, field)

- Use **shadcn/ui** (`sidebar`, `card`, `table`, `form`, `chart`, `dialog`)
- Theme shadcn with existing CSS variables — do not use default slate-only styling
- Backgrounds: `cream` / `bone` — not pure white admin templates
- Primary actions: `forest-deep`
- Positive metrics / highlights: `lime` accent
- Charts: use `--chart-1` through `--chart-5` (forest, lime, clay, gold, forest-deep)

### Do not

- Swap Inter/Instrument Serif for another font stack
- Introduce neon, crypto, or betting UI patterns
- Use cartoon farm illustrations
- Promise unrealistic ROI in UI copy
- Build a separate “admin theme” that looks like a different product

### Refactor plan (non-visual)

Extract shared marketing components without changing appearance:

```
src/components/marketing/
├── Nav.tsx
├── Footer.tsx
├── Logo.tsx
├── SectionHeader.tsx
├── TrustBar.tsx
├── OpportunityCard.tsx
└── FAQ.tsx
```

Landing page becomes composition of these — same classes, same output.

---

## Technical Architecture

### High-level diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     TanStack Start (Vite + Nitro)            │
├─────────────────────────────────────────────────────────────┤
│  Public routes          │  /app/*          │  /admin/*       │
│  (marketing design)     │  (investor)      │  (ops)          │
├─────────────────────────────────────────────────────────────┤
│              createServerFn  (server functions)              │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ Supabase │ Paystack │  KYC API │  Storage │  Email / SMS    │
│ Postgres │ Flutter- │ Smile ID │ Supabase │  (Resend etc.)  │
│ Auth RLS │ wave     │ Youverify│ Storage  │                 │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

### Recommended services

| Concern | Recommendation | Rationale |
|---------|----------------|-----------|
| Database | Supabase (Postgres) | RLS for investor data isolation, realtime for activity feed |
| Auth | Supabase Auth | Phone OTP + email; integrates with RLS |
| File storage | Supabase Storage | Farm photos, ID documents, certificates |
| Payments | Paystack or Flutterwave | NGN, bank transfer, virtual accounts, cards |
| KYC | Smile ID, Youverify, or similar | BVN/NIN verification in Nigeria |
| PDF certificates | `@react-pdf/renderer` or server-side template | Investment confirmation documents |
| Email | Resend, SendGrid, or Postmark | Transactional email |
| SMS OTP | Termii, Africa's Talking | Nigerian SMS delivery |
| Hosting | Cloudflare (current Nitro default) or Vercel | SSR + edge |

### Environment variables

```env
# Public (VITE_ prefix)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PAYSTACK_PUBLIC_KEY=
VITE_APP_URL=

# Server-only (config.server.ts / createServerFn)
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
PAYSTACK_SECRET_KEY=
PAYSTACK_WEBHOOK_SECRET=
RESEND_API_KEY=
```

### Auth & authorization model

| Role | Access |
|------|--------|
| `anonymous` | Public pages only |
| `investor` | `/app/*`, invest, wallet, own data |
| `field_officer` | `/field/*`, assigned farms, submit reports |
| `admin` | `/admin/*`, all management |
| `super_admin` | Admin + user roles, payout approval |

Implement via Supabase `profiles.role` + RLS policies + route guards in TanStack Router.

---

## Route Map

### Public (marketing — existing design language)

| Route | Purpose |
|-------|---------|
| `/` | Landing page (existing) |
| `/opportunities` | Full list of open cycles |
| `/opportunities/$cycleId` | Investment detail — financial breakdown, media, risk |
| `/farms` | Farm transparency hub |
| `/farms/$farmId` | Single farm profile + activity |
| `/about` | Company story, mission, team |
| `/how-it-works` | Optional standalone (or anchor on `/`) |
| `/faq` | Optional standalone FAQ |
| `/contact` | Contact form |
| `/legal/terms` | Terms of service |
| `/legal/privacy` | Privacy policy (NDPR) |
| `/legal/risk` | Risk disclosure |
| `/legal/investment-agreement` | Investment agreement template |

### Auth

| Route | Purpose |
|-------|---------|
| `/auth/sign-in` | Login (email / phone) |
| `/auth/sign-up` | Registration |
| `/auth/verify` | OTP verification |
| `/auth/kyc` | KYC wizard (multi-step) |
| `/auth/forgot-password` | Password reset |

### Investor app (`/app`)

| Route | Purpose |
|-------|---------|
| `/app` | Dashboard overview |
| `/app/investments` | All investments |
| `/app/investments/$id` | Single investment + farm feed |
| `/app/wallet` | Balance, fund, withdraw, history |
| `/app/reports` | Weekly journals for invested cycles |
| `/app/notifications` | Notification center |
| `/app/profile` | Profile, KYC status, settings |
| `/app/invest/$cycleId` | Investment checkout flow |

### Admin (`/admin`)

| Route | Purpose |
|-------|---------|
| `/admin` | Admin overview / analytics |
| `/admin/farms` | Farm management |
| `/admin/farms/$id` | Farm detail + cycles |
| `/admin/cycles` | Cycle management |
| `/admin/cycles/$id` | Cycle detail, financials, investors |
| `/admin/cycles/new` | Create cycle |
| `/admin/investors` | Investor list, KYC review |
| `/admin/investors/$id` | Investor detail |
| `/admin/reports` | Field report queue (approve/publish) |
| `/admin/payouts` | Payout processing |
| `/admin/transactions` | Ledger / payment log |
| `/admin/settings` | Platform settings |

### Field officer (`/field`)

| Route | Purpose |
|-------|---------|
| `/field` | Assigned farms overview |
| `/field/farms/$id` | Farm detail |
| `/field/report/new` | New field report |
| `/field/report/$id` | Edit draft report |
| `/field/history` | Submitted reports |

### Layout structure

```
src/routes/
├── __root.tsx
├── index.tsx
├── opportunities/
│   ├── index.tsx
│   └── $cycleId.tsx
├── farms/
│   ├── index.tsx
│   └── $farmId.tsx
├── about.tsx
├── contact.tsx
├── legal/
│   ├── terms.tsx
│   ├── privacy.tsx
│   ├── risk.tsx
│   └── investment-agreement.tsx
├── auth/
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   ├── verify.tsx
│   └── kyc.tsx
├── app/
│   ├── route.tsx          # Investor layout (sidebar)
│   ├── index.tsx
│   ├── investments/
│   ├── wallet.tsx
│   ├── reports.tsx
│   ├── notifications.tsx
│   ├── profile.tsx
│   └── invest/
│       └── $cycleId.tsx
├── admin/
│   ├── route.tsx          # Admin layout (sidebar)
│   └── ...
└── field/
    ├── route.tsx          # Field layout (mobile-first)
    └── ...
```

---

## Data Model

### Entity relationship overview

```
farms ──┬── cycles ──┬── cycle_financials
        │            ├── investments ── users
        │            └── field_reports ── report_media
        └── farm_officers ── users (field_officer role)

users ──┬── profiles
        ├── wallets ── transactions
        ├── kyc_documents
        └── notifications
```

### Core tables

#### `profiles`

Extends Supabase `auth.users`.

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  email text,
  address text,
  city text,
  state text,
  bvn_hash text,              -- never store raw BVN
  nin_hash text,
  kyc_status text not null default 'pending'
    check (kyc_status in ('pending', 'submitted', 'verified', 'rejected')),
  kyc_rejection_reason text,
  role text not null default 'investor'
    check (role in ('investor', 'field_officer', 'admin', 'super_admin')),
  referral_code text unique,
  referred_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### `kyc_documents`

```sql
create table kyc_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  document_type text not null
    check (document_type in ('national_id', 'drivers_license', 'passport', 'utility_bill')),
  storage_path text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);
```

#### `farms`

```sql
create table farms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  location text not null,
  state text not null,
  description text,
  capacity_birds integer,
  current_bird_count integer default 0,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'maintenance')),
  hero_image_path text,
  latitude numeric,
  longitude numeric,
  manager_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### `cycles`

```sql
create table cycles (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references farms(id),
  slug text unique not null,
  title text not null,
  type text not null
    check (type in ('broiler', 'layer', 'feed_mill', 'processing')),
  description text,
  target_amount numeric(15,2) not null,
  raised_amount numeric(15,2) not null default 0,
  minimum_investment numeric(15,2) not null default 50000,
  roi_min_percent numeric(5,2),
  roi_max_percent numeric(5,2),
  duration_months integer not null,
  risk_level text not null
    check (risk_level in ('low', 'moderate', 'high')),
  status text not null default 'draft'
    check (status in ('draft', 'funding', 'active', 'harvesting', 'closed', 'cancelled')),
  starts_at date,
  ends_at date,
  hero_image_path text,
  investor_count integer default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### `cycle_financials`

Line-item cost breakdown for transparency (PRD investment detail page).

```sql
create table cycle_financials (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references cycles(id) on delete cascade unique,
  feed_cost numeric(15,2),
  vaccination_cost numeric(15,2),
  labor_cost numeric(15,2),
  logistics_cost numeric(15,2),
  other_costs numeric(15,2),
  expected_revenue numeric(15,2),
  notes text,
  updated_at timestamptz default now()
);
```

#### `investments`

```sql
create table investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  cycle_id uuid not null references cycles(id),
  amount numeric(15,2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  certificate_number text unique,
  certificate_path text,
  expected_return_min numeric(15,2),
  expected_return_max numeric(15,2),
  actual_return numeric(15,2),
  invested_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique (user_id, cycle_id)  -- one investment per user per cycle (adjust if needed)
);
```

#### `wallets`

```sql
create table wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) unique,
  balance numeric(15,2) not null default 0 check (balance >= 0),
  locked_balance numeric(15,2) not null default 0 check (locked_balance >= 0),
  currency text not null default 'NGN',
  updated_at timestamptz default now()
);
```

#### `transactions`

```sql
create table transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references wallets(id),
  user_id uuid not null references profiles(id),
  type text not null
    check (type in (
      'deposit', 'withdrawal', 'investment', 'return_payout',
      'refund', 'fee', 'adjustment'
    )),
  amount numeric(15,2) not null,
  balance_after numeric(15,2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  reference text unique,
  external_reference text,       -- Paystack reference
  investment_id uuid references investments(id),
  metadata jsonb,
  created_at timestamptz default now()
);
```

#### `field_reports`

```sql
create table field_reports (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references cycles(id),
  farm_id uuid not null references farms(id),
  author_id uuid not null references profiles(id),
  week_number integer not null,
  title text,
  body text not null,
  mortality_rate numeric(5,2),
  bird_count integer,
  feed_consumption_kg numeric(10,2),
  fcr numeric(5,2),
  egg_count integer,
  vaccination_status text,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'approved', 'published', 'rejected')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

#### `report_media`

```sql
create table report_media (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references field_reports(id) on delete cascade,
  type text not null check (type in ('image', 'video')),
  storage_path text not null,
  caption text,
  sort_order integer default 0,
  created_at timestamptz default now()
);
```

#### `withdrawal_requests`

```sql
create table withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  amount numeric(15,2) not null,
  bank_name text not null,
  account_number text not null,
  account_name text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'processing', 'completed', 'rejected')),
  processed_by uuid references profiles(id),
  processed_at timestamptz,
  rejection_reason text,
  transaction_id uuid references transactions(id),
  created_at timestamptz default now()
);
```

#### `audit_logs`

```sql
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  created_at timestamptz default now()
);
```

#### `platform_stats` (optional materialized view or cron-updated table)

Powers live trust bar on landing page.

```sql
-- Example aggregates for landing page
-- total_invested, total_investors, active_farms, cycle_success_rate
```

### Row Level Security (RLS) summary

| Table | Investor | Field officer | Admin |
|-------|----------|---------------|-------|
| `profiles` | Own row | Own row | All |
| `investments` | Own rows | — | All |
| `wallets` | Own row | — | All |
| `transactions` | Own rows | — | All |
| `cycles` | Published (read) | Assigned farms (read) | All |
| `field_reports` | Published for invested cycles | Own + assigned | All |
| `farms` | Active (read) | Assigned (read) | All |

---

## API & Server Functions

Use TanStack `createServerFn` pattern (see `src/lib/api/example.functions.ts`).

### Public (no auth)

| Function | Purpose |
|----------|---------|
| `listPublishedCycles` | Opportunities page + landing preview |
| `getCycleBySlug` | Opportunity detail |
| `listActiveFarms` | Farm transparency pages |
| `getFarmBySlug` | Farm detail |
| `getPlatformStats` | Trust bar aggregates |
| `submitContactForm` | Contact page |

### Investor (auth required)

| Function | Purpose |
|----------|---------|
| `getDashboardSummary` | Overview cards |
| `getMyInvestments` | Investment list |
| `getInvestmentDetail` | Single investment + feed |
| `getWallet` | Balance + recent transactions |
| `initializeDeposit` | Paystack/Flutterwave checkout |
| `createInvestment` | Lock funds / create pending investment |
| `confirmInvestment` | Finalize after review |
| `requestWithdrawal` | Withdrawal request |
| `getMyReports` | Weekly journals for invested cycles |
| `submitKyc` | KYC form submission |
| `uploadKycDocument` | Presigned upload URL |

### Admin (admin role)

| Function | Purpose |
|----------|---------|
| `createFarm` / `updateFarm` | Farm CRUD |
| `createCycle` / `updateCycle` / `publishCycle` | Cycle lifecycle |
| `updateCycleFinancials` | Cost breakdown |
| `listInvestors` / `getInvestor` | Investor management |
| `reviewKyc` | Approve/reject KYC |
| `approveFieldReport` / `publishFieldReport` | Report workflow |
| `processPayout` / `approveWithdrawal` | Financial ops |
| `getAdminAnalytics` | Dashboard metrics |

### Field officer

| Function | Purpose |
|----------|---------|
| `getAssignedFarms` | Field home |
| `createFieldReport` | New report |
| `updateFieldReport` | Edit draft |
| `submitFieldReport` | Submit for review |
| `uploadReportMedia` | Media upload |

### Webhooks (HTTP handlers)

| Endpoint | Provider | Purpose |
|----------|----------|---------|
| `POST /api/webhooks/paystack` | Paystack | Payment confirmation → credit wallet |
| `POST /api/webhooks/kyc` | KYC provider | Verification status update |

**Webhook requirements:**

- Verify signature on every request
- Idempotent processing (store `external_reference`, skip duplicates)
- Log all events to `audit_logs`

---

## User Flows

### Flow 1: Visitor → Investor (happy path)

```
Landing (/)
  → Browse opportunities (/opportunities)
  → View detail (/opportunities/$cycleId)
  → Sign up (/auth/sign-up)
  → Verify OTP (/auth/verify)
  → Complete KYC (/auth/kyc)
  → Fund wallet (/app/wallet)
  → Invest (/app/invest/$cycleId)
      Step 1: Enter amount
      Step 2: Review (ROI range, fees, risk notice)
      Step 3: Confirm (deduct wallet)
      Step 4: Certificate generated
  → Track on dashboard (/app)
```

### Flow 2: Returning investor

```
Sign in (/auth/sign-in)
  → Dashboard (/app)
  → View investment (/app/investments/$id)
  → Read weekly report (/app/reports)
  → Withdraw (/app/wallet → request withdrawal)
```

### Flow 3: Field officer → Published report

```
Sign in (field_officer role)
  → Field home (/field)
  → Select farm (/field/farms/$id)
  → New report (/field/report/new)
      Enter mortality, feed, vaccination, notes
      Upload photos
      Save draft / Submit
  → Admin reviews (/admin/reports)
  → Admin publishes
  → Investors see update in activity feed
```

### Flow 4: Admin cycle lifecycle

```
Create farm (/admin/farms/new)
  → Create cycle (/admin/cycles/new)
      Set financials, ROI range, target, dates
  → Publish cycle (status: funding)
  → Cycle appears on /opportunities
  → Investments come in
  → Close funding → status: active
  → Field reports published weekly
  → Cycle ends → status: harvesting → closed
  → Process payouts (/admin/payouts)
  → Investor receives return in wallet
```

---

## Page Specifications

### Opportunity detail (`/opportunities/$cycleId`)

**PRD: Critical trust page.** Must feel like a real financial product.

#### Sections

1. **Header**
   - Cycle title, type badge, status (Funding / Active)
   - Farm name + location
   - Hero image

2. **Overview**
   - Duration, ROI range, risk level
   - Funding progress bar
   - Minimum investment
   - Investors joined count

3. **Financial breakdown** (from `cycle_financials`)
   - Feed costs
   - Vaccination costs
   - Labor
   - Logistics
   - Other costs
   - Expected revenue
   - Visual: simple bar or table — use Recharts sparingly

4. **Farm media**
   - Photo gallery
   - Video embed (if available)
   - Link to farm transparency page

5. **Weekly timeline**
   - Published `field_reports` as journal entries
   - Week number, title, body, metrics, photos

6. **Risk disclosure**
   - Disease risks
   - Feed price fluctuations
   - Market volatility
   - Link to full `/legal/risk`

7. **CTA**
   - "Invest now" → auth gate → KYC gate → `/app/invest/$cycleId`

#### Design notes

- Same card/section patterns as landing
- `font-display` for cycle title
- No guaranteed return language

---

### Investor dashboard (`/app`)

**PRD: Premium, calm, financial, organized — NOT flashy.**

#### Overview cards

| Card | Data source |
|------|-------------|
| Total invested | Sum of `investments.amount` where active |
| Active cycles | Count of active investments |
| Total returns | Sum of completed `actual_return` |
| Wallet balance | `wallets.balance` |

#### Active investments list

Each card shows:

- Cycle title + farm
- Progress bar (cycle timeline)
- ROI progress (if applicable)
- Days remaining
- Current status from latest `field_report`
- Link to detail

#### Farm activity feed

Realtime or polled feed from `field_reports` where `status = published` for investor's cycles:

- "Week 3 vaccination completed"
- "Feed shipment received"
- "Mortality report: 0.9%"

Use Supabase realtime subscription on `field_reports` for live feel.

---

### Investment checkout (`/app/invest/$cycleId`)

#### Step 1 — Amount

- Input: investment amount (≥ `minimum_investment`)
- Show available wallet balance
- Link to fund wallet if insufficient

#### Step 2 — Review

- Amount
- Expected return range (calculated from ROI %)
- Platform fee (if any)
- Duration
- Risk notice (checkbox required)
- Link to investment agreement

#### Step 3 — Confirm

- Deduct from wallet (or inline payment)
- Create `investment` record
- Create `transaction` record
- Increment `cycles.raised_amount`

#### Step 4 — Success

- Investment ID
- Certificate download
- Link to dashboard

---

### Admin cycle management

#### Cycle statuses

| Status | Meaning | Public visibility |
|--------|---------|-------------------|
| `draft` | Being configured | Hidden |
| `funding` | Accepting investments | Listed on `/opportunities` |
| `active` | Funded, production running | Listed, funding closed |
| `harvesting` | Cycle ending, sales in progress | Visible to investors |
| `closed` | Complete, returns distributed | Archive |
| `cancelled` | Cancelled | Hidden / refunded |

---

## Phased Implementation Plan

### Phase 0 — Foundation (Week 1–2)

**Goal:** Runnable product shell. No visual changes to landing.

#### Tasks

- [ ] Add `src/assets/` images (9 JPGs referenced in `index.tsx`)
- [ ] Extract marketing components to `src/components/marketing/` (no style changes)
- [ ] Create public routes:
  - [ ] `/opportunities`
  - [ ] `/opportunities/$cycleId` (static mock data first)
  - [ ] `/farms`
  - [ ] `/about`
  - [ ] `/contact`
  - [ ] `/legal/terms`, `/legal/privacy`, `/legal/risk`
- [ ] Wire all `href="#"` in Nav, Footer, opportunity cards to real routes
- [ ] Mount Sonner toasts in `__root.tsx`
- [ ] Create Supabase project
- [ ] Add env vars to `config.server.ts`
- [ ] Run initial migration (core tables)
- [ ] Seed 2–3 farms and cycles matching current mock data

#### Deliverable

Visitor can browse opportunities and view a detail page. Landing unchanged.

---

### Phase 1 — Auth & KYC (Week 2–4)

**Goal:** Users can register and complete identity verification.

#### Tasks

- [ ] Supabase Auth: email + phone signup
- [ ] OTP verification flow
- [ ] `profiles` table + auto-create on signup
- [ ] Role assignment (default: `investor`)
- [ ] Route guards: `beforeLoad` checks session + role
- [ ] KYC wizard (`/auth/kyc`):
  - [ ] Step 1: Personal info (name, address, state)
  - [ ] Step 2: BVN/NIN (send to KYC provider API)
  - [ ] Step 3: ID document upload
  - [ ] Step 4: Review pending state
- [ ] Admin KYC review UI (`/admin/investors`)
- [ ] Gate `/app/invest/*` on `kyc_status === 'verified'`

#### Deliverable

Registered user with verified KYC can access investment flow (wallet next).

---

### Phase 2 — Core domain & live data (Week 4–6)

**Goal:** Replace all hardcoded landing data with database-driven content.

#### Tasks

- [ ] Implement `listPublishedCycles`, `getCycleBySlug`, `getPlatformStats`
- [ ] Opportunities page reads from DB
- [ ] Opportunity detail reads `cycle_financials`
- [ ] Landing `Opportunities` section: fetch top 3 open cycles
- [ ] Landing `TrustBar`: fetch live aggregates (with static fallback)
- [ ] Landing `LiveFarm`: fetch featured farm + latest report
- [ ] Admin: farm CRUD
- [ ] Admin: cycle CRUD + publish workflow
- [ ] Admin: cycle financials editor

#### Deliverable

Marketing site shows real data. Admin can manage farms and cycles.

---

### Phase 3 — Wallet & payments (Week 6–9) ✅ Mostly complete

**Goal:** Users can fund wallet, invest, and request withdrawals.

#### Tasks

- [x] `wallets` + `transactions` tables
- [x] Auto-create wallet on profile creation
- [x] Paystack integration (initialize, webhook, credit wallet)
- [x] Wallet UI (`/app/wallet`)
- [x] Investment checkout flow (`/app/invest/$cycleId`)
- [x] Ledger: every balance change → `transactions` row
- [x] `withdrawal_requests` + admin approval flow (`/admin/withdrawals`)
- [ ] Bank transfer payout via Paystack Transfer API (manual admin transfer for now)
- [ ] Payment receipt PDF/email after deposit

#### Deliverable

End-to-end: fund wallet → invest in cycle → request withdrawal → admin approves.

---

### Phase 4 — Investor dashboard (Week 9–11) ✅ Mostly complete

**Goal:** Full investor experience per PRD.

#### Tasks

- [x] Investor layout with nav (`/app`)
- [x] Dashboard overview (`/app`)
- [x] Investments list + certificate (`/app/investments`)
- [x] Farm activity feed (published reports for user's cycles) — `/app/activity`
- [x] Reports page (`/app/reports`) — transaction history
- [x] Profile page + bank details (`/app/profile`)
- [x] Investment certificate (printable HTML)
- [x] Forgot / reset password (`/auth/forgot-password`, `/auth/reset-password`)
- [x] Email notifications: investment confirmed, deposit receipt, KYC approved, report published

#### Deliverable

Investor can track portfolio, manage wallet, withdraw, download certificate.

---

### Phase 5 — Field reports & admin ops (Week 11–14) ✅ Mostly complete

**Goal:** Operational transparency loop — field → admin → investor.

#### Tasks

- [x] Field officer layout (mobile-first) — `/field`
- [x] Report creation form with photo URLs (up to 5)
- [x] Draft → submit → admin review → publish workflow
- [x] Admin report queue — `/admin/reports`
- [x] Published reports on investor feed — `/app/activity` + dashboard preview
- [x] Published reports on opportunity detail pages
- [ ] File upload for report media (URLs only for now)
- [x] Admin analytics (funding velocity, mortality trends) — `/admin/analytics`
- [x] Audit logs for admin financial actions

#### Deliverable

Weekly farm journals flow from field officer → admin → investor dashboard.

**Create field officer:** `npm run db:create-field-officer`

---

### Phase 6 — Trust differentiators (Ongoing)

| Feature | Phase | Effort |
|---------|-------|--------|
| Farm performance charts (Recharts) | 6 | Medium |
| Push notifications | 6 | Medium |
| Live farm camera snapshots | 6+ | High |
| Referral system | 6+ | Medium |
| Secondary market / early exit | Future | High |
| Multi-language (Yoruba, Hausa) | Future | Medium |

---

## Nigeria-Specific Requirements

### Payments

- **Primary:** Paystack or Flutterwave
- Support: card, bank transfer, USSD, virtual account
- All amounts in **NGN**
- Webhook verification mandatory
- Reconciliation: match `external_reference` to `transactions.reference`

### KYC / identity

- **BVN** and/or **NIN** verification via licensed provider
- Never store raw BVN/NIN in plaintext — hash or tokenize
- NDPR-compliant consent before collection
- ID document storage in private bucket with signed URLs

### Regulatory considerations

> **Legal review required before launch.** Not engineering decisions.

- Clarify legal structure: collective investment vs. partnership vs. contract farming
- SEC registration requirements depending on structure
- Clear risk disclosure and investment agreement
- WHT on returns if applicable
- CAC registration displayed (already on landing trust bar)

### Connectivity

- Field officer app: support draft reports offline, sync when online
- Optimize images (WebP, compression) for slow connections
- SMS OTP via local provider (Termii, Africa's Talking)

---

## Security, Compliance & Trust

### Data protection (NDPR)

- [ ] Privacy policy page (`/legal/privacy`)
- [ ] Consent checkboxes on signup and KYC
- [ ] Data export and deletion process (documented)
- [ ] Encrypt PII at rest (Supabase default + app-level for BVN hash)
- [ ] Signed URLs for document access (short TTL)

### Application security

- [ ] RLS on all Supabase tables
- [ ] Server-only secrets in `config.server.ts` / env — never `VITE_`
- [ ] Rate limiting on auth, KYC, payment endpoints
- [ ] CSRF protection on forms
- [ ] Input validation with Zod on all server functions
- [ ] Idempotent webhook handlers

### Financial integrity

- [ ] Double-entry style ledger (`transactions` with `balance_after`)
- [ ] No direct balance mutation without transaction record
- [ ] Admin payout requires `super_admin` or two-person approval (future)
- [ ] `audit_logs` for: KYC decisions, payout approvals, balance adjustments

### Trust UX (from PRD — engineering checklist)

- [ ] Every opportunity shows ROI **range**, not single number
- [ ] Risk disclosure on detail page and checkout
- [ ] Real farm media (no stock photos in production)
- [ ] Weekly reports with named author (field officer)
- [ ] Platform stats on landing are real or clearly labeled if pre-launch
- [ ] Footer disclaimer present (already on landing)

---

## MVP Scope & Launch Criteria

### MVP includes (Phases 0–4)

- Public website with real opportunity data
- Auth + KYC (form + admin review)
- Wallet funding (Paystack)
- Investment in open cycles
- **Withdrawals** (request + admin approval)
- Investor dashboard (overview, investments, wallet, reports, profile, bank details)
- Admin: farms, cycles, KYC review, performance/payouts, **withdrawal queue**
- Legal pages
- Investment certificates
- Forgot password (requires `RESEND_API_KEY` + `APP_URL` on Vercel)

### MVP excludes (post-launch)

- Live farm camera
- Referral system
- Push notifications (email only at launch)
- Field officer mobile app (admin can enter reports manually at first)
- Secondary market

### Launch checklist

- [ ] Legal pages reviewed by counsel
- [ ] KYC provider integrated and tested
- [ ] Paystack live keys + webhook tested
- [ ] At least 1 real farm with media
- [ ] At least 1 published cycle
- [ ] Admin payout process documented
- [ ] Error monitoring (Sentry or similar)
- [ ] SSL + custom domain
- [ ] NDPR privacy policy published
- [ ] Load test on payment webhook endpoint

---

## Success Metrics

### Trust metrics

| Metric | Target (6 months post-launch) |
|--------|-------------------------------|
| KYC completion rate | > 70% of signups |
| Investment conversion (KYC → first investment) | > 40% |
| Weekly report publish rate | 100% of active cycles |
| Investor retention (2nd investment) | > 30% |

### Business metrics

| Metric | Notes |
|--------|-------|
| Total AUM (assets under management) | Sum of active investments |
| Funding velocity | Time to fill cycle target |
| Cycle success rate | % cycles returning ≥ minimum ROI |
| Withdrawal processing time | < 48 hours |

### Product metrics

| Metric | Notes |
|--------|-------|
| Opportunity detail → invest funnel | Track drop-off per step |
| Mobile vs desktop split | Optimize for majority |
| Report engagement | % investors viewing weekly reports |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Regulatory uncertainty | High | Legal review before public fundraising |
| Payment webhook failures | High | Idempotent handlers, reconciliation dashboard |
| Fake/unrealistic farm data erodes trust | High | Field reports with media, admin audit |
| KYC fraud | Medium | Licensed KYC provider, manual review queue |
| Field connectivity issues | Medium | Offline draft + sync |
| Scope creep (camera, referral) | Medium | Strict MVP scope, Phase 6 backlog |
| Missing image assets block build | Low (now) | Phase 0 first task |

---

## Appendix: Design Tokens Reference

From `src/styles.css` — use these consistently across all new pages.

### Brand colors

| Token | CSS variable | Usage |
|-------|--------------|-------|
| `cream` | `--cream` | Page background |
| `bone` | `--bone` | Card/surface tint, alternating sections |
| `forest-deep` | `--forest-deep` | Primary dark, headings accent, progress bars |
| `forest` | `--forest` | Secondary green |
| `lime` | `--lime` | Signature accent, CTAs, highlights |
| `clay` | `--clay` | Warm earth brown |
| `gold` | `--gold` | Gold accent |
| `ink` | `--ink` | Body text |

### Typography

| Utility | Font |
|---------|------|
| Default body | Inter (`--font-sans`) |
| `.font-display` | Instrument Serif (`--font-display`) |

### Shadows

| Utility | Usage |
|---------|-------|
| `.shadow-soft` | Cards at rest |
| `.shadow-lifted` | Hero, elevated cards, hover state |

### Border radius conventions

| Element | Class |
|---------|-------|
| Buttons, badges | `rounded-full` |
| Cards | `rounded-2xl` |
| Hero container | `rounded-3xl` |

### shadcn mapping

| shadcn token | Maps to |
|--------------|---------|
| `--primary` | `forest-deep` |
| `--accent` | `lime` |
| `--background` | `cream` |
| `--secondary` | `bone` |
| `--foreground` | `ink` |

### Chart colors

`--chart-1` through `--chart-5` = forest, lime, clay, gold, forest-deep

---

## Document history

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-15 | Initial plan from PRD review + codebase assessment |

---

*This document should be updated as phases complete. Link PRs and migration files to each checklist item as work progresses.*
