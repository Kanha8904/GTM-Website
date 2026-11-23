/**
 * ============================================================================
 *  LeadStrategus GTM Engineering Bootcamp: SITE CONTENT & SETTINGS
 * ============================================================================
 *  Edit this one file to change dates, venue, price, seats, faculty, FAQ,
 *  client logos, the form endpoint and analytics IDs. Then rebuild:
 *
 *      node build.mjs        (Netlify / Vercel run this for you on deploy)
 *
 *  Notes for editors
 *  - Text is plain text. A few fields allow simple HTML (<strong>, <em>, <br>);
 *    those fields end in "Html".
 *  - Leave a value as "" (empty) or null to hide the thing it controls, where
 *    noted.
 *  - Lines marked TODO still need a confirmed value from LeadStrategus.
 *  - CLAIMS RULE: never add copy that promises leads, meetings, revenue,
 *    pipeline, jobs/placement, vendor certification, autonomous outbound or
 *    production deployment in 5 days. LinkedIn is always human-led.
 * ============================================================================
 */

export default {
  // ---------------------------------------------------------------------------
  // 1. KEY FACTS (used all over the page, in the SEO tags and in JSON-LD)
  // ---------------------------------------------------------------------------
  site: {
    url: "https://bootcamp.leadstrategus.com", // TODO: final live URL (used for OG/canonical)
    title: "GTM Engineering Bootcamp, Bengaluru | LeadStrategus",
    ogImage: "/img/og-image.png",
  },

  programme: {
    name: "GTM Engineering Bootcamp",
    tagline: "From Zero to Outbound in 5 Days",
    city: "Bengaluru",
    dates: "Dates TBC", // TODO (Q2): e.g. "8–12 Feb 2027"
    startDate: "", // TODO: ISO date for search engines, e.g. "2027-02-08". Empty = left out of JSON-LD.
    endDate: "", //   e.g. "2027-02-12"
    venue: "Venue TBC", // TODO: venue name
    venueArea: "next to ITPL, Whitefield, Bengaluru",
    venueNote: "~7 min walk from the metro",
    hours: "9:30 am – 5:30 pm",
    guidedWeeks: 8, // Q1: hero copy said 4, creatives & FAQ say 8. Confirm.
    totalSeats: 12, // Q6
    seatsLeft: null, // e.g. 7 → shows "7 of 12 seats left". null = hidden.
    responseDays: 3, // "We'll get back within X working days"
  },

  pricing: {
    individual: { base: "₹70,000", withGst: "₹82,600" },
    cohort: { base: "₹60,000", withGst: "₹70,800", minSeats: 3 },
  },

  contact: {
    email: "info@leadstrategus.com", // TODO: confirm the inbox applicants should write to
    phone: "", // TODO: e.g. "+91 98xxxxxxxx". Empty = hidden.
    whatsapp: "", // TODO: digits only incl. country code, e.g. "9198xxxxxxxx". Empty = WhatsApp buttons hidden.
    whatsappMessage: "Hi LeadStrategus, I have a question about the GTM Engineering Bootcamp.",
    linkedin: "https://www.linkedin.com/company/leadstrategus/", // TODO: confirm
  },

  // ---------------------------------------------------------------------------
  // 2. APPLICATION FORM BACKEND
  // ---------------------------------------------------------------------------
  form: {
    // "n8n"       → POST JSON to an n8n webhook (recommended)
    // "formspree" → POST JSON to https://formspree.io/f/xxxx
    // "web3forms" → POST JSON to https://api.web3forms.com/submit (put access_key in extraFields)
    // "netlify"   → Netlify Forms (no endpoint needed when hosted on Netlify)
    // ""          → no backend yet: opens the applicant's email app with the
    //               application filled in, addressed to contact.email
    provider: "",
    endpoint: "", // e.g. "https://n8n.yourdomain.com/webhook/bootcamp-apply"
    extraFields: {}, // e.g. { access_key: "web3forms-public-key" }
  },

  // ---------------------------------------------------------------------------
  // 3. ANALYTICS: all OFF until an ID is filled in
  // ---------------------------------------------------------------------------
  analytics: {
    ga4Id: "", // "G-XXXXXXX"
    metaPixelId: "", // "1234567890"
    linkedinPartnerId: "", // "1234567"
  },

  // ---------------------------------------------------------------------------
  // 4. FEATURE FLAGS
  // ---------------------------------------------------------------------------
  flags: {
    showClientLogos: false, // Q5: turn on only once clients have approved logo use
    showSupportingFaculty: false, // Q8
  },

  // ---------------------------------------------------------------------------
  // 5. PAGE COPY
  // ---------------------------------------------------------------------------
  hero: {
    eyebrow: "GTM ENGINEERING BOOTCAMP · BENGALURU",
    h1Before: "AI won't fill your calendar. But AI ",
    h1Gradient: "plus judgement",
    h1After: " will.",
    sub: "Everyone's selling the dream: plug in a few AI tools and watch the meetings roll in. We run outbound for a living. It doesn't work like that. What works is knowing where AI does the heavy lifting, and where you must make the call. That's what this bootcamp teaches.",
  },

  // Q3: original line was "Your first campaign, launched with us beside you".
  outcomes: [
    { icon: "target", title: "Your ICP and a ranked list of accounts showing buying signals" },
    { icon: "user-check", title: "The decision-makers to reach, and messages they'll actually reply to" },
    { icon: "rocket", title: "Your first campaign, built and test-launched with us beside you" },
    { icon: "workflow", title: "The full workflow (n8n + Claude agents), yours to keep" },
  ],

  stages: [
    {
      n: "01", phase: 1, icon: "message-circle",
      title: "Client discovery & business understanding",
      objective: "Understand the business, the offering, existing customers and growth goals before touching a tool.",
      activities: ["Discovery interviews and a structured questionnaire", "Understand the product or service and what sets it apart", "Review past customers and wins", "Identify pain points, markets and constraints"],
      output: "Client brief, pain-point map, targeting hypothesis",
      tools: "Claude / ChatGPT, questionnaire",
    },
    {
      n: "02", phase: 1, icon: "target",
      title: "Initial ICP & market segmentation",
      objective: "Define the target market using clear, verifiable criteria.",
      activities: ["Create the Ideal Customer Profile", "Segment by industry, company size and geography", "Set simple filters (revenue, headcount, technology)", "Write inclusion and exclusion rules"],
      output: "ICP definition, segments, targeting rules",
      tools: "Apollo, Sales Navigator",
    },
    {
      n: "03", phase: 1, icon: "database",
      title: "Macro account identification",
      objective: "Build the first universe of companies that fit the ICP.",
      activities: ["Search databases with your ICP filters", "Consolidate results from more than one source", "Remove duplicates and irrelevant entries", "Create the target-account universe"],
      output: "First-cut target account universe",
      tools: "Apollo, Sales Navigator",
    },
    {
      n: "04", phase: 2, icon: "radar",
      title: "Intelligence-led micro-segmentation",
      objective: "Refine the list into sharper sub-segments using business context and buying signals.",
      activities: ["Analyse business context and initiatives", "Track hiring, expansion, leadership change and projects", "Separate fact, signal, inference and hypothesis", "Shortlist the better-fit accounts"],
      output: "Refined universe with buying signals",
      tools: "Clay, Apollo, AI research",
    },
    {
      n: "05", phase: 2, icon: "star",
      title: "Account scoring & prioritisation",
      objective: "Decide where to focus first, and why.",
      activities: ["Build a simple scoring model", "Score fit and intent separately", "Tier accounts A / B / C", "Define the next best action per tier"],
      output: "Tiered (A/B/C) account list, fit and intent scored separately",
      tools: "Clay, scoring model",
    },
    {
      n: "06", phase: 2, icon: "users",
      title: "Contact discovery & identification",
      objective: "Find the right people inside each priority account and make the data usable.",
      activities: ["Map the buying committee and influencers", "Find and verify work emails", "Locate LinkedIn profiles for human-led outreach", "Clean, standardise and de-duplicate"],
      output: "Clean, verified contact database",
      tools: "Apollo, Clay, Sales Navigator",
    },
    {
      n: "07", phase: 3, icon: "pen-line",
      title: "Messaging architecture",
      objective: "Create personalised, multi-step messages that start a conversation.",
      activities: ["Message strategy by segment and persona", "Openers grounded in real, verified signals", "Follow-ups that add insight, relevance and value", "Human review before anything is sent"],
      output: "Persona-specific message library and sequences",
      tools: "Claude, ChatGPT, Instantly",
    },
    {
      n: "08", phase: 3, icon: "send",
      title: "Campaign launch, adapt & review",
      objective: "Run the campaign, handle replies and learn what works.",
      activities: ["Set up sequences and check deliverability", "Human-led LinkedIn engagement alongside email", "Track replies and log outcomes in the CRM", "Review weekly and adjust"],
      output: "Live campaign, tracked replies, next actions",
      tools: "Instantly, HubSpot, n8n",
    },
  ],

  phases: {
    1: "Understand & define the market",
    2: "Build intelligence & database",
    3: "Design the conversation & drive outcomes",
  },

  days: [
    {
      day: 1, focus: "Define the market",
      bullets: ["ICP, exclusions and buyer roles", "A buying-signal taxonomy", "Source evidence and freshness: what counts as proof"],
      output: "ICP + signal worksheet",
    },
    {
      day: 2, focus: "Build intelligence",
      bullets: ["Account and buyer research", "Cleaning, enrichment and verification", "Fit vs intent scoring"],
      output: "Prioritised account table",
    },
    {
      day: 3, focus: "Connect the system",
      bullets: ["Clay tables and the HubSpot data model", "n8n basics: triggers, mapping, IF branches", "Webhooks that move data between tools"],
      output: "A connected workflow",
    },
    {
      day: 4, focus: "Prepare engagement",
      bullets: ["Signal-based messaging", "Email sourcing, verification and deliverability (SPF / DKIM / DMARC)", "Human-led LinkedIn and call tasks"],
      output: "Reviewed engagement plan",
    },
    {
      day: 5, focus: "Test & explain",
      bullets: ["End-to-end run, including exception paths", "CRM capture and the runbook", "Capstone demo"],
      output: "Working MVP + runbook",
    },
  ],

  weeks: [
    "Adapt ICP & signals",
    "Data quality & enrichment cost",
    "Scoring",
    "Workflow reliability",
    "Messaging & deliverability",
    "CRM & reporting",
    "Measurement",
    "Demo & handover",
  ],

  faculty: {
    lead: {
      name: "Kingshuk Hazra",
      role: "Founder, LeadStrategus",
      photo: "", // TODO: e.g. "/img/kingshuk.webp" (square, 320×320). Empty = initials avatar.
      bio: "25+ years in B2B marketing, BD & GTM across AWS, SAP, Gartner and more. Kingshuk founded LeadStrategus to run outbound for B2B companies, and built this bootcamp from what the team does every week.", // TODO: confirm bio
      linkedin: "", // TODO: LinkedIn profile URL. Empty = hidden.
    },
    // Shown only when flags.showSupportingFaculty is true (Q8).
    supporting: [
      { name: "Kiruba", role: "Technical Lead", bio: "Clay, n8n, HubSpot and AI workflows.", photo: "", linkedin: "" },
      { name: "Komala", role: "Research & Intelligence Lead", bio: "Account research, signals and data quality.", photo: "", linkedin: "" },
    ],
  },

  stats: [
    { value: 100, suffix: "+", label: "global outbound projects" },
    { value: 8, suffix: "+ years", label: "in the field" },
    { value: 25, suffix: "K+", label: "personalised messages sent" },
    { value: 5.0, decimals: 1, prefix: "Clutch ", suffix: " ★", label: "rating (7 reviews)" },
  ],

  // Shown only when flags.showClientLogos is true (Q5). Add `logo: "/img/clients/kotak.svg"` once you have files.
  clients: [
    { name: "Kotak" }, { name: "OPPO" }, { name: "Razorpay" }, { name: "EY" }, { name: "Alibaba Cloud" },
  ],

  faq: [
    { q: "What is GTM engineering?", a: "Designing and connecting the data, research, AI, outreach, CRM and workflow pieces that make B2B prospecting systematic. It's not just learning tools." },
    { q: "Do I need to know how to code?", a: "No. Basic expressions are shown. Advanced coding is optional stretch material." },
    { q: "Can a fresher join?", a: "It's not a beginner placement course. You should have basic B2B prospecting familiarity. Admission is selective." },
    { q: "Do I need to buy Clay, n8n or HubSpot?", a: "No. We provide controlled classroom workspaces for the programme period." },
    { q: "Will we send emails to real prospects in class?", a: "No. Class exercises use real public companies with fictional contacts and test inboxes. No mass blasting. Running real campaigns is part of what you prepare for during guided execution, under your own company's approvals." },
    { q: "Is LinkedIn automation taught?", a: "No. LinkedIn research and engagement are human-led. No scraping or automated messaging." },
    { q: "Is this a placement programme? Does it guarantee meetings?", a: "No. Results depend on your offer, market, data and execution. We teach you to build and run the system." },
    { q: "What certificate do I get?", a: "A practitioner certificate after you pass the capstone (70/100 plus mandatory gates). It's a LeadStrategus certificate, not an accredited or vendor certification." },
    { q: "What happens after the 5 days?", a: "{N} weeks of weekly live sessions, a private cohort community, recordings and templates. This is group support, not 1:1 consulting." },
    { q: "Can my company claim GST credit?", a: "Registered businesses may be eligible. Please confirm with your CA." },
    { q: "What's the refund / transfer policy?", a: "Written cancellation, refund and substitution terms are shared before payment." },
    { q: "Where exactly is the venue?", a: "Next to ITPL, Whitefield, ~7 min from the metro. The exact address is in your joining note." },
  ],

  // ---------------------------------------------------------------------------
  // 6. LEGAL (placeholder text: replace with the approved versions)
  // ---------------------------------------------------------------------------
  legal: {
    privacyHtml: `
      <p><strong>Placeholder. Replace with the approved LeadStrategus Privacy Notice before launch.</strong></p>
      <p>When you apply, we collect the details you enter in the form (name, work email, phone, company, role, LinkedIn URL, experience, goals and how you heard about us), plus the campaign tags in the page link (UTM parameters).</p>
      <p>We use these details only to review your application and to contact you about this programme. If you separately opt in, we may also send you updates about future LeadStrategus programmes. You can opt out at any time.</p>
      <p>Your data is stored in our CRM and internal tools with access limited to the programme team. We do not sell your data.</p>
      <p>To access, correct or delete your data, write to the contact email on this page.</p>`,
    termsHtml: `
      <p><strong>Placeholder. Replace with the approved Terms, Cancellation, Refund and Substitution policy before launch.</strong></p>
      <p>Admission is selective. A seat is confirmed only after written confirmation from LeadStrategus and receipt of payment (Razorpay link, or bank transfer against a purchase order). A GST invoice is provided.</p>
      <p>Written cancellation, refund, transfer and substitution terms are shared with you before payment.</p>
      <p>The programme builds practical capability. It does not guarantee leads, meetings, pipeline, revenue, jobs or placement, and the certificate is a LeadStrategus practitioner certificate, not an accredited or vendor certification.</p>
      <p>Travel, accommodation and lunch are not included.</p>`,
  },
};
