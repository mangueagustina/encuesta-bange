/* ═══════════════════════════════════════════════════════════
   ENCUESTA BANGE 2020-2025  –  script.js
   ═══════════════════════════════════════════════════════════ */

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwlq4UjMKDZIv9eDBgyVSRvxMw2w3xIkWniz9Q1-js5P28alxo1CkLO5kZ7qbYjSX5U/exec';

// ── Datos Likert ─────────────────────────────────────────────────────
const CH_ROWS = [
  'Los programas de capacitación han mejorado mis competencias profesionales',
  'Existen oportunidades reales de desarrollo y promoción',
  'La formación recibida es pertinente para mis funciones',
  'El banco invierte en el desarrollo del personal',
  'Las competencias del equipo han mejorado',
  'Dispongo de herramientas y recursos adecuados',
  'El ambiente laboral favorece aprendizaje e innovación'
];
const TD_ROWS = [
  'La plataforma digital es fácil de usar',
  'Los servicios digitales satisfacen mis necesidades',
  'La transformación digital ha sido exitosa',
  'Me siento seguro utilizando los canales digitales',
  'Recomendaría estos servicios',
  'Los canales digitales funcionan correctamente',
  'La banca digital facilita mis operaciones'
];
const GC_ROWS = [
  'BANGE opera con transparencia',
  'La gestión ha mejorado en los últimos años',
  'Confío en la solidez institucional',
  'Los procesos son claros',
  'Cumple con normativas bancarias',
  'La comunicación institucional es efectiva',
  'Responde a las necesidades de los clientes'
];
const EO_ROWS = [
  'Las nuevas sucursales facilitan el acceso',
  'Los horarios son adecuados',
  'La ubicación es conveniente',
  'La red de cajeros es suficiente',
  'Los tiempos de espera son razonables',
  'La accesibilidad ha mejorado'
];

// ── SVG icons (inline, reutilizables) ────────────────────────────────
const SVG = {
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  arrowLeft:  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  check:      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
  alertCircle:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  checkCircle:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
};

// ── Estado ───────────────────────────────────────────────────────────
let currentSec = 1;
const TOTAL_SECS = 6;

// ── Init ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Bloquear si ya respondió
  if (localStorage.getItem('bange_encuesta_enviada')) {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('successScreen').classList.add('active');
    document.getElementById('successScreen').querySelector('p').innerHTML =
      'Ya has participado en esta encuesta. Tu respuesta fue registrada correctamente.<br/>Gracias por tu colaboración.';
    return;
  }

  buildLikert('likert-ch', CH_ROWS, 'ch');
  buildLikert('likert-td', TD_ROWS, 'td');
  buildLikert('likert-gc', GC_ROWS, 'gc');
  buildLikert('likert-eo', EO_ROWS, 'eo');
  buildStepDots();
  createToast();

  document.querySelectorAll('input[name="p15"]').forEach(r =>
    r.addEventListener('change', toggleBloqueDigital)
  );
});

