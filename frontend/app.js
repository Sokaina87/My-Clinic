const API = "http://localhost:8080/api";
const AI_API = "http://localhost:8000";
const people=[{name:"Sofia Martin",priority:"high",detail:"Essoufflement persistant",follow:"À rappeler aujourd’hui",last:"08 sept."},{name:"Lucas Bernard",priority:"medium",detail:"Fièvre depuis 3 jours",follow:"Suivi demain",last:"07 sept."},{name:"Emma Leroy",priority:"low",detail:"Suivi traitement",follow:"À jour",last:"01 sept."},{name:"Ahmed Benali",priority:"low",detail:"Contrôle annuel",follow:"À planifier",last:"29 août"}];
const savedUser=(()=>{try{return JSON.parse(localStorage.getItem("mediassist-user")||"null")}catch(_){return null}})();
let role=savedUser?.role==="PATIENT"?"patient":"doctor",page=savedUser?.role==="PATIENT"?"my-appointments":"dashboard";
const I={activity:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>',calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>',users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>',bolt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z"/></svg>',chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.8 9.8 0 0 1-4.1-.9L3 21l1.7-4A8.3 8.3 0 0 1 3 12.5 8.4 8.4 0 0 1 12 4a8.4 8.4 0 0 1 9 7.5Z"/></svg>',file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></svg>',heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z"/></svg>',search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14"/></svg>',bell:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',refresh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12a9 9 0 0 0-15.6-6.1L3 8M3 3v5h5M3 12a9 9 0 0 0 15.6 6.1L21 16M21 21v-5h-5"/></svg>',arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'};const ic=n=>I[n]||I.activity;
const e=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));const initials=n=>n.split(" ").map(x=>x[0]).join("");
async function api(path,options={}){
  // L'API IA est accessible soit par la passerelle, soit directement en local.
  const bases=path.startsWith("/ai/")?[API,AI_API]:[API];
  let unavailable;
  for(const base of bases){
    try{
      const r=await fetch(base+path,{headers:{"Content-Type":"application/json",...(options.headers||{})},...options});
      const payload=r.status===204?null:await r.json().catch(()=>null);
      if(!r.ok){
        if([502,503,504].includes(r.status)&&base===API){unavailable=new Error("Passerelle IA indisponible");continue}
        throw new Error(payload?.detail||payload?.message||`Le service a répondu ${r.status}`);
      }
      return payload;
    }catch(error){
      if(error instanceof TypeError&&base===API){unavailable=error;continue}
      throw error;
    }
  }
  throw new Error("L'assistant IA est indisponible. Démarrez le service IA sur le port 8000.");
}
let accessibilityOpen=false;
let preferredTextSize=Number(localStorage.getItem("mediassist-text-size")||0);
let preferredImageZoom=Number(localStorage.getItem("mediassist-image-zoom")||0);
let visualNotifications=localStorage.getItem("mediassist-visual-notifications")==="true";

