'use strict';

// sysInfo                                                          — engine.js
// buildControlGraph, seedGraphSample, validateDoublePress          — graph-data.js
// state, debouncedSave                                              — state.js
// escHtml, showToast                                                — app.js (safe: DOM already loaded by render time)
//
// Render + interaction cho Control Graph view. Xem controlGraphSpec.md.
// Sprint 3 scope: Scene CRUD (composer modal tạo/sửa/xoá cảnh + effect).
// Chưa có: Input device/channel CRUD — xem sprintPlan.md Sprint 4.

let _graphEdges    = [];
let _graphNodeById  = {};
let _graphOutgoing  = {};
let _graphResizeObserver = null;

let _selectedNodeId = null;
let _showSeedDemo    = false; // bật khi user chủ động bấm "Xem ví dụ mẫu" — xem renderGraphView()

// Scene composer draft — xem sprintPlan.md Sprint 3
let _composerDraft = null;
let _composerMode  = 'create';

// Device composer + channel action editor draft — xem sprintPlan.md Sprint 4
let _deviceDraft = null;
let _deviceMode  = 'create';
let _channelActionDraft = null;

const GRAPH_COL_HEADS  = ['Thiết bị nhấn', 'Kênh · Chế độ nhấn', 'Đích tác động', 'GA / Thiết bị thực'];
const GRAPH_MODE_LABEL = { short: 'Short', long: 'Long', double: 'Double' };
const GRAPH_SYS_TABS   = ['lt', 'pres', 'sht', 'hvac', 'sec', 'scn', 'av', 'nrg', 'sys'];

// ── Entry point ────────────────────────────────────────────────────────────────
function renderGraphView() {
  const panel = document.getElementById('panel');
  if (!panel) return;

  // Không tự động hiện seed khi chưa có dữ liệu thật — dễ gây hiểu nhầm "GA sinh ở
  // Wizard không lên Graph" (thực ra GA vẫn còn nguyên trong state.generatedGAs, chỉ
  // là chưa có device/scene nào trỏ tới nó nên graph rỗng). Chỉ hiện seed khi user
  // chủ động bấm "Xem ví dụ mẫu" (_showSeedDemo), luôn kèm banner cảnh báo đây là demo.
  const hasReal = state.inputDevices.length > 0 || state.scenes.length > 0;
  if (!hasReal && !_showSeedDemo) {
    panel.innerHTML = renderGraphEmptyState();
    return;
  }

  const useSeed = !hasReal; // tới đây mà !hasReal thì chắc chắn _showSeedDemo === true
  const source = useSeed
    ? seedGraphSample()
    : { inputDevices: state.inputDevices, scenes: state.scenes, generatedGAs: state.generatedGAs };

  const systemFilter = (state.graphView && state.graphView !== 'all') ? state.graphView : null;
  const graph = buildControlGraph(Object.assign({}, source, { systemFilter }));
  _graphEdges = graph.edges;

  _graphNodeById = {};
  graph.nodes.forEach(n => { _graphNodeById[n.id] = n; });
  _graphOutgoing = {};
  graph.edges.forEach(e => { (_graphOutgoing[e.from] = _graphOutgoing[e.from] || []).push(e); });
  const ctx = { nodeById: _graphNodeById, outgoing: _graphOutgoing };

  const byTier = [0, 1, 2, 3].map(t => graph.nodes.filter(n => n.tier === t));

  const columnsHtml = byTier.map((list, i) => `
    <section class="graph-col">
      <div class="graph-col-head">${GRAPH_COL_HEADS[i]}</div>
      <div class="graph-col-body">${
        list.length ? list.map(n => renderGraphNode(n, ctx)).join('') : '<div class="n-sub" style="padding:8px 0">—</div>'
      }</div>
    </section>`).join('');

  const vi = state.lang === 'vi';
  const demoBannerHtml = useSeed
    ? `<div class="graph-demo-banner">
        <span>${vi ? '🕸️ Đang xem dữ liệu ví dụ (demo) — chưa phải dữ liệu thật của bạn.' : '🕸️ Viewing sample demo data — not your real data yet.'}</span>
        <button onclick="hideSeedDemo()">${vi ? 'Thoát' : 'Exit'}</button>
      </div>`
    : '';

  panel.innerHTML = `
    <div class="graph-view-root" onclick="handleGraphCanvasClick(event)">
      ${renderGraphSubnav()}
      ${renderGraphLegend()}
      ${demoBannerHtml}
      <div class="graph-workspace">
        <div class="graph-canvas">
          <div class="graph-inner" id="graphInner">
            <svg class="edges-layer" id="edgesLayer"></svg>
            <div class="graph-columns">${columnsHtml}</div>
          </div>
        </div>
        <aside class="graph-inspector" id="graphInspector">${renderInspectorEmpty()}</aside>
      </div>
    </div>`;

  const inner = document.getElementById('graphInner');
  if (inner) {
    if (_graphResizeObserver) _graphResizeObserver.disconnect();
    _graphResizeObserver = new ResizeObserver(drawGraphEdges);
    _graphResizeObserver.observe(inner);
  }
  requestAnimationFrame(drawGraphEdges);
}

