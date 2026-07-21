'use strict';

// sysInfo — engine.js (main group → system key lookup)
// Pure functions + data only — không đọc state, không đọc DOM. Xem controlGraphSpec.md.

// ─── PRESS MODES ──────────────────────────────────────────────────────────────
const PRESS_MODES = ['short', 'long', 'double'];

// ─── DOUBLE-PRESS SUPPORT WHITELIST ───────────────────────────────────────────
// Model có tham số "Double click"/"Doppelklick" xác nhận trong ETS product database.
// Double-press KHÔNG phải hành vi chuẩn ở tầng bus KNX — xem controlGraphSpec.md §6.
const DOUBLE_PRESS_SUPPORTED_MODELS = [
  'MDT-BE-GT1.1', 'MDT-BE-GT2.1', 'MDT-BE-GT4.1', 'MDT-BE-GT1TS.1',
  'Jung-F50', 'Gira-G1'
];

function validateDoublePress(device, channelId) {
  const channel = (device.channels || []).find(c => c.id === channelId);
  const action = channel && channel.actions && channel.actions.double;
  if (!action) return { applicable: false, supported: null, message: null };

  const knownSupported = !!device.model && DOUBLE_PRESS_SUPPORTED_MODELS.includes(device.model);
  return {
    applicable: true,
    supported:  knownSupported,
    message:    knownSupported
      ? null
      : 'Model chưa xác nhận hỗ trợ double-click — kiểm tra tham số ETS trước khi thi công.'
  };
}

// ─── RESOLVE TARGET ───────────────────────────────────────────────────────────
// action: { type: 'ga'|'scene', targetAddr?, targetId?, value? }
function resolveTarget(action, scenes, generatedGAs) {
  if (!action) return null;
  if (action.type === 'scene') return (scenes || []).find(s => s.id === action.targetId) || null;
  if (action.type === 'ga')    return (generatedGAs || []).find(g => g.addr === action.targetAddr) || null;
  return null;
}

// ─── MAIN GROUP → SYSTEM KEY ──────────────────────────────────────────────────
function buildMainToSys() {
  const map = {};
  Object.entries(sysInfo).forEach(([sk, si]) => {
    map[si.main] = sk;
    if (si.mainFb) map[si.mainFb] = sk;
  });
  return map;
}

// ─── BUILD CONTROL GRAPH ──────────────────────────────────────────────────────
/**
 * @param {object} payload
 * @param {Array}  payload.inputDevices  - state.inputDevices (xem controlGraphSpec.md §4.2)
 * @param {Array}  payload.scenes        - state.scenes (xem controlGraphSpec.md §4.3)
 * @param {Array}  payload.generatedGAs  - state.generatedGAs (từ engine.js)
 * @param {string} [payload.systemFilter] - lọc theo sysInfo key (vd 'lt') — bỏ trống = không lọc
 * @returns {{nodes: Array, edges: Array}}
 */
