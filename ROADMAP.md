# KNX GA Planner — Rebuild Roadmap

**Mục tiêu:** Tách single-file HTML thành 3-file architecture (engine / server / UI)  
**Nguyên tắc:** Mỗi sprint = 1 file hoặc 1 layer rõ ràng, context tối thiểu, output dùng ngay được

---

## Tổng quan file sau rebuild

```
rebuild/
├── engine.js     Sprint 1 + 2
├── server.js     Sprint 3
└── index.html    Sprint 4 + 5 + 6
```

---

## Sprint 1 — `engine.js` : Data layer

**Mục tiêu:** Định nghĩa toàn bộ dữ liệu tĩnh — không có logic, không có side effect

**Nội dung cần viết:**

- `ALLOWED_ORIGINS` — danh sách domain được phép gọi API
- `sysInfo` — metadata 9 hệ thống (main number, tên EN/VI)
  ```js
  // Ví dụ một entry:
  lt: { name_en:'Lighting', name_vi:'Chiếu sáng', main: 1 }
  ```
- `prefix` — mapping system key → GA name prefix
  ```js
  { lt:'LT', pres:'PRES', sht:'SHT', hvac:'HVAC', sec:'SEC', scn:'SCN', av:'AV', nrg:'NRG', sys:'SYS' }
  ```
- `floorPrefix` — mapping middle group index → label
  ```js
  { 0:'CTRL', 1:'BAS', 2:'GF', 3:'FL1', 4:'FL2', 5:'FL3', 6:'FL4', 7:'OUT' }
  ```
- `gasets` — GA object array cho từng hệ thống (o, n, full, dpt, t)
- `circuitDefs` — mapping system key → danh sách loại mạch
  ```js
  lt: [['onoff','On/Off'], ['dim','Dimming'], ['cct','CCT'], ['rgb','RGBW']]
  ```
- `circuitGaSet` — mapping `sys_circuit` → GA subset
  ```js
  lt_onoff: [...], lt_dim: [...], lt_cct: [...], lt_rgb: [...]
  pres_sensor, sht_motor, hvac_zone, sec_zone, scn_scene, av_unit, nrg_meter, sys_unit
  ```
- `defaultFloors` — danh sách floor mặc định khởi tạo state
  ```js
  [
    { id:'f0', mid:0, name:'Central / Global', rooms:['All zones','Scenes','Security global'], fixed:true },
    { id:'f1', mid:1, name:'Basement', rooms:['Garage','Storage','Utility'] },
    { id:'f2', mid:2, name:'Ground floor', rooms:['Living room','Dining','Kitchen','WC','Entrance'] },
    { id:'f3', mid:3, name:'Floor 1', rooms:['Master bedroom','Master bath','Bedroom 2','Corridor'] },
    { id:'f4', mid:4, name:'Floor 2', rooms:['Bedroom 3','Bedroom 4','Study','Bath 2'] },
    { id:'f5', mid:5, name:'Roof / Outdoor', rooms:['Terrace','Garden','Pool area'] }
  ]
  ```

**Tiêu chí hoàn thành:**
- Pure data, không có `function` nào
- `module.exports = { ALLOWED_ORIGINS, sysInfo, prefix, floorPrefix, gasets, circuitDefs, circuitGaSet, defaultFloors }`

---

## Sprint 2 — `engine.js` : Logic layer

**Mục tiêu:** Viết các hàm xử lý nghiệp vụ, append vào engine.js

**Nội dung cần viết:**

### `generateGAs(payload)`
- Input:
  ```js
  {
    structure,      // 'function' | 'building'
    floors,         // array floors với mid, name, rooms[]
    systems,        // { lt: true/false, ... }
    quantities,     // [fi][ri][sk][ck] = number
    manualGAs       // [] array GA thêm tay (preserve qua lần regenerate)
  }
  ```
- Logic: duyệt theo thứ tự `system → floor → room → circuitDef → qty`
  - Các hệ thống `sec`, `scn`, `sys` → sinh thêm 1 block ở `mid=0` (Central)
  - Bỏ qua floor có `mid=0` khi sinh per-room GAs
  - Bỏ qua room tên `'All zones'` hoặc `'Scenes'`
  - Sub-address dùng counter tăng dần per `main/mid` key — **không** dùng block×10
  - Mỗi GA object có thêm `_id` để track:
    ```js
    _id: `${sk}_${fi}_${ri}_${ck}_${unit}_${gi}`
    ```
  - Merge `manualGAs` vào cuối (giữ nguyên nếu không trùng addr)
  - Sort kết quả theo `main → mid → sub` (numeric)
