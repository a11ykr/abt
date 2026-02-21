# ABT-1.3.1-Processor: 색에 무관한 콘텐츠 인식 알고리즘 v1.0

### 🔗 WCAG 2.2 Reference
- **SC 1.4.1 Use of Color (Level A)**: Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.

---

이 알고리즘은 지침 1.4.1(색상 활용)을 준수하며, 정보의 전달, 동작의 지시, 응답의 유도 또는 시각적 요소의 구분이 오직 색상만으로 이루어지지 않는지 진단한다.

## 1. 데이터 수집 단계 (Data Collection)
- **Visual Styles:** 요소의 `color`, `background-color`, `border-color`.
- **States:** `:hover`, `:focus`, `:active` 시의 색상 변화.
- **Content:** 요소 내 텍스트, 아이콘(`svg`, `img`, `font-icon`), 밑줄(`text-decoration`).

## 2. 분석 및 분류 로직 (Analysis Pipeline)

### [단계 A] 링크 구분 검사 (Link Distinction)
- **Rule 1.1:** 본문 내 링크(`<a>`)가 주변 텍스트와 오직 색상만으로 구분되는가?
  - 조건: `text-decoration: none`이면서 배경색 변화나 테두리 등 다른 시각적 장치가 없는 경우.
  - 결과: **[부적절]** (명암비가 3:1 이상이더라도 밑줄 등 추가 단서 권장)

### [단계 B] 상태 표시 검사 (Status Indication)
- **Rule 2.1:** 선택된 탭, 활성화된 입력창 등의 상태 변화가 색상 변경으로만 나타나는가?
  - 예: 선택 시 글자색만 빨간색으로 변하고 굵기나 밑줄 변화가 없는 경우.
  - 결과: **[부적절]**

### [단계 C] 폼 유효성 검사 (Form Validation)
- **Rule 3.1:** 입력 오류 발생 시 테두리 색상만 빨간색으로 변하고 오류 메시지나 아이콘이 없는가?
  - 결과: **[오류]**

## 3. 최종 상태 정의 (Final Status)
1. **오류:** 색상 외에 어떠한 추가 단서도 없는 상태 표시.
2. **부적절:** 색상 의존도가 높고 다른 시각적 장치가 보조적으로만 존재하는 경우.
3. **수정 권고:** 색상과 함께 다른 장치가 있으나 가독성이나 인지도가 낮은 경우.
4. **검토 필요:** 색상 변화가 감지되는 모든 UI 인터랙션.
5. **적절:** 색상 외에도 형태, 텍스트, 패턴 등을 통해 정보를 중복 전달함.