function renderGraphEmptyState() {
  const vi = state.lang === 'vi';
  return `<div class="floors-empty">
    <div class="floors-empty-icon">🕸️</div>
    <p>${vi
      ? 'Chưa có thiết bị nhấn hay cảnh nào. Tạo cái đầu tiên để bắt đầu, hoặc xem ví dụ mẫu để hình dung cách hoạt động.'
      : 'No input device or scene yet. Create your first one to get started, or view a sample example.'}</p>
    <div class="graph-empty-actions">
      <button class="btn btn-primary" onclick="openDeviceComposer()">+ ${vi ? 'Thiết bị đầu tiên' : 'First device'}</button>
      <button class="btn btn-primary" onclick="openSceneComposer()">+ ${vi ? 'Cảnh đầu tiên' : 'First scene'}</button>
      <button class="btn btn-ghost" onclick="showSeedDemo()">${vi ? 'Xem ví dụ mẫu' : 'View sample example'}</button>
    </div>
  </div>`;
}

function showSeedDemo() {
  _showSeedDemo = true;
  renderGraphView();
}

function hideSeedDemo() {
  _showSeedDemo = false;
  renderGraphView();
}

// ── Sub-nav (system filter) ─────────────────────────────────────────────────────
function renderGraphSubnav() {
  const current = state.graphView || 'all';
  const tabs = [{ key: 'all', label: state.lang === 'vi' ? 'Tất cả' : 'All' }]
    .concat(GRAPH_SYS_TABS.filter(sk => sysInfo[sk]).map(sk => ({
      key: sk, label: sysInfo[sk]['name_' + state.lang] || sysInfo[sk].name_en
    })));
  const vi = state.lang === 'vi';
  return `<div class="graph-subnav">
    ${tabs.map(t => `<button class="graph-tab ${current === t.key ? 'active' : ''}" onclick="setGraphSystemFilter('${t.key}')">${escHtml(t.label)}</button>`).join('')}
    <button class="btn btn-ghost btn-sm" style="margin-left:auto" onclick="openDeviceComposer()">+ ${vi ? 'Thiết bị mới' : 'New device'}</button>
    <button class="btn btn-primary btn-sm" onclick="openSceneComposer()">+ ${vi ? 'Cảnh mới' : 'New scene'}</button>
  </div>`;
}

function setGraphSystemFilter(key) {
  state.graphView = key;
  debouncedSave();
  renderGraphView();
}

// ── Legend — giải thích màu press-mode + kiểu đường nối ─────────────────────────
function renderGraphLegend() {
  const vi = state.lang === 'vi';
  return `<div class="graph-legend">
    <div class="graph-legend-item"><span class="graph-legend-swatch" style="background:var(--teal-600)"></span>Short press</div>
    <div class="graph-legend-item"><span class="graph-legend-swatch" style="background:var(--amber-500)"></span>Long / hold</div>
    <div class="graph-legend-item"><span class="graph-legend-swatch" style="background:#7c3aed"></span>Double press</div>
    <div class="graph-legend-item"><span class="graph-legend-swatch" style="background:repeating-linear-gradient(90deg,var(--gray-400) 0 3px,transparent 3px 6px)"></span>${vi ? 'Cảnh → hiệu ứng GA' : 'Scene → GA effect'}</div>
    <div class="graph-legend-item">${vi ? '💡 Bấm vào node để xem/sửa chi tiết' : '💡 Click a node to view/edit details'}</div>
  </div>`;
}

// ── Node rendering ──────────────────────────────────────────────────────────────
function renderGraphNode(node, ctx) {
  if (node.kind === 'input')   return renderInputNode(node);
  if (node.kind === 'channel') return renderChannelNode(node, ctx);
  if (node.kind === 'scene')   return renderSceneNode(node, ctx);
  if (node.kind === 'ga')      return renderGaNode(node);
  return '';
}

function renderInputNode(node) {
  const dev = node.meta;
  const sub = [dev.room, dev.model].filter(Boolean).join(' · ') || '—';
  const isReal = state.inputDevices.some(d => d.id === dev.id);
  const editBtn = isReal
    ? `<button class="node-edit-btn" type="button" title="Sửa" onclick="event.stopPropagation();openDeviceComposer('${dev.id}')">✎</button>`
    : '';
  return `<div class="node-graph n-input" id="${escHtml(node.id)}" onclick="selectGraphNode('${node.id}')">
    ${editBtn}
    <div class="n-title">${escHtml(dev.name)}</div>
    <div class="n-sub">${escHtml(sub)}</div>
  </div>`;
}

function renderChannelNode(node, ctx) {
  const { mode, device, channel } = node.meta;
  const vi = state.lang === 'vi';

  // Channel chưa gán action nào (xem graph-data.js buildControlGraph) — placeholder
  // mời bấm trực tiếp để cấu hình lần đầu (bấm là mở luôn form sửa, không cần vòng
  // qua inspector) — channel dạng này chỉ có thể là dữ liệu thật (seed luôn có đủ
  // action sẵn), nên không cần check isReal ở đây.
  if (!mode) {
    return `<div class="node-graph n-channel node-channel-empty" id="${escHtml(node.id)}"
      onclick="selectGraphNode('${node.id}');openChannelActionEditor('${node.id}')">
      <span class="nce-plus">+</span>
      <div>
        <div class="n-title">${escHtml(channel.name)}</div>
        <div class="n-sub">${vi ? 'Bấm để gán hành động' : 'Click to set up an action'}</div>
      </div>
    </div>`;
  }

  const edge = (ctx.outgoing[node.id] || [])[0];
  const target = edge ? ctx.nodeById[edge.to] : null;
  const targetLabel = target ? target.label : '—';
  const isReal = state.inputDevices.some(d => d.id === device.id);
  const editBtn = isReal
    ? `<button class="node-edit-btn" type="button" title="Sửa hành động" onclick="event.stopPropagation();openChannelActionEditor('${node.id}')">✎</button>`
    : '';

  let warnHtml = '';
  if (mode === 'double') {
    const v = validateDoublePress(device, channel.id);
    if (v.applicable && !v.supported) {
      warnHtml = `<div class="badge-warn">⚠ ${escHtml(v.message)}</div>`;
    }
  }

  return `<div class="node-graph n-channel" id="${escHtml(node.id)}" onclick="selectGraphNode('${node.id}')">
    ${editBtn}
    <span class="mode-pill ${mode}">${GRAPH_MODE_LABEL[mode] || mode}</span>
    <div class="n-sub" style="margin-top:6px">${escHtml(channel.name)}</div>
    <div class="n-sub">→ <strong>${escHtml(targetLabel)}</strong></div>
    ${warnHtml}
  </div>`;
}

