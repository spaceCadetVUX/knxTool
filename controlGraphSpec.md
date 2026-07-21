# KNX Control Graph — Spec

> Nhánh tính năng mới: graph trực quan hoá logic điều khiển KNX — nút bấm (press mode) → cảnh/logic → thiết bị/GA.
> Tích hợp lên KNX GA Planner hiện có, tái sử dụng `state.generatedGAs` làm nguồn output, không nhân bản dữ liệu.

---

## 1. Mục tiêu

- Sub-view theo hệ thống: Lighting / Shade / HVAC (và các hệ khác đã chọn ở wizard).
- Với mỗi nút bấm vật lý: định nghĩa 3 chế độ nhấn (`short` / `long` / `double`), mỗi chế độ trỏ tới **1 Scene** hoặc **1 GA** cụ thể.
- Cho phép: tạo cảnh (scene), đổi tên, xem thông tin chi tiết logic / thiết bị / chế độ nhấn của từng node trên graph.
- Không phá vỡ luồng wizard 6 bước hiện tại — đây là 1 view độc lập, đọc dữ liệu đã sinh ra từ Step 5.

---

## 2. Vị trí trong ứng dụng

Tab riêng, song song với wizard — không phải step thứ 7.

```
state.view = 'wizard' | 'graph'     // route chính trong renderAll()
```

- Nút chuyển view đặt cạnh `btn-lang` trong `#header`.
- Tab **Graph** chỉ active khi `state.generatedGAs.length > 0` — graph cần pool GA/thiết bị đã sinh ra từ wizard làm output. Nếu chưa có GA nào, disable tab + tooltip nhắc chạy wizard trước.

---

## 3. Cấu trúc file (mở rộng CLAUDE.md)

Thêm 2 file mới, giữ nguyên triết lý tách pure-logic / render của project:

```
assets/graph-data.js   — pure data + logic, không đọc DOM. Tương đương vai trò engine.js.
assets/graph.js        — render + interaction cho graph view. Tương đương vai trò render.js.
```

Load order (thêm cuối, sau app.js):

```html
<script src="assets/engine.js"></script>
<script src="assets/state.js"></script>
<script src="assets/i18n.js"></script>
<script src="assets/render.js"></script>
<script src="assets/app.js"></script>
<script src="assets/graph-data.js"></script>
<script src="assets/graph.js"></script>
```

**Cập nhật CLAUDE.md — mục "Scope":** đổi "Không tạo file JS ngoài 5 file đã định" → "Không tạo file JS ngoài 7 file đã định (5 file gốc + `graph-data.js` + `graph.js`)".

### 3.1 graph-data.js — quy tắc

- Pure functions + data, không đọc `state`, không đọc DOM (giống engine.js).
- Nhận input là object tường minh, trả về object tường minh — không side-effect.
- Hàm chính:
  - `buildControlGraph({ inputDevices, scenes, generatedGAs, systemFilter })` → `{ nodes, edges }`
  - `validateDoublePress(device, channelId)` → cảnh báo nếu `model` không nằm trong danh sách hỗ trợ double-click
  - `resolveTarget(action, scenes, generatedGAs)` → trả về node đích thực (Scene object hoặc GA object) từ `targetId`

### 3.2 graph.js — quy tắc

- Toàn bộ render functions: `renderGraphView`, `renderGraphColumn`, `renderGraphEdges`, `renderNodeDetailPanel`.
- CRUD trên `state.inputDevices` / `state.scenes`: `addInputDevice`, `addChannel`, `setChannelAction`, `createScene`, `renameScene`, `addSceneEffect`, `removeSceneEffect`.
- Không chứa data KNX cứng (main group, DPT...) — chỉ gọi vào `graph-data.js`/`engine.js`.
- Được gọi `escHtml`, `showToast` (app.js), `t()` (i18n.js) — chấp nhận được vì script load xong hết trước khi event kích hoạt (đúng quy ước hiện tại).

---

## 4. Data model

### 4.1 State bổ sung (state.js)

```js
state.inputDevices = [];   // xem 4.2
state.scenes       = [];   // xem 4.3
state.graphView    = 'lt'; // sub-view đang chọn: lt | sht | hvac | ... (theo sysInfo key)
```

Thêm vào `PERSIST_FIELDS`: `'inputDevices', 'scenes', 'graphView'`.

### 4.2 Input device (nút bấm vật lý)

```js
{
  id:      'idev_1',
  name:    'Công tắc phòng khách - cạnh cửa',
  room:    'Living room',        // phải khớp room string trong state.floors[fi].rooms
  floorId: 'f2',
  model:   'MDT-BE-GTx2.1',      // optional — dùng để validate double-press
  channels: [{
    id:   'ch_1',
    name: 'Rocker 1 - Up',
    actions: {
      short:  { type: 'ga',    targetAddr: '1/0/4',  value: '1' },
      long:   { type: 'ga',    targetAddr: '1/2/4',  value: 'up' },
      double: { type: 'scene', targetId:   'scn_1',  supported: false }
    }
  }]
}
```

