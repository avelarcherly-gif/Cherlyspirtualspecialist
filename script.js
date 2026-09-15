/* ============================================================
   Cheryl Spiritual Guidance — script.js
   Form submissions go to Telegram via Netlify function.
   Secrets live in Netlify env vars — never in this file.
   ============================================================ */

/* ================= LOADER ================= */
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("loader").classList.add("hidden"), 1800);
});

/* ================= THEME (LIGHT / DARK) ================= */
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light");
    themeToggle.textContent = "☀️";
  } else {
    document.body.classList.remove("light");
    themeToggle.textContent = "🌙";
  }
}

const savedTheme = localStorage.getItem("theme") ||
  (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {
  const newTheme = document.body.classList.contains("light") ? "dark" : "light";
  localStorage.setItem("theme", newTheme);
  applyTheme(newTheme);
});

/* ================= MOBILE MENU ================= */
const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");

hamburger.addEventListener("click", () => menu.classList.toggle("active"));
hamburger.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") menu.classList.toggle("active");
});

menu.querySelectorAll("a").forEach(link =>
  link.addEventListener("click", () => menu.classList.remove("active"))
);

/* ================= SMOOTH SCROLL ================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

/* ================= "BOOK NOW" PREFILLS SERVICE ================= */
document.querySelectorAll(".book-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const serviceName = btn.dataset.service;
    const select = document.getElementById("serviceSelect");
    [...select.options].forEach(opt => {
      if (opt.text.startsWith(serviceName)) select.value = opt.text;
    });
  });
});

/* ================= SCROLL REVEAL ================= */
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
  const windowHeight = window.innerHeight;
  reveals.forEach(el => {
    if (el.getBoundingClientRect().top < windowHeight - 120) {
      el.classList.add("active");
    }
  });
}
window.addEventListener("scroll", revealOnScroll);
document.addEventListener("DOMContentLoaded", revealOnScroll);

/* ================= BACK TO TOP ================= */
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  backToTop.style.display = window.scrollY > 300 ? "block" : "none";
});
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ================= BOOKING FORM → TELEGRAM (via Netlify Function) ================= */
const bookingForm = document.getElementById("bookingForm");
const formStatus = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");

bookingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = new FormData(bookingForm);

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending… ✨";
  formStatus.style.display = "block";
  formStatus.style.color = "var(--accent)";
  formStatus.textContent = "Sending your request…";

  try {
    const res = await fetch("/.netlify/functions/send-telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        contact: data.get("contact"),
        service: data.get("service"),
        message: data.get("message"),
        website: data.get("website") || "", // honeypot — humans never fill this
      }),
    });

    const result = await res.json();

    if (result.ok) {
      formStatus.textContent = "✅ Your request has been sent! Cheryl will respond soon.";
      formStatus.style.color = "#25D366";
      bookingForm.reset();
    } else {
      throw new Error(result.error || "Send failed");
    }
  } catch (err) {
    formStatus.textContent = "⚠️ Could not send. Please WhatsApp us at +1 (778) 608 2072.";
    formStatus.style.color = "#ff6b6b";
    console.error("Form error:", err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Request ✨";
  }
});

/* ================= LIVE ACTIVITY POPUP ================= */
const names = ["Sarah","Michael","Ada","James","Stacy","Daniel","Blessing","Emma","John","Fatima","David","Sophia","Chris","Aisha"];
const locations = ["London","Texas","Illinois","Manchester","Dublin","New York","Toronto","Dubai","Birmingham","Miami"];
const services = [
  "Love Attraction session 💜","Relationship Guidance","Psychic Reading 🔮",
  "Energy Cleansing","Love Reconnection","Custom Love Alignment",
  "Spiritual Consultation","Healing Session"
];

const popup = document.getElementById("live-activity");

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function showActivity() {
  const name = randomItem(names);
  const location = randomItem(locations);
  const service = randomItem(services);

  const actions = [
    `<strong>${name}</strong> from ${location} just booked a ${service}`,
    `<strong>${name}</strong> from ${location} requested ${service}`,
    `<strong>${name}</strong> from ${location} is currently chatting now`,
    `<strong>${name}</strong> from ${location} just completed a session`,
    `New client from ${location} just joined for ${service}`
  ];

  popup.innerHTML = randomItem(actions);
  popup.style.display = "block";
  setTimeout(() => { popup.style.display = "none"; }, 4000);
}

function startActivityLoop() {
  const delay = Math.random() * 10000 + 12000;
  setTimeout(() => { showActivity(); startActivityLoop(); }, delay);
}
setTimeout(() => { showActivity(); startActivityLoop(); }, 7000);
