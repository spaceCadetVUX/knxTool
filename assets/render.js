'use strict';

// sysInfo, circuitDefs, buildXML   — engine.js
// state, saveState, debouncedSave  — state.js
// t()                              — i18n.js
// escHtml, showToast               — app.js  (safe: only called at event-time)
// callGenerate, loadXmlPreview     — app.js  (safe: only called at event-time)

// ── UI icon paths ─────────────────────────────────────────────────────────────
const sysIconSvg = {
  light: '<circle cx="7.5" cy="6" r="3.5"/><line x1="7.5" y1="1" x2="7.5" y2="2.2"/><line x1="7.5" y1="9.8" x2="7.5" y2="11"/><line x1="2.5" y1="6" x2="1.2" y2="6"/><line x1="13.8" y1="6" x2="12.5" y2="6"/><path d="M5.5,11 L9.5,11 L9,13.5 L6,13.5 Z"/>',
  pres:  '<circle cx="7.5" cy="5" r="2.5"/><path d="M2,14 C2,10.5 13,10.5 13,14"/>',
  sht:   '<rect x="2" y="2" width="11" height="11" rx="1"/><line x1="2" y1="5.5" x2="13" y2="5.5"/><line x1="2" y1="9" x2="13" y2="9"/>',
  hvac:  '<path d="M7.5,2 L7.5,13 M3,4.5 L7.5,2 L12,4.5 M3,10.5 L7.5,13 L12,10.5"/><circle cx="7.5" cy="7.5" r="2"/>',
  sec:   '<path d="M7.5,1.5 L13,4 L13,8 C13,11 10,13.5 7.5,14 C5,13.5 2,11 2,8 L2,4 Z"/>',
  scn:   '<rect x="2" y="2" width="5" height="5" rx="1"/><rect x="8" y="2" width="5" height="5" rx="1"/><rect x="2" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/>',
  av:    '<rect x="1" y="3" width="13" height="9" rx="1.5"/><line x1="5" y1="12" x2="10" y2="12"/><line x1="7.5" y1="12" x2="7.5" y2="14"/><circle cx="7.5" cy="7.5" r="2.5"/>',
  nrg:   '<polyline points="2,11 5,6 8,9 11,4 13,6"/>',
  sys:   '<circle cx="7.5" cy="7.5" r="5.5"/><line x1="7.5" y1="4" x2="7.5" y2="7.5"/><line x1="7.5" y1="7.5" x2="10" y2="9"/>'
};

// ── Circuit helpers ───────────────────────────────────────────────────────────
const circuitSuggestedNames = {
  lt_onoff: ['Ceiling', 'Wall', 'Cabinet', 'Strip', 'Night', 'Desk'],
  lt_dim:   ['Ceiling', 'Pendant', 'Accent', 'Strip', 'Desk', 'Wall'],
  lt_cct:   ['Ceiling', 'Pendant', 'Strip', 'Desk', 'Wall'],
  lt_rgb:   ['Accent', 'Strip', 'Wall', 'Ceiling'],
  pres_sensor: ['Sensor'],
  sht_motor:   ['Left', 'Right', 'Center', 'Top', 'Bottom'],
  hvac_unit:   ['FCU', 'Unit', 'AC'],
  av_unit:     ['TV', 'AMP', 'Speaker'],
  nrg_meter:   ['Meter', 'Circuit'],
  scn_scene:   ['Scene'],
  sec_zone:    ['Zone'],
};

// Return only circuit defs enabled by sub-type selections
function activeDefs(sk) {
  const all = circuitDefs[sk] || [];
  if (sk === 'lt') return all.filter(([ck]) => state.ltSubs[ck]);
  return all;
}

function getCircuits(fi, ri, sk, ck) {
  return ((((state.circuits[fi] || {})[ri] || {})[sk] || {})[ck]) || [];
}

function addCircuit(fi, ri, sk, ck) {
  if (!state.circuits[fi])             state.circuits[fi] = {};
  if (!state.circuits[fi][ri])         state.circuits[fi][ri] = {};
  if (!state.circuits[fi][ri][sk])     state.circuits[fi][ri][sk] = {};
  if (!state.circuits[fi][ri][sk][ck]) state.circuits[fi][ri][sk][ck] = [];
  const idx  = state.circuits[fi][ri][sk][ck].length;
  const pool = circuitSuggestedNames[`${sk}_${ck}`] || [];
  const name = pool[idx] !== undefined ? pool[idx] : String(idx + 1);
  state.circuits[fi][ri][sk][ck].push(name);
  debouncedSave();
  renderPanel();
}

function removeCircuit(fi, ri, sk, ck, idx) {
  const arr = state.circuits[fi]?.[ri]?.[sk]?.[ck];
  if (!arr) return;
  arr.splice(idx, 1);
  debouncedSave();
  renderPanel();
}

function setCircuitName(fi, ri, sk, ck, idx, val) {
  const arr = state.circuits[fi]?.[ri]?.[sk]?.[ck];
  if (arr) { arr[idx] = val; debouncedSave(); }
}

// ── Core render ───────────────────────────────────────────────────────────────
function renderAll() {
  renderStepBar();
  renderSidebar();
  renderPanel();

  const hp = document.getElementById('header-project');
  const hn = document.getElementById('header-project-name');
  if (state.projectName) {
    hp.style.display = '';
    hn.textContent = state.projectName;
  } else {
    hp.style.display = 'none';
  }
}

function renderStepBar() {
  const labels = t('steps');
  let html = '';
  for (let i = 1; i <= 6; i++) {
    const cls = i === state.step ? 'active' : (i < state.step ? 'done' : '');
    const num = i < state.step ? '✓' : i;
    html += `<button class="step-item ${cls}" onclick="goStep(${i})">
      <div class="step-num">${num}</div>
      <span class="step-label">${Array.isArray(labels) ? labels[i-1] : ''}</span>
    </button>`;
    if (i < 6) html += '<div class="step-arrow">›</div>';
  }
  document.getElementById('stepbar').innerHTML = html;
}

