/**
 * ============================================================================
 *  LeadStrategus GTM Engineering Workshop: SITE CONTENT & SETTINGS
 * ============================================================================
 *  Edit this one file to change dates, seats, prices, links, faculty, FAQ,
 *  testimonials and the form endpoints. Then rebuild:
 *
 *      node build.mjs        (Netlify / Vercel run this for you on deploy)
 *
 *  - Text is plain text unless the field name ends in "Html".
 *  - "" (empty) or null hides the thing it controls, where noted.
 *  - Lines marked TODO still need a confirmed value from LeadStrategus.
 *  - CLAIMS RULE: never add copy that promises leads, meetings, revenue,
 *    pipeline, jobs/placement, vendor certification, autonomous outbound or
 *    production deployment in 5 days. LinkedIn is always human-led.
 * ============================================================================
 */

export default {
  // ---------------------------------------------------------------------------
  // 1. SETTINGS: the placeholders from the reference copy live here
  // ---------------------------------------------------------------------------
  settings: {
    dates: "Dates TBC", // TODO [DATES], e.g. "8–12 Feb 2027"
    startDate: "", // ISO date for search engines, e.g. "2027-02-08". Empty = left out of JSON-LD.
    endDate: "", //   e.g. "2027-02-12"
    seatsLeft: null, // TODO [X] e.g. 7 → "7 OF 12 SEATS LEFT". null = that part is hidden.
    totalSeats: 12,
    applicationsCloseDate: "", // TODO [date] e.g. "30 Jan 2027". Empty = sentence left out.
    priceIndividual: "₹70,000", // TODO [₹ price] confirm Cohort 1 introductory price (carried over from the earlier pricing)
    priceTeam: "₹60,000", //       TODO [₹ price] per person for a team of 2–3 (carried over; the earlier rule was 3+ seats)
    teamDiscountPct: 14, //        TODO [X]% saving per seat for teams
    fitCallUrl: "", // TODO booking link for the 15-min fit call (Calendly etc.). Empty = opens an email to contactEmail.
    clutchUrl: "https://clutch.co/profile/leadstrategus", // TODO confirm the Clutch profile URL
    checklistEndpoint: "", // where the checklist email-capture POSTs JSON {email}. Empty = no capture, link shown straight away.
    checklistPdfUrl: "", // TODO URL of the "8 questions" PDF. Empty = "we'll email it to you".
    showClientLogos: false, // "Trusted by" strip: turn on only with client permission
    showTestimonials: false, // "What our clients say": turn on once real quotes with permission exist
    contactEmail: "info@leadstrategus.com", // TODO confirm
    whatsapp: "", // digits incl. country code, e.g. "9198xxxxxxxx". Empty = hidden.
    whatsappMessage: "Hi LeadStrategus, I have a question about the GTM Engineering Workshop.",
    linkedin: "https://www.linkedin.com/company/leadstrategus/", // TODO confirm
    city: "Bengaluru",
    responseHours: 48,
  },

  site: {
    url: "https://workshop.leadstrategus.com", // TODO final live URL (used for canonical, OG and JSON-LD)
    name: "GTM Engineering Workshop",
    title: "GTM Engineering Workshop, Bengaluru | LeadStrategus",
    description:
      "5-day in-person GTM engineering workshop in Bengaluru + 4 weeks of guided implementation. Design, build and test your own outbound engine — ICP, signals, scoring, messaging and measurement. 12 seats.",
    ogImage: "/img/og-image.png",
  },

  // ---------------------------------------------------------------------------
  // 2. APPLICATION FORM BACKEND
  // ---------------------------------------------------------------------------
  form: {
    // "n8n" | "formspree" | "web3forms" | "netlify" | "" (no backend: opens the
    // applicant's email app with the application filled in)
    provider: "",
    endpoint: "",
    extraFields: {},
  },

  analytics: { ga4Id: "", metaPixelId: "", linkedinPartnerId: "" }, // all off until set

  // ---------------------------------------------------------------------------
  // 3. PAGE COPY (from the GTM Workshop look-and-feel snapshot)
  // ---------------------------------------------------------------------------
  hero: {
    eyebrow: "5-DAY INTENSIVE · 1-MONTH IMPLEMENTATION · BENGALURU",
    h1Before: "Outbound, ",
    h1Gradient: "engineered.",
    sub: "Beyond the AI hype. Design, build and test a complete outbound prospecting engine for your own business — target logic, signals, scoring, messaging and measurement. Taught by operators who ran marketing at AWS, Gartner and SAP.",
    buildLog: [
      { when: "DAY 1", text: "ICP + segments chosen", gate: "gate 1" },
      { when: "DAY 2", text: "Signal model set; accounts ranked A/B/C", gate: "gate 2" },
      { when: "DAY 3", text: "Contacts verified; n8n workflow running" },
      { when: "DAY 4", text: "Sequences approved", gate: "gate 3" },
      { when: "DAY 5", text: "QA, deliverability, demo day" },
      { when: "WK 1–4", text: "First sends · replies · refine · 90-day plan" },
    ],
    steps: ["Define the market", "Score on buying signals", "Launch, measure, improve"],
  },

  clients: [{ name: "Client 1" }, { name: "Client 2" }, { name: "Client 3" }, { name: "Client 4" }, { name: "Client 5" }], // add logo: "/brand/clients/x.svg"

  why: {
    h2: "Same tools. Different system.",
    intro: "AI made outbound easier to assemble, not easier to win. When everyone uses the same models, data and prompts, outbound converges. Three things decide who books the meeting.",
    cols: [
      { icon: "target", title: "A sharper view of who buys, and why now.", text: "Signals that predict a purchase in your market — not just signals that are interesting." },
      { icon: "shield-check", title: "Human judgement at three gates.", text: "AI does research, data and drafting. You decide segments, buying criteria and every message." },
      { icon: "refresh-cw", title: "A loop that learns.", text: "Replies and meetings feed back into targeting, scoring and messaging every cycle." },
    ],
  },

  programme: {
    eyebrow: "THE PROGRAMME · 8 STAGES · 3 GATES · 5 DAYS + 1 MONTH",
    h2: "8 stages. 3 human gates. One engine.",
    intro: "This isn't a course. It's a build. About 30% principles, 70% building on your own business. You leave with a working, documented engine and a plan to run it.",
    stages: [
      { n: "01", stage: "Client discovery", build: "Questionnaire, interviews, Claude to organise", leave: "Business brief: what you sell, who buys, why, what success looks like", control: "ai" },
      { n: "02", stage: "ICP and segments", build: "Claude proposes 6–8 segments; you pick 2–3", leave: "ICP, buying committee, disqualifiers; 2–3 segments chosen from 6–8", control: "human" },
      { n: "03", stage: "Signal-led account scoring", build: "Claude research agents, Apollo, n8n", leave: "Your buying-intent criteria and a ranked account list", control: "human" },
      { n: "04", stage: "Contact discovery", build: "Apollo, Claude agents, verification", leave: "Verified decision-makers in priority accounts", control: "ai" },
      { n: "05", stage: "Prioritisation and campaign plan", build: "Scoring model, tiers A / B / C", leave: "Tiers A / B / C, waves, channels, cadence", control: "ai" },
      { n: "06", stage: "Messaging architecture", build: "Frameworks from our campaign data; you approve", leave: "Connect → engage → explore → convert sequences", control: "human" },
      { n: "07", stage: "Launch", build: "Instantly, human-led LinkedIn, HubSpot", leave: "Email and human-led LinkedIn, tracked in your CRM", control: "ai" },
      { n: "08", stage: "Review and improve", build: "HubSpot, n8n logs, weekly review", leave: "Weekly review; results feed targeting and messages", control: "ai" },
    ],
    note: "Prefer full automation? You can switch the gates off. We'll show you what that costs in quality.",
  },

  days: {
    h2: "5 days to build. 1 month to implement.",
    summary: [
      { tag: "IN PERSON · BENGALURU", big: "5", unit: "days", text: "Principles in the morning. Building on your own business in the afternoon. Demo day on Friday." },
      { tag: "ONLINE · 2 × 1 HR A WEEK", big: "4", unit: "weeks", text: "First sends, replies, refinement and a 90-day plan — with our team reviewing your engine." },
    ],
    subhead: "The 5 days. Something built every day.",
    list: [
      { label: "DAY 1 · STAGES 1–2", title: "Foundations and discovery", text: "Brief, ICP, chosen segments, signal thesis, success metrics" },
      { label: "DAY 2 · STAGE 3", title: "Signals and account scoring", text: "Your scoring model and a ranked account list" },
      { label: "DAY 3 · STAGES 4–5", title: "Contacts and orchestration", text: "Contact database, tiers, campaign plan, n8n workflow running" },
      { label: "DAY 4 · STAGE 6", title: "Messaging and AI agents", text: "Approved message library; Clay and Claude Code demo" },
      { label: "DAY 5 · STAGES 7–8", title: "Launch readiness and demo day", text: "Deliverability, QA, dashboard, live demo to the cohort" },
    ],
  },

  month: {
    h2: "The month after. Real sends, reviewed.",
    sub: "Two live 1-hour sessions a week, online. Private review slots if your data can't be shared.",
    weeks: ["Scope and data review", "First sends and deliverability", "Replies, results, refine", "Final demo and 90-day plan"],
  },

  stack: {
    h2: "A lean stack. Chosen by job.",
    cols: [
      { label: "REASONING", tools: "Claude · ChatGPT" },
      { label: "DATA", tools: "Apollo.io" },
      { label: "ORCHESTRATION", tools: "n8n" },
      { label: "SENDING", tools: "Instantly" },
      { label: "SYSTEM OF RECORD", tools: "HubSpot" },
    ],
    demoOnly: "Clay · Claude Code",
  },

  who: {
    h2: "For serious practitioners who own pipeline.",
    cards: [
      { icon: "rocket", title: "Founders selling B2B", text: "Need a repeatable way to create first meetings." },
      { icon: "briefcase", title: "Sales, demand-gen and RevOps leads", text: "Building or fixing an outbound motion." },
      { icon: "user-round", title: "First GTM hires", text: "Know the tools; want the judgement behind them." },
      { icon: "users", title: "Teams of 2–3", text: "Best results. Save {teamDiscountPct}% per seat.", link: "#pricing" },
    ],
    note: "Not a tool certification. Not a placement programme.",
  },

  proof: {
    badge: "5-STAR RATED ON CLUTCH",
    h2: "What our clients say.",
    testimonials: [
      // TODO: real quotes, used with permission
      { quote: "[Client quote with permission]", role: "[Role]", company: "[Company type, country]" },
      { quote: "[Client quote with permission]", role: "[Role]", company: "[Company type, country]" },
      { quote: "[Client quote with permission]", role: "[Role]", company: "[Company type, country]" },
    ],
  },

  faculty: {
    h2: "An operating firm that trains.",
    sub: "Everything we teach, we run for clients every week.",
    people: [
      { name: "Kingshuk Hazra", focus: "Strategy, segmentation, messaging", photo: "", linkedin: "" }, // TODO photo "/brand/people/kingshuk.webp"
      { name: "Komala Maran", focus: "Workflows and the judgement layer", photo: "", linkedin: "" },
      { name: "Kiruba", focus: "Technical build and infrastructure", photo: "", linkedin: "" }, // TODO [Kiruba] confirm full name
    ],
  },

  checklist: {
    tag: "FREE · PDF",
    title: "8 questions to answer before you deploy an outbound engine.",
    cta: "Get the checklist →",
  },

  pricing: {
    h2: "12 seats. Introductory pricing.",
    sub: "First cohort only. Price rises after Cohort 1.",
  },

  apply: {
    h2: "Tell us what you sell. We'll call within 48 hours.",
    sub: "Two minutes. We check fit before anyone pays.",
    trust: ["NO PAYMENT TO APPLY", "GST INVOICE", "DAY-1 REFUND PROMISE"],
    roles: ["Founder", "Sales or demand-gen lead", "RevOps", "First GTM hire", "Other"],
    success: "Application received. We'll call you within 48 hours to check fit.",
  },

  faq: [
    { q: "How is this different from a Clay or n8n course?", a: "Those teach a tool. We teach you to design a system and choose tools by job, with frameworks from our own client campaigns." },
    { q: "Do I need to code?", a: "No. You'll work with no-code and low-code tools; we show basic expressions where useful. Comfort with spreadsheets and browser tools is enough." },
    { q: "Will my engine be production-ready after 5 days?", a: "You'll leave with a working, documented and tested engine. The 4-week implementation is where you run real sends and refine it; hardening it for full production use in your company is separate work." },
    { q: "Do you guarantee meetings or a job?", a: "No. Results depend on your offer, market, data and execution. This is not a placement programme. We teach you to build and run the system that creates meetings." },
    { q: "Can my employer pay?", a: "Yes. We issue a GST invoice and accept payment by Razorpay link or bank transfer against a PO. Registered businesses may be able to claim GST credit — please check with your CA." },
  ],

  finalCta: {
    h2: "12 seats. One engine that's yours.",
    sub: "We read every one and call you within 48 hours to check fit.",
  },

  // ---------------------------------------------------------------------------
  // 4. LEGAL (placeholder text: replace with the approved versions)
  // ---------------------------------------------------------------------------
  legal: {
    privacyHtml: `
      <p><strong>Placeholder. Replace with the approved LeadStrategus Privacy Notice before launch.</strong></p>
      <p>When you apply, we collect the details you enter in the form (name, work email, company and website, role, what you sell, how you're coming) plus the campaign tags in the page link (UTM parameters). If you request the checklist, we collect your email address.</p>
      <p>We use these details only to review your application, contact you about this workshop and send you what you asked for. We do not sell your data.</p>
      <p>Your data is stored in our CRM and internal tools with access limited to the programme team. To access, correct or delete it, write to the contact email on this page.</p>`,
    termsHtml: `
      <p><strong>Placeholder. Replace with the approved Terms, Cancellation, Refund and Substitution policy before launch.</strong></p>
      <p>There is no payment to apply. A seat is confirmed after a fit call, written confirmation from LeadStrategus and receipt of payment (Razorpay link, or bank transfer against a purchase order). A GST invoice is provided.</p>
      <p>Day-1 refund promise: TODO, insert the exact terms.</p>
      <p>The workshop builds practical capability. It does not guarantee leads, meetings, pipeline, revenue, jobs or placement, and it is not a tool or vendor certification.</p>
      <p>Travel and accommodation are not included.</p>`,
  },
};
