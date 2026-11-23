// Renders the whole single page from content.js into one static HTML string.
// Prerendering keeps the page fast, crawlable and shareable (WhatsApp/LinkedIn
// previews don't run JavaScript). main.js only adds interactivity on top.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const iconCache = new Map();

export const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Inline Lucide icon (ISC licence), decorative. */
export function icon(name, cls = "") {
  if (!iconCache.has(name)) {
    const raw = readFileSync(join(here, "icons", `${name}.svg`), "utf8");
    const inner = raw.slice(raw.indexOf(">", raw.indexOf("<svg")) + 1, raw.lastIndexOf("</svg>"));
    iconCache.set(name, inner.replace(/\s*\n\s*/g, ""));
  }
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconCache.get(name)}</svg>`;
}

const logoSvg = (k = "") => {
  const raw = readFileSync(join(here, "..", "public", "img", "logo.svg"), "utf8").replace(/ls-([ab])/g, `ls-$1${k}`);
  return raw.replace(/<!--.*?-->/gs, "").replace('role="img" aria-label="LeadStrategus"', 'aria-hidden="true" focusable="false" class="logo-mark"');
};

const initials = (name) => name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export function renderPage(c) {
  const p = c.programme;
  const N = p.guidedWeeks;
  const sub = (s) => String(s).replaceAll("{N}", N);
  const wa = c.contact.whatsapp
    ? `https://wa.me/${encodeURIComponent(c.contact.whatsapp)}?text=${encodeURIComponent(c.contact.whatsappMessage)}`
    : "";
  const ctaBtn = (label = "Apply Now", extra = "", type = "") =>
    `<a class="btn btn-primary ${extra}" href="#apply"${type ? ` data-apply-type="${type}"` : ""}>${label} ${icon("arrow-right")}</a>`;

  const metaDesc = `5-day hands-on GTM engineering bootcamp in ${p.city}. Build your ICP, signal-based account list, messaging and an n8n + Claude outbound workflow, then get ${N} weeks of guided execution. Only ${p.totalSeats} seats.`;
  const ogUrl = c.site.url.replace(/\/$/, "");
  const ogImg = ogUrl + c.site.ogImage;

  // ---------- JSON-LD ----------
  const org = {
    "@type": "Organization",
    "@id": ogUrl + "#org",
    name: "LeadStrategus",
    url: "https://leadstrategus.com",
    logo: ogUrl + "/img/logo.svg",
    slogan: "Superpower your sales!",
    sameAs: ["https://leadstrategus.com", "https://leadstrategus.ai", "https://expotofunnel.com", c.contact.linkedin].filter(Boolean),
  };
  const offers = [
    { "@type": "Offer", name: "Individual / single sponsored seat", price: c.pricing.individual.withGst.replace(/[^\d]/g, ""), priceCurrency: "INR", url: ogUrl + "/#pricing", category: "Paid" },
    { "@type": "Offer", name: `Company cohort (${c.pricing.cohort.minSeats}+ seats), per seat`, price: c.pricing.cohort.withGst.replace(/[^\d]/g, ""), priceCurrency: "INR", url: ogUrl + "/#pricing", category: "Paid" },
  ];
  const place = {
    "@type": "Place",
    name: p.venue,
    address: { "@type": "PostalAddress", streetAddress: p.venueArea, addressLocality: p.city, addressRegion: "Karnataka", addressCountry: "IN" },
  };
  const course = {
    "@type": "Course",
    name: `${p.name}: ${p.tagline}`,
    description: metaDesc,
    provider: { "@id": ogUrl + "#org" },
    offers,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Onsite",
      location: place,
      courseWorkload: `P5D in class + ${N} weeks guided execution`,
      ...(p.startDate ? { startDate: p.startDate, endDate: p.endDate || undefined } : {}),
    },
  };
  const graph = [org, course];
  if (p.startDate) {
    graph.push({
      "@type": "EducationEvent",
      name: p.name,
      startDate: p.startDate,
      endDate: p.endDate || p.startDate,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: place,
      organizer: { "@id": ogUrl + "#org" },
      offers: offers.map((o) => ({ ...o, availability: "https://schema.org/InStock" })),
      image: ogImg,
      description: metaDesc,
    });
  }
  graph.push({
    "@type": "FAQPage",
    mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: sub(f.a) } })),
  });
  const jsonLd = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");

  // Runtime config for main.js (no secrets in here: it is public).
  const runtime = JSON.stringify({
    form: c.form,
    analytics: c.analytics,
    email: c.contact.email,
    whatsapp: wa,
    responseDays: p.responseDays,
    minSeats: c.pricing.cohort.minSeats,
  }).replace(/</g, "\\u003c");

  // ---------- sections ----------
  const nav = [
    ["outcomes", "Outcomes"],
    ["who", "Who it's for"],
    ["system", "The System"],
    ["curriculum", "Curriculum"],
    ["faculty", "Faculty"],
    ["pricing", "Pricing"],
    ["faq", "FAQ"],
  ];

  const facts = [
    ["calendar", p.dates],
    ["map-pin", `${p.venue}, ${p.city}`],
    ["ticket", `Only ${p.totalSeats} seats`],
    ["clock", `5 days + ${N} weeks guided execution`],
  ];

  const heroVisual = `
  <svg class="hero-rings" viewBox="0 0 560 430" role="img" aria-labelledby="hv-t">
    <title id="hv-t">AI for the heavy lifting, plus human judgement for the hard calls, equals effective outbound</title>
    <defs>
      <linearGradient id="hv-blue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#60A5FA"/><stop offset="1" stop-color="#2563EB"/></linearGradient>
      <linearGradient id="hv-warm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2545B"/><stop offset=".55" stop-color="#D9468F"/><stop offset="1" stop-color="#7C4DFF"/></linearGradient>
    </defs>
    <circle class="ring ring-a" cx="200" cy="190" r="152" fill="#2563EB" fill-opacity=".07" stroke="url(#hv-blue)" stroke-width="3"/>
    <circle class="ring ring-b" cx="360" cy="190" r="152" fill="#F2545B" fill-opacity=".07" stroke="url(#hv-warm)" stroke-width="3"/>
    <g transform="translate(108 92)" color="#2563EB">${icon("cpu").replace('class="ic "', 'width="36" height="36"')}</g>
    <text x="126" y="172" text-anchor="middle" class="r-big" fill="#1D4ED8">AI</text>
    <text x="126" y="206" text-anchor="middle" class="r-sm" fill="#3F3D56">for the</text>
    <text x="126" y="232" text-anchor="middle" class="r-sm r-b" fill="#0F0C29">heavy lifting</text>
    <g transform="translate(416 92)" color="#C7303A">${icon("brain").replace('class="ic "', 'width="36" height="36"')}</g>
    <text x="434" y="166" text-anchor="middle" class="r-md" fill="#C7303A">Human</text>
    <text x="434" y="192" text-anchor="middle" class="r-md" fill="#C7303A">judgement</text>
    <text x="434" y="222" text-anchor="middle" class="r-sm" fill="#3F3D56">for the</text>
    <text x="434" y="248" text-anchor="middle" class="r-sm r-b" fill="#0F0C29">hard calls</text>
    <circle cx="280" cy="190" r="30" fill="#FFFFFF" stroke="#0F0C29" stroke-opacity=".18" stroke-width="2"/>
    <path d="M280 176v28M266 190h28" stroke="#0F0C29" stroke-width="4" stroke-linecap="round"/>
    <rect x="150" y="370" width="260" height="46" rx="23" fill="#FFFFFF" stroke="url(#hv-warm)" stroke-width="2"/>
    <text x="280" y="400" text-anchor="middle" class="r-sm r-b" fill="#0F0C29">= Effective outbound</text>
  </svg>`;

  const problemRows = [
    ["boxes", "Too many tools", "A new AI tool launches every week. Which ones actually matter?"],
    ["file-stack", "Too much information", "Data everywhere, but little of it verified, current or relevant."],
    ["unplug", "Fragmented workflows", "Research, data, CRM and outreach that don't talk to each other."],
    ["infinity", "Endless automation possibilities", "You can automate almost anything. The question is what you should."],
  ];

  const aiItems = [["search", "Research at scale"], ["database", "Collect & enrich data"], ["chart-line", "Analyse patterns"], ["workflow", "Automate workflows"]];
  const humanItems = [["lightbulb", "Interpret context"], ["filter", "Choose what matters"], ["message-square", "Shape the conversation"], ["badge-check", "Decide & approve"]];

  const personas = [
    ["rocket", "Founders", "hunting their next customers", "You sell, hire and build at once. You need a repeatable way to find the right accounts and start the right conversations."],
    ["user-plus", "First sales hires", "with no playbook", "No process, no clean data, no stack set up yet. You'll design all three and know why each piece is there."],
    ["cpu", "GTM engineers", "whose campaigns get activity but no meetings", "Lots of sends, few conversations. Go back to targeting, signals and messaging, where the problem usually starts."],
  ];

  const stageBtns = c.stages
    .map(
      (s, i) => `
      <button class="stage-btn ph-${s.phase}" type="button" id="stage-btn-${i}" aria-expanded="${i === 0}" aria-controls="stage-panel-${i}">
        <span class="stage-num">${s.n}</span>
        <span class="stage-ic">${icon(s.icon)}</span>
        <span class="stage-title">${esc(s.title)}</span>
        ${icon("chevron-down", "stage-chev")}
      </button>
      <div class="stage-panel ph-${s.phase}" id="stage-panel-${i}" role="region" aria-labelledby="stage-btn-${i}"${i === 0 ? "" : " hidden"}>
        <div class="stage-panel-inner">
          <div class="sp-head">
            <span class="sp-phase">Phase ${s.phase} · ${esc(c.phases[s.phase])}</span>
            <h3>${s.n} · ${esc(s.title)}</h3>
            <p class="sp-obj"><strong>Objective:</strong> ${esc(s.objective)}</p>
          </div>
          <div class="sp-grid">
            <div><h4>Key activities</h4><ul class="ticks">${s.activities.map((a) => `<li>${icon("check")}${esc(a)}</li>`).join("")}</ul></div>
            <div><h4>Output</h4><p>${esc(s.output)}</p><h4>Tools</h4><p class="sp-tools">${esc(s.tools)}</p></div>
          </div>
        </div>
      </div>`
    )
    .join("");

  const phaseLegend = Object.entries(c.phases)
    .map(([k, v]) => `<li class="ph-${k}"><span class="dot"></span><strong>Phase ${k}</strong> ${esc(v)}</li>`)
    .join("");

  const dayTabs = c.days
    .map((d, i) => `<button role="tab" type="button" id="day-tab-${i}" aria-selected="${i === 0}" aria-controls="day-panel-${i}" tabindex="${i === 0 ? 0 : -1}"><span>Day ${d.day}</span><small>${esc(d.focus)}</small></button>`)
    .join("");
  const dayPanels = c.days
    .map(
      (d, i) => `
      <div role="tabpanel" class="day-panel" id="day-panel-${i}" aria-labelledby="day-tab-${i}" tabindex="0"${i === 0 ? "" : " hidden"}>
        <div class="day-main">
          <p class="kicker">Day ${d.day}</p>
          <h3>${esc(d.focus)}</h3>
          <ul class="ticks">${d.bullets.map((b) => `<li>${icon("check")}${esc(b)}</li>`).join("")}</ul>
        </div>
        <div class="day-out">
          <p class="kicker">You leave the day with</p>
          <p class="day-out-val">${icon("award")}${esc(d.output)}</p>
        </div>
      </div>`
    )
    .join("");

  const weeks = c.weeks.map((w, i) => `<li><span class="wk">W${i + 1}</span><span class="wl">${esc(w)}</span></li>`).join("");

  const toolTier = (label, tools) =>
    `<div class="tool-tier"><h3>${label}</h3><ul class="tool-badges">${tools.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>`;

  const lead = c.faculty.lead;
  const avatar = (f, big) =>
    f.photo
      ? `<img src="${esc(f.photo)}" alt="${esc(f.name)}" width="${big ? 160 : 88}" height="${big ? 160 : 88}" loading="lazy" decoding="async" class="avatar${big ? " avatar-lg" : ""}">`
      : `<span class="avatar avatar-ph${big ? " avatar-lg" : ""}" aria-hidden="true">${initials(f.name)}</span>`;
  const liLink = (url, name) =>
    url ? `<a class="li-link" href="${esc(url)}" target="_blank" rel="noopener">${icon("linkedin")}<span>${esc(name)} on LinkedIn</span></a>` : "";

  const supporting = c.flags.showSupportingFaculty
    ? `<div class="faculty-support">${c.faculty.supporting
        .map((f) => `<article class="card faculty-sm">${avatar(f)}<div><h3>${esc(f.name)}</h3><p class="role">${esc(f.role)}</p><p>${esc(f.bio)}</p>${liLink(f.linkedin, f.name)}</div></article>`)
        .join("")}</div>`
    : "";

  const stats = c.stats
    .map(
      (s) => `<li><span class="stat-val" data-count="${s.value}" data-decimals="${s.decimals || 0}">${esc(s.prefix || "")}<span class="num">${s.decimals ? s.value.toFixed(s.decimals) : s.value}</span>${esc(s.suffix || "")}</span><span class="stat-lbl">${esc(s.label)}</span></li>`
    )
    .join("");

  const clients = c.flags.showClientLogos
    ? `<div class="clients"><p class="kicker">We've run outbound for</p><ul>${c.clients
        .map((cl) => `<li>${cl.logo ? `<img src="${esc(cl.logo)}" alt="${esc(cl.name)}" height="32" loading="lazy">` : esc(cl.name)}</li>`)
        .join("")}</ul></div>`
    : "";

  const logistics = [
    ["calendar", "Dates", `${p.dates} (5 consecutive weekdays)`],
    ["map-pin", "Venue", `${p.venue}, ${p.venueArea}, ${p.venueNote}`],
    ["clock", "Hours", p.hours],
    ["laptop", "Bring", "A laptop + charger"],
    ["utensils", "Lunch", "Not included (affordable paid canteen on site)"],
    ["plane", "Travel", "Travel & accommodation not included"],
    ["receipt", "Billing", "GST invoice provided; pay via Razorpay link or bank transfer against PO"],
  ];

  const faqHtml = c.faq
    .map((f) => `<details class="faq-item"><summary><span>${esc(f.q)}</span>${icon("plus", "faq-ic")}</summary><div class="faq-a"><p>${esc(sub(f.a))}</p></div></details>`)
    .join("");

  const seatsLine =
    p.seatsLeft != null && p.seatsLeft !== ""
      ? `<p class="seats-left"><span class="pulse" aria-hidden="true"></span><strong>${esc(p.seatsLeft)} of ${p.totalSeats}</strong> seats left</p>`
      : "";

  const waBtn = (label = "WhatsApp us") =>
    wa ? `<a class="btn btn-ghost btn-sm" href="${esc(wa)}" target="_blank" rel="noopener">${icon("message-circle")} ${label}</a>` : "";

  // ---------- page ----------
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(c.site.title)}</title>
<meta name="description" content="${esc(metaDesc)}">
<link rel="canonical" href="${esc(ogUrl)}/">
<meta name="theme-color" content="#FFFFFF">
<meta name="color-scheme" content="light">
<meta property="og:type" content="website">
<meta property="og:site_name" content="LeadStrategus">
<meta property="og:title" content="${esc(`${p.name}: ${p.tagline} | ${p.city}`)}">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:url" content="${esc(ogUrl)}/">
<meta property="og:image" content="${esc(ogImg)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="AI won't fill your calendar. But AI plus judgement will. GTM Engineering Bootcamp by LeadStrategus.">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(`${p.name}: ${p.tagline}`)}">
<meta name="twitter:description" content="${esc(metaDesc)}">
<meta name="twitter:image" content="${esc(ogImg)}">
<link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="preload" href="/fonts/jakarta.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css?v=__BUILD__">
<script>document.documentElement.classList.add('js')</script>
<script type="application/ld+json">${jsonLd}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="site-header" id="site-header">
  <div class="wrap nav-row">
    <a class="brand" href="#top" aria-label="LeadStrategus: back to top">${logoSvg()}<span class="brand-name">LEADSTRATEGUS</span></a>
    <nav class="nav" id="site-nav" aria-label="Primary">
      <ul>${nav.map(([id, l]) => `<li><a href="#${id}">${l}</a></li>`).join("")}</ul>
    </nav>
    ${ctaBtn("Apply Now", "btn-sm nav-cta")}
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">${icon("menu", "ic-open")}${icon("x", "ic-close")}</button>
  </div>
</header>

<main id="main">

<!-- 1. HERO -->
<section class="hero" id="top">
  <div class="glow glow-1" aria-hidden="true"></div><div class="glow glow-2" aria-hidden="true"></div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">${esc(c.hero.eyebrow)}</p>
      <h1>${esc(c.hero.h1Before)}<span class="grad">${esc(c.hero.h1Gradient)}</span>${esc(c.hero.h1After)}</h1>
      <p class="lead">${esc(c.hero.sub)}</p>
      <p class="product-line"><strong>${esc(p.name)}</strong> <span class="sep" aria-hidden="true">·</span> ${esc(p.tagline)}</p>
      <ul class="chips">${facts.map(([ic, t]) => `<li>${icon(ic)}<span>${esc(t)}</span></li>`).join("")}</ul>
      <div class="cta-row">${ctaBtn()}<a class="btn btn-ghost" href="#curriculum">See the curriculum</a></div>
    </div>
    <div class="hero-visual">${heroVisual}</div>
  </div>
</section>

<!-- 2. PROBLEM -->
<section class="section" id="problem">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">The problem</p>
      <h2>Everyone uses AI. But tools alone don't create <span class="grad">effective outbound.</span></h2>
    </div>
    <ul class="problem-list reveal">
      ${problemRows.map(([ic, t, d]) => `<li class="card">${icon(ic, "ic-lg")}<div><h3>${t}</h3><p>${d}</p></div></li>`).join("")}
    </ul>
    <p class="closer reveal">The challenge is knowing <strong>what to do</strong>, <strong>how to connect it</strong>, <strong>what to trust</strong> and <strong>when to act</strong>.</p>
  </div>
