# Loom walkthrough script — Ironclad Roofing Co. (Whop Workforce task)
Target: ~65 seconds, one take, screen + voice. Record at normal speaking pace; small stumbles are fine, don't restart.

## 0:00–0:08 — Intro (homepage on screen)
"Hey, this is Ironclad Roofing Co. — a complete website template for a roofing company in Austin, Texas, built with Whop Websites. It's live right now, and everything on it works with real Whop plans and payments."

## 0:08–0:20 — Tour (scroll the homepage)
"Homepage has the three services — repair, replacement, and inspection — then the service area, twelve towns around Austin with a map, a financing callout, customer reviews, and contact at the bottom."

## 0:20–0:33 — Checkout (click the $149 inspection plan)
"Three real plans. The $149 inspection — clicking it opens checkout, and the payment form is Whop's own Payment Elements, no custom card form anywhere. Same for the $500 deposit and the $299 flat-rate tune-up."

## 0:33–0:44 — Deposit / card-on-file (open the /deposit page)
"The deposit page saves the customer's card on file with a setup intent, so the final balance can be invoiced later through Whop's Invoices API and charged to that saved card."

## 0:44–0:53 — Estimate form (open the estimate form)
"The estimate form takes a name, email, city, and what they need. One honest note: Whop's legacy Leads API refuses Company API keys with a blanket 401, even with the permission granted — I verified that live — so the form tries it first, then records a standard lead event on Whop's current API."

## 0:53–1:05 — Code (open the GitHub repo)
"And the code is all here — React and Vite front end, Cloudflare Worker back end, with the API routes for checkout, setup intents, invoices, and webhooks. Live site and source links are in the submission."

## Links to show / paste in the submission
- Live site: https://ironclad-roofing-austin.whop.site
- Source: https://github.com/krisb260/ironclad-roofing
