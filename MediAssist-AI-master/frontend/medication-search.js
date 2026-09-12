(() => {
  const escapeHtml = value => String(value ?? "").replace(/[&<>\"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));

  document.addEventListener("submit", async event => {
    const form = event.target;
    if (form.id !== "medication-search-form") return;
    event.preventDefault();
    const query = form.elements.q.value.trim();
    const result = document.querySelector("#medication-result");
    const button = form.querySelector("button");
    if (!query || !result) return;
    button.disabled = true;
    result.innerHTML = '<div class="notice">Recherche dans le catalogue médicaments…</div>';
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8_000);
      const response = await fetch(`http://localhost:8001/ai/medications/search?q=${encodeURIComponent(query)}`, {signal: controller.signal});
      clearTimeout(timeout);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "La recherche n'a pas abouti.");
      if (!data.exists) {
        result.innerHTML = `<div class="notice medium"><b>Aucun résultat pour « ${escapeHtml(query)} »</b><br>Le médicament n’est pas présent dans ce catalogue de démonstration. Vérifiez une source réglementaire officielle.</div>`;
        return;
      }
      result.innerHTML = `<div class="medication-found"><span>✓</span><div><b>${data.medications.length} résultat${data.medications.length > 1 ? "s" : ""} dans le catalogue</b><small>${escapeHtml(data.disclaimer)}</small></div></div>${data.medications.map(item => `<article class="medication-card"><h5>${escapeHtml(item.name)} <span>${escapeHtml(item.strength || "")}</span></h5><dl><div><dt>Substance active</dt><dd>${escapeHtml(item.active_ingredient)}</dd></div><div><dt>Forme</dt><dd>${escapeHtml(item.form)}</dd></div><div><dt>Classe</dt><dd>${escapeHtml(item.therapeutic_class || "Non renseignée")}</dd></div></dl></article>`).join("")}`;
    } catch (error) {
      const message = error.name === "AbortError"
        ? "La recherche dépasse 8 secondes. Vérifiez que medication-postgres est démarré."
        : error.message;
      result.innerHTML = `<div class="notice critical">${escapeHtml(message)}</div>`;
    } finally {
      button.disabled = false;
    }
  }, true);
})();
