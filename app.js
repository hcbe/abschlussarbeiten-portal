/* ===== Abschlussarbeiten-Portal RH Köln ===== */
/* Vollständige webbasierte Verwaltung – keine manuelle JSON-Bearbeitung nötig */

let theses = [];
let filtered = [];
let editingId = null; // null = neues Thema, sonst ID des zu bearbeitenden Themas

const ADMIN_PASSWORD = "tetik2.0"; // Bitte später ändern!
const STORAGE_KEY = "rh-koeln-theses";

// ---------- DOM Elements ----------
const listEl = document.getElementById("thesis-list");
const countEl = document.getElementById("results-count");
const emptyEl = document.getElementById("empty-state");
const detailModal = document.getElementById("detail-modal");
const detailBody = document.getElementById("detail-body");
const adminModal = document.getElementById("admin-modal");
const infoModal = document.getElementById("info-modal");
const adminLogin = document.getElementById("admin-login");
const adminPanel = document.getElementById("admin-panel");
const adminThesisList = document.getElementById("admin-thesis-list");
const formTitle = document.getElementById("form-title");

// Filter elements
const filterType = document.getElementById("filter-type");
const filterStatus = document.getElementById("filter-status");
const filterStudiengang = document.getElementById("filter-studiengang");
const filterUnternehmen = document.getElementById("filter-unternehmen");
const filterSearch = document.getElementById("filter-search");

// ---------- Init ----------
async function init() {
  // 1. Versuche localStorage (Änderungen aus Admin)
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      theses = JSON.parse(stored);
      console.log("Daten aus localStorage geladen");
    } catch (e) {
      console.warn("localStorage ungültig");
    }
  }

  // 2. Falls leer → theses.json laden
  if (!theses || theses.length === 0) {
    try {
      const res = await fetch("theses.json");
      theses = await res.json();
      saveToStorage(); // initial speichern
    } catch (e) {
      console.warn("theses.json konnte nicht geladen werden – leere Liste.");
      theses = [];
    }
  }

  populateFilterOptions();
  applyFilters();
  bindEvents();
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theses));
}

function populateFilterOptions() {
  const studiengaenge = [...new Set(theses.map(t => t.studiengang).filter(Boolean))].sort();
  filterStudiengang.innerHTML = '<option value="">Alle</option>' +
    studiengaenge.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");

  const unternehmen = [...new Set(theses.map(t => t.unternehmen).filter(u => u && u.trim()))].sort();
  filterUnternehmen.innerHTML = '<option value="">Alle</option>' +
    unternehmen.map(u => `<option value="${escapeHtml(u)}">${escapeHtml(u)}</option>`).join("");
}

// ---------- Filtering & Public List ----------
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
        t.titel, t.kurzbeschreibung, t.beschreibung, t.methodik,
        t.betreuer, t.unternehmen, (t.keywords || []).join(" "), t.voraussetzungen
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
  const statusClass = (t.status || "").toLowerCase().replace(/\s+/g, "-");
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
        <span class="badge badge-status ${(t.status || "").toLowerCase().replace(/\s+/g, "-")}">${escapeHtml(t.status)}</span>
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
  if (infoModal) infoModal.classList.add("hidden");
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
    switchTab("list");
    renderAdminList();
  } else {
    alert("Falsches Passwort.");
  }
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });
  document.getElementById("tab-list").classList.toggle("hidden", tabName !== "list");
  document.getElementById("tab-form").classList.toggle("hidden", tabName !== "form");
}

function renderAdminList() {
  if (theses.length === 0) {
    adminThesisList.innerHTML = "<p class='hint'>Noch keine Themen vorhanden.</p>";
    return;
  }

  adminThesisList.innerHTML = theses.map(t => {
    const statusClass = (t.status || "").toLowerCase().replace(/\s+/g, "-");
    return `
      <div class="admin-item status-${statusClass}">
        <div class="admin-item-info">
          <div class="admin-item-title">${escapeHtml(t.titel)}</div>
          <div class="admin-item-meta">
            <span>${escapeHtml(t.art)}</span>
            <span>${escapeHtml(t.status)}</span>
            <span>${escapeHtml(t.studiengang)}</span>
            ${t.unternehmen ? `<span>🏢 ${escapeHtml(t.unternehmen)}</span>` : ""}
          </div>
        </div>
        <div class="admin-item-actions">
          <button type="button" class="btn-sm btn-edit" data-edit="${t.id}">Bearbeiten</button>
          <button type="button" class="btn-sm btn-delete" data-delete="${t.id}">Löschen</button>
        </div>
      </div>
    `;
  }).join("");
}

