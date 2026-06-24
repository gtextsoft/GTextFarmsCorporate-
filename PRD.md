# Product Requirements Document — GText Farms

**Corporate Website & Agricultural Investment Platform + GText Farms Co-operative Society**

Tagline: *Growing Healthy Food. Creating Sustainable Wealth.*

**Document version:** 2.0 · **Status:** Living document (reflects what is built + what is planned)

> This PRD describes the product as it actually exists in this repository plus the agreed cooperative roadmap. For the buildable, phase-by-phase technical plan see:
> - `docs/IMPLEMENTATION_PLAN.md` — overall platform build status
> - `docs/COOPERATIVE_FLOW_PLAN.md` — detailed cooperative flow, data models, and phases

---

## 1. Project Overview

GText Farms is an integrated agricultural company and investment platform for the Nigerian market. The platform has two pillars:

1. **Corporate website** — showcases farm operations, products, and open investment opportunities; builds trust; generates leads.
2. **GText Farms Co-operative Society** — a membership-gated poultry investment programme where members register, become full members (after a ₦10,000 entrance fee), fund their account by bank transfer, invest in plots, track farm performance, and withdraw monthly returns.

Operations span: Poultry, Vegetables, Cassava (farming + processing), Palm Oil (production + processing), and Agricultural Consulting.

> **Scope note — Rice farming:** The client's original WhatsApp PRD listed Rice farming prominently, but it is **not** currently in the codebase or this PRD's product scope. Treat Rice as **out of scope pending confirmation** — flag to the client before building.

### Actual technology stack (as built)

The original PRD recommended Next.js / NestJS / PostgreSQL. The platform was built on a different, equally valid stack — this PRD reflects **what is actually deployed**:

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start + TanStack Router (file-based) + React 19 |
| Bundler / SSR | Vite 8 + Nitro (Vercel preset) |
| Backend | TanStack Start server functions (`createServerFn`) + HTTP API routes |
| Database | MongoDB + Mongoose |
| Styling / UI | Tailwind CSS v4 + shadcn/ui (Radix) + Lucide + Recharts |
| Forms / validation | react-hook-form + Zod |
| Auth | Cookie sessions (TanStack Start) + bcryptjs + JWT (jose) |
| Payments | Paystack (auto-credit) + **manual bank transfer** (cooperative) |
| File storage | **Vercel Blob** (receipts, ID documents, passport photos) |
| Email | Resend (transactional) |
| SMS | Termii (deposit alerts) |
| Hosting | Vercel |

---

## 2. Business Goals & Success Metrics

**Goals:** establish GText Farms as a trusted agricultural brand; showcase operations; generate buyer/partner leads; attract and retain agro-investors; provide transparent investment tracking; build a cooperative community.

**Success metrics:** website traffic, contact inquiries, cooperative registrations, full-member conversions, investment subscriptions, investor retention (2nd investment), withdrawal processing time.

---

## 3. Target Audience

- **Customers:** retail consumers, agro-product distributors, food processors.
- **Investors / members:** working professionals, cooperative members, Nigerians in diaspora, agricultural-investment enthusiasts, corporate investors.

---

## 4. Corporate Website (BUILT)

Public marketing site, MongoDB-driven, in the approved "Henhouse" design language.

| Page / route | Status |
|--------------|--------|
| `/` Home (hero, stats, what-we-do, opportunity highlight, gallery, testimonials, news, CTA) | ✅ Built |
| `/about` Company story, mission, vision, values, leadership | ✅ Built |
| `/farms`, `/farms/$farmSlug` Farm operations & detail | ✅ Built |
| `/products`, product detail Products catalogue (quote + bulk order) | ✅ Built |
| `/opportunities`, `/opportunities/$cycleId` Investment opportunities | ✅ Built |
| `/gallery`, `/gallery/$itemSlug` Gallery | ✅ Built |
| `/news`, `/news/$slug` Blog / news | ✅ Built |
| `/performance` Public track record / payouts | ✅ Built |
| `/contact` Contact form, WhatsApp, map, phone, email | ✅ Built |
| `/legal/*` Terms, Privacy, Risk, Investment Agreement, Cooperative Bylaws | ✅ Built |

---

## 5. Investor Platform (`/app`) — BUILT

Standard KYC-gated investor experience (separate from the cooperative portal):

- Registration → KYC submission → admin approval.
- Wallet funding via **Paystack** (webhook-credited) + withdrawals (request + admin approval).
- Dashboard: total investment, active/matured investments, earnings, wallet balance.
- Investment marketplace (per-cycle), certificates, transaction history, farm activity feed, notifications, profile/bank details.

