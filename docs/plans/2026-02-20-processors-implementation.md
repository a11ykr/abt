# Processor Implementation Plan (KWCAG 2.1 - 2.4)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** KWCAG 2.1(조작 편의성)부터 2.4(탐색 용이성)까지 설계된 알고리즘을 실제 엔진 프로세서로 구현하고, UI에 매핑합니다.

**Architecture:** 
- `src/engine/processors/` 폴더에 각 지침별 JS 파일을 생성합니다.
- `src/renderer/App.tsx`의 `guidelineNames`와 매핑하여 UI에서 올바른 명칭이 나오도록 합니다.
- `ABTCore.registerProcessor`를 통해 엔진에 등록합니다.

**Tech Stack:** JavaScript (ES6+), React (TypeScript)

---

### Task 1: 2.1.3 (조작 가능) 프로세서 구현

**Files:**
- Create: `src/engine/processors/Processor-2.1.3.js`

**Step 1: Processor-2.1.3.js 작성**
설계도(`docs/algorithms/213-processor.md`)에 따라 컨트롤 크기(24px) 및 복잡한 제스처를 감지합니다.

```javascript
class Processor213 {
  constructor() {
    this.id = "2.1.3";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const interactives = document.querySelectorAll('a, button, input, select, textarea, [role="button"], [role="link"]');
    const reports = [];

    for (const el of interactives) {
      const rect = el.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      
      // Rule 1.1: 최소 크기 (24x24)
      if (isVisible && (rect.width < 24 || rect.height < 24)) {
        // 인라인 링크 예외 처리 (간단히 부모 텍스트 흐름 확인)
        const isInline = window.getComputedStyle(el).display === 'inline';
        if (!isInline) {
          reports.push(this.createReport(el, "수정 권고", `컨트롤 크기가 작습니다(${Math.round(rect.width)}x${Math.round(rect.height)}px). 24x24px 이상을 권장합니다.`, ["Rule 1.1"]));
        }
      }

      // Rule 2.1: 복잡한 제스처 (드래그 등)
      if (el.hasAttribute('draggable') || el.onpointermove) {
        reports.push(this.createReport(el, "검토 필요", "복잡한 포인터 제스처가 감지되었습니다. 단일 클릭 대안이 있는지 확인하십시오.", ["Rule 2.1"]));
      }
    }
    return reports;
  }

  createReport(el, status, message, rules) {
    return {
      guideline_id: this.id,
      elementInfo: { tagName: el.tagName, selector: this.utils.getSelector(el) },
      context: { smartContext: this.utils.getSmartContext(el, 50) },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}
if (window.ABTCore) window.ABTCore.registerProcessor("2.1.3", new Processor213());
```

**Step 2: Commit**
```bash
git add src/engine/processors/Processor-2.1.3.js
git commit -m "feat: implement Processor 2.1.3 (Target Size)"
```

---

### Task 2: 2.3.1 (깜빡임과 번쩍임 제한) 프로세서 구현

**Files:**
- Create: `src/engine/processors/Processor-2.3.1.js`

**Step 1: Processor-2.3.1.js 작성**
설계도(`docs/algorithms/231-processor.md` v1.1)에 따라 위험 요소를 추출하여 전문가 검토를 안내합니다.

```javascript
class Processor231 {
  constructor() {
    this.id = "2.3.1";
    this.utils = window.ABTUtils;
  }

  async scan() {
    const reports = [];
    
    // 애니메이션 요소
    const all = document.querySelectorAll('*');
    for (const el of all) {
      const style = window.getComputedStyle(el);
      if (style.animationIterationCount === 'infinite') {
        reports.push(this.createReport(el, "검토 필요", "무한 반복 애니메이션이 탐지되었습니다. 번쩍임 위험이 있는지 확인하십시오.", ["Rule 1.1"]));
      }
    }

    // 미디어 요소
    const media = document.querySelectorAll('video[autoplay], img[src$=".gif"], img[src$=".apng"]');
    for (const el of media) {
      reports.push(this.createReport(el, "검토 필요", "자동 재생 미디어/동적 이미지가 존재합니다. 섬광 포함 여부를 확인하십시오.", ["Rule 2.1"]));
    }

    return reports;
  }

  createReport(el, status, message, rules) {
    return {
      guideline_id: this.id,
      elementInfo: { tagName: el.tagName, selector: this.utils.getSelector(el) },
      context: { smartContext: this.utils.getSmartContext(el, 50) },
      result: { status, message, rules },
      currentStatus: status,
      history: [{ timestamp: new Date().toLocaleTimeString(), status: "탐지", comment: message }]
    };
  }
}
if (window.ABTCore) window.ABTCore.registerProcessor("2.3.1", new Processor231());
```

**Step 2: Commit**
```bash
git add src/engine/processors/Processor-2.3.1.js
git commit -m "feat: implement Processor 2.3.1 (Flashing Guidance)"
```

---

### Task 3: UI 지침 명칭 업데이트

**Files:**
- Modify: `src/renderer/App.tsx`

**Step 1: guidelineNames 업데이트**
```typescript
const guidelineNames: Record<string, string> = {
  "ALL": "전체 지침",
  "1.1": "1.1 대체 텍스트",
  "1.2": "1.2 자막 제공",
  "2.1.1": "2.1.1 키보드 사용",
  "2.1.3": "2.1.3 조작 가능",
  "2.3.1": "2.3.1 번쩍임 제한",
  "2.4.1": "2.4.1 건너뛰기 링크",
  "2.4.2": "2.4.2 제목 제공",
  "2.4.3": "2.4.3 링크 텍스트"
};
```

**Step 2: Commit**
```bash
git add src/renderer/App.tsx
git commit -m "ui: update guideline names mapping"
```
