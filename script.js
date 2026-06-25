// ════ ESTADO ════
let activeSection = 0;
let selectedTemplate = 'moderno';
let expItems = [], eduItems = [], idiItems = [], projItems = [];

// ════ TEMA ════
const savedTheme = localStorage.getItem('cvb_theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
document.getElementById('themeBtn').textContent = savedTheme === 'dark' ? '🌙' : '☀️';

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('cvb_theme', next);
  document.getElementById('themeBtn').textContent = next === 'dark' ? '🌙' : '☀️';
}

// ════ NAVEGAÇÃO ════
function goSection(n) {
  document.querySelectorAll('.form-section').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.snav-btn').forEach(el => el.classList.remove('active'));
  document.getElementById('sec-' + n).classList.add('active');
  document.querySelectorAll('.snav-btn')[n].classList.add('active');
  activeSection = n;
}

// ════ AUTO SAVE (localStorage) ════
function autoSave() {
  const data = collectData();
  localStorage.setItem('cvb_draft', JSON.stringify(data));
}

function loadDraft() {
  const raw = localStorage.getItem('cvb_draft');
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    ['nome','cargo','cidade','email','tel','linkedin','github','resumo','skillsTec','skillsSoft'].forEach(id => {
      const el = document.getElementById(id);
      if (el && d[id]) el.value = d[id];
    });
    (d.exp || []).forEach(e => addExp(e));
    (d.edu || []).forEach(e => addEdu(e));
    (d.idi || []).forEach(e => addIdi(e));
    (d.proj || []).forEach(e => addProj(e));
    if (d.template) selectTemplate(d.template);
  } catch(e) {}
}

// ════ ITENS DINÂMICOS ════
let expCount = 0, eduCount = 0, idiCount = 0, projCount = 0;

function addExp(data = {}) {
  const id = expCount++;
  expItems.push(id);
  const el = document.createElement('div');
  el.className = 'dyn-item';
  el.id = 'exp-' + id;
  el.innerHTML = `
    <div class="dyn-item-header">
      <div class="dyn-item-title">Experiência ${expItems.length}</div>
      <button class="btn-remove" onclick="removeItem('exp',${id})">✕</button>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Cargo</label><input type="text" id="exp-cargo-${id}" placeholder="Desenvolvedora Front-end" value="${data.cargo||''}" oninput="autoSave()"/></div>
      <div class="form-group"><label>Empresa</label><input type="text" id="exp-empresa-${id}" placeholder="Empresa LTDA" value="${data.empresa||''}" oninput="autoSave()"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Início</label><input type="month" id="exp-ini-${id}" value="${data.ini||''}" oninput="autoSave()"/></div>
      <div class="form-group"><label>Fim</label><input type="month" id="exp-fim-${id}" value="${data.fim||''}" oninput="autoSave()" placeholder="Atual"/> <label style="margin-top:6px;text-transform:none;font-size:.73rem"><input type="checkbox" id="exp-atual-${id}" ${data.atual?'checked':''} onchange="autoSave()" style="width:auto;margin-right:5px"/>Trabalho atual</label></div>
    </div>
    <div class="form-group"><label>Descrição</label><textarea id="exp-desc-${id}" rows="3" placeholder="Descreva suas responsabilidades e conquistas..." oninput="autoSave()">${data.desc||''}</textarea></div>`;
  document.getElementById('expList').appendChild(el);
}

function addEdu(data = {}) {
  const id = eduCount++;
  eduItems.push(id);
  const el = document.createElement('div');
  el.className = 'dyn-item';
  el.id = 'edu-' + id;
  el.innerHTML = `
    <div class="dyn-item-header">
      <div class="dyn-item-title">Formação ${eduItems.length}</div>
      <button class="btn-remove" onclick="removeItem('edu',${id})">✕</button>
    </div>
    <div class="form-group"><label>Curso / Grau</label><input type="text" id="edu-curso-${id}" placeholder="Ciência da Computação" value="${data.curso||''}" oninput="autoSave()"/></div>
    <div class="form-row">
      <div class="form-group"><label>Instituição</label><input type="text" id="edu-inst-${id}" placeholder="CEUB" value="${data.inst||''}" oninput="autoSave()"/></div>
      <div class="form-group"><label>Período</label><input type="text" id="edu-periodo-${id}" placeholder="2022 – 2026" value="${data.periodo||''}" oninput="autoSave()"/></div>
    </div>`;
  document.getElementById('eduList').appendChild(el);
}

