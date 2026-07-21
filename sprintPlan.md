# Control Graph — Sprint Plan

> Theo dõi triển khai theo sprint. Spec đầy đủ nằm ở `controlGraphSpec.md` — file này chỉ chia nhỏ việc thành task để giao cho Claude từng phần, tránh 1 prompt ôm hết cả tính năng (dễ ra code thiếu sót, khó review).

**Nguyên tắc chia task:** mỗi task chỉ đụng 1 file (trừ khi 2 file đổi cùng lúc là bắt buộc), có input/output rõ ràng, review được trong 1 lượt đọc diff. Thứ tự task phải đảm bảo **ở mọi checkpoint, app vẫn chạy được** — không có task nào để lại script tag trỏ tới file chưa tồn tại hay gọi hàm chưa được định nghĩa.

---

## Sprint 1 — Mục tiêu

Dựng **khung xương đọc-only**: data model thật + graph hiển thị được bằng dữ liệu mẫu tự chứa (seed), tích hợp vào app thật. **Chưa làm CRUD/tương tác/inspector** — mục đích sprint 1 là xác nhận data model và cách render trước khi đầu tư vào form tạo/sửa.

### Definition of Done — Sprint 1

- [x] Vào app thật, bấm tab "Graph" ở header → thấy graph 4 tầng render từ dữ liệu seed, không lỗi console.
- [x] Toggle Wizard ↔ Graph không phá vỡ state hay luồng wizard hiện tại (stepbar ẩn khi ở Graph view, sidebar giữ nguyên không đổi).
- [x] Style dùng đúng token/class có sẵn trong `styles.css` (không CSS rời rạc, không hardcode hex ngoài token).
- [x] `validateDoublePress()` chạy đúng khi gọi tay qua console — **chưa cần** gắn vào UI.

**Kết quả QA (headless Chrome + CDP, `2026-07-21`):** graph render đúng 17 node (2 device + 5 channel-mode + 2 scene + 8 GA) / 15 edge — khớp chính xác dữ liệu seed. `#stepbar` ẩn đúng khi ở Graph view. 1 badge cảnh báo double-press hiện đúng 1 lần (dev2 — model chưa khai báo), dev1 (model MDT-BE-GT2.1, nằm trong whitelist) không có badge. Roundtrip Graph → Wizard: `state.view`, `#stepbar`, Step 1 UI và `generatedGAs` không bị ảnh hưởng. Không có console error ở cả 2 chiều.

### Ngoài phạm vi Sprint 1 (dồn sang Sprint 2)

- Click node → inspector panel động
- CRUD: tạo/sửa/xoá input device, scene, channel, effect
- Composer slide-over (form tạo cảnh)
- Sub-nav tabs theo hệ thống (Lighting/Shade/HVAC...) — **không dựng tab tĩnh trong Sprint 1** vì chưa có filter, tab không bấm được sẽ là dead UI gây hiểu lầm. Tab + filter thật đi chung 1 task ở Sprint 2.
- Badge cảnh báo double-press động trong UI (Sprint 1 chỉ có hàm, chưa hiển thị)
- Kéo-thả reposition node

---

## Quyết định kiến trúc cho Sprint 1 (chốt trước khi code)

1. **`#stepbar` ẩn khi `state.view === 'graph'`** — không có khái niệm step trong graph view.
2. **`#sidebar` giữ nguyên, không đổi** — `renderSidebar()` hiện tại không phụ thuộc step cụ thể (chỉ hiện project info/systems/GA count), không cần sửa gì cho Sprint 1. Không dựng inspector panel bên phải ở sprint này (vì chưa cần — xem mục Ngoài phạm vi).
3. **Graph render thẳng vào `#panel`** — tái dùng container có sẵn, không thêm DOM mới vào `index.html` ngoài script tag + nút chuyển view.
4. **Seed data phải tự chứa (self-contained)** — `seedGraphSample()` trả về `{ inputDevices, scenes, generatedGAs }` đầy đủ (kể cả `generatedGAs` giả), **không** phụ thuộc `state.generatedGAs` thật. Lý do: user có thể chưa chạy wizard, hoặc đã chạy nhưng địa chỉ GA thật không khớp ví dụ minh hoạ trong spec — nếu để `buildControlGraph()` tự ý trộn seed device với `state.generatedGAs` thật, dễ ra tham chiếu GA không tồn tại (`resolveTarget()` trả về rỗng, graph gãy).
   Rule hiển thị trong `renderGraphView()`: nếu `state.inputDevices.length === 0 && state.scenes.length === 0` → dùng nguyên bundle từ `seedGraphSample()`; ngược lại dùng dữ liệu thật.
