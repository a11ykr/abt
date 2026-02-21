# Data Persistence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 웹 접근성 진단 도구 ABT Desktop의 진단 데이터를 로컬 파일 시스템에 저장하고 앱 재시작 시 복구할 수 있도록 구현합니다.

**Architecture:** 
- **Zustand Persistence**: `zustand/middleware`의 `persist` 기능을 사용하여 데이터를 `localStorage`에 자동 저장합니다.
- **Project Structure**: 진단 내역을 프로젝트 단위로 관리할 수 있도록 기본적인 프로젝트 메타데이터 구조를 도입합니다.
- **Data Flow**: WebSocket으로부터 수신된 데이터가 Zustand 스토어에 업데이트되면 즉시 로컬 저장소에 동기화됩니다.

**Tech Stack:** Zustand (Persist Middleware), React, TypeScript

---

### Task 1: Zustand 스토어 구조화 및 Persistence 적용

**Files:**
- Create: `src/renderer/store/useStore.ts`
- Modify: `src/renderer/App.tsx`

**Step 1: Zustand 스토어 생성 및 데이터 영속성 설정**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ABTItem {
  id: string;
  ruleId: string;
  element: string;
  status: string;
  judge?: string;
  description?: string;
}

interface ABTStore {
  items: ABTItem[];
  projectName: string;
  setItems: (items: ABTItem[]) => void;
  updateItemStatus: (id: string, judge: string) => void;
  clearItems: () => void;
  setProjectName: (name: string) => void;
}

export const useStore = create<ABTStore>()(
  persist(
    (set) => ({
      items: [],
      projectName: 'Default Project',
      setItems: (items) => set({ items }),
      updateItemStatus: (id, judge) => set((state) => ({
        items: state.items.map((item) => 
          item.id === id ? { ...item, judge } : item
        )
      })),
      clearItems: () => set({ items: [] }),
      setProjectName: (projectName) => set({ projectName }),
    }),
    {
      name: 'abt-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
```

**Step 2: App.tsx에서 스토어 연동 및 기존 로컬 스테이트 대체**

```typescript
// src/renderer/App.tsx 상단에 스토어 임포트
import { useStore } from './store/useStore';

// App 컴포넌트 내부
const { items, setItems, updateItemStatus, clearItems, projectName } = useStore();

// 기존 window.electron.on('update-abt-list', ...) 콜백 수정
window.electron.on('update-abt-list', (data: any) => {
  // 기존 리스트에 추가하거나 덮어쓰는 로직 (현재는 수신 시마다 덮어쓰도록 설계됨)
  setItems(data);
});
```

**Step 3: 동작 확인**

1. `npm run dev` 실행
2. 데이터 수신 후 전문가 판정 진행
3. 앱을 강제 종료 후 재실행
4. 기존 판정 내역 및 리스트가 유지되는지 확인

**Step 4: Commit**

```bash
git add src/renderer/store/useStore.ts src/renderer/App.tsx
git commit -m "feat: implement data persistence using zustand/persist"
```

---

### Task 2: 프로젝트 관리 기본 UI 추가 (저장/불러오기 시뮬레이션)

**Files:**
- Modify: `src/renderer/App.tsx`
- Modify: `src/renderer/styles/App.module.scss`

**Step 1: 상단 헤더에 프로젝트 이름 표시 및 초기화 버튼 추가**

```tsx
// src/renderer/App.tsx 내 레이아웃 상단
<header className={styles.topHeader}>
  <h1>ABT Desktop - {projectName}</h1>
  <button onClick={clearItems}>New Project (Clear)</button>
</header>
```

**Step 2: Commit**

```bash
git add src/renderer/App.tsx src/renderer/styles/App.module.scss
git commit -m "ui: add project management header"
```
