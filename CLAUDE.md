# CLAUDE.md — KNX GA Planner

## Project context

Pure client-side tool — chạy thẳng trên browser, không cần server.

### File structure

```
index.html          — HTML shell + load scripts theo thứ tự
assets/engine.js    — GA data + pure functions (không đọc DOM, không đọc state)
assets/state.js     — app state object + localStorage persistence
assets/i18n.js      — i18n strings + t() + setLang()
assets/render.js    — toàn bộ render/UI functions (renderStep1–6, circuit helpers…)
assets/app.js       — engine calls, import modal, utilities, init
assets/styles.css   — stylesheet
```

### Load order trong index.html (bắt buộc theo thứ tự)

```html
<script src="assets/engine.js"></script>
<script src="assets/state.js"></script>
<script src="assets/i18n.js"></script>
<script src="assets/render.js"></script>
<script src="assets/app.js"></script>
```

---

## Nguyên tắc làm việc

### Scope
- Không tạo file JS ngoài 5 file đã định ở trên
- Không tạo file CSS mới — dùng `assets/styles.css`
- Không dùng framework, bundler, hay npm package nào

### Code style
- Vanilla JS thuần — không ES modules (`import`/`export`)
- Tất cả symbols đều ở global scope — file sau dùng được symbol của file trước
- Không inline CSS trong JS template literals — dùng class đã định nghĩa sẵn trong `styles.css`

### Đặt tên
- Giữ nguyên tên biến từ source gốc (tránh breaking change)
- State field tên là `generatedGAs` — không phải `gas`
- Engine call functions: `callGenerate`, `callExportXML`, `callExportCSV`, `callImportXML`

---

## Quy tắc từng file

### engine.js
- Pure functions + data — không đọc `state`, không đọc DOM
- `generateGAs(payload)` nhận object, không đọc biến ngoài scope
- `parseXML()` dùng regex — không dùng DOMParser
- Cuối file: `if (typeof module !== 'undefined') module.exports = { ... }`

### state.js
- Định nghĩa `const state = { ... }` và các hằng persistence (`STORAGE_KEY`, `PERSIST_FIELDS`)
- Các hàm: `saveState`, `debouncedSave`, `loadState`, `newProject`
- Không gọi DOM render từ đây — chỉ đọc/ghi state và localStorage

### i18n.js
- Định nghĩa `const i18n = { en: {...}, vi: {...} }`
- Hàm `t(key)` đọc `state.lang`
- Hàm `setLang(lang)` — cập nhật state rồi gọi `renderAll()`
- Không chứa tên hệ thống KNX hay GA label — chỉ UI strings

### render.js
- Toàn bộ render functions: `renderAll`, `renderStepBar`, `renderSidebar`, `renderPanel`, `goStep`
- Toàn bộ `renderStep1` – `renderStep6` và các helper đi kèm
- Circuit helpers: `activeDefs`, `getCircuits`, `addCircuit`, `removeCircuit`, `setCircuitName`
- Constants dùng trong render: `sysIconSvg`, `circuitSuggestedNames`
- Được gọi `escHtml`, `showToast`, `callGenerate` (defined in app.js) — chấp nhận được vì script load xong hết trước khi event nào kích hoạt

### app.js
- Utilities: `escHtml`, `showToast`, `showLoading`, `hideLoading`, `triggerDownload`, `updateHeaderProject`
- Engine calls: `callGenerate`, `callExportXML`, `callExportCSV`, `callImportXML`
- Import modal: `openImportModal`, `closeImportModal`, `handleXmlFile`, `readXmlFile`
- Floor extraction: `extractFloorsFromGAs`
- Init block ở cuối file: `loadState(); renderAll();`

---

## Thứ tự ưu tiên khi có conflict

1. **Correctness** — logic sinh GA phải đúng (địa chỉ không trùng, đúng DPT)
2. **Simplicity** — code đơn giản hơn code "thông minh"
3. **UX** — UI phản hồi rõ ràng mọi trạng thái (loading / error / success)