5. **Nợ kỹ thuật cần ghi lại (không xử lý ở Sprint 1):** khi Sprint 2 có CRUD thật, fallback seed ở trên phải được thay bằng empty-state rõ ràng (kiểu `no_gas` ở Step 5) thay vì tiếp tục tự động hiện dữ liệu giả — nếu không, user mới sẽ tưởng nhầm đó là dữ liệu của họ.
6. **Seed data dùng đúng ví dụ đã có trong `controlGraphSpec.md` §5** (Công tắc PK - cạnh cửa / Công tắc PN Master, scene "Buổi tối - Phòng khách" / "Sleep mode", cùng địa chỉ GA đã liệt kê) — giữ nhất quán xuyên suốt spec → mockup → seed thật, không bịa ví dụ mới.

---

## Task breakdown

Thứ tự dưới đây **chính là thứ tự thực hiện** — sắp theo nguyên tắc "không để lại tham chiếu treo": phần data (T1–T3) và style (T4) làm trước và độc lập; phần render thật (T5) cần T2 xong; phần wiring vào app (T6) làm **sau cùng** vì nó là task duy nhất khiến người dùng có thể thật sự bấm vào tab Graph — lúc đó `graph.js`/`graph-data.js` phải đã tồn tại và chạy được, tránh 404 hoặc gọi hàm undefined ngay checkpoint đầu tiên.

| ID | Task | File đụng tới | Size | Phụ thuộc | Trạng thái |
|----|------|---------------|------|-----------|-----------|
| T1 | Thêm `state.view` (`'wizard'\|'graph'`), `state.inputDevices`, `state.scenes`, `state.graphView` vào `state` + `PERSIST_FIELDS` (+ reset trong `newProject()`) | `state.js` | S | — | ✅ Done |
| T2 | `buildControlGraph({inputDevices, scenes, generatedGAs, systemFilter})` → `{nodes, edges}` theo đúng 4-tier ở spec §5, + `seedGraphSample()` (self-contained, dùng ví dụ ở spec §5), + `validateDoublePress(device, channelId)` + whitelist model hỗ trợ double-click + `filterGraphBySystem()` | `graph-data.js` (mới) | M | — | ✅ Done |
| T3 | Token `--amber-50/500/700` (theo đúng convention `--teal-*` ở `:root`) + class `.graph-col`, `.node-graph`, `.edges-layer`, `.badge-warn`, `.mode-pill`. Thêm cuối file, không sửa rule cũ | `styles.css` | S | — | ✅ Done |
| T4a | `renderGraphView()` — render tĩnh 4 cột từ `buildControlGraph(seedGraphSample())`, dùng class ở T3. **Chưa vẽ edge**, chỉ layout cột + node card | `graph.js` (mới) | M | T2, T3 | ✅ Done |
| T4b | Vẽ edge SVG bezier nối node giữa các cột (đo `getBoundingClientRect` sau layout, `ResizeObserver` để redraw) | `graph.js` | M | T4a | ✅ Done |
| T5 | Nút chuyển view (Wizard/Graph) trong `#header`, `<script>` tag cho `graph-data.js`/`graph.js` (đặt sau `app.js`) | `index.html` | S | T2, T4b | ✅ Done |
| T6 | `renderAll()` route theo `state.view`: `'wizard'` giữ nguyên logic cũ; `'graph'` → ẩn `#stepbar`, giữ nguyên `#sidebar`, gọi `renderGraphView()` vào `#panel`. Thêm `setAppView()` | `render.js` | S | T5 | ✅ Done |
| T7 | QA: headless Chrome (CDP) — load app, bấm Graph, kiểm tra node/edge count, badge cảnh báo, roundtrip về Wizard, console error | — | S | T6 | ✅ Done |

