/* ===== Abschlussarbeiten-Portal RH Köln ===== */

let theses = [];
let filtered = [];

const ADMIN_PASSWORD = "bümsmischdutiga"; // Bitte später ändern!

// ---------- DOM Elements ----------
const listEl = document.getElementById("thesis-list");
const countEl = document.getElementById("results-count");
const emptyEl = document.getElementById("empty-state");
const detailModal = document.getElementById("detail-modal");
const detailBody = document.getElementById("detail-body");
const adminModal = document.getElementById("admin-modal");
const adminLogin = document.getElementById("admin-login");
const adminPanel = document.getElementById("admin-panel");

// Filter elements
const filterType = document.getElementById("filter-type");
const filterStatus = document.getElementById("filter-status");
const filterStudiengang = document.getElementById("filter-studiengang");
const filterUnternehmen = document.getElementById("filter-unternehmen");
const filterSearch = document.getElementById("filter-search");

// ---------- Init ----------
async function init() {
  try {
    const res = await fetch("theses.json");
    theses = await res.json();
  } catch (e) {
    console.warn("theses.json konnte nicht geladen werden – verwende leere Liste.");
    theses = [];
  }

  populateFilterOptions();
  applyFilters();
  bindEvents();
}

function populateFilterOptions() {
  // Studiengänge
  const studiengaenge = [...new Set(theses.map(t => t.studiengang).filter(Boolean))].sort();
  filterStudiengang.innerHTML = '<option value="">Alle</option>' +
    studiengaenge.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");

  // Unternehmen (nur wenn vorhanden)
  const unternehmen = [...new Set(theses.map(t => t.unternehmen).filter(u => u && u.trim()))].sort();
  filterUnternehmen.innerHTML = '<option value="">Alle</option>' +
    unternehmen.map(u => `<option value="${escapeHtml(u)}">${escapeHtml(u)}</option>`).join("");
}

