(() => {
  const key = "mediassist-medical-records";
  const escapeHtml = value => String(value ?? "").replace(/[&<>\"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
  const records = () => { try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch (_) { return {}; } };
  const save = value => localStorage.setItem(key, JSON.stringify(value));
  const patientName = element => element.options[element.selectedIndex].text.split(" · ")[0];
  const timestamp = () => new Intl.DateTimeFormat("fr-FR", {dateStyle:"medium", timeStyle:"short"}).format(new Date());

  document.addEventListener("submit", event => {
    const form = event.target;
    if (!['record-appointment-form', 'record-consultation-form'].includes(form.id)) return;
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const store = records();
    const entry = store[data.patientId] || {events: [], appointmentAccepted: false};
    const select = form.elements.patientId;
    const name = patientName(select);

    if (form.id === 'record-appointment-form') {
      entry.appointmentAccepted = true;
      entry.events.push({type:"Rendez-vous accepté", patientName:name, detail:"Dossier médical ouvert pour la consultation", date:timestamp()});
      store[data.patientId] = entry;
      save(store);
      document.querySelector('#record-access-result').innerHTML = `<div class="notice">Rendez-vous accepté. Le dossier de <b>${escapeHtml(name)}</b> est maintenant accessible au médecin.</div>`;
      return;
    }

    if (!entry.appointmentAccepted) {
      document.querySelector('#record-consultation-result').innerHTML = '<div class="notice critical">Acceptez d’abord le rendez-vous associé afin d’ouvrir le dossier patient.</div>';
      return;
    }
    entry.events.push({type:"Consultation", patientName:name, detail:data.consultation, date:timestamp()});
    if (data.diagnosis.trim()) entry.events.push({type:`Diagnostic · ${data.status}`, patientName:name, detail:data.diagnosis, date:timestamp()});
    store[data.patientId] = entry;
    save(store);
    document.querySelector('#record-consultation-result').innerHTML = `<div class="notice">Consultation${data.diagnosis.trim() ? ' et diagnostic' : ''} ajoutés automatiquement au dossier de <b>${escapeHtml(name)}</b>.</div>`;
    form.reset();
    setTimeout(() => location.reload(), 800);
  }, true);
})();