- Output: `GA[]`
  ```js
  { addr, name, dpt, type, main, mid, mainName, _id }
  ```

### `parseXML(xmlString)`
- Input: chuỗi XML ETS GroupAddress-Export
- **Quan trọng:** Chạy trên Node.js server — không có `DOMParser`, không có `querySelectorAll`
- Dùng regex để extract `<GroupAddress ... />` tags
- Output: `GA[]` với `{ addr, name, dpt, type:'ctrl', main, mid, mainName:'Imported' }`

### `buildXML(gas, opts)`
- Input:
  ```js
  gas,          // GA[]
  opts: {
    projectName,
    floors,       // để lookup tên floor từ mid
    includeDpt,   // boolean
    includeDesc   // boolean
  }
  ```
- Output: XML string chuẩn schema `http://knx.org/xml/ga-export/01`
- Group theo Main → Middle, có comment `<!-- Main group N: Name -->`

### `buildCSV(gas, opts)`
- Input: `gas`, `opts: { floors }`
- Output: tab-delimited, **hierarchical format** (giống ETS CSV import):
  ```
  Main group\tMiddle group\tGroup address\tAddress
  1 Lighting\t\t\t1/-/-
  \t1/2 Ground floor\t\t1/2/-
  \t\tLT - GF - Living room - SW\t1/2/0
  ```

**Tiêu chí hoàn thành:**
- Mỗi hàm pure function
- Append vào `module.exports`
- Test nhanh: `node -e "const e=require('./engine'); console.log(e.generateGAs({structure:'function',floors:e.defaultFloors,systems:{lt:true},quantities:{},manualGAs:[]}).length)"` → ra số > 0

---

## Sprint 3 — `server.js` : HTTP server

**Mục tiêu:** Web server nhẹ, zero npm dependency, xử lý 5 route

**Nội dung cần viết:**

### Routes
| Method | Path | Xử lý |
|--------|------|--------|
| GET | `/` | Serve `index.html` |
| POST | `/api/generate` | Gọi `generateGAs(body)`, trả JSON `{ gas }` |
| POST | `/api/export/xml` | Gọi `buildXML(body.gas, body.opts)`, trả file XML |
| POST | `/api/export/csv` | Gọi `buildCSV(body.gas, body.opts)`, trả file CSV |
| POST | `/api/import/xml` | Nhận raw XML string, gọi `parseXML()`, trả `{ gas, count }` |

### Middleware tích hợp sẵn
- **Domain check:** So `req.headers.origin` với `ALLOWED_ORIGINS` — 403 nếu không khớp
  - Bỏ qua check nếu `origin` là empty (truy cập trực tiếp localhost)
- **Body parser:** Đọc stream → `JSON.parse` (built-in, không dùng express)
- **Error handler:** Mỗi route wrap trong try/catch, trả `500 + { error: message }`

**Tiêu chí hoàn thành:**
- Chỉ dùng `http`, `fs`, `path` (Node built-in)
- `node server.js` → chạy ngay không crash
- Curl test generate: `curl -s -X POST http://localhost:3000/api/generate -H "Content-Type: application/json" -d '{"structure":"function","floors":[],"systems":{"lt":true},"quantities":{},"manualGAs":[]}'` → trả JSON

---

## Sprint 4 — `index.html` : HTML + CSS skeleton

**Mục tiêu:** Toàn bộ layout và style — không có 1 dòng JS nào

**Nội dung cần viết:**
- CSS variables (design tokens: teal palette, typography, spacing, radius) — giữ nguyên từ bản gốc
- Layout: header / stepbar / sidebar / panel / bottombar
- Component styles: btn, card, chip, input, table, tree view, badge, toggle, export layout
- Import modal (hidden by default)
- Loading overlay — hiện khi đang gọi API
- Toast notification — success/error

**Tiêu chí hoàn thành:**
- Mở file trong browser → thấy layout đúng (dù chưa có JS)
- Không có `<script>` nào
- Giữ nguyên font DM Sans + DM Mono từ Google Fonts

---

## Sprint 5 — `index.html` : JS State + Render (Steps 1–4)

**Mục tiêu:** State management và render logic cho 4 bước đầu — chưa gọi API

