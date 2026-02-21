# A11Y Browser Tester (ABT) Desktop for KWCAG 2.2

> 🚧 **현재 작업 진행 상태 (WIP)** (이 문서는 AI 에이전트가 작성하고 있습니다.)
> 본 프로젝트는 현재 **모든 KWCAG 2.2 지침 기반 접근성 진단 알고리즘(Processor) 설계가 완료**되었으며, 이제 실제 엔진 연동 및 구현 단계를 진행할 예정입니다.
> Git 저장소에 순차적으로 진단 코어 모듈이 커밋되고 있습니다.

## 프로젝트 개요
ABT(A11Y Browser Tester)는 웹 접근성 전문가를 위한 데스크탑 진단 도구입니다. 브라우저 확장 프로그램에서 수집된 진단 데이터를 실시간으로 수신하여 시각화하고, 전문가 판정 및 리포트 생성을 지원합니다.

## 주요 기능
- **실시간 데이터 수신**: 브라우저 확장과 IPC를 통한 실시간 진단 결과 동기화
- **전문가 판정 (Expert Judgement)**: 자동 진단 결과에 대한 전문가의 추가 의견 및 상태 변경 기능
- **지침별 필터링**: WCAG/KWCAG 지침별 진단 항목 분류 및 필터링
- **리포트 추출**: Jira 등 협업 도구에 즉시 활용 가능한 Markdown 형식 리포트 생성
- **상세 이력 관리**: 개별 요소별 판정 히스토리 추적

## 기술 스택
- **Framework**: Electron, React
- **Build Tool**: Vite, TypeScript
- **Styling**: SCSS (Module), Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand (계획됨), React Hooks

## 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 모드 실행 (Renderer + Main + Electron)
npm run dev

# 프로덕션 빌드
npm run build
```

## 프로젝트 구조
- `src/main`: Electron 메인 프로세스 및 Preload 스크립트
- `src/renderer`: React 기반 UI 레이어
- `src/engine`: 접근성 진단 코어 엔진 및 프로세서 (브라우저 주입용)
- `docs/plans`: 프로젝트 단계별 구현 계획서
