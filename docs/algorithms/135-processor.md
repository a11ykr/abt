# ABT-1.3.5-Processor: 콘텐츠 간의 구분 알고리즘 v1.0

### 🔗 WCAG 2.2 Reference
- **SC 1.4.5 Images of Text (Level AA)**: If the technologies being used can achieve the visual presentation, text is used to convey information rather than images of text.
- **SC 1.4.12 Text Spacing (Level AA)**: Content can be read without loss of content or functionality when line height, spacing, etc., are adjusted.

---

이 알고리즘은 지침 1.4.4(콘텐츠 간의 구분)를 준수하며, 텍스트 콘텐츠가 이미지 형태가 아닌 실제 텍스트로 제공되는지, 그리고 콘텐츠 간의 간격과 구분이 명확한지 진단한다.

## 1. 데이터 수집 단계 (Data Collection)
- **Image Analysis:** `alt` 값이 길거나 문장이 포함된 `img` 요소.
- **CSS Spacing:** `line-height`, `letter-spacing`, `word-spacing`, `margin`, `padding`.
- **Text Overlap:** 요소 간의 겹침 현상(Overflow/Overlap) 확인.

## 2. 분석 및 분류 로직 (Analysis Pipeline)

### [단계 A] 텍스트의 이미지화 검사 (WCAG 2.2 - 1.4.5)
- **Rule 1.1:** 이미지 내부에 많은 양의 텍스트가 포함되어 있는가? (OCR 또는 `alt` 분석)
  - 결과: **[수정 권고]** (실제 텍스트 마크업 및 CSS 스타일링 권장)

### [단계 B] 텍스트 간격 및 가독성 (WCAG 2.2 - 1.4.12)
- **Rule 2.1:** 줄 간격(`line-height`)이 글자 크기의 1.5배 미만인가?
- **Rule 2.2:** 자간(`letter-spacing`)이나 단어 간격(`word-spacing`)이 너무 좁은가?
  - 결과: **[수정 권고]**

### [단계 C] 콘텐츠의 시각적 구분
- **Rule 3.1:** 인접한 서로 다른 성격의 콘텐츠 블록 간에 시각적 구분(간격, 테두리, 배경색 차이 등)이 뚜렷한가?
  - 결과: **[검토 필요]**

## 3. 최종 상태 정의 (Final Status)
1. **오류:** 텍스트가 겹쳐서 읽을 수 없거나 기능이 마비된 경우.
2. **부적절:** 텍스트 이미지 사용이 과도하여 확대 시 깨짐 현상 발생.
3. **수정 권고:** 줄 간격, 자간 등이 권장 기준(WCAG AA)에 미달하여 가독성이 떨어지는 경우.
4. **검토 필요:** 텍스트 이미지 사용 여부 및 시각적 구분 적절성.
5. **적절:** 실제 텍스트 기반 마크업 및 가독성 좋은 간격 유지.