function addIdi(data = {}) {
  const id = idiCount++;
  idiItems.push(id);
  const el = document.createElement('div');
  el.className = 'dyn-item';
  el.id = 'idi-' + id;
  el.innerHTML = `
    <div class="dyn-item-header">
      <div class="dyn-item-title">Idioma ${idiItems.length}</div>
      <button class="btn-remove" onclick="removeItem('idi',${id})">✕</button>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Idioma</label><input type="text" id="idi-nome-${id}" placeholder="Inglês" value="${data.nome||''}" oninput="autoSave()"/></div>
      <div class="form-group"><label>Nível</label>
        <select id="idi-nivel-${id}" onchange="autoSave()">
          <option value="Básico" ${data.nivel==='Básico'?'selected':''}>Básico</option>
          <option value="Intermediário" ${data.nivel==='Intermediário'?'selected':''}>Intermediário</option>
          <option value="Avançado" ${data.nivel==='Avançado'?'selected':''}>Avançado</option>
          <option value="Fluente" ${data.nivel==='Fluente'?'selected':''}>Fluente</option>
          <option value="Nativo" ${data.nivel==='Nativo'?'selected':''}>Nativo</option>
        </select>
      </div>
    </div>`;
  document.getElementById('idiList').appendChild(el);
}

function addProj(data = {}) {
  const id = projCount++;
  projItems.push(id);
  const el = document.createElement('div');
  el.className = 'dyn-item';
  el.id = 'proj-' + id;
  el.innerHTML = `
    <div class="dyn-item-header">
      <div class="dyn-item-title">Projeto ${projItems.length}</div>
      <button class="btn-remove" onclick="removeItem('proj',${id})">✕</button>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Nome do projeto</label><input type="text" id="proj-nome-${id}" placeholder="FinTrack" value="${data.nome||''}" oninput="autoSave()"/></div>
      <div class="form-group"><label>Tecnologias</label><input type="text" id="proj-tech-${id}" placeholder="HTML, CSS, JS" value="${data.tech||''}" oninput="autoSave()"/></div>
    </div>
    <div class="form-group"><label>Link</label><input type="text" id="proj-link-${id}" placeholder="github.com/ana/fintrack" value="${data.link||''}" oninput="autoSave()"/></div>
    <div class="form-group"><label>Descrição</label><textarea id="proj-desc-${id}" rows="2" placeholder="Breve descrição do projeto..." oninput="autoSave()">${data.desc||''}</textarea></div>`;
  document.getElementById('projList').appendChild(el);
}

function removeItem(type, id) {
  const el = document.getElementById(type + '-' + id);
  if (el) el.remove();
  if (type === 'exp') expItems = expItems.filter(i => i !== id);
  if (type === 'edu') eduItems = eduItems.filter(i => i !== id);
  if (type === 'idi') idiItems = idiItems.filter(i => i !== id);
  if (type === 'proj') projItems = projItems.filter(i => i !== id);
  autoSave();
}

// ════ TEMPLATE ════
function selectTemplate(t) {
  selectedTemplate = t;
  document.querySelectorAll('input[name="template"]').forEach(r => r.checked = r.value === t);
  autoSave();
}

// ════ COLETA DE DADOS ════
function collectData() {
  const g = id => (document.getElementById(id) || {}).value || '';

  const exp = expItems.map(id => ({
    cargo: g('exp-cargo-' + id),
    empresa: g('exp-empresa-' + id),
    ini: g('exp-ini-' + id),
    fim: g('exp-fim-' + id),
    atual: !!(document.getElementById('exp-atual-' + id) || {}).checked,
    desc: g('exp-desc-' + id)
  })).filter(e => e.cargo || e.empresa);

  const edu = eduItems.map(id => ({
    curso: g('edu-curso-' + id),
    inst: g('edu-inst-' + id),
    periodo: g('edu-periodo-' + id)
  })).filter(e => e.curso || e.inst);

  const idi = idiItems.map(id => ({
    nome: g('idi-nome-' + id),
    nivel: g('idi-nivel-' + id)
  })).filter(e => e.nome);

  const proj = projItems.map(id => ({
    nome: g('proj-nome-' + id),
    tech: g('proj-tech-' + id),
    link: g('proj-link-' + id),
    desc: g('proj-desc-' + id)
  })).filter(e => e.nome);

  return {
    nome: g('nome'), cargo: g('cargo'), cidade: g('cidade'),
    email: g('email'), tel: g('tel'), linkedin: g('linkedin'), github: g('github'),
    resumo: g('resumo'),
    skillsTec: g('skillsTec'), skillsSoft: g('skillsSoft'),
    exp, edu, idi, proj, template: selectedTemplate
  };
}

