# ABT - A11Y Browser Tester (Chrome Extension)

> 🛡️ **브라우저 확장 프로그램 **
> 브라우저 사이드 패널(Side Panel)을 통해 실시간 접근성 진단 및 판정 기능을 제공합니다.

## 프로젝트 개요
ABT(A11Y Browser Tester)는 웹 접근성 전문가를 위한 진단 보조 도구입니다. 브라우저 사이드 패널에서 현재 탭의 접근성 진단 데이터를 실시간으로 수집, 시각화하며 전문가 판정 및 리포트 생성을 지원합니다.

## 주요 기능
- **실시간 진단 데이터 수집**: 웹 페이지 내 요소들을 실시간으로 분석하여 접근성 위배 사항 탐지
- **전문가 판정 (Expert Judgement) 보조**: 자동 진단 결과에 대한 전문가의 추가 의견 및 상태 변경 기능
- **사이드 패널 UI**: 브라우저 우측 사이드바를 통해 웹 페이지와 동시에 작업 가능
- **리포트 추출**: 다른 도구에 활용 가능한 Markdown 형식 리포트 생성
- **상태 유지**: `chrome.storage.local`을 통한 검수 내역 자동 저장 및 복구

## 기술 스택
- **Framework**: React 18
- **Extension**: Manifest V3, Chrome Side Panel API
- **Build Tool**: Vite, TypeScript
- **Styling**: SCSS (Module)
- **State Management**: Zustand (Chrome Storage Local Persistence)
- **Icons**: Lucide React

## 설치 및 실행
```bash
# 의존성 설치
npm install

# 프로덕션 빌드 (dist/ 폴더 생성)
npm run build
```

## 확장 프로그램 로드 방법
1. Chrome 브라우저에서 `chrome://extensions/` 주소로 이동합니다.
2. 우측 상단의 **'개발자 모드'**를 활성화합니다.
3. **'압축해제된 확장 프로그램을 로드합니다'** 버튼을 클릭합니다.
4. 프로젝트의 `dist` 폴더를 선택합니다.
5. 브라우저 툴바의 확장 프로그램 아이콘을 클릭하여 **ABT**를 실행하면 사이드 패널이 열립니다.

## 프로젝트 구조
- `src/extension/`: 백그라운드 서비스 워커 및 매니페스트 설정
- `src/renderer/`: React 기반 Side Panel UI 레이어
- `src/engine/`: 접근성 진단 코어 엔진 및 개별 프로세서 모듈 (Content Script)
- `docs/algorithms/`: 각 프로세서(진단 알고리즘)별 작동 원리 및 명세서