function renderSidebar() {
  const labels = t('steps');
  const selSystems = Object.keys(state.systems).filter(k => state.systems[k]);
  let html = '';

  // Step navigation
  html += '<div class="sb-section"><div class="sb-label">Steps</div>';
  for (let i = 1; i <= 6; i++) {
    const cls = i === state.step ? 'active' : (i < state.step ? 'done' : '');
    html += `<button class="sb-step-btn ${cls}" onclick="goStep(${i})">
      <div class="sb-dot"></div>${Array.isArray(labels) ? labels[i-1] : ''}
    </button>`;
  }
  html += '</div>';

  // Project info
  html += '<div class="sb-section">';
  html += '<div class="sb-label">Project</div>';
  html += `<div class="sb-info-row"><span>Name</span><strong>${state.projectName || '—'}</strong></div>`;
  html += `<div class="sb-info-row"><span>Structure</span><strong>${state.structure === 'function' ? t('function_based') : t('building_based')}</strong></div>`;
  html += `<div class="sb-info-row"><span>${t('floors')}</span><strong>${state.floors.length}</strong></div>`;
  html += '</div>';

  // Selected systems
  if (selSystems.length) {
    html += '<div class="sb-section">';
    html += `<div class="sb-label">Systems (${selSystems.length})</div>`;
    html += '<div class="sb-sys-chips">';
    selSystems.forEach(sk => {
      const si = sysInfo[sk];
      html += `<span class="sb-sys-chip">${si['name_' + state.lang] || si.name_en}</span>`;
    });
    html += '</div></div>';
  }

  // GA count if generated
  if (state.generatedGAs.length) {
    html += '<div class="sb-section">';
    html += `<div class="sb-label">${t('total_gas')}</div>`;
    html += `<div class="sb-ga-total">${state.generatedGAs.length}</div>`;
    html += '</div>';
  }

  // Feedback widget + New project button
  const vi = state.lang === 'vi';
  html += `<div class="sb-section mt-auto">
    <div class="sb-feedback">
      <div class="sb-feedback-header">
        <svg class="sb-feedback-icon" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="1" y="3" width="13" height="9" rx="1.5"/>
          <polyline points="1,4 7.5,9 14,4"/>
        </svg>
        <span class="sb-feedback-title">${vi ? 'Góp ý cải tiến' : 'Send feedback'}</span>
      </div>
      <p class="sb-feedback-desc">${vi ? 'Bạn muốn cải tiến điều gì? Cho chúng tôi biết nhé.' : 'What could be improved? We\'d love to hear from you.'}</p>
      <textarea class="sb-feedback-input" id="sb-feedback-text" rows="3"
        placeholder="${vi ? 'Nhập góp ý của bạn...' : 'Type your feedback here...'}"></textarea>
      <button class="btn btn-primary btn-sm w-full" onclick="sendFeedback()">
        ${vi ? 'Gửi góp ý' : 'Send feedback'}
      </button>
    </div>
    <button class="btn btn-ghost btn-sm w-full text-muted"
      onclick="newProject()">
      ${vi ? '🗑 Dự án mới' : '🗑 New project'}
    </button>
  </div>`;

  document.getElementById('sidebar').innerHTML = html;
}

function renderPanel() {
  const renders = [null, renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6];
  const fn = renders[state.step];
  const nextLabels = {
    1: t('next_systems'), 2: t('next_floors'), 3: t('next_assign'),
    4: t('next_generate'), 5: t('next_export')
  };
  const nextLabel = nextLabels[state.step];
  const nav = `
  <div class="step-nav">
    <button class="btn btn-ghost" onclick="goStep(state.step-1)"
      style="${state.step === 1 ? 'visibility:hidden' : ''}">${t('prev')}</button>
    ${nextLabel ? `<button class="btn btn-primary" onclick="goStep(state.step+1)">${nextLabel}</button>` : ''}
  </div>`;
  document.getElementById('panel').innerHTML = (fn ? fn() : '') + nav;
}

function goStep(n) {
  if (n < 1 || n > 6) return;
  const prev = state.step;
  const vi = state.lang === 'vi';

  // Validate only when going forward
  if (n > prev) {
    if (!state.projectName.trim()) {
      showToast(vi ? 'Vui lòng nhập tên dự án trước' : 'Please enter a project name first', true);
      return;
    }
    if (n >= 4 && !state.floors.some(f => f.rooms.length > 0)) {
      showToast(vi ? 'Cần ít nhất 1 tầng có phòng' : 'Need at least 1 floor with a room', true);
      return;
    }
  }

  state.step = n;
  renderAll();
  if (n === 5 && prev < 5) callGenerate();
  if (n === 6 && state.generatedGAs.length > 0) loadXmlPreview();
  closeSidebar();
}

// ── Step 1 — Structure ────────────────────────────────────────────────────────
function renderStep1() {
  return `
  <div class="section-title">${t('step1_title')}</div>
  <div class="section-desc">${t('step1_desc')}</div>

  <div class="start-options">
    <div class="start-card active">
      <div class="start-card-icon">📋</div>
      <div>
        <div class="start-card-title">${t('start_new')}</div>
        <div class="start-card-desc">${t('start_new_desc')}</div>
      </div>
    </div>
    <div class="start-card" onclick="openImportModal()">
      <div class="start-card-icon">📂</div>
      <div>
        <div class="start-card-title">${t('start_import')}</div>
        <div class="start-card-desc">${t('start_import_desc')}</div>
      </div>
    </div>
  </div>

  <div class="sb-label mb-2">${t('structure_type')}</div>
  <div class="structure-grid">
    <div class="structure-card ${state.structure === 'function' ? 'selected' : ''}" onclick="selectStructure('function')">
      <div class="sc-icon">⚙️</div>
      <div class="sc-title">${t('function_based')}</div>
      <div class="sc-desc">${t('fn_desc')}</div>
      <div class="addr-hint mt-3">
        1/2/0 → LT - GF - Living room - SW<br>
        3/2/0 → SHT - GF - Living room - MOVE<br>
        4/3/0 → HVAC - FL1 - Master bed - TEMP
      </div>
    </div>
    <div class="structure-card ${state.structure === 'building' ? 'selected' : ''}" onclick="selectStructure('building')">
      <div class="sc-icon">🏢</div>
      <div class="sc-title">${t('building_based')}</div>
      <div class="sc-desc">${t('bd_desc')}</div>
      <div class="addr-hint mt-3">
        2/1/0 → GF - Lighting - Living room - SW<br>
        2/3/0 → GF - Shutter - Living room - MOVE<br>
        3/2/0 → FL1 - HVAC - Master bed - TEMP
      </div>
    </div>
  </div>

  <div class="field mt-4" style="max-width:400px">
    <label class="field-label">${t('project_name')}</label>
    <input class="input" id="proj-name-input"
      placeholder="${t('project_name_ph')}"
      value="${escHtml(state.projectName)}"
      oninput="state.projectName=this.value;updateHeaderProject()" />
  </div>`;
}

function selectStructure(s) {
  state.structure = s;
  renderPanel();
  saveState();
}

// ── Step 2 — Systems ──────────────────────────────────────────────────────────
function renderStep2() {
  const coreSys = ['lt','pres','sht','hvac','sec','scn'];
  const extSys  = ['av','nrg','sys'];
  const selCount = Object.values(state.systems).filter(Boolean).length;

  function sysCard(sk) {
    const si  = sysInfo[sk];
    const on  = state.systems[sk];
    const icon = `<svg class="sys-icon" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${sysIconSvg[si.icon]}</svg>`;
    return `<div class="sys-card ${on ? 'active' : ''}" onclick="toggleSys('${sk}');showGaDetail('${sk}')">
      ${icon}
      <span class="sys-name">${si['name_' + state.lang] || si.name_en}</span>
    </div>`;
  }

  const ltSubChips = [['onoff','On/Off'],['dim','Dimming'],['cct','CCT'],['rgb','RGBW']];

  return `
  <div class="two-col">
    <div>
      <div class="section-title">${t('step2_title')}</div>
      <div class="section-desc">${t('step2_desc')} <span class="sel-count">${selCount} selected</span></div>

      <div class="sb-label">${t('core_systems')}</div>
      <div class="systems-grid mb-4">${coreSys.map(sysCard).join('')}</div>

      <div class="sb-label">${t('extended_systems')}</div>
      <div class="systems-grid mb-4">${extSys.map(sysCard).join('')}</div>

      ${state.systems.lt ? `
      <div class="sb-label">${t('lt_subopts')}</div>
      <div class="sub-chips mb-4">
        ${ltSubChips.map(([k,l]) => `<div class="chip ${state.ltSubs[k] ? 'active' : ''}" onclick="state.ltSubs['${k}']=!state.ltSubs['${k}'];this.classList.toggle('active')">${l}</div>`).join('')}
      </div>` : ''}

    </div>
    <div>
      <div class="ga-set-preview" id="ga-detail-pane">
        <div class="ga-set-empty">
          <div class="ga-set-icon">📋</div>
          ${t('click_card')}
        </div>
      </div>
    </div>
  </div>`;
}

