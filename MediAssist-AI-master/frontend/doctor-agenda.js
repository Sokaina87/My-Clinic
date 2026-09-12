(() => {
  const doctorId = 'd1e2f3a4-0000-0000-0000-000000000001';
  const api = 'http://localhost:8001/ai';
  async function refreshAgenda() {
    if (location.hash !== '#calendar' || document.querySelector('#live-agenda')) return;
    const calendar = document.querySelector('.calendar'); if (!calendar) return;
    const panel = document.createElement('section'); panel.id = 'live-agenda'; panel.className = 'card'; panel.innerHTML = '<div class="card-head"><h4>Demandes et rendez-vous du Dr Jean Dupont</h4></div><div class="notice">Chargement de l’agenda…</div>';
    calendar.parentElement.after(panel);
    try {
      const appointments = await fetch(`${api}/doctor/appointments?doctor_id=${doctorId}`).then(r => r.json());
      panel.innerHTML = `<div class="card-head"><h4>Demandes et rendez-vous du Dr Jean Dupont</h4></div>${appointments.map(a => `<div class="appointment-row"><div class="stat-icon">▦</div><div class="row-main"><b>${a.appointment_date} · ${String(a.appointment_time).slice(0,5)}</b><span>Patient ${a.patient_id.slice(0,8)} · ${a.reason || 'Consultation'}</span></div>${a.status === 'PENDING' ? `<button class="button agenda-confirm" data-id="${a.id}">Accepter</button>` : '<span class="tag success">Confirmé</span>'}</div>`).join('') || '<div class="empty">Aucun rendez-vous.</div>'}`;
    } catch (_) { panel.innerHTML = '<div class="notice critical">Impossible de charger l’agenda.</div>'; }
  }
  document.addEventListener('click', async event => { const button = event.target.closest('.agenda-confirm'); if (!button) return; button.disabled = true; await fetch(`${api}/doctor/appointments/${button.dataset.id}/confirm`, {method:'PATCH'}); document.querySelector('#live-agenda')?.remove(); refreshAgenda(); });
  addEventListener('hashchange', () => setTimeout(refreshAgenda, 50));
  document.addEventListener('DOMContentLoaded', () => setTimeout(refreshAgenda, 200));
})();