function renderSceneNode(node, ctx) {
  const count = (ctx.outgoing[node.id] || []).length;
  const sysLabel = node.system ? `${escHtml(node.system)} · ` : '';
  const isReal = state.scenes.some(s => s.id === node.meta.id);
  const editBtn = isReal
    ? `<button class="node-edit-btn" type="button" title="Sửa" onclick="event.stopPropagation();openSceneComposer('${node.meta.id}')">✎</button>`
    : '';
  return `<div class="node-graph n-scene" id="${escHtml(node.id)}" onclick="selectGraphNode('${node.id}')">
    ${editBtn}
    <div class="n-title">🎬 ${escHtml(node.label)}</div>
    <div class="n-sub">${sysLabel}${count} hiệu ứng GA</div>
  </div>`;
}

function renderGaNode(node) {
  const ga = node.meta.ga;
  return `<div class="node-graph n-ga" id="${escHtml(node.id)}" onclick="selectGraphNode('${node.id}')">
    <div class="n-title">${escHtml(node.meta.addr)}</div>
    <div class="n-sub">${escHtml(ga ? ga.name : node.label)}</div>
  </div>`;
}

// ── Selection + inspector ────────────────────────────────────────────────────────
// Duyệt CÓ HƯỚNG, không phải BFS 2 chiều vô hướng: đi ngược lên đúng nguồn (ai trỏ
// tới node này) và đi xuôi xuống đúng đích (node này trỏ tới ai), lặp lại theo từng
// hướng riêng. Nhờ vậy click 1 channel không kéo theo các channel KHÁC cùng thiết bị
// (chúng chỉ chung node cha Device, không nằm trên đường đi xuôi/ngược của channel
// đang click) — trước đây BFS vô hướng đi ngược lên Device rồi tạt ngang sang node
// khác, gây sáng nhầm những node không thật sự liên quan tới lựa chọn.
function graphNeighbors(id) {
  const set = new Set([id]);

  let queue = [id];
  while (queue.length) {
    const cur = queue.shift();
    _graphEdges.forEach(e => {
      if (e.to === cur && !set.has(e.from)) { set.add(e.from); queue.push(e.from); }
    });
  }

  queue = [id];
  while (queue.length) {
    const cur = queue.shift();
    _graphEdges.forEach(e => {
      if (e.from === cur && !set.has(e.to)) { set.add(e.to); queue.push(e.to); }
    });
  }

  return set;
}

function selectGraphNode(id) {
  _selectedNodeId = id;
  const chain = graphNeighbors(id);

  document.querySelectorAll('.node-graph').forEach(el => {
    el.classList.toggle('selected', el.id === id);
    el.classList.toggle('dim', !chain.has(el.id));
  });
  document.querySelectorAll('.edges-layer path').forEach(p => {
    const touches = chain.has(p.getAttribute('data-from')) && chain.has(p.getAttribute('data-to'));
    p.classList.toggle('hi', touches);
    p.classList.toggle('dim', !touches);
  });

  renderInspectorContent(_graphNodeById[id]);
}

// Click vào vùng trống của canvas (không phải node) → bỏ chọn, về trạng thái mặc định.
function handleGraphCanvasClick(e) {
  if (e.target.closest('.node-graph')) return;
  deselectGraphNode();
}

function deselectGraphNode() {
  _selectedNodeId = null;
  document.querySelectorAll('.node-graph').forEach(el => el.classList.remove('selected', 'dim'));
  document.querySelectorAll('.edges-layer path').forEach(p => p.classList.remove('hi', 'dim'));
  renderInspectorContent(null);
}

function renderInspectorEmpty() {
  const vi = state.lang === 'vi';
  return `<div class="graph-inspector-empty">
    <div class="gi-empty-title">${vi ? 'Chưa chọn node' : 'No node selected'}</div>
    <p>${vi ? 'Click 1 node trên graph để xem chi tiết — thiết bị, chế độ nhấn, cảnh, hoặc GA đích.' : 'Click a node on the graph to see details — device, press mode, scene, or GA target.'}</p>
  </div>`;
}

function renderInspectorContent(node) {
  const insp = document.getElementById('graphInspector');
  if (!insp) return;
  if (!node) { insp.innerHTML = renderInspectorEmpty(); return; }

  if (node.kind === 'input')        insp.innerHTML = inspectorForInput(node);
  else if (node.kind === 'channel') insp.innerHTML = inspectorForChannel(node);
  else if (node.kind === 'scene')   insp.innerHTML = inspectorForScene(node);
  else if (node.kind === 'ga')      insp.innerHTML = inspectorForGa(node);
  else insp.innerHTML = renderInspectorEmpty();
}

function inspectorField(label, valueHtml) {
  return `<div class="gi-field"><div class="gi-label">${escHtml(label)}</div><div class="gi-value">${valueHtml}</div></div>`;
}