function toggleSys(sk) {
  state.systems[sk] = !state.systems[sk];
  renderPanel();
  renderSidebar();
  saveState();
}

function showGaDetail(sk) {
  const pane = document.getElementById('ga-detail-pane');
  if (!pane) return;
  const si = sysInfo[sk];
  const lang = state.lang;
  pane.innerHTML = `
    <div class="flex items-center gap-2 mb-2">
      <svg viewBox="0 0 15 15" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px">${sysIconSvg[si.icon]}</svg>
      <strong style="font-size:14px">${si['name_' + lang] || si.name_en}</strong>
      <span class="badge badge-teal">Main ${si.main}</span>
    </div>
    <div class="text-sm mb-3">${si['desc_' + lang] || si.desc_en}</div>
    <div class="sb-label">${t('ga_set_per')}</div>
    ${si.gaNames.map((n, i) => `<div class="ga-set-row">
      <span class="ga-offset">+${i}</span>
      <span class="ga-set-name">${n}</span>
    </div>`).join('')}`;
}

// ── Step 3 — Floors ───────────────────────────────────────────────────────────
function renderStep3() {
  const isChip = state.floorView !== 'tree';
  const isEmpty = state.floors.length === 0;
  const vi = state.lang === 'vi';

  const emptyState = `
  <div class="floors-empty">
    <div class="floors-empty-icon">▤</div>
    <p>${vi ? 'Chưa có tầng nào. Bấm "+ Thêm tầng" để bắt đầu.' : 'No floors yet. Click "+ Add floor" to get started.'}</p>
  </div>`;

  return `
  <div class="section-title">${t('step3_title')}</div>
  <div class="section-desc">${t('step3_desc')}</div>

  <div class="flex justify-end mb-3">
    <div class="view-toggle">
      <button class="vt-btn ${isChip ? 'active' : ''}" onclick="state.floorView='chip';renderPanel()">${t('chip_view')}</button>
      <button class="vt-btn ${!isChip ? 'active' : ''}" onclick="state.floorView='tree';renderPanel()">${t('tree_view')}</button>
    </div>
  </div>

  ${isEmpty ? emptyState : (isChip
    ? `<div class="floors-list">${state.floors.map((floor, fi) => renderFloorCard(floor, fi)).join('')}</div>`
    : renderFloorTree()
  )}

  <button class="add-floor-btn" onclick="addFloor()" style="margin-top:${isEmpty?'0':'4px'}">
    <span>+</span>
    ${t('add_floor')}
  </button>`;
}

function renderFloorCard(floor, fi) {
  const rc = floor.rooms.length;
  const vi = state.lang === 'vi';
  const roomTags = floor.rooms.map((r, ri) => `
    <div class="room-tag" id="chip-${fi}-${ri}">
      <span class="room-tag-text" ondblclick="startRenameRoomChip(${fi},${ri})">${escHtml(r)}</span>
      <button class="room-tag-del" onclick="removeRoom(${fi},${ri})" title="${vi?'Xóa':'Remove'}">✕</button>
    </div>`).join('');

  return `
  <div class="floor-card" draggable="true" id="fcard-${fi}"
    ondragstart="floorDragStart(event,${fi})"
    ondragover="floorDragOver(event,${fi})"
    ondrop="floorDrop(event,${fi})"
    ondragend="floorDragEnd()">
    <div class="floor-card-header">
      <span class="drag-handle" title="${vi?'Kéo để sắp xếp':'Drag to reorder'}">⠿</span>
      <span class="mid-badge">M${floor.mid}</span>
      <input class="floor-name-field" value="${escHtml(floor.name)}"
        oninput="state.floors[${fi}].name=this.value;debouncedSave();renderSidebar()"
        title="${vi?'Click để đổi tên':'Click to rename'}" />
      <span class="floor-room-count ${rc===0?'zero':''}" id="frc-${fi}">${rc} ${vi?'phòng':rc===1?'room':'rooms'}</span>
      <button class="floor-del" onclick="removeFloor(${fi})" title="${vi?'Xóa tầng':'Remove floor'}">✕</button>
    </div>
    <div class="floor-card-body">
      <div class="room-tags" id="rtags-${fi}">${roomTags}</div>
      <div class="room-add-row">
        <input class="room-add-input" id="room-input-${fi}" type="text"
          placeholder="${vi?'+ Thêm phòng… (Enter để lưu)':'+ Add a room… (Enter to save)'}"
          onkeydown="handleRoomKey(event,${fi})" />
        <button class="room-add-btn" onclick="addRoomFromInput(${fi})">${vi?'Thêm':'Add'}</button>
      </div>
    </div>
  </div>`;
}

function renderFloorTree() {
  const vi = state.lang === 'vi';
  return `<div class="tree-list">${state.floors.map((floor, fi) => {
    const rc = floor.rooms.length;
    const isOpen = floor._open !== false;
    return `
    <div class="tree-floor-node" draggable="true" id="fcard-${fi}"
      ondragstart="floorDragStart(event,${fi})"
      ondragover="floorDragOver(event,${fi})"
      ondrop="floorDrop(event,${fi})"
      ondragend="floorDragEnd()">
      <div class="tree-floor-hd ${isOpen?'open':''}" onclick="toggleTreeFloor(${fi})">
        <span class="drag-handle" onclick="event.stopPropagation()" title="${state.lang==='vi'?'Kéo để sắp xếp':'Drag to reorder'}">⠿</span>
        <span class="tree-caret ${isOpen?'open':''}">▶</span>
        <span class="mid-badge">M${floor.mid}</span>
        <input class="floor-name-field" value="${escHtml(floor.name)}"
          oninput="state.floors[${fi}].name=this.value;debouncedSave();renderSidebar()"
          onclick="event.stopPropagation()" />
        <span class="floor-room-count ${rc===0?'zero':''}" id="frc-${fi}">${rc} ${vi?'phòng':rc===1?'room':'rooms'}</span>
        <button class="floor-del" onclick="event.stopPropagation();removeFloor(${fi})"
          title="${vi?'Xóa tầng':'Remove floor'}">✕</button>
      </div>
      ${isOpen ? `
      <div class="tree-floor-body tree-connector">
        ${floor.rooms.map((r, ri) => `
        <div class="tree-room-row" id="troom-${fi}-${ri}">
          <span class="tree-room-idx">${ri + 1}</span>
          <span class="tree-room-name" id="tname-${fi}-${ri}">${escHtml(r)}</span>
          <div class="tree-room-actions">
            <button class="tree-icon-btn" onclick="startRenameRoomTree(${fi},${ri})" title="${vi?'Đổi tên':'Rename'}">✎</button>
            <button class="tree-icon-btn danger" onclick="removeRoom(${fi},${ri})" title="${vi?'Xóa':'Delete'}">✕</button>
          </div>
        </div>`).join('')}
        <div class="tree-add-room">
          <input class="tree-add-room-inp" id="room-input-${fi}" type="text"
            placeholder="${vi?'+ Thêm phòng… (Enter)':'+ Add a room… (Enter)'}"
            onkeydown="handleRoomKey(event,${fi})" />
          <button class="room-add-btn" onclick="addRoomFromInput(${fi})">${vi?'Thêm':'Add'}</button>
        </div>
      </div>` : ''}
    </div>`;
  }).join('')}</div>`;
}

