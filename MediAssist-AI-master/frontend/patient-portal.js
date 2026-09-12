(() => {
  const storageProfile = "mediassist-patient";
  const storageAppointments = "mediassist-appointments";
  const storageSymptoms = "mediassist-symptoms";
  const esc = value => String(value || "").replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" })[char]);
  const profile = () => JSON.parse(localStorage.getItem(storageProfile) || "{}");
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const title = { "my-records":"Mon dossier", "my-appointments":"Mes rendez-vous", "my-symptoms":"Mes symptômes" };

  function patientNav() {
    const nav = document.querySelector(".nav");
    if (!nav || nav.querySelector('[data-page="my-symptoms"]')) return;
    const documents = nav.querySelector('[data-page="my-records"]');
    if (documents) documents.innerHTML = '<span style="font-size:18px">▣</span><span>Mon dossier</span>';
    const link = document.createElement("a");
    link.href = "#my-symptoms"; link.dataset.page = "my-symptoms"; link.className = "nav-link";
    link.innerHTML = '<span style="font-size:18px">✚</span><span>Mes symptômes</span>';
    link.addEventListener("click", event => { event.preventDefault(); location.hash = "my-symptoms"; render(); });
    nav.insertBefore(link, nav.querySelector('[data-page="patient-assistant"]'));
  }

  function replacePage(html) {
    const content = document.querySelector(".content");
    if (!content) return;
    content.querySelectorAll(":scope > :not(.topbar)").forEach(node => node.remove());
    content.insertAdjacentHTML("beforeend", html);
    const heading = content.querySelector(".topbar h2"), crumb = content.querySelector(".breadcrumb");
    if (heading) heading.textContent = title[location.hash.slice(1)] || "Mon espace";
    if (crumb) crumb.textContent = "Espace patient";
  }

  function recordPage() {
    const p = profile();
    replacePage(`<div class="page-intro"><div><h3>Mon dossier patient</h3><p>Vérifiez vos coordonnées et vos informations utiles à la prise en charge.</p></div></div><section class="card"><div class="card-head"><h4>Informations personnelles</h4><span class="tag success">Dossier actif</span></div><form id="patient-record-form"><div class="form-grid"><div class="form-group"><label>Prénom</label><input name="firstName" required value="${esc(p.firstName)}"></div><div class="form-group"><label>Nom</label><input name="lastName" required value="${esc(p.lastName)}"></div><div class="form-group"><label>Date de naissance</label><input name="birthDate" type="date" value="${esc(p.birthDate)}"></div><div class="form-group"><label>Téléphone</label><input name="phone" type="tel" value="${esc(p.phone)}"></div><div class="form-group wide"><label>Adresse</label><input name="address" value="${esc(p.address)}"></div><div class="form-group wide"><label>Contact d’urgence</label><input name="emergencyContact" value="${esc(p.emergencyContact)}"></div></div><button class="button" type="submit">Enregistrer les modifications</button><div id="record-result"></div></form></section>`);
    document.querySelector("#patient-record-form").addEventListener("submit", async event => {
      event.preventDefault(); const updated = { ...p, ...Object.fromEntries(new FormData(event.target)) }; save(storageProfile, updated);
      if (updated.id) { try { await fetch(`http://localhost:8080/api/patients/${updated.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(updated) }); } catch (_) {} }
      document.querySelector("#record-result").innerHTML = '<div class="notice">Dossier enregistré.</div>';
    });
  }

  function appointmentsPage() {
    const items = JSON.parse(localStorage.getItem(storageAppointments) || "[]"), p = profile();
    replacePage(`<div class="page-intro"><div><h3>Mes rendez-vous</h3><p>Demandez un créneau de consultation et retrouvez vos demandes.</p></div></div><div class="split"><section class="card"><div class="card-head"><h4>Demander un rendez-vous</h4></div><form id="appointment-form"><div class="form-group"><label>Motif de consultation</label><input name="reason" required placeholder="Ex. renouvellement, douleur, suivi"></div><div class="form-grid"><div class="form-group"><label>Date souhaitée</label><input name="date" type="date" required min="${new Date().toISOString().slice(0,10)}"></div><div class="form-group"><label>Créneau souhaité</label><select name="time" required><option value="">Choisir</option><option>Matin</option><option>Après-midi</option><option>Fin de journée</option></select></div></div><div class="form-group"><label>Précisions (facultatif)</label><textarea name="notes" placeholder="Informations utiles pour le cabinet"></textarea></div><button class="button" type="submit">Envoyer la demande</button><div id="appointment-result"></div></form></section><section class="card"><div class="card-head"><h4>Mes demandes</h4></div><div id="appointment-list">${items.length ? items.map(item => `<div class="appointment-row"><div class="stat-icon">▦</div><div class="row-main"><b>${esc(item.date)} · ${esc(item.time)}</b><span>${esc(item.reason)}</span></div><span class="tag medium">En attente</span></div>`).join("") : '<div class="empty">Aucune demande de rendez-vous.</div>'}</div></section></div>`);
    document.querySelector("#appointment-form").addEventListener("submit", event => { event.preventDefault(); const entry = Object.fromEntries(new FormData(event.target)); items.unshift(entry); save(storageAppointments, items); document.querySelector("#appointment-result").innerHTML = '<div class="notice">Votre demande a été enregistrée. Le cabinet vous confirmera le créneau.</div>'; event.target.reset(); document.querySelector("#appointment-list").innerHTML = items.map(item => `<div class="appointment-row"><div class="stat-icon">▦</div><div class="row-main"><b>${esc(item.date)} · ${esc(item.time)}</b><span>${esc(item.reason)}</span></div><span class="tag medium">En attente</span></div>`).join(""); });
  }

  function symptomsPage() {
    const items = JSON.parse(localStorage.getItem(storageSymptoms) || "[]");
    replacePage(`<div class="triage-hero"><h3>Déclarer mes symptômes</h3><p>Décrivez ce que vous ressentez pour mieux préparer votre échange avec l’équipe soignante. Ce service ne remplace pas les urgences.</p></div><div class="split"><section class="card"><div class="card-head"><h4>Nouveau signalement</h4></div><form id="symptom-form"><div class="form-group"><label>Symptômes</label><textarea name="description" required minlength="5" placeholder="Ex. mal de tête depuis ce matin, intensité modérée…"></textarea></div><div class="form-grid"><div class="form-group"><label>Depuis quand ?</label><input name="startedAt" type="date" required></div><div class="form-group"><label>Intensité ressentie</label><select name="severity" required><option value="Faible">Faible</option><option value="Modérée">Modérée</option><option value="Forte">Forte</option></select></div></div><button class="button" type="submit">Ajouter à mon suivi</button><div id="symptom-result"></div></form></section><section class="card"><div class="card-head"><h4>Historique récent</h4></div><div id="symptom-list">${items.length ? items.map(item => `<div class="patient-row"><div class="stat-icon coral">♥</div><div class="row-main"><b>${esc(item.description)}</b><span>Depuis le ${esc(item.startedAt)} · Intensité ${esc(item.severity)}</span></div></div>`).join("") : '<div class="empty">Aucun symptôme déclaré.</div>'}</div></section></div><div class="notice critical">En cas de douleur thoracique, difficulté à respirer, malaise ou symptôme grave, contactez immédiatement les services d’urgence locaux.</div>`);
    document.querySelector("#symptom-form").addEventListener("submit", event => { event.preventDefault(); const entry = Object.fromEntries(new FormData(event.target)); items.unshift(entry); save(storageSymptoms, items); document.querySelector("#symptom-result").innerHTML = '<div class="notice">Symptôme ajouté à votre suivi.</div>'; event.target.reset(); document.querySelector("#symptom-list").innerHTML = items.map(item => `<div class="patient-row"><div class="stat-icon coral">♥</div><div class="row-main"><b>${esc(item.description)}</b><span>Depuis le ${esc(item.startedAt)} · Intensité ${esc(item.severity)}</span></div></div>`).join(""); });
  }

  function render() { patientNav(); const page = location.hash.slice(1); if (page === "my-records") recordPage(); if (page === "my-appointments") appointmentsPage(); if (page === "my-symptoms") symptomsPage(); }
  document.addEventListener("DOMContentLoaded", () => { const page = location.hash.slice(1); if (["my-records", "my-appointments", "my-symptoms"].includes(page)) { const patientButton = document.querySelector('[data-role="patient"]'); if (patientButton && !patientButton.classList.contains("active")) patientButton.click(); if (location.hash.slice(1) !== page) location.hash = page; setTimeout(render, 0); } });
  window.addEventListener("hashchange", () => setTimeout(render, 0));
})();
