# ABT-2.1.2-Processor: 초점 이동과 표시 v0.11

### 🔗 References
- KWCAG 2.2: 2.1.2 초점 이동과 표시
- WCAG 2.2: 2.4.3 Focus Order (A) (Reference)

---

이 알고리즘은 **KWCAG 2.1.2(초점 이동과 표시)** 지침을 준수하며, 초점 이동의 논리성(`tabindex`)과 시각적 명확성(`outline` 가시성 및 명도 대비)을 집중적으로 진단한다. 건너뛰기 링크 관련 검사는 본 지침에서 제외된다.

## 1. 데이터 수집 단계 (Data Collection)
- **Focusable Elements:** 모든 대화형 요소 (`a`, `button`, `input` 등) 및 `tabindex`가 적용된 요소.
- **Visual Styles:** 요소의 `outline-style`, `outline-width`, `outline-color` 및 배경색 대비비.

## 2. 분석 및 분류 로직 (Analysis Pipeline)

### [단계 A] 초점 이동 순서 (Focus Order)
- **Rule 1.1 (양수 Tabindex):** `tabindex="1"` 등 양수값이 설정되어 문서의 자연스러운 초점 이동 순서를 강제로 변경하는가?
  - 결과: **[수정 권고]** (DOM 구조 조정을 통한 순서 보장 권장)

### [단계 B] 초점 표시 가시성 (Focus Visible)
- **Rule 2.1 (아웃라인 제거):** `:focus` 시 적용되어야 할 `outline`이 CSS(`outline: none`, `outline-width: 0`)로 제거되었는가?
  - 결과: 대체 시각 장치(box-shadow 등)가 없을 경우 **[수정 권고]**.
- **Rule 2.2 (명도 대비):** 초점 표시(Outline 등)와 인접 배경의 명암비가 3:1 미만인가? (WCAG 2.2 2.4.13 Focus Appearance (Minimum))
  - 결과: **[검토 필요]**.

## 3. 최종 상태 정의 (Final Status)
1. **오류:** 보이지 않는 요소에 초점이 맺힘.
2. **검토 필요:** 초점 표시의 명도 대비가 3:1 미만이거나 커스텀 스타일이 적용되어 확인이 필요한 경우.
3. **수정 권고:** `outline: none`으로 초점 표시가 완전히 제거되었거나, 양수 `tabindex`가 사용된 경우.
4. **적절:** 논리적 이동 순서(DOM 순서)가 보장되며, 충분한 대비를 가진 초점 표시가 시각적으로 제공됨.