**Lưu ý:** T5 phụ thuộc T2 **và** T4b (không phải T2 hay T6) — vì T5 là lúc thêm script tag thật vào `index.html`, phải chắc `graph-data.js`/`graph.js` đã có nội dung đầy đủ trước, nếu không app sẽ 404 ngay khi mở lại trong lúc dev.

### Sơ đồ phụ thuộc

```
T1 ─────────────┐
T2 ──► T4a ──► T4b ──► T5 ──► T6 ──► T7
T3 ──►  (dùng ở T4a) ─┘
```

`T1` không chặn nhánh `T2→T4a→T4b→T5→T6` — có thể làm `T1` bất kỳ lúc nào trước `T6` (vì `renderAll()` ở T6 mới thật sự đọc `state.view`). `T3` chỉ cần xong trước `T4a`.

Mỗi task là **1 lần giao việc riêng cho Claude** (1 prompt / 1 commit), review diff xong mới sang task kế — không gộp `T2`+`T4a`, hay `T4a`+`T4b` vào chung 1 lần dù cùng file `graph.js` (2 lượt review tách biệt cho file này vì đây là task nặng nhất trong sprint).

---

## Sprint 2 — Mục tiêu

Graph chuyển từ **đọc-only** sang **tương tác để xem**: click node → chi tiết, chuyển tab hệ thống → lọc thật. **Chưa làm authoring/CRUD** (tạo scene, đổi tên, thêm channel/effect) — lý do tách: rename/CRUD không test được có ý nghĩa khi chưa có composer để tạo dữ liệu thật (chỉ có seed), nên dồn nguyên cụm authoring sang Sprint 3 để làm 1 lần cho trọn vẹn.

### Definition of Done — Sprint 2

- [x] Bấm tab hệ thống (Lighting/Shade/HVAC...) → graph lọc đúng theo `filterGraphBySystem()` (đã có từ Sprint 1, chỉ cần wire).
- [x] Click 1 node bất kỳ (device/channel/scene/ga) → node đó + node liên quan trực tiếp highlight, node khác dim; panel bên phải hiện đúng chi tiết theo loại node (bảng mục 8 spec).
- [x] Không lỗi console, không phá luồng Wizard/Sprint 1.

**Kết quả QA (headless Chrome + CDP, `2026-07-21`):** tab "All" hiện đủ 17 node; tab "HVAC" lọc đúng còn 6 node (dev1 bị loại hoàn toàn vì không có output nào thuộc hvac, dev2 giữ lại kèm toàn bộ 3 effect cross-system của scn2 đúng theo rule "giữ scene thì hiện hết effect"). Click scene "Sleep mode": đúng 5 node giữ sáng (chính nó + channel trỏ tới + 3 GA effect), 12 node còn lại dim. Click channel double-press của dev2: inspector hiện đúng warn badge + target "Sleep mode". Click GA `1/3/4`: inspector hiện đủ 3 field (Name/DPT/Main group). Roundtrip Graph → Wizard không lỗi, `generatedGAs` không đổi, không console error xuyên suốt.

### Ngoài phạm vi Sprint 2 (dồn sang Sprint 3)

- Composer tạo/sửa scene, thêm input device/channel
- Rename inline (scene, device, channel)
- Thêm/xoá effect trong scene
- Validate `targetAddr` phải tồn tại trong `state.generatedGAs` thật
- Thay fallback seed bằng empty-state khi có CRUD thật

### Quyết định kiến trúc cho Sprint 2

- **Inspector panel không thêm DOM vào `index.html`** — dựng ngay trong HTML mà `renderGraphView()` bơm vào `#panel`: bọc `.graph-canvas` (cột + edge) và `<aside class="graph-inspector">` mới trong 1 `.graph-workspace` flex, y hệt cách Sprint 1 không đụng `index.html` ngoài phần đã có.
- **Sub-nav tabs nằm trong cùng khối HTML đó**, phía trên `.graph-columns` — không phải element mới trong header/sidebar.

### Task breakdown

