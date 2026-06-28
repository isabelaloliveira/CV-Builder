// Guarda o número da seção que está aberta agora (0 a 6)
let activeSection = 0;

// Guarda o nome do template de currículo escolhido pelo usuário
let selectedTemplate = 'moderno';

// Arrays que guardam os IDs dos itens adicionados em cada seção dinâmica
// expItems: experiências | eduItems: formações | idiItems: idiomas | projItems: projetos
let expItems = [], eduItems = [], idiItems = [], projItems = [];

// Pega o tema salvo no localStorage, se não tiver nada salvo usa "dark" como padrão
const savedTheme = localStorage.getItem('cvb_theme') || 'dark';

// Aplica o tema salvo no elemento <html> da página
document.documentElement.setAttribute('data-theme', savedTheme);

// Coloca o emoji certo no botão de tema de acordo com o tema salvo
document.getElementById('themeBtn').textContent = savedTheme === 'dark' ? '🌙' : '☀️';

// Troca o tema entre claro e escuro quando o botão é clicado
function toggleTheme() {
  // Lê o tema atual que está aplicado no <html>
  const cur = document.documentElement.getAttribute('data-theme');

  // Se o tema atual for escuro, muda para claro; se não, muda para escuro
  const next = cur === 'dark' ? 'light' : 'dark';

  // Aplica o novo tema no <html>
  document.documentElement.setAttribute('data-theme', next);

  // Salva o novo tema no localStorage para não perder ao recarregar a página
  localStorage.setItem('cvb_theme', next);

  // Atualiza o emoji do botão para combinar com o tema novo
  document.getElementById('themeBtn').textContent = next === 'dark' ? '🌙' : '☀️';
}

// Troca qual seção do formulário está visível na sidebar
function goSection(n) {
  // Remove a classe "active" de todas as seções para esconder todas elas
  document.querySelectorAll('.form-section').forEach(el => el.classList.remove('active'));

  // Remove a classe "active" de todos os botões do menu de navegação
  document.querySelectorAll('.snav-btn').forEach(el => el.classList.remove('active'));

  // Adiciona "active" só na seção que o usuário clicou
  document.getElementById('sec-' + n).classList.add('active');

  // Marca o botão do menu correspondente como ativo
  document.querySelectorAll('.snav-btn')[n].classList.add('active');

  // Atualiza a variável de controle com o número da seção atual
  activeSection = n;
}

// Salva os dados do formulário automaticamente no localStorage cada vez que o usuário digita
function autoSave() {
  // Coleta todos os dados preenchidos no formulário
  const data = collectData();

  // Converte o objeto para JSON e salva no localStorage com a chave 'cvb_draft'
  localStorage.setItem('cvb_draft', JSON.stringify(data));
}

// Carrega os dados salvos no localStorage de volta para o formulário
function loadDraft() {
  // Tenta pegar o rascunho que foi salvo anteriormente
  const raw = localStorage.getItem('cvb_draft');

  // Se não tiver nada salvo, encerra a função sem fazer nada
  if (!raw) return;

  try {
    // Converte o JSON salvo de volta para um objeto JavaScript
    const d = JSON.parse(raw);

    // Lista de IDs dos campos simples do formulário
    // Para cada um, preenche o campo com o valor salvo
    ['nome','cargo','cidade','email','tel','linkedin','github','resumo','skillsTec','skillsSoft'].forEach(id => {
      const el = document.getElementById(id);

      // Só preenche se o campo existir na página e se o valor existir nos dados salvos
      if (el && d[id]) el.value = d[id];
    });

    // Recria cada item de experiência profissional que estava salvo
    (d.exp || []).forEach(e => addExp(e));

    // Recria cada item de formação acadêmica que estava salvo
    (d.edu || []).forEach(e => addEdu(e));

    // Recria cada idioma que estava salvo
    (d.idi || []).forEach(e => addIdi(e));

    // Recria cada projeto que estava salvo
    (d.proj || []).forEach(e => addProj(e));

    // Restaura o template que estava selecionado
    if (d.template) selectTemplate(d.template);
  } catch(e) {
    // Se der algum erro ao ler o JSON, ignora e continua sem carregar
  }
}

