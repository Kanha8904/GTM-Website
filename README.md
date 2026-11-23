# LeadStrategus GTM Engineering Bootcamp: landing page

A single-page, static marketing site. Everything (nav, curriculum, FAQ, application form, legal text and the thank-you state) lives on one page. Nav links scroll to sections.

## Edit content

**All variable content lives in [`content.js`](content.js):** dates, venue, price, seats, guided-execution weeks, faculty, FAQ, client logos, form backend and analytics IDs. Lines marked `TODO` still need confirmed values.

After editing, rebuild (Netlify and Vercel do this automatically on deploy):

```bash
node build.mjs
```

Preview locally at http://localhost:4321:

```bash
npm run preview
```

No dependencies to install. Node 18+ is enough.

## How it works

| Path | What it is |
|---|---|
| `content.js` | The one file editors change |
| `src/render.mjs` | Turns the content into a fully prerendered `index.html` (fast, crawlable, and WhatsApp/LinkedIn link previews work) |
| `build.mjs` | Writes `dist/`, copies `public/`, and **fails the build if banned claims appear in the copy** (guaranteed leads/meetings, PhantomBuster, etc.) |
| `public/main.js` | Interactions: scroll-spy, mobile menu, 8-stage stepper, Day 1–5 tabs, count-up stats, modals, form validation and submission, analytics |
| `public/styles.css` | Mobile-first styles; design tokens on `:root` |
| `public/fonts/` | Self-hosted Plus Jakarta Sans and Inter (OFL) |
| `src/icons/` | Lucide icons (ISC), inlined at build time |
| `scripts/make-og.mjs` | Regenerates the 1200×630 share image and favicon PNGs from `scripts/og-template.html` (needs Playwright) |

## Application form

Set `form.provider` and `form.endpoint` in `content.js`:

- **`n8n` (recommended):** the form POSTs JSON to your n8n webhook. Suggested flow: Webhook → HubSpot create/update contact → Google Sheets append → Slack/WhatsApp/email alert. Make sure the webhook replies 2xx and allows CORS from the site's domain.
- **`formspree`** / **`web3forms`:** POSTs JSON to their endpoint (for Web3Forms put `access_key` in `form.extraFields`).
- **`netlify`:** uses Netlify Forms. The form is already marked `data-netlify` with a honeypot.
- **Empty (current default):** no backend yet. Submitting opens the applicant's email app with the application filled in, addressed to `contact.email`.

The payload includes all fields plus `utm_source`, `utm_medium`, `utm_campaign`, `page_url`, `submitted_at`, and the consent flags. `?type=cohort` (or `individual`, `sponsored`) in the URL pre-selects "I'm applying as".

## Analytics

GA4, Meta Pixel and LinkedIn Insight load **only** when their IDs are set in `content.js`. A successful application fires `apply_submit`.

## Still needed from LeadStrategus

- Official logo SVG (`public/img/logo.svg` and `favicon.svg` are placeholders), then run `node scripts/make-og.mjs`
- Kingshuk's headshot, confirmed bio and LinkedIn URL
- Dates, venue name, contact email, WhatsApp number and live site URL
- Approved Privacy Notice and Terms/Refund text (`legal` in `content.js`)
- Decisions on the open questions: guided-execution length (Q1, set to 8), client logos (Q5, hidden), supporting faculty (Q8, hidden)
