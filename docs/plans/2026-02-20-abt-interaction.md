# ABT Desktop 검수 카드 상세 인터랙션 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** QA가 진단 항목에 대해 전문가 판정을 내리고 사유를 기록/수정할 수 있는 인터랙션 구현

**Architecture:** React 상태 기반의 조건부 렌더링 및 히스토리 관리 로직

**Tech Stack:** React, Lucide React, Tailwind CSS

---

### Task 1: 판정 상태 및 히스토리 데이터 모델 정의

**Files:**
- Modify: `src/renderer/App.tsx`

**Step 1: 데이터 구조 확장**
- 각 항목(`item`)에 `currentStatus`, `finalComment`, `history` 배열을 포함하도록 초기화 로직 수정

**Step 2: Commit**
```bash
git add src/renderer/App.tsx
git commit -m "feat: extend data model for QA judgement and history"
```

---

### Task 2: 검수 카드 UI 고도화 (판정 버튼 및 입력창)

**Files:**
- Modify: `src/renderer/App.tsx`

**Step 1: 판정 버튼 그룹 추가**
- `적절함 확인`, `개선 권고 요청`, `수정 요청` 버튼 배치

**Step 2: 사유 입력창 및 퀵 칩(Quick Chips) 구현**
- 버튼 클릭 시 나타나는 상세 입력 영역 구현

**Step 3: Commit**
```bash
git add src/renderer/App.tsx
git commit -m "feat: add judgement buttons and feedback input to card UI"
```

---

### Task 3: 판정 로직 및 히스토리 기록 기능 구현

**Files:**
- Modify: `src/renderer/App.tsx`

**Step 1: 판정 처리 함수 작성**
- 버튼 클릭 시 `currentStatus`를 업데이트하고 `history`에 기록을 추가하는 로직 구현

**Step 2: [수정] 버튼 인터랙션 구현**
- 판정이 완료된 후에도 언제든지 다시 수정할 수 있는 전환 로직 구현

**Step 3: Commit**
```bash
git add src/renderer/App.tsx
git commit -m "feat: implement judgement processing and history logging"
```

---

### Task 4: 상세 속성 패널(오른쪽) 연동

**Files:**
- Modify: `src/renderer/App.tsx`

**Step 1: 카드 선택 상태 관리**
- 특정 카드를 클릭했을 때 해당 항목의 상세 데이터와 히스토리 타임라인을 오른쪽 패널에 표시

**Step 2: Commit**
```bash
git add src/renderer/App.tsx
git commit -m "feat: connect property panel to selected card data"
```
