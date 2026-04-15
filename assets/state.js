'use strict';

// ── App state ──────────────────────────────────────────────────────────────────
const state = {
  lang: 'en',
  step: 1,
  projectName: '',
  structure: 'function',
  systems: { lt:true, pres:true, sht:true, hvac:true, sec:true, scn:true, av:false, nrg:false, sys:false },
  ltSubs:   { onoff:true, dim:true, cct:true, rgb:true },
  floors: [],
  circuits:      {},
  generatedGAs:  [],
  manualGAs:     [],
  floorView:     'chip',
  gaView:        'tree',
  gaTreeGroup:   'mid',
  gaFilter:      'all',
  exportFormat:  'xml',
  exportOpts:    { dpt:true, desc:false, unused:false, floorFirst:false },
  importedXml:   null,
  _xmlCache:     null
};

// ── localStorage persistence ───────────────────────────────────────────────────
const STORAGE_KEY = 'knx_ga_planner_v2';
const PERSIST_FIELDS = ['projectName','structure','systems','ltSubs',
  'floors','circuits','generatedGAs','manualGAs','exportFormat','exportOpts','lang'];

function saveState() {
  try {
    const payload = {};
    PERSIST_FIELDS.forEach(k => { payload[k] = state[k]; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    // flash save indicator
    const el = document.getElementById('save-indicator');
    if (el) { el.classList.add('saved'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('saved'), 1500); }
  } catch(e) { /* private mode or quota exceeded — silent fail */ }
}

let _saveTimer = null;
function debouncedSave() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(saveState, 600);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    PERSIST_FIELDS.forEach(k => { if (saved[k] !== undefined) state[k] = saved[k]; });
    return true;
  } catch(e) { return false; }
}

function newProject() {
  const hasData = state.projectName || state.generatedGAs.length > 0 ||
    Object.keys(state.circuits).length > 0;
  if (hasData) {
    if (!confirm(state.lang === 'vi'
      ? 'Bắt đầu dự án mới? Dữ liệu hiện tại sẽ bị xóa.'
      : 'Start a new project? Current data will be cleared.')) return;
  }
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, {
    step: 1, projectName: '', structure: 'function',
    systems: { lt:true, pres:true, sht:true, hvac:true, sec:true, scn:true, av:false, nrg:false, sys:false },
    ltSubs:  { onoff:true, dim:true, cct:true, rgb:true },
    floors: [],
    circuits: {}, generatedGAs: [], manualGAs: [],
    floorView: 'chip', gaView: 'tree', gaTreeGroup: 'mid', gaFilter: 'all',
    exportFormat: 'xml', exportOpts: { dpt:true, desc:false, unused:false, floorFirst:false },
    importedXml: null, _xmlCache: null
  });
  renderAll();
}