function inspectorForInput(node) {
  const dev = node.meta;
  const vi = state.lang === 'vi';
  const floor = (state.floors.find(f => f.id === dev.floorId) || {}).name || dev.floorId || '—';
  // Device từ seed (chưa lưu vào state.inputDevices thật) không sửa/xoá được.
  const isReal = state.inputDevices.some(d => d.id === dev.id);
  return `<div class="gi-kicker">Input device</div>
    <div class="gi-title">${escHtml(dev.name)}</div>
    ${inspectorField('Room', escHtml(dev.room || '—'))}
    ${inspectorField('Floor', escHtml(floor))}
    ${inspectorField('Model', escHtml(dev.model || '—'))}
    ${inspectorField('Channels', String((dev.channels || []).length))}
    ${isReal ? `<div class="gi-scene-actions">
      <button class="btn btn-ghost btn-sm" onclick="openDeviceComposer('${dev.id}')">✎ ${vi ? 'Sửa' : 'Edit'}</button>
      <button class="btn btn-ghost btn-sm" style="color:#dc2626" onclick="deleteDevice('${dev.id}')">🗑 ${vi ? 'Xoá' : 'Delete'}</button>
    </div>` : ''}`;
}

function inspectorForChannel(node) {
  const { mode, action, device, channel } = node.meta;
  const vi = state.lang === 'vi';
  // Channel từ seed (device chưa lưu vào state.inputDevices thật) không sửa được.
  const isReal = state.inputDevices.some(d => d.id === device.id);
  const editBtnHtml = isReal
    ? `<div class="gi-scene-actions"><button class="btn btn-ghost btn-sm" onclick="openChannelActionEditor('${node.id}')">✎ ${vi ? 'Sửa hành động' : 'Edit actions'}</button></div>`
    : '';

  if (!mode) {
    return `<div class="gi-kicker">Channel</div>
      <div class="gi-title">${escHtml(channel.name)}</div>
      <div class="n-sub" style="margin-top:10px">${vi ? 'Chưa gán hành động cho press-mode nào.' : 'No press-mode action configured yet.'}</div>
      ${editBtnHtml}`;
  }

  const edge = (_graphOutgoing[node.id] || [])[0];
  const target = edge ? _graphNodeById[edge.to] : null;

  let warnHtml = '';
  if (mode === 'double') {
    const v = validateDoublePress(device, channel.id);
    if (v.applicable) {
      warnHtml = v.supported
        ? `<div class="gi-ok">✓ Model xác nhận hỗ trợ double-click</div>`
        : `<div class="badge-warn" style="margin-top:10px;width:100%;box-sizing:border-box">⚠ ${escHtml(v.message)}</div>`;
    }
  }

  return `<div class="gi-kicker">Channel · ${GRAPH_MODE_LABEL[mode] || mode} press</div>
    <div class="gi-title">${escHtml(channel.name)}</div>
    ${inspectorField('Type', action.type === 'scene' ? 'scene' : 'ga (trực tiếp)')}
    ${inspectorField('Target', escHtml(target ? target.label : '—'))}
    ${action.value !== undefined ? inspectorField('Value', escHtml(String(action.value))) : ''}
    ${warnHtml}
    ${editBtnHtml}`;
}

function inspectorForScene(node) {
  const scene = node.meta;
  const vi = state.lang === 'vi';
  const effects = (scene.effects || []).map(eff => `
    <div class="gi-effect">
      <div><div class="gi-effect-addr">${escHtml(eff.gaAddr)}</div><div class="gi-effect-name">${escHtml(eff.label || '')}</div></div>
      <span class="gi-effect-val">${escHtml(String(eff.value))}</span>
    </div>`).join('');
  // Scene từ seed (chưa lưu vào state.scenes thật) không sửa/xoá được — chỉ scene thật mới có nút này.
  const isReal = state.scenes.some(s => s.id === scene.id);
  return `<div class="gi-kicker">Scene</div>
    <div class="gi-title">🎬 ${escHtml(scene.name)}</div>
    ${inspectorField('System', escHtml(scene.system || '—'))}
    <div class="gi-label" style="margin-top:14px">Effects (${(scene.effects || []).length})</div>
    <div class="gi-effects">${effects || '<div class="n-sub">—</div>'}</div>
    ${isReal ? `<div class="gi-scene-actions">
      <button class="btn btn-ghost btn-sm" onclick="openSceneComposer('${scene.id}')">✎ ${vi ? 'Sửa' : 'Edit'}</button>
      <button class="btn btn-ghost btn-sm" style="color:#dc2626" onclick="deleteScene('${scene.id}')">🗑 ${vi ? 'Xoá' : 'Delete'}</button>
    </div>` : ''}`;
}

function inspectorForGa(node) {
  const ga = node.meta.ga;
  return `<div class="gi-kicker">GA · Output</div>
    <div class="gi-title">${escHtml(node.meta.addr)}</div>
    ${inspectorField('Name', escHtml(ga ? ga.name : node.label))}
    ${ga && ga.dpt      ? inspectorField('DPT', escHtml(ga.dpt))           : ''}
    ${ga && ga.mainName ? inspectorField('Main group', escHtml(ga.mainName)) : ''}`;
}

// ── Modal helper (shared by Scene composer + Device composer) ──────────────────
// Modal không có trong index.html — tạo động 1 lần, append vào <body>.
function ensureModalDom(overlayId, innerId) {
  if (document.getElementById(overlayId)) return;
  const el = document.createElement('div');
  el.className = 'modal-overlay hidden';
  el.id = overlayId;
  el.innerHTML = `<div class="modal modal-lg" id="${innerId}"></div>`;
  document.body.appendChild(el);
}

