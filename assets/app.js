'use strict';

// sysInfo, circuitDefs, generateGAs, buildXML, buildCSV, parseXML, reconstructFromXML — engine.js
// state, saveState, debouncedSave, loadState, newProject                              — state.js
// t(), setLang()                                                                       — i18n.js
// renderAll, renderPanel, renderSidebar                                               — render.js

// ── Engine calls ──────────────────────────────────────────────────────────────
function callGenerate() {
  try {
    const gas = generateGAs({
      structure:  state.structure,
      floors:     state.floors,
      systems:    state.systems,
      circuits:   state.circuits,
      manualGAs:  state.manualGAs,
      ltSubs:     state.ltSubs
    });
    state.generatedGAs = gas;
    renderPanel();
    renderSidebar();
    saveState();
    showToast(state.lang === 'vi' ? `${gas.length} GA đã tạo` : `${gas.length} GAs generated`);
  } catch (e) {
    showToast(e.message, true);
  }
}

function callExportXML() {
  if (!state.generatedGAs.length) { showToast(state.lang === 'vi' ? 'Chưa có GA nào' : 'No GAs to export', true); return; }
  try {
    const fname = (document.getElementById('filename-input')?.value || 'KNX_GA').trim();
    const xml = buildXML(state.generatedGAs, {
      projectName: state.projectName,
      floors:      state.floors,
      includeDpt:  state.exportOpts.dpt,
      includeDesc: state.exportOpts.desc
    });
    triggerDownload(xml, fname + '.xml', 'application/xml');
    showToast(t('file_ready'));
  } catch (e) {
    showToast(e.message, true);
  }
}

function callExportCSV() {
  if (!state.generatedGAs.length) { showToast(state.lang === 'vi' ? 'Chưa có GA nào' : 'No GAs to export', true); return; }
  try {
    const fname = (document.getElementById('filename-input')?.value || 'KNX_GA').trim();
    const csv = buildCSV(state.generatedGAs, { floors: state.floors });
    triggerDownload(csv, fname + '.csv', 'text/plain');
    showToast(t('file_ready'));
  } catch (e) {
    showToast(e.message, true);
  }
}

function callImportXML(rawStr) {
  const fromStep1 = state.step === 1;
  try {
    if (fromStep1) {
      const result = reconstructFromXML(rawStr);
      state.systems      = result.systems;
      state.ltSubs       = result.ltSubs;
      state.floors       = result.floors;
      state.circuits     = result.circuits;
      state.generatedGAs = [];
      state.manualGAs    = [];
      closeImportModal();
      saveState();
      const totalCircuits = Object.values(result.circuits).reduce((a, byRoom) =>
        a + Object.values(byRoom).reduce((b, bySk) =>
          b + Object.values(bySk).reduce((c, byCk) =>
            c + Object.values(byCk).reduce((d, names) => d + names.length, 0), 0), 0), 0);
      showToast(state.lang === 'vi'
        ? `Đã nhập: ${result.floors.length} tầng, ${totalCircuits} mạch`
        : `Imported: ${result.floors.length} floors, ${totalCircuits} circuits`);
      state.step = 2;
      renderAll();
    } else {
      // Step 5 merge: add/update imported GAs into the current generated list
      const gas = parseXML(rawStr);
      gas.forEach(ig => {
        const existing = state.generatedGAs.find(g => g.addr === ig.addr);
        if (existing) { existing.name = ig.name; }
        else { state.generatedGAs.push(ig); }
      });
      state.generatedGAs.sort((a, b) => {
        const ap = a.addr.split('/').map(Number), bp = b.addr.split('/').map(Number);
        for (let i = 0; i < 3; i++) { if (ap[i] !== bp[i]) return ap[i] - bp[i]; } return 0;
      });
      closeImportModal();
      saveState();
      showToast(state.lang === 'vi' ? `Import: ${gas.length} GA đã gộp` : `Import: ${gas.length} GAs merged`);
      renderPanel();
      renderSidebar();
    }
  } catch (e) {
    showToast(e.message, true);
  }
}