function buildControlGraph({ inputDevices = [], scenes = [], generatedGAs = [], systemFilter = null } = {}) {
  const mainToSys = buildMainToSys();
  const gaByAddr = {};
  generatedGAs.forEach(g => { gaByAddr[g.addr] = g; });

  const nodes = [];
  const nodeIds = new Set();
  const edges = [];

  function addNode(node) {
    if (nodeIds.has(node.id)) return;
    nodeIds.add(node.id);
    nodes.push(node);
  }

  function gaNodeId(addr) { return `ga::${addr}`; }
  function sceneNodeId(id) { return `scene::${id}`; }

  function ensureGaNode(addr, fallbackLabel) {
    const id = gaNodeId(addr);
    if (!nodeIds.has(id)) {
      const ga = gaByAddr[addr];
      addNode({
        id, tier: 3, kind: 'ga',
        label:  ga ? ga.name : (fallbackLabel || addr),
        system: ga ? (mainToSys[ga.main] || null) : null,
        meta:   { addr, ga: ga || null }
      });
    }
    return id;
  }

  // Tier 2 — scenes + their effects (tier 3)
  scenes.forEach(scene => {
    const id = sceneNodeId(scene.id);
    addNode({ id, tier: 2, kind: 'scene', label: scene.name, system: scene.system || null, meta: scene });
    (scene.effects || []).forEach(eff => {
      const gid = ensureGaNode(eff.gaAddr, eff.label);
      edges.push({ from: id, to: gid, kind: 'effect', value: eff.value });
    });
  });

  // Tier 0/1 — input devices + channel×press-mode
  inputDevices.forEach(dev => {
    addNode({ id: dev.id, tier: 0, kind: 'input', label: dev.name, meta: dev });
    (dev.channels || []).forEach(ch => {
      let hasAnyMode = false;

      PRESS_MODES.forEach(mode => {
        const action = (ch.actions || {})[mode];
        if (!action) return;
        hasAnyMode = true;

        const chNodeId = `${dev.id}::${ch.id}::${mode}`;
        addNode({
          id: chNodeId, tier: 1, kind: 'channel',
          label: `${ch.name} · ${mode}`,
          meta:  { device: dev, channel: ch, mode, action }
        });
        edges.push({ from: dev.id, to: chNodeId, kind: 'structural' });

        if (action.type === 'scene') {
          edges.push({ from: chNodeId, to: sceneNodeId(action.targetId), kind: mode });
        } else if (action.type === 'ga') {
          const gid = ensureGaNode(action.targetAddr);
          edges.push({ from: chNodeId, to: gid, kind: mode, value: action.value });
        }
      });

      // Channel chưa gán action nào — vẫn cần 1 node hiển thị để user click vào
      // cấu hình (nếu không sẽ không có cách nào mở channel action editor).
      if (!hasAnyMode) {
        const chNodeId = `${dev.id}::${ch.id}::none`;
        addNode({
          id: chNodeId, tier: 1, kind: 'channel',
          label: `${ch.name} · —`,
          meta:  { device: dev, channel: ch, mode: null, action: null }
        });
        edges.push({ from: dev.id, to: chNodeId, kind: 'structural' });
      }
    });
  });

  if (!systemFilter) return { nodes, edges };
  return filterGraphBySystem(nodes, edges, systemFilter);
}

// ─── FILTER BY SYSTEM ─────────────────────────────────────────────────────────
// Giữ 1 scene nếu chính nó hoặc BẤT KỲ effect nào khớp systemFilter — khi giữ,
// hiện toàn bộ effect (kể cả khác hệ) để không mất ngữ cảnh cross-system.
function filterGraphBySystem(nodes, edges, systemFilter) {
  const outgoing = {};
  edges.forEach(e => { (outgoing[e.from] = outgoing[e.from] || []).push(e); });

  const keep = new Set();

  nodes.filter(n => n.tier === 3).forEach(n => { if (n.system === systemFilter) keep.add(n.id); });

  nodes.filter(n => n.tier === 2).forEach(n => {
    const ownMatch = n.system === systemFilter;
    const effectMatch = (outgoing[n.id] || []).some(e => keep.has(e.to));
    if (ownMatch || effectMatch) keep.add(n.id);
  });
  // scene giữ được kéo theo toàn bộ effect của nó (kể cả cross-system)
  nodes.filter(n => n.tier === 2 && keep.has(n.id))
    .forEach(n => (outgoing[n.id] || []).forEach(e => keep.add(e.to)));

  nodes.filter(n => n.tier === 1).forEach(n => {
    if ((outgoing[n.id] || []).some(e => keep.has(e.to))) keep.add(n.id);
  });
  nodes.filter(n => n.tier === 0).forEach(n => {
    if ((outgoing[n.id] || []).some(e => keep.has(e.to))) keep.add(n.id);
  });

  return {
    nodes: nodes.filter(n => keep.has(n.id)),
    edges: edges.filter(e => keep.has(e.from) && keep.has(e.to))
  };
}