// ── Scene composer (create/edit) ────────────────────────────────────────────────
// Xem sprintPlan.md Sprint 3: targetAddr chỉ chọn qua <select> liệt kê
// state.generatedGAs thật — không có ô nhập tay địa chỉ, nên không cần validate riêng.
function openSceneComposer(sceneId) {
  ensureModalDom('graph-composer-overlay', 'graph-composer-modal');
  const existing = sceneId ? state.scenes.find(s => s.id === sceneId) : null;
  if (existing) {
    _composerMode = 'edit';
    _composerDraft = {
      id: existing.id, name: existing.name, system: existing.system,
      effects: (existing.effects || []).map(e => Object.assign({}, e))
    };
  } else {
    _composerMode = 'create';
    _composerDraft = { id: null, name: '', system: 'lt', effects: [] };
  }
  renderComposerModal();
  document.getElementById('graph-composer-overlay').classList.remove('hidden');
}

function closeSceneComposer() {
  const el = document.getElementById('graph-composer-overlay');
  if (el) el.classList.add('hidden');
}

function renderComposerModal() {
  const vi = state.lang === 'vi';
  const d = _composerDraft;

  const systemOptions = Object.keys(sysInfo).map(sk =>
    `<option value="${sk}" ${d.system === sk ? 'selected' : ''}>${escHtml(sysInfo[sk]['name_' + state.lang] || sysInfo[sk].name_en)}</option>`
  ).join('');

  const addEffectHtml = state.generatedGAs.length
    ? `<button class="add-floor-btn" type="button" style="padding:8px" onclick="addComposerEffectRow()">+ ${vi ? 'Thêm hiệu ứng' : 'Add effect'}</button>`
    : `<div class="n-sub">${vi ? 'Chưa có GA nào — hoàn thành Wizard trước.' : 'No GAs yet — finish the Wizard first.'}</div>`;

  document.getElementById('graph-composer-modal').innerHTML = `
    <div class="modal-header">
      <span class="modal-title">${_composerMode === 'edit' ? (vi ? 'Sửa cảnh' : 'Edit scene') : (vi ? 'Cảnh mới' : 'New scene')}</span>
      <button class="modal-close" onclick="closeSceneComposer()">×</button>
    </div>
    <div class="field">
      <label class="field-label">${vi ? 'Tên cảnh' : 'Scene name'}</label>
      <input class="input" id="composer-name" value="${escHtml(d.name)}"
        oninput="_composerDraft.name=this.value" placeholder="${vi ? 'VD: Buổi tối - Phòng khách' : 'e.g. Evening - Living room'}" />
    </div>
    <div class="field">
      <label class="field-label">${vi ? 'Hệ thống' : 'System'}</label>
      <select class="input" onchange="_composerDraft.system=this.value">${systemOptions}</select>
    </div>
    <div class="field">
      <label class="field-label">${vi ? 'Hiệu ứng GA' : 'GA effects'} (${d.effects.length})</label>
      <div class="composer-effects" id="composer-effects">${renderComposerEffectRows()}</div>
      ${addEffectHtml}
    </div>
    <div class="modal-footer">
      ${_composerMode === 'edit' ? `<button class="btn btn-ghost" style="color:#dc2626;margin-right:auto" onclick="deleteScene('${d.id}')">${vi ? 'Xoá cảnh' : 'Delete scene'}</button>` : ''}
      <button class="btn btn-ghost" onclick="closeSceneComposer()">${vi ? 'Huỷ' : 'Cancel'}</button>
      <button class="btn btn-primary" onclick="saveSceneComposer()">${vi ? 'Lưu cảnh' : 'Save scene'}</button>
    </div>`;
}

function renderComposerEffectRows() {
  const vi = state.lang === 'vi';
  if (!_composerDraft.effects.length) {
    return `<div class="n-sub" style="padding:4px 0">${vi ? '— chưa có hiệu ứng —' : '— no effects yet —'}</div>`;
  }
  return _composerDraft.effects.map((eff, i) => `
    <div class="composer-effect-row">
      <select class="input input-sm" onchange="setComposerEffectAddr(${i}, this.value)">
        <option value="">— ${vi ? 'chọn GA' : 'choose GA'} —</option>
        ${state.generatedGAs.map(g => `<option value="${escHtml(g.addr)}" ${eff.gaAddr === g.addr ? 'selected' : ''}>${escHtml(g.addr)} — ${escHtml(g.name)}</option>`).join('')}
      </select>
      <input class="input input-sm" value="${escHtml(eff.value || '')}" placeholder="value"
        oninput="_composerDraft.effects[${i}].value=this.value" />
      <button class="room-tag-del" type="button" onclick="removeComposerEffectRow(${i})">✕</button>
    </div>`).join('');
}

function addComposerEffectRow() {
  _composerDraft.effects.push({ gaAddr: '', value: '', label: '' });
  renderComposerModal();
}

function removeComposerEffectRow(i) {
  _composerDraft.effects.splice(i, 1);
  renderComposerModal();
}

function setComposerEffectAddr(i, addr) {
  const ga = state.generatedGAs.find(g => g.addr === addr);
  _composerDraft.effects[i].gaAddr = addr;
  _composerDraft.effects[i].label  = ga ? ga.name : '';
}