Field bắt buộc theo type:

| type | field bắt buộc | ghi chú |
|---|---|---|
| `ga` | `targetAddr`, `value` | `targetAddr` phải tồn tại trong `state.generatedGAs` — validate khi save, không cho trỏ tới GA không có thật |
| `scene` | `targetId` | trỏ tới `state.scenes[].id` |

**`double.supported` bắt buộc có mặt khi action type ở press-mode `double` được set** (không phải optional). Lý do kỹ thuật (xem mục 6) — UI phải hiện cảnh báo rõ ràng nếu `false`, không được âm thầm cho qua.

### 4.3 Scene

```js
{
  id:     'scn_1',
  name:   'Buổi tối - Phòng khách',
  system: 'lt',                 // để lọc theo sub-view — 1 scene chính thuộc 1 hệ, nhưng effects có thể cross-system
  effects: [
    { gaAddr: '1/3/4',  value: '30',  label: 'LT - LivingRoom - Ceiling - VAL' },
    { gaAddr: '3/2/3',  value: '128', label: 'SHT - LivingRoom - Left - POS' }
  ]
}
```

`effects[].gaAddr` phải resolve được trong `state.generatedGAs` — dùng để hiển thị `label` tự động (không cần user gõ tay), tương tự cách `buildXML`/`buildCSV` tra `mainName`/`midName` hiện tại.

---

## 5. Data flow — graph 4 tầng (MVP, không composite logic)

```
Tier 0                Tier 1                      Tier 2                  Tier 3
Input Device    →     Channel × Press-mode   →    Target             →   Output
(nút bấm vật lý)       (short/long/double)         (Scene | GA thẳng)     (GA / thiết bị thật)

VD:
[Công tắc PK]  →  [Rocker1-Up · short]  →  [1/0/4 SW]                →  (GA thật, không cần Tier 2 nếu type=ga)
               →  [Rocker1-Up · double] →  [Scene: Buổi tối - PK]    →  [1/3/4 VAL=30] + [3/2/3 POS=128]
```

- `type: 'ga'` → edge đi thẳng Tier 1 → Tier 3, bỏ qua Tier 2.
- `type: 'scene'` → edge Tier 1 → Tier 2 (Scene node), rồi Scene node fan-out ra nhiều Tier 3 (mỗi effect 1 edge).

`buildControlGraph()` trả về:

```js
{
  nodes: [{ id, tier, kind: 'input'|'channel'|'scene'|'ga', label, meta }],
  edges: [{ from, to, pressMode }]   // pressMode chỉ có ở edge Tier1→Tier2/3
}
```

---

## 6. Domain constraint — double-press

Short/long press là hành vi chuẩn ở tầng bus KNX (long = telegram tại thời điểm nhấn giữ + lặp chu kỳ cho dimming/shutter). **Double-press không phải hành vi chuẩn bus** — chỉ tồn tại nếu thiết bị có tham số "Double click"/"Doppelklick" trong ETS product database (VD: MDT Glass Push Button II, Jung F50 hỗ trợ; đa số binary input module phổ thông KHÔNG hỗ trợ).

Yêu cầu UI:
- Khi user set action cho `double` mà `device.model` không có trong danh sách known-supported (`graph-data.js` maintain 1 whitelist model), hiện badge cảnh báo màu vàng trên node: *"Model chưa xác nhận hỗ trợ double-click — kiểm tra tham số ETS trước khi thi công."*
- `validateDoublePress()` không block save (vì model có thể chưa có trong whitelist do model mới), chỉ cảnh báo.

---

## 7. Render — zero-dependency (không thêm lib/CDN)

- Node: `<div>` absolute-position theo cột (1 cột = 1 tier), giống pattern `room-tag`/`floor-card` đã có trong render.js.
- Edge: SVG `<path>` cubic bezier, toạ độ tính từ `getBoundingClientRect()` của 2 node — kỹ thuật giống n8n/Node-RED.
- Sub-view: filter node/edge theo `sysInfo[sk].main` trước khi build graph — tái dùng nguyên `sysInfo` từ engine.js, không định nghĩa lại.
- Click node → panel chi tiết bên phải, tái dùng đúng cấu trúc `ga-detail-pane`/`showGaDetail()` (render.js:339).
- Đổi tên inline (dblclick) → tái dùng đúng pattern `startRenameRoomChip` (render.js:476).
- Tạo scene mới → modal, tái dùng đúng cấu trúc `import-modal` + `addManualGA()` (render.js:1063) làm khuôn mẫu form.

### 7.1 Đồng bộ với giao diện hiện tại (bắt buộc)