| ID | Task | File đụng tới | Size | Phụ thuộc | Trạng thái |
|----|------|---------------|------|-----------|-----------|
| S2-T1 | Sub-nav tabs hệ thống (dựa trên `sysInfo` keys) trong `renderGraphView()`, click → set `state.graphView` + truyền `systemFilter: state.graphView` vào `buildControlGraph()` (logic filter đã có sẵn từ Sprint 1 — chỉ wire) | `graph.js` | S | — | ✅ Done |
| S2-T2 | CSS: `.graph-workspace`, `.graph-subnav`/`.graph-tab`, `.graph-inspector`, `.graph-inspector-empty`, `.node-graph.selected`/`.dim`, `.edges-layer path.dim`/`.hi` | `styles.css` | S | — | ✅ Done |
| S2-T3 | Restructure HTML trong `renderGraphView()`: bọc `.graph-canvas` hiện có + `<aside class="graph-inspector" id="graphInspector">` (empty-state ban đầu) trong `.graph-workspace` | `graph.js` | S | S2-T2 | ✅ Done |
| S2-T4 | Click handler trên `.node-graph`: track node đang chọn, highlight/dim node + edge liên quan (dùng `graph.edges` đã build), gọi hàm render nội dung inspector theo loại node (device/channel/scene/ga — read-only, chưa contenteditable) | `graph.js` | M | S2-T3 | ✅ Done |
| S2-T5 | QA: headless Chrome — click từng loại node, đổi tab hệ thống, kiểm tra dim/highlight/inspector content, console error, roundtrip Wizard | — | S | S2-T4 | ✅ Done |

### Sơ đồ phụ thuộc

```
S2-T2 ──► S2-T3 ──► S2-T4 ──► S2-T5
S2-T1 (độc lập, làm trước S2-T5 là được)
```

---

## Sprint 3 — Mục tiêu

**Chỉ Scene CRUD** — tạo/sửa/xoá cảnh + quản lý effect. **Không làm Input Device/Channel CRUD** trong sprint này — 2 cụm authoring này độc lập nhau về giá trị (1 scene tự nó có ý nghĩa: "cảnh này set GA nào = giá trị gì", không cần thiết bị trỏ tới mới demo được), gộp chung sẽ quá tải 1 lần giao việc. Device/Channel CRUD dồn sang Sprint 4 — lúc đó vừa hay có scene thật để device trỏ tới, hợp lý hơn làm ngược lại.

### Definition of Done — Sprint 3

- [x] Bấm "+ Cảnh mới" → modal mở, điền tên/hệ thống/effects (chọn GA từ `state.generatedGAs` thật — không gõ tay địa chỉ) → Lưu → scene xuất hiện trên graph ngay.
- [x] Click scene trên graph → inspector có nút "Sửa" (mở lại modal với dữ liệu cũ) và "Xoá" (confirm rồi xoá).
- [x] `targetAddr` không thể sai vì hiệu ứng chỉ chọn qua `<select>` liệt kê `state.generatedGAs` — không có ô nhập tay địa chỉ.
- [x] Khi `state.scenes.length > 0`, seed fallback tự động tắt; khi xoá hết scene thật, seed tự quay lại đúng thiết kế Sprint 1.
- [x] Không lỗi console, không phá Sprint 1/2.

**Kết quả QA (headless Chrome + CDP, `2026-07-21`):** tạo scene "Buổi tối - Test" với 2 effect (chọn từ GA thật đã inject) → lưu thành công, graph cập nhật ngay (3 node: scene + 2 GA), seed tắt hoàn toàn (`hasDev1: false`). Click scene → inspector đúng có nút Sửa/Xoá. Sửa tên qua composer → `state.scenes.length` giữ nguyên 1 (không tạo trùng), tên cập nhật đúng. Xoá scene → `scenesCount: 0`, seed tự động quay lại (đúng thiết kế, không phải bug). Không console error xuyên suốt.

**Bug tìm thấy & đã sửa trong lúc QA:** `saveSceneComposer()` không đồng bộ `_composerDraft.id`/`_composerMode` sau khi tạo scene mới — nếu bấm Lưu lần nữa mà không mở lại composer qua `openSceneComposer()`, sẽ tạo trùng scene thay vì update scene vừa tạo. Đã thêm 2 dòng đồng bộ lại draft sau khi lưu (graph.js, `saveSceneComposer()`).