// ─── SEED SAMPLE ──────────────────────────────────────────────────────────────
// Tự chứa (self-contained) — dùng khi state.inputDevices/scenes rỗng để graph có
// gì đó hiển thị trong Sprint 1. Ví dụ khớp controlGraphSpec.md §5.
// Sprint 2: bỏ auto-fallback này, thay bằng empty-state khi có CRUD thật.
function seedGraphSample() {
  const inputDevices = [
    {
      id: 'dev1', name: 'Công tắc PK - cạnh cửa', room: 'Living room', floorId: 'f2', model: 'MDT-BE-GT2.1',
      channels: [{
        id: 'ch1', name: 'Rocker 1 - Up',
        actions: {
          short:  { type: 'ga',    targetAddr: '1/0/4', value: '1'  },
          long:   { type: 'ga',    targetAddr: '1/2/4', value: 'up' },
          double: { type: 'scene', targetId:   'scn1' }
        }
      }]
    },
    {
      id: 'dev2', name: 'Công tắc PN Master', room: 'Master bedroom', floorId: 'f3', model: '',
      channels: [{
        id: 'ch1', name: 'Rocker 1',
        actions: {
          short:  { type: 'ga',    targetAddr: '1/0/10', value: '1' },
          double: { type: 'scene', targetId:   'scn2' }
        }
      }]
    }
  ];

  const scenes = [
    {
      id: 'scn1', name: 'Buổi tối - Phòng khách', system: 'lt',
      effects: [
        { gaAddr: '1/3/4', value: '30',  label: 'LT - LivingRoom - Ceiling - VAL' },
        { gaAddr: '3/2/3', value: '128', label: 'SHT - LivingRoom - Left - POS' }
      ]
    },
    {
      id: 'scn2', name: 'Sleep mode', system: 'lt',
      effects: [
        { gaAddr: '1/3/10', value: '5',   label: 'LT - MasterBed - Ceiling - VAL' },
        { gaAddr: '3/2/9',  value: '255', label: 'SHT - MasterBed - Left - POS' },
        { gaAddr: '4/1/2',  value: '24',  label: 'HVAC - MasterBed - SETP' }
      ]
    }
  ];

  const generatedGAs = [
    { addr: '1/0/4',  name: 'LT - LivingRoom - Ceiling - SW',  dpt: 'DPST-1-001', type: 'ctrl', main: 1, mid: 0, mainName: 'Lighting' },
    { addr: '1/2/4',  name: 'LT - LivingRoom - Ceiling - DIM', dpt: 'DPST-3-007', type: 'ctrl', main: 1, mid: 2, mainName: 'Lighting' },
    { addr: '1/3/4',  name: 'LT - LivingRoom - Ceiling - VAL', dpt: 'DPST-5-001', type: 'ctrl', main: 1, mid: 3, mainName: 'Lighting' },
    { addr: '3/2/3',  name: 'SHT - LivingRoom - Left - POS',   dpt: 'DPST-5-001', type: 'ctrl', main: 3, mid: 2, mainName: 'Shutter'  },
    { addr: '1/0/10', name: 'LT - MasterBed - Ceiling - SW',   dpt: 'DPST-1-001', type: 'ctrl', main: 1, mid: 0, mainName: 'Lighting' },
    { addr: '1/3/10', name: 'LT - MasterBed - Ceiling - VAL',  dpt: 'DPST-5-001', type: 'ctrl', main: 1, mid: 3, mainName: 'Lighting' },
    { addr: '3/2/9',  name: 'SHT - MasterBed - Left - POS',    dpt: 'DPST-5-001', type: 'ctrl', main: 3, mid: 2, mainName: 'Shutter'  },
    { addr: '4/1/2',  name: 'HVAC - MasterBed - SETP',         dpt: 'DPST-9-001', type: 'ctrl', main: 4, mid: 1, mainName: 'HVAC'     }
  ];

  return { inputDevices, scenes, generatedGAs };
}

if (typeof module !== 'undefined') module.exports = {
  PRESS_MODES,
  DOUBLE_PRESS_SUPPORTED_MODELS,
  validateDoublePress,
  resolveTarget,
  buildControlGraph,
  filterGraphBySystem,
  seedGraphSample
};
