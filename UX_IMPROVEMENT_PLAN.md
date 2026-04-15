# KNX GA Planner — UX/UI Improvement Plan

## Hiện trạng tóm tắt

| Hạng mục | Tình trạng |
|----------|-----------|
| Responsive / media queries | ❌ Không có — desktop-only |
| Inline styles trong JS | ⚠️ 71 chỗ — khó maintain |
| Fixed-width layouts | ❌ Sidebar 280px, panels 320px, 210px cứng |
| Table trên mobile | ❌ Overflow ngang, không có fallback |
| Form inputs width | ⚠️ Hard-coded px trên nhiều input |
| Component consistency | ⚠️ Lặp lại pattern chưa được class hoá |

---

## Sprint 1 — Responsive Foundation *(ưu tiên cao nhất)*

**Mục tiêu:** App dùng được trên tablet (768px) và mobile (480px).

### 1.1 Thêm media queries vào `styles.css`

```
Breakpoints:
  --bp-tablet: 768px   (iPad portrait, laptop nhỏ)
  --bp-mobile: 480px   (điện thoại)
```

**Thay đổi cụ thể:**

| Selector | Desktop | Tablet (≤768px) | Mobile (≤480px) |
|----------|---------|-----------------|-----------------|
| `#workspace` | flex row | flex row | flex column |
| `#sidebar` | width 280px | width 220px | hidden (toggle) |
| `#panel` | padding 24px | padding 16px | padding 12px |
| `.two-col` (Step 2) | 2 cột | 1 cột | 1 cột |
| `.export-layout` (Step 6) | 2 cột | 1 cột | 1 cột |
| `.assign-layout` (Step 4) | left 210px fixed | left 160px | 1 cột (floor selector trên top) |
| `.structure-grid` (Step 1) | 2 cột | 2 cột | 1 cột |
| `.systems-grid` | auto-fill 120px | auto-fill 100px | auto-fill 90px |
| `#stepbar` | flex row | scroll horizontal | scroll horizontal + compact |

### 1.2 Sidebar collapse trên mobile

- Thêm hamburger icon trên header khi ≤ 768px
- Sidebar overlay dạng drawer (slide in từ trái)
- Tap ngoài để đóng

### 1.3 Step bar responsive

- Trên mobile (≤ 480px): chỉ hiện số step + step hiện tại, ẩn label text
- Cho phép scroll ngang nếu không đủ chỗ

---

## Sprint 2 — Step 4 & 5 Mobile Layout

**Mục tiêu:** Hai step phức tạp nhất phải dùng được trên màn nhỏ.

### 2.1 Step 4 — Assign circuits (mobile)

**Vấn đề:** `assign-layout` dùng left panel cố định 210px + right panel — vỡ trên mobile.

**Đề xuất:**
- ≤ 768px: Đổi floor list thành `<select>` dropdown thay vì button list dọc
- Room tabs giữ nguyên nhưng cho phép scroll ngang
- Circuit rows giữ nguyên (đủ hẹp để dùng được)

### 2.2 Step 5 — GA Table trên mobile

**Vấn đề:** `.ga-table` có nhiều cột fixed width (96px + 130px + 136px) — overflow ngang.

**Đề xuất:**
- ≤ 768px: Ẩn cột `System` và `DPT` trong table, thêm vào tooltip/expand
- ≤ 480px: Đổi table sang **card list** — mỗi GA là 1 card nhỏ với addr + name + badge

### 2.3 Manual GA form (Step 5)

**Vấn đề:** 6 input nằm ngang `flex-wrap` — vỡ layout trên mobile.

**Đề xuất:**
- ≤ 480px: 2 cột grid cho các input nhỏ (Main, Middle, Sub, Type)
- Name input luôn full-width
- Button "Add GA" full-width

---

## Sprint 3 — CSS Cleanup & Component Consolidation

**Mục tiêu:** Giảm 71 inline styles, tăng maintainability.

### 3.1 Tạo utility classes mới trong `styles.css`

Những inline style lặp lại nhiều nhất cần được class hoá:

```css
/* Spacing */
.mt-2  { margin-top: 8px; }
.mb-2  { margin-bottom: 8px; }
.mt-3  { margin-top: 12px; }    /* đã có trong code nhưng chưa có CSS */
.mb-3  { margin-bottom: 12px; }
.mt-4  { margin-top: 16px; }    /* đã dùng trong render.js */
.gap-2 { gap: 8px; }

/* Typography */
.text-sm    { font-size: 12px; }
.text-muted { color: var(--gray-400); }
.text-mono  { font-family: var(--font-mono); }
.fw-700     { font-weight: 700; }

/* Layout */
.flex-center { display: flex; align-items: center; }
.flex-wrap   { display: flex; flex-wrap: wrap; }
.ml-auto     { margin-left: auto; }
.w-full      { width: 100%; }
```