### Ngoài phạm vi Sprint 3 (dồn sang Sprint 4)

- Tạo/sửa/xoá input device + channel
- Gán action (short/long/double) cho channel trỏ tới scene/GA
- Rename device/channel

### Quyết định kiến trúc cho Sprint 3

- **Modal composer không thêm DOM vào `index.html`** — tạo động qua JS (`ensureComposerDom()` append 1 lần vào `document.body`), tái dùng nguyên class `.modal-overlay`/`.modal`/`.modal-header`/`.modal-footer` đã có (dùng cho `#import-modal`) — không định nghĩa lại modal system.
- **Input tên/value dùng `oninput` cập nhật thẳng vào 1 draft object tạm** (`_composerDraft`, giữ tương tự cách `proj-name-input` ở Step 1 dùng `oninput="state.projectName=this.value"`) — **không** re-render lại toàn bộ modal mỗi keystroke. Chỉ re-render khi thêm/xoá dòng effect (thay đổi cấu trúc).
- **Validate targetAddr bằng ràng buộc UI, không validate sau khi nhập:** effect chỉ chọn qua `<select>` liệt kê `state.generatedGAs`, không có ô nhập tay địa chỉ — nên không thể tạo ra effect trỏ tới GA không tồn tại, khỏi cần hàm validate riêng.

### Task breakdown

| ID | Task | File đụng tới | Size | Phụ thuộc | Trạng thái |
|----|------|---------------|------|-----------|-----------|
| S3-T1 | CSS: `.modal-lg` (modal rộng hơn cho form effects), `.composer-effect-row` | `styles.css` | S | — | ✅ Done |
| S3-T2 | `ensureComposerDom()`, `openSceneComposer(sceneId?)`, `closeSceneComposer()`, `renderComposerModal()` — render form (tên/hệ thống/effects), chế độ create vs edit | `graph.js` | M | S3-T1 | ✅ Done |
| S3-T3 | Quản lý draft effects: `addComposerEffectRow()`, `removeComposerEffectRow(i)`, `setComposerEffectAddr(i, addr)` | `graph.js` | S | S3-T2 | ✅ Done |
| S3-T4 | `saveSceneComposer()` (validate tên rỗng, lọc effect chưa chọn GA, commit vào `state.scenes`, `debouncedSave()`, `renderGraphView()`) + `deleteScene(id)` | `graph.js` | S | S3-T3 | ✅ Done |
| S3-T5 | Wire entry points: nút "+ Cảnh mới" trong `renderGraphSubnav()`, nút "Sửa"/"Xoá" trong `inspectorForScene()` | `graph.js` | S | S3-T4 | ✅ Done |
| S3-T6 | QA: headless Chrome — tạo scene mới (2 effect), xác nhận xuất hiện trên graph + seed tự tắt, sửa tên, xoá, console error | — | S | S3-T5 | ✅ Done |

### Sơ đồ phụ thuộc

```
S3-T1 ──► S3-T2 ──► S3-T3 ──► S3-T4 ──► S3-T5 ──► S3-T6
```

Chuỗi tuyến tính (khác Sprint 1/2 có nhánh song song) vì toàn bộ nằm trong 1 file `graph.js`, tính năng build tăng dần từng lớp trên cùng 1 luồng.

---

## Sprint 4 — Mục tiêu

Input Device + Channel CRUD — mảnh còn thiếu cuối cùng để build được 1 control graph hoàn toàn thật, không phụ thuộc seed. Sau sprint này: tạo thiết bị → thêm channel → gán action (ga|scene) cho từng press-mode → xong 1 vòng authoring đầy đủ.

### Definition of Done — Sprint 4

