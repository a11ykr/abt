# ABT-4.1.1-Processor: 마크업 오류 방지 v0.11

### 🔗 References
- KWCAG 2.2: 4.1.1 마크업 오류 방지
- WCAG 2.2: 4.1.1 Parsing (Deprecated) (A) (Reference)

---

이 알고리즘은 **KWCAG 4.1.1(마크업 오류 방지)** 지침을 준수하며, 웹 페이지의 HTML 마크업에 표준을 위반하는 치명적인 오류(태그 중첩 오류, 속성 중복 선언, ID 중복 등)가 없는지 진단한다. 경미한 경고성 오류보다는 보조기술의 해석에 직접적인 영향을 미치는 주요 오류를 중심으로 진단한다.

## 1. 대상 식별 및 데이터 수집 (Data Collection)

### [대상 요소 추출]
- 페이지 전체의 HTML 문서(`document.documentElement.outerHTML`).
- 브라우저의 DOM 파서가 생성한 유효한 DOM 트리.

### [오류 정보 파악]
- HTML 유효성 검사기(`document.implementation.createDocumentType` 또는 외부 라이브러리)를 통한 파싱 오류.
- `document.querySelectorAll('[id]')`를 통해 모든 ID 속성값 추출.
- `element.attributes`를 통해 모든 요소의 속성 추출.

## 2. 분석 및 분류 로직 (Analysis Pipeline)

### [단계 A] 중복 ID 속성 검사
- **Rule 1.1:** `document.querySelectorAll('[id]')`로 추출된 모든 `id` 속성값 중 중복되는 값이 존재하는가?
  - 결과: 중복 ID 발견 시 **[오류]**.

### [단계 B] 속성 중복 선언 검사
- **Rule 2.1:** `element.attributes`를 통해 각 요소의 속성을 분석했을 때, 동일한 속이름(예: `<div class="a" class="b">`)이 중복 선언된 경우가 존재하는가?
  - 결과: 속성 중복 선언 발견 시 **[오류]**.

### [단계 C] 태그 열고 닫음 및 중첩 오류 (브라우저 파서 기반)
- **Rule 3.1:** 브라우저의 DOM 파서는 기본적으로 잘못된 HTML을 자동으로 보정하므로, 자바스크립트를 통해 DOM을 분석했을 때 비정상적인 트리 구조(예: `<p><div></p></div>`와 같은 중첩)를 간접적으로 감지한다.
  - **ABT 엔진 역할**: `element.contains(otherElement)`나 `element.parentNode` 등을 통해 부모-자식 관계가 논리적으로 모순되는 경우를 탐지.
  - 결과: 논리적 모순이 있는 중첩 구조 감지 시 **[부적절]**. (브라우저가 보정했더라도 원본 마크업의 문제).

## 3. 최종 상태 정의 (Final Status)
1. **오류 (Error):**
   - HTML `id` 속성 중복.
   - HTML 속성 중복 선언.
2. **부적절 (Warning):**
   - 브라우저가 자동 보정한, 논리적으로 잘못된 태그 중첩 구조.
3. **검토 필요 (Review):**
   - HTML5 유효성 검사기(W3C Validator 등)와 같이 완벽한 구문 검사가 필요한 경우. ABT 엔진은 주요 오류만 탐지하며, 전체적인 유효성 검사는 외부 도구 또는 전문가의 추가 검사를 권고.
4. **적절 (Pass):**
   - 탐지된 주요 마크업 오류가 없음.