### 3.2 Tạo class cho empty states

Hiện tại mỗi empty state có inline style riêng. Tạo class chung:

```css
.empty-state {
  padding: 40px;
  text-align: center;
  color: var(--gray-400);
  font-size: 13px;
  border: 1px dashed var(--gray-200);
  border-radius: var(--radius);
}
.empty-state-icon { font-size: 28px; margin-bottom: 8px; }
```

### 3.3 Chuẩn hoá form width trong render.js

Thay `style="width:140px"` bằng class `.input-w-md`, `style="width:80px"` bằng `.input-w-sm` v.v.

---

## Sprint 4 — UX Polish

**Mục tiêu:** Cải thiện flow, feedback, và accessibility.

### 4.1 Step navigation improvements

- **Validate trước khi next:** Step 1 → 2 cần có project name. Step 3 → 4 cần có ít nhất 1 floor và 1 room. Hiện tại không validate.
- **Progress indicator:** Sidebar hiện số circuits đã thêm trong Step 4 (đã có một phần nhưng chỉ show count, không show completion status).

### 4.2 Step 3 — Floor & Room UX

- Khi thêm floor mới, auto-focus vào floor name input (đã có `setTimeout` nhưng chỉ focus `.floor-name-field`)
- Thêm drag-to-reorder floors (HTML5 drag API, không cần thư viện)
- Keyboard shortcut: Tab từ room input của floor này sang floor tiếp theo

### 4.3 Step 5 — GA Review

- Thêm nút **"Collapse all / Expand all"** cho tree view
- Filter chips hiện thiếu count khi `gaFilter !== 'all'` — đã có count nhưng nếu filter active thì chip chỉ show filtered count
- Inline edit: click vào addr field để xem full path

### 4.4 Step 6 — Export

- Preview pane: thêm **line numbers** cho XML preview
- CSV preview: khi chọn CSV format, preview pane hiện table thay vì raw text
- Thêm **"Copy all"** shortcut key (Ctrl+A trong preview pane)

### 4.5 Toast & Feedback

- Toast hiện `position: fixed bottom` — tốt. Nhưng chỉ hiện 1 toast tại 1 thời điểm. Nên queue nếu có nhiều action liên tiếp.
- Thêm undo toast cho `deleteGA()`: "GA x/y/z đã xóa [Undo]"

---

## Sprint 5 — Accessibility & Performance

**Mục tiêu:** WCAG AA cơ bản, load time tốt hơn.

### 5.1 Keyboard navigation

- Tất cả interactive elements cần `:focus-visible` style (hiện tại chỉ có `:focus` outline mờ)
- Step bar accessible bằng arrow keys
- Modal: focus trap khi mở, Escape để đóng (đã có × button nhưng chưa có Escape handler)

### 5.2 ARIA labels

- Thêm `aria-label` cho icon-only buttons (✕, ✎)
- Thêm `role="status"` cho toast
- Step bar cần `aria-current="step"`

### 5.3 Performance

- `syntaxHighlight()` trong render.js chạy regex trên toàn bộ XML string mỗi lần render → debounce hoặc chỉ chạy khi xml thay đổi (đã có `_xmlCache` — nên check cache trước)
- `localStorage` write mỗi 600ms (debouncedSave) — ổn, không cần thay đổi

---

## Bảng tổng hợp Sprint

| Sprint | Nội dung | Độ khó | Impact |
|--------|----------|--------|--------|
| **Sprint 1** | Responsive foundation + media queries | Trung bình | ⭐⭐⭐⭐⭐ |
| **Sprint 2** | Step 4 & 5 mobile layout | Trung bình | ⭐⭐⭐⭐ |
| **Sprint 3** | CSS cleanup, utility classes | Thấp | ⭐⭐⭐ |
| **Sprint 4** | UX polish (validation, drag, undo) | Cao | ⭐⭐⭐⭐ |
| **Sprint 5** | Accessibility + performance | Trung bình | ⭐⭐⭐ |

---

## Ghi chú kỹ thuật

- **Không dùng framework** — tất cả responsive qua CSS media queries thuần
- **Không tạo file mới** — chỉ sửa `styles.css` và `render.js` (theo quy tắc CLAUDE.md)
- Sprint 1 là **prerequisite** cho Sprint 2 — làm theo thứ tự
- Sprint 3, 4, 5 có thể làm song song hoặc theo thứ tự tùy ưu tiên