- [x] "+ Thiết bị mới" → modal tạo device (name/room/floor/model) → Lưu → xuất hiện trên graph.
- [x] Trong modal đó: thêm/xoá/đổi tên channel (chỉ tên — action gán riêng, xem dưới).
- [x] Click channel node trên graph → inspector có nút "Sửa hành động" → chuyển inspector sang form sửa: mỗi press-mode (short/long/double) chọn None/GA/Scene + target (select, không gõ tay) + value → Lưu.
- [x] Click device node → inspector có Sửa/Xoá (giống pattern Scene ở Sprint 3).
- [x] Không lỗi console, không phá Sprint 1-3.

**Kết quả QA (headless Chrome + CDP, `2026-07-21`):** tạo device "Công tắc Test" + 2 channel → cả 2 hiện đúng dạng placeholder "— no action yet —" (xác nhận bugfix, xem dưới). Click channel → mở action editor 3 dòng, gán short=ga trực tiếp, long=scene thật, double=ga kèm value → Lưu → graph cập nhật đúng 9 node (1 device + 4 channel-mode + 1 scene + 3 GA), seed tắt hẳn, badge cảnh báo double-press hiện đúng vì model rỗng. Click device → có Sửa/Xoá. Xoá device → về đúng trạng thái thật (không seed vì vẫn còn 1 scene thật từ trước — đúng logic điều kiện fallback, không phải bug). Không console error xuyên suốt.

**Bug tìm thấy & đã sửa TRƯỚC lúc QA (phát hiện qua review code, không phải qua chạy thử):** `buildControlGraph()` chỉ tạo tier1 node cho channel khi đã có ít nhất 1 press-mode được gán action — nghĩa là channel mới tạo (chưa gán gì) sẽ không hiện node nào trên graph, user không có cách nào click vào để cấu hình action đầu tiên (deadlock trong luồng CRUD). Đã sửa `graph-data.js`: channel chưa có action nào vẫn tạo 1 node placeholder (`mode: null`) để click được; `graph.js` (`renderChannelNode`/`inspectorForChannel`) xử lý riêng case này (hiện "— chưa gán hành động —", viền đứt).

### Ngoài phạm vi Sprint 4 (dồn sang Sprint 5 — nếu cần)

- ~~Thay fallback seed bằng empty-state/CTA rõ ràng~~ → **đã làm ngay sau Sprint 4**, xem mục "Hotfix" bên dưới — user report đúng lúc dùng thử phát hiện chính vấn đề này.
- Kéo-thả sắp xếp lại channel/device
- Bulk action (gán nhiều channel cùng lúc)

---

## Hotfix (sau Sprint 4) — Empty-state thay vì auto-seed

**Triệu chứng user báo:** "GA tạo ở Wizard không thấy trong Graph" — chạy Wizard xong, có GA thật, qua tab Graph thì thấy dữ liệu mẫu (seed) chứ không phải gì liên quan tới GA thật vừa tạo.

**Nguyên nhân:** đúng y hệt "Nợ kỹ thuật" đã ghi nhận ở Sprint 1 nhưng chưa xử lý — điều kiện `useSeed` chỉ nhìn `state.inputDevices`/`state.scenes` (đều rỗng nếu chưa tạo gì), không quan tâm `state.generatedGAs` đã có GA thật hay chưa. Kết quả: GA thật không hề mất (`state.generatedGAs` vẫn nguyên), chỉ là graph không hiển thị nó vì chưa có device/scene nào trỏ tới.

**Fix (`graph.js`):**
- Bỏ hẳn auto-seed. Khi chưa có device/scene thật → hiện empty-state (tái dùng class `.floors-empty` có sẵn) với 2 nút hành động thật (+ Thiết bị/+ Cảnh đầu tiên) + 1 nút "Xem ví dụ mẫu".
- "Xem ví dụ mẫu" bật cờ `_showSeedDemo` (không persist) → hiện seed kèm banner cảnh báo rõ "đang xem demo" + nút Thoát.
- Ngay khi có device/scene thật, seed/demo banner biến mất hoàn toàn bất kể `_showSeedDemo`.

**QA (headless Chrome + CDP, `2026-07-21`):** inject 1 GA thật (không tạo device/scene) → Graph hiện đúng empty-state (`hasSeedNode: false`), sidebar "Total GAs: 1" xác nhận GA không mất. Mở composer cảnh từ CTA → dropdown hiệu ứng đúng có GA thật (`1/0/1`). Bấm "Xem ví dụ mẫu" → seed hiện kèm banner. Bấm "Thoát" → về lại empty-state. Không console error.

