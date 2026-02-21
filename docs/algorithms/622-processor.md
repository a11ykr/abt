# ABT-6.2.2-Processor: 정지 기능 제공 알고리즘 v1.0

### 🔗 WCAG 2.2 Reference
- **SC 2.2.2 Pause, Stop, Hide (Level A)**: For moving, blinking, scrolling, or auto-updating information, there is a mechanism for the user to pause, stop, or hide it.

---

이 알고리즘은 **KWCAG 6.2.2(정지 기능 제공)** 지침을 준수하며, 자동으로 변경되는 콘텐츠(슬라이드, 롤링 등)를 사용자가 제어할 수 있는지 진단한다.

## 1. 데이터 수집 단계 (Data Collection)
- **Moving Elements:** CSS 애니메이션(`infinite`), `setTimeout/setInterval` 기반 위치 이동 요소.
- **Auto-updating:** 정기적인 API 호출을 통한 콘텐츠 갱신(주가, 뉴스 등).
- **Control Buttons:** "정지", "일시정지", "Pause", "Stop", "||" 기호를 포함한 버튼.
- **Event Handlers:** `mouseenter`, `focus` 시 애니메이션 정지 로직 포함 여부.

## 2. 분석 및 분류 로직 (Analysis Pipeline)

### [단계 A] 자동 변경 콘텐츠 탐지
- **Rule 1.1:** 5초 이상 지속적으로 위치나 내용이 변하는 요소 탐지.
  - 결과: **[검토 필요]**.

### [단계 B] 제어 수단 검증
- **Rule 2.1 (물리적 버튼):** 인접 영역에 명확한 정지 버튼이 있는가?
- **Rule 2.2 (인터랙션 정지):** 마우스 오버나 키보드 초점 획득 시 움직임이 멈추는가?
  - 결과: 버튼 부재 시 **[부적절]** 또는 **[오류]**.

## 3. 최종 상태 정의 (Final Status)
1. **오류:** 5초 이상 자동 변경되는데 어떠한 제어 수단도 없는 경우.
2. **부적절:** 제어 수단은 있으나 키보드 접근이 불가하거나 인지하기 매우 어려운 경우.
3. **검토 필요:** 5초 미만의 짧은 움직임 또는 자동 갱신 주기가 긴 경우.
4. **적절:** 명확한 제어 버튼과 함께 마우스 오버/초점 시 정지 기능이 제공됨.