function toggleTreeFloor(fi) {
  state.floors[fi]._open = state.floors[fi]._open === false ? true : false;
  renderPanel();
}

// ── Room rename helpers ───────────────────────────────────────────────────────
function startRenameRoomChip(fi, ri) {
  const tag = document.getElementById('chip-' + fi + '-' + ri);
  if (!tag) return;
  const span = tag.querySelector('.room-tag-text');
  if (!span) return;
  const cur = state.floors[fi].rooms[ri];
  tag.classList.add('editing');
  const inp = document.createElement('input');
  inp.className = 'room-tag-rename';
  inp.value = cur;
  inp.style.width = Math.max(50, cur.length * 8) + 'px';
  span.replaceWith(inp);
  inp.focus(); inp.select();
  function commit() {
    const v = inp.value.trim();
    if (v && v !== cur) { state.floors[fi].rooms[ri] = v; saveState(); renderSidebar(); }
    const s = document.createElement('span');
    s.className = 'room-tag-text';
    s.textContent = v || cur;
    s.setAttribute('ondblclick', `startRenameRoomChip(${fi},${ri})`);
    inp.replaceWith(s);
    tag.classList.remove('editing');
  }
  inp.onblur = commit;
  inp.onkeydown = e => {
    if (e.key === 'Enter') { e.preventDefault(); inp.blur(); }
    if (e.key === 'Escape') { inp.value = cur; inp.blur(); }
  };
}

function startRenameRoomTree(fi, ri) {
  const nameEl = document.getElementById('tname-' + fi + '-' + ri);
  if (!nameEl) return;
  const cur = state.floors[fi].rooms[ri];
  const inp = document.createElement('input');
  inp.className = 'tree-room-rename-inp';
  inp.value = cur;
  nameEl.replaceWith(inp);
  inp.focus(); inp.select();
  function commit() {
    const v = inp.value.trim();
    if (v && v !== cur) { state.floors[fi].rooms[ri] = v; saveState(); renderSidebar(); }
    const s = document.createElement('span');
    s.className = 'tree-room-name';
    s.id = 'tname-' + fi + '-' + ri;
    s.textContent = v || cur;
    inp.replaceWith(s);
  }
  inp.onblur = commit;
  inp.onkeydown = e => {
    if (e.key === 'Enter') { e.preventDefault(); inp.blur(); }
    if (e.key === 'Escape') { inp.value = cur; inp.blur(); }
  };
}

function handleRoomKey(e, fi) {
  if (e.key === 'Enter') { e.preventDefault(); addRoomFromInput(fi); }
  if (e.key === 'Escape') { e.target.value = ''; e.target.blur(); }
}

function addRoomFromInput(fi) {
  const inp = document.getElementById('room-input-' + fi);
  if (!inp) return;
  const name = inp.value.trim();
  if (!name) { inp.focus(); return; }
  state.floors[fi].rooms.push(name);
  inp.value = '';
  inp.focus();
  renderPanel();
  renderSidebar();
  saveState();
  setTimeout(() => { const el = document.getElementById('room-input-' + fi); if (el) el.focus(); }, 20);
}

function removeRoom(fi, ri) {
  state.floors[fi].rooms.splice(ri, 1);
  renderPanel();
  renderSidebar();
  saveState();
}

function addFloor() {
  const usedMids = new Set(state.floors.map(f => f.mid));
  let nextMid = 1;
  while (usedMids.has(nextMid) && nextMid <= 7) nextMid++;
  if (nextMid > 7) { showToast(state.lang === 'vi' ? 'Tối đa 7 tầng (M1–M7)' : 'Maximum 7 floors (M1–M7)', true); return; }
  state.floors.push({ id:'f'+nextMid, mid:nextMid, name: (state.lang === 'vi' ? 'Tầng ' : 'Floor ') + nextMid, rooms:[] });
  renderPanel();
  renderSidebar();
  saveState();
  setTimeout(() => {
    const inputs = document.querySelectorAll('.floor-name-field');
    if (inputs.length) inputs[inputs.length - 1].select();
  }, 50);
}

function removeFloor(fi) {
  if (state.floors[fi].rooms.length > 0) {
    if (!confirm((state.lang === 'vi'
      ? `Xóa tầng "${state.floors[fi].name}" và ${state.floors[fi].rooms.length} phòng?`
      : `Remove "${state.floors[fi].name}" and its ${state.floors[fi].rooms.length} room(s)?`))) return;
  }
  state.floors.splice(fi, 1);
  renderPanel();
  renderSidebar();
  saveState();
}

// ── Step 4 — Assign circuits ──────────────────────────────────────────────────
let assignFloor = 0;
let assignRoom  = 0;

// ── Drag-to-reorder state ────────────────────────────────────────────────────
let _dragFloorIdx = null;

// ── Undo delete state ────────────────────────────────────────────────────────
let _undoBuffer = null;

