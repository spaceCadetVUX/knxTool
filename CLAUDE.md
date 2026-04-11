# CLAUDE.md — KNX GA Planner Rebuild

## Project context

Đây là project rebuild KNX GA Planner từ single-file HTML thành 3-file architecture:
- `engine.js` — toàn bộ GA logic + data (không bao giờ serve ra browser)
- `server.js` — HTTP server, zero npm dependency
- `index.html` — UI shell, không chứa business logic

Đọc `ROADMAP.md` trước khi làm bất kỳ sprint nào.

---

## Nguyên tắc làm việc

### Scope
- Chỉ viết đúng những gì sprint yêu cầu, không thêm feature ngoài spec
- Không tạo file mới ngoài 3 file đã định (`engine.js`, `server.js`, `index.html`)
- Không refactor sprint khác khi đang làm một sprint

### Code style
- Vanilla JS, không dùng bất kỳ framework hay thư viện nào
- `server.js` chỉ dùng Node built-in: `http`, `fs`, `path` — tuyệt đối không `require` package ngoài
- `engine.js` phải là pure functions — không đọc/ghi global state, không có side effect
- `index.html` không được chứa bất kỳ GA data hay logic nào (`gasets`, `circuitDefs`, `generateGAs`...)

### Đặt tên
- Giữ nguyên tên biến từ source gốc khi có thể (tránh breaking change)
- State field tên là `generatedGAs` — không phải `gas`
- API functions trong UI đặt tên `callGenerate`, `callExportXML`, `callExportCSV`, `callImportXML`

---

## Quy tắc engine.js

- Sprint 1: chỉ data, không có function
- Sprint 2: chỉ pure functions, không đọc `state` global
- `generateGAs(payload)` nhận object payload, không đọc biến ngoài scope
- `parseXML()` dùng regex — không dùng DOMParser (không có trong Node.js)
- `buildCSV()` xuất hierarchical format (4 cột: Main group / Middle group / Group address / Address)
- Export cuối file: `module.exports = { ... }` gộp cả data lẫn functions

---

## Quy tắc server.js

- Domain check: bỏ qua khi `origin` header rỗng (localhost direct access)
- Mọi route API phải wrap trong try/catch, lỗi trả `{ error: message }` với status 500
- Không log sensitive data ra console
- Port mặc định: `3000`, đọc từ `process.env.PORT || 3000`

---

## Quy tắc index.html

- Không có `gasets`, `circuitDefs`, `circuitGaSet`, `generateGAs`, `buildXML`, `buildCSV`
- State khởi tạo với `floors: []` — nhận default floors từ API hoặc hardcode UI-side
- Loading overlay phải hiện trước khi gọi fetch, ẩn sau khi nhận response (kể cả lỗi)
- Khi server không phản hồi: hiện error toast, không crash, không console.error ẩn
- CSS không được inline trong JS template literals (dùng class đã định nghĩa sẵn)
- i18n `t(key)` chỉ chứa UI strings — không chứa tên hệ thống KNX hay GA label

---

## Thứ tự ưu tiên khi có conflict

1. **Correctness** — logic sinh GA phải đúng (địa chỉ không trùng, đúng DPT)
2. **Security** — engine.js không bao giờ expose ra client
3. **Simplicity** — code đơn giản hơn code "thông minh"
4. **UX** — UI phản hồi rõ ràng mọi trạng thái (loading / error / success)