**State đầy đủ (khớp với source gốc):**
```js
const state = {
  lang: 'en',
  step: 1,
  projectName: '',
  structure: 'function',
  systems: { lt:true, pres:true, sht:true, hvac:true, sec:true, scn:true, av:false, nrg:false, sys:false },
  ltSubs:   { onoff:true, dim:true, cct:true, rgb:true, facade:false },
  hvacSubs: { therm:true, split:true, fcu:false, ufh:false, hp:false },
  floors: [],              // khởi tạo từ server hoặc hardcode UI default
  quantities: {},          // [fi][ri][sk][ck] = number
  generatedGAs: [],        // filled by /api/generate response  ← tên đúng là generatedGAs
  manualGAs: [],           // GAs thêm tay, preserved qua regenerate
  floorView: 'chip',       // 'chip' | 'tree'
  gaView: 'tree',          // 'tree' | 'table'
  gaFilter: 'all',         // 'all' | system key
  exportFormat: 'xml',     // 'xml' | 'csv'
  exportOpts: { dpt:true, desc:false, unused:false, floorFirst:false },
  importedXml: null        // temp storage khi user chọn file import
}
```

**Render functions (Steps 1–4):**
- `renderStep1()` — structure selector card + project name input
- `renderStep2()` — system cards grid + ltSubs chips + GA set preview panel bên phải
- `renderStep3()` — floor/room builder với chip view + tree view toggle
- `renderStep4()` — quantity table per floor / room / system / circuit type

**Helpers:**
- `renderAll()` — re-render stepbar + sidebar + panel
- `goStep(n)` — chuyển step (step 5 trigger API call ở Sprint 6)
- `t(key)` — i18n lookup EN/VI (chỉ UI strings, không có GA data)
- `setLang(lang)` — toggle EN/VI

**Tiêu chí hoàn thành:**
- Step 1→4 thao tác được offline
- State thay đổi đúng
- Không có `gasets`, `generateGAs`, `buildXML` trong file này

---

## Sprint 6 — `index.html` : API Integration (Steps 5–6)

**Mục tiêu:** Kết nối UI với backend + hoàn thiện Steps 5 và 6

**API calls:**
```js
async function callGenerate()          // POST /api/generate → state.generatedGAs
async function callExportXML()         // POST /api/export/xml → trigger download
async function callExportCSV()         // POST /api/export/csv → trigger download
async function callImportXML(rawStr)   // POST /api/import/xml → merge vào state.generatedGAs
```

**Render functions (Steps 5–6):**

`renderStep5()` gồm:
- Stat bar: tổng GA / main groups / số tầng
- Toolbar: filter by system + nút Import XML
- GA tree view (collapse/expand main → mid → sub rows)
- GA table view (toggle)
- **Inline edit tên GA** — click name → input, Enter/Escape để confirm/cancel, cập nhật trực tiếp vào `state.generatedGAs`
- **Delete GA** — nút xóa từng row, confirm trước khi xóa
- **Add manual GA** — form nhỏ ở cuối mỗi mid-group: nhập main/mid/sub + name + DPT + type → push vào `state.manualGAs`

`renderStep6()` gồm:
- Panel trái: project summary + chọn format (xml/csv) + export options toggles + filename input
- Panel phải: XML preview có syntax highlight + nút copy clipboard
- Nút Download XML / Export CSV

**UX:**
- Loading overlay khi đang gọi API (che toàn màn hình)
- Toast "X GAs generated" sau generate thành công
- Toast "Import: X GAs merged" sau import
- Khi server lỗi → hiện thông báo rõ ràng, không crash UI

**Tiêu chí hoàn thành:**
- End-to-end flow: chọn options → Generate → xem GA list → edit tên → Download XML
- Import XML file → merge đúng vào list hiện tại
- Offline (server tắt) → hiện error message, UI vẫn dùng được Steps 1–4

---

## Thứ tự build tối ưu

```
Sprint 1 → Sprint 2 → Sprint 3   (backend hoàn chỉnh, test bằng curl)
     ↓
Sprint 4 → Sprint 5               (UI Steps 1–4, test offline)
     ↓
Sprint 6                          (kết nối, test end-to-end)
```

---

## Những điểm khác biệt so với bản gốc (intentional)

| Điểm | Bản gốc | Rebuild |
|------|---------|---------|
| `generateGAs()` | đọc global `state` | nhận `payload` parameter (pure function) |
| `parseXML()` | dùng `DOMParser` (browser) | dùng regex (Node.js server) |
| `state.gas` | tên là `state.generatedGAs` | giữ nguyên `state.generatedGAs` |
| Import XML | xử lý client-side | xử lý server-side |
| GA data / logic | nằm trong `index.html` | chỉ nằm trong `engine.js` |

---

## Ghi chú context khi build

Mỗi khi yêu cầu viết code một sprint, chỉ cần nói:
> "Viết Sprint X"

Không cần paste lại file gốc — toàn bộ spec đã đủ trong file này.