function renderStep4() {
  const sysList = Object.keys(state.systems).filter(k => state.systems[k]);
  const vi = state.lang === 'vi';

  if (state.floors.length === 0) return `
    <div class="section-title">${t('step4_title')}</div>
    <div class="section-desc">${t('step4_desc')}</div>
    <div class="empty-state bordered">
      ${vi ? 'Chưa có tầng nào. Quay lại bước Tầng & Phòng để thêm.' : 'No floors defined. Go back to Floors & Rooms to add some.'}
    </div>`;

  if (assignFloor >= state.floors.length) assignFloor = 0;
  const floor      = state.floors[assignFloor];
  const validRooms = floor.rooms || [];
  if (assignRoom >= validRooms.length) assignRoom = 0;

  function floorTotal(fi) {
    return (state.floors[fi].rooms || []).reduce((a, _, ri) =>
      a + sysList.reduce((b, sk) =>
        b + activeDefs(sk).reduce((c, [ck]) => c + getCircuits(fi, ri, sk, ck).length, 0), 0), 0);
  }

  function roomTotal(fi, ri) {
    return sysList.reduce((a, sk) =>
      a + activeDefs(sk).reduce((b, [ck]) => b + getCircuits(fi, ri, sk, ck).length, 0), 0);
  }

  function renderRoomCircuits(fi, ri) {
    return sysList.map(sk => {
      const si    = sysInfo[sk];
      const cdefs = activeDefs(sk);
      const total = cdefs.reduce((a, [ck]) => a + getCircuits(fi, ri, sk, ck).length, 0);
      const badgeText = total === 0
        ? (vi ? 'chưa có' : 'none')
        : total + (vi ? ' mạch' : (total > 1 ? ' circuits' : ' circuit'));
      return `
      <div class="sys-section">
        <div class="sys-section-head">
          <div class="sys-section-icon">
            <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${sysIconSvg[si.icon]}</svg>
          </div>
          <span class="sys-section-label">${si['name_' + state.lang] || si.name_en}</span>
          <span class="qty-sum-badge ${total === 0 ? 'zero' : ''}">${badgeText}</span>
        </div>
        ${cdefs.map(([ck, clabel]) => {
          const names = getCircuits(fi, ri, sk, ck);
          return `
          <div class="circuit-type-group">
            <div class="circuit-type-label">${clabel}</div>
            ${names.map((name, idx) => `
            <div class="circuit-row">
              <span class="circuit-num">${idx + 1}</span>
              <input class="input input-sm circuit-name-input" value="${escHtml(name)}"
                oninput="setCircuitName(${fi},${ri},'${sk}','${ck}',${idx},this.value)" />
              <button class="circuit-del" onclick="removeCircuit(${fi},${ri},'${sk}','${ck}',${idx})"
                title="${vi ? 'Xóa' : 'Remove'}">✕</button>
            </div>`).join('')}
            <button class="circuit-add-btn" onclick="addCircuit(${fi},${ri},'${sk}','${ck}')">
              <span>+</span>
              ${vi ? 'Thêm' : 'Add'} ${clabel}
            </button>
          </div>`;
        }).join('')}
      </div>`;
    }).join('');
  }

  return `
  <div class="section-title">${t('step4_title')}</div>
  <div class="section-desc">${t('step4_desc')}</div>

  <div class="floor-select-mobile">
    <label class="field-label">${vi ? 'Tầng' : 'Floor'}</label>
    <select class="input" onchange="assignFloor=parseInt(this.value);assignRoom=0;renderPanel()">
      ${state.floors.map((f, fi) => `<option value="${fi}" ${fi === assignFloor ? 'selected' : ''}>${escHtml(f.name)}</option>`).join('')}
    </select>
  </div>

  <div class="assign-layout">
    <div class="assign-left">
      <div class="assign-left-header">${vi ? 'Tầng' : 'Floors'}</div>
      ${state.floors.map((f, fi) => {
        const ft = floorTotal(fi);
        return `<button class="assign-floor-btn ${fi === assignFloor ? 'active' : ''}"
          onclick="assignFloor=${fi};assignRoom=0;renderPanel()">
          <span class="mid-badge">M${f.mid}</span>
          <span class="truncate-flex">${escHtml(f.name)}</span>
          ${ft > 0 ? `<span class="assign-floor-count">${ft}</span>` : ''}
        </button>`;
      }).join('')}
    </div>

    <div>
      <div class="room-tab-bar">
        ${validRooms.length === 0
          ? `<span class="no-rooms-msg">${t('no_rooms')}</span>`
          : validRooms.map((room, ri) => {
              const rt = roomTotal(assignFloor, ri);
              return `<button class="room-tab ${ri === assignRoom ? 'active' : ''}"
                onclick="assignRoom=${ri};renderPanel()">
                ${escHtml(room)}${rt > 0 ? `<span class="room-tab-count">${rt}</span>` : ''}
              </button>`;
            }).join('')}
      </div>
      <div class="room-qty-area">
        ${validRooms.length === 0
          ? `<div class="empty-state">${t('no_rooms')}</div>`
          : (sysList.length === 0
            ? `<div class="empty-state">${vi ? 'Chưa chọn hệ thống nào.' : 'No systems selected.'}</div>`
            : renderRoomCircuits(assignFloor, assignRoom))}
      </div>
    </div>
  </div>`;
}

// ── Step 5 — Generate & Review ────────────────────────────────────────────────
function renderStep5() {
  const gas      = state.generatedGAs;
  const total    = gas.length;
  const ctrlCnt  = gas.filter(g => g.type === 'ctrl').length;
  const fbCnt    = gas.filter(g => g.type === 'fb').length;
  const mainCnt  = new Set(gas.map(g => g.main)).size;
  const sysList  = Object.keys(state.systems).filter(k => state.systems[k]);

  const filtered = state.gaFilter === 'all'
    ? gas
    : gas.filter(g => { const si = sysInfo[state.gaFilter]; return si && g.main === si.main; });

  const dptDatalist = dptOptions.map(d =>
    `<option value="${d.id}">${d.id} — ${d.name}</option>`).join('');

  return `
  <div class="section-title">${t('step5_title')}</div>
  <div class="section-desc">${t('step5_desc')}</div>

  <div class="stat-bar mb-4">
    <div class="stat-card"><div class="val">${total}</div><div class="lbl">${t('total_gas')}</div></div>
    <div class="stat-card"><div class="val">${mainCnt}</div><div class="lbl">${t('main_groups')}</div></div>
    <div class="stat-card"><div class="val">${state.floors.length}</div><div class="lbl">${t('floors')}</div></div>
  </div>

  <div class="ga-toolbar mb-3">
    <div class="filter-chips">
      <div class="chip ${state.gaFilter === 'all' ? 'active' : ''}" onclick="state.gaFilter='all';renderPanel()">${t('all_filter')} (${total})</div>
      ${sysList.map(sk => {
        const si  = sysInfo[sk];
        const cnt = gas.filter(g => g.main === si.main).length;
        return `<div class="chip ${state.gaFilter === sk ? 'active' : ''}" onclick="state.gaFilter='${sk}';renderPanel()">${si['name_' + state.lang] || si.name_en} (${cnt})</div>`;
      }).join('')}
    </div>
    <div class="toolbar-actions">
      <div class="view-toggle">
        <button class="vt-btn ${state.gaTreeGroup === 'mid'  ? 'active' : ''}" onclick="state.gaTreeGroup='mid';renderPanel()">${state.lang === 'vi' ? 'Theo tầng' : 'By Floor'}</button>
        <button class="vt-btn ${state.gaTreeGroup === 'room' ? 'active' : ''}" onclick="state.gaTreeGroup='room';renderPanel()">${state.lang === 'vi' ? 'Theo phòng' : 'By Room'}</button>
        <button class="vt-btn ${state.gaTreeGroup === 'main' ? 'active' : ''}" onclick="state.gaTreeGroup='main';renderPanel()">${state.lang === 'vi' ? 'Theo hệ thống' : 'By System'}</button>
      </div>
      <button class="btn btn-secondary btn-sm" onclick="collapseAll()" title="${state.lang==='vi'?'Thu gọn tất cả':'Collapse all'}">−</button>
      <button class="btn btn-secondary btn-sm" onclick="expandAll()"   title="${state.lang==='vi'?'Mở rộng tất cả':'Expand all'}">+</button>
      <button class="btn btn-secondary btn-sm" onclick="openImportModal()">${t('import_xml')}</button>
      <button class="btn btn-secondary btn-sm" onclick="callGenerate()">${t('regenerate')}</button>
    </div>
  </div>

  ${total === 0
    ? `<div class="card empty-state">${t('no_gas')}</div>`
    : (state.gaTreeGroup === 'main' ? renderGaTreeByMain(filtered)
      : state.gaTreeGroup === 'room' ? renderGaTreeByRoom(filtered)
      : renderGaTree(filtered))
  }

  <div class="card mt-4">
    <div class="card-header">
      <div class="card-title">${t('add_ga_manual')}</div>
    </div>
    <div class="manual-ga-form">
      <div class="field">
        <label class="field-label">${state.lang === 'vi' ? 'Địa chỉ (x/y/z)' : 'Address (x/y/z)'}</label>
        <div class="addr-inputs">
          <input class="input input-sm addr-part" id="add-main" type="number" min="0" max="15"  placeholder="0–15"  />
          <span class="addr-sep">/</span>
          <input class="input input-sm addr-part" id="add-mid"  type="number" min="0" max="7"   placeholder="0–7"   />
          <span class="addr-sep">/</span>
          <input class="input input-sm addr-part" id="add-sub"  type="number" min="0" max="255" placeholder="0–255" />
        </div>
      </div>
      <div class="field field-name">
        <label class="field-label">${state.lang === 'vi' ? 'Tên GA' : 'GA name'}</label>
        <input class="input input-sm" id="add-name" type="text" placeholder="e.g. LT - GF - Living Room - SW" />
      </div>
      <div class="field">
        <label class="field-label">DPT</label>
        <input class="input input-sm input-w-dpt" list="dpt-datalist" id="add-dpt" placeholder="Search DPT…" />
        <datalist id="dpt-datalist">${dptDatalist}</datalist>
      </div>
      <div class="field">
        <label class="field-label">${state.lang === 'vi' ? 'Loại' : 'Type'}</label>
        <select class="input input-sm input-w-xs" id="add-type">
          <option value="ctrl">control</option>
          <option value="fb">feedback</option>
        </select>
      </div>
      <button class="btn btn-primary btn-sm" onclick="addManualGA()">+ ${t('add_ga')}</button>
    </div>
  </div>`;
}

