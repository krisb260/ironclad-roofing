# Ironclad Roofing Co. — Whop Website Template

A production-ready roofing company website template built with **Whop Websites** — for the
Whop Workforce bounty *"Build a production-ready website template for a US roofing company
using Whop Websites"* (Bens Whop).

**Brand (original):** Ironclad Roofing Co., Austin, TX. All copy is original. No content,
names, prices, or images were copied from any demo store. Visuals are original CSS/SVG art,
except the hero photo: U.S. Navy photo (public domain), via Wikimedia Commons
(`public/hero-roof.jpg` — crew tearing off old shingles, Norfolk, VA, 2007).

## What it does

- **Homepage** — hero, trust bar, services (repair / replacement / inspection), service area
  (Austin + 11 surrounding towns, map graphic), financing callout, clearly-labelled sample
  reviews, contact + estimate form, pricing, how-it-works.
- **Pricing** — the three plans with working checkout links.
- **Checkout** (`/checkout/:plan`) — one Whop Checkout handle with `CheckoutElement`
  (the full checkout surface — order summary, promo code, payment methods, and
  its own express wallet row for Apple Pay / Google Pay / PayPal). One handle
  mounts exactly one element type, so there is no separate ExpressCheckoutElement
  handle — that element is the alternative for wallet-only pages. Note:
  `BrandingElement` is a **Payments-namespace** element and throws inside a
  Checkout handle; the Checkout surface renders Whop's merchant-of-record
  notice itself. `BrandingElement` is mounted where it belongs: inside the
  `<Payments>` handle on the deposit page.
- **Deposit** (`/deposit`) — $500 project deposit via the Payments handle in
  `mode: "setup"`: card saved without charging → confirmation token → server creates the
  setup intent → final balance billed later through the Invoices API.
- **Estimate** (`/estimate`) — "Request an Estimate" form → `POST /api/estimate` → Whop
  Leads API (Legacy v2) first; on its blanket 401 for Company API keys, falls back to a
  standard `lead` conversion event on the Current API (see `src/lib/whop-server.ts`).
- **Success** (`/checkout/success`) — reads `?payment=` + `?status=` for display only.
  Fulfilment happens server-side, from the `payment.succeeded` webhook — never from the
  browser callback.

## The three plans

| Plan | Price | Billing |
| --- | --- | --- |
| Roof Inspection | $149 | One-time |
| Project Deposit | $500 | One-time (card saved for final balance) |
| Flat-Rate Roof Tune-Up | $299 | One-time |

Plan ids live in one place: `src/lib/plans.ts`. They are **placeholders** until the real
Whop variants are created — see "Going live" below.

## Build path (why this layout)

Whop hosting runs sites on Cloudflare Workers, so the server is a Worker
module: `src/worker.ts` exports `fetch` (API routes live in `src/api.ts`,
web-standard Request/Response, shared by both runtimes). Run directly under
Node (`node dist/server/index.js`, the `preview` script) the same module
starts a plain node:http server instead, so local verification needs no
Workers tooling. A single `vite.config.ts` builds both environments (Vite 6
Environment API): the React SPA to `dist/client`, the Worker to
`dist/server/index.js`, with `@cloudflare/vite-plugin` and the `whop()`
plugin packing `dist/whop-build.zip`. `wrangler.jsonc` names the worker
(`ironclad-roofing`), sets `nodejs_compat`, points `main` at
`src/worker.ts`, and binds the static assets as `ASSETS` with SPA
`not_found_handling` so client routes resolve to `index.html`.

## Run locally

```bash
npm install
npm run build        # client -> dist/client, server -> dist/server
npm run preview      # serves the built site on http://localhost:3000
```

`npm run dev` starts the Vite dev server (client only, port 5173).
`npm run typecheck` runs `tsc --noEmit`. `npx wrangler dev` runs the built
Worker locally in workerd (port 8787) — the closest match to the hosted
runtime; use it to check the Worker entry before deploying.

Without Whop credentials the site runs in **demo mode**: every page works, the estimate
form and checkout pages show honest "not connected yet" notices, and the API routes answer
503 instead of pretending a payment or lead succeeded.

## Going live (needs Krish)

1. **Sign in:** `whop login` (browser OAuth) or set `IRONCLAD_API_KEY`.
   Then `whop quickstart --account_id biz_…` to pick the business the site sells for.
   The app is already registered (see `whop.app.json`) and its domain is
   already claimed — do not re-create either.
2. **Create the product + 3 variants** (one-time plans: $149 inspection, $500 deposit,
   $299 tune-up) — via the dashboard or `POST /api/v1/variants`. Paste the real
   `plan_…` ids into `src/lib/plans.ts` and the real `biz_…` id into `WHOP_ACCOUNT_ID`.
3. **Secrets:** `whop apps secrets set IRONCLAD_API_KEY=… WHOP_ACCOUNT_ID=… IRONCLAD_WEBHOOK_SECRET=… WHOP_COMPANY_ID=…`
   (or a `.env` file locally — never commit it). The Company API key needs scopes
   `plan:create`, `product:create`, `invoice:create`, `payment:charge`.
4. **Test in the sandbox first:** sandbox keys from sandbox.whop.com, `WHOP_API_ORIGIN=https://sandbox-api.whop.com`,
   test cards from the sandbox guide. Prove: $149 purchase, $500 deposit + saved card,
   invoice auto-charge, estimate → lead visible in the dashboard.
5. **Deploy:** `whop apps deploy --preview` first, then `whop apps deploy` to go live.
   The task's submission form expects a `whop.app` URL — check what domain the deploy
   assigns (current docs say `.whop.site`) and submit the genuinely-live URL.
6. **Record the Loom** (1+ min, see the script outline in the build report): site tour →
   live checkout → estimate form → code walkthrough.
7. **Submit** via "Attempt this bounty" with: live site URL, public source-code URL
   (this repo), Loom video.

## Server routes

| Route | What it does |
| --- | --- |
| `GET /api/health` | Liveness check |
| `GET /api/config` | Public config: plans + whether checkout is live (no secrets) |
| `POST /api/estimate` | Validates the form → `POST /api/v2/leads` (Legacy v2) |
| `POST /api/setup-intent` | `{ confirmation_token }` → `POST /api/v1/setup_intents` |
| `POST /api/invoice` | `{ member_id, plan_slug, payment_method_id?, memo? }` → `POST /api/v1/invoices` |
| `POST /api/invoice/:id/charge` | Charges an open invoice to its saved method |
| `POST /api/webhooks/whop` | Verifies the signature (`@whop/sdk` `unwrapWebhook`), fulfils only from `payment.succeeded`, stores saved methods from `setup_intent.succeeded` |

## Known open items (from research)

- **Leads is Legacy v2** with no official docs page — verified from the community MCP
  source + Zapier. Test-fire it with a real key before recording the Loom.
- **Apple Pay on `.whop.site`** may need Domains API registration — verify at build/deploy
  time; Google Pay has no such requirement.
- **Invoice items** may be variant-only — verify the item schema when wiring the final
  balance; if so, price each final balance as a one-time variant.
- **whop.app vs whop.site** — the task says `whop.app`, current docs say `.whop.site`.
  Submit whichever URL is genuinely live after deploy.