function saveSceneComposer() {
  const vi = state.lang === 'vi';
  const nameInput = document.getElementById('composer-name');
  const name = (nameInput ? nameInput.value : _composerDraft.name).trim();
  if (!name) {
    showToast(vi ? 'Vui lòng nhập tên cảnh' : 'Please enter a scene name', true);
    return;
  }

  const effects = _composerDraft.effects.filter(e => e.gaAddr);
  const scene = {
    id: _composerDraft.id || ('scn_' + Date.now()),
    name, system: _composerDraft.system, effects
  };

  const idx = state.scenes.findIndex(s => s.id === scene.id);
  if (idx >= 0) state.scenes[idx] = scene; else state.scenes.push(scene);

  // Đồng bộ lại draft — tránh Save lần nữa (không qua openSceneComposer) tạo trùng scene mới
  // thay vì update, vì _composerDraft.id trước đó có thể vẫn là null (chế độ create).
  _composerDraft.id = scene.id;
  _composerMode = 'edit';

  debouncedSave();
  closeSceneComposer();
  renderGraphView();
  showToast(vi ? `Đã lưu cảnh "${scene.name}"` : `Scene "${scene.name}" saved`);
}

function deleteScene(id) {
  const vi = state.lang === 'vi';
  if (!confirm(vi ? 'Xoá cảnh này?' : 'Delete this scene?')) return;
  state.scenes = state.scenes.filter(s => s.id !== id);
  debouncedSave();
  closeSceneComposer();
  renderGraphView();
  showToast(vi ? 'Đã xoá cảnh' : 'Scene deleted');
}

// ── Device composer (create/edit) ───────────────────────────────────────────────
// Xem sprintPlan.md Sprint 4: room/floor là 2 select phụ thuộc nhau (chọn floor →
// nạp lại option room), model là text tự do (whitelist double-press chỉ là gợi ý).
function openDeviceComposer(deviceId) {
  ensureModalDom('graph-device-composer-overlay', 'graph-device-composer-modal');
  const existing = deviceId ? state.inputDevices.find(d => d.id === deviceId) : null;
  if (existing) {
    _deviceMode = 'edit';
    _deviceDraft = {
      id: existing.id, name: existing.name, room: existing.room, floorId: existing.floorId, model: existing.model || '',
      channels: (existing.channels || []).map(c => ({ id: c.id, name: c.name, actions: Object.assign({}, c.actions) }))
    };
  } else {
    _deviceMode = 'create';
    const firstFloor = state.floors[0];
    _deviceDraft = {
      id: null, name: '', room: firstFloor && firstFloor.rooms[0] || '', floorId: firstFloor ? firstFloor.id : '',
      model: '', channels: []
    };
  }
  renderDeviceComposerModal();
  document.getElementById('graph-device-composer-overlay').classList.remove('hidden');
}

function closeDeviceComposer() {
  const el = document.getElementById('graph-device-composer-overlay');
  if (el) el.classList.add('hidden');
}

