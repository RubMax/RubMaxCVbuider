/* ============================================================
   CV BUILDER PRO — script.js
   ============================================================ */

/* ---------- STATE ---------- */
let state = {
  template: 1,
  photo: null,
  fullName: '',
  email: '',
  contact1: '',
  contact2: '',
  birthDate: '',
  nationality: '',
  maritalStatus: '',
  address: '',
  interest: 'A disposição da empresa',
  education: '',
  skills: [],
  customSkills: [],
  coverLetter: 'Busco uma oportunidade para aplicar meus conhecimentos, aprender na prática, desenvolver minhas habilidades e crescer profissionalmente em equipe.',
  experiences: [],
  languages: [],
  formations: [],
  additionalInfo: ''
};

let expCount = 0;
let langCount = 0;
let autoSaveTimer = null;

/* ---------- INIT ---------- */
window.addEventListener('DOMContentLoaded', () => {
  loadData();
  updatePreview();

  // register SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }
  if (data.formHTML_formacao) {
  document.getElementById('formacaoList').innerHTML = data.formHTML_formacao;
  document.querySelectorAll('[id^="form-curso-"],[id^="form-inst-"],[id^="form-periodo-"]')
    .forEach(el => el.addEventListener('input', updatePreview));
  document.querySelectorAll('[id^="form-situacao-"]')
    .forEach(el => el.addEventListener('change', updatePreview));
}
});

/* ============================================================
   TEMPLATE SELECTOR
   ============================================================ */
function selectTemplate(n) {
  state.template = n;
  document.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('active'));
  document.querySelector(`[data-tpl="${n}"]`).classList.add('active');
  updatePreview();
}

/* ============================================================
   PHOTO
   ============================================================ */
function handlePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    state.photo = e.target.result;
    const prev = document.getElementById('photoPreview');
    prev.innerHTML = `<img src="${state.photo}" alt="foto" />`;
    updatePreview();
    scheduleAutoSave();
  };
  reader.readAsDataURL(file);
}

/* ============================================================
   EXPERIENCES
   ============================================================ */
function addExperience() {
  if (expCount >= 3) { showToast('Máximo 3 experiências', true); return; }
  expCount++;
  const id = expCount;
  const div = document.createElement('div');
  div.className = 'exp-card';
  div.id = `exp-${id}`;
  div.innerHTML = `
    <div class="exp-header">
      <span>Experiência ${id}</span>
      <button class="btn-remove" onclick="removeExperience(${id})"><i class="fa-solid fa-trash"></i></button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Empresa</label>
        <input type="text" id="exp-empresa-${id}" placeholder="Nome da empresa" oninput="updatePreview()" />
      </div>
      <div class="form-group">
        <label>Cargo</label>
        <input type="text" id="exp-cargo-${id}" placeholder="Seu cargo" oninput="updatePreview()" />
      </div>
      <div class="form-group full">
        <label>Período</label>
        <input type="text" id="exp-periodo-${id}" placeholder="Ex: Jan 2022 - Dez 2023" oninput="updatePreview()" />
      </div>
      <div class="form-group full">
        <label>Descrição</label>
        <textarea id="exp-desc-${id}" rows="2" maxlength="250" placeholder="Descreva suas atividades (máx. 250 caracteres)" oninput="updateExpChar(${id}); updatePreview()"></textarea>
        <div class="char-count" id="exp-char-${id}">0 / 250</div>
      </div>
    </div>`;
  document.getElementById('experiencesList').appendChild(div);
  if (expCount >= 3) document.getElementById('addExpBtn').style.display = 'none';
}

function removeExperience(id) {
  document.getElementById(`exp-${id}`)?.remove();
  expCount = Math.max(0, expCount - 1);
  document.getElementById('addExpBtn').style.display = '';
  updatePreview();
}

function updateExpChar(id) {
  const ta = document.getElementById(`exp-desc-${id}`);
  const cc = document.getElementById(`exp-char-${id}`);
  if (!ta || !cc) return;
  const len = ta.value.length;
  cc.textContent = `${len} / 250`;
  cc.classList.toggle('warn', len >= 230);
}

/* ============================================================
   LANGUAGES
   ============================================================ */
function addLanguage() {
  langCount++;
  const id = langCount;
  const div = document.createElement('div');
  div.className = 'lang-card';
  div.id = `lang-${id}`;
  div.innerHTML = `
    <div class="lang-header">
      <span>Idioma ${id}</span>
      <button class="btn-remove" onclick="removeLang(${id})"><i class="fa-solid fa-trash"></i></button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label>Idioma</label>
        <select id="lang-nome-${id}" onchange="updatePreview()">
          <option value="">Selecionar</option>
          <option>Português</option>
          <option>Español</option>
          <option>Français</option>
          <option>English</option>
          <option>Crioulo Haitiano</option>
        </select>
      </div>
      <div class="form-group">
        <label>Nível</label>
        <select id="lang-nivel-${id}" onchange="updatePreview()">
          <option value="">Selecionar</option>
          <option>Básico</option>
          <option>Intermediário</option>
          <option>Avançado</option>
          <option>Fluente</option>
          <option>Nativo</option>
        </select>
      </div>
    </div>`;
  document.getElementById('languagesList').appendChild(div);
}

function removeLang(id) {
  document.getElementById(`lang-${id}`)?.remove();
  langCount = Math.max(0, langCount - 1);
  updatePreview();
}

/* ============================================================
   CUSTOM SKILLS
   ============================================================ */
function addCustomSkill() {
  const container = document.getElementById('customSkills');
  const row = document.createElement('div');
  row.className = 'custom-skill-row';
  row.innerHTML = `
    <input type="text" placeholder="Nova habilidade..." oninput="updatePreview()" />
    <button class="btn-remove-small" onclick="this.parentElement.remove(); updatePreview()"><i class="fa-solid fa-xmark"></i></button>`;
  container.appendChild(row);
}

/* ============================================================
   COLLECT STATE FROM FORM
   ============================================================ */
