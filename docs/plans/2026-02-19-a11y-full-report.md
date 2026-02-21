# a11ykr.github.io 종합 접근성 검사 보고서 생성 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** a11ykr.github.io의 모든 WCAG 2.1 성공 기준에 대한 검사 결과를 포함하는 종합 웹 보고서 생성

**Architecture:** 단일 HTML 파일로 구성되며, Tailwind CSS를 사용하여 데이터 중심의 고대비/접근성 친화적 레이아웃 구현. 모든 성공 기준을 테이블 형태로 나열하고 준수 여부(Pass, Fail, N/A)를 표시.

**Tech Stack:** HTML5, Tailwind CSS, Google Fonts (Atkinson Hyperlegible)

---

### Task 1: WCAG 2.1 성공 기준 데이터 셋 구성

**Files:**
- Create: `temp_wcag_data.json` (임시 데이터 저장용)

**Step 1: WCAG 2.1 성공 기준(Level A, AA) 리스트 작성**
- 모든 78개 성공 기준 중 주요 항목(인식, 운용, 이해, 견고성) 리스트업
- 각 항목별 검사 결과 매핑 (Pass: 자동검사 통과 항목, Advisory: 수동점검 제안 항목, N/A: 미사용 기능)

**Step 2: JSON 형태로 데이터 구조화**
- `id`, `name`, `level`, `status`, `notes` 필드 포함

**Step 3: 커밋**
- `git commit -m "docs: add wcag 2.1 criteria data for report"`

### Task 2: 종합 보고서 HTML 템플릿 구현

**Files:**
- Create: `/Users/hj/a11y-full-report.html`

**Step 1: 기본 HTML5 구조 및 Tailwind CSS 설정**
- Atkinson Hyperlegible 폰트 적용
- 고대비(High Contrast) 컬러 팔레트 설정

**Step 2: 요약 대시보드 섹션 구현**
- 전체 준수율, 위반 건수, 권장 사항 건수 시각화

**Step 3: 성공 기준별 상세 테이블 구현**
- 필터 기능(전체, 합격, 주의, 해당없음) 포함 (JS 간단 구현)
- 모든 항목을 순차적으로 렌더링 (해당 없는 항목은 "해당사항 없음" 명시)

**Step 4: 커밋**
- `git commit -m "feat: implement comprehensive a11y report template"`

### Task 3: 검사 결과 데이터 주입 및 최종 정밀화

**Files:**
- Modify: `/Users/hj/a11y-full-report.html`

**Step 1: Task 1에서 구성한 데이터를 HTML 내 스크립트 또는 데이터 섹션에 주입**

**Step 2: 라이트/다크 모드별 특이사항 주입**
- 대비 검사 결과 수치(Ratio) 구체적 명시

**Step 3: 불필요한 주석 제거 및 코드 정제**

**Step 4: 커밋**
- `git commit -m "feat: finalize a11y full report with real audit data"`
