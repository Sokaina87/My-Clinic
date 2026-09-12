// ========== CONFIG ==========
const API = "http://localhost:8080/api";
const AI_API = "http://localhost:8000";

// ========== DATA ==========
const patients = [
  { id: "a1", name: "Sofia Martin", priority: "high", symptoms: "Essoufflement persistant", follow_up_due: "overdue", last_consultation: "08/09/2026" },
  { id: "a2", name: "Lucas Bernard", priority: "medium", symptoms: "Fièvre depuis 3 jours", follow_up_due: "today", last_consultation: "07/09/2026" },
  { id: "a3", name: "Emma Leroy", priority: "low", symptoms: "Suivi traitement", follow_up_due: "none", last_consultation: "01/09/2026" },
];

const appointments = [
  "09:00 — Sofia Martin",
  "10:30 — Lucas Bernard",
  "14:00 — Emma Leroy",
  "16:15 — Ahmed Benali"
];

const pageTitles = {
  dashboard: "Vue d'ensemble",
  calendar: "Calendrier médical",
  patients: "Dossiers patients",
  triage: "Analyse des symptômes",
  "follow-up": "Suivi post-consultation",
  assistant: "Assistant médecin",
  "my-appointments": "Mes rendez-vous",
  "my-health": "Mon suivi santé",
  "my-records": "Mes dossiers",
  "patient-assistant": "Assistance patient"
};

// ========== STATE ==========
let currentRole = "doctor";
let currentPage = "dashboard";

// ========== UTILITY FUNCTIONS ==========
const escapeHtml = (value = "") => 
  String(value).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));

const formatDate = () => {
  const days = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
  const d = new Date();
  return `${days[d.getDay()]} ${d.getDate()} SEPTEMBRE ${d.getFullYear()}`;
};

// ========== API FUNCTIONS ==========
async function api(path, options = {}) {
  const bases = path.startsWith("/ai/") ? [API, AI_API] : [API];
  for (const base of bases) {
    try {
      const response = await fetch(`${base}${path}`, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options
      });
      const payload = response.status === 204 ? null : await response.json().catch(() => null);
      if (!response.ok) {
        if ([502, 503, 504].includes(response.status) && base === API) continue;
        throw new Error(payload?.detail || payload?.message || `Le service a répondu ${response.status}`);
      }
      return payload;
    } catch (error) {
      if (error instanceof TypeError && base === API) continue;
      console.error("API Error:", error);
      throw error;
    }
  }
  throw new Error("Le service IA est indisponible. Démarrez-le sur le port 8000.");
}

// ========== UI FUNCTIONS ==========
function setNotice(target, message, level = "info") {
  target.innerHTML = `<div class="notice ${level}">${escapeHtml(message)}</div>`;
}

function navigate(page) {
  location.hash = `#${page}`;
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "flex";
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
}

function renderPatientRow(p) {
  return `
    <div class="patient-row">
      <div class="patient-avatar">${escapeHtml(p.name.split(" ").map(n => n[0]).join(""))}</div>
      <div class="patient-info" style="flex: 1;">
        <div class="patient-name">${escapeHtml(p.name)}</div>
        <div class="patient-detail">${escapeHtml(p.symptoms)}</div>
      </div>
      <span class="badge ${p.priority}">${p.priority.toUpperCase()}</span>
    </div>
  `;
}

function renderAppointmentRow(appointment) {
  return `
    <div class="patient-row">
      <div class="patient-avatar">📅</div>
      <div class="patient-info">
        <div class="patient-name">${escapeHtml(appointment)}</div>
        <div class="patient-detail">Consultation programmée</div>
      </div>
    </div>
  `;
}

// ========== PAGE RENDERERS ==========
function renderDashboard() {
  const content = document.getElementById("page-content");
  const template = document.getElementById("dashboard-template");
  content.innerHTML = template.innerHTML;

  // Load priority list
  const priorityList = document.getElementById("priority-list");
  priorityList.innerHTML = patients
    .filter(p => p.priority !== "low")
    .map(renderPatientRow)
    .join("");

  // Load appointment list
  const appointmentList = document.getElementById("appointment-list");
  appointmentList.innerHTML = appointments
    .map(renderAppointmentRow)
    .join("");
}