---

## Hotfix (sau Sprint 4) — Đường nối "GA trực tiếp" đi xuyên qua cột Scene

**Triệu chứng user báo:** đường nối (edge) hiện tại chỉ nối 3 cột, cần nối xuyên suốt cả 4 cột.

**Nguyên nhân:** action kiểu `type: 'ga'` (bỏ qua Scene theo đúng thiết kế mục 5 spec) vẽ 1 bezier duy nhất thẳng từ cột Channel sang cột GA, cắt chéo qua vùng cột Scene thay vì đi qua đúng "làn" của cột đó.

**Fix (`graph.js`):** `buildEdgePath()` — khi cạnh nhảy cóc quá 1 tier, chèn thêm waypoint tại đúng center-x của (các) cột bị bỏ qua (nội suy y tuyến tính theo x), nối thành path nhiều đoạn cubic bezier thay vì 1 đoạn duy nhất. Chỉ đổi cách vẽ (visual), không đổi logic "type=ga bỏ qua Scene" trong data model.

**QA (headless Chrome + CDP, `2026-07-21`):** path `d` của 3 cạnh GA-trực-tiếp (dev1 short/long, dev2 short) đều có `segments: 2` (xác nhận đã bẻ qua cột Scene); các cạnh liền kề tier khác (structural, effect, mode→scene) vẫn giữ `segments: 1`, không bị ảnh hưởng. Không console error.

---

## UX pass (sau Sprint 4) — Rút ngắn thao tác gán hành động + chú giải màu

**Lý do:** user hỏi "làm sao nối chế độ nhấn với cảnh" — lộ ra thao tác cũ bị giấu quá sâu (click node → cuộn xuống inspector → tìm nút nhỏ "Sửa hành động" → mới thấy dropdown), và không có chú giải màu nào cho người mới vào lần đầu.

**Thay đổi (`graph.js`, `styles.css`):**
- **Legend bar** dưới subnav: giải thích màu short/long/double + kiểu đường nối scene→effect + gợi ý "Click a node to view/edit details".
- **Channel chưa cấu hình**: đổi từ text tĩnh "— chưa gán hành động —" sang thẻ mời bấm rõ ràng (icon "+", viền đứt đổi màu khi hover) — **bấm thẳng vào là mở luôn form sửa hành động**, không cần vòng qua inspector nữa.
- **Nút "✎" hover-reveal** trên góc phải mỗi node thật (device/channel đã cấu hình/scene) — bấm thẳng mở composer/action-editor tương ứng, không bắt buộc phải click chọn node trước rồi mới tìm nút Sửa. Node từ seed/demo không có nút này (không sửa được, đúng thiết kế cũ).

**QA (headless Chrome + CDP, `2026-07-21`):** legend hiện đủ 5 mục. Click channel chưa cấu hình → mở thẳng form sửa (3 dòng press-mode) trong 1 thao tác thay vì 2-3 bước. Nút "✎" xuất hiện đúng trên device/channel đã cấu hình/scene thật; bấm nút trên device mở composer trực tiếp, không lỗi console.

---

## Responsive fix (sau Sprint 4) — Layout chồng chéo khi thu hẹp width

**Triệu chứng user báo:** layout chồng chéo lên nhau khi thu hẹp width.

**Đo đạc thực tế (headless Chrome, nhiều width 1200→375px) phát hiện 2 lỗi:**
1. **Header**: nút Wizard/Graph mới thêm nằm kẹp giữa 2 `.header-sep` (cả 2 `flex:1`), tổng nội dung header (hamburger + logo + view-toggle + save-indicator + lang) vượt quá viewport ở ≤480px → nút "VI" bị đẩy tràn ra ngoài, cắt mất 1 phần (đo được `bodyScrollWidth` 516px trong viewport 480px).
2. **Graph workspace**: `.graph-inspector` cố định `width:300px` không co được trong flex row → cột graph (`.graph-canvas`) bị bóp còn 32–140px ở width 600–480px, card thiết bị bị cắt chữ, dính sát panel inspector.