function collectState() {
  state.fullName = val('fullName');
  state.email = val('email');
  state.contact1 = val('contact1');
  state.contact2 = val('contact2');
  state.birthDate = val('birthDate');
  state.nationality = val('nationality');
  state.maritalStatus = val('maritalStatus');
  state.address = val('address');
  state.interest = val('interest');
  state.education = val('education');
  state.coverLetter = val('coverLetter');
  state.additionalInfo = val('additionalInfo');

  // skills
  state.skills = [];
  document.querySelectorAll('#skillsChecklist input[type="checkbox"]:checked').forEach(cb => {
    state.skills.push(cb.value);
  });
  state.customSkills = [];
  document.querySelectorAll('#customSkills .custom-skill-row input').forEach(inp => {
    if (inp.value.trim()) state.customSkills.push(inp.value.trim());
  });

  // experiences
  state.experiences = [];
  for (let i = 1; i <= 20; i++) {
    const empresa = document.getElementById(`exp-empresa-${i}`);
    if (!empresa) continue;
    state.experiences.push({
      empresa: empresa.value || '',
      cargo: val(`exp-cargo-${i}`),
      periodo: val(`exp-periodo-${i}`),
      desc: val(`exp-desc-${i}`)
    });
  }

  // languages
  state.languages = [];
  for (let i = 1; i <= 20; i++) {
    const nome = document.getElementById(`lang-nome-${i}`);
    if (!nome) continue;
    state.languages.push({
      nome: nome.value || '',
      nivel: val(`lang-nivel-${i}`)
    });
  }
  // Ajoute ce bloc à la fin de collectState(), avant la fermeture }
state.formations = [];
for (let i = 1; i <= 20; i++) {
  const curso = document.getElementById(`form-curso-${i}`);
  if (!curso) continue;
  state.formations.push({
    curso:    curso.value || '',
    inst:     val(`form-inst-${i}`),
    periodo:  val(`form-periodo-${i}`),
    situacao: val(`form-situacao-${i}`)
  });
}
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value || '' : '';
}

/* ============================================================
   UPDATE PREVIEW
   ============================================================ */
function updatePreview() {
  collectState();
  const cv = document.getElementById('cvPreview');
  cv.className = `cv-a4 template-${state.template}`;

  let html = '';
  if (state.template === 1) html = renderTemplate1();
  else if (state.template === 2) html = renderTemplate2();
  else if (state.template === 3) html = renderTemplate3();
  else if (state.template === 4) html = renderTemplate4();
  else if (state.template === 5) html = renderTemplate5();
  else html = renderTemplate6();

  cv.innerHTML = html;
   adjustSectionSpacing();
  scheduleAutoSave();
  setTimeout(fitA4, 80);
}

/* ============================================================
   FIT A4
   ============================================================ */
function fitA4() {
  const cv = document.getElementById('cvPreview');
  if (!cv) return;
  const TARGET = 1123;
  let fontSize = 14;
  cv.style.fontSize = fontSize + 'px';
  cv.style.lineHeight = '1.4';

  let attempts = 0;
  while (cv.scrollHeight > TARGET + 5 && attempts < 10) {
    fontSize -= 0.4;
    if (fontSize < 12) { fontSize = 12; cv.style.fontSize = '12px'; break; }
    cv.style.fontSize = fontSize + 'px';
    attempts++;
  }
}

/* ============================================================
   TEMPLATE 1 — CORPORATE GOLD
   ============================================================ */