function renderGaTree(filtered) {
  const floorGroups = {};
  filtered.forEach(g => {
    // gatype systems (LT, SHT, HVAC...): g.mid encodes GA type, not floor.
    // Find the real floor by looking up which floor contains g.room.
    // Fall back to mid-based lookup for floor-based systems (SEC, SCN).
    const floor = (g.room && state.floors.find(f => f.rooms.includes(g.room)))
               || state.floors.find(f => f.mid === g.mid);
    const floorMid  = floor ? floor.mid  : g.mid;
    const floorName = floor ? floor.name : `Floor ${g.mid}`;
    if (!floorGroups[floorMid]) floorGroups[floorMid] = { name: floorName, gas: [] };
    floorGroups[floorMid].gas.push(g);
  });

  if (!Object.keys(floorGroups).length) return `<div class="card empty-state">${t('no_gas')}</div>`;

  return Object.entries(floorGroups)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([mid, fg]) => {
      const fid = `gfloor-${mid}`;
      return `
      <div class="mb-2">
        <div class="ga-main-row" onclick="toggleBlock('${fid}')">
          <span class="mid-badge">M${mid}</span>
          <span class="ga-main-name">${escHtml(fg.name)}</span>
          <span class="badge badge-teal ml-auto">${fg.gas.length} GAs</span>
          <span class="tree-arrow" id="arr-${fid}">▼</span>
        </div>
        <div id="${fid}">
          ${fg.gas.map(g => gaRow(g)).join('')}
        </div>
      </div>`;
    }).join('');
}

function renderGaTreeByRoom(filtered) {
  // Group by room; track which floor each room belongs to for display
  const roomGroups = {};
  filtered.forEach(g => {
    const key = g.room || '—';
    if (!roomGroups[key]) {
      const floor = g.room && state.floors.find(f => f.rooms.includes(g.room));
      roomGroups[key] = { floorName: floor ? floor.name : '', gas: [] };
    }
    roomGroups[key].gas.push(g);
  });

  if (!Object.keys(roomGroups).length) return `<div class="card empty-state">${t('no_gas')}</div>`;

  return Object.entries(roomGroups)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([roomName, rg]) => {
      const rid = `groom-${roomName.replace(/[^a-zA-Z0-9]/g, '-')}`;
      const floorBadge = rg.floorName
        ? `<span class="badge badge-gray">${escHtml(rg.floorName)}</span>` : '';
      return `
      <div class="mb-2">
        <div class="ga-main-row" onclick="toggleBlock('${rid}')">
          <span class="ga-main-name">${escHtml(roomName)}</span>
          ${floorBadge}
          <span class="badge badge-teal ml-auto">${rg.gas.length} GAs</span>
          <span class="tree-arrow" id="arr-${rid}">▼</span>
        </div>
        <div id="${rid}">
          ${rg.gas.map(g => gaRow(g)).join('')}
        </div>
      </div>`;
    }).join('');
}

function renderGaTreeByMain(filtered) {
  const mainGroups = {};
  filtered.forEach(g => {
    const mk = g.main;
    if (!mainGroups[mk]) mainGroups[mk] = { name: g.mainName || `Main ${mk}`, mids: {} };
    const yk = g.mid;
    if (!mainGroups[mk].mids[yk]) mainGroups[mk].mids[yk] = { name: g.midName || String(yk), gas: [] };
    mainGroups[mk].mids[yk].gas.push(g);
  });

  if (!Object.keys(mainGroups).length) return `<div class="card empty-state">${t('no_gas')}</div>`;

  return Object.entries(mainGroups)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([main, mg]) => {
      const total = Object.values(mg.mids).reduce((a, m) => a + m.gas.length, 0);
      const fid   = `gmain-${main}`;
      return `
      <div class="mb-2">
        <div class="ga-main-row" onclick="toggleBlock('${fid}')">
          <span class="mid-badge">${main}</span>
          <span class="ga-main-name">${escHtml(mg.name)}</span>
          <span class="badge badge-teal ml-auto">${total} GAs</span>
          <span class="tree-arrow" id="arr-${fid}">▼</span>
        </div>
        <div id="${fid}">
          ${Object.entries(mg.mids)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([mid, mg2]) => {
              const rid = `gmid-${main}-${mid}`;
              return `
              <div class="mb-1">
                <div class="ga-mid-row" onclick="toggleBlock('${rid}')">
                  <span class="ga-mid-name">${main}/${mid} — ${escHtml(mg2.name)}</span>
                  <span class="badge badge-gray ml-auto">${mg2.gas.length}</span>
                  <span class="tree-arrow" id="arr-${rid}">▼</span>
                </div>
                <div id="${rid}">
                  ${mg2.gas.map(g => gaRow(g)).join('')}
                </div>
              </div>`;
            }).join('')}
        </div>
      </div>`;
    }).join('');
}

