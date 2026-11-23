/* LeadStrategus GTM Engineering Bootcamp: page interactions (no dependencies) */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const cfg = JSON.parse($("#site-config").textContent);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- analytics (off unless IDs are set in content.js) ---------- */
  const A = cfg.analytics || {};
  const loadScript = (src) => { const s = document.createElement("script"); s.async = true; s.src = src; document.head.appendChild(s); };
  if (A.ga4Id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", A.ga4Id);
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(A.ga4Id));
  }
  if (A.metaPixelId) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq("init", A.metaPixelId);
    window.fbq("track", "PageView");
  }
  if (A.linkedinPartnerId) {
    window._linkedin_partner_id = A.linkedinPartnerId;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(A.linkedinPartnerId);
    loadScript("https://snap.licdn.com/li.lms-analytics/insight.min.js");
  }
  const track = (name, params = {}) => {
    try {
      if (window.gtag) window.gtag("event", name, params);
      if (window.fbq) window.fbq("track", "SubmitApplication", params);
      if (window.lintrk) window.lintrk("track", params);
      window.dataLayer && window.dataLayer.push({ event: name, ...params });
    } catch (_) { /* never break the page for analytics */ }
  };

  /* ---------- header: shrink, mobile menu, scroll-spy ---------- */
  const header = $("#site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = $(".nav-toggle");
  const setMenu = (open) => {
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("#site-nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("nav-open")) { setMenu(false); toggle.focus(); } });

  const navLinks = new Map($$("#site-nav a").map((a) => [a.getAttribute("href").slice(1), a]));
  if ("IntersectionObserver" in window) {
    const visible = new Map();
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = null, ratio = 0;
      visible.forEach((r, id) => { if (r > ratio) { ratio = r; best = id; } });
      navLinks.forEach((a, id) => {
        const on = id === best;
        a.classList.toggle("active", on);
        on ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current");
      });
    }, { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.01, 0.25, 0.5, 1] });
    navLinks.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- sticky mobile Apply bar: hidden while #apply (or footer) is visible ---------- */
  const bar = $("#mobile-bar");
  if (bar && "IntersectionObserver" in window) {
    const hideFor = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? hideFor.add(e.target) : hideFor.delete(e.target)));
      bar.classList.toggle("hide", hideFor.size > 0);
    }, { threshold: 0.05 });
    [$("#apply"), $(".site-footer"), $(".hero .cta-row")].forEach((el) => el && io.observe(el));
  }

  /* ---------- reveal on scroll ---------- */
  const reveals = $$(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window) {
    const ro = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    reveals.forEach((el) => ro.observe(el));
  } else reveals.forEach((el) => el.classList.add("in"));

  /* ---------- 8-stage stepper (single-open disclosure) ---------- */
  const stageBtns = $$(".stage-btn");
  const openStage = (btn, focus) => {
    stageBtns.forEach((b) => {
      const on = b === btn;
      b.setAttribute("aria-expanded", String(on));
      document.getElementById(b.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) btn.focus();
  };
  stageBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      const desktop = window.matchMedia("(min-width: 1024px)").matches;
      if (isOpen && !desktop) { // on mobile, tapping an open stage closes it
        btn.setAttribute("aria-expanded", "false");
        document.getElementById(btn.getAttribute("aria-controls")).hidden = true;
        return;
      }
      openStage(btn);
      if (!desktop) {
        const top = btn.getBoundingClientRect().top;
        if (top < 70) btn.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
    btn.addEventListener("keydown", (e) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (e.key in keys) { e.preventDefault(); stageBtns[(i + keys[e.key] + stageBtns.length) % stageBtns.length].focus(); }
      if (e.key === "Home") { e.preventDefault(); stageBtns[0].focus(); }
      if (e.key === "End") { e.preventDefault(); stageBtns[stageBtns.length - 1].focus(); }
    });
  });

  /* ---------- Day 1–5 tabs (ARIA tablist, automatic activation) ---------- */
  const tabs = $$('.day-tabs [role="tab"]');
  const selectTab = (tab, focus = true) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
    tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab, false));
    tab.addEventListener("keydown", (e) => {
      let n = null;
      if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
      if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") n = 0;
      if (e.key === "End") n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); selectTab(tabs[n]); }
    });
  });

  /* ---------- count-up stats ---------- */
  const statsEl = $("#stats");
  if (statsEl && !reduceMotion && "IntersectionObserver" in window) {
    const nums = $$(".stat-val", statsEl).map((el) => ({ el: $(".num", el), to: parseFloat(el.dataset.count), d: +el.dataset.decimals || 0 }));
    nums.forEach((n) => (n.el.textContent = (0).toFixed(n.d)));
    const so = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      so.disconnect();
      const t0 = performance.now(), dur = 1400;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur), ease = 1 - Math.pow(1 - k, 3);
        nums.forEach((n) => (n.el.textContent = (n.to * ease).toFixed(n.d)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    so.observe(statsEl);
  }

  /* ---------- modals (native <dialog>: focus-trapped, Esc closes) ---------- */
  let lastFocus = null;
  $$("[data-modal]").forEach((b) => b.addEventListener("click", () => {
    const d = document.getElementById("modal-" + b.dataset.modal);
    if (!d) return;
    lastFocus = b;
    if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    document.body.classList.add("modal-open");
    const x = $(".modal-x", d); x && x.focus();
  }));
  $$("dialog.modal").forEach((d) => {
    d.addEventListener("close", () => { document.body.classList.remove("modal-open"); lastFocus && lastFocus.focus(); });
    d.addEventListener("click", (e) => { if (e.target === d) d.close(); }); // backdrop click
    $$("[data-close]", d).forEach((b) => b.addEventListener("click", () => d.close()));
  });

  /* ---------- Application form ---------- */
  const form = $("#apply-form");
  if (!form) return;
  const status = $("#form-status");
  const submitBtn = $("#submit-btn");
  const seatsField = $("#seats-field");
  const seatsInput = $("#f-seats");
  const goal = $("#f-goal");
  const counter = $("#goal-count");

  // UTM + page URL hidden fields
  const qs = new URLSearchParams(location.search);
  ["utm_source", "utm_medium", "utm_campaign"].forEach((k) => {
    let v = qs.get(k);
    try { if (v) sessionStorage.setItem(k, v); else v = sessionStorage.getItem(k); } catch (_) {}
    if (v) form.elements[k].value = v.slice(0, 200);
  });
  form.elements.page_url.value = location.href.split("#")[0];

  // Applicant type ↔ seats field
  const typeMap = { individual: "individual", sponsored: "company_sponsored", company_sponsored: "company_sponsored", cohort: "cohort" };
  const syncSeats = () => {
    const cohort = form.elements.applicant_type.value === "cohort";
    seatsField.hidden = !cohort;
    seatsInput.required = cohort;
  };
  const setType = (t) => {
    const v = typeMap[t];
    if (!v) return;
    const r = form.querySelector(`input[name="applicant_type"][value="${v}"]`);
    if (r) { r.checked = true; syncSeats(); }
  };
  $$('input[name="applicant_type"]').forEach((r) => r.addEventListener("change", () => { syncSeats(); validateField("applicant_type"); }));
  if (qs.get("type")) setType(qs.get("type").toLowerCase());
  $$("[data-apply-type]").forEach((a) => a.addEventListener("click", () => setType(a.dataset.applyType)));

  // Character counter
  const updateCount = () => (counter.textContent = `${goal.value.length} / 500`);
  goal.addEventListener("input", updateCount);
  updateCount();

  // Validation
  const rules = {
    full_name: { el: "#f-name", err: "#e-name", test: (v) => v.trim().length >= 2, msg: "Please enter your full name." },
    work_email: { el: "#f-email", err: "#e-email", test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), msg: "Please enter a valid work email." },
    phone: { el: "#f-phone", err: "#e-phone", test: (v) => v.replace(/\D/g, "").length >= 10 && /^[+\d\s()-]+$/.test(v.trim()), msg: "Please enter a valid phone / WhatsApp number, e.g. +91 98765 43210." },
    company: { el: "#f-company", err: "#e-company", test: (v) => v.trim().length >= 2, msg: "Please enter your company." },
    role: { el: "#f-role", err: "#e-role", test: (v) => v.trim().length >= 2, msg: "Please enter your role or title." },
    linkedin_url: { el: "#f-li", err: "#e-li", test: (v) => /^(https?:\/\/)?([a-z]{2,3}\.)?linkedin\.com\/.+/i.test(v.trim()), msg: "Please paste your LinkedIn profile URL (linkedin.com/in/…)." },
    experience: { el: "#f-exp", err: "#e-exp", test: (v) => !!v, msg: "Please choose your outbound experience." },
    goals: { el: "#f-goal", err: "#e-goal", test: (v) => v.trim().length >= 10 && v.length <= 500, msg: "Please tell us a little more (10–500 characters)." },
  };
  const special = {
    applicant_type: { err: "#e-type", test: () => !!form.elements.applicant_type.value, msg: "Please choose how you're applying.", focus: () => form.querySelector('input[name="applicant_type"]') },
    seats: { err: "#e-seats", test: () => seatsField.hidden || (+seatsInput.value >= cfg.minSeats && Number.isInteger(+seatsInput.value)), msg: `Cohort pricing needs at least ${cfg.minSeats} seats from the same employer.`, focus: () => seatsInput },
    consent: { err: "#e-consent", test: () => form.elements.consent.checked, msg: "Please agree so we can contact you about your application.", focus: () => form.elements.consent },
    scope_ack: { err: "#e-scope", test: () => form.elements.scope_ack.checked, msg: "Please confirm you've read this.", focus: () => form.elements.scope_ack },
  };
  const setErr = (errSel, inputs, msg) => {
    $(errSel).textContent = msg || "";
    inputs.forEach((i) => i && i.setAttribute("aria-invalid", msg ? "true" : "false"));
  };
  function validateField(name) {
    if (rules[name]) {
      const r = rules[name], el = $(r.el), ok = r.test(el.value);
      setErr(r.err, [el], ok ? "" : r.msg);
      return ok ? null : el;
    }
    const s = special[name];
    const ok = s.test();
    const inputs = name === "applicant_type" ? $$('input[name="applicant_type"]') : [s.focus()];
    setErr(s.err, inputs, ok ? "" : s.msg);
    return ok ? null : s.focus();
  }
  Object.keys(rules).forEach((n) => {
    const el = $(rules[n].el);
    el.addEventListener("blur", () => { if (el.value || el.getAttribute("aria-invalid") === "true") validateField(n); });
    el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") validateField(n); });
  });
  ["consent", "scope_ack"].forEach((n) => form.elements[n].addEventListener("change", () => validateField(n)));
  seatsInput.addEventListener("input", () => validateField("seats"));

  const showStatus = (html) => { status.innerHTML = html; status.hidden = !html; };
  const escHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const collect = () => {
    const fd = new FormData(form);
    const data = {};
    fd.forEach((v, k) => { if (k !== "company_website" && k !== "form-name") data[k] = typeof v === "string" ? v.trim() : v; });
    if (seatsField.hidden) delete data.seats;
    data.consent = !!form.elements.consent.checked;
    data.scope_ack = !!form.elements.scope_ack.checked;
    data.marketing_optin = !!form.elements.marketing_optin.checked;
    data.submitted_at = new Date().toISOString();
    data.source = "gtm-bootcamp-landing";
    return data;
  };

  const send = async (data) => {
    const f = cfg.form || {};
    const provider = (f.provider || "").toLowerCase();
    if (provider === "netlify") {
      const body = new URLSearchParams({ "form-name": "bootcamp-apply", ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) });
      const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return;
    }
    if (provider && f.endpoint) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      const payload = { ...(f.extraFields || {}), ...data };
      if (provider === "web3forms") payload.subject = payload.subject || "New GTM Bootcamp application";
      const res = await fetch(f.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return;
    }
    // No backend configured yet: hand the application to the applicant's email app.
    const lines = Object.entries(data).map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`).join("\n");
    location.href = `mailto:${cfg.email}?subject=${encodeURIComponent("GTM Bootcamp application: " + data.full_name)}&body=${encodeURIComponent(lines)}`;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showStatus("");
    if (form.elements.company_website.value) return; // honeypot: silently drop bots

    const order = ["full_name", "work_email", "phone", "company", "role", "linkedin_url", "applicant_type", "seats", "experience", "goals", "consent", "scope_ack"];
    let firstBad = null;
    order.forEach((n) => { const bad = validateField(n); if (bad && !firstBad) firstBad = bad; });
    if (firstBad) {
      showStatus("Please fix the highlighted fields and try again.");
      firstBad.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-busy", "true");
    const lbl = $(".lbl", submitBtn), orig = lbl.textContent;
    lbl.textContent = "Submitting…";
    try {
      const data = collect();
      await send(data);
      track("apply_submit", { applicant_type: data.applicant_type, seats: data.seats || 1 });
      form.hidden = true;
      const thanks = $("#thanks");
      thanks.hidden = false;
      thanks.focus();
      thanks.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
    } catch (err) {
      showStatus(`Sorry, something went wrong sending your application. Please try again, or <a href="mailto:${escHtml(cfg.email)}">email us at ${escHtml(cfg.email)}</a>${cfg.whatsapp ? ` or <a href="${escHtml(cfg.whatsapp)}" target="_blank" rel="noopener">message us on WhatsApp</a>` : ""}.`);
      status.focus && status.setAttribute("tabindex", "-1");
      status.focus();
    } finally {
      submitBtn.disabled = false;
      submitBtn.removeAttribute("aria-busy");
      lbl.textContent = orig;
    }
  });
})();
