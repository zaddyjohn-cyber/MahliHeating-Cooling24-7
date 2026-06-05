/* Mahli Heating & Cooling 24/7 — interactions */
(function () {
  "use strict";

  /* ---------- Keep background + badge videos playing ---------- */
  (function videoResilience() {
    var vids = [].slice.call(document.querySelectorAll(".site-bg video"));
    function play() {
      vids.forEach(function (v) {
        v.muted = true;
        var p = v.play();
        if (p && p.catch) p.catch(function () {});
      });
    }
    play();
    // retry once everything is loaded and on the first user interaction
    window.addEventListener("load", play);
    ["pointerdown", "touchstart", "keydown"].forEach(function (ev) {
      window.addEventListener(ev, play, { once: true, passive: true });
    });
  })();

  /* ---------- 3D depth-field section backgrounds ---------- */
  (function build3DFields() {
    var rand = function (a, b) { return a + Math.random() * (b - a); };
    var pick = function (arr) { return arr[(Math.random() * arr.length) | 0]; };

    // Create one token <span> from a spec
    function token(spec) {
      var t = document.createElement("span");
      var cls = "tok tok-" + spec.type + " a-" + spec.anim;
      if (spec.mod) cls += " " + spec.mod;
      t.className = cls;
      var size = rand(spec.size[0], spec.size[1]);
      var z = rand(spec.z[0], spec.z[1]);
      // deeper tokens (more negative z) read fainter — atmospheric depth
      var depth = (z + 500) / 650;            // ~0 (far) .. ~1 (near)
      var op = spec.op[0] + (spec.op[1] - spec.op[0]) * depth;
      t.style.setProperty("--l", rand(spec.lpad || 3, 100 - (spec.lpad || 3)) + "%");
      t.style.setProperty("--t", rand(4, 96) + "%");
      t.style.setProperty("--size", size.toFixed(1) + "px");
      t.style.setProperty("--z", z.toFixed(0) + "px");
      t.style.setProperty("--op", op.toFixed(3));
      t.style.setProperty("--dur", rand(spec.dur[0], spec.dur[1]).toFixed(1) + "s");
      t.style.setProperty("--delay", (-rand(0, spec.dur[1])).toFixed(1) + "s");
      t.style.setProperty("--rot", rand(-40, 40).toFixed(0) + "deg");
      if (spec.anim === "float") {
        t.style.setProperty("--dx", rand(-40, 40).toFixed(0) + "px");
        t.style.setProperty("--dy", rand(-34, 34).toFixed(0) + "px");
      }
      return t;
    }

    function mount(sel, opts) {
      var sec = document.querySelector(sel);
      if (!sec) return;
      var field = document.createElement("div");
      field.className = "field3d";
      field.setAttribute("aria-hidden", "true");
      if (opts.grid) field.appendChild(Object.assign(document.createElement("div"), { className: "grid3d" }));
      opts.specs.forEach(function (spec) {
        for (var i = 0; i < spec.count; i++) field.appendChild(token(spec));
      });
      sec.insertBefore(field, sec.firstChild);

      // run animations only while the section is on-screen
      if (!("IntersectionObserver" in window)) { field.classList.add("run"); return; }
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { field.classList.toggle("run", e.isIntersecting); });
      }, { rootMargin: "120px 0px" });
      io.observe(sec);
    }

    // Reusable token recipes
    var ember  = { type: "ember",   anim: "rise",    size: [9, 26],   z: [-420, 90],  op: [0.06, 0.22], dur: [9, 17] };
    var crystal= { type: "crystal", anim: "fall",    size: [12, 24],  z: [-420, 70],  op: [0.08, 0.26], dur: [11, 19] };
    var ring   = { type: "ring",    anim: "float",   size: [54, 150], z: [-320, -40], op: [0.05, 0.13], dur: [10, 18] };
    var star   = { type: "star",    anim: "twinkle", size: [13, 30],  z: [-360, 60],  op: [0.10, 0.34], dur: [4, 8] };

    // HERO — warm + cool depth behind the headline (heating & cooling)
    mount(".hero", { specs: [
      Object.assign({}, ember,   { count: 11, op: [0.05, 0.20], lpad: 2 }),
      Object.assign({}, crystal, { count: 8,  op: [0.05, 0.18], lpad: 2 })
    ]});

    // EMERGENCY — rising heat sparks over the flame band
    mount(".emergency", { specs: [
      Object.assign({}, ember, { count: 14, mod: "spark", size: [6, 16], op: [0.12, 0.42], dur: [6, 12] })
    ]});

    // SERVICES — the full mix: embers, crystals + airflow rings
    mount("#services", { specs: [
      Object.assign({}, ember,   { count: 9 }),
      Object.assign({}, crystal, { count: 9 }),
      Object.assign({}, ring,    { count: 3 })
    ]});

    // WHY US (navy) — premium warm + cool glow orbs with sparks
    mount("#why", { specs: [
      { type: "orb", anim: "float", mod: "warm", count: 2, size: [240, 430], z: [-300, -120], op: [0.22, 0.34], dur: [14, 22] },
      { type: "orb", anim: "float", mod: "cool", count: 2, size: [240, 430], z: [-300, -120], op: [0.24, 0.38], dur: [16, 24] },
      Object.assign({}, ember, { count: 9, op: [0.18, 0.4] })
    ]});

    // SERVICE AREA — 3D map floor + pulsing location pings
    mount("#area", { grid: true, specs: [
      { type: "ping", anim: "ping", count: 8, size: [8, 14], z: [-220, 40], op: [0.4, 0.85], dur: [2.4, 4.2] },
      Object.assign({}, ring, { count: 2, op: [0.05, 0.1] })
    ]});

    // REVIEWS — floating gold rating stars
    mount("#reviews", { specs: [
      Object.assign({}, star,  { count: 11 }),
      Object.assign({}, ember, { count: 4, op: [0.04, 0.14] })
    ]});

    // PLANS — gentle warm/cool mix
    mount("#plans", { specs: [
      Object.assign({}, ember,   { count: 5, op: [0.05, 0.16] }),
      Object.assign({}, crystal, { count: 5, op: [0.06, 0.18] }),
      Object.assign({}, ring,    { count: 2 })
    ]});

    // FAQ — calm cool crystals
    mount("#faq", { specs: [
      Object.assign({}, crystal, { count: 8, op: [0.06, 0.2] }),
      Object.assign({}, ring,    { count: 2 })
    ]});

    // CONTACT (navy) — airflow rings + warm/cool orbs + sparks
    mount("#contact", { specs: [
      { type: "orb", anim: "float", mod: "warm", count: 1, size: [260, 420], z: [-300, -140], op: [0.2, 0.3], dur: [16, 22] },
      { type: "orb", anim: "float", mod: "cool", count: 2, size: [240, 420], z: [-300, -140], op: [0.22, 0.34], dur: [16, 24] },
      Object.assign({}, ring,  { count: 4, mod: "light", op: [0.1, 0.22] }),
      Object.assign({}, ember, { count: 6, op: [0.14, 0.34] })
    ]});
  })();

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobileMenu");
  var scrim = document.getElementById("scrim");
  var close = document.getElementById("menuClose");

  function openMenu() {
    menu.classList.add("open");
    scrim.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
  }
  function closeMenu() {
    menu.classList.remove("open");
    scrim.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
  }
  burger.addEventListener("click", openMenu);
  close.addEventListener("click", closeMenu);
  scrim.addEventListener("click", closeMenu);
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- Contact form ---------- */
  var form = document.getElementById("quoteForm");
  var success = document.getElementById("formSuccess");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      form.style.display = "none";
      success.classList.add("show");
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }
})();
