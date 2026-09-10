// La passerelle est utilisée en priorité. En développement, l'authentification
// reste accessible lorsque seule l'API Auth (port 8085) est démarrée.
const AUTH_APIS = ["http://localhost:8080/api/auth", "http://localhost:8085/api/auth"];
const PATIENT_API = "http://localhost:8080/api/patients";
let registering = false;
const form = document.querySelector("#auth-form"), result = document.querySelector("#result"), toggle = document.querySelector("#switch-button"), accountSwitch = document.querySelector("#account-switch");
const profileFields = ["firstName", "lastName", "birthDate", "gender", "phone", "emergencyContact", "address", "consent"];

function setMode(value) {
  registering = value;
  document.querySelectorAll(".register-only").forEach(el => el.classList.toggle("hidden", !value));
  profileFields.forEach(name => form.elements[name].required = value);
  document.querySelector("#mode-label").textContent = value ? "INSCRIPTION PATIENT" : "ESPACE SÉCURISÉ";
  document.querySelector("#title").textContent = value ? "Créer votre dossier patient." : "Bienvenue dans votre espace.";
  document.querySelector("#subtitle").textContent = value ? "Renseignez vos informations pour préparer votre dossier, vos rendez-vous et votre suivi." : "Connectez-vous pour accéder à vos outils de santé.";
  document.querySelector("#submit").textContent = value ? "Créer mon dossier →" : "Se connecter →";
  accountSwitch.firstChild.textContent = value ? "Vous avez déjà un compte ? " : "Pas encore de compte ? ";
  toggle.textContent = value ? "Se connecter" : "Inscription patient";
  form.password.autocomplete = value ? "new-password" : "current-password";
  result.innerHTML = "";
}
toggle.addEventListener("click", () => setMode(!registering));

async function sendAuthRequest(path, payload) {
  let unavailable = null;
  for (const baseUrl of AUTH_APIS) {
    try {
      const response = await fetch(`${baseUrl}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if ([502, 503, 504].includes(response.status)) {
        unavailable = new Error("Service indisponible");
        continue;
      }
      const account = await response.json();
      if (!response.ok) throw new Error(account.message || "Une erreur est survenue.");
      return account;
    } catch (error) {
      if (!(error instanceof TypeError) && error.message !== "Service indisponible") throw error;
      unavailable = error;
    }
  }
  throw unavailable || new TypeError("Impossible de joindre le service de connexion.");
}

async function createPatientProfile(data) {
  const patient = { firstName: data.firstName.trim(), lastName: data.lastName.trim(), email: data.email.trim(), phone: data.phone.trim(), birthDate: data.birthDate, gender: data.gender, address: data.address.trim(), emergencyContact: data.emergencyContact.trim() };
  const response = await fetch(PATIENT_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patient) });
  if (!response.ok) throw new Error("Le dossier sera synchronisé lors de votre première connexion.");
  return response.json();
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form));
  result.innerHTML = '<div class="notice">Traitement en cours…</div>';
  try {
    const account = await sendAuthRequest(registering ? "register" : "login", { firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password });
    if (registering) {
      let patientId = null;
      try { patientId = (await createPatientProfile(data)).id; } catch (_) { /* The local profile remains usable if a service is temporarily unavailable. */ }
      localStorage.setItem("mediassist-user", JSON.stringify(account));
      localStorage.setItem("mediassist-patient", JSON.stringify({ ...data, id: patientId }));
      result.innerHTML = '<div class="notice">Votre compte et votre dossier sont prêts. Ouverture de votre espace patient…</div>';
      setTimeout(() => location.href = "app.html#my-records", 650);
      return;
    }
    localStorage.setItem("mediassist-user", JSON.stringify(account));
    result.innerHTML = '<div class="notice">Connexion validée. Ouverture de votre espace…</div>';
    setTimeout(() => location.href = "app.html", 500);
  } catch (error) {
    const message = error instanceof TypeError && /fetch/i.test(error.message)
      ? "Le service de connexion est indisponible. Démarrez l’API MediAssist avant de vous connecter."
      : error.message;
    result.innerHTML = `<div class="notice error">${message}</div>`;
  }
});