// Contadores usados para gerar IDs únicos para cada item adicionado
let expCount = 0, eduCount = 0, idiCount = 0, projCount = 0;

// Escapa caracteres especiais de HTML, impedindo que dados do usuário
// (ex.: "C++ <iostream>", aspas, &) quebrem o markup gerado.
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

// Devolve uma cópia dos dados com todo campo de texto escapado, para uso na
// geração do currículo. Não toca no objeto original (o rascunho salvo e os
// inputs do formulário continuam guardando o valor cru).
function escData(d) {
  const out = {};
  for (const k in d) {
    if (typeof d[k] === 'string') out[k] = esc(d[k]);
    else if (Array.isArray(d[k])) out[k] = d[k].map(o => {
      const c = {};
      for (const j in o) c[j] = typeof o[j] === 'string' ? esc(o[j]) : o[j];
      return c;
    });
    else out[k] = d[k];
  }
  return out;
}

// Adiciona um novo card de experiência profissional na lista da sidebar
function addExp(data = {}) {
  // Gera um ID único para essa experiência usando o contador
  const id = expCount++;

  // Registra esse ID na lista de experiências ativas
  expItems.push(id);

  // Cria um novo elemento div para o card
  const el = document.createElement('div');

  // Define a classe CSS do card para aplicar os estilos
  el.className = 'dyn-item';

  // Define o ID do elemento para conseguir encontrar e remover depois
  el.id = 'exp-' + id;

  // Monta o HTML interno do card com todos os campos de experiência
  el.innerHTML = `
    <div class="dyn-item-header">
      <div class="dyn-item-title">Experiência ${expItems.length}</div>
      <button class="btn-remove" onclick="removeItem('exp',${id})">✕</button>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Cargo</label><input type="text" id="exp-cargo-${id}" placeholder="Desenvolvedora Front-end" value="${esc(data.cargo)}" oninput="autoSave()"/></div>
      <div class="form-group"><label>Empresa</label><input type="text" id="exp-empresa-${id}" placeholder="Empresa LTDA" value="${esc(data.empresa)}" oninput="autoSave()"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Início</label><input type="month" id="exp-ini-${id}" value="${esc(data.ini)}" oninput="autoSave()"/></div>
      <div class="form-group"><label>Fim</label><input type="month" id="exp-fim-${id}" value="${esc(data.fim)}" oninput="autoSave()" placeholder="Atual"/> <label style="margin-top:6px;text-transform:none;font-size:.73rem"><input type="checkbox" id="exp-atual-${id}" ${data.atual?'checked':''} onchange="autoSave()" style="width:auto;margin-right:5px"/>Trabalho atual</label></div>
    </div>
    <div class="form-group"><label>Descrição</label><textarea id="exp-desc-${id}" rows="3" placeholder="Descreva suas responsabilidades e conquistas..." oninput="autoSave()">${esc(data.desc)}</textarea></div>`;

  // Insere o card dentro da lista de experiências no HTML da página
  document.getElementById('expList').appendChild(el);
}

// Adiciona um novo card de formação acadêmica na lista da sidebar
function addEdu(data = {}) {
  // Gera um ID único para essa formação
  const id = eduCount++;

  // Registra o ID na lista de formações ativas
  eduItems.push(id);

  // Cria o elemento div e define a classe e ID do card
  const el = document.createElement('div');
  el.className = 'dyn-item';
  el.id = 'edu-' + id;

  // Monta o HTML com os campos de curso, instituição e período
  el.innerHTML = `
    <div class="dyn-item-header">
      <div class="dyn-item-title">Formação ${eduItems.length}</div>
      <button class="btn-remove" onclick="removeItem('edu',${id})">✕</button>
    </div>
    <div class="form-group"><label>Curso / Grau</label><input type="text" id="edu-curso-${id}" placeholder="Ciência da Computação" value="${esc(data.curso)}" oninput="autoSave()"/></div>
    <div class="form-row">
      <div class="form-group"><label>Instituição</label><input type="text" id="edu-inst-${id}" placeholder="CEUB" value="${esc(data.inst)}" oninput="autoSave()"/></div>
      <div class="form-group"><label>Período</label><input type="text" id="edu-periodo-${id}" placeholder="2022 – 2026" value="${esc(data.periodo)}" oninput="autoSave()"/></div>
    </div>`;

  // Insere o card dentro da lista de formações no HTML
  document.getElementById('eduList').appendChild(el);
}