**Fix:**
- `index.html`: bỏ `.header-sep` dư thừa, view-toggle giờ chỉ có 1 sep đẩy sang phải cùng nhóm với project/save/lang.
- `styles.css` (breakpoint ≤768px có sẵn): `.graph-workspace{flex-direction:column}` + `.graph-inspector{width:100%;position:static}` — inspector xuống dưới thay vì bóp canvas.
- `styles.css` (breakpoint ≤480px có sẵn): ẩn `#save-indicator` (chỉ là feedback thoáng qua), giảm `gap`/padding của `#header`, thu nhỏ logo (28→22px) và nút view-toggle — giải phóng đủ chỗ để không còn phần tử nào tràn ra ngoài viewport.

**QA (headless Chrome + CDP, `2026-07-21`):** đo `bodyScrollWidth` so với `innerWidth` ở 6 mức (1200/900/768/600/480/375px) — **khớp chính xác ở mọi mức, không còn overflow ngang**. Trước fix: 516px content trong viewport 480px (lệch 36px) và 516px trong 375px (lệch 141px). Ảnh chụp xác nhận nút "VI" hiện đầy đủ, không bị cắt; graph workspace xếp dọc gọn gàng ở màn hẹp. Không console error.

### Quyết định kiến trúc cho Sprint 4

- **Không thêm modal thứ 3 cho action-per-channel** — thay vào đó, sửa action ngay trong `.graph-inspector` (đổi sang chế độ edit khi bấm "Sửa hành động", Lưu/Huỷ để quay lại view thường). Lý do: channel đã có sẵn slot hiển thị chi tiết trong inspector từ Sprint 2, mở thêm modal riêng cho 1 channel là dư thừa — tái dùng đúng vị trí đã có.
- **`ensureComposerDom()` (Sprint 3) tổng quát hoá thành `ensureModalDom(id)`** dùng chung cho cả Scene composer và Device composer — tránh lặp code tạo modal động, hành vi không đổi.
- **Room/Floor trong device composer là 2 select phụ thuộc nhau** (chọn floor → nạp lại option room), giống đúng quan hệ floor→room đã có trong `state.floors` — không tự ý cho gõ tay tên phòng.
- **Model vẫn là text tự do** (không phải select) — vì whitelist double-press chỉ là gợi ý tham khảo, không phải danh sách đóng (model KNX mới ra liên tục, chặn cứng sẽ sai).

### Task breakdown

| ID | Task | File đụng tới | Size | Phụ thuộc | Trạng thái |
|----|------|---------------|------|-----------|-----------|
| S4-T1 | CSS: `.action-mode-row` (form sửa action theo press-mode), `.channel-row` cho channel-list row | `styles.css` | S | — | ✅ Done |
| S4-T2 | Tổng quát `ensureComposerDom()` → `ensureModalDom(overlayId, innerId)`; `openDeviceComposer(deviceId?)`, `renderDeviceComposerModal()` — form name/room/floor/model + danh sách channel (thêm/xoá/đổi tên) | `graph.js` | M | S4-T1 | ✅ Done |
| S4-T3 | `saveDeviceComposer()` + `deleteDevice(id)`; wire nút "+ Thiết bị mới" (subnav) + Sửa/Xoá trong `inspectorForInput()` | `graph.js` | S | S4-T2 | ✅ Done |
| S4-T4 | `openChannelActionEditor(node)` — chuyển `#graphInspector` sang form sửa: mỗi press-mode chọn None/GA/Scene + target + value; `saveChannelActions()` commit vào `state.inputDevices` + fix bug placeholder node (xem trên) | `graph.js`, `graph-data.js` | M | S4-T3 | ✅ Done |
| S4-T5 | QA: headless Chrome — tạo device + 2 channel, gán action (mix ga/scene) cho cả 3 press-mode, xác nhận graph render đúng (seed tắt hẳn), sửa action, xoá channel/device, console error | — | S | S4-T4 | ✅ Done |

### Sơ đồ phụ thuộc

```
S4-T1 ──► S4-T2 ──► S4-T3 ──► S4-T4 ──► S4-T5
```