function renderDeviceComposerModal() {
  const vi = state.lang === 'vi';
  const d = _deviceDraft;

  const floor = state.floors.find(f => f.id === d.floorId);
  const floorFieldHtml = state.floors.length
    ? `<div class="field">
        <label class="field-label">${vi ? 'Tầng' : 'Floor'}</label>
        <select class="input" onchange="setDeviceFloor(this.value)">
          ${state.floors.map(f => `<option value="${escHtml(f.id)}" ${d.floorId === f.id ? 'selected' : ''}>${escHtml(f.name)}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label class="field-label">${vi ? 'Phòng' : 'Room'}</label>
        <select class="input" onchange="_deviceDraft.room=this.value">
          ${(floor ? floor.rooms : []).map(r => `<option value="${escHtml(r)}" ${d.room === r ? 'selected' : ''}>${escHtml(r)}</option>`).join('')}
        </select>
      </div>`
    : `<div class="n-sub">${vi ? 'Chưa có tầng nào — hoàn thành Wizard trước.' : 'No floors yet — finish the Wizard first.'}</div>`;

  document.getElementById('graph-device-composer-modal').innerHTML = `
    <div class="modal-header">
      <span class="modal-title">${_deviceMode === 'edit' ? (vi ? 'Sửa thiết bị' : 'Edit device') : (vi ? 'Thiết bị mới' : 'New device')}</span>
      <button class="modal-close" onclick="closeDeviceComposer()">×</button>
    </div>
    <div class="field">
      <label class="field-label">${vi ? 'Tên thiết bị' : 'Device name'}</label>
      <input class="input" id="device-composer-name" value="${escHtml(d.name)}"
        oninput="_deviceDraft.name=this.value" placeholder="${vi ? 'VD: Công tắc phòng khách' : 'e.g. Living room switch'}" />
    </div>
    ${floorFieldHtml}
    <div class="field">
      <label class="field-label">Model</label>
      <input class="input" value="${escHtml(d.model)}" oninput="_deviceDraft.model=this.value" placeholder="VD: MDT-BE-GT2.1" />
    </div>
    <div class="field">
      <label class="field-label">Channels (${d.channels.length})</label>
      <div id="device-channels">${renderDeviceChannelRows()}</div>
      <button class="add-floor-btn" type="button" style="padding:8px" onclick="addDeviceChannel()">+ ${vi ? 'Thêm channel' : 'Add channel'}</button>
    </div>
    <div class="modal-footer">
      ${_deviceMode === 'edit' ? `<button class="btn btn-ghost" style="color:#dc2626;margin-right:auto" onclick="deleteDevice('${d.id}')">${vi ? 'Xoá thiết bị' : 'Delete device'}</button>` : ''}
      <button class="btn btn-ghost" onclick="closeDeviceComposer()">${vi ? 'Huỷ' : 'Cancel'}</button>
      <button class="btn btn-primary" onclick="saveDeviceComposer()">${vi ? 'Lưu thiết bị' : 'Save device'}</button>
    </div>`;
}

function setDeviceFloor(floorId) {
  _deviceDraft.floorId = floorId;
  const floor = state.floors.find(f => f.id === floorId);
  _deviceDraft.room = floor && floor.rooms.length ? floor.rooms[0] : '';
  renderDeviceComposerModal();
}

function renderDeviceChannelRows() {
  const vi = state.lang === 'vi';
  if (!_deviceDraft.channels.length) {
    return `<div class="n-sub" style="padding:4px 0">${vi ? '— chưa có channel —' : '— no channels yet —'}</div>`;
  }
  return _deviceDraft.channels.map((ch, i) => `
    <div class="channel-row">
      <input class="input input-sm" value="${escHtml(ch.name)}"
        oninput="_deviceDraft.channels[${i}].name=this.value" placeholder="${vi ? 'Tên channel' : 'Channel name'}" />
      <button class="room-tag-del" type="button" onclick="removeDeviceChannel(${i})">✕</button>
    </div>`).join('');
}

function addDeviceChannel() {
  _deviceDraft.channels.push({ id: 'ch_' + Date.now() + '_' + _deviceDraft.channels.length, name: '', actions: {} });
  renderDeviceComposerModal();
}

function removeDeviceChannel(i) {
  _deviceDraft.channels.splice(i, 1);
  renderDeviceComposerModal();
}

function saveDeviceComposer() {
  const vi = state.lang === 'vi';
  const nameInput = document.getElementById('device-composer-name');
  const name = (nameInput ? nameInput.value : _deviceDraft.name).trim();
  if (!name) {
    showToast(vi ? 'Vui lòng nhập tên thiết bị' : 'Please enter a device name', true);
    return;
  }

  const channels = _deviceDraft.channels.filter(c => c.name && c.name.trim());
  const device = {
    id: _deviceDraft.id || ('dev_' + Date.now()),
    name, room: _deviceDraft.room, floorId: _deviceDraft.floorId, model: _deviceDraft.model,
    channels
  };

  const idx = state.inputDevices.findIndex(d => d.id === device.id);
  if (idx >= 0) state.inputDevices[idx] = device; else state.inputDevices.push(device);

  // Đồng bộ lại draft — cùng lý do với saveSceneComposer() (xem Sprint 3).
  _deviceDraft.id = device.id;
  _deviceMode = 'edit';

  debouncedSave();
  closeDeviceComposer();
  renderGraphView();
  showToast(vi ? `Đã lưu thiết bị "${device.name}"` : `Device "${device.name}" saved`);
}

function deleteDevice(id) {
  const vi = state.lang === 'vi';
  if (!confirm(vi ? 'Xoá thiết bị này?' : 'Delete this device?')) return;
  state.inputDevices = state.inputDevices.filter(d => d.id !== id);
  debouncedSave();
  closeDeviceComposer();
  renderGraphView();
  showToast(vi ? 'Đã xoá thiết bị' : 'Device deleted');
}

// ── Channel action editor (inline trong inspector, không phải modal) ────────────
// Xem sprintPlan.md Sprint 4 — quyết định kiến trúc: sửa action ngay trong
// .graph-inspector thay vì mở modal thứ 3, vì channel đã có sẵn slot hiển thị.
function openChannelActionEditor(nodeId) {
  const node = _graphNodeById[nodeId];
  if (!node) return;
  const { device, channel } = node.meta;
  _channelActionDraft = {
    deviceId: device.id, channelId: channel.id,
    actions: {
      short:  Object.assign({ type: '' }, channel.actions.short  || {}),
      long:   Object.assign({ type: '' }, channel.actions.long   || {}),
      double: Object.assign({ type: '' }, channel.actions.double || {})
    }
  };
  renderChannelActionEditor();
}

function renderChannelActionEditor() {
  const insp = document.getElementById('graphInspector');
  if (!insp) return;
  const vi = state.lang === 'vi';
  const d = _channelActionDraft;
  const device  = state.inputDevices.find(dv => dv.id === d.deviceId);
  const channel = device ? (device.channels || []).find(c => c.id === d.channelId) : null;

  insp.innerHTML = `
    <div class="gi-kicker">${vi ? 'Sửa hành động' : 'Edit actions'}</div>
    <div class="gi-title">${escHtml(channel ? channel.name : '')}</div>
    <div style="margin-top:14px">${['short', 'long', 'double'].map(mode => renderActionModeRow(mode, d.actions[mode])).join('')}</div>
    <div class="gi-scene-actions">
      <button class="btn btn-ghost btn-sm" onclick="cancelChannelActionEditor()">${vi ? 'Huỷ' : 'Cancel'}</button>
      <button class="btn btn-primary btn-sm" onclick="saveChannelActions()">${vi ? 'Lưu' : 'Save'}</button>
    </div>`;
}

function renderActionModeRow(mode, action) {
  const vi = state.lang === 'vi';
  const type = action.type || '';

  let targetHtml = '';
  if (type === 'ga') {
    targetHtml = `<select class="input input-sm" onchange="setActionTarget('${mode}', this.value)">
      <option value="">— ${vi ? 'chọn GA' : 'choose GA'} —</option>
      ${state.generatedGAs.map(g => `<option value="${escHtml(g.addr)}" ${action.targetAddr === g.addr ? 'selected' : ''}>${escHtml(g.addr)} — ${escHtml(g.name)}</option>`).join('')}
    </select>`;
  } else if (type === 'scene') {
    targetHtml = `<select class="input input-sm" onchange="setActionTarget('${mode}', this.value)">
      <option value="">— ${vi ? 'chọn scene' : 'choose scene'} —</option>
      ${state.scenes.map(s => `<option value="${escHtml(s.id)}" ${action.targetId === s.id ? 'selected' : ''}>${escHtml(s.name)}</option>`).join('')}
    </select>`;
  }
  const valueHtml = type
    ? `<input class="input input-sm" value="${escHtml(action.value || '')}" placeholder="value" oninput="_channelActionDraft.actions['${mode}'].value=this.value" />`
    : '';

  return `<div class="action-mode-row">
    <div class="amr-head"><span class="mode-pill ${mode}">${GRAPH_MODE_LABEL[mode]}</span></div>
    <div class="amr-body">
      <select class="input input-sm" onchange="setActionType('${mode}', this.value)">
        <option value="">${vi ? 'Không dùng' : 'None'}</option>
        <option value="ga" ${type === 'ga' ? 'selected' : ''}>GA</option>
        <option value="scene" ${type === 'scene' ? 'selected' : ''}>Scene</option>
      </select>
      ${targetHtml}
      ${valueHtml}
    </div>
  </div>`;
}

function setActionType(mode, type) {
  const a = _channelActionDraft.actions[mode];
  a.type = type;
  if (type !== 'ga') delete a.targetAddr;
  if (type !== 'scene') delete a.targetId;
  renderChannelActionEditor();
}

function setActionTarget(mode, value) {
  const a = _channelActionDraft.actions[mode];
  if (a.type === 'ga') a.targetAddr = value;
  else if (a.type === 'scene') a.targetId = value;
}

function cancelChannelActionEditor() {
  _channelActionDraft = null;
  renderInspectorContent(_graphNodeById[_selectedNodeId] || null);
}

function saveChannelActions() {
  const vi = state.lang === 'vi';
  const d = _channelActionDraft;
  const device = state.inputDevices.find(dv => dv.id === d.deviceId);
  const channel = device ? (device.channels || []).find(c => c.id === d.channelId) : null;
  if (!device || !channel) { _channelActionDraft = null; return; }

  const cleanActions = {};
  ['short', 'long', 'double'].forEach(mode => {
    const a = d.actions[mode];
    if (!a.type) return;
    if (a.type === 'ga' && a.targetAddr)         cleanActions[mode] = { type: 'ga', targetAddr: a.targetAddr, value: a.value || '' };
    else if (a.type === 'scene' && a.targetId)   cleanActions[mode] = { type: 'scene', targetId: a.targetId };
  });
  channel.actions = cleanActions;

  debouncedSave();
  _channelActionDraft = null;
  renderGraphView();
  showToast(vi ? 'Đã lưu hành động' : 'Actions saved');
}

// ── Edge drawing (SVG bezier, positions measured after DOM layout) ─────────────
// Edge "nhảy cóc" (VD action type=ga bỏ qua tier Scene, xem graph-data.js) vẫn đi
// qua đúng vùng cột bị bỏ qua thay vì cắt chéo thẳng — xem buildEdgePath().
function drawGraphEdges() {
  const inner = document.getElementById('graphInner');
  const svg   = document.getElementById('edgesLayer');
  if (!inner || !svg) return;

  const w = inner.scrollWidth, h = inner.scrollHeight;
  svg.setAttribute('width', w);
  svg.setAttribute('height', h);
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.innerHTML = '';

  const wrap = inner.getBoundingClientRect();
  const colCenterX = [...document.querySelectorAll('.graph-col')].map(c => {
    const r = c.getBoundingClientRect();
    return (r.left + r.right) / 2 - wrap.left;
  });

  _graphEdges.forEach(e => {
    const fromEl = document.getElementById(e.from);
    const toEl   = document.getElementById(e.to);
    if (!fromEl || !toEl) return;

    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const x1 = a.right - wrap.left, y1 = a.top - wrap.top + a.height / 2;
    const x2 = b.left  - wrap.left, y2 = b.top  - wrap.top + b.height / 2;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', buildEdgePath(x1, y1, x2, y2, _graphNodeById[e.from], _graphNodeById[e.to], colCenterX));
    path.setAttribute('class', e.kind === 'structural' ? 'structural' : e.kind);
    path.setAttribute('data-from', e.from);
    path.setAttribute('data-to', e.to);
    svg.appendChild(path);
  });
}

function buildEdgePath(x1, y1, x2, y2, fromNode, toNode, colCenterX) {
  const gap = (fromNode && toNode) ? (toNode.tier - fromNode.tier) : 1;

  if (gap <= 1 || !colCenterX.length) {
    const mx = (x1 + x2) / 2;
    return `M ${x1},${y1} C ${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  }

  // Đi qua center-x của mỗi cột bị bỏ qua (nội suy y tuyến tính theo x) để đường
  // nối "xuyên suốt" đủ 4 cột dù không dừng lại ở node nào giữa đường.
  const points = [{ x: x1, y: y1 }];
  for (let t = fromNode.tier + 1; t < toNode.tier; t++) {
    const cx = colCenterX[t];
    if (cx === undefined) continue;
    const ratio = (cx - x1) / (x2 - x1 || 1);
    points.push({ x: cx, y: y1 + (y2 - y1) * ratio });
  }
  points.push({ x: x2, y: y2 });

  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i], p1 = points[i + 1];
    const mx = (p0.x + p1.x) / 2;
    d += ` C ${mx},${p0.y} ${mx},${p1.y} ${p1.x},${p1.y}`;
  }
  return d;
}
