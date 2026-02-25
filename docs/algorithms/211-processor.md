# ABT-6.1.1-Processor: 키보드 사용 보장 알고리즘 v1.0

### 🔗 WCAG 2.2 Reference
- **SC 2.1.1 Keyboard (Level A)**: All functionality of the content is operable through a keyboard interface without requiring specific timings for individual keystrokes.

---

이 알고리즘은 **KWCAG 6.1.1(키보드 사용 보장)** 지침을 준수하며, 모든 기능은 마우스 없이 키보드만으로도 사용할 수 있는지 진단한다. 특히 복잡한 위젯 및 잠재적 유령 코드에 대한 정교한 분류 체계를 가진다.

## 1. 데이터 수집 단계 (Data Collection)
- **Interactive Triggers:** `click`, `mousedown`, `mouseup`, `mouseenter`, `mouseover` 등 마우스 전용 이벤트 리스너 등록 여부.
- **Keyboard Handlers:** `keydown`, `keyup`, `keypress`, `focus` 이벤트 등록 여부.
- **Semantic/Aria:** `tabindex`, `role`, `aria-modal`, `aria-haspopup`.
- **Visibility Status:** `ComputedStyle` (display, visibility, opacity, geometry) 기반 가시성 판정.

## 2. 분석 및 분류 로직 (Analysis Pipeline)

### [단계 A] 가짜 대화형 요소 탐지 (Non-standard Controls)
- **Rule 1.1:** `div`, `span` 등 비대화형 요소에 `click` 리스너가 있으나 `tabindex="0"` 또는 `role="button"`이 누락된 경우.
  - 결과: **[오류]**.

### [단계 B] 이벤트 짝 맞춤 및 조작 대안 검사
- **Rule 2.1 (Event Pairing):** 마우스 전용 이벤트가 사용된 요소에 동등한 키보드 이벤트(Enter/Space 처리)가 없는 경우.
  - 결과: **[부적절]**.
- **Rule 2.2 (Complex Interaction):** 드래그 앤 드롭, 슬라이더, 무한 스크롤 등 복잡한 조작 인터랙션 감지 시.
  - 결과: 무조건 **[검토 필요]**.

### [단계 C] 모달 및 오버레이 정밀 진단
- **Rule 3.1 (모달 탐지):** 시맨틱 속성(`role="dialog"`) 또는 시각적 특징(중앙 배치, 고정 위치, 최상위 z-index)을 통한 오버레이 탐지.
- **Rule 3.2 (상태별 리포팅 - 유령 코드 대응):**
  - **Active (가시적):** 즉시 **[검토 필요]** 리포트 생성 (초점 가둠, Esc 닫기 확인 필수).
  - **Inactive (숨겨진):** **[확인 필요(잠재적)]** 리포트 생성. "현재 숨겨져 있으나 나타날 때 접근성 확인 필요" 명시.

## 3. 최종 상태 정의 (Final Status)
1. **오류:** 키보드 접근성 완전 차단 (tabindex 누락, aria-hidden 오류 등).
2. **부적절:** 조작은 가능하나 표준 방식이 아니거나 시각적 단서가 부족함.
3. **수정 권고:** 더 나은 키보드 경험(예: 단축키 제공)을 위한 개선 사항.
4. **검토 필요:** 복잡한 인터랙션, 모달 제어 로직, 잠재적 유령 코드.
5. **적절:** 모든 기능에 대해 키보드 대안이 명확하게 제공됨.