function renderTemplate1() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  const hasPhoto = s.photo;

  return `
    <div class="t1-sidebar">
      <div class="t1-photo-area">
        ${hasPhoto ? `<div class="t1-photo"><img src="${hasPhoto}" alt="foto" /></div>` : ''}
        ${s.fullName ? `<div class="t1-name">${esc(s.fullName)}</div>` : ''}
        
      </div>
      <div class="t1-divider"></div>
      <div class="t1-section-label">Contatos</div>
      <div class="t1-contact-list">
        ${s.email ? `<div class="t1-contact-item"><i class="fa-solid fa-envelope"></i>${esc(s.email)}</div>` : ''}
        ${s.contact1 ? `<div class="t1-contact-item"><i class="fa-solid fa-phone"></i>${esc(s.contact1)}</div>` : ''}
        ${s.contact2 ? `<div class="t1-contact-item"><i class="fa-brands fa-whatsapp"></i>${esc(s.contact2)}</div>` : ''}
        ${s.address ? `<div class="t1-contact-item"><i class="fa-solid fa-location-dot"></i>${esc(s.address)}</div>` : ''}
        ${s.birthDate ? `<div class="t1-contact-item"><i class="fa-solid fa-cake-candles"></i>${formatDate(s.birthDate)}</div>` : ''}
        ${s.nationality ? `<div class="t1-contact-item"><i class="fa-solid fa-flag"></i>${esc(s.nationality)}</div>` : ''}
        ${s.maritalStatus ? `<div class="t1-contact-item"><i class="fa-solid fa-heart"></i>${esc(s.maritalStatus)}</div>` : ''}
      </div>
      ${s.education ? `
      <div class="t1-divider"></div>
      <div class="t1-section-label">Escolaridade</div>
      <div class="t1-edu-text">${esc(s.education)}</div>` : ''}
      
      ${s.languages.length > 0 ? `
      <div class="t1-divider"></div>
      <div class="t1-section-label">Idiomas</div>
      <div class="t1-lang-list">
        ${s.languages.filter(l=>l.nome).map(l => `
        <div class="t1-lang-item">
          <span>${esc(l.nome)}</span>
          <span class="t1-lang-level">${esc(l.nivel)}</span>
        </div>`).join('')}
      </div>` : ''}
    </div>

    <div class="t1-main">
      <div class="t1-header-banner">
        <div class="t1-banner-name">${esc(s.fullName) || 'Seu Nome'}</div>
        
      </div>
      <div class="t1-body">
        ${s.coverLetter ? `
        <div class="t1-body-section">
          <div class="t1-body-section-title"><i class="fa-solid fa-quote-left"></i>Apresentação</div>
          <div class="t1-cover-text">${esc(s.coverLetter)}</div>
        </div>` : ''}
        
        ${s.interest ? `
        <div class="t1-body-section">
          <div class="t1-body-section-title"><i class="fa-solid fa-bullseye"></i>Área de Interesse</div>
          <div class="t1-cover-text">${esc(s.interest)}</div>
        </div>` : ''}

         
        ${s.formations.filter(f => f.curso).length > 0 ? `
        <div class="t1-body-section">
          <div class="t1-body-section-title">
            <i class="fa-solid fa-book-open"></i>Formação Profissional
          </div>
          ${s.formations.filter(f => f.curso).map(f => `
          <div style="margin-bottom:7px; padding-left:4px; border-left:2px solid var(--tpl1-accent);">
            <div style="font-weight:700; font-size:12px; color:#0d2137; text-transform:uppercase;">
              ${esc(f.curso)}
            </div>
            ${f.inst    ? `<div style="font-size:12px;color:#555;">Instituição: <b>${esc(f.inst)}</b></div>` : ''}
            ${f.periodo ? `<div style="font-size:12px;color:#555;">Período: ${esc(f.periodo)}</div>` : ''}
            ${f.situacao? `<div style="font-size:11px;color:var(--tpl1-accent);font-weight:600;">${esc(f.situacao)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}

        
        ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
        <div class="t1-body-section">
          <div class="t1-body-section-title"><i class="fa-solid fa-briefcase"></i>Experiência Profissional</div>
          <div class="t1-timeline">
            ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
            <div class="t1-timeline-item">
              <div class="t1-timeline-dot"><span></span></div>
              <div class="t1-timeline-content">
                <div class="t1-job-title">${esc(e.cargo) || 'Cargo'}</div>
                <div class="t1-job-company">${esc(e.empresa) || ''}</div>
                ${e.periodo ? `<div class="t1-job-period">${esc(e.periodo)}</div>` : ''}
                ${e.desc ? `<div class="t1-job-desc">${esc(e.desc)}</div>` : ''}
              </div>
            </div>`).join('')}
          </div>
        </div>` : ''}
        
        ${allSkills.length > 0 ? `
        <div class="t1-body-section">
          <div class="t1-body-section-title"><i class="fa-solid fa-star"></i>Habilidades</div>
          <div class="t1-skills-list" style="padding:0">
            ${allSkills.map(sk => `<div class="t1-skill-item" style="color:#333">${esc(sk)}</div>`).join('')}
          </div>
        </div>` : ''}
        
        ${s.additionalInfo ? `
        <div class="t1-body-section">
          <div class="t1-body-section-title"><i class="fa-solid fa-circle-info"></i>Informações Adicionais</div>
          <div class="t1-additional-text">${esc(s.additionalInfo)}</div>
        </div>` : ''}
      </div>
    </div>`;
}

/* ============================================================
   TEMPLATE 2 — LINKEDIN PREMIUM
   ============================================================ */
function renderTemplate2() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  return `
    <div class="t2-top-bar"></div>
    <div class="t2-header">
      ${s.photo ? `<div class="t2-photo"><img src="${s.photo}" alt="foto" /></div>` : ''}
      <div class="t2-name-area">
        <div class="t2-name">${esc(s.fullName) || 'Seu Nome'}</div>
      </div>
    </div>
    <div class="t2-body">
      <div class="t2-main">
        ${s.coverLetter ? `
        <div style="margin-bottom:12px">
          <div class="t2-section-title"><i class="fa-solid fa-quote-left"></i>Apresentação</div>
          <div class="t2-cover-text">${esc(s.coverLetter)}</div>
        </div>` : ''}
        
        ${s.interest ? `
        <div style="margin-bottom:12px">
          <div class="t2-section-title"><i class="fa-solid fa-bullseye"></i>Área de Interesse</div>
          <div class="t2-cover-text">${esc(s.interest)}</div>
        </div>` : ''}
        
        ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
        <div>
          <div class="t2-section-title"><i class="fa-solid fa-briefcase"></i>Experiência Profissional</div>
          ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
          <div class="t2-exp-item">
            <div class="t2-job-title">${esc(e.cargo) || 'Cargo'}</div>
            <div class="t2-job-company">${esc(e.empresa) || ''}</div>
            <div class="t2-job-period">${esc(e.periodo) || ''}</div>
            ${e.desc ? `<div class="t2-job-desc">${esc(e.desc)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}


        ${s.formations.filter(f => f.curso).length > 0 ? `
<div style="margin-bottom:12px">
  <div class="t2-section-title">
    <i class="fa-solid fa-book-open"></i> Formação Profissional
  </div>

  ${s.formations.filter(f => f.curso).map(f => `
    <div class="t2-cover-text" style="margin-bottom:12px;">
      <div style="font-weight:700;">
        ${esc(f.curso)}
      </div>

      ${f.inst ? `<div>Instituição: ${esc(f.inst)}</div>` : ''}
      ${f.periodo ? `<div>Período: ${esc(f.periodo)}</div>` : ''}
      ${f.situacao ? `<div><strong>${esc(f.situacao)}</strong></div>` : ''}
    </div>
  `).join('')}
</div>` : ''}

        
        ${allSkills.length > 0 ? `
        <div style="margin-top:12px">
          <div class="t2-section-title"><i class="fa-solid fa-star"></i>Habilidades</div>
          <div>${allSkills.map(sk => `<span class="t2-skill-chip">${esc(sk)}</span>`).join('')}</div>
        </div>` : ''}
        
        ${s.additionalInfo ? `
        <div style="margin-top:12px">
          <div class="t2-section-title"><i class="fa-solid fa-circle-info"></i>Informações Adicionais</div>
          <div class="t2-additional-text">${esc(s.additionalInfo)}</div>
        </div>` : ''}
      </div>
      <div class="t2-sidebar">
        <div style="margin-bottom:10px">
          <div class="t2-section-title"><i class="fa-solid fa-address-card"></i>Contato</div>
          ${s.email ? `<div class="t2-contact-item"><i class="fa-solid fa-envelope"></i>${esc(s.email)}</div>` : ''}
          ${s.contact1 ? `<div class="t2-contact-item"><i class="fa-solid fa-phone"></i>${esc(s.contact1)}</div>` : ''}
          ${s.contact2 ? `<div class="t2-contact-item"><i class="fa-brands fa-whatsapp"></i>${esc(s.contact2)}</div>` : ''}
          ${s.address ? `<div class="t2-contact-item"><i class="fa-solid fa-location-dot"></i>${esc(s.address)}</div>` : ''}
        </div>
        ${(s.birthDate||s.nationality||s.maritalStatus) ? `
        <div style="margin-bottom:10px">
          <div class="t2-section-title"><i class="fa-solid fa-id-card"></i>Pessoal</div>
          <div class="t2-info-box">
            ${s.birthDate ? `<p><b>Nascimento:</b> ${formatDate(s.birthDate)}</p>` : ''}
            ${s.nationality ? `<p><b>Nacionalidade:</b> ${esc(s.nationality)}</p>` : ''}
            ${s.maritalStatus ? `<p><b>Estado Civil:</b> ${esc(s.maritalStatus)}</p>` : ''}
          </div>
        </div>` : ''}
        ${s.education ? `
        <div style="margin-bottom:10px">
          <div class="t2-section-title"><i class="fa-solid fa-graduation-cap"></i>Escolaridade</div>
          <div class="t2-edu-text">${esc(s.education)}</div>
        </div>` : ''}
        ${s.languages.filter(l=>l.nome).length > 0 ? `
        <div style="margin-bottom:10px">
          <div class="t2-section-title"><i class="fa-solid fa-language"></i>Idiomas</div>
          ${s.languages.filter(l=>l.nome).map(l => `
          <div class="t2-lang-row">
            <span>${esc(l.nome)}</span>
            <span class="t2-lang-level">${esc(l.nivel)}</span>
          </div>`).join('')}
        </div>` : ''}
      </div>
    </div>`;
}

/* ============================================================
   TEMPLATE 3 — CLEAN PRINT
   ============================================================ */
function renderTemplate3() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  return `
    <div class="t3-top-accent"></div>
    <div class="t3-header">
      ${s.photo ? `<div class="t3-photo"><img src="${s.photo}" alt="foto" /></div>` : ''}
      <div class="t3-name-block">
        <div class="t3-hero-name">${esc(s.fullName) || 'Seu Nome'}</div>
        <div>
          <div class="t3-section-title">
          <i class="fa-solid fa-bullseye"></i>
          <strong>Área de Interesse:</strong>
          <span style="font-weight: normal;">${esc(s.interest)}</span>
      </div>
          
    </div>
      </div>
      <div class="t3-header-contacts">
        ${s.email    ? `<div class="t3-hc-item">${esc(s.email)}<i class="fa-solid fa-envelope"></i></div>` : ''}
        ${s.contact1 ? `<div class="t3-hc-item">${esc(s.contact1)}<i class="fa-solid fa-phone"></i></div>` : ''}
        ${s.contact2 ? `<div class="t3-hc-item">${esc(s.contact2)}<i class="fa-brands fa-whatsapp"></i></div>` : ''}
        ${s.address  ? `<div class="t3-hc-item">${esc(s.address)}<i class="fa-solid fa-location-dot"></i></div>` : ''}
      </div>
    </div>
    <div class="t3-body">
      <div class="t3-main">
        ${s.coverLetter ? `
        <div>
          <div class="t3-section-title"><i class="fa-solid fa-quote-left"></i>Apresentação</div>
          <div class="t3-cover-text">${esc(s.coverLetter)}</div>
        </div>` : ''}
        
        ${s.interest ? `
        <div>
          <div class="t3-section-title"><i class="fa-solid fa-bullseye"></i>Área de Interesse</div>
          <div class="t3-cover-text">${esc(s.interest)}</div>
        </div>` : ''}
        
        ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
        <div>
          <div class="t3-section-title"><i class="fa-solid fa-briefcase"></i>Experiência Profissional</div>
          ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
          <div class="t3-exp-card">
            <div class="t3-job-title">${esc(e.cargo) || 'Cargo'}</div>
            <div class="t3-job-company">${esc(e.empresa) || ''}</div>
            ${e.periodo ? `<div class="t3-job-period">${esc(e.periodo)}</div>` : ''}
            ${e.desc ? `<div class="t3-job-desc">${esc(e.desc)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}

${s.formations.filter(f => f.curso).length > 0 ? `
<div>
  <div class="t3-section-title">
    <i class="fa-solid fa-book-open"></i> Formação Profissional
  </div>

  ${s.formations.filter(f => f.curso).map(f => `
    <div class="t3-cover-text" style="margin-bottom:12px;">
      <div style="font-weight:700;">
        ${esc(f.curso)}
      </div>

      ${f.inst ? `<div>Instituição: ${esc(f.inst)}</div>` : ''}
      ${f.periodo ? `<div>Período: ${esc(f.periodo)}</div>` : ''}
      ${f.situacao ? `<div><strong>${esc(f.situacao)}</strong></div>` : ''}
    </div>
  `).join('')}
</div>` : ''}

        ${allSkills.length > 0 ? `
        <div>
          <div class="t3-section-title"><i class="fa-solid fa-star"></i>Habilidades</div>
          <div>${allSkills.map(sk => `<span class="t3-skill-tag">${esc(sk)}</span>`).join('')}</div>
        </div>` : ''}
        
        ${s.additionalInfo ? `
        <div>
          <div class="t3-section-title"><i class="fa-solid fa-circle-info"></i>Informações Adicionais</div>
          <div class="t3-additional-text">${esc(s.additionalInfo)}</div>
        </div>` : ''}
      </div>
      <div class="t3-sidebar">
        ${(s.birthDate||s.nationality||s.maritalStatus) ? `
        <div>
          <div class="t3-section-label">Pessoal</div>
          ${s.birthDate    ? `<div class="t3-info-row"><b>Nasc.:</b> ${formatDate(s.birthDate)}</div>` : ''}
          ${s.nationality  ? `<div class="t3-info-row"><b>Nac.:</b> ${esc(s.nationality)}</div>` : ''}
          ${s.maritalStatus? `<div class="t3-info-row"><b>E.Civil:</b> ${esc(s.maritalStatus)}</div>` : ''}
        </div>` : ''}
        ${s.education ? `
        <div>
          <div class="t3-section-label">Escolaridade</div>
          <div class="t3-edu-text">${esc(s.education)}</div>
        </div>` : ''}
        ${s.languages.filter(l=>l.nome).length > 0 ? `
        <div>
          <div class="t3-section-label">Idiomas</div>
          ${s.languages.filter(l=>l.nome).map(l => `
          <div class="t3-lang-item">
            <span>${esc(l.nome)}</span>
            <span class="t3-lang-level">${esc(l.nivel)}</span>
          </div>`).join('')}
        </div>` : ''}
      </div>
    </div>`;
}

/* ============================================================
   TEMPLATE 4 — ÉLÉGANCE ROUGE
   ============================================================ */
function renderTemplate4() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  return `
    <div class="t4-sidebar">
      ${s.photo ? `<div class="t4-photo"><img src="${s.photo}" alt="foto" /></div>` : ''}
      ${s.fullName ? `<div class="t4-name">${esc(s.fullName)}</div>` : ''}

      <div class="t4-divider"></div>
      <div class="t4-section-label">Contato</div>
      ${s.email    ? `<div class="t4-contact-item"><i class="fa-solid fa-envelope"></i>${esc(s.email)}</div>` : ''}
      ${s.contact1 ? `<div class="t4-contact-item"><i class="fa-solid fa-phone"></i>${esc(s.contact1)}</div>` : ''}
      ${s.contact2 ? `<div class="t4-contact-item"><i class="fa-brands fa-whatsapp"></i>${esc(s.contact2)}</div>` : ''}
      ${s.address  ? `<div class="t4-contact-item"><i class="fa-solid fa-location-dot"></i>${esc(s.address)}</div>` : ''}
      ${(s.birthDate||s.nationality||s.maritalStatus) ? `
      <div class="t4-divider"></div>
      <div class="t4-section-label">Pessoal</div>
      ${s.birthDate     ? `<div class="t4-info-row"><b>Nasc.:</b> ${formatDate(s.birthDate)}</div>` : ''}
      ${s.nationality   ? `<div class="t4-info-row"><b>Nac.:</b> ${esc(s.nationality)}</div>` : ''}
      ${s.maritalStatus ? `<div class="t4-info-row"><b>Civil:</b> ${esc(s.maritalStatus)}</div>` : ''}` : ''}
      ${s.education ? `
      <div class="t4-divider"></div>
      <div class="t4-section-label">Escolaridade</div>
      <div class="t4-edu-text">${esc(s.education)}</div>` : ''}
      ${allSkills.length > 0 ? `
      
      ${allSkills.map(sk => ``).join('')}` : ''}
      ${s.languages.filter(l=>l.nome).length > 0 ? `
      <div class="t4-divider"></div>
      <div class="t4-section-label">Idiomas</div>
      ${s.languages.filter(l=>l.nome).map(l => `
      <div class="t4-lang-item">
        <span>${esc(l.nome)}</span>
        <span class="t4-lang-level">${esc(l.nivel)}</span>
      </div>`).join('')}` : ''}
    </div>
    <div class="t4-main">
      <div class="t4-header-block">
        <div class="t4-header-name">${esc(s.fullName) || 'Seu Nome'}</div>
        <div class="t4-header-role"><strong>Área de Interesse:</strong> ${esc(s.interest) || 'Área de Interesse'}</div>
      </div>
      <div class="t4-body">
        ${s.coverLetter ? `
        <div>
          <div class="t4-section-title"><i class="fa-solid fa-quote-left"></i>Apresentação</div>
          <div class="t4-cover-text">${esc(s.coverLetter)}</div>
        </div>` : ''}
        
        ${s.interest ? `
        <div>
          <div class="t4-section-title"><i class="fa-solid fa-bullseye"></i>Área de Interesse</div>
          <div class="t4-cover-text">${esc(s.interest)}</div>
        </div>` : ''}


${s.formations.filter(f => f.curso).length > 0 ? `
<div>
  <div class="t4-section-title">
    <i class="fa-solid fa-book-open"></i> Formação Profissional
  </div>

  ${s.formations.filter(f => f.curso).map(f => `
    <div class="t4-cover-text" style="margin-bottom:12px;">
      <div style="font-weight:700;">
        ${esc(f.curso)}
      </div>

      ${f.inst ? `<div>Instituição: ${esc(f.inst)}</div>` : ''}
      ${f.periodo ? `<div>Período: ${esc(f.periodo)}</div>` : ''}
      ${f.situacao ? `<div><strong>${esc(f.situacao)}</strong></div>` : ''}
    </div>
  `).join('')}
</div>` : ''}

        
        ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
        <div>
          <div class="t4-section-title"><i class="fa-solid fa-briefcase"></i>Experiência Profissional</div>
          ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
          <div class="t4-exp-item">
            <div class="t4-exp-dot"><span></span></div>
            <div>
              <div class="t4-job-title">${esc(e.cargo)||'Cargo'}</div>
              <div class="t4-job-company">${esc(e.empresa)||''}</div>
              ${e.periodo ? `<div class="t4-job-period">${esc(e.periodo)}</div>` : ''}
              ${e.desc    ? `<div class="t4-job-desc">${esc(e.desc)}</div>` : ''}
            </div>
          </div>`).join('')}
        </div>` : ''}
        
        ${allSkills.length > 0 ? `
        <div>
          <div class="t4-section-title"><i class="fa-solid fa-star"></i>Habilidades</div>
          ${allSkills.map(sk => `<div class="t4-skill-item" style="color:#333">${esc(sk)}</div>`).join('')}
        </div>` : ''}
        
        ${s.additionalInfo ? `
        <div>
          <div class="t4-section-title"><i class="fa-solid fa-circle-info"></i>Informações Adicionais</div>
          <div class="t4-additional-text">${esc(s.additionalInfo)}</div>
        </div>` : ''}
      </div>
    </div>`;
}

/* ============================================================
   TEMPLATE 5 — MODERN MINIMALIST (REDESIGNED)
   Style: Carte moderne avec ombres, coins arrondis, couleurs douces
   ============================================================ */
function renderTemplate5() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  return `
    <div class="t5-sidebar">
      ${s.photo ? `<div class="t5-photo"><img src="${s.photo}" alt="foto" /></div>` : ''}
      ${s.fullName ? `<div class="t5-name">${esc(s.fullName)}</div>` : ''}
      <div class="t5-hr"></div>
      <div class="t5-section-label"><i class="fa-solid fa-address-card"></i> Contato</div>
      ${s.email    ? `<div class="t5-contact-item"><i class="fa-solid fa-envelope"></i>${esc(s.email)}</div>` : ''}
      ${s.contact1 ? `<div class="t5-contact-item"><i class="fa-solid fa-phone"></i>${esc(s.contact1)}</div>` : ''}
      ${s.contact2 ? `<div class="t5-contact-item"><i class="fa-brands fa-whatsapp"></i>${esc(s.contact2)}</div>` : ''}
      ${s.address  ? `<div class="t5-contact-item"><i class="fa-solid fa-location-dot"></i>${esc(s.address)}</div>` : ''}
      ${(s.birthDate||s.nationality||s.maritalStatus) ? `
      <div class="t5-hr"></div>
      <div class="t5-section-label"><i class="fa-solid fa-user"></i> Pessoal</div>
      ${s.birthDate     ? `<div class="t5-info-row"><i class="fa-regular fa-calendar"></i> ${formatDate(s.birthDate)}</div>` : ''}
      ${s.nationality   ? `<div class="t5-info-row"><i class="fa-solid fa-flag"></i> ${esc(s.nationality)}</div>` : ''}
      ${s.maritalStatus ? `<div class="t5-info-row"><i class="fa-solid fa-heart"></i> ${esc(s.maritalStatus)}</div>` : ''}` : ''}
      ${s.education ? `
      <div class="t5-hr"></div>
      <div class="t5-section-label"><i class="fa-solid fa-graduation-cap"></i> Escolaridade</div>
      <div class="t5-edu-text">${esc(s.education)}</div>` : ''}
      ${s.languages.filter(l=>l.nome).length > 0 ? `
      <div class="t5-hr"></div>
      <div class="t5-section-label"><i class="fa-solid fa-language"></i> Idiomas</div>
      ${s.languages.filter(l=>l.nome).map(l => `
      <div class="t5-lang-item">
        <span>${esc(l.nome)}</span>
        <span class="t5-lang-level">${esc(l.nivel)}</span>
      </div>`).join('')}` : ''}
    </div>
    <div class="t5-main">
      <div class="t5-name-block">
        <div class="t5-hero-name">${esc(s.fullName) || 'Seu Nome'}</div>
        <div class="t5-hero-role">${esc(s.interest) || 'Área de Interesse'}</div>
      </div>
      
      ${s.coverLetter ? `
      <div class="t5-card-section">
        <div class="t5-section-title"><i class="fa-solid fa-quote-left"></i> Apresentação</div>
        <div class="t5-cover-text">${esc(s.coverLetter)}</div>
      </div>` : ''}
      
      ${s.interest ? `
      <div class="t5-card-section">
        <div class="t5-section-title"><i class="fa-solid fa-bullseye"></i> Área de Interesse</div>
        <div class="t5-cover-text">${esc(s.interest)}</div>
      </div>` : ''}
      
      ${s.formations.filter(f => f.curso).length > 0 ? `
      <div class="t5-card-section">
        <div class="t5-section-title"><i class="fa-solid fa-book-open"></i> Formação Profissional</div>
        <div class="t5-formation-list">
          ${s.formations.filter(f => f.curso).map(f => `
          <div class="t5-formation-item">
            <div class="t5-formation-title">${esc(f.curso)}</div>
            ${f.inst ? `<div class="t5-formation-inst"><i class="fa-solid fa-building-columns"></i> ${esc(f.inst)}</div>` : ''}
            ${f.periodo ? `<div class="t5-formation-period"><i class="fa-regular fa-calendar"></i> ${esc(f.periodo)}</div>` : ''}
            ${f.situacao ? `<span class="t5-formation-status ${f.situacao === 'Concluído' ? 'status-success' : 'status-progress'}">${esc(f.situacao)}</span>` : ''}
          </div>
          `).join('')}
        </div>
      </div>` : ''}
      
      ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
      <div class="t5-card-section">
        <div class="t5-section-title"><i class="fa-solid fa-briefcase"></i> Experiência Profissional</div>
        <div class="t5-experience-list">
          ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
          <div class="t5-exp-item">
            <div class="t5-exp-header">
              <div class="t5-job-title">${esc(e.cargo) || 'Cargo'}</div>
              ${e.periodo ? `<div class="t5-job-period">${esc(e.periodo)}</div>` : ''}
            </div>
            <div class="t5-job-company"><i class="fa-solid fa-building"></i> ${esc(e.empresa) || ''}</div>
            ${e.desc ? `<div class="t5-job-desc">${esc(e.desc)}</div>` : ''}
          </div>
          `).join('')}
        </div>
      </div>` : ''}
      
      ${allSkills.length > 0 ? `
      <div class="t5-card-section">
        <div class="t5-section-title"><i class="fa-solid fa-star"></i> Habilidades</div>
        <div class="t5-skills-container">
          ${allSkills.map(sk => `<span class="t5-skill-item">${esc(sk)}</span>`).join('')}
        </div>
      </div>` : ''}
      
      ${s.additionalInfo ? `
      <div class="t5-card-section">
        <div class="t5-section-title"><i class="fa-solid fa-circle-info"></i> Informações Adicionais</div>
        <div class="t5-additional-text">${esc(s.additionalInfo)}</div>
      </div>` : ''}
    </div>`;
}

/* ============================================================
   TEMPLATE 6 — EXECUTIVE STEEL
   ============================================================ */
function renderTemplate6() {
  const s = state;
  const allSkills = [...s.skills, ...s.customSkills];
  return `
    <div class="t6-topbar">
      ${s.photo ? `<div class="t6-photo"><img src="${s.photo}" alt="foto" /></div>` : ''}
      <div class="t6-name-area">
        <div class="t6-hero-name">${esc(s.fullName) || 'Seu Nome'}</div>
        <div class="t6-hero-role"><strong>Área de Interesse:</strong> ${esc(s.interest) || 'Área de Interesse'}</div>
      
      </div>
      <div class="t6-header-contacts">
        ${s.email    ? `<div class="t6-hc-item">${esc(s.email)}<i class="fa-solid fa-envelope"></i></div>` : ''}
        ${s.contact1 ? `<div class="t6-hc-item">${esc(s.contact1)}<i class="fa-solid fa-phone"></i></div>` : ''}
        ${s.contact2 ? `<div class="t6-hc-item">${esc(s.contact2)}<i class="fa-brands fa-whatsapp"></i></div>` : ''}
        ${s.address  ? `<div class="t6-hc-item">${esc(s.address)}<i class="fa-solid fa-location-dot"></i></div>` : ''}
      </div>
    </div>
    <div class="t6-body">
      <div class="t6-sidebar">
        ${(s.birthDate||s.nationality||s.maritalStatus) ? `
        <div>
          <div class="t6-section-label">Pessoal</div>
          ${s.birthDate     ? `<div class="t6-info-row"><b>Nasc.:</b> ${formatDate(s.birthDate)}</div>` : ''}
          ${s.nationality   ? `<div class="t6-info-row"><b>Nac.:</b> ${esc(s.nationality)}</div>` : ''}
          ${s.maritalStatus ? `<div class="t6-info-row"><b>Civil:</b> ${esc(s.maritalStatus)}</div>` : ''}
        </div>` : ''}
        ${s.education ? `
        <div>
          <div class="t6-section-label">Escolaridade</div>
          <div class="t6-edu-text">${esc(s.education)}</div>
        </div>` : ''}
        ${s.languages.filter(l=>l.nome).length > 0 ? `
        <div>
          <div class="t6-section-label">Idiomas</div>
          ${s.languages.filter(l=>l.nome).map(l => `
          <div class="t6-lang-item">
            <span>${esc(l.nome)}</span>
            <span class="t6-lang-level">${esc(l.nivel)}</span>
          </div>`).join('')}
        </div>` : ''}
      </div>
      <div class="t6-main">
        ${s.coverLetter ? `
        <div>
          <div class="t6-section-title"><i class="fa-solid fa-quote-left"></i>Apresentação</div>
          <div class="t6-cover-text">${esc(s.coverLetter)}</div>
        </div>` : ''}
        
        ${s.interest ? `
        <div>
          <div class="t6-section-title"><i class="fa-solid fa-bullseye"></i>Área de Interesse</div>
          <div class="t6-cover-text">${esc(s.interest)}</div>
        </div>` : ''}
        