</section>

<!-- 3. APPROACH -->
<section class="section" id="approach">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Our approach</p>
      <h2>The right <span class="grad">division of work.</span></h2>
    </div>
    <div class="split reveal">
      <article class="card split-card ai">
        <p class="split-tag">${icon("cpu")} AI</p>
        <h3>The heavy lifting</h3>
        <ul>${aiItems.map(([ic, t]) => `<li>${icon(ic)}${t}</li>`).join("")}</ul>
      </article>
      <div class="split-plus" aria-hidden="true">${icon("plus")}</div>
      <article class="card split-card human">
        <p class="split-tag">${icon("brain")} Humans</p>
        <h3>The hard calls</h3>
        <ul>${humanItems.map(([ic, t]) => `<li>${icon(ic)}${t}</li>`).join("")}</ul>
      </article>
    </div>
    <p class="tagline reveal">AI brings scale. Human judgement brings direction.<span>Old principles. New capabilities.</span></p>
    <div class="sec-cta">${ctaBtn()}</div>
  </div>
</section>

<!-- 4. OUTCOMES -->
<section class="section" id="outcomes">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Outcomes</p>
      <h2>You'll <span class="grad">walk out with</span></h2>
    </div>
    <ol class="outcomes reveal">
      ${c.outcomes.map((o, i) => `<li class="card"><span class="o-num">0${i + 1}</span>${icon(o.icon, "ic-lg")}<h3>${esc(o.title)}</h3></li>`).join("")}
    </ol>
    <p class="small-print reveal">${icon("info")} A working, supervised outbound workflow + runbook + QA checklist. A getting-started programme, not a guarantee of meetings or revenue.</p>
    <div class="sec-cta">${ctaBtn()}</div>
  </div>