function renderCalendar() {
  const content = document.getElementById("page-content");
  const template = document.getElementById("calendar-template");
  content.innerHTML = template.innerHTML;

  const calendarGrid = document.getElementById("calendar-grid");
  const days = ["Lun 7", "Mar 8", "Mer 9", "Jeu 10", "Ven 11"];
  calendarGrid.innerHTML = days.map((day, i) => `
    <div class="calendar-slot">
      <strong>${day}</strong>
      <span>${i === 3 ? "09:00 Sofia Martin" : `${i + 1} rendez-vous`}</span>
      ${i === 3 ? "<span>10:30 Lucas Bernard</span><span>14:00 Emma Leroy</span>" : ""}
    </div>
  `).join("");

  // Handle form submission
  const form = document.getElementById("appointment-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const result = document.getElementById("appointment-result");
      try {
        await api("/appointments", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });
        setNotice(result, "Rendez-vous créé avec succès !", "success");
        form.reset();
      } catch (error) {
        setNotice(result, `Erreur : ${error.message}`, "critical");
      }
    });
  }
}

function renderPatients() {
  const content = document.getElementById("page-content");
  const template = document.getElementById("patients-template");
  content.innerHTML = template.innerHTML;

  // Load patient list
  const patientList = document.getElementById("patient-list");
  patientList.innerHTML = patients.map(renderPatientRow).join("");

  // Handle patient search
  const searchInput = document.getElementById("patient-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      patientList.innerHTML = patients
        .filter(p => p.name.toLowerCase().includes(query))
        .map(renderPatientRow)
        .join("");
    });
  }

  // Handle patient registration
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const result = document.getElementById("register-result");
      try {
        const data = Object.fromEntries(new FormData(registerForm));
        if (!data.birthDate) delete data.birthDate;
        if (!data.gender) delete data.gender;
        const patient = await api("/patients", {
          method: "POST",
          body: JSON.stringify(data)
        });
        setNotice(result, `Dossier créé pour ${patient.firstName} ${patient.lastName}.`, "success");
        registerForm.reset();
        closeModal("new-patient");
      } catch (error) {
        setNotice(result, `Erreur : ${error.message}`, "critical");
      }
    });
  }

  // Handle summary generation
  const summaryForm = document.getElementById("summary-form");
  if (summaryForm) {
    summaryForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const result = document.getElementById("summary-result");
      try {
        const data = await api("/ai/summary", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(new FormData(summaryForm)))
        });
        setNotice(result, data.summary, "info");
      } catch (error) {
        setNotice(result, `Erreur : ${error.message}`, "critical");
      }
    });

    const extractBtn = document.getElementById("extract-btn");
    if (extractBtn) {
      extractBtn.addEventListener("click", async () => {
        const result = document.getElementById("summary-result");
        const text = summaryForm.text.value.trim();
        if (!text) {
          setNotice(result, "Saisissez d'abord des notes de consultation.", "medium");
          return;
        }
        try {
          const data = await api("/ai/extract", {
            method: "POST",
            body: JSON.stringify({ text })
          });
          const c = data.content;
          const message = `
            Médicaments : ${c.medications.join(", ") || "aucun détecté"}
            Allergies : ${c.allergies.join(", ") || "aucune détectée"}
            Dates : ${c.dates.join(", ") || "aucune détectée"}
            À valider par un professionnel.
          `;
          setNotice(result, message, "info");
        } catch (error) {
          setNotice(result, `Erreur : ${error.message}`, "critical");
        }
      });
    }
  }
}

function renderTriage() {
  const content = document.getElementById("page-content");
  const template = document.getElementById("triage-template");
  content.innerHTML = template.innerHTML;

  const form = document.getElementById("triage-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const result = document.getElementById("triage-result");
      try {
        const data = await api("/ai/triage", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });
        const flagsText = data.red_flags && data.red_flags.length 
          ? `<br><br><strong>Signaux d'alerte :</strong> ${escapeHtml(data.red_flags.join(", "))}`
          : "";
        result.innerHTML = `
          <div class="notice ${data.urgency}">
            <strong>Priorité : ${data.urgency.toUpperCase()}</strong><br>
            ${escapeHtml(data.recommendation)}
            ${flagsText}
            <p class="disclaimer">${escapeHtml(data.disclaimer)}</p>
          </div>
        `;
      } catch (error) {
        setNotice(result, `Erreur : ${error.message}`, "critical");
      }
    });
  }
}