---

## 6. GText Farms Co-operative Society (`/co-operative`)

The cooperative is the primary focus of current work. Entry point: **`gtextfarms.com/co-operative`** → register / login.

### 6.1 Member lifecycle (state machine)

Each member advances through explicit statuses; each step is gated until the previous one is complete.

```
registered
  → (verify email)            email_verified / provisional_member  [membership number assigned]
  → (complete profile)        profile complete, entrance fee due
  → (pay ₦10,000 entrance fee → admin confirms)   full_member
  → (fund investment account → admin confirms)    funded
  → (accept memorandum + invest in plots)         active_investor
```

> **Entrance-fee decision (locked):** Full membership is **gated on payment of the ₦10,000 entrance fee**. Profile completion alone does **not** make a full member — the member must pay the entrance fee by bank transfer and have it confirmed by an admin.

### 6.2 Registration & onboarding

1. **Register** (`/co-operative/register`) — First name, Last name, Email, Password, Repeat password.
   - Creates user (`cooperativeMember: true`, `membershipStatus: registered`), auto-creates wallet.
   - Sends **Email 1 — Welcome & verify** (verification link, 24h expiry). No membership number yet.
2. **Verify email** (`/co-operative/verify?token=…`) —
   - Assigns sequential **membership number**, zero-padded to 6 digits, **starting at `000032`** (configurable via `COOP_MEMBERSHIP_START`, default 32).
   - Sets `membershipStatus: provisional_member`.
   - Sends **Email 2 — Membership confirmed**: membership number + **cooperative bylaws PDF (attached)** + link to complete profile.
