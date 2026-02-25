# ABT-2.4.4-Processor: 고정된 참조 위치 정보 v0.10

### 🔗 References
- KWCAG 2.2: 2.4.4 고정된 참조 위치 정보
- WCAG 2.2: 2.4.11 Focus Not Obscured (Minimum) (AA) (Reference)

---

이 알고리즘은 **KWCAG 2.4.4(고정된 참조 위치 정보)** 지침을 준수하며, 키보드 초점(Focus)을 받은 요소가 상단 고정 헤더(Sticky Header)나 하단 푸터 등에 의해 가려지지 않는지 진단한다.

## 1. 데이터 수집 단계 (Data Collection)
- **Focusable Elements:** 모든 초점 획득 가능 요소의 위치(`getBoundingClientRect`).
- **Sticky Elements:** `position: fixed` 또는 `position: sticky` 속성을 가진 요소의 위치 및 불투명도.

## 2. 분석 및 분류 로직 (Analysis Pipeline)

### [단계 A] 요소 겹침 분석 (Overlap Detection)
- **Rule 1.1:** 현재 초점을 가진 요소의 영역이 고정된 레이어와 시각적으로 겹치는가?
  - 결과: 겹침 발생 시 **[검토 필요]**.
  - 가이드: "포커스된 요소가 고정 영역에 의해 가려질 가능성이 있습니다. 키보드 접근 시 해당 요소가 자동으로 스크롤되어 시각적으로 노출되는지 확인하세요."

## 3. 최종 상태 정의 (Final Status)
1. **검토 필요:** 고정 영역과 초점 요소의 위치 충돌이 감지됨.
2. **적절:** 가려짐 현상이 없거나, 스크롤 보정을 통해 포커스 위치가 명확히 보임.
3. **N/A:** 페이지 내에 `fixed` 또는 `sticky` 요소가 없음.