function renderAssistant() {
  const content = document.getElementById("page-content");
  const template = document.getElementById("assistant-template");
  content.innerHTML = template.innerHTML;

  const form = document.getElementById("assistant-form");
  const chat = document.getElementById("chat");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const question = form.question.value;
      
      // Add user message
      chat.insertAdjacentHTML("beforeend", `
        <div class="message me">
          <span>${escapeHtml(question)}</span>
        </div>
      `);
      
      form.reset();

      try {
        const data = await api("/ai/doctor-assistant", {
          method: "POST",
          body: JSON.stringify({ question, patients })
        });
        chat.insertAdjacentHTML("beforeend", `
          <div class="message assistant-message">
            <span>${escapeHtml(data.answer)}</span>
          </div>
        `);
      } catch (error) {
        chat.insertAdjacentHTML("beforeend", `
          <div class="message">
            <span>Erreur : ${escapeHtml(error.message)}</span>
          </div>
        `);
      }
      
      chat.scrollTop = chat.scrollHeight;
    });
  }
}

function renderPatientPortal() {
  const content = document.getElementById("page-content");
  const template = document.getElementById("patient-portal-template");
  content.innerHTML = template.innerHTML;

  // Load patient appointments
  const appointmentsList = document.getElementById("patient-appointments");
  appointmentsList.innerHTML = appointments.slice(0, 2).map(renderAppointmentRow).join("");

  // Load health info
  const healthList = document.getElementById("patient-health");
  healthList.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div class="patient-row">
        <div class="patient-avatar">❤️</div>
        <div class="patient-info">
          <div class="patient-name">Dernier bilan</div>
          <div class="patient-detail">Consultation 08/09/2026</div>
        </div>
      </div>
      <div class="patient-row">
        <div class="patient-avatar">💊</div>
        <div class="patient-info">
          <div class="patient-name">Traitements actifs</div>
          <div class="patient-detail">À jour</div>
        </div>
      </div>
    </div>
  `;

  // Handle patient assistant form
  const assistantForm = document.getElementById("patient-assistant-form");
  if (assistantForm) {
    assistantForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const result = document.getElementById("patient-assistant-result");
      try {
        const data = await api("/ai/patient/ask", {
          method: "POST",
          body: JSON.stringify(Object.fromEntries(new FormData(assistantForm)))
        });
        setNotice(result, escapeHtml(data.reply), "success");
        assistantForm.reset();
      } catch (error) {
        setNotice(result, `Erreur : ${error.message}`, "critical");
      }
    });
  }
}

// ========== ROUTER ==========
function updatePage(page) {
  currentPage = page;
  document.getElementById("page-title").textContent = pageTitles[page] || pageTitles.dashboard;
  document.getElementById("date-display").textContent = formatDate();

  // Update nav links
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === page);
  });

  // Render appropriate page
  const pageMap = {
    dashboard: renderDashboard,
    calendar: renderCalendar,
    patients: renderPatients,
    triage: renderTriage,
    "follow-up": renderTriage, // Simplified
    assistant: renderAssistant,
    "my-appointments": renderPatientPortal,
    "my-health": renderPatientPortal,
    "my-records": renderPatientPortal,
    "patient-assistant": renderPatientPortal
  };

  const renderer = pageMap[page] || renderDashboard;
  renderer();
}

function setRole(role) {
  currentRole = role;
  
  // Update role buttons
  document.querySelectorAll(".role-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.role === role);
  });

  // Show/hide nav sections
  if (role === "doctor") {
    document.getElementById("doctor-nav").style.display = "";
    document.getElementById("patient-nav").style.display = "none";
  } else {
    document.getElementById("doctor-nav").style.display = "none";
    document.getElementById("patient-nav").style.display = "";
  }

  // Reset to dashboard
  updatePage("dashboard");
}

// ========== EVENT LISTENERS ==========
document.addEventListener("DOMContentLoaded", () => {
  // Role selector
  document.querySelectorAll(".role-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setRole(btn.dataset.role);
    });
  });

  // Navigation links
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      updatePage(link.dataset.page);
    });
  });

  // Refresh button
  document.getElementById("refresh-btn").addEventListener("click", () => {
    updatePage(currentPage);
  });

  // Modal close on outside click
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.style.display = "none";
    }
  });

  // Initial page
  updatePage("dashboard");
});

// Global functions for inline onclick handlers
window.navigate = navigate;
window.showModal = showModal;
window.closeModal = closeModal;
