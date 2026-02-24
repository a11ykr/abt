# ABT SidePanel Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the ABT React UI for a vertical Chrome Side Panel layout (300px-400px width) with a "Start Audit" hero view.

**Architecture:** 
- Transition from a sidebar-main layout to a single-column vertical layout.
- Introduce a conditional "Dashboard" view when no data is present.
- Use CSS Flexbox/Grid for vertical stacking and responsiveness.
- Maintain existing Zustand store and message passing logic.

**Tech Stack:** React, SCSS Modules, Lucide React, Zustand, Chrome Extension API.

---

### Task 1: Refactor SCSS for Verticality

**Files:**
- Modify: `src/renderer/styles/App.module.scss`

**Step 1: Update container and layout styles**
- Change `.container` to `flex-direction: column`.
- Remove `.sidebar` width and border-right.
- Make `.mainBoard` take full width.
- Add styles for the new "Hero" view.

**Step 2: Refactor card and detail view**
- Ensure cards stack vertically and fit narrow widths.
- Make the property panel an overlay or a collapsible section that fits the narrow width.

**Step 3: Commit**
```bash
git add src/renderer/styles/App.module.scss
git commit -m "style: refactor for vertical side panel layout"
```

---

### Task 2: Implement "Start Audit" Hero View in App.tsx

**Files:**
- Modify: `src/renderer/App.tsx`

**Step 1: Add state for current page URL**
- Use `chrome.tabs.query` to get the current tab's URL and title.

**Step 2: Implement conditional rendering**
- If `items` is empty, show the "Start Audit" hero view.
- Hero view should display the current page URL and a large "Start Audit" button.

**Step 3: Implement 'run-audit' trigger**
- Clicking "Start Audit" should call `chrome.runtime.sendMessage({ type: 'run-audit' })`.

**Step 4: Commit**
```bash
git add src/renderer/App.tsx
git commit -m "feat: add Start Audit hero view and vertical layout logic"
```

---

### Task 3: Update Background Script

**Files:**
- Modify: `src/extension/background.js`

**Step 1: Handle 'run-audit' message**
- Add a listener for `run-audit`.
- Relay the message to the active tab's content script.

**Step 2: Commit**
```bash
git add src/extension/background.js
git commit -m "feat: handle run-audit message in background script"
```

---

### Task 4: Verification and Build

**Step 1: Run build**
- Run `npm run build` to ensure everything compiles correctly.

**Step 2: Verify diagnostics**
- Run `lsp_diagnostics` on changed files.

**Step 3: Commit**
```bash
git commit -m "chore: final build and verification"
```