function renderGaTable(filtered) {
  const addrLbl = state.lang === 'vi' ? 'Địa chỉ' : 'Address';
  const nameLbl = state.lang === 'vi' ? 'Tên GA'  : 'GA Name';
  const sysLbl  = state.lang === 'vi' ? 'Hệ thống': 'System';
  const typeLbl = state.lang === 'vi' ? 'Loại'    : 'Type';
  return `<div class="ga-table-wrap">
    <table class="ga-table">
      <thead><tr>
        <th class="col-addr">${addrLbl}</th>
        <th>${nameLbl}</th>
        <th class="col-sys">${sysLbl}</th>
        <th class="col-dpt">DPT</th>
        <th class="col-type">${typeLbl}</th>
        <th class="col-del"></th>
      </tr></thead>
      <tbody>${filtered.map(g => `<tr>
        <td class="col-addr">${g.addr}</td>
        <td>
          <span class="ga-name-text" onclick="startGaEdit(this)">${escHtml(g.name)}</span>
          <input class="input-inline ga-name-input" data-addr="${g.addr}"
            onblur="stopGaEdit(this)" onkeydown="keyGaEdit(event,this)" />
        </td>
        <td class="col-sys"><span class="badge badge-gray text-xs">${escHtml(g.mainName || '')}</span></td>
        <td class="col-dpt">${g.dpt}</td>
        <td class="col-type"><span class="badge ${g.type === 'ctrl' ? 'badge-teal' : 'badge-gray'}">${g.type === 'ctrl' ? t('ctrl_short') : t('fb_short')}</span></td>
        <td class="col-del"><button class="btn-icon danger" onclick="deleteGA('${g.addr}')">✕</button></td>
      </tr>`).join('')}</tbody>
    </table>
  </div>`;
}

function gaRow(g) {
  return `<div class="ga-row">
    <span class="addr">${g.addr}</span>
    <span class="ga-name-text name" onclick="startGaEdit(this)">${escHtml(g.name)}</span>
    <input class="input-inline ga-name-input name" data-addr="${g.addr}"
      onblur="stopGaEdit(this)" onkeydown="keyGaEdit(event,this)" />
    <span class="dpt">${g.dpt}</span>
    <span class="type badge ${g.type === 'ctrl' ? 'badge-teal' : 'badge-gray'}">${g.type === 'ctrl' ? t('ctrl_short') : t('fb_short')}</span>
    <span class="actions">
      <button class="btn-icon danger btn-xs" onclick="deleteGA('${g.addr}')">✕</button>
    </span>
  </div>`;
}

function toggleBlock(id) {
  const el  = document.getElementById(id);
  const arr = document.getElementById('arr-' + id);
  if (!el) return;
  const hidden = el.style.display === 'none';
  el.style.display  = hidden ? '' : 'none';
  if (arr) arr.textContent = hidden ? '▼' : '▶';
}

function startGaEdit(el) {
  const inp = el.nextElementSibling;
  inp.value = el.textContent;
  el.style.display  = 'none';
  inp.style.display = 'block';
  inp.focus(); inp.select();
}

function stopGaEdit(inp) {
  const text = inp.previousElementSibling;
  const addr = inp.getAttribute('data-addr');
  const val  = inp.value.trim();
  if (val) {
    text.textContent = val;
    const ga = state.generatedGAs.find(g => g.addr === addr);
    if (ga) { ga.name = val; debouncedSave(); }
  }
  inp.style.display  = 'none';
  text.style.display = '';
}

function keyGaEdit(e, inp) {
  if (e.key === 'Enter')  inp.blur();
  if (e.key === 'Escape') { inp.value = ''; inp.blur(); }
}

function deleteGA(addr) {
  const idx = state.generatedGAs.findIndex(g => g.addr === addr);
  if (idx === -1) return;
  const mIdx = state.manualGAs.findIndex(g => g.addr === addr);
  _undoBuffer = {
    ga:      { ...state.generatedGAs[idx] },
    gaIdx:   idx,
    manual:  mIdx !== -1 ? { ...state.manualGAs[mIdx] } : null,
    manIdx:  mIdx
  };
  state.generatedGAs.splice(idx, 1);
  if (mIdx !== -1) state.manualGAs.splice(mIdx, 1);
  renderPanel();
  renderSidebar();
  saveState();
  showUndoToast(
    (state.lang === 'vi' ? `Đã xóa GA ${addr}` : `Deleted GA ${addr}`),
    undoDeleteGA
  );
}

function undoDeleteGA() {
  if (!_undoBuffer) return;
  const { ga, gaIdx, manual, manIdx } = _undoBuffer;
  _undoBuffer = null;
  state.generatedGAs.splice(gaIdx, 0, ga);
  if (manual) state.manualGAs.splice(manIdx, 0, manual);
  renderPanel();
  renderSidebar();
  saveState();
  showToast(state.lang === 'vi' ? 'Đã hoàn tác' : 'Undone');
}

function addManualGA() {
  const main = parseInt(document.getElementById('add-main').value);
  const mid  = parseInt(document.getElementById('add-mid').value);
  const sub  = parseInt(document.getElementById('add-sub').value);
  const name = (document.getElementById('add-name').value || '').trim();
  const dpt  = document.getElementById('add-dpt').value.trim();
  const type = document.getElementById('add-type').value;
  const vi   = state.lang === 'vi';

  if (isNaN(main) || main < 0 || main > 15) {
    showToast(vi ? 'Main group phải từ 0–15' : 'Main group must be 0–15', true); return;
  }
  if (isNaN(mid) || mid < 0 || mid > 7) {
    showToast(vi ? 'Middle group phải từ 0–7' : 'Middle group must be 0–7', true); return;
  }
  if (isNaN(sub) || sub < 0 || sub > 255) {
    showToast(vi ? 'Sub group phải từ 0–255' : 'Sub group must be 0–255', true); return;
  }
  if (!name) {
    showToast(vi ? 'Vui lòng nhập tên GA' : 'Please enter a GA name', true); return;
  }
  if (!dpt) {
    showToast(vi ? 'Vui lòng chọn DPT' : 'Please select a DPT', true); return;
  }
  const addr = `${main}/${mid}/${sub}`;
  if (state.generatedGAs.find(g => g.addr === addr)) {
    if (!confirm((state.lang === 'vi' ? 'Địa chỉ ' : 'Address ') + addr + (state.lang === 'vi' ? ' đã tồn tại. Ghi đè?' : ' already exists. Overwrite?'))) return;
    state.generatedGAs = state.generatedGAs.filter(g => g.addr !== addr);
    state.manualGAs    = state.manualGAs.filter(g => g.addr !== addr);
  }
  const skEntry = Object.keys(sysInfo).find(k => sysInfo[k].main === main);
  const newGA = { addr, name, dpt, type, main, mid, mainName: skEntry ? sysInfo[skEntry].name_en : 'Custom', manual: true };
  state.generatedGAs.push(newGA);
  state.manualGAs.push({ ...newGA });
  state.generatedGAs.sort((a, b) => {
    const ap = a.addr.split('/').map(Number), bp = b.addr.split('/').map(Number);
    for (let i = 0; i < 3; i++) { if (ap[i] !== bp[i]) return ap[i] - bp[i]; } return 0;
  });
  renderPanel();
  renderSidebar();
  saveState();
}

