# ABT-6.1.4-Processor: 문자 단축키 알고리즘 v1.0

### 🔗 WCAG 2.2 Reference
- **SC 2.1.4 Character Key Shortcuts (Level A)**: If a keyboard shortcut is implemented using only printable character keys, then at least one of the following is true: (1) Turn off, (2) Remap, (3) Active only on focus.

---

이 알고리즘은 **KWCAG 6.1.4(문자 단축키)** 지침을 준수하며, 특수키 조합 없는 단일 문자 단축키에 대한 제어 수단 제공 여부를 진단한다. 기계적 분석의 한계를 고려하여 **"예외 처리 존재 여부와 상관없이 감지 시 무조건 전문가 검토를 요청"**하는 것을 원칙으로 한다.

## 1. 데이터 수집 단계 (Data Collection)
- **Keyboard Listeners:** `window`, `document`, 또는 특정 컨테이너에 등록된 `keydown`, `keyup`, `keypress` 핸들러 전수 조사.
- **Event Properties:** 핸들러 내에서 `ctrlKey`, `altKey`, `metaKey` 필터링 여부 분석.
- **Input Guards:** 핸들러 코드 내에 `document.activeElement.tagName`이 `INPUT`, `TEXTAREA`, `SELECT` 등인지 체크하는 방어 로직 검색.

## 2. 분석 및 분류 로직 (Analysis Pipeline)

### [단계 A] 위험 단축키 탐지 (Single Character Key Detection)
- **Rule 1.1 (조합키 부재):** 
  - 핸들러가 `ctrl`, `alt`, `meta` 키 체크 없이 특정 문자에 반응하는가?
  - **Shift 포함:** `Shift` + `Key` 조합(예: '?')도 단독 문자로 간주하여 검사 대상에 포함함.
- **Rule 1.2 (입력창 방어 로직):**
  - 코드 내에 `activeElement`의 태그명을 체크하여 입력을 방해하지 않도록 설계된 '가드(Guard)' 로직이 있는지 확인.
  - **판정**: 가드 로직이 있더라도 **[검토 필요]** 리포팅 (전문가가 실제 충돌 여부 최종 확인).

### [단계 B] 제어 수단 및 비동기 호출 (Control Mechanism)
- **Rule 2.1 (제어 수단 탐색):** 
  - 설정 메뉴 내 단축키 관련 키워드("끄기", "설정", "Shortcuts") 탐색.
- **판정 정책**: 제어 수단은 API 호출이나 비동기 로직으로 처리될 가능성이 높으므로, 기계가 "없다"고 단정하지 않고 **무조건 [검토 필요]** 상태로 전문가에게 위임함.

## 3. 최종 상태 정의 (Final Status)
1. **오류:** (명백히 텍스트 입력과 충돌하거나 조작이 불가능한 구조적 결함)
2. **검토 필요:** 
   - **가드 로직 포함**: 입력창 방어 코드가 있으나 전문가의 최종 사용성 확인이 필요한 경우.
   - **제어 수단 미확인**: 비동기 호출 등의 가능성을 염두에 두고 전문가의 직접 확인이 필요한 경우.
   - **Shift 조합 포함**: 모든 형태의 단일 문자 단축키 시도.
3. **적절:** 단축키가 없거나 모든 단축키가 명확하게 특수 조합키(Ctrl 등)를 필수로 함.