Bản mockup preview (artifact HTML) dùng hệ token màu/font riêng — **chỉ để demo bố cục**. Khi implement thật, `graph.js` phải dùng thẳng class/token đã có trong `assets/styles.css`, **không định nghĩa lại hệ màu/font, không tạo file CSS mới** (đúng rule "Không tạo file CSS mới — dùng assets/styles.css" trong CLAUDE.md, áp dụng cho cả tính năng graph).

Mapping tái sử dụng — không viết lại thành phần đã có:

| Thành phần trong mockup | Class/pattern thật cần dùng | Vị trí tham chiếu |
|---|---|---|
| Topbar / nút chuyển view | `#header`, `.header-brand`, `.header-sep` | index.html:60-73 |
| Sub-nav hệ thống (system tabs) | `.sys-card` / `.systems-grid` | render.js renderStep2 |
| Node card (device / channel / scene / GA) | `.room-tag`, `.floor-card`, `.ga-set-row` | render.js renderFloorCard / showGaDetail |
| Inspector panel bên phải | `.ga-set-preview`, `.ga-set-empty`, `#ga-detail-pane` | render.js:322–356 |
| Composer slide-over (tạo cảnh) | `.modal-overlay`, `.modal`, `.modal-header`, `.modal-footer` | index.html #import-modal |
| Nút bấm | `.btn`, `.btn-primary`, `.btn-ghost` | styles.css |
| Badge cảnh báo double-press | class mới `.badge-warn` — bổ sung theo đúng convention `.badge-teal` đã có, không hardcode hex rời rạc | — |
| Font địa chỉ GA | `var(--font-mono)` | styles.css:31 |
| Toast báo lỗi/thành công | `showToast()` có sẵn | app.js |

Bổ sung vào việc cần làm (mục 10):
- Thêm class mới cần cho graph (`.badge-warn`, `.graph-col`, `.node-graph`, `.edges-layer`...) vào **cuối `assets/styles.css`**, dùng đúng token `--teal-*`/`--gray-*` đã khai báo ở `:root`. Nếu cần màu cảnh báo (amber) cho double-press chưa xác nhận, khai báo thêm 1–2 token kiểu `--amber-500`/`--amber-700` theo cùng convention với `--teal-500` hiện có — không hardcode hex rải rác trong CSS.
- **Bỏ phần dark theme khỏi bản implement thật** — app hiện tại chỉ có lang toggle (VI/EN), không có dark mode. Bản mockup preview có dark theme chỉ vì nền tảng Artifact yêu cầu hỗ trợ theme của trình duyệt, không áp dụng cho app thật. Graph view giữ nguyên 1 theme sáng như toàn bộ app hiện tại.
- Icon dùng lại kiểu SVG inline stroke-based đã có (`sysIconSvg` trong render.js) thay vì emoji (mockup dùng 🎬 chỉ để demo nhanh).

---

## 8. UI — panel chi tiết theo loại node

| Node type | Nội dung panel |
|---|---|
| Input Device | name, room, floor, model, danh sách channel + action mỗi press-mode, nút "+ Channel" |
| Channel × Press-mode | press-mode, type (ga/scene), target hiện tại, dropdown đổi target, badge cảnh báo double-press nếu có |
| Scene | name (inline rename), system, danh sách effects (gaAddr — label — value), nút "+ Effect" (chọn từ `generatedGAs`), nút xoá effect |
| GA / Output | addr, name, dpt, mainName/midName — y hệt thông tin đã hiển thị ở Step 5 (`gaRow()`) |

---

## 9. Phase plan

- **Phase 1 (MVP — scope spec này):** input → 1 Scene hoặc 1 GA, không composite logic, không multi-condition.
- **Phase 2 (sau, không nằm trong bản này):** Logic node dạng AND/OR/gate giữa nhiều input trước khi ra output — mô hình sát ETS Logic module hơn nhưng phức tạp hơn nhiều để vẽ graph và validate. Không thiết kế trước cho phase này để tránh over-engineering ở MVP.

---

## 10. Việc cần làm khi implement

1. `state.js`: thêm `inputDevices`, `scenes`, `graphView` vào `state` + `PERSIST_FIELDS`.
2. `assets/graph-data.js`: `buildControlGraph`, `validateDoublePress`, `resolveTarget`, whitelist model hỗ trợ double-click.
3. `assets/graph.js`: `renderGraphView` + CRUD input device/scene + detail panel + rename inline.
4. `index.html`: thêm `<script src="assets/graph-data.js">` + `<script src="assets/graph.js">` sau `app.js`, thêm nút chuyển view trong header.
5. `render.js`: `renderAll()` route theo `state.view` (`wizard` giữ nguyên logic cũ, `graph` gọi `renderGraphView()`).
6. `CLAUDE.md`: cập nhật mục Scope + thêm 2 mục "Quy tắc từng file" cho `graph-data.js`/`graph.js`.
