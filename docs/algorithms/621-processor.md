# ABT-6.2.1-Processor: 응답시간 조절 알고리즘 v1.0

### 🔗 WCAG 2.2 Reference
- **SC 2.2.1 Timing Adjustable (Level A)**: For each time limit that is set by the content, the user is allowed to turn off, adjust, or extend the limit.

---

이 알고리즘은 **KWCAG 6.2.1(응답 시간 조절)** 지침을 준수하며, 세션 타임아웃이나 자동 새로고침 등 시간 제한이 있는 기능을 사용자가 제어할 수 있는지 진단한다.

## 1. 데이터 수집 단계 (Data Collection)
- **Meta Refresh:** `<meta http-equiv="refresh">` 태그의 `content` 속성 분석.
- **JS Timers:** `setTimeout`, `setInterval` 함수 호출 및 전달된 지연 시간(ms).
- **Navigation Cues:** 타이머 핸들러 내의 `location.href`, `location.reload()`, `window.close()` 등 페이지 상태 변화 코드.
- **UI Elements:** "연장", "다시 시도", "Renew", "Extend" 등의 키워드를 포함한 버튼이나 링크.

## 2. 분석 및 분류 로직 (Analysis Pipeline)

### [단계 A] 정적 시간 제한 탐지 (Static Limits)
- **Rule 1.1:** `meta refresh` 태그가 존재하고 `content` 값이 0보다 큰 경우.
  - **판정**: **[검토 필요]**.
  - **가이드**: "자동 새로고침 또는 리다이렉트가 감지되었습니다. 사용자가 이를 중단하거나 시간을 연장할 수 있는 옵션이 제공되는지 확인하십시오."

### [단계 B] 동적 시간 제한 및 행동 분석 (Dynamic Limits)
- **Rule 2.1 (위험 타이머):** 
  - `setTimeout/setInterval`의 지연 시간이 **20초 이상**이고, 콜백 내에서 **페이지 전환(Navigation)**이나 **세션 종료** 관련 동작이 발견된 경우.
  - 결과: **[부적절]** (연장 수단이 함께 발견되지 않을 시).
- **Rule 2.2 (일반 타이머):** 
  - 1분 이상의 장기 타이머가 감지되었으나 구체적인 동작을 기계가 확정할 수 없는 경우.
  - 결과: **[검토 필요]**.

### [단계 C] 제어 수단 검사 (Control Mechanism)
- **Rule 3.1:** 시간 제한 요소 근처에 "시간 연장" 기능을 수행하는 인터랙티브 요소가 있는가?
  - 존재 시: **[적절]**.
  - 부재 시: **[오류]** (경고 메시지 없이 세션이 종료될 위험).

## 3. 최종 상태 정의 (Final Status)
1. **오류:** 예고 없이 세션이 종료되거나 새로고침되는 등 제어 수단이 전무한 시간 제한.
2. **부적절:** 시간 제한은 있으나 조절 기능이 표준 방식이 아니거나 인지하기 어려운 경우.
3. **검토 필요:** 기계적으로 의도를 파악하기 어려운 JS 타이머 및 메타 새로고침 구간.
4. **적절:** 충분한 경고와 함께 시간을 연장하거나 중단할 수 있는 명확한 수단 제공.
