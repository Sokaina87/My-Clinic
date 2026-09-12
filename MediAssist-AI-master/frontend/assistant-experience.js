/* A responsive, local-first chat experience layered over the existing assistant. */
(() => {
  const aiUrl = "http://localhost:8001/ai";
  const escapeHtml = value => String(value ?? "").replace(/[&<>\"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
  const formatAnswer = value => escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
  const scrollToLatest = box => { box.scrollTop = box.scrollHeight; };
  const patientList = [
    {id:"a1b2c3d4-0000-0000-0000-000000000001",name:"Sofia Martin",priority:"high",symptoms:"Essoufflement persistant",follow_up_due:"overdue",last_consultation:"08 sept."},
    {name:"Lucas Bernard",priority:"medium",symptoms:"Fièvre depuis 3 jours",follow_up_due:"none",last_consultation:"07 sept."},
    {name:"Emma Leroy",priority:"low",symptoms:"Suivi traitement",follow_up_due:"none",last_consultation:"01 sept."}
  ];

  document.addEventListener("submit", async event => {
    const form = event.target;
    if (form.id !== "chat-form") return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const input = form.elements.question;
    const question = input.value.trim();
    const box = document.querySelector("#chat");
    if (!question || !box) return;
    const button = form.querySelector("button");
    const isPatient = location.hash === "#patient-assistant";
    box.insertAdjacentHTML("beforeend", `<div class="message me"><span>${escapeHtml(question)}</span><small>Vous · maintenant</small></div>`);
    box.insertAdjacentHTML("beforeend", '<div class="message assistant-message is-thinking" aria-live="polite"><div class="assistant-avatar">✦</div><div><b>MY CLINIC IA</b><span class="typing-dots" aria-label="Assistant en réflexion"><i></i><i></i><i></i></span><small>L’assistant réfléchit à votre demande…</small></div></div>');
    input.value = "";
    input.disabled = true;
    button.disabled = true;
    button.classList.add("is-loading");
    scrollToLatest(box);

    try {
      const path = isPatient ? "/patient/ask" : "/doctor-assistant";
      const body = isPatient
        ? {message: question, patient_name: "Sofia Martin", patient_id: JSON.parse(localStorage.getItem("mediassist-patient") || "{}").id || undefined}
        : {question, patients: patientList};
      const response = await fetch(aiUrl + path, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)});
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "L'assistant est momentanément indisponible.");
      box.querySelector(".is-thinking")?.remove();
      const answer = data.answer || data.reply || "Je n'ai pas pu générer de réponse.";
      box.insertAdjacentHTML("beforeend", `<div class="message assistant-message"><div class="assistant-avatar">✦</div><div><b>MY CLINIC IA</b><p>${formatAnswer(answer)}</p><small>Réponse générée maintenant · À valider cliniquement</small></div></div>`);
      if (isPatient && answer.includes("Prendre rendez-vous")) {
        const doctors = {"Jean Dupont":"d1e2f3a4-0000-0000-0000-000000000001","Alice Bernard":"d1e2f3a4-0000-0000-0000-000000000002","Marc Moreau":"d1e2f3a4-0000-0000-0000-000000000003"};
        const selected = Object.entries(doctors).find(([name]) => answer.includes(name));
        if (selected) box.insertAdjacentHTML("beforeend", `<form class="appointment-confirmation" data-doctor-id="${selected[1]}"><b>Demander un rendez-vous avec Dr ${selected[0]}</b><input name="date" type="date" required><input name="time" type="time" required><input name="reason" placeholder="Motif de consultation" required><button class="button" type="submit">Confirmer la demande</button><small>La demande sera ajoutée en attente de validation du médecin.</small></form>`);
      }
    } catch (error) {
      box.querySelector(".is-thinking")?.remove();
      box.insertAdjacentHTML("beforeend", `<div class="message assistant-message error-message"><div class="assistant-avatar">!</div><div><b>Assistant indisponible</b><p>${escapeHtml(error.message)}</p><small>Vérifiez que le service IA est démarré sur le port 8000.</small></div></div>`);
    } finally {
      input.disabled = false;
      button.disabled = false;
      button.classList.remove("is-loading");
      input.focus();
      scrollToLatest(box);
    }
  }, true);

  document.addEventListener("submit", async event => {
    const form = event.target;
    if (!form.classList.contains("appointment-confirmation")) return;
    event.preventDefault();
    const profile = JSON.parse(localStorage.getItem("mediassist-patient") || "{}");
    const patientId = profile.id || "a1b2c3d4-0000-0000-0000-000000000001";
    const fields = Object.fromEntries(new FormData(form));
    const response = await fetch("http://localhost:8001/ai/patient/appointment-requests", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({patient_id:patientId,doctor_id:form.dataset.doctorId,appointment_date:fields.date,appointment_time:fields.time,reason:fields.reason})});
    const data = await response.json();
    form.innerHTML = response.ok ? '<div class="notice">Demande envoyée : en attente de validation du médecin.</div>' : `<div class="notice critical">${escapeHtml(data.detail || "Erreur lors de l’envoi.")}</div>`;
  }, true);
})();
