# ABT-2.1.1-Processor: 키보드 사용 보장 v0.11

### 🔗 References
- KWCAG 2.2: 2.1.1 키보드 사용 보장
- WCAG 2.2: 2.1.1 Keyboard (A) (Reference)

---

이 알고리즘은 **KWCAG 2.1.1(키보드 사용 보장)** 지침을 준수하며, 모든 기능을 마우스 없이 키보드만으로도 수행할 수 있는지 진단한다. 특히 비표준 이벤트 핸들러가 사용된 요소의 접근성을 집중 분석한다.

## 1. 데이터 수집 단계 (Data Collection)
- **Interactive Triggers:** `click`, `mousedown`, `mouseup` 등 마우스 전용 이벤트 리스너 등록 여부.
- **Keyboard Handlers:** `keydown`, `keyup`, `keypress`, `focus` 이벤트 등록 여부.
- **Semantic/Aria:** `tabindex`, `role`, `aria-modal`.

## 2. 분석 및 분류 로직 (Analysis Pipeline)

### [단계 A] 비표준 대화형 요소 탐지 (Non-standard Controls)
- **Rule 1.1 (Focus Accessibility):** `div`, `span` 등 비대화형 요소에 `click` 리스너가 있으나 `tabindex="0"`이 누락되어 키보드 접근이 불가능한 경우.
  - 결과: **[오류]**.
- **Rule 1.2 (Semantic Role):** 키보드 포커스는 가능하나(`tabindex="0"`), 요소의 역할(`role="button"` 등)이 명시되지 않아 보조기술 사용자가 용도를 파악하기 어려운 경우.
  - 결과: **[수정 권고]**.

### [단계 B] 이벤트 짝 맞춤 검사 (Event Pairing)
- **Rule 2.1:** 마우스 전용 이벤트가 사용된 요소에 동등한 키보드 이벤트(Enter/Space 처리)가 누락되어 키보드로 기능을 실행할 수 없는 경우.
  - 결과: **[검토 필요]** (브라우저 상에서 동적으로 등록된 리스너 판별을 위해 수동 확인 권고).

### [단계 C] 모달 대화상자 정밀 진단 (Modal Dialogs)
- **Rule 3.1 (Modal Exit):** `role="dialog"` 또는 `aria-modal="true"`가 적용된 요소 내부에 명확한 닫기 수단이 있는지, 그리고 초점 가둠(Focus Trap)이 구현되어 있는지 확인한다.
  - 결과: **[검토 필요]** (보조공학기기 사용자가 해당 영역을 안전하게 빠져나올 수 있는지 전문가의 동작 검증 필수).

## 3. 최종 상태 정의 (Final Status)
1. **오류:** 키보드 접근성 완전 차단 (tabindex 누락 등).
2. **검토 필요:** 마우스 이벤트만 감지되어 키보드 작동 여부 확인이 필요한 요소.
3. **수정 권고:** 접근은 가능하나 의미 전달(role)이 누락되었거나 탭 순서가 부자연스러운 경우.
4. **적절:** 모든 기능에 대해 키보드 조작 수단이 명확하게 제공됨.

> **참고:** 드래그 앤 드롭, 슬라이더 등 복잡한 제스처의 단일 포인터 대체 수단 여부는 **2.5.1(단일 포인터 입력 지원)** 지침에서 중점적으로 다룹니다.
