# a11ykr.github.io KWCAG 2.2 접근성 보고서 생성 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 한국 웹 접근성 지침(KWCAG 2.2) 24개 지표를 전수 조사한 웹 기반 보고서 생성

**Architecture:** 단일 HTML 파일 구성. 한국 표준 명칭(4개 원칙, 13개 항목, 24개 지표)을 기반으로 한 계층적 구조 구현.

**Tech Stack:** HTML5, Tailwind CSS, Atkinson Hyperlegible Font

---

### Task 1: KWCAG 2.2 지표 데이터 셋 구성

**Files:**
- Create: `kwcag_data.json` (임시 저장용)

**Step 1: 4개 원칙, 13개 항목, 24개 지표 리스트업**
- 1. 인식의 용이성 (적절한 대체 텍스트, 자막 제공, 멀티미디어 대체 수단, 명도 대비, 콘텐츠 간의 구분)
- 2. 운용의 용이성 (키보드 사용 보장, 응답 시간 조절, 정지 기능 제공, 깜빡임과 번쩍임 사용 제한, 반복 영역 건너뛰기, 제목 제공, 적절한 링크 텍스트, 초점 이동, 조작 가능성)
- 3. 이해의 용이성 (기본 언어 표시, 사용자 요구에 따른 실행, 콘텐츠의 선형 구조, 표의 구성, 레이아웃 일관성, 데이터 입력 오차 정정)
- 4. 견고성 (마크업 오류 방지, 웹 애플리케이션 접근성)

**Step 2: 기존 검사 데이터 매핑**
- 각 지표별 준수/미준수/해당없음 상태 기록

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