function startNewThesis() {
  editingId = null;
  document.getElementById("thesis-form").reset();
  document.getElementById("f-id").value = "";
  formTitle.textContent = "Neues Thema eintragen";
  switchTab("form");
}

function startEditThesis(id) {
  const t = theses.find(x => x.id === id);
  if (!t) return;

  editingId = id;
  document.getElementById("f-id").value = id;
  document.getElementById("f-titel").value = t.titel || "";
  document.getElementById("f-art").value = t.art || "Bachelorthesis";
  document.getElementById("f-studiengang").value = t.studiengang || "";
  document.getElementById("f-status").value = t.status || "Verfügbar";
  document.getElementById("f-kurzbeschreibung").value = t.kurzbeschreibung || "";
  document.getElementById("f-beschreibung").value = t.beschreibung || "";
  document.getElementById("f-methodik").value = t.methodik || "";
  document.getElementById("f-betreuer").value = t.betreuer || "";
  document.getElementById("f-kontakt").value = t.kontakt || "";
  document.getElementById("f-unternehmen").value = t.unternehmen || "";
  document.getElementById("f-ort").value = t.ort || "";
  document.getElementById("f-beginn").value = t.beginn || "";
  document.getElementById("f-umfang").value = t.umfang || "";
  document.getElementById("f-voraussetzungen").value = t.voraussetzungen || "";
  document.getElementById("f-keywords").value = (t.keywords || []).join(", ");
  document.getElementById("f-sprache").value = t.sprache || "Deutsch";
  document.getElementById("f-verguetung").value = t.verguetung || "";
  document.getElementById("f-bewerbung").value = t.bewerbung || "";

  formTitle.textContent = "Thema bearbeiten";
  switchTab("form");
}

function deleteThesis(id) {
  if (!confirm("Dieses Thema wirklich löschen?")) return;
  theses = theses.filter(t => t.id !== id);
  saveToStorage();
  populateFilterOptions();
  applyFilters();
  renderAdminList();
}

function handleFormSubmit(e) {
  e.preventDefault();

  const data = {
    id: editingId || String(Date.now()),
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
    eintragsdatum: editingId
      ? (theses.find(t => t.id === editingId)?.eintragsdatum || new Date().toISOString().slice(0, 10))
      : new Date().toISOString().slice(0, 10),
    aktualisiert: new Date().toISOString().slice(0, 10)
  };

  if (editingId) {
    const idx = theses.findIndex(t => t.id === editingId);
    if (idx !== -1) theses[idx] = data;
  } else {
    theses.unshift(data);
  }

  saveToStorage();
  populateFilterOptions();
  applyFilters();
  renderAdminList();

  // Formular zurücksetzen und zur Liste
  document.getElementById("thesis-form").reset();
  editingId = null;
  formTitle.textContent = "Neues Thema eintragen";
  switchTab("list");

  alert("Thema gespeichert (lokal). Zum Veröffentlichen auf GitHub: JSON exportieren und theses.json ersetzen.");
}

function downloadJSON() {
  const blob = new Blob([JSON.stringify(theses, null, 2)], { type: "application/json" });
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

  // Info Lightbox
  document.getElementById("btn-info").addEventListener("click", () => {
    infoModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });

  // Admin
  document.getElementById("btn-admin").addEventListener("click", openAdmin);
  document.getElementById("btn-login").addEventListener("click", loginAdmin);
  document.getElementById("admin-password").addEventListener("keydown", e => {
    if (e.key === "Enter") loginAdmin();
  });

  // Tabs
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // New / Export
  document.getElementById("btn-new-thesis").addEventListener("click", startNewThesis);
  document.getElementById("btn-export").addEventListener("click", downloadJSON);

  // Form
  document.getElementById("thesis-form").addEventListener("submit", handleFormSubmit);
  document.getElementById("btn-cancel-edit").addEventListener("click", () => {
    document.getElementById("thesis-form").reset();
    editingId = null;
    formTitle.textContent = "Neues Thema eintragen";
    switchTab("list");
  });

  // Admin list actions (event delegation)
  adminThesisList.addEventListener("click", e => {
    const editBtn = e.target.closest("[data-edit]");
    const delBtn = e.target.closest("[data-delete]");
    if (editBtn) startEditThesis(editBtn.dataset.edit);
    if (delBtn) deleteThesis(delBtn.dataset.delete);
  });

  // ESC
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModals();
  });
}

// Start
init();