// ---------- Filtering ----------
function applyFilters() {
  const type = filterType.value;
  const status = filterStatus.value;
  const studiengang = filterStudiengang.value;
  const unternehmen = filterUnternehmen.value;
  const search = filterSearch.value.trim().toLowerCase();

  filtered = theses.filter(t => {
    if (type && t.art !== type) return false;
    if (status && t.status !== status) return false;
    if (studiengang && t.studiengang !== studiengang) return false;
    if (unternehmen && t.unternehmen !== unternehmen) return false;

    if (search) {
      const haystack = [
        t.titel,
        t.kurzbeschreibung,
        t.beschreibung,
        t.methodik,
        t.betreuer,
        t.unternehmen,
        t.keywords?.join(" "),
        t.voraussetzungen
      ].join(" ").toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  renderList();
}

function renderList() {
  countEl.textContent = `${filtered.length} Thema${filtered.length === 1 ? "" : "en"}`;

  if (filtered.length === 0) {
    listEl.innerHTML = "";
    emptyEl.classList.remove("hidden");
    return;
  }

  emptyEl.classList.add("hidden");
  listEl.innerHTML = filtered.map(t => createCard(t)).join("");
}

function createCard(t) {
  const statusClass = t.status.toLowerCase().replace(/\s+/g, "-");
  const keywords = (t.keywords || []).map(k =>
    `<span class="keyword">${escapeHtml(k)}</span>`
  ).join("");

  return `
    <article class="thesis-card status-${statusClass}" data-id="${t.id}">
      <div class="card-top">
        <span class="badge badge-type">${escapeHtml(t.art)}</span>
        <span class="badge badge-status ${statusClass}">${escapeHtml(t.status)}</span>
      </div>
      <h3 class="card-title">${escapeHtml(t.titel)}</h3>
      <div class="card-meta">
        <span>📚 ${escapeHtml(t.studiengang)}</span>
        <span>👤 ${escapeHtml(t.betreuer)}</span>
        ${t.unternehmen ? `<span>🏢 ${escapeHtml(t.unternehmen)}</span>` : ""}
        ${t.beginn ? `<span>🗓 ${escapeHtml(t.beginn)}</span>` : ""}
      </div>
      ${keywords ? `<div class="card-keywords">${keywords}</div>` : ""}
    </article>
  `;
}

// ---------- Detail Modal ----------
function showDetail(id) {
  const t = theses.find(x => x.id === id);
  if (!t) return;

  const keywords = (t.keywords || []).map(k =>
    `<span class="keyword">${escapeHtml(k)}</span>`
  ).join(" ");

  detailBody.innerHTML = `
    <div class="detail-header">
      <div class="card-top">
        <span class="badge badge-type">${escapeHtml(t.art)}</span>
        <span class="badge badge-status ${t.status.toLowerCase().replace(/\s+/g, "-")}">${escapeHtml(t.status)}</span>
      </div>
      <h2 class="detail-title">${escapeHtml(t.titel)}</h2>
    </div>

    <div class="detail-section">
      <h3>Kurzbeschreibung</h3>
      <p>${escapeHtml(t.kurzbeschreibung)}</p>
    </div>

    ${t.beschreibung ? `
    <div class="detail-section">
      <h3>Detaillierte Beschreibung</h3>
      <p>${escapeHtml(t.beschreibung)}</p>
    </div>` : ""}

    <div class="detail-section">
      <h3>Empfohlene Methodik</h3>
      <p>${escapeHtml(t.methodik || "—")}</p>
    </div>

    <div class="detail-grid">
      <div class="detail-section">
        <h3>Studiengang</h3>
        <p>${escapeHtml(t.studiengang)}</p>
      </div>
      <div class="detail-section">
        <h3>Betreuer:in</h3>
        <p>${escapeHtml(t.betreuer)}</p>
      </div>
      ${t.unternehmen ? `
      <div class="detail-section">
        <h3>Unternehmen</h3>
        <p>${escapeHtml(t.unternehmen)}</p>
      </div>` : ""}
      <div class="detail-section">
        <h3>Ort / Arbeitsweise</h3>
        <p>${escapeHtml(t.ort || "—")}</p>
      </div>
      <div class="detail-section">
        <h3>Beginn / Zeitraum</h3>
        <p>${escapeHtml(t.beginn || "—")}</p>
      </div>
      <div class="detail-section">
        <h3>Umfang / Dauer</h3>
        <p>${escapeHtml(t.umfang || "—")}</p>
      </div>
      <div class="detail-section">
        <h3>Sprache</h3>
        <p>${escapeHtml(t.sprache || "Deutsch")}</p>
      </div>
      <div class="detail-section">
        <h3>Vergütung</h3>
        <p>${escapeHtml(t.verguetung || "—")}</p>
      </div>
    </div>

    ${t.voraussetzungen ? `
    <div class="detail-section">
      <h3>Voraussetzungen</h3>
      <p>${escapeHtml(t.voraussetzungen)}</p>
    </div>` : ""}

    ${t.bewerbung ? `
    <div class="detail-section">
      <h3>Bewerbung</h3>
      <p>${escapeHtml(t.bewerbung)}</p>
    </div>` : ""}

    <div class="detail-section">
      <h3>Kontakt</h3>
      <p><a href="mailto:${escapeHtml(t.kontakt)}">${escapeHtml(t.kontakt)}</a></p>
    </div>

    ${keywords ? `
    <div class="detail-section">
      <h3>Schlagworte</h3>
      <div class="card-keywords">${keywords}</div>
    </div>` : ""}
  `;

  detailModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModals() {
  detailModal.classList.add("hidden");
  adminModal.classList.add("hidden");
  document.body.style.overflow = "";
}

// ---------- Admin ----------
function openAdmin() {
  adminLogin.classList.remove("hidden");
  adminPanel.classList.add("hidden");
  document.getElementById("admin-password").value = "";
  adminModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function loginAdmin() {
  const pw = document.getElementById("admin-password").value;
  if (pw === ADMIN_PASSWORD) {
    adminLogin.classList.add("hidden");
    adminPanel.classList.remove("hidden");
  } else {
    alert("Falsches Passwort.");
  }
}

function handleFormSubmit(e) {
  e.preventDefault();

  const newThesis = {
    id: String(Date.now()),
    titel: document.getElementById("f-titel").value.trim(),
    art: document.getElementById("f-art").value,
    studiengang: document.getElementById("f-studiengang").value.trim(),
    kurzbeschreibung: document.getElementById("f-kurzbeschreibung").value.trim(),
    beschreibung: document.getElementById("f-beschreibung").value.trim(),
    methodik: document.getElementById("f-methodik").value.trim(),
    betreuer: document.getElementById("f-betreuer").value.trim(),
    kontakt: document.getElementById("f-kontakt").value.trim(),
    unternehmen: document.getElementById("f-unternehmen").value.trim(),
    ort: document.getElementById("f-ort").value.trim(),
    beginn: document.getElementById("f-beginn").value.trim(),
    umfang: document.getElementById("f-umfang").value.trim(),
    voraussetzungen: document.getElementById("f-voraussetzungen").value.trim(),
    keywords: document.getElementById("f-keywords").value
      .split(",")
      .map(k => k.trim())
      .filter(Boolean),
    sprache: document.getElementById("f-sprache").value,
    verguetung: document.getElementById("f-verguetung").value.trim(),
    bewerbung: document.getElementById("f-bewerbung").value.trim(),
    status: document.getElementById("f-status").value,
    eintragsdatum: new Date().toISOString().slice(0, 10),
    aktualisiert: new Date().toISOString().slice(0, 10)
  };

  // Add to current data
  theses.unshift(newThesis);
  populateFilterOptions();
  applyFilters();

  // Download updated JSON
  downloadJSON(theses);

  // Reset form
  document.getElementById("thesis-form").reset();
  alert("Thema gespeichert! Die aktualisierte theses.json wurde heruntergeladen.\nBitte diese Datei im GitHub-Repository ersetzen und committen.");
}

function downloadJSON(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "theses.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Helpers ----------
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- Events ----------
function bindEvents() {
  // Filters
  [filterType, filterStatus, filterStudiengang, filterUnternehmen].forEach(el => {
    el.addEventListener("change", applyFilters);
  });
  filterSearch.addEventListener("input", applyFilters);

  document.getElementById("btn-reset-filters").addEventListener("click", () => {
    filterType.value = "";
    filterStatus.value = "";
    filterStudiengang.value = "";
    filterUnternehmen.value = "";
    filterSearch.value = "";
    applyFilters();
  });

  // Cards → Detail
  listEl.addEventListener("click", e => {
    const card = e.target.closest(".thesis-card");
    if (card) showDetail(card.dataset.id);
  });

  // Modal close
  document.querySelectorAll(".modal-close, .modal-backdrop").forEach(el => {
    el.addEventListener("click", closeModals);
  });

  // Admin
  document.getElementById("btn-admin").addEventListener("click", openAdmin);
  document.getElementById("btn-login").addEventListener("click", loginAdmin);
  document.getElementById("admin-password").addEventListener("keydown", e => {
    if (e.key === "Enter") loginAdmin();
  });

  document.getElementById("thesis-form").addEventListener("submit", handleFormSubmit);
  document.getElementById("btn-export").addEventListener("click", () => downloadJSON(theses));

  // ESC closes modals
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModals();
  });
}

// Start
init();