// ── Step 6 — Export ───────────────────────────────────────────────────────────
function renderStep6() {
  const gas     = state.generatedGAs;
  const sysList = Object.keys(state.systems).filter(k => state.systems[k]);
  const defName = (state.projectName || 'KNX_Project').replace(/\s+/g, '_') + '_GA';

  return `
  <div class="section-title">${t('step6_title')}</div>
  <div class="section-desc">${t('step6_desc')}</div>

  <div class="export-layout">
    <div>
      <div class="card mb-3">
        <div class="card-title mb-2">${t('project_summary')}</div>
        <div class="sb-info-row"><span>${state.lang === 'vi' ? 'Dự án' : 'Project'}</span><strong>${escHtml(state.projectName || '—')}</strong></div>
        <div class="sb-info-row"><span>${state.lang === 'vi' ? 'Cấu trúc' : 'Structure'}</span><strong>${state.structure === 'function' ? t('function_based') : t('building_based')}</strong></div>
        <div class="sb-info-row"><span>${t('total_gas')}</span><strong class="fw-bold text-teal">${gas.length}</strong></div>
        <div class="sb-info-row"><span>${t('main_groups')}</span><strong>${sysList.length}</strong></div>
        <div class="sb-info-row"><span>${t('floors')}</span><strong>${state.floors.length}</strong></div>
      </div>

      <div class="card mb-3">
        <div class="card-title mb-2">${t('export_format')}</div>
        <div class="format-selector">
          <div class="format-btn ${state.exportFormat === 'xml' ? 'active' : ''}" onclick="state.exportFormat='xml';renderPanel();refreshPreview()">XML</div>
          <div class="format-btn ${state.exportFormat === 'csv' ? 'active' : ''}" onclick="state.exportFormat='csv';renderPanel();refreshPreview()">CSV</div>
        </div>
        <div class="text-sm text-muted">
          ${state.exportFormat === 'xml' ? t('xml_desc') : t('csv_desc')}
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-title mb-2">${t('options')}</div>
        ${[['dpt', t('include_dpt')], ['desc', t('include_desc')]].map(([k, l]) => `
        <div class="toggle-row">
          <span class="toggle-label">${l}</span>
          <label class="toggle">
            <input type="checkbox" ${state.exportOpts[k] ? 'checked' : ''}
              onchange="state.exportOpts['${k}']=this.checked;refreshPreview()" />
            <span class="toggle-slider"></span>
          </label>
        </div>`).join('')}
      </div>

      <div class="card">
        <div class="card-title mb-2">${t('filename')}</div>
        <input class="input input-sm" id="filename-input" value="${escHtml(defName)}" />
        <div class="text-xs text-muted mt-1">.${state.exportFormat} ${state.lang === 'vi' ? 'sẽ được thêm vào' : 'will be appended'}</div>
        <div class="mt-3">
          ${state.exportFormat === 'csv'
            ? `<button class="btn btn-primary" onclick="callExportCSV()">${t('export_csv')}</button>`
            : `<button class="btn btn-primary" onclick="callExportXML()">${t('download_xml')}</button>`}
        </div>
      </div>
    </div>

    <div>
      <div class="preview-toolbar">
        <span class="preview-title">${state.exportFormat === 'csv'
          ? (state.lang === 'vi' ? 'Xem trước CSV' : 'CSV preview')
          : t('xml_preview')}</span>
        <button class="btn btn-secondary btn-sm" id="btn-copy-preview" onclick="copyPreview()">${t('copy_clipboard')}</button>
      </div>
      <div class="xml-preview" id="xml-preview-pane">
        <span style="color:var(--gray-500)">${gas.length === 0
          ? (state.lang === 'vi' ? 'Chưa có GA nào để hiển thị.' : 'No GAs to preview.')
          : (state.lang === 'vi' ? 'Đang tải...' : 'Loading preview…')
        }</span>
      </div>
    </div>
  </div>`;
}

function refreshPreview() {
  if (state.step !== 6) return;
  loadXmlPreview();
}

function loadXmlPreview() {
  const pane = document.getElementById('xml-preview-pane');
  if (!pane || !state.generatedGAs.length) return;
  try {
    if (state.exportFormat === 'csv') {
      const csv = buildCSV(state.generatedGAs, { floors: state.floors });
      state._xmlCache = csv;
      pane.innerHTML = highlightCsv(csv);
    } else {
      const xml = buildXML(state.generatedGAs, {
        projectName: state.projectName,
        floors:      state.floors,
        includeDpt:  state.exportOpts.dpt,
        includeDesc: state.exportOpts.desc
      });
      state._xmlCache = xml;
      pane.innerHTML = syntaxHighlight(xml);
    }
  } catch (e) {
    if (pane) pane.innerHTML = `<span style="color:#f87171">${escHtml(e.message)}</span>`;
  }
}

function syntaxHighlight(xml) {
  const highlighted = escHtml(xml)
    .replace(/(&lt;\/?[\w:-]+)/g,  '<span class="tag">$1</span>')
    .replace(/([\w-]+=)/g,         '<span class="attr">$1</span>')
    .replace(/="([^"]*)"/g,        '="<span class="val">$1</span>"')
    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="cmt">$1</span>');
  return highlighted.split('\n').map(l => `<span class="ln">${l}</span>`).join('\n');
}

function highlightCsv(csv) {
  return csv.split('\n').map((line, i) => {
    const escaped = escHtml(line);
    const content = i === 0
      ? `<span class="csv-header">${escaped}</span>`
      : escaped.replace(/^([^,]+)/,  '<span class="tag">$1</span>');
    return `<span class="ln">${content}</span>`;
  }).join('\n');
}

function copyPreview() {
  const content = state._xmlCache || '';
  if (!content) return;
  navigator.clipboard && navigator.clipboard.writeText(content).then(() => {
    const btn = document.getElementById('btn-copy-preview');
    if (btn) { const orig = btn.textContent; btn.textContent = t('copied'); setTimeout(() => btn.textContent = orig, 1800); }
  });
}

// ── Collapse / Expand all (Step 5) ────────────────────────────────────────────
function collapseAll() {
  document.querySelectorAll('[id^="gfloor-"],[id^="groom-"],[id^="gmain-"],[id^="gmid-"]').forEach(el => {
    el.style.display = 'none';
    const arr = document.getElementById('arr-' + el.id);
    if (arr) arr.textContent = '▶';
  });
}

function expandAll() {
  document.querySelectorAll('[id^="gfloor-"],[id^="groom-"],[id^="gmain-"],[id^="gmid-"]').forEach(el => {
    el.style.display = '';
    const arr = document.getElementById('arr-' + el.id);
    if (arr) arr.textContent = '▼';
  });
}

// ── Drag-to-reorder floors (Step 3) ──────────────────────────────────────────
function floorDragStart(e, fi) {
  _dragFloorIdx = fi;
  e.dataTransfer.effectAllowed = 'move';
  setTimeout(() => {
    const el = document.getElementById('fcard-' + fi);
    if (el) el.classList.add('dragging');
  }, 0);
}

function floorDragOver(e, fi) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (_dragFloorIdx === null || _dragFloorIdx === fi) return;
  document.querySelectorAll('.floor-card, .tree-floor-node').forEach((el, i) => {
    el.classList.toggle('drag-over', i === fi);
  });
}

function floorDrop(e, fi) {
  e.preventDefault();
  if (_dragFloorIdx === null || _dragFloorIdx === fi) { _dragFloorIdx = null; return; }
  const moved = state.floors.splice(_dragFloorIdx, 1)[0];
  state.floors.splice(fi, 0, moved);
  _dragFloorIdx = null;
  renderPanel();
  renderSidebar();
  saveState();
}

function floorDragEnd() {
  _dragFloorIdx = null;
  document.querySelectorAll('.floor-card, .tree-floor-node').forEach(el => {
    el.classList.remove('drag-over', 'dragging');
  });
}