function announce(message){
  const status=document.querySelector("#accessibility-status");
  if(status) status.textContent=message;
}
function applyTextSize(){
  document.body.classList.toggle("large-text",preferredTextSize>0);
  document.body.classList.toggle("extra-large-text",preferredTextSize>1);
  localStorage.setItem("mediassist-text-size",String(preferredTextSize));
}
function applyImageZoom(){
  document.body.classList.toggle("image-zoom",preferredImageZoom>0);
  document.body.classList.toggle("extra-image-zoom",preferredImageZoom>1);
  localStorage.setItem("mediassist-image-zoom",String(preferredImageZoom));
}
applyImageZoom();
function notifyVisual(message){
  if(!visualNotifications)return;
  let alert=document.querySelector("#visual-notification");
  if(!alert){alert=document.createElement("div");alert.id="visual-notification";alert.className="visual-notification";alert.setAttribute("role","status");document.body.append(alert);}
  alert.textContent=message;alert.classList.add("visible");setTimeout(()=>alert.classList.remove("visible"),5000);
}
function enableCaptions(){
  const tracks=[...document.querySelectorAll("video")].flatMap(video=>[...video.textTracks]);
  tracks.forEach(track=>track.mode="showing");
  announce(tracks.length?"Sous-titres activés pour les vidéos de cette page.":"Aucune vidéo n’est présente sur cette page. Ce réglage activera les sous-titres lorsqu’une vidéo sous-titrée sera disponible.");
}
function speak(text){
  if(!("speechSynthesis" in window)){announce("La lecture vocale n’est pas prise en charge par ce navigateur.");return}
  speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang="fr-FR"; utterance.rate=.92;
  speechSynthesis.speak(utterance);
  announce("Lecture vocale en cours.");
}
function describePage(){
  const description={"my-appointments":"Vos rendez-vous et leurs dates sont affichés.","my-health":"Cette page présente votre suivi santé et vos rappels.","my-records":"Cette page présente vos documents médicaux partagés.","patient-assistant":"Vous pouvez écrire ou dicter une question à votre assistant santé."}[page]||"Cette page contient vos informations de santé.";
  speak(`${names[page]}. ${description}`);
}
function voiceCommand(transcript,dictation=false){
  const text=transcript.toLowerCase();
  if(dictation){
    const input=document.querySelector("textarea:focus,input:focus")||document.querySelector("#chat-form input, textarea");
    if(input){input.value=`${input.value} ${transcript}`.trim();input.dispatchEvent(new Event("input",{bubbles:true}));announce("Message dicté.");}
    return;
  }
  const destination=text.includes("rendez")?"my-appointments":text.includes("suivi")||text.includes("santé")?"my-health":text.includes("document")?"my-records":text.includes("assistant")||text.includes("message")?"patient-assistant":null;
  if(destination){page=destination;location.hash=destination;render();announce(`Ouverture : ${names[destination]}.`);return}
  if(text.includes("médecin")||text.includes("service")){page="my-appointments";location.hash=page;render();announce("Ouverture des rendez-vous. Vous pouvez consulter le médecin ou le service associé.");return}
  if(text.includes("lire")||text.includes("description")){describePage();return}
  announce("Commande non reconnue. Dites par exemple : mes rendez-vous, mon suivi, mes documents ou mon assistant.");
}
function startVoice(dictation=false){
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition){announce("La commande vocale nécessite Chrome, Edge ou un navigateur compatible.");return}
  const recognition=new Recognition(); recognition.lang="fr-FR"; recognition.interimResults=false; recognition.maxAlternatives=1;
  recognition.onstart=()=>{const message=dictation?"Transcription vocale en cours…":"Commande vocale en cours…";announce(message);notifyVisual(message)};
  recognition.onresult=event=>{voiceCommand(event.results[0][0].transcript,dictation);notifyVisual(dictation?"Transcription ajoutée au message.":"Commande vocale reconnue.")};
  recognition.onerror=()=>{const message="La commande vocale n’a pas pu être utilisée. Vérifiez l’autorisation du microphone.";announce(message);notifyVisual(message)};
  recognition.start();
}
function accessibilityPanel(){return `<section class="accessibility-panel ${accessibilityOpen?"open":""}" aria-label="Options d’accessibilité"><div class="accessibility-head"><div><b>Accessibilité</b><span>Outils pour faciliter l’utilisation de votre espace.</span></div><button class="icon-button" id="accessibility-close" aria-label="Fermer les options d’accessibilité">×</button></div><div class="accessibility-actions"><button class="button" id="voice-navigation">Commande vocale</button><button class="button white" id="voice-dictation">Transcription vocale</button><button class="button white" id="read-page">Lire la page</button><button class="button white" id="describe-page">Description audio</button><button class="button white" id="text-size">Agrandir le texte</button><button class="button white" id="image-size">Agrandir les images</button><button class="button white" id="captions">Activer les sous-titres</button><button class="button white" id="visual-notifications">${visualNotifications?"Notifications visuelles activées":"Activer les notifications visuelles"}</button></div><p class="accessibility-help">La transcription transforme votre voix en texte. Les alertes importantes sont affichées à l’écran, sans son.</p><div id="accessibility-status" class="sr-status" aria-live="polite"></div></section>`}
document.addEventListener("click",event=>{
  const id=event.target.closest("button")?.id;
  if(!id) return;
  if(id==="accessibility-toggle"){accessibilityOpen=!accessibilityOpen;render()}
  if(id==="accessibility-close"){accessibilityOpen=false;render()}
  if(id==="voice-navigation") startVoice();
  if(id==="voice-dictation") startVoice(true);
  if(id==="read-page") speak(document.querySelector("main.content")?.innerText||"");
  if(id==="describe-page") describePage();
  if(id==="text-size"){preferredTextSize=(preferredTextSize+1)%3;applyTextSize();announce(preferredTextSize===0?"Taille de texte normale.":preferredTextSize===1?"Texte agrandi.":"Texte très agrandi.")}
  if(id==="image-size"){preferredImageZoom=(preferredImageZoom+1)%3;applyImageZoom();announce(preferredImageZoom===0?"Taille des images normale.":"Images agrandies.")}
  if(id==="captions") enableCaptions();
  if(id==="visual-notifications"){visualNotifications=!visualNotifications;localStorage.setItem("mediassist-visual-notifications",String(visualNotifications));announce(visualNotifications?"Notifications visuelles activées.":"Notifications visuelles désactivées.");render()}
});
document.addEventListener("submit",event=>{
  if(event.target.id!=="doctor-chat-form")return;
  event.preventDefault();
  const input=event.target.elements.message, message=input.value.trim();
  if(!message)return;
  const chatBox=document.querySelector("#doctor-chat");
  chatBox.insertAdjacentHTML("beforeend",`<div class="message me">${e(message)}</div>`);
  input.value=""; chatBox.scrollTop=chatBox.scrollHeight;
  notifyVisual("Message ajouté au fil de discussion.");
  announce("Message ajouté au fil de discussion.");
});
const nav={doctor:[["dashboard","Accueil","activity"],["calendar","Agenda","calendar"],["patients","Patients","users"],["triage","Triage IA","bolt"],["summary","Résumé médical","file"],["extraction","Extraction","search"],["follow-up","Suivi clinique","heart"],["assistant","Assistant médecin","chat"]],patient:[["my-appointments","Mes rendez-vous","calendar"],["my-health","Mon suivi","heart"],["my-records","Mes documents","file"],["doctor-chat","Messages médecin","chat"],["patient-assistant","Mon assistant","chat"]]};
const names={dashboard:"Accueil",calendar:"Agenda",patients:"Patients",triage:"Triage IA",summary:"Résumé médical",extraction:"Extraction clinique","follow-up":"Suivi clinique",assistant:"Assistant médecin","my-appointments":"Mes rendez-vous","my-health":"Mon suivi","my-records":"Mes documents","doctor-chat":"Messages médecin","patient-assistant":"Mon assistant"};
function side(){return `<aside class="sidebar"><div class="brand"><div class="brand-mark">${ic("heart")}</div><div><h1>MediAssist</h1><small>La santé, plus simplement</small></div></div><div class="role-switch"><button data-role="doctor" class="${role==="doctor"?"active":""}">Médecin</button><button data-role="patient" class="${role==="patient"?"active":""}">Patient</button></div><nav class="nav"><div class="nav-label">${role==="doctor"?"ESPACE CLINIQUE":"MON ESPACE SANTÉ"}</div>${nav[role].map(x=>`<a href="#${x[0]}" data-page="${x[0]}" class="nav-link ${page===x[0]?"active":""}">${ic(x[2])}<span>${x[1]}</span></a>`).join("")}</nav><div class="nav-footer"><strong>Décision assistée</strong>L’IA soutient le soin ; elle ne remplace pas l’expertise clinique.</div></aside>`}
function intro(title,text,button=""){return `<div class="page-intro"><div><h3>${title}</h3><p>${text}</p></div>${button}</div>`}function tag(p){return `<span class="tag ${p.priority}">${p.priority==="high"?"Prioritaire":p.priority==="medium"?"À surveiller":"Stable"}</span>`}function person(p){return `<div class="patient-row"><div class="person-avatar">${initials(p.name)}</div><div class="row-main"><b>${p.name}</b><span>${p.detail} · ${p.follow}</span></div>${tag(p)}</div>`}
function dashboard(){return `<section class="welcome"><div><p>ESPACE CLINIQUE · AUJOURD’HUI</p><h3>Bonjour, Dr. Dupont.</h3><span>Choisissez un espace de travail pour commencer.</span></div><div class="welcome-orb">${ic("activity")}</div></section><section class="launch-grid">${[["calendar","calendar","Agenda","Gérer les rendez-vous"],["patients","users","Patients","Ouvrir les dossiers"],["triage","bolt","Triage IA","Évaluer une priorité"],["summary","file","Résumé médical","Structurer les notes"],["extraction","search","Extraction","Repérer les informations"],["follow-up","heart","Suivi clinique","Préparer une relance"],["assistant","chat","Assistant médecin","Poser une question"]].map((x,i)=>`<button class="launch-card delay-${i%4}" data-go="${x[0]}"><div class="launch-icon">${ic(x[1])}</div><div><b>${x[2]}</b><span>${x[3]}</span></div><i>${ic("arrow")}</i></button>`).join("")}</section>`}
function calendar(){let ds=["Lun. 7","Mar. 8","Mer. 9","Jeu. 10","Ven. 11"];return `${intro("Agenda de la semaine","10 rendez-vous planifiés cette semaine.",`<button class="button">${ic("plus")}<span>Nouveau rendez-vous</span></button>`)}<section class="card"><div class="calendar">${ds.map((d,i)=>`<div class="day ${i===3?"today":""}"><b>${d}</b><small>${i===3?"Aujourd’hui":"Septembre"}</small>${i===3?'<span class="event">09:00 · Sofia Martin</span><span class="event blue">10:30 · Lucas Bernard</span><span class="event">14:00 · Emma Leroy</span>':`<span class="event ${i%2?"blue":""}">${i+1} rendez-vous</span>`}</div>`).join("")}</div></section>`}
function table(list=people){return list.map(p=>`<tr><td><div class="patient-name"><div class="person-avatar">${initials(p.name)}</div><b>${p.name}</b></div></td><td class="muted">${p.last}</td><td>${p.detail}</td><td>${tag(p)}</td><td><button class="button soft" data-go="follow-up">Ouvrir</button></td></tr>`).join("")||'<tr><td colspan="5"><div class="empty">Aucun patient trouvé.</div></td></tr>'}function patients(){return `${intro("Dossiers patients","Retrouvez l’historique et les informations utiles.",`<button class="button">${ic("plus")}<span>Nouveau patient</span></button>`)}<div class="toolbar"><div class="search">${ic("search")}<input id="search" placeholder="Rechercher par nom…"></div></div><section class="card table-card"><table class="table"><thead><tr><th>Patient</th><th>Dernière consultation</th><th>Motif / suivi</th><th>Statut</th><th></th></tr></thead><tbody id="rows">${table()}</tbody></table></section>`}
function triage(){return `<div class="triage-hero"><h3>Triage clinique assisté</h3><p>Décrivez les symptômes observés. L’outil aide à organiser les priorités, sans établir de diagnostic.</p></div><div class="split"><section class="card"><div class="card-head"><h4>Nouvelle évaluation</h4></div><form id="triage-form"><div class="form-group"><label>Symptômes rapportés</label><textarea name="symptoms" minlength="3" placeholder="Ex. douleur thoracique depuis ce matin, essoufflement à l’effort…" required></textarea></div><button class="button">${ic("bolt")}Analyser la priorité</button><div id="result"></div></form></section><aside class="card"><div class="card-head"><h4>Bon réflexe</h4></div><p class="muted">En présence de symptômes graves, suivez le protocole d’urgence local sans attendre l’analyse.</p><div class="notice medium">Les résultats doivent être validés par un professionnel.</div></aside></div>`}
function noteTool(kind){let summary=kind==="summary";return `${intro(summary?"Résumé médical":"Extraction clinique",summary?"Transformez des notes brutes en une synthèse claire.":"Repérez les éléments structurants d’une note clinique.")}<div class="split"><section class="card"><div class="card-head"><h4>${summary?"Générer un résumé":"Analyser une note"}</h4></div><form id="note-form" data-kind="${kind}"><div class="form-group"><label>Notes de consultation</label><textarea name="text" required placeholder="Collez ou rédigez vos notes cliniques ici…"></textarea></div><button class="button">${ic(summary?"file":"search")}${summary?"Générer le résumé":"Extraire les informations"}</button><div id="result"></div></form></section><aside class="card"><div class="card-head"><h4>${summary?"Format de sortie":"Informations détectées"}</h4></div><p class="muted">${summary?"Une synthèse concise, à relire avant d’être intégrée au dossier patient.":"Médicaments, allergies, dates et informations administratives identifiées dans le texte."}</p><div class="notice">Ne partagez que les informations nécessaires à la prise en charge.</div></aside></div>`}
function follow(){return `${intro("Suivi post-consultation","Préparez un suivi attentif et personnalisé.")}<div class="split"><section class="card"><div class="card-head"><h4>Créer une séquence de suivi</h4></div><form id="follow-form"><div class="form-grid"><div class="form-group"><label>Identifiant patient</label><input name="patient_id" required></div><div class="form-group"><label>Motif du suivi</label><input name="consultation_summary" placeholder="Ex. contrôle traitement" required></div><div class="form-group wide"><label>Éléments à surveiller</label><textarea name="symptoms"></textarea></div></div><button class="button">${ic("heart")}Générer les questions</button><div id="result"></div></form></section><section class="card"><div class="card-head"><h4>À relancer</h4></div>${people.slice(0,2).map(person).join("")}</section></div>`}
function chat(patient=false){return `${intro(patient?"Votre assistant santé":"Assistant médecin",patient?"Une aide claire pour vos rendez-vous et votre suivi.":"Un espace de réflexion sécurisé pour votre pratique.")}<section class="card"><div class="chat" id="chat"><div class="message">${patient?"Bonjour Sofia. Comment puis-je vous aider à comprendre votre parcours de soins ?":"Bonjour Dr. Dupont. Je peux vous aider à structurer une synthèse ou repérer les points d’attention."}</div></div><form class="chat-form" id="chat-form"><input name="question" placeholder="Écrivez votre question…" required><button class="button">Envoyer ${ic("arrow")}</button></form></section>`}
function doctorChat(){return `${intro("Messages médecin","Échangez par écrit avec votre équipe soignante, sans dépendre du téléphone.")}<section class="card"><div class="chat" id="doctor-chat" aria-live="polite"><div class="message"><b>Cabinet du Dr. Antoine Dupont</b><br>Bonjour Sofia. Écrivez votre question, elle sera visible dans votre fil de messages.</div></div><form class="chat-form" id="doctor-chat-form"><input name="message" placeholder="Écrivez ou transcrivez votre message…" aria-label="Message pour le médecin" required><button class="button">Envoyer ${ic("arrow")}</button></form><p class="muted">Les réponses de l’équipe soignante seront affichées ici. En cas d’urgence, contactez les services d’urgence locaux.</p></section>`}
function patientPage(){if(page==="my-appointments")return `${intro("Mes rendez-vous","Organisez vos prochaines consultations.")}<section class="card">${[["12 septembre · 09:00","Dr. Antoine Dupont","Consultation de suivi"],["24 septembre · 14:30","Dr. Claire Martin","Bilan prévention"]].map(x=>`<div class="appointment-row"><div class="stat-icon">${ic("calendar")}</div><div class="row-main"><b>${x[0]}</b><span>${x[1]} · ${x[2]}</span></div><span class="tag success">Confirmé</span></div>`).join("")}</section>`;if(page==="my-health")return `${intro("Mon suivi santé","Une vue simple de vos informations utiles.")}<section class="stats"><article class="stat"><div class="stat-icon">${ic("heart")}</div><div><label>Dernière consultation</label><strong>08</strong><small>septembre 2026</small></div></article><article class="stat"><div class="stat-icon blue">${ic("calendar")}</div><div><label>Prochain rendez-vous</label><strong>12</strong><small>septembre 2026</small></div></article></section><section class="card"><div class="card-head"><h4>Mes rappels</h4></div><div class="notice">Votre suivi de traitement est à jour. Préparez vos questions avant le prochain rendez-vous.</div></section>`;return `${intro("Mes documents","Retrouvez les documents partagés par votre équipe soignante.")}<section class="card"><div class="empty">${ic("file")}<div><b>Aucun nouveau document</b><br>Les comptes rendus partagés apparaîtront ici.</div></div></section>`}
function content(){if(page==="dashboard")return dashboard();if(page==="calendar")return calendar();if(page==="patients")return patients();if(page==="triage")return triage();if(page==="summary"||page==="extraction")return noteTool(page);if(page==="follow-up")return follow();if(page==="assistant")return chat();if(page==="patient-assistant")return chat(true);if(page==="doctor-chat")return doctorChat();return patientPage()}
function notice(msg,type=""){document.querySelector("#result").innerHTML=`<div class="notice ${type}">${msg}</div>`}function render(){applyTextSize();document.querySelector("#app").innerHTML=`<div class="app">${side()}<main class="content" aria-label="Contenu principal"><header class="topbar"><div><div class="breadcrumb">${role==="doctor"?"Espace clinique":"Espace patient"}</div><h2>${names[page]}</h2></div><div class="top-actions">${role==="patient"?'<button class="button white accessibility-toggle" id="accessibility-toggle" aria-expanded="false">Accessibilité</button>':''}<button class="icon-button" id="refresh">${ic("refresh")}</button><button class="icon-button">${ic("bell")}</button><div class="profile"><div class="avatar">${role==="doctor"?"AD":"SM"}</div><div><b>${role==="doctor"?"Dr. Antoine Dupont":"Sofia Martin"}</b><span>${role==="doctor"?"Médecin généraliste":"Patient"}</span></div></div></div></header>${role==="patient"?accessibilityPanel():""}${content()}</main></div>`;bind()}
function bind(){document.querySelectorAll("[data-page],[data-go]").forEach(x=>x.onclick=e=>{e.preventDefault();page=x.dataset.page||x.dataset.go;location.hash=page;render()});document.querySelectorAll("[data-role]").forEach(x=>x.onclick=()=>{role=x.dataset.role;page=role==="doctor"?"dashboard":"my-appointments";location.hash=page;render()});document.querySelector("#refresh").onclick=render;document.querySelector("#search")?.addEventListener("input",x=>document.querySelector("#rows").innerHTML=table(people.filter(p=>p.name.toLowerCase().includes(x.target.value.toLowerCase()))));document.querySelector("#triage-form")?.addEventListener("submit",async x=>{x.preventDefault();notice("Analyse en cours…");try{let d=await api("/ai/triage",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(x.target)))});notice(`<b>Priorité : ${e(d.urgency).toUpperCase()}</b><br>${e(d.recommendation)}`,d.urgency)}catch(err){notice(e(err.message),"critical")}});document.querySelector("#follow-form")?.addEventListener("submit",async x=>{x.preventDefault();try{let d=await api("/ai/follow-up",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(x.target)))});notice(`Questions proposées :<br>• ${d.questions.map(e).join("<br>• ")}`)}catch(err){notice(e(err.message),"critical")}});document.querySelector("#note-form")?.addEventListener("submit",async x=>{x.preventDefault();let result=document.querySelector("#result");result.innerHTML='<div class="notice">Analyse en cours…</div>';try{let path=x.target.dataset.kind==="summary"?"/ai/summary":"/ai/extract",d=await api(path,{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(x.target)))});result.innerHTML=`<div class="notice">${e(d.summary||JSON.stringify(d.content,null,2))}</div>`}catch(err){result.innerHTML=`<div class="notice critical">${e(err.message)}</div>`}});document.querySelector("#chat-form")?.addEventListener("submit",async x=>{x.preventDefault();let q=x.target.question.value.trim(),box=document.querySelector("#chat");if(!q)return;box.insertAdjacentHTML("beforeend",`<div class="message me">${e(q)}</div>`);x.target.reset();try{let patient=page==="patient-assistant",d=await api(patient?"/ai/patient/ask":"/ai/doctor-assistant",{method:"POST",body:JSON.stringify(patient?{message:q}:{question:q,patients:people.map(p=>({name:p.name,priority:p.priority,symptoms:p.detail,follow_up_due:p.priority==="high"?"overdue":"none",last_consultation:p.last}))})});box.insertAdjacentHTML("beforeend",`<div class="message">${e(d.answer||d.reply)}</div>`)}catch(err){box.insertAdjacentHTML("beforeend",`<div class="message">${e(err.message)}</div>`)}box.scrollTop=box.scrollHeight})}window.onhashchange=()=>{if(location.hash){page=location.hash.slice(1);render()}};document.addEventListener("DOMContentLoaded",()=>{if(location.hash)page=location.hash.slice(1);render()});