3. **Complete profile** (`/co-operative/complete-profile`) — hard gate. Collects the full subscription-form data:
   - **Personal:** full name, date of birth, gender, nationality.
   - **Contact:** phone, email (read-only).
   - **Identification:** ID type (NIN / passport / voter card / driver's licence / other), ID number, ID document upload, passport photo upload.
   - **Next of kin:** full name, relationship, address, phone.
   - **Financial:** bank details (account name, bank, account number); optional occupation/employer.
   - **Declaration & consent:** accept bylaws / abide by cooperative rules (checkbox + timestamp), data-processing consent.
   - On submit → profile complete, **entrance fee becomes due** (status moves toward `full_member` only after fee confirmation).
4. **Pay entrance fee (₦10,000)** — via the manual bank-transfer flow (§6.3) with `purpose: entrance_fee`. On admin confirmation → `full_member`.

### 6.3 Manual bank-transfer payment (entrance fee + investment funding)

A single mechanism serves both the entrance fee and investment funding (distinguished by `purpose`).

**Member submits** (`/co-operative/fund`):
- **Displayed:** GText Farms bank details (account name, bank name, account number) + payment reference `GF-{membershipNumber}`.
- **Form:** payer account name, payer bank name, amount paid (₦), **upload payment receipt** (image/PDF via Vercel Blob), optional transfer date/reference.
- **Notice:** *"Payment confirmation can take up to 24 hours."*
- On submit → creates a payment record (`status: pending`); amount shows on the dashboard as **"Pending approval"** (not yet investable); admin is notified.

**Admin confirms** (`/admin/cooperative/payments`):
- Queue of pending payments with payer details + receipt preview; SLA highlight if pending > 24h.
- **Approve** → credits the member's **available-for-investment balance** (entrance-fee payments instead/also flip status to `full_member`); **Reject** → reason emailed.
- Emails: *payment received*, *payment approved*, *payment rejected*.

### 6.4 Memorandum acceptance (before first investment)

Before investing, the member must **read the memorandum / investment agreement and tick acceptance** of each clause. A consent record (document version + timestamp + IP) is stored. Investing is blocked until consent is recorded.

### 6.5 Investing in plots

After payment is confirmed and the memorandum accepted:
- Member views available **investment packages** (admin-defined, e.g. *Layer Poultry — ₦X per plot*, with min/max plots, cycle duration, expected returns).
- Member chooses **number of plots** → total = plots × price; must be ≤ available-for-investment balance.
- Confirm → debits balance → creates an investment with plot count + certificate number + downloadable certificate.

### 6.6 Member dashboard (`/co-operative/dashboard`)

KPI cards:
- **Available balance for investment** — credited when admin approves a deposit; decreases on invest.
- **Available funds for withdrawal** — monthly returns credited here; member requests withdrawal.
- **Pending payment** — sum of unconfirmed deposits ("awaiting confirmation, up to 24h").
- **Active investments / total plots** and **total invested**.

Secondary sections: investment portfolio, payment history, withdrawal history, **farm records** (read-only), documents (bylaws, agreement, certificates).

### 6.7 Farm records menu

Admin enters operational data from the backend (monthly summary style): stock (hens, roosters, chicks, mortality, opening/closing), production (eggs, broken eggs, feed kg, trays), sales (eggs, meat, birds, other), expenses, targets (laying ratio, FCR, mortality rate), per farm/month. Members see a **read-only records menu** with charts/tables.

### 6.8 Monthly withdrawals

Members withdraw from the **withdrawable balance** only (monthly returns). Request → admin approves → manual bank payout (reuses the existing withdrawal pattern). Optional fixed monthly window.

---

## 7. Admin Panel — BUILT + EXTENSIONS

**Built:** user/investor management, KYC review, cycles & farms CRUD, content (news, gallery, FAQ, team), products, field-report review/publish, withdrawals queue, analytics, audit log, cooperative member list (`/admin/cooperative/members`).

**Cooperative extensions (to build):**
- **Payment confirmation queue** (`/admin/cooperative/payments`) — approve/reject manual payments, view receipts, 24h SLA.
- **Farm monthly records** (`/admin/cooperative/records`) — Excel-style monthly entry feeding the member records menu.
- **Coop packages** (`/admin/cooperative/packages`) — plot-based packages, plot allocation.
- Extend withdrawals for cooperative monthly payouts.

---

## 8. Notifications

- **In-app:** slot/investment purchased, earnings credited, withdrawal approved, new farm update, payment status.
- **Email (Resend):** welcome+verify, membership number + bylaws PDF, profile complete, payment received/approved/rejected, investment confirmed, monthly return credited, withdrawal status. (Built emails are listed in `docs/COOPERATIVE_FLOW_PLAN.md` §6.)
- **SMS (Termii):** deposit alerts (and future push via Firebase — Phase 2).

---

## 9. Security & Compliance

SSL; bcrypt password hashing; hashed/peppered KYC identifiers and tokens; session cookies (httpOnly, secure, sameSite); 2FA (planned); audit logs for money/KYC/payout actions; signed/short-TTL access to uploaded documents; Zod validation on all server functions; idempotent payment webhooks; NDPR-compliant consent. Regulatory structure (cooperative / collective investment / SEC) requires legal review before public fundraising.

---

## 10. Build Status Summary (cooperative)

| Requirement | Status |
|-------------|--------|
| `/co-operative` portal + branding | ✅ Built |
| Register (first/last name, email, password) | ✅ Built |
| Email verification + welcome emails | ✅ Built |
| Membership number (`000032+`, 6-digit) | ✅ Built |
| Profile completion (full subscription form) + hard gate | ✅ Built |
| Bylaws delivered as **PDF attachment** | ⚠️ Currently a link — **to build** |
| Admin member list | ✅ Built |
| ₦10,000 entrance-fee gate to full membership | ✅ Built |
| Manual bank transfer + receipt upload (Vercel Blob) | ✅ Built |
| Admin payment confirmation queue | ✅ Built (`/admin/cooperative/payments`) |
| Available-for-investment balance credited on confirmation | ✅ Built |
| Withdrawable balance bucket (separate from investable) | ❌ To build |
| Memorandum acceptance (consent record) | ❌ To build |
| Plot-based investment packages | ❌ To build |
| Farm monthly records (admin input + member view) | ❌ To build |
| Monthly withdrawal for cooperative members | ❌ To build |

**Most recent build (done):** §6.3 manual bank-transfer payment loop + §6.2 entrance-fee gate + Vercel Blob receipt uploads. **Next:** memorandum consent gate → plot-based packages → farm records → withdrawable bucket + monthly withdrawals.

### Required environment variables (new)

| Variable | Purpose |
|----------|---------|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for receipt / document uploads (required for uploads) |
| `COOP_BANK_ACCOUNT_NAME` / `COOP_BANK_NAME` / `COOP_BANK_ACCOUNT_NUMBER` | GText Farms bank details shown to members on the payment page |
| `COOP_ENTRANCE_FEE` | Entrance fee in Naira (optional, default `10000`) |
| `COOP_MEMBERSHIP_START` | Membership-number start (optional, default `32` → `000032`) |

---

## 11. Future Phase Features

Mobile app (Android/iOS), Firebase push notifications, referral/leaderboard, cooperative voting, live farm camera, automated ROI distribution, AI farm assistant, produce marketplace, multi-language.