// ── Floor extraction from imported GAs ───────────────────────────────────────
function extractFloorsFromGAs(gas) {
  const floorMap = {};
  gas.forEach(g => {
    const mid = g.mid;
    if (mid === 0) return;
    if (!floorMap[mid]) {
      const df = defaultFloors.find(f => f.mid === mid);
      floorMap[mid] = {
        id:    'f' + mid,
        mid,
        name:  df ? df.name : (floorPrefix[mid] || ('Floor ' + mid)),
        rooms: []
      };
    }
    const parts = g.name.split(' - ');
    if (parts.length >= 3) {
      const roomPart = parts[2];
      const bracketIdx = roomPart.indexOf(' [');
      if (bracketIdx !== -1) {
        const room = roomPart.substring(0, bracketIdx).trim();
        if (room && !floorMap[mid].rooms.includes(room)) {
          floorMap[mid].rooms.push(room);
        }
      }
    }
  });
  return Object.values(floorMap).sort((a, b) => a.mid - b.mid);
}

// ── Import modal ──────────────────────────────────────────────────────────────
function openImportModal() {
  state.importedXml = null;
  const btn = document.getElementById('btn-confirm-import');
  if (btn) { btn.disabled = true; btn.textContent = t('merge_import'); }
  document.getElementById('drop-zone-text').textContent = t('drop_here');
  document.getElementById('import-modal').classList.remove('hidden');
  document.getElementById('modal-title-import').textContent = t('import_xml');
  document.getElementById('btn-cancel-import').textContent = t('cancel');

  const fi = document.getElementById('file-input');
  fi.onchange = function () { handleXmlFile(this); };

  const dz = document.getElementById('drop-zone');
  dz.ondragover  = e => { e.preventDefault(); dz.classList.add('drag-over'); };
  dz.ondragleave = () => dz.classList.remove('drag-over');
  dz.ondrop      = e => {
    e.preventDefault(); dz.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f) readXmlFile(f);
  };

  document.getElementById('btn-confirm-import').onclick = () => {
    if (state.importedXml) callImportXML(state.importedXml);
  };
}

function closeImportModal() {
  document.getElementById('import-modal').classList.add('hidden');
  state.importedXml = null;
}

function handleXmlFile(input) {
  const f = input.files[0];
  if (f) readXmlFile(f);
}

function readXmlFile(f) {
  const reader = new FileReader();
  reader.onload = e => {
    state.importedXml = e.target.result;
    const dzt = document.getElementById('drop-zone-text');
    const btn = document.getElementById('btn-confirm-import');
    if (dzt) dzt.textContent = '✓ ' + f.name;
    if (btn) btn.disabled = false;
  };
  reader.readAsText(f);
}

// ── Sidebar (mobile drawer) ───────────────────────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-backdrop').classList.toggle('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-backdrop').classList.remove('open');
}

// ── Loading overlay ───────────────────────────────────────────────────────────
function showLoading(msg) {
  const el = document.getElementById('loading-overlay');
  const lm = document.getElementById('loading-msg');
  if (lm) lm.textContent = msg || '';
  if (el) el.classList.remove('hidden');
}

function hideLoading() {
  const el = document.getElementById('loading-overlay');
  if (el) el.classList.add('hidden');
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function triggerDownload(content, filename, mime) {
  const a = document.createElement('a');
  a.href     = 'data:' + mime + ';charset=utf-8,' + encodeURIComponent(content);
  a.download = filename;
  a.click();
}

function updateHeaderProject() {
  const hp = document.getElementById('header-project');
  const hn = document.getElementById('header-project-name');
  if (state.projectName) { hp.style.display = ''; hn.textContent = state.projectName; }
  else { hp.style.display = 'none'; }
  debouncedSave();
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, isError) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'show' + (isError ? ' toast-error' : '');
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = ''; }, 3000);
}

function showUndoToast(msg, undoFn) {
  const el = document.getElementById('toast');
  const label = state.lang === 'vi' ? 'Hoàn tác' : 'Undo';
  el.innerHTML = escHtml(msg) + ` <button class="toast-undo" onclick="(window._toastUndoFn||function(){})()">${label}</button>`;
  window._toastUndoFn = undoFn;
  el.className = 'show';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = ''; window._toastUndoFn = null; }, 4000);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderAll();
});
