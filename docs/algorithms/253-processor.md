# ABT-2.5.3-Processor: 레이블과 네임 v0.20

### 🔗 References
- KWCAG 2.2: 2.5.3 레이블과 네임
- WCAG 2.2: 2.5.3 Label in Name (A) (Reference)
- W3C AccName 1.2: Text Alternative Computation

---

이 알고리즘은 사용자가 눈으로 보는 **시각적 레이블(Visible Label)**과 스크린 리더 등 보조공학기기가 인식하는 **프로그램적 네임(Accessible Name)** 간의 일치성을 진단합니다. 음성 제어 사용자가 화면에 보이는 텍스트를 말했을 때, 요소가 정확히 활성화될 수 있도록 보장하는 것이 목적입니다.

## 1. 대상 식별 및 데이터 수집 (Data Collection)

### [대상 요소 추출 (Target Elements)]
- `a`, `button`, `label` 요소.
- 입력 컨트롤 중 텍스트가 시각적으로 노출되는 요소: `input[type="button"]`, `input[type="submit"]`, `input[type="reset"]`
- 역할이 지정된 대화형 요소: `[role="button"]`, `[role="link"]`
- **제외 (Exceptions)**: 
  - 시각적으로 보이는 텍스트 레이블이 없는 요소는 본 지침(2.5.3)의 검사 대상이 아닙니다. (예: 아이콘 단독 버튼)
  - 화면에서 완전히 숨겨진 요소 (`display: none`, 크기 0 등).

### [레이블(Label) 및 네임(Name) 추출 전략]
1. **시각적 레이블 추출**: 
   - 대상 요소의 `innerText`를 추출하여 기준값으로 삼습니다.
   - 단, 명시적 오버라이드 속성(`aria-label`, `aria-labelledby`, `title`, `alt`)이 전혀 없는 요소는 시각적 레이블과 프로그램적 네임이 본질적으로 100% 일치하므로 검사(오탐지 유발)를 생략합니다.
2. **프로그램적 네임(Accessible Name) 산출**:
   - W3C AccName 1.2 명세에 따라 `ABTUtils.getAccessibleName(el)`을 호출하여 최종 이름을 계산합니다.
   - 우선순위: `aria-labelledby` > `aria-label` > Native 속성(예: `value`, `alt`) > Text Content > `title`

## 2. 분석 및 분류 로직 (Analysis Pipeline)

### [단계 A] 텍스트 정규화 (Normalization)
실제 렌더링된 텍스트와 HTML 속성 간의 미세한 차이로 인한 기계적 오탐(False Positive)을 막기 위해 두 문자열을 정규화합니다.
- **대소문자 통일**: 모두 소문자로 변환.
- **구두점 제거**: `.,!?'"()[]<>-` 등의 특수 기호 제거.
- **공백 압축**: 줄바꿈이나 다중 공백을 단일 공백으로 치환하고 앞뒤 여백을 자릅니다(`trim`).

### [단계 B] 포함 관계 분석 (Label in Name)
- **Rule 1.1 (문자열 포함 여부):** 정규화된 `Accessible Name`이 정규화된 `Visible Label`을 포함(includes)하고 있는가?
  - 결과: 포함하지 않을 경우 **[오류]**. (예: 레이블 "보내기", 네임 "메시지 전송")
  - 가이드: "음성 제어 사용자의 혼란을 방지하기 위해 시각적 텍스트를 네임의 시작 부분에 포함하세요."

## 3. 최종 상태 정의 (Final Status)

1. **오류 (Fail):**
   - 시각적 레이블의 텍스트가 프로그램적 네임에 전혀 포함되어 있지 않아 음성 명령 매칭이 불가능한 경우.
2. **적절 (Pass):**
   - 시각적 레이블이 프로그램적 네임에 정확히 포함되어 있는 경우.
   - 네임을 강제로 덮어씌우는 속성이 없어 텍스트가 곧 네임으로 동작하는 안전한 상태인 경우.
3. **N/A:**
   - 시각적 레이블(텍스트)이 아예 없는 요소.
