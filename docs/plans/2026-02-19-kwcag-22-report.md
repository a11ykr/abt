# a11ykr.github.io KWCAG 2.2 접근성 보고서 생성 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 한국형 웹 콘텐츠 접근성 지침 2.2(KWCAG 2.2, KS X OT0003:2022) 33개 지표를 전수 조사한 웹 기반 보고서 생성

**Architecture:** 단일 HTML 파일 구성. 최신 KWCAG 2.2 표준 명칭(4개 원칙, 14개 지침, 33개 검사항목)을 기반으로 한 계층적 구조 구현.

**Tech Stack:** HTML5, Tailwind CSS, Atkinson Hyperlegible Font

---

### Task 1: KWCAG 2.2 지표 데이터 셋 구성

**Files:**
- Create: `kwcag_data.json` (임시 저장용)

**Step 1: 4개 원칙, 14개 지침, 33개 검사항목 리스트업 (KWCAG 2.2 기준)**
- **5. 인식의 용이성** 
  - (대체 텍스트, 멀티미디어 대체수단, 적응성, 명료성 등 9개 항목)
  - 5.1.1 적절한 대체 텍스트 제공 ~ 5.4.4 콘텐츠 간의 구분
- **6. 운용의 용이성** 
  - (입력장치 접근성, 충분한 시간 제공, 광과민성 발작 예방, 쉬운 내비게이션, 입력 방식 등 15개 항목)
  - 6.1.1 키보드 사용 보장 ~ 6.5.4 동작기반 작동
- **7. 이해의 용이성** 
  - (가독성, 예측 가능성, 입력 도움 등 7개 항목)
  - 7.1.1 기본 언어 표시 ~ 7.3.4 반복 입력 정보
- **8. 견고성** 
  - (문법 준수, 웹 애플리케이션 접근성 등 2개 항목)
  - 8.1.1 마크업 오류 방지, 8.2.1 웹 애플리케이션 접근성 준수

**Step 2: 기존 검사 데이터 매핑**
- 각 33개 지표별 준수/미준수/해당없음 상태 기록

**Step 3: 커밋**

### Task 2: KWCAG 2.2 전용 보고서 HTML 구현

**Files:**
- Create: `/Users/hj/kwcag-report.html`

**Step 1: 한국 표준 스타일의 레이아웃 설계**
- 원칙별 섹션 구분
- 지표별 상세 점검 내용 및 근거 기록

**Step 2: 데이터 매핑 및 렌더링 스크립트 작성**

**Step 3: 커밋**

### Task 3: 최종 보고서 정제 및 검증

**Files:**
- Modify: `/Users/hj/kwcag-report.html`

**Step 1: 국문 용어 정밀 교정 (표준 용어 준수 여부)**
**Step 2: 요약 통계(준수율 계산) 기능 추가**
**Step 3: 최종 검증 및 커밋**
