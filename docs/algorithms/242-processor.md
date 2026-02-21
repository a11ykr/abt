# ABT-2.4.2-Processor: 제목 제공 알고리즘 v1.0

### 🔗 WCAG 2.2 Reference
- **SC 2.4.2 Page Titled (Level A)**: Web pages have titles that describe topic or purpose.
- **SC 4.1.2 Name, Role, Value (Level A)**: For all user interface components... the name and role can be programmatically determined. (Frames/Iframes context)
- **SC 1.3.1 Info and Relationships (Level A)**: Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.

---

이 알고리즘은 **KWCAG 2.4.2(제목 제공)** 지침을 준수하며, 페이지, 프레임, 콘텐츠 블록에 해당 내용을 요약한 적절한 제목이 제공되는지 진단한다. 특히 헤딩 구조를 통해 콘텐츠의 논리적 계층(선형화 연계)을 분석한다.

## 1. 데이터 수집 단계 (Data Collection)
- **Page Title:** `document.title` 값 추출.
- **Frame Titles:** 모든 `<iframe>`, `<frame>` 요소의 `title` 속성 존재 여부 및 값 추출.
- **Heading Tree:** 페이지 내 모든 `<h1>` ~ `<h6>` 요소를 DOM 순서대로 수집 (텍스트, 레벨, 셀렉터 포함).
- **Context:** URL 경로명 및 부모 요소의 의미적 맥락.

## 2. 분석 및 분류 로직 (Analysis Pipeline)

### [단계 A] 페이지 제목 검사 (Page Title)
- **Rule 1.1 (존재 여부):** `<title>` 태그 부재 시 **[오류]**.
- **Rule 1.2 (기본값 방치):** "Untitled", "index.html", "새 탭" 등 의미 없는 값인 경우 **[부적절]**.
- **Rule 1.3 (중복 제목):** 사이트 내 여러 페이지가 동일한 제목인 경우 **[수정 권고]**.

### [단계 B] 프레임 제목 검사 (Frame Title)
- **Rule 2.1 (속성 누락):** `<iframe>`에 `title` 속성이 아예 없는 경우 **[오류]**.
- **Rule 2.2 (빈 속성값):** `title=""`와 같이 속성은 있으나 값이 비어있는 경우 **[검토 필요]**.
- **Rule 2.3 (무의미한 제목):** 제목이 "iframe", "프레임", "내용" 등 용도를 알 수 없는 경우 **[부적절]**.

### [단계 C] 헤딩 트리 및 계층 구조 (Heading Tree & Hierarchy)
- **Rule 3.1 (H1 부재):** 페이지 내 `<h1>`이 하나도 없는 경우 **[수정 권고]**.
- **Rule 3.2 (계층 위반 - Skip Level):** `<h1>` 다음에 바로 `<h3>`가 오는 등 논리적 위계를 건너뛴 경우 **[부적절]**.
  - *선형화 연계:* 이는 콘텐츠의 의미 있는 순서(1.3.2)에도 영향을 미침.
- **Rule 3.3 (트리 시각화):** 수집된 헤딩을 바탕으로 `Context` 영역에 트리 구조 데이터를 생성하여 전달.

## 3. 최종 상태 정의 (Final Status)
1. **오류:** 페이지 제목 누락, 프레임 `title` 속성 누락.
2. **부적절:** 의미 없는 제목(기본값), 프레임 용도 불명, 헤딩 계층 위반(Skip Level).
3. **검토 필요:** 프레임 `title` 값이 비어있어 전문가의 판단이 필요한 경우.
4. **수정 권고:** 페이지 간 중복 제목, 본문 내 `<h1>` 부재.
5. **적절:** 페이지 및 모든 프레임에 고유하고 서술적인 제목이 있으며, 헤딩 구조가 논리적임.