// Adiciona um novo card de idioma na lista da sidebar
function addIdi(data = {}) {
  // Gera ID único para esse idioma usando o contador
  const id = idiCount++;

  // Registra o ID na lista de idiomas ativos
  idiItems.push(id);

  // Cria o elemento e define sua classe e ID
  const el = document.createElement('div');
  el.className = 'dyn-item';
  el.id = 'idi-' + id;

  // Monta o HTML com o campo de nome do idioma e o select de nível
  el.innerHTML = `
    <div class="dyn-item-header">
      <div class="dyn-item-title">Idioma ${idiItems.length}</div>
      <button class="btn-remove" onclick="removeItem('idi',${id})">✕</button>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Idioma</label><input type="text" id="idi-nome-${id}" placeholder="Inglês" value="${esc(data.nome)}" oninput="autoSave()"/></div>
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

  // Insere o card dentro da lista de idiomas no HTML
  document.getElementById('idiList').appendChild(el);
}

// Adiciona um novo card de projeto na lista da sidebar
function addProj(data = {}) {
  // Gera ID único para esse projeto
  const id = projCount++;

  // Registra o ID na lista de projetos ativos
  projItems.push(id);

  // Cria o card com os campos de nome, tecnologias, link e descrição
  const el = document.createElement('div');
  el.className = 'dyn-item';
  el.id = 'proj-' + id;

  el.innerHTML = `
    <div class="dyn-item-header">
      <div class="dyn-item-title">Projeto ${projItems.length}</div>
      <button class="btn-remove" onclick="removeItem('proj',${id})">✕</button>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Nome do projeto</label><input type="text" id="proj-nome-${id}" placeholder="FinTrack" value="${esc(data.nome)}" oninput="autoSave()"/></div>
      <div class="form-group"><label>Tecnologias</label><input type="text" id="proj-tech-${id}" placeholder="HTML, CSS, JS" value="${esc(data.tech)}" oninput="autoSave()"/></div>
    </div>
    <div class="form-group"><label>Link</label><input type="text" id="proj-link-${id}" placeholder="github.com/ana/fintrack" value="${esc(data.link)}" oninput="autoSave()"/></div>
    <div class="form-group"><label>Descrição</label><textarea id="proj-desc-${id}" rows="2" placeholder="Breve descrição do projeto..." oninput="autoSave()">${esc(data.desc)}</textarea></div>`;

  // Insere o card dentro da lista de projetos no HTML
  document.getElementById('projList').appendChild(el);
}

// Remove um item dinâmico da tela quando o usuário clica no botão "✕"
function removeItem(type, id) {
  // Encontra o elemento pelo tipo (exp, edu, idi, proj) e pelo ID
  const el = document.getElementById(type + '-' + id);

  // Remove o elemento do DOM se ele existir
  if (el) el.remove();

  // Remove o ID do array correspondente ao tipo do item removido
  if (type === 'exp') expItems = expItems.filter(i => i !== id);
  if (type === 'edu') eduItems = eduItems.filter(i => i !== id);
  if (type === 'idi') idiItems = idiItems.filter(i => i !== id);
  if (type === 'proj') projItems = projItems.filter(i => i !== id);

  // Salva o estado atualizado (sem o item removido)
  autoSave();
}

// Marca o template escolhido como selecionado e atualiza os radio buttons
function selectTemplate(t) {
  // Salva o nome do template selecionado na variável global
  selectedTemplate = t;

  // Percorre todos os radio buttons de template e marca o correto como checked
  document.querySelectorAll('input[name="template"]').forEach(r => r.checked = r.value === t);

  // Salva a escolha no rascunho do localStorage
  autoSave();
}

// Coleta todos os dados preenchidos no formulário e retorna como um objeto
function collectData() {
  // Atalho para pegar o valor de um campo pelo ID sem dar erro se o campo não existir
  const g = id => (document.getElementById(id) || {}).value || '';

  // Mapeia cada ID de experiência para um objeto com seus dados
  // O filter no final remove experiências que estão completamente vazias
  const exp = expItems.map(id => ({
    cargo: g('exp-cargo-' + id),
    empresa: g('exp-empresa-' + id),
    ini: g('exp-ini-' + id),
    fim: g('exp-fim-' + id),
    atual: !!(document.getElementById('exp-atual-' + id) || {}).checked,
    desc: g('exp-desc-' + id)
  })).filter(e => e.cargo || e.empresa);

  // Faz o mesmo para formações, pulando as que estão completamente vazias
  const edu = eduItems.map(id => ({
    curso: g('edu-curso-' + id),
    inst: g('edu-inst-' + id),
    periodo: g('edu-periodo-' + id)
  })).filter(e => e.curso || e.inst);

  // Coleta os idiomas, pulando os que não têm nome preenchido
  const idi = idiItems.map(id => ({
    nome: g('idi-nome-' + id),
    nivel: g('idi-nivel-' + id)
  })).filter(e => e.nome);

  // Coleta os projetos, pulando os que não têm nome preenchido
  const proj = projItems.map(id => ({
    nome: g('proj-nome-' + id),
    tech: g('proj-tech-' + id),
    link: g('proj-link-' + id),
    desc: g('proj-desc-' + id)
  })).filter(e => e.nome);

  // Retorna um objeto com todos os dados do formulário juntos
  return {
    nome: g('nome'), cargo: g('cargo'), cidade: g('cidade'),
    email: g('email'), tel: g('tel'), linkedin: g('linkedin'), github: g('github'),
    resumo: g('resumo'),
    skillsTec: g('skillsTec'), skillsSoft: g('skillsSoft'),
    exp, edu, idi, proj, template: selectedTemplate
  };
}

// Formata uma data no formato "YYYY-MM" para algo legível como "jan. 2024"
function fmtMonth(ym) {
  // Se não receber data, retorna uma string vazia
  if (!ym) return '';

  // Separa o ano e o mês da string "YYYY-MM"
  const [y, m] = ym.split('-');

  // Cria um Date e formata em português com mês abreviado e ano
  return new Date(y, m - 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

// Gera o HTML do currículo e exibe na área de preview da página
function generateCV() {
  // Coleta todos os dados preenchidos no formulário
  const d = collectData();

  // Verifica se o usuário preencheu pelo menos o nome antes de gerar
  if (!d.nome) { showToast('⚠️ Informe ao menos seu nome.'); goSection(0); return; }

  // Versão escapada dos dados para injeção segura no innerHTML do currículo
  const safe = escData(d);

  // Variável que vai receber o HTML do template escolhido
  let html = '';

  // Chama a função do template correto baseado na variável selectedTemplate
  if (selectedTemplate === 'moderno') html = tplModerno(safe);
  else if (selectedTemplate === 'minimalista') html = tplMinimalista(safe);
  else html = tplCriativo(safe);

  // Insere o HTML gerado dentro da div que exibe o currículo
  document.getElementById('cvOutput').innerHTML = html;

  // Esconde a tela de boas-vindas que aparece antes de gerar o currículo
  document.getElementById('welcomeScreen').style.display = 'none';

  // Mostra a área de preview com o currículo gerado
  document.getElementById('cvPreviewWrap').style.display = 'block';

  // Faz o scroll da área principal subir para o topo para o usuário ver o currículo
  document.querySelector('.main-area').scrollTop = 0;

  // Exibe a notificação de sucesso para o usuário
  showToast('✅ Currículo gerado!');
}

// Volta para a tela de edição, escondendo o preview e mostrando a tela inicial
function backToEdit() {
  // Esconde a área de preview do currículo
  document.getElementById('cvPreviewWrap').style.display = 'none';

  // Mostra a tela de boas-vindas novamente
  document.getElementById('welcomeScreen').style.display = 'block';
}

// Abre o diálogo de impressão do navegador para o usuário salvar o currículo como PDF
function exportPDF() {
  window.print();
}

// Gera o HTML do template "Moderno" (sidebar roxa na esquerda, conteúdo na direita)
function tplModerno(d) {
  // Transforma a string de skills técnicas em um array, removendo espaços extras
  const skills = d.skillsTec ? d.skillsTec.split(',').map(s => s.trim()).filter(Boolean) : [];

  // Faz o mesmo para as soft skills comportamentais
  const softs  = d.skillsSoft ? d.skillsSoft.split(',').map(s => s.trim()).filter(Boolean) : [];

  // HTML da coluna lateral esquerda com contato, skills e idiomas
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

  // HTML do corpo principal com nome, cargo, resumo, experiências, formação e projetos
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

  // Junta a sidebar e o corpo dentro de uma div flex e retorna o HTML completo do currículo
  return `<div style="display:flex;min-height:800px;background:#fff;font-family:'Inter',sans-serif">${sidebar}${body}</div>`;
}

// Gera o HTML do template "Minimalista" (layout limpo, preto e branco, elegante)
function tplMinimalista(d) {
  // Transforma as strings de skills em arrays
  const skills = d.skillsTec ? d.skillsTec.split(',').map(s => s.trim()).filter(Boolean) : [];
  const softs  = d.skillsSoft ? d.skillsSoft.split(',').map(s => s.trim()).filter(Boolean) : [];

  // Cria um array só com as informações de contato que foram preenchidas
  const contacts = [d.cidade, d.email, d.tel, d.linkedin, d.github].filter(Boolean);

  // Retorna o HTML completo do currículo minimalista
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

// Gera o HTML do template "Criativo" (header com gradiente colorido roxo/rosa)
function tplCriativo(d) {
  // Transforma as strings de skills em arrays
  const skills = d.skillsTec ? d.skillsTec.split(',').map(s => s.trim()).filter(Boolean) : [];
  const softs  = d.skillsSoft ? d.skillsSoft.split(',').map(s => s.trim()).filter(Boolean) : [];

  // Monta o array de contatos com emojis na frente, filtrando os que estão vazios
  const contacts = [
    d.cidade ? `📍 ${d.cidade}` : '',
    d.email ? `✉️ ${d.email}` : '',
    d.tel ? `📞 ${d.tel}` : '',
    d.linkedin ? `💼 ${d.linkedin}` : '',
    d.github ? `💻 ${d.github}` : ''
  ].filter(Boolean);

  // Função auxiliar que cria o HTML de uma seção com título e linha decorativa em gradiente
  const section = (title, content) => `
    <div style="margin-bottom:24px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div style="height:2px;width:28px;background:linear-gradient(90deg,#7c6af7,#f472b6);border-radius:1px"></div>
        <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#7c6af7">${title}</div>
      </div>
      ${content}
    </div>`;

  // Retorna o HTML completo do currículo criativo com header em gradiente e grid de duas colunas
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

// Mostra uma notificação (toast) temporária no canto inferior direito da tela
function showToast(msg) {
  // Pega o elemento do toast que já existe no HTML
  const el = document.getElementById('toast');

  // Define o texto que vai aparecer na notificação
  el.textContent = msg;

  // Adiciona a classe "show" para fazer o toast aparecer com animação
  el.classList.add('show');

  // Remove a classe "show" depois de 2800 milissegundos (2,8 segundos)
  // Isso faz o toast desaparecer automaticamente
  setTimeout(() => el.classList.remove('show'), 2800);
}

// Chama a função de carregamento do rascunho quando a página termina de carregar
loadDraft();