${s.formations.filter(f => f.curso).length > 0 ? `
<div>
  <div class="t6-section-title">
    <i class="fa-solid fa-book-open"></i> Formação Profissional
  </div>

  ${s.formations.filter(f => f.curso).map(f => `
    <div class="t6-cover-text" style="margin-bottom:12px;">
      <strong>${esc(f.curso)}</strong><br>

      ${f.inst ? `Instituição: ${esc(f.inst)}<br>` : ''}
      ${f.periodo ? `Período: ${esc(f.periodo)}<br>` : ''}
      ${f.situacao ? `Situação: ${esc(f.situacao)}` : ''}
    </div>
  `).join('')}
</div>
` : ''}

        ${s.experiences.filter(e=>e.empresa||e.cargo).length > 0 ? `
        <div>
          <div class="t6-section-title"><i class="fa-solid fa-briefcase"></i>Experiência Profissional</div>
          ${s.experiences.filter(e=>e.empresa||e.cargo).map(e => `
          <div class="t6-exp-card">
            <div class="t6-job-title">${esc(e.cargo)||'Cargo'}</div>
            <div class="t6-job-company">${esc(e.empresa)||''}</div>
            ${e.periodo ? `<div class="t6-job-period">${esc(e.periodo)}</div>` : ''}
            ${e.desc    ? `<div class="t6-job-desc">${esc(e.desc)}</div>` : ''}
          </div>`).join('')}
        </div>` : ''}
        
        ${allSkills.length > 0 ? `
        <div>
          <div class="t6-section-title"><i class="fa-solid fa-star"></i>Habilidades</div>
          <div>${allSkills.map(sk => `<span class="t6-skill-chip">${esc(sk)}</span>`).join('')}</div>
        </div>` : ''}
        
        ${s.additionalInfo ? `
        <div>
          <div class="t6-section-title"><i class="fa-solid fa-circle-info"></i>Informações Adicionais</div>
          <div class="t6-additional-text">${esc(s.additionalInfo)}</div>
        </div>` : ''}
      </div>
    </div>`;
}

/* ============================================================
   EXPORT PDF
   ============================================================ */
async function exportPDF() {
  if (!validate()) return;

  const loading = document.createElement('div');
  loading.className = 'pdf-loading';
  loading.innerHTML = `<div class="spinner"></div><span>Gerando PDF de alta qualidade...</span>`;
  document.body.appendChild(loading);

  try {
    const cv = document.getElementById('cvPreview');
    // temporarily reset scaling
    const origTransform = cv.style.transform;
    cv.style.transform = 'none';
    cv.style.width = '794px';
    cv.style.height = '1123px';

    await new Promise(r => setTimeout(r, 200));

    const canvas = await html2canvas(cv, {
      scale: 4,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width: 794,
      height: 1123,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
      windowHeight: 1123
    });

    cv.style.transform = origTransform;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

    const name = state.fullName.trim() || 'curriculo';
    pdf.save(`${name.replace(/\s+/g, '_')}_CV.pdf`);
    showToast('PDF exportado com sucesso!');
  } catch (err) {
    showToast('Erro ao gerar PDF. Tente novamente.', true);
    console.error(err);
  } finally {
    loading.remove();
  }
}

/* ============================================================
   SAVE / LOAD / RESET
   ============================================================ */
function saveData() {
  collectState();
  try {
    const data = {
      ...state,
      expCount,
      langCount,
      formHTML_exp: document.getElementById('experiencesList').innerHTML,
      formHTML_lang: document.getElementById('languagesList').innerHTML,
      formHTML_customSkills: document.getElementById('customSkills').innerHTML,
      formHTML_formacao: document.getElementById('formacaoList').innerHTML,
      formHTML_skillChecks: getCheckedSkills()
    };
    localStorage.setItem('cvBuilderPro', JSON.stringify(data));
    showToast('Dados salvos com sucesso!');
  } catch (e) {
    showToast('Erro ao salvar dados.', true);
  }
}

function getCheckedSkills() {
  const checked = [];
  document.querySelectorAll('#skillsChecklist input[type="checkbox"]').forEach(cb => {
    if (cb.checked) checked.push(cb.value);
  });
  return checked;
}

function loadData() {
  try {
    const raw = localStorage.getItem('cvBuilderPro');
    if (!raw) return;
    const data = JSON.parse(raw);

    // restore state
    Object.assign(state, data);

    // restore form fields
    setVal('fullName', state.fullName);
    setVal('email', state.email);
    setVal('contact1', state.contact1);
    setVal('contact2', state.contact2);
    setVal('birthDate', state.birthDate);
    setVal('nationality', state.nationality);
    setVal('maritalStatus', state.maritalStatus);
    setVal('address', state.address);
    setVal('interest', state.interest);
    setVal('education', state.education);
    setVal('coverLetter', state.coverLetter);
    setVal('additionalInfo', state.additionalInfo);

    // template
    if (state.template) selectTemplate(state.template);

    // photo
    if (state.photo) {
      const prev = document.getElementById('photoPreview');
      prev.innerHTML = `<img src="${state.photo}" alt="foto" />`;
    }

    // skill checkboxes
    if (data.formHTML_skillChecks) {
      document.querySelectorAll('#skillsChecklist input[type="checkbox"]').forEach(cb => {
        cb.checked = data.formHTML_skillChecks.includes(cb.value);
      });
    }

    // restore HTML for dynamic sections
    if (data.formHTML_exp) {
      document.getElementById('experiencesList').innerHTML = data.formHTML_exp;
      // reattach events
      document.querySelectorAll('[id^="exp-desc-"]').forEach(ta => {
        const id = ta.id.replace('exp-desc-', '');
        ta.addEventListener('input', () => { updateExpChar(id); updatePreview(); });
      });
      document.querySelectorAll('[id^="exp-empresa-"],[id^="exp-cargo-"],[id^="exp-periodo-"]').forEach(el => {
        el.addEventListener('input', updatePreview);
      });
      document.querySelectorAll('#experiencesList select').forEach(el => {
        el.addEventListener('change', updatePreview);
      });
    }
    if (data.formHTML_lang) {
      document.getElementById('languagesList').innerHTML = data.formHTML_lang;
      document.querySelectorAll('#languagesList select').forEach(el => {
        el.addEventListener('change', updatePreview);
      });
    }
    if (data.formHTML_customSkills) {
      document.getElementById('customSkills').innerHTML = data.formHTML_customSkills;
      document.querySelectorAll('#customSkills input').forEach(el => {
        el.addEventListener('input', updatePreview);
      });
    }

    if (data.expCount) expCount = data.expCount;
    if (data.langCount) langCount = data.langCount;
    if (expCount >= 3) document.getElementById('addExpBtn').style.display = 'none';

  } catch (e) {
    console.warn('Load error:', e);
  }
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined && val !== null) el.value = val;
}

function resetData() {
  if (!confirm('Tem certeza que deseja apagar todos os dados?')) return;
  localStorage.removeItem('cvBuilderPro');
  location.reload();
}

/* ============================================================
   AUTO SAVE
   ============================================================ */
function scheduleAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    try {
      collectState();
      const data = {
        ...state,
        expCount,
        langCount,
        formHTML_exp: document.getElementById('experiencesList').innerHTML,
        formHTML_lang: document.getElementById('languagesList').innerHTML,
        formHTML_formacao: document.getElementById('formacaoList').innerHTML,
        formHTML_customSkills: document.getElementById('customSkills').innerHTML,
        formHTML_skillChecks: getCheckedSkills()
      };
      localStorage.setItem('cvBuilderPro', JSON.stringify(data));
    } catch(e){}
  }, 1500);
}

/* ============================================================
   VALIDATION
   ============================================================ */
function validate() {
  const name = document.getElementById('fullName')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  if (!name) {
    showToast('Nome completo é obrigatório!', true);
    document.getElementById('fullName')?.focus();
    return false;
  }
  if (!email) {
    showToast('Email é obrigatório!', true);
    document.getElementById('email')?.focus();
    return false;
  }
  return true;
}

/* ============================================================
   UTILS
   ============================================================ */
function esc(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(d) {
  if (!d) return '';
  try {
    const [y,m,day] = d.split('-');
    return `${day}/${m}/${y}`;
  } catch { return d; }
}

function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}
/* ============================================================
   FORMAÇÃO PROFISSIONAL
   ============================================================ */
let formacaoCount = 0;

function addFormacao() {
  formacaoCount++;
  const id = formacaoCount;
  const div = document.createElement('div');
  div.className = 'exp-card';
  div.id = `formacao-${id}`;
  div.innerHTML = `
    <div class="exp-header">
      <span>Formação ${id}</span>
      <button class="btn-remove" onclick="removeFormacao(${id})">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group full">
        <label>Curso</label>
        <input type="text" id="form-curso-${id}"
          placeholder="Ex: Técnico em Administração"
          oninput="updatePreview()" />
      </div>
      <div class="form-group">
        <label>Instituição</label>
        <input type="text" id="form-inst-${id}"
          placeholder="Ex: SENAI"
          oninput="updatePreview()" />
      </div>
      <div class="form-group">
        <label>Período</label>
        <input type="text" id="form-periodo-${id}"
          placeholder="Ex: 2023–2025"
          oninput="updatePreview()" />
      </div>
      <div class="form-group full">
        <label>Situação</label>
        <select id="form-situacao-${id}" onchange="updatePreview()">
          <option value="">Selecionar</option>
          <option value="Concluído">Concluído</option>
          <option value="Em andamento">Em andamento</option>
          <option value="Trancado">Trancado</option>
        </select>
      </div>
    </div>`;
  document.getElementById('formacaoList').appendChild(div);
}

function removeFormacao(id) {
  document.getElementById(`formacao-${id}`)?.remove();
  formacaoCount = Math.max(0, formacaoCount - 1);
  updatePreview();
}
/* ============================================================
   FUNÇÃO PARA AJUSTAR ESPAÇAMENTO (VERSÃO MELHORADA)
   ============================================================ */
function adjustSectionSpacing() {
  const cv = document.getElementById('cvPreview');
  if (!cv) return;
  
  // Vérification détaillée des sections
  const sections = {
    coverLetter: state.coverLetter && state.coverLetter.trim() !== '',
    interest: state.interest && state.interest.trim() !== '',
    experiences: state.experiences && state.experiences.filter(e => e.empresa || e.cargo).length > 0,
    formations: state.formations && state.formations.filter(f => f.curso).length > 0,
    skills: (state.skills.length > 0 || state.customSkills.length > 0),
    additionalInfo: state.additionalInfo && state.additionalInfo.trim() !== ''
  };
  
  // Compte les sections manquantes
  const missingSections = Object.values(sections).filter(v => !v).length;
  
  // Calcul de l'espacement vertical supplémentaire (en px)
  let verticalSpacing = 12; // base
  if (missingSections === 1) verticalSpacing = 20;
  else if (missingSections === 2) verticalSpacing = 28;
  else if (missingSections === 3) verticalSpacing = 36;
  else if (missingSections >= 4) verticalSpacing = 44;
  
  // Applique l'espacement selon le template
  const template = state.template;
  let container = null;
  
  switch(template) {
    case 1:
      container = cv.querySelector('.t1-body');
      if (container) container.style.gap = `${verticalSpacing}px`;
      break;
    case 2:
      container = cv.querySelector('.t2-main');
      if (container) {
        const sections = container.querySelectorAll(':scope > div');
        sections.forEach((section, index) => {
          if (index < sections.length - 1) {
            section.style.marginBottom = `${verticalSpacing}px`;
          }
        });
      }
      break;
    case 3:
      container = cv.querySelector('.t3-main');
      if (container) container.style.gap = `${verticalSpacing}px`;
      break;
    case 4:
      container = cv.querySelector('.t4-body');
      if (container) container.style.gap = `${verticalSpacing}px`;
      break;
    case 5:
      container = cv.querySelector('.t5-main');
      if (container) container.style.gap = `${verticalSpacing}px`;
      break;
    case 6:
      container = cv.querySelector('.t6-main');
      if (container) container.style.gap = `${verticalSpacing}px`;
      break;
  }
  
  // Ajuste supplémentaire pour les sections qui existent
  // pour mieux répartir l'espace vertical
  const activeSectionsCount = Object.values(sections).filter(v => v).length;
  
  if (activeSectionsCount <= 3 && container) {
    // Si très peu de sections, ajoute un padding-bottom supplémentaire
    container.style.paddingBottom = `${30 + (4 - activeSectionsCount) * 10}px`;
  }
}