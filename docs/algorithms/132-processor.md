# ABT-5.3.2-Processor: 콘텐츠의 선형구조 알고리즘 v1.0

### 🔗 WCAG 2.2 Reference
- **SC 1.3.2 Meaningful Sequence (Level A)**: When the sequence in which content is presented affects its meaning, a correct reading sequence can be programmatically determined.
- **SC 1.3.1 Info and Relationships (Level A)**: Information, structure, and relationships conveyed through presentation can be programmatically determined.

---

이 알고리즘은 **KWCAG 5.3.2(의미 있는 콘텐츠 순서)** 지침을 준수하며, 콘텐츠가 선형화(스크린 리더 등 보조공학기기 읽기 순서)되었을 때 논리적인 흐름을 유지하는지 진단한다. 특히 헤딩(Heading) 구조를 통한 정보의 계층적 선형화를 중점적으로 분석한다.

## 1. 데이터 수집 단계 (Data Collection)
- **DOM Order:** 문서 내 요소의 출현 순서 및 계층 구조.
- **Heading Outline:** `<h1>` ~ `<h6>` 요소의 순차적 리스트 및 텍스트.
- **Visual Position:** 각 요소의 `getBoundingClientRect()` 기반 좌표.
- **CSS Layout:** `flex-direction`, `grid`, `order`, `float`, `position`.

## 2. 분석 및 분류 로직 (Analysis Pipeline)

### [단계 A] 헤딩 계층을 통한 정보 흐름 검사 (Heading Linearization)
- **Rule 1.1 (논리적 개요 구성):** 
  - 헤딩 레벨이 DOM 순환 순서와 일치하며 정보의 깊이를 적절히 반영하는가?
  - 결과: `h1` -> `h3`와 같이 레벨을 건너뛰어 정보의 연결성이 끊긴 경우 **[부적절]**.
- **Rule 1.2 (헤딩 간 콘텐츠 부재):**
  - 헤딩만 나열되고 중간에 실제 콘텐츠(p, div 등)가 없는 구조적 비정상 상태 탐지.
  - 결과: **[수정 권고]**.

### [단계 B] 시각적-논리적 순서 불일치 검사
- **Rule 2.1 (순서 역전):** 
  - CSS `order` 또는 `flex-direction: reverse` 사용 여부.
  - 결과: **[검토 필요]**.
- **Rule 2.2 (좌표 기반 역전):** 
  - DOM 순서상 뒤에 있는 요소가 시각적으로 위에 배치된 경우.
  - 결과: **[부적절]**.

### [단계 C] 탭 순서 및 인터랙션 흐름
- **Rule 3.1 (Tabindex 양수값):** `tabindex > 0` 사용 시 **[오류]**.

## 3. 최종 상태 정의 (Final Status)
1. **오류:** 양수 `tabindex` 등 명백한 흐름 방해.
2. **부적절:** 시각적 순서와 마크업 순서의 역전, 헤딩 레벨 건너뛰기(Skip Level).
3. **수정 권고:** 헤딩만 있고 본문이 없는 구간, 불필요한 레이아웃 표 사용.
4. **검토 필요:** Flex/Grid 순서 변경, 동적 콘텐츠 삽입 시 흐름 변화.
5. **적절:** 헤딩 구조가 논리적이며 시각적 배치와 마크업 순서가 일치함.
