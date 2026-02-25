# ABT-6.1.2-Processor: 초점 이동과 표시 알고리즘 v1.0

### 🔗 WCAG 2.2 Reference
- **SC 2.4.1 Bypass Blocks (Level A)**: A mechanism is available to bypass blocks of content that are repeated on multiple Web pages.
- **SC 2.4.3 Focus Order (Level A)**: Focusable components receive focus in an order that preserves meaning and operability.
- **SC 2.4.7 Focus Visible (Level AA)**: Keyboard focus indicator is visible.
- **SC 2.4.11 Focus Appearance (Minimum) (Level AA)**: Focus indicators have sufficient contrast (3:1).

---

이 알고리즘은 **KWCAG 6.1.2(초점 이동과 표시)** 지침을 준수하며, 건너뛰기 링크의 유무와 초점 이동의 논리성, 시각적 명확성을 진단한다.

## 1. 데이터 수집 단계 (Data Collection)
- **Skip Links:** DOM 상단 1~3번째 요소 중 내부 ID로 연결되는 링크 검색.
- **Focus Path Data:** 모든 초점 가능 요소의 Index와 `getBoundingClientRect()` 좌표.
- **Visual Styles:** `:focus` 상태의 `outline`, `box-shadow` 및 배경색 대비비.

## 2. 분석 및 분류 로직 (Analysis Pipeline)

### [단계 A] 건너뛰기 링크 검사 (Skip Navigation)
- **Rule 1.1 (존재성):** "본문 바로가기" 등 핵심 키워드를 포함한 링크가 상단에 존재하는가?
- **Rule 1.2 (기능성 - 전문가 수동 검사):** "본문 바로가기" 링크가 초점(Focus)을 받았을 때 화면에 표시되며, **클릭 시 타겟 요소로 `activeElement`가 정확히 이동하는지 전문가가 수동으로 확인해야 한다.**
  - **ABT 엔진 역할**: 링크의 존재 및 타겟 요소의 유효성을 정적으로 확인하고, 전문가가 링크를 클릭했을 때 `activeElement`의 변화를 추적하여 보고.
  - **결과**: 전문가 판정 결과 미작동 시 **[오류]**.

### [단계 B] 초점 이동 순서 및 시각화 (Focus Order)
- **Rule 2.1 (순서 일관성):** DOM 순서와 시각적 좌표(Center Y, X)를 대조. 
  - 50px 이상의 역전 발생 시 **[검토 필요]**.
- **Rule 2.2 (시각화 모듈 연동):** 전문가가 토글 시 화면에 번호와 이동 경로 화살표 오버레이 생성.

### [단계 C] 초점 표시 가시성 및 가시 영역 (Focus Visible)
- **Rule 3.1 (대비):** 초점 표시(Outline 등)와 배경의 명암비가 3:1 미만인가? → **[부적절]**.
- **Rule 3.2 (보이지 않는 초점):** 요소가 화면 밖이나 숨겨진 레이어에 있어 초점을 확인 불가한가? → **[오류]**.

## 3. 최종 상태 정의 (Final Status)
1. **오류:** 건너뛰기 링크 미작동, 양수 tabindex 사용, 보이지 않는 요소에 초점 발생.
2. **부적절:** 초점 표시 대비가 3:1 미만이거나 아웃라인이 제거됨.
3. **수정 권고:** 이동 순서가 시각적 배치와 미세하게 다르거나, 더 명확한 초점 스타일링이 필요한 경우.
4. **검토 필요:** 복잡한 레이아웃에서의 이동 순서 및 커스텀 초점 시각화 구간.
5. **적절:** 논리적 이동 순서 보장, 충분한 대비를 가진 초점 표시, 작동하는 건너뛰기 링크 제공.
