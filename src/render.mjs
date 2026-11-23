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

/** Logo image: WebP with PNG fallback, @1x/@2x. */
const logo = (name, w, h, alt, cls = "", eager = false) => `<picture class="${cls}">
      <source type="image/webp" srcset="/brand/${name}@1x.webp 1x, /brand/${name}@2x.webp 2x">
      <img src="/brand/${name}@1x.png" srcset="/brand/${name}@1x.png 1x, /brand/${name}@2x.png 2x" width="${w}" height="${h}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">
    </picture>`;

const initials = (name) => name.replace(/[^\p{L}\s]/gu, "").split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const digits = (s) => String(s || "").replace(/[^\d]/g, "");

export function renderPage(c) {
  const S = c.settings;
  const seats = S.totalSeats;
  const fill = (s) => String(s).replaceAll("{teamDiscountPct}", S.teamDiscountPct);
  const wa = S.whatsapp ? `https://wa.me/${encodeURIComponent(S.whatsapp)}?text=${encodeURIComponent(S.whatsappMessage)}` : "";
  const fitCall = S.fitCallUrl || `mailto:${S.contactEmail}?subject=${encodeURIComponent("15-min fit call: GTM Engineering Workshop")}`;
  const ext = (url) => (/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : "");
  const applyBtn = (label = "Apply for Cohort 1", extra = "", type = "") =>
    `<a class="btn btn-primary ${extra}" href="#apply"${type ? ` data-apply-type="${type}"` : ""}>${label} ${icon("arrow-right")}</a>`;
  const fitBtn = (label = "Book a 15-min fit call", extra = "") =>
    `<a class="btn btn-ghost ${extra}" href="${esc(fitCall)}"${ext(fitCall)}>${icon("asterisk")} ${label}</a>`;

  const ogUrl = c.site.url.replace(/\/$/, "");
  const ogImg = ogUrl + c.site.ogImage;
  const metaDesc = c.site.description;

  // ---------- JSON-LD ----------
  const org = {
    "@type": "Organization",
    "@id": ogUrl + "#org",
    name: "LeadStrategus",
    url: "https://leadstrategus.com",
    logo: ogUrl + "/brand/leadstrategus-logo-stacked.png",
    image: ogUrl + "/brand/leadstrategus-shield.png",
    slogan: "Superpower your sales!",
    sameAs: ["https://leadstrategus.com", "https://leadstrategus.ai", "https://expotofunnel.com", S.linkedin].filter(Boolean),
  };
  const offers = [
    digits(S.priceIndividual) && { "@type": "Offer", name: "Individual", price: digits(S.priceIndividual), priceCurrency: "INR", url: ogUrl + "/#pricing", category: "Paid", description: "Price before GST" },
    digits(S.priceTeam) && { "@type": "Offer", name: "Team of 2–3, per person", price: digits(S.priceTeam), priceCurrency: "INR", url: ogUrl + "/#pricing", category: "Paid", description: "Price per person before GST" },
  ].filter(Boolean);
  const place = {
    "@type": "Place",
    name: `LeadStrategus GTM Engineering Workshop, ${S.city}`,
    address: { "@type": "PostalAddress", addressLocality: S.city, addressRegion: "Karnataka", addressCountry: "IN" },
  };
  const dates = S.startDate ? { startDate: S.startDate, endDate: S.endDate || S.startDate } : {};
  const course = {
    "@type": "Course",
    name: c.site.name,
    description: metaDesc,
    provider: { "@id": ogUrl + "#org" },
    offers,
    hasCourseInstance: [
      { "@type": "CourseInstance", name: "5-day in-person workshop", courseMode: "Onsite", courseWorkload: "P5D", location: place, ...dates },
      { "@type": "CourseInstance", name: "4 weeks of guided implementation (2 × 1 hr live sessions a week)", courseMode: "Online", courseWorkload: "P4W" },
    ],
  };
  const graph = [org, course];
  if (S.startDate) {
    graph.push({
      "@type": "EducationEvent",
      name: `${c.site.name}: Bengaluru Cohort 1`,
      ...dates,
      eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: place,
      organizer: { "@id": ogUrl + "#org" },
      offers: offers.map((o) => ({ ...o, availability: "https://schema.org/InStock" })),
      image: ogImg,
      description: metaDesc,
    });
  }
  graph.push({ "@type": "FAQPage", mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  const jsonLd = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");

  const runtime = JSON.stringify({
    form: c.form,
    analytics: c.analytics,
    email: S.contactEmail,
    whatsapp: wa,
    checklistEndpoint: S.checklistEndpoint,
    checklistPdfUrl: S.checklistPdfUrl,
  }).replace(/</g, "\\u003c");

  // ---------- sections (each returns "" when hidden) ----------
  const seatsText = S.seatsLeft != null && S.seatsLeft !== "" ? ` · ${S.seatsLeft} OF ${seats} SEATS LEFT` : ` · ${seats} SEATS`;

  const hero = `
<section class="hero" id="top">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">${esc(c.hero.eyebrow)}</p>
      <h1>${esc(c.hero.h1Before)}<span class="grad">${esc(c.hero.h1Gradient)}</span></h1>
      <p class="lead">${esc(c.hero.sub)}</p>
      <div class="cta-row">${applyBtn()}${fitBtn()}</div>
    </div>
    <aside class="card buildlog" aria-label="Your engine build log (illustrative)">
      <div class="bl-head"><span>YOUR ENGINE · BUILD LOG</span><span class="tag">ILLUSTRATIVE</span></div>
      <ol>${c.hero.buildLog
        .map(
          (r, i) => `<li style="--i:${i}"><span class="bl-when">${esc(r.when)}</span><span class="bl-text">${esc(r.text)}</span>${
            r.gate ? `<span class="pill pill-human">${esc(r.gate.toUpperCase())} ✓</span>` : ""
          }</li>`
        )
        .join("")}</ol>
    </aside>
  </div>
  <div class="wrap">
    <ol class="steps-strip">${c.hero.steps.map((s, i) => `<li><span class="ss-n">0${i + 1}</span><span class="ss-t">${esc(s)}</span></li>`).join("")}</ol>
  </div>
</section>`;

  const trusted = S.showClientLogos
    ? { id: "trusted", cls: "trusted", html: `<p class="kicker">Trusted by B2B teams at</p><ul class="client-logos">${c.clients
        .map((cl) => `<li>${cl.logo ? `<img src="${esc(cl.logo)}" alt="${esc(cl.name)}" height="32" loading="lazy">` : esc(cl.name)}</li>`)
        .join("")}</ul>` }
    : null;

  const why = {
    id: "why",
    html: `
    <div class="sec-head"><p class="eyebrow">Why it's different</p><h2>${esc(c.why.h2)}</h2><p class="sec-sub">${esc(c.why.intro)}</p></div>
    <div class="cols-3">${c.why.cols.map((k) => `<article class="card why-card">${icon(k.icon, "ic-lg")}<h3>${esc(k.title)}</h3><p>${esc(k.text)}</p></article>`).join("")}</div>`,
  };

  const pill = (ctl) => (ctl === "human" ? `<span class="pill pill-human">HUMAN GATE</span>` : `<span class="pill pill-ai">AI-ASSISTED</span>`);
  const programme = {
    id: "programme",
    html: `
    <div class="sec-head"><p class="eyebrow">${esc(c.programme.eyebrow)}</p><h2>${esc(c.programme.h2)}</h2><p class="sec-sub">${esc(c.programme.intro)}</p></div>
    <div class="ptable-wrap">
      <table class="ptable">
        <caption class="sr-only">The 8 stages: what you build, the tools, what you leave with, and who is in control</caption>
        <thead><tr><th scope="col">Stage</th><th scope="col">What you build · Tools</th><th scope="col">You leave with</th><th scope="col">Control</th></tr></thead>
        <tbody>${c.programme.stages
          .map(
            (s) => `<tr class="${s.control === "human" ? "is-gate" : ""}">
            <th scope="row"><span class="st-n">${s.n}</span><span class="st-name">${esc(s.stage)}</span></th>
            <td data-label="What you build · Tools">${esc(s.build)}</td>
            <td data-label="You leave with">${esc(s.leave)}</td>
            <td data-label="Control">${pill(s.control)}</td></tr>`
          )
          .join("")}</tbody>
      </table>
    </div>
    <p class="note">${icon("settings-2")} ${esc(c.programme.note)}</p>`,
  };

  const days = {
    id: "days",
    html: `
    <div class="sec-head"><p class="eyebrow">Format</p><h2>${esc(c.days.h2)}</h2></div>
    <div class="cols-2">${c.days.summary
      .map((d, i) => `<article class="card sum-card ${i ? "online" : "inperson"}"><p class="tag-line">${esc(d.tag)}</p><p class="sum-big"><span>${esc(d.big)}</span> ${esc(d.unit)}</p><p>${esc(d.text)}</p></article>`)
      .join("")}</div>
    <h3 class="subhead">${esc(c.days.subhead)}</h3>
    <ol class="day-cards">${c.days.list
      .map((d) => `<li class="card day-card"><p class="tag-line">${esc(d.label)}</p><h4>${esc(d.title)}</h4><p>${esc(d.text)}</p></li>`)
      .join("")}</ol>`,
  };

  const month = {
    id: "month",
    html: `
    <div class="sec-head"><p class="eyebrow">Implementation</p><h2>${esc(c.month.h2)}</h2><p class="sec-sub">${esc(c.month.sub)}</p></div>
    <ol class="timeline">${c.month.weeks.map((w, i) => `<li><span class="tl-dot" aria-hidden="true">${i + 1}</span><span class="tl-wk">WEEK ${i + 1}</span><span class="tl-t">${esc(w)}</span></li>`).join("")}</ol>`,
  };

  const stack = {
    id: "stack",
    html: `
    <div class="sec-head"><p class="eyebrow">Stack</p><h2>${esc(c.stack.h2)}</h2></div>
    <ul class="stack-cols">${c.stack.cols.map((s) => `<li class="card"><span class="tag-line">${esc(s.label)}</span><span class="stack-tool">${esc(s.tools)}</span></li>`).join("")}</ul>
    <p class="demo-only"><span class="tag-line">DEMO ONLY</span> ${esc(c.stack.demoOnly)}</p>
    <p class="footnote">Tool names and logos are used for illustration only. We do not own these trademarks.</p>`,
  };

  const who = {
    id: "who",
    html: `
    <div class="sec-head"><p class="eyebrow">Who it's for</p><h2>${esc(c.who.h2)}</h2></div>
    <div class="cols-4">${c.who.cards
      .map(
        (k) => `<article class="card who-card">${icon(k.icon, "ic-lg")}<h3>${esc(k.title)}</h3><p>${
          k.link ? `<a href="${k.link}">${esc(fill(k.text))}&nbsp;→</a>` : esc(fill(k.text))
        }</p></article>`
      )
      .join("")}</div>
    <p class="note note-strong">${esc(c.who.note)}</p>`,
  };

  const proof = {
    id: "proof",
    cls: S.showTestimonials ? "" : "proof-slim",
    html: `
    <div class="proof-head">
      <a class="clutch" href="${esc(S.clutchUrl)}" target="_blank" rel="noopener"><span class="stars" aria-hidden="true">★★★★★</span> ${esc(c.proof.badge)} ${icon("arrow-right", "ic-sm")}</a>
      ${S.showTestimonials ? `<h2>${esc(c.proof.h2)}</h2>` : ""}
    </div>
    ${
      S.showTestimonials
        ? `<div class="cols-3">${c.proof.testimonials
            .map((t) => `<figure class="card quote">${icon("quote", "ic-lg")}<blockquote><p>${esc(t.quote)}</p></blockquote><figcaption><strong>${esc(t.role)}</strong><span>${esc(t.company)}</span></figcaption></figure>`)
            .join("")}</div>`
        : ""
    }`,
  };

  const faculty = {
    id: "faculty",
    html: `
    <div class="sec-head"><p class="eyebrow">Faculty</p><h2>${esc(c.faculty.h2)}</h2><p class="sec-sub">${esc(c.faculty.sub)}</p></div>
    <div class="cols-3">${c.faculty.people
      .map(
        (f) => `<article class="card person">${
          f.photo
            ? `<img class="avatar" src="${esc(f.photo)}" alt="${esc(f.name)}" width="96" height="96" loading="lazy" decoding="async">`
            : `<span class="avatar avatar-ph" aria-hidden="true">${initials(f.name)}</span>`
        }<h3>${esc(f.name)}</h3><p>${esc(f.focus)}</p>${
          f.linkedin ? `<a class="li-link" href="${esc(f.linkedin)}" target="_blank" rel="noopener">${icon("linkedin")} LinkedIn</a>` : ""
        }</article>`
      )
      .join("")}</div>`,
  };

  const checklist = {
    id: "checklist",
    cls: "checklist-sec",
    html: `
    <div class="checklist card">
      ${icon("file-text", "ic-lg")}
      <div class="cl-copy"><p class="tag-line">${esc(c.checklist.tag)}</p><p class="cl-title">${esc(c.checklist.title)}</p></div>
      <div class="cl-action">
        <button type="button" class="btn btn-ghost" id="cl-open" aria-expanded="false" aria-controls="cl-form">${esc(c.checklist.cta)}</button>
        <form class="cl-form" id="cl-form" hidden novalidate>
          <label for="cl-email">Work email</label>
          <div class="cl-row"><input id="cl-email" name="email" type="email" autocomplete="email" inputmode="email" required aria-describedby="cl-err"><button class="btn btn-primary" type="submit">Send</button></div>
          <p class="err" id="cl-err" role="alert"></p>
        </form>
        <div class="cl-done" id="cl-done" hidden role="status"></div>
      </div>
    </div>`,
  };

  const P = c.pricing;
  const pricing = {
    id: "pricing",
    html: `
    <div class="sec-head"><p class="eyebrow">COHORT 1 · ${esc(S.city.toUpperCase())} · ${esc(S.dates.toUpperCase())}</p><h2>${esc(P.h2)}</h2><p class="sec-sub">${esc(P.sub)}</p></div>
    <div class="prices">
      <article class="card price">
        <p class="tag-line">INDIVIDUAL</p>
        <p class="price-val">${esc(S.priceIndividual)} <span>+ GST</span></p>
        <ul class="ticks"><li>${icon("check")}5-day workshop, ${esc(S.city)}</li><li>${icon("check")}4 weeks guided implementation</li><li>${icon("check")}Cloud workspace, 2 months</li><li>${icon("check")}1 private review slot</li></ul>
        ${applyBtn("Apply", "btn-block", "individual")}
      </article>
      <article class="card price featured">
        <span class="badge">RECOMMENDED</span>
        <p class="tag-line">TEAM OF 2–3</p>
        <p class="price-val">${esc(S.priceTeam)} <span>per person + GST</span></p>
        <ul class="ticks"><li>${icon("check")}Everything in Individual</li><li>${icon("check")}Save ${esc(S.teamDiscountPct)}% per seat</li><li>${icon("check")}Shared workspace for the team</li><li>${icon("check")}2 private review slots</li></ul>
        ${applyBtn("Apply as a team", "btn-block", "team")}
      </article>
      <article class="card price">
        <p class="tag-line">PRIVATE COHORT</p>
        <p class="price-val price-req">On request</p>
        <ul class="ticks"><li>${icon("check")}At your office or ours</li><li>${icon("check")}Built around your stack</li><li>${icon("check")}Unlimited review slots</li></ul>
        <a class="btn btn-ghost btn-block" href="#apply" data-apply-type="private">Talk to us ${icon("arrow-right")}</a>
        <p class="price-alt">or email <a href="mailto:${esc(S.contactEmail)}">${esc(S.contactEmail)}</a>${wa ? ` · <a href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a>` : ""}</p>
      </article>
    </div>`,
  };

  const A = c.apply;
  const apply = {
    id: "apply",
    html: `
    <div class="apply-grid">
      <div class="apply-copy">
        <p class="eyebrow">Apply</p>
        <h2 class="h2-bar">${esc(A.h2)}</h2>
        <p class="sec-sub">${esc(A.sub)}</p>
        <ul class="trust">${A.trust.map((t) => `<li>${icon("check")}${esc(t)}</li>`).join("")}</ul>
        <p class="apply-contact">Questions first? <a href="mailto:${esc(S.contactEmail)}">${esc(S.contactEmail)}</a>${wa ? ` · <a href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp us</a>` : ""}</p>
      </div>
      <div class="card form-card" id="form-card">
        <form id="apply-form" name="workshop-apply" method="POST" data-netlify="true" netlify-honeypot="company_url_confirm" novalidate>
          <input type="hidden" name="form-name" value="workshop-apply">
          <input type="hidden" name="utm_source"><input type="hidden" name="utm_medium"><input type="hidden" name="utm_campaign">
          <input type="hidden" name="page_url">
          <div class="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="company_url_confirm" tabindex="-1" autocomplete="off"></label></div>

          <div class="fgrid">
            <div class="field"><label for="f-name">Full name <span class="req" aria-hidden="true">*</span></label><input id="f-name" name="full_name" type="text" autocomplete="name" required maxlength="120" aria-describedby="e-name"><p class="err" id="e-name"></p></div>
            <div class="field"><label for="f-email">Work email <span class="req" aria-hidden="true">*</span></label><input id="f-email" name="work_email" type="email" autocomplete="email" inputmode="email" required maxlength="160" aria-describedby="e-email"><p class="err" id="e-email"></p></div>
            <div class="field"><label for="f-company">Company and website <span class="req" aria-hidden="true">*</span></label><input id="f-company" name="company" type="text" autocomplete="organization" required maxlength="200" placeholder="Acme Ltd · acme.com" aria-describedby="e-company"><p class="err" id="e-company"></p></div>
            <div class="field"><label for="f-role">Your role</label>
              <select id="f-role" name="role">${A.roles.map((r, i) => `<option${i === 0 ? " selected" : ""}>${esc(r)}</option>`).join("")}</select></div>
          </div>

          <div class="field"><label for="f-sell">What do you sell, and to whom? <span class="req" aria-hidden="true">*</span></label>
            <textarea id="f-sell" name="what_you_sell" rows="4" maxlength="600" required aria-describedby="sell-count e-sell"></textarea>
            <p class="counter" id="sell-count" aria-live="polite">0 / 600</p><p class="err" id="e-sell"></p></div>

          <fieldset class="field coming" aria-describedby="e-type">
            <legend>Coming as <span class="req" aria-hidden="true">*</span></legend>
            <div class="seg">
              <label><input type="radio" name="coming_as" value="individual" checked><span>Individual</span></label>
              <label><input type="radio" name="coming_as" value="team"><span>Team of 2–3</span></label>
              <label class="seg-private" hidden><input type="radio" name="coming_as" value="private"><span>Private cohort</span></label>
            </div>
            <p class="err" id="e-type"></p>
          </fieldset>

          <div class="field checks">
            <label class="check"><input type="checkbox" name="can_attend" value="yes" required aria-describedby="e-attend"><span>I can attend all 5 days in ${esc(S.city)}. <span class="req" aria-hidden="true">*</span></span></label>
            <p class="err" id="e-attend"></p>
            <label class="check"><input type="checkbox" name="consent" value="yes" required aria-describedby="e-consent"><span>I agree to be contacted about this workshop and accept the <button type="button" class="linkish" data-modal="privacy">Privacy Notice</button>. <span class="req" aria-hidden="true">*</span></span></label>
            <p class="err" id="e-consent"></p>
          </div>

          <div class="form-status" id="form-status" role="alert" hidden></div>
          <button class="btn btn-primary btn-block btn-lg" type="submit" id="submit-btn"><span class="lbl">Submit application</span> ${icon("arrow-right")}</button>
          <p class="req-note"><span class="req">*</span> Required</p>
        </form>
        <div class="thanks" id="thanks" hidden tabindex="-1">
          ${icon("badge-check", "ic-xl")}
          <h3>${esc(A.success)}</h3>
          ${wa ? `<a class="btn btn-ghost btn-sm" href="${esc(wa)}" target="_blank" rel="noopener">${icon("message-circle")} WhatsApp us</a>` : ""}
        </div>
      </div>
    </div>`,
  };

  const faq = {
    id: "faq",
    narrow: true,
    html: `
    <div class="sec-head"><p class="eyebrow">FAQ</p><h2>Questions, answered plainly.</h2></div>
    <div class="faq">${c.faq
      .map((f, i) => `<details class="faq-item"${i === 0 ? " open" : ""}><summary><span>${esc(f.q)}</span>${icon("plus", "faq-ic")}</summary><div class="faq-a"><p>${esc(f.a)}</p></div></details>`)
      .join("")}</div>`,
  };

  const finalCta = {
    id: "join",
    cls: "final",
    html: `
    <div class="final-card">
      <h2>${esc(c.finalCta.h2)}</h2>
      <p class="sec-sub">${S.applicationsCloseDate ? `Applications close ${esc(S.applicationsCloseDate)}. ` : ""}${esc(c.finalCta.sub)}</p>
      <div class="cta-row">${applyBtn()}${fitBtn("Book a fit call")}</div>
    </div>`,
  };

  // Alternate white / silver backgrounds across whichever sections are shown.
  const sections = [trusted, why, programme, days, month, stack, who, proof, faculty, checklist, pricing, apply, faq, finalCta].filter(Boolean);
  const body = sections
    .map(
      (s, i) => `
<!-- ${s.id} -->
<section class="section ${i % 2 ? "alt" : ""} ${s.cls || ""}" id="${s.id}">
  <div class="wrap${s.narrow ? " wrap-narrow" : ""}">${s.html}
  </div>
</section>`
    )
    .join("\n");

  const nav = [
    ["programme", "Programme"],
    ["who", "Who it's for"],
    ["faculty", "Faculty"],
    ["pricing", "Pricing"],
  ];

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
<meta property="og:title" content="${esc(`${c.site.name} · ${S.city} Cohort 1`)}">
<meta property="og:description" content="${esc(metaDesc)}">
<meta property="og:url" content="${esc(ogUrl)}/">
<meta property="og:image" content="${esc(ogImg)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="LeadStrategus GTM Engineering Workshop · Bengaluru · Cohort 1 · 12 seats">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(c.site.name)}">
<meta name="twitter:description" content="${esc(metaDesc)}">
<meta name="twitter:image" content="${esc(ogImg)}">
<link rel="icon" href="/img/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/montserrat.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css?v=__BUILD__">
<script>document.documentElement.classList.add('js');try{if(sessionStorage.getItem('ann-dismissed'))document.documentElement.classList.add('ann-off')}catch(e){}</script>
<script type="application/ld+json">${jsonLd}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<div class="announce" id="announce">
  <div class="wrap ann-row">
    <p>${esc(`${S.city.toUpperCase()} COHORT 1 · ${S.dates.toUpperCase()}${seatsText}`)}</p>
    <a href="#apply">APPLY →</a>
    <button type="button" class="ann-x" id="ann-x" aria-label="Dismiss announcement">${icon("x")}</button>
  </div>
</div>

<header class="site-header" id="site-header">
  <div class="wrap nav-row">
    <a class="brand" href="#top">
      ${logo("leadstrategus-shield", 30, 36, "", "brand-shield", true)}
      <span class="brand-name">LEADSTRATEGUS</span>
      <span class="brand-div" aria-hidden="true"></span>
      <span class="brand-sub">GTM ENGINEERING WORKSHOP</span>
    </a>
    <nav class="nav" id="site-nav" aria-label="Primary">
      <ul>${nav.map(([id, l]) => `<li><a href="#${id}">${l}</a></li>`).join("")}</ul>
    </nav>
    ${applyBtn("Apply for Cohort 1", "btn-sm nav-cta")}
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">${icon("menu", "ic-open")}${icon("x", "ic-close")}</button>
  </div>
</header>

<main id="main">
${hero}
${body}
</main>

<footer class="site-footer">
  <div class="wrap foot-grid">
    <a class="foot-logo" href="#top">${logo("leadstrategus-logo-horizontal", 227, 56, "LeadStrategus logo")}</a>
    <ul class="foot-links">
      <li><a href="https://leadstrategus.com" rel="noopener" target="_blank">leadstrategus.com</a></li>
      <li><a href="https://leadstrategus.ai" rel="noopener" target="_blank">leadstrategus.ai</a></li>
      <li><a href="https://expotofunnel.com" rel="noopener" target="_blank">expotofunnel.com</a></li>
    </ul>
    <ul class="foot-links">
      <li><button type="button" class="linkish" data-modal="privacy">Privacy</button></li>
      <li><button type="button" class="linkish" data-modal="terms">Terms</button></li>
    </ul>
  </div>
  <div class="wrap foot-base"><p>© 2026 LeadStrategus · ${esc(S.city)}</p></div>
</footer>

<div class="mobile-bar" id="mobile-bar">${applyBtn(`Apply for Cohort 1 <span class="mb-sub">· ${seats} seats</span>`, "btn-block")}</div>

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