</section>

<!-- 5. WHO -->
<section class="section" id="who">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Who it's for</p>
      <h2>Made for people who have to <span class="grad">make outbound work</span></h2>
    </div>
    <div class="personas reveal">
      ${personas.map(([ic, t, s, d]) => `<article class="card persona">${icon(ic, "ic-lg")}<h3>${t} <span>${s}</span></h3><p>${d}</p></article>`).join("")}
    </div>
    <ul class="role-chips reveal" aria-label="Also a fit for">
      <li>SDR / BDR</li><li>Growth marketers</li><li>Demand gen professionals</li><li>GTM practitioners</li>
    </ul>
    <div class="fit reveal">
      <div class="fit-col yes">
        <h3>${icon("check")} Good fit</h3>
        <ul><li>You know basic B2B prospecting</li><li>You're comfortable with spreadsheets and browser tools</li><li>You'll bring a laptop and are willing to troubleshoot</li><li>No coding needed</li></ul>
      </div>
      <div class="fit-col no">
        <h3>${icon("x")} Not a fit</h3>
        <ul><li>You expect a placement course</li><li>You want guaranteed meetings</li><li>You want someone to build your production system for you</li></ul>
      </div>
    </div>
    <div class="sec-cta">${ctaBtn()}</div>
  </div>
</section>

<!-- 6. SYSTEM -->
<section class="section" id="system">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">The system</p>
      <h2>8 stages. One connected <span class="grad">outbound system.</span></h2>
      <p class="sec-sub">From client understanding to intelligent conversations and meetings. Select a stage to see what happens in it.</p>
    </div>
    <ul class="phase-legend reveal">${phaseLegend}</ul>
    <div class="stepper reveal" id="stepper">${stageBtns}</div>

    <div class="bands reveal">
      <div class="band band-orch">
        <div class="band-h">${icon("share-2")}<div><h3>System orchestration</h3><p>Runs across all stages</p></div></div>
        <ul><li>n8n</li><li>Clay</li><li>Data movement</li><li>Triggers</li><li>Approvals</li><li>Alerts</li><li>Error handling</li></ul>
      </div>
      <div class="band band-human">
        <div class="band-h">${icon("shield-check")}<div><h3>Human judgement &amp; governance</h3><p>Throughout</p></div></div>
        <ul><li>Validate sources &amp; evidence</li><li>Interpret signals</li><li>Approve targeting &amp; messaging</li><li>Opt-outs &amp; compliance</li><li>Data quality</li></ul>
      </div>
      <div class="band band-loop">
        <div class="band-h">${icon("refresh-cw")}<div><h3>The learning loop</h3><p>Every cycle</p></div></div>
        <ol class="loop"><li>Weekly reviews</li><li>What works / what doesn't</li><li>Refine ICP, scoring &amp; messaging</li><li>Run next cycle</li></ol>
      </div>
    </div>

    <aside class="callout reveal" aria-label="Signal is not intent">
      ${icon("triangle-alert", "ic-lg")}
      <div><h3>Signal ≠ intent</h3><p>A company hiring or opening an office is a reason to investigate, not proof they want to buy. We teach you to tell <strong>fact</strong>, <strong>signal</strong>, <strong>inference</strong> and <strong>hypothesis</strong> apart.</p></div>
    </aside>
    <div class="sec-cta">${ctaBtn()}</div>
  </div>
</section>

<!-- 7. CURRICULUM -->
<section class="section" id="curriculum">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Curriculum</p>
      <h2>5 intensive days. <span class="grad">${N} weeks</span> of guided execution.</h2>
    </div>
    <div class="big-stats reveal">
      <div class="big-stat warm"><span class="bs-n">5</span><div><strong>Days</strong><span>Intensive classroom</span><small>Principles · Design · Build</small></div></div>
      <span class="bs-arrow" aria-hidden="true">»</span>
      <div class="big-stat cool"><span class="bs-n">${N}</span><div><strong>Weeks</strong><span>Guided execution</span><small>Implement · Iterate · Optimise</small></div></div>
    </div>

    <div class="days reveal">
      <div class="day-tabs" role="tablist" aria-label="Bootcamp days">${dayTabs}</div>
      ${dayPanels}
    </div>
    <p class="format-strip reveal">${icon("laptop")} ~45% guided lab <span>·</span> daily ${esc(p.hours)} <span>·</span> predominantly hands-on</p>

    <h3 class="weeks-h reveal">Then: ${N} weeks of guided execution</h3>
    <ol class="weeks reveal" tabindex="0" aria-label="Guided execution timeline">${weeks}</ol>
    <ul class="included reveal">
      <li>${icon("check")}Weekly live online sessions (60–90 min)</li>
      <li>${icon("check")}Private cohort community</li>
      <li>${icon("check")}Recordings</li>
      <li>${icon("check")}Templates &amp; workflow library</li>
      <li>${icon("check")}Day-60 review for company-sponsored participants</li>
    </ul>
    <div class="sec-cta">${ctaBtn()}</div>
  </div>
</section>

<!-- 8. TOOLS -->
<section class="section" id="tools">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Tool stack</p>
      <h2>The stack <span class="grad">you'll build on.</span></h2>
      <p class="sec-sub">Tools are the means, not the curriculum.</p>
    </div>
    <div class="tool-tiers reveal">
      ${toolTier("Core hands-on", ["Clay", "n8n", "HubSpot", "Apollo", "LinkedIn Sales Navigator"])}
      ${toolTier("Engagement", ["Instantly"])}
      ${toolTier("AI layer", ["Claude (agents / Claude Code)", "ChatGPT"])}
    </div>
    <ul class="tool-notes reveal">
      <li>${icon("check")}No separate Clay/n8n subscription needed. We provide controlled classroom workspaces for the programme period.</li>
      <li>${icon("check")}No coding background required.</li>
    </ul>
    <p class="footnote">Tool names and logos are used for illustration only. We do not own these trademarks.</p>
  </div>
</section>

<!-- 9. CAPSTONE -->
<section class="section" id="capstone">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Capstone</p>
      <h2>You don't just learn it. You <span class="grad">build it, test it and defend it.</span></h2>
      <p class="sec-sub">Build an end-to-end workflow on real public companies, then demonstrate it, including at least two failure paths.</p>
    </div>
    <ol class="flow reveal" aria-label="Capstone workflow">
      <li>Signal</li><li>Research</li><li>Enrichment</li><li>Scoring</li><li>Human-reviewed message</li><li>CRM</li><li>n8n automation</li>
    </ol>
    <p class="fail-paths reveal"><strong>Failure paths you'll handle:</strong> <span>duplicate</span><span>stale signal</span><span>invalid email</span><span>opt-out</span><span>failed integration</span></p>
    <div class="cap-cards reveal">
      <article class="card">${icon("building-2", "ic-lg")}<h3>Real public companies</h3><p>Work on real, publicly available company information, not toy data.</p></article>
      <article class="card">${icon("shield", "ic-lg")}<h3>Safe test environment</h3><p>Fictional contacts, test inboxes, no mass blasting.</p></article>
      <article class="card">${icon("award", "ic-lg")}<h3>Practitioner certificate</h3><p>Awarded on passing the capstone (70/100 plus mandatory gates).</p></article>
    </div>
    <div class="sec-cta">${ctaBtn()}</div>
  </div>
</section>

<!-- 10. FACULTY -->
<section class="section" id="faculty">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Faculty &amp; why LeadStrategus</p>
      <h2>Taught by <span class="grad">operators</span>, not trainers.</h2>
    </div>
    <article class="card faculty-lead reveal">
      ${avatar(lead, true)}
      <div>
        <p class="kicker">Lead faculty</p>
        <h3>${esc(lead.name)}</h3>
        <p class="role">${esc(lead.role)}</p>
        <p>${esc(lead.bio)}</p>
        ${liLink(lead.linkedin, lead.name)}
      </div>
    </article>
    ${supporting}
    <ul class="stats reveal" id="stats">${stats}</ul>
    ${clients}
    <div class="banner reveal">
      <p class="banner-h">We don't just teach outbound. <span class="grad">We do it.</span></p>
      <p>We are an operating firm that trains.</p>
    </div>
    <div class="sec-cta">${ctaBtn()}</div>
  </div>
</section>

<!-- 11. PRICING -->
<section class="section" id="pricing">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Pricing &amp; logistics</p>
      <h2>One cohort. <span class="grad">${p.totalSeats} seats.</span></h2>
    </div>
    <div class="prices reveal">
      <article class="card price">
        <h3>Individual</h3>
        <p class="price-for">Individual or single sponsored seat</p>
        <p class="price-val">${esc(c.pricing.individual.base)} <span>+ GST</span></p>
        <p class="price-gst">${esc(c.pricing.individual.withGst)} incl. 18% GST</p>
        <ul class="ticks"><li>${icon("check")}5 classroom days + ${N} weeks guided execution</li><li>${icon("check")}Classroom tool workspaces provided</li><li>${icon("check")}Selective admission</li></ul>
        ${ctaBtn("Apply as an individual", "btn-block", "individual")}
      </article>
      <article class="card price featured">
        <span class="badge">Recommended for teams</span>
        <h3>Company cohort</h3>
        <p class="price-for">${c.pricing.cohort.minSeats}+ seats from the same employer</p>
        <p class="price-val">${esc(c.pricing.cohort.base)} <span>+ GST per seat</span></p>
        <p class="price-gst">${esc(c.pricing.cohort.withGst)} per seat incl. 18% GST</p>
        <ul class="ticks"><li>${icon("check")}Everything in Individual</li><li>${icon("check")}Day-60 review for sponsored participants</li><li>${icon("check")}Minimum ${c.pricing.cohort.minSeats} seats from one employer (2 seats don't qualify)</li></ul>
        ${ctaBtn("Apply as a company cohort", "btn-block", "cohort")}
      </article>
    </div>
    <ul class="logistics reveal">
      ${logistics.map(([ic, k, v]) => `<li>${icon(ic)}<div><strong>${k}</strong><span>${esc(v)}</span></div></li>`).join("")}
    </ul>
  </div>
</section>

<!-- 12. FAQ -->
<section class="section" id="faq">
  <div class="wrap wrap-narrow">
    <div class="sec-head reveal">
      <p class="eyebrow">FAQ</p>
      <h2>Questions, <span class="grad">answered straight.</span></h2>
    </div>
    <div class="faq reveal">${faqHtml}</div>
    <div class="sec-cta">${ctaBtn()}</div>
  </div>
</section>

<!-- 13. APPLY -->
<section class="section apply" id="apply">
  <div class="wrap wrap-narrow">
    <div class="sec-head">
      <p class="eyebrow">Apply</p>
      <h2>Apply for one of <span class="grad">${p.totalSeats} seats.</span></h2>
      <p class="sec-sub">Admission is selective. We'll review your application and get back within ${p.responseDays} working days.</p>
      ${seatsLine}
    </div>

    <div class="card form-card" id="form-card">
      <form id="apply-form" name="bootcamp-apply" method="POST" data-netlify="true" netlify-honeypot="company_website" novalidate>
        <input type="hidden" name="form-name" value="bootcamp-apply">
        <input type="hidden" name="utm_source"><input type="hidden" name="utm_medium"><input type="hidden" name="utm_campaign">
        <input type="hidden" name="page_url">
        <div class="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="company_website" tabindex="-1" autocomplete="off"></label></div>

        <div class="fgrid">
          <div class="field"><label for="f-name">Full name <span class="req" aria-hidden="true">*</span></label><input id="f-name" name="full_name" type="text" autocomplete="name" required maxlength="120" aria-describedby="e-name"><p class="err" id="e-name"></p></div>
          <div class="field"><label for="f-email">Work email <span class="req" aria-hidden="true">*</span></label><input id="f-email" name="work_email" type="email" autocomplete="email" inputmode="email" required maxlength="160" aria-describedby="e-email"><p class="err" id="e-email"></p></div>
          <div class="field"><label for="f-phone">Phone / WhatsApp <span class="req" aria-hidden="true">*</span></label><input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" value="+91 " required maxlength="20" aria-describedby="e-phone"><p class="err" id="e-phone"></p></div>
          <div class="field"><label for="f-company">Company <span class="req" aria-hidden="true">*</span></label><input id="f-company" name="company" type="text" autocomplete="organization" required maxlength="160" aria-describedby="e-company"><p class="err" id="e-company"></p></div>
          <div class="field"><label for="f-role">Role / title <span class="req" aria-hidden="true">*</span></label><input id="f-role" name="role" type="text" autocomplete="organization-title" required maxlength="120" aria-describedby="e-role"><p class="err" id="e-role"></p></div>
          <div class="field"><label for="f-li">LinkedIn profile URL <span class="req" aria-hidden="true">*</span></label><input id="f-li" name="linkedin_url" type="url" inputmode="url" required maxlength="300" placeholder="https://www.linkedin.com/in/…" aria-describedby="e-li"><p class="err" id="e-li"></p></div>
        </div>

        <fieldset class="field radios" aria-describedby="e-type">
          <legend>I'm applying as <span class="req" aria-hidden="true">*</span></legend>
          <label class="radio"><input type="radio" name="applicant_type" value="individual" required><span>Individual</span></label>
          <label class="radio"><input type="radio" name="applicant_type" value="company_sponsored"><span>Company-sponsored (1–2 seats)</span></label>
          <label class="radio"><input type="radio" name="applicant_type" value="cohort"><span>Company cohort (${c.pricing.cohort.minSeats}+ seats)</span></label>
          <p class="err" id="e-type"></p>
        </fieldset>

        <div class="field" id="seats-field" hidden><label for="f-seats">Number of seats <span class="req" aria-hidden="true">*</span></label><input id="f-seats" name="seats" type="number" min="${c.pricing.cohort.minSeats}" max="${p.totalSeats}" step="1" inputmode="numeric" value="${c.pricing.cohort.minSeats}" aria-describedby="e-seats"><p class="err" id="e-seats"></p></div>

        <div class="fgrid">
          <div class="field"><label for="f-exp">Current outbound experience <span class="req" aria-hidden="true">*</span></label>
            <select id="f-exp" name="experience" required aria-describedby="e-exp"><option value="">Select…</option><option>None</option><option>&lt;1 yr</option><option>1–3 yrs</option><option>3+ yrs</option></select><p class="err" id="e-exp"></p></div>
          <div class="field"><label for="f-src">How did you hear about us?</label>
            <select id="f-src" name="heard_from"><option value="">Select…</option><option>LinkedIn</option><option>WhatsApp</option><option>Referral</option><option>Other</option></select></div>
        </div>

        <div class="field"><label for="f-goal">What do you want to get out of the bootcamp? <span class="req" aria-hidden="true">*</span></label>
          <textarea id="f-goal" name="goals" rows="4" maxlength="500" required aria-describedby="goal-count e-goal"></textarea>
          <p class="counter" id="goal-count" aria-live="polite">0 / 500</p><p class="err" id="e-goal"></p></div>

        <div class="field checks">
          <label class="check"><input type="checkbox" name="consent" value="yes" required aria-describedby="e-consent"><span>I agree to be contacted about this programme and accept the <button type="button" class="linkish" data-modal="privacy">Privacy Notice</button>. <span class="req" aria-hidden="true">*</span></span></label>
          <p class="err" id="e-consent"></p>
          <label class="check"><input type="checkbox" name="scope_ack" value="yes" required aria-describedby="e-scope"><span>I understand this programme builds practical capability and does not guarantee leads, meetings, revenue, jobs or placement. <span class="req" aria-hidden="true">*</span></span></label>
          <p class="err" id="e-scope"></p>
          <label class="check"><input type="checkbox" name="marketing_optin" value="yes"><span>Optional: send me updates about future LeadStrategus programmes.</span></label>
        </div>

        <div class="form-status" id="form-status" role="alert" hidden></div>
        <button class="btn btn-primary btn-block btn-lg" type="submit" id="submit-btn"><span class="lbl">Submit application</span> ${icon("send")}</button>
        <p class="req-note"><span class="req">*</span> Required</p>
      </form>

      <div class="thanks" id="thanks" hidden tabindex="-1">
        ${icon("badge-check", "ic-xl")}
        <h3>Application received.</h3>
        <p>We'll be in touch within ${p.responseDays} working days.${wa ? " Want to talk sooner?" : ""}</p>
        ${waBtn()}
      </div>
    </div>

    <p class="contact-line">Questions first? ${waBtn()} <a class="btn btn-ghost btn-sm" href="mailto:${esc(c.contact.email)}">${icon("mail")} ${esc(c.contact.email)}</a></p>
  </div>
</section>

</main>

<!-- 14. FOOTER -->
<footer class="site-footer">
  <div class="wrap foot-grid">
    <div>
      <a class="brand" href="#top" aria-label="LeadStrategus: back to top">${logoSvg("f")}<span class="brand-name">LEADSTRATEGUS</span></a>
      <p class="foot-tag">Superpower your sales!</p>
    </div>
    <ul class="foot-links">
      <li><a href="https://leadstrategus.com" rel="noopener" target="_blank">leadstrategus.com</a></li>
      <li><a href="https://leadstrategus.ai" rel="noopener" target="_blank">leadstrategus.ai</a></li>
      <li><a href="https://expotofunnel.com" rel="noopener" target="_blank">expotofunnel.com</a></li>
    </ul>
    <ul class="foot-links">
      <li><a href="mailto:${esc(c.contact.email)}">${icon("mail")} ${esc(c.contact.email)}</a></li>
      ${c.contact.phone ? `<li><a href="tel:${esc(c.contact.phone.replace(/\s/g, ""))}">${icon("phone")} ${esc(c.contact.phone)}</a></li>` : ""}
      ${c.contact.linkedin ? `<li><a href="${esc(c.contact.linkedin)}" rel="noopener" target="_blank">${icon("linkedin")} LinkedIn</a></li>` : ""}
    </ul>
    <ul class="foot-links">
      <li><button type="button" class="linkish" data-modal="privacy">Privacy Notice</button></li>
      <li><button type="button" class="linkish" data-modal="terms">Terms &amp; Refund</button></li>
    </ul>
  </div>
  <div class="wrap foot-base">
    <p>© 2026 LeadStrategus. All rights reserved.</p>
    <p>Tool names and logos are used for illustration only. We do not own these trademarks.</p>
  </div>
</footer>

<div class="mobile-bar" id="mobile-bar">${ctaBtn(`Apply Now <span class="mb-sub">· Only ${p.totalSeats} seats</span>`, "btn-block")}</div>

<dialog class="modal" id="modal-privacy" aria-labelledby="mp-h">
  <div class="modal-head"><h2 id="mp-h">Privacy Notice</h2><button type="button" class="modal-x" data-close aria-label="Close">${icon("x")}</button></div>
  <div class="modal-body">${c.legal.privacyHtml}</div>
</dialog>
<dialog class="modal" id="modal-terms" aria-labelledby="mt-h">
  <div class="modal-head"><h2 id="mt-h">Terms &amp; Refund</h2><button type="button" class="modal-x" data-close aria-label="Close">${icon("x")}</button></div>
  <div class="modal-body">${c.legal.termsHtml}</div>
</dialog>

<script type="application/json" id="site-config">${runtime}</script>
<script src="/main.js?v=__BUILD__" defer></script>
</body>
</html>
`;
}
