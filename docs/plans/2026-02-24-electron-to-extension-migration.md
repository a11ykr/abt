# Electron to Browser Extension Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the existing Electron desktop application into a pure Browser Extension (Manifest V3) using Chrome Side Panel as the primary UI.

**Architecture:**
- Use `chrome.sidePanel` to host the React Dashboard.
- Replace WebSocket communication with `chrome.runtime.sendMessage`.
- Migrate local file storage to `chrome.storage.local`.
- Use the standard Web `File System Access API` for report generation.

**Tech Stack:** React, Vite, TypeScript, SCSS Modules, Manifest V3.

---

### Task 1: Environment Setup & Manifest Configuration

**Files:**
- Create: `src/extension/manifest.json`
- Modify: `vite.config.ts`
- Modify: `package.json`

**Step 1: Create Manifest V3 configuration**

```json
{
  "manifest_version": 3,
  "name": "ABT - A11Y Browser Tester",
  "version": "1.0.0",
  "permissions": ["sidePanel", "storage", "activeTab", "scripting"],
  "action": {
    "default_title": "Open ABT Dashboard"
  },
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["engine/ABT-Connector.js", "engine/ABT-Core.js"]
    }
  ]
}
```

**Step 2: Update Vite configuration for Extension build**
- Configure multiple entry points for sidepanel, background, and content scripts.
- Ensure assets are copied correctly to the `dist` folder.

**Step 3: Update package.json scripts**
- Add `"dev:ext": "vite"`
- Add `"build:ext": "vite build"`

**Step 4: Verify build output**
Run: `npm run build:ext`
Expected: `dist/` contains `manifest.json`, `sidepanel.html`, and bundled JS files.

**Step 5: Commit**

### Task 2: UI (Side Panel) Implementation

**Files:**
- Create: `src/renderer/sidepanel.html`
- Modify: `src/renderer/App.tsx`

**Step 1: Create sidepanel entry HTML**
- Mirror `index.html` but point to the React entry script.

**Step 2: Remove Electron-specific APIs from App.tsx**
- Replace `(window as any).electronAPI` calls with a unified `Connector` class.

**Step 3: Adjust styles for side panel width**
- Ensure the UI is responsive for a sidebar (typically 300px - 600px).

**Step 4: Commit**

### Task 3: Logic Migration (Messaging & Storage)

**Files:**
- Modify: `src/engine/ABT-Connector.js`
- Modify: `src/renderer/store/useStore.ts`

**Step 1: Rewrite ABT-Connector.js**
- Replace WebSocket logic with `chrome.runtime.sendMessage`.

**Step 2: Implement Background Service Worker**
- Create `src/extension/background.js` to handle message relay between content scripts and side panel.

**Step 3: Update Zustand Persistence**
- Implement a custom storage engine for Zustand that uses `chrome.storage.local`.

**Step 4: Commit**

### Task 4: Report Export & Cleanup

**Files:**
- Modify: `src/renderer/App.tsx`
- Delete: `src/main/`
- Delete: `electron` from dependencies

**Step 1: Implement File System Access API for reports**
- Replace clipboard copy with `window.showSaveFilePicker`.

**Step 2: Remove all Electron code and dependencies**
- Run `npm uninstall electron electron-builder concurrently wait-on`.

**Step 3: Final verification**
- Load the `dist` folder as an unpacked extension in Chrome.
- Verify side panel opens and receives data from the page.

**Step 4: Commit**