function fmtMonth(ym) {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  return new Date(y, m - 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

// ════ GERAÇÃO DO CURRÍCULO ════
function generateCV() {
  const d = collectData();
  if (!d.nome) { showToast('⚠️ Informe ao menos seu nome.'); goSection(0); return; }

  let html = '';
  if (selectedTemplate === 'moderno') html = tplModerno(d);
  else if (selectedTemplate === 'minimalista') html = tplMinimalista(d);
  else html = tplCriativo(d);

  document.getElementById('cvOutput').innerHTML = html;
  document.getElementById('welcomeScreen').style.display = 'none';
  document.getElementById('cvPreviewWrap').style.display = 'block';
  document.querySelector('.main-area').scrollTop = 0;
  showToast('✅ Currículo gerado!');
}

function backToEdit() {
  document.getElementById('cvPreviewWrap').style.display = 'none';
  document.getElementById('welcomeScreen').style.display = 'block';
}

function exportPDF() {
  window.print();
}

// ════ TEMPLATE: MODERNO ════
function tplModerno(d) {
  const skills = d.skillsTec ? d.skillsTec.split(',').map(s => s.trim()).filter(Boolean) : [];
  const softs  = d.skillsSoft ? d.skillsSoft.split(',').map(s => s.trim()).filter(Boolean) : [];

  const sidebar = `
    <div style="width:200px;min-height:100%;background:linear-gradient(160deg,#1e1b4b,#312e81);color:#e0e7ff;padding:28px 20px;flex-shrink:0">
      <div style="width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:800;margin:0 auto 16px;font-family:'Syne',sans-serif;color:#fff">${d.nome ? d.nome.charAt(0).toUpperCase() : '?'}</div>
      ${d.cargo ? `<div style="font-size:.75rem;text-align:center;color:#c7d2fe;margin-bottom:20px;line-height:1.4">${d.cargo}</div>` : ''}
      ${d.cidade||d.email||d.tel||d.linkedin||d.github ? `
      <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#818cf8;margin-bottom:10px">Contato</div>
      <div style="display:flex;flex-direction:column;gap:6px;font-size:.73rem;color:#c7d2fe;word-break:break-word">
        ${d.cidade ? `<span>📍 ${d.cidade}</span>` : ''}
        ${d.email ? `<span>✉️ ${d.email}</span>` : ''}
        ${d.tel ? `<span>📞 ${d.tel}</span>` : ''}
        ${d.linkedin ? `<span>💼 ${d.linkedin}</span>` : ''}
        ${d.github ? `<span>💻 ${d.github}</span>` : ''}
      </div>` : ''}
      ${skills.length ? `
      <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#818cf8;margin:18px 0 10px">Skills</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${skills.map(s => `<div style="font-size:.72rem;color:#e0e7ff;padding:4px 8px;background:rgba(255,255,255,.1);border-radius:4px">${s}</div>`).join('')}
      </div>` : ''}
      ${softs.length ? `
      <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#818cf8;margin:16px 0 10px">Soft Skills</div>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${softs.map(s => `<div style="font-size:.72rem;color:#c7d2fe">${s}</div>`).join('')}
      </div>` : ''}
      ${d.idi.length ? `
      <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#818cf8;margin:16px 0 10px">Idiomas</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${d.idi.map(i => `<div><div style="font-size:.73rem;color:#e0e7ff">${i.nome}</div><div style="font-size:.68rem;color:#a5b4fc">${i.nivel}</div></div>`).join('')}
      </div>` : ''}
    </div>`;

  const body = `
    <div style="flex:1;padding:32px 28px;font-family:'Inter',sans-serif">
      <h1 style="font-family:'Syne',sans-serif;font-size:1.9rem;font-weight:800;color:#1e1b4b;letter-spacing:-.02em;margin-bottom:4px">${d.nome || ''}</h1>
      ${d.cargo ? `<div style="font-size:.88rem;color:#6366f1;font-weight:600;margin-bottom:${d.resumo?'14px':'0'}">${d.cargo}</div>` : ''}
      ${d.resumo ? `<p style="font-size:.82rem;color:#44446a;line-height:1.7;margin-bottom:22px;border-left:3px solid #6366f1;padding-left:12px">${d.resumo}</p>` : ''}

      ${d.exp.length ? `
      <div style="margin-bottom:22px">
        <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#6366f1;border-bottom:2px solid #e0e7ff;padding-bottom:5px;margin-bottom:14px">Experiência Profissional</div>
        ${d.exp.map(e => `
          <div style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;align-items:baseline">
              <div style="font-weight:700;font-size:.88rem;color:#1e1b4b">${e.cargo}</div>
              <div style="font-size:.73rem;color:#818cf8;white-space:nowrap;margin-left:8px">${fmtMonth(e.ini)} – ${e.atual ? 'Atual' : fmtMonth(e.fim)}</div>
            </div>
            <div style="font-size:.8rem;color:#6366f1;margin-bottom:4px">${e.empresa}</div>
            ${e.desc ? `<div style="font-size:.8rem;color:#44446a;line-height:1.6">${e.desc}</div>` : ''}
          </div>`).join('')}
      </div>` : ''}

      ${d.edu.length ? `
      <div style="margin-bottom:22px">
        <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#6366f1;border-bottom:2px solid #e0e7ff;padding-bottom:5px;margin-bottom:14px">Formação Acadêmica</div>
        ${d.edu.map(e => `
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:baseline">
              <div style="font-weight:700;font-size:.85rem;color:#1e1b4b">${e.curso}</div>
              <div style="font-size:.73rem;color:#818cf8">${e.periodo}</div>
            </div>
            <div style="font-size:.8rem;color:#6366f1">${e.inst}</div>
          </div>`).join('')}
      </div>` : ''}

      ${d.proj.length ? `
      <div>
        <div style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#6366f1;border-bottom:2px solid #e0e7ff;padding-bottom:5px;margin-bottom:14px">Projetos</div>
        ${d.proj.map(p => `
          <div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:4px">
              <div style="font-weight:700;font-size:.85rem;color:#1e1b4b">${p.nome}</div>
              ${p.link ? `<div style="font-size:.72rem;color:#818cf8">${p.link}</div>` : ''}
            </div>
            ${p.tech ? `<div style="font-size:.73rem;color:#6366f1;margin-bottom:3px">${p.tech}</div>` : ''}
            ${p.desc ? `<div style="font-size:.8rem;color:#44446a;line-height:1.6">${p.desc}</div>` : ''}
          </div>`).join('')}
      </div>` : ''}
    </div>`;

  return `<div style="display:flex;min-height:800px;background:#fff;font-family:'Inter',sans-serif">${sidebar}${body}</div>`;
}

// ════ TEMPLATE: MINIMALISTA ════
function tplMinimalista(d) {
  const skills = d.skillsTec ? d.skillsTec.split(',').map(s => s.trim()).filter(Boolean) : [];
  const softs  = d.skillsSoft ? d.skillsSoft.split(',').map(s => s.trim()).filter(Boolean) : [];
  const contacts = [d.cidade, d.email, d.tel, d.linkedin, d.github].filter(Boolean);

  return `<div style="background:#fff;padding:48px 52px;min-height:800px;font-family:'Inter',sans-serif;color:#111">
    <div style="border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:24px">
      <h1 style="font-family:'DM Serif Display',serif;font-size:2.4rem;letter-spacing:-.02em;color:#111;margin-bottom:6px">${d.nome || ''}</h1>
      ${d.cargo ? `<div style="font-size:.88rem;color:#555;letter-spacing:.04em;text-transform:uppercase;font-weight:500">${d.cargo}</div>` : ''}
      ${contacts.length ? `<div style="margin-top:10px;font-size:.76rem;color:#777;display:flex;flex-wrap:wrap;gap:0">${contacts.map((c,i) => `<span>${c}${i<contacts.length-1?' &nbsp;·&nbsp; ':''}</span>`).join('')}</div>` : ''}
    </div>
    ${d.resumo ? `<p style="font-size:.84rem;color:#444;line-height:1.8;margin-bottom:28px">${d.resumo}</p>` : ''}

    ${d.exp.length ? `
    <div style="margin-bottom:28px">
      <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#999;margin-bottom:14px">Experiência</div>
      ${d.exp.map(e => `
        <div style="margin-bottom:16px;display:flex;gap:20px">
          <div style="font-size:.76rem;color:#999;white-space:nowrap;min-width:100px;padding-top:2px">${fmtMonth(e.ini)}<br>${e.atual ? 'Atual' : fmtMonth(e.fim)}</div>
          <div>
            <div style="font-weight:700;font-size:.88rem;color:#111">${e.cargo}</div>
            <div style="font-size:.8rem;color:#555;margin-bottom:4px">${e.empresa}</div>
            ${e.desc ? `<div style="font-size:.8rem;color:#444;line-height:1.65">${e.desc}</div>` : ''}
          </div>
        </div>`).join('')}
    </div>` : ''}

    ${d.edu.length ? `
    <div style="margin-bottom:28px">
      <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#999;margin-bottom:14px">Formação</div>
      ${d.edu.map(e => `
        <div style="margin-bottom:12px;display:flex;gap:20px">
          <div style="font-size:.76rem;color:#999;white-space:nowrap;min-width:100px;padding-top:2px">${e.periodo}</div>
          <div>
            <div style="font-weight:700;font-size:.86rem;color:#111">${e.curso}</div>
            <div style="font-size:.8rem;color:#555">${e.inst}</div>
          </div>
        </div>`).join('')}
    </div>` : ''}

    <div style="display:grid;grid-template-columns:${(skills.length || softs.length) && d.idi.length ? '1fr 1fr' : '1fr'};gap:24px">
      ${skills.length || softs.length ? `
      <div>
        <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#999;margin-bottom:12px">Habilidades</div>
        ${skills.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">${skills.map(s=>`<span style="font-size:.75rem;border:1px solid #ddd;border-radius:4px;padding:3px 9px;color:#333">${s}</span>`).join('')}</div>` : ''}
        ${softs.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px">${softs.map(s=>`<span style="font-size:.75rem;background:#f4f4f4;border-radius:4px;padding:3px 9px;color:#555">${s}</span>`).join('')}</div>` : ''}
      </div>` : ''}
      ${d.idi.length ? `
      <div>
        <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#999;margin-bottom:12px">Idiomas</div>
        ${d.idi.map(i=>`<div style="display:flex;justify-content:space-between;font-size:.82rem;color:#333;margin-bottom:6px;border-bottom:1px solid #f0f0f0;padding-bottom:5px"><span>${i.nome}</span><span style="color:#999">${i.nivel}</span></div>`).join('')}
      </div>` : ''}
    </div>

    ${d.proj.length ? `
    <div style="margin-top:28px">
      <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#999;margin-bottom:14px">Projetos</div>
      ${d.proj.map(p=>`
        <div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;align-items:baseline">
            <div style="font-weight:700;font-size:.86rem;color:#111">${p.nome}</div>
            ${p.link ? `<div style="font-size:.73rem;color:#999">${p.link}</div>` : ''}
          </div>
          ${p.tech ? `<div style="font-size:.76rem;color:#777;margin-bottom:3px">${p.tech}</div>` : ''}
          ${p.desc ? `<div style="font-size:.8rem;color:#444;line-height:1.6">${p.desc}</div>` : ''}
        </div>`).join('')}
    </div>` : ''}
  </div>`;
}

// ════ TEMPLATE: CRIATIVO ════
function tplCriativo(d) {
  const skills = d.skillsTec ? d.skillsTec.split(',').map(s => s.trim()).filter(Boolean) : [];
  const softs  = d.skillsSoft ? d.skillsSoft.split(',').map(s => s.trim()).filter(Boolean) : [];
  const contacts = [
    d.cidade ? `📍 ${d.cidade}` : '',
    d.email ? `✉️ ${d.email}` : '',
    d.tel ? `📞 ${d.tel}` : '',
    d.linkedin ? `💼 ${d.linkedin}` : '',
    d.github ? `💻 ${d.github}` : ''
  ].filter(Boolean);

  const section = (title, content) => `
    <div style="margin-bottom:24px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div style="height:2px;width:28px;background:linear-gradient(90deg,#7c6af7,#f472b6);border-radius:1px"></div>
        <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#7c6af7">${title}</div>
      </div>
      ${content}
    </div>`;

  return `<div style="background:#fff;min-height:800px;font-family:'Space Grotesk',sans-serif;color:#111">
    <div style="background:linear-gradient(135deg,#7c6af7 0%,#a855f7 50%,#f472b6 100%);padding:36px 40px 28px;color:#fff">
      <h1 style="font-size:2.2rem;font-weight:700;letter-spacing:-.03em;margin-bottom:5px;line-height:1.1">${d.nome || ''}</h1>
      ${d.cargo ? `<div style="font-size:.9rem;opacity:.85;margin-bottom:14px;font-weight:500">${d.cargo}</div>` : ''}
      ${contacts.length ? `<div style="display:flex;flex-wrap:wrap;gap:10px">${contacts.map(c=>`<span style="font-size:.73rem;background:rgba(255,255,255,.18);border-radius:20px;padding:4px 12px">${c}</span>`).join('')}</div>` : ''}
    </div>

    <div style="padding:28px 40px">
      ${d.resumo ? `<div style="background:#faf5ff;border-left:4px solid #7c6af7;padding:14px 16px;border-radius:0 8px 8px 0;font-size:.84rem;color:#444;line-height:1.7;margin-bottom:26px">${d.resumo}</div>` : ''}

      <div style="display:grid;grid-template-columns:1fr 200px;gap:28px">
        <div>
          ${d.exp.length ? section('Experiência', d.exp.map(e=>`
            <div style="margin-bottom:16px;padding:14px;border:1px solid #f0e6ff;border-radius:10px;background:#fdf9ff">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:4px;margin-bottom:4px">
                <div style="font-weight:700;font-size:.88rem;color:#3b0764">${e.cargo}</div>
                <div style="font-size:.72rem;background:#ede9fe;color:#7c6af7;padding:2px 8px;border-radius:10px">${fmtMonth(e.ini)} – ${e.atual ? 'Atual' : fmtMonth(e.fim)}</div>
              </div>
              <div style="font-size:.8rem;color:#7c6af7;margin-bottom:5px;font-weight:600">${e.empresa}</div>
              ${e.desc ? `<div style="font-size:.79rem;color:#555;line-height:1.65">${e.desc}</div>` : ''}
            </div>`).join('')) : ''}

          ${d.proj.length ? section('Projetos', d.proj.map(p=>`
            <div style="margin-bottom:12px;padding:12px;border:1px solid #fce7f3;border-radius:10px;background:#fff9fb">
              <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:3px">
                <div style="font-weight:700;font-size:.86rem;color:#3b0764">${p.nome}</div>
                ${p.link ? `<div style="font-size:.72rem;color:#a855f7">${p.link}</div>` : ''}
              </div>
              ${p.tech ? `<div style="font-size:.73rem;color:#ec4899;font-weight:600;margin-bottom:3px">${p.tech}</div>` : ''}
              ${p.desc ? `<div style="font-size:.79rem;color:#555;line-height:1.6">${p.desc}</div>` : ''}
            </div>`).join('')) : ''}

          ${d.edu.length ? section('Formação', d.edu.map(e=>`
            <div style="margin-bottom:10px">
              <div style="font-weight:700;font-size:.86rem;color:#3b0764">${e.curso}</div>
              <div style="font-size:.8rem;color:#7c6af7">${e.inst}</div>
              <div style="font-size:.73rem;color:#999">${e.periodo}</div>
            </div>`).join('')) : ''}
        </div>

        <div>
          ${skills.length ? section('Skills', `<div style="display:flex;flex-direction:column;gap:5px">${skills.map(s=>`<div style="font-size:.75rem;padding:5px 10px;background:linear-gradient(90deg,#ede9fe,#fce7f3);border-radius:6px;color:#5b21b6;font-weight:500">${s}</div>`).join('')}</div>`) : ''}

          ${softs.length ? section('Soft Skills', `<div style="display:flex;flex-direction:column;gap:4px">${softs.map(s=>`<div style="font-size:.75rem;color:#555">— ${s}</div>`).join('')}</div>`) : ''}

          ${d.idi.length ? section('Idiomas', d.idi.map(i=>`
            <div style="margin-bottom:8px">
              <div style="font-size:.82rem;font-weight:600;color:#3b0764">${i.nome}</div>
              <div style="font-size:.7rem;color:#a855f7">${i.nivel}</div>
            </div>`).join('')) : ''}
        </div>
      </div>
    </div>
  </div>`;
}

// ════ UTILS ════
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

// ════ INIT ════
loadDraft();
