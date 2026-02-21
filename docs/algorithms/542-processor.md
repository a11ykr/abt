# ABT-5.4.2-Processor: 자동 재생 금지 알고리즘 v1.0

### 🔗 WCAG 2.2 Reference
- **SC 1.4.2 Audio Control (Level A)**: If any audio on a Web page plays automatically for more than 3 seconds, a mechanism is available to pause or stop the audio, or a mechanism is available to control audio volume independently from the overall system volume level.

---

이 알고리즘은 지침 1.4.3(배경음 제어)을 준수하며, 자동으로 재생되는 음성 정보가 사용자에게 방해를 주지 않고 제어 가능한지 진단한다.

## 1. 데이터 수집 단계 (Data Collection)
- **Audio Elements:** `<audio>`, `<video>` 요소의 `autoplay` 속성 여부.
- **JS-driven Audio:** Web Audio API (`AudioContext`) 사용 여부.
- **Control Elements:** `mute`, `pause`, `stop` 기능을 가진 버튼 존재 여부.

## 2. 분석 및 분류 로직 (Analysis Pipeline)

### [단계 A] 자동 재생 탐지
- **Rule 1.1:** 페이지 로드 후 즉시 소리가 발생하는가? (3초 이상 지속 기준)
  - 결과: **[검토 필요]** (자동 재생 감지 시 제어 수단 탐색 단계로 이동)

### [단계 B] 제어 수단 검사
- **Rule 2.1:** 페이지 상단(헤더 등)에 소리를 끄거나 일시 정지할 수 있는 버튼이 있는가?
- **Rule 2.2:** 키보드로 해당 제어 버튼에 접근 가능한가?
  - 미존재 시: **[오류]**

### [단계 C] 소리 크기 조절
- **Rule 3.1:** 시스템 볼륨과 별개로 콘텐츠 내 볼륨 조절 바가 존재하는가?
  - 결과: **[수정 권고]** (제공 권장)

## 3. 최종 상태 정의 (Final Status)
1. **오류:** 3초 이상의 자동 재생 음성이 있으나 제어 수단이 없음.
2. **부적절:** 제어 수단이 있으나 키보드로 접근 불가하거나 찾기 매우 어려움.
3. **수정 권고:** 제어 수단은 있으나 초기 볼륨이 너무 크거나 별도 볼륨 조절이 불가능한 경우.
4. **검토 필요:** 자동 재생 여부 및 음성 콘텐츠 포함 여부 확인.
5. **적절:** 자동 재생이 없거나, 명확한 제어 수단이 제공됨.