// ── Construir Likert ─────────────────────────────────────────────────
function buildLikert(containerId, rows, prefix) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = rows.map((text, i) => `
    <div class="likert-row" id="likert-row-${prefix}-${i}">
      <div class="likert-text">${text}</div>
      <div class="likert-radios">
        ${[1,2,3,4,5].map(v => `
          <div class="likert-cell">
            <input type="radio" id="${prefix}_${i}_${v}" name="${prefix}_${i}" value="${v}"
              onchange="clearLikertError('likert-row-${prefix}-${i}')" />
            <label for="${prefix}_${i}_${v}">${v}</label>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ── Step dots ────────────────────────────────────────────────────────
function buildStepDots() {
  const wrap = document.getElementById('stepDots');
  if (!wrap) return;
  wrap.innerHTML = Array.from({ length: TOTAL_SECS }, (_, i) =>
    `<div class="step-dot" id="dot-${i+1}"></div>`
  ).join('');
}

function updateStepDots() {
  for (let i = 1; i <= TOTAL_SECS; i++) {
    const dot = document.getElementById(`dot-${i}`);
    if (!dot) continue;
    dot.className = 'step-dot';
    if (i < currentSec) dot.classList.add('done');
    else if (i === currentSec) dot.classList.add('active');
  }
}

// ── Toast ─────────────────────────────────────────────────────────────
function createToast() {
  if (document.getElementById('toast')) return;
  const t = document.createElement('div');
  t.id = 'toast';
  t.innerHTML = `<span class="toast-icon"></span><span class="toast-text"></span>`;
  document.body.appendChild(t);
}

function showToast(msg, type = 'error') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const icon = toast.querySelector('.toast-icon');
  const text = toast.querySelector('.toast-text');

  icon.innerHTML = type === 'error' ? SVG.alertCircle : SVG.checkCircle;
  text.textContent = msg;
  toast.className = type === 'error' ? 'toast-error' : 'toast-success';

  // Force reflow to restart transition
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── Marcar error en q-block ───────────────────────────────────────────
function markBlockError(block) {
  block.classList.add('has-error');
  // Añadir mensaje inline si no existe
  if (!block.querySelector('.error-msg')) {
    const msg = document.createElement('div');
    msg.className = 'error-msg';
    msg.innerHTML = `${SVG.alertCircle} Esta pregunta es obligatoria`;
    block.appendChild(msg);
  }
  // Auto-limpiar al interactuar
  const inputs = block.querySelectorAll('input, select');
  inputs.forEach(inp => {
    inp.addEventListener('change', () => clearBlockError(block), { once: true });
  });
}

function clearBlockError(block) {
  block.classList.remove('has-error');
  block.querySelector('.error-msg')?.remove();
}

// ── Marcar error en likert row ────────────────────────────────────────
function markLikertError(rowId) {
  const row = document.getElementById(rowId);
  if (row) row.classList.add('has-error');
}

function clearLikertError(rowId) {
  const row = document.getElementById(rowId);
  if (row) row.classList.remove('has-error');
}

// ── Marcar error en select ────────────────────────────────────────────
function markSelectError(sel) {
  sel.classList.add('has-error');
  sel.addEventListener('change', () => sel.classList.remove('has-error'), { once: true });
}

// ── Iniciar encuesta ──────────────────────────────────────────────────
function startSurvey() {
  document.getElementById('introScreen').classList.add('hidden');
  document.getElementById('surveyWrap').classList.add('active');
  document.getElementById('navBar').classList.remove('hidden');
  document.getElementById('stepCounter').style.display = 'block';
  document.getElementById('btnBack').style.display = 'none';
  updateProgress();
  updateStepDots();
  updateNavButtons();
}

// ── Progreso ──────────────────────────────────────────────────────────
function updateProgress() {
  const pct = ((currentSec - 1) / (TOTAL_SECS - 1)) * 100;
  document.getElementById('progressBar').style.width = pct + '%';
  const counter = document.getElementById('stepCounter');
  if (counter) counter.textContent = `${currentSec} / ${TOTAL_SECS}`;
}

// ── Botones de navegación ─────────────────────────────────────────────
function updateNavButtons() {
  const btnBack = document.getElementById('btnBack');
  const btnNext = document.getElementById('btnNext');

  btnBack.style.display = currentSec === 1 ? 'none' : 'flex';

  if (currentSec === TOTAL_SECS) {
    btnNext.innerHTML = `Enviar encuesta <span class="icon">${SVG.check}</span>`;
    btnNext.className = 'btn-nav btn-submit';
    btnNext.onclick = enviar;
  } else {
    btnNext.innerHTML = `Siguiente <span class="icon">${SVG.arrowRight}</span>`;
    btnNext.className = 'btn-nav btn-next';
    btnNext.onclick = next;
  }
}

// ── Sección activa ────────────────────────────────────────────────────
function getSection(n) {
  return document.querySelector(`.section[data-sec="${n}"]`);
}

// ── Validación con feedback visual ────────────────────────────────────
function validateCurrent() {
  const sec = getSection(currentSec);
  let firstError = null;
  let errorCount = 0;

  // Limpiar errores previos de esta sección
  sec.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
  sec.querySelectorAll('.error-msg').forEach(el => el.remove());

  // ── Radios sueltos (preguntas normales) ──
  const standaloneRadioNames = new Set(
    [...sec.querySelectorAll('input[type="radio"]')]
      .filter(r => {
        if (r.closest('#bloque-digital')?.style.display === 'none') return false;
        return r.required && !r.closest('.likert-row');
      })
      .map(r => r.name)
  );

  for (const name of standaloneRadioNames) {
    const group = [...sec.querySelectorAll(`input[name="${name}"]`)];
    if (!group.some(r => r.checked)) {
      const block = group[0]?.closest('.q-block');
      if (block) {
        markBlockError(block);
        if (!firstError) firstError = block;
      }
      errorCount++;
    }
  }

  // ── Filas Likert ──
  const likertNames = new Set(
    [...sec.querySelectorAll('.likert-row input[type="radio"]')]
      .filter(r => r.closest('#bloque-digital')?.style.display !== 'none')
      .map(r => r.name)
  );

  // Agrupar por fila
  const likertRows = new Map();
  for (const name of likertNames) {
    const firstInput = sec.querySelector(`input[name="${name}"]`);
    const row = firstInput?.closest('.likert-row');
    if (row) likertRows.set(name, row);
  }

  for (const [name, row] of likertRows) {
    const group = [...sec.querySelectorAll(`input[name="${name}"]`)];
    if (!group.some(r => r.checked)) {
      row.classList.add('has-error');
      // Marcar el q-block contenedor también
      const block = row.closest('.q-block');
      if (block && !block.classList.contains('has-error')) {
        block.classList.add('has-error');
        if (!block.querySelector('.error-msg')) {
          const msg = document.createElement('div');
          msg.className = 'error-msg';
          msg.innerHTML = `${SVG.alertCircle} Responda todas las afirmaciones`;
          block.appendChild(msg);
          // Limpiar cuando se complete la tabla
          block.addEventListener('change', () => {
            const allDone = [...block.querySelectorAll('.likert-row')].every(r =>
              [...r.querySelectorAll('input[type="radio"]')].some(i => i.checked)
            );
            if (allDone) clearBlockError(block);
          });
        }
      }
      if (!firstError) firstError = row;
      errorCount++;
    }
  }

  // ── Selects ──
  for (const sel of sec.querySelectorAll('select[required]')) {
    if (!sel.value) {
      markSelectError(sel);
      const block = sel.closest('.q-block');
      if (block) {
        markBlockError(block);
        if (!firstError) firstError = block;
      }
      errorCount++;
    }
  }

  if (errorCount > 0) {
    const msg = errorCount === 1
      ? 'Hay 1 pregunta obligatoria sin responder.'
      : `Hay ${errorCount} preguntas obligatorias sin responder.`;
    showToast(msg, 'error');
    firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }

  return true;
}

// ── Mostrar/ocultar bloque digital ────────────────────────────────────
function toggleBloqueDigital() {
  const val = document.querySelector('input[name="p15"]:checked')?.value ?? '';
  const bloque = document.getElementById('bloque-digital');
  const usaDigital = val.startsWith('Sí');
  bloque.style.display = usaDigital ? 'block' : 'none';
  bloque.querySelectorAll('input[type="radio"]').forEach(r => { r.required = usaDigital; });
  // Limpiar errores del bloque si se oculta
  if (!usaDigital) {
    bloque.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
    bloque.querySelectorAll('.error-msg').forEach(el => el.remove());
  }
}

// ── Siguiente ─────────────────────────────────────────────────────────
function next() {
  if (!validateCurrent()) return;

  if (currentSec === 1) {
    const tipo = document.querySelector('input[name="p1"]:checked')?.value ?? '';
    const sec2 = getSection(2);
    if (tipo !== 'Empleado de BANGE') {
      sec2.dataset.skip = 'true';
    } else {
      delete sec2.dataset.skip;
    }
  }

  getSection(currentSec).classList.remove('active');
  currentSec++;
  while (getSection(currentSec)?.dataset.skip === 'true') currentSec++;

  getSection(currentSec)?.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateProgress();
  updateStepDots();
  updateNavButtons();
}

// ── Anterior ──────────────────────────────────────────────────────────
function back() {
  getSection(currentSec).classList.remove('active');
  currentSec--;
  while (currentSec > 1 && getSection(currentSec)?.dataset.skip === 'true') currentSec--;

  getSection(currentSec)?.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateProgress();
  updateStepDots();
  updateNavButtons();
}

// ── Recopilar datos ───────────────────────────────────────────────────
function collectData() {
  const fd = new FormData(document.getElementById('form'));
  const data = { timestamp: new Date().toISOString() };
  for (const [k, v] of fd.entries()) data[k] = v;

  const ROWS = { ch: CH_ROWS, td: TD_ROWS, gc: GC_ROWS, eo: EO_ROWS };
  for (const [prefix, rows] of Object.entries(ROWS)) {
    rows.forEach((_, i) => {
      data[`${prefix}_${i}`] = document.querySelector(`input[name="${prefix}_${i}"]:checked`)?.value ?? '';
    });
  }
  return data;
}

// ── Enviar ────────────────────────────────────────────────────────────
function enviar() {
  if (!validateCurrent()) return;

  const data = collectData();
  const btnNext = document.getElementById('btnNext');
  btnNext.innerHTML = 'Enviando...';
  btnNext.disabled = true;

  if (SCRIPT_URL === 'TU_URL_APPS_SCRIPT_AQUI') {
    console.log('Datos:', data);
    setTimeout(mostrarExito, 800);
    return;
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = SCRIPT_URL;
  form.target = 'hidden-iframe';
  form.style.display = 'none';

  for (const [key, value] of Object.entries(data)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  }

  let iframe = document.getElementById('hidden-iframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'hidden-iframe';
    iframe.name = 'hidden-iframe';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }

  document.body.appendChild(form);
  form.submit();
  setTimeout(mostrarExito, 1200);
}

// ── Pantalla de éxito ─────────────────────────────────────────────────
function mostrarExito() {
  localStorage.setItem('bange_encuesta_enviada', '1');
  document.getElementById('surveyWrap').style.display = 'none';
  document.getElementById('navBar').classList.add('hidden');
  document.getElementById('successScreen').classList.add('active');
  document.getElementById('progressBar').style.width = '100%';
  document.getElementById('stepCounter').textContent = 'Completado';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
