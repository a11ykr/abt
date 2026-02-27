# A11Y Assistant for KWCAG (AAK)

> 🛡️ **웹 접근성 전문가를 위한 정밀 진단 어시스턴트**
> 브라우저 사이드 패널(Side Panel)을 통해 실시간 접근성 진단 및 전문가 판정 프로세스를 통합합니다.

## 💡 핵심 철학 (Core Philosophy)
웹 접근성 검수는 자동화하기 어려운 '**인적 판단**'의 영역이 많습니다. AAK는 "100% 자동화"를 목표로 하지 않습니다. 대신 "**전문가가 판단해야 할 항목을 가장 빠르게 선별해주고, 판단에 필요한 모든 정보(지침 원문, 마크업, 위치)를 한곳에 모아주는 것**"에 집중합니다.

## 🚀 주요 기능
- **KWCAG 2.2 최적화 진단**: 국내 표준 지침(33개 항목)에 특화된 정밀 진단 엔진 탑재
- **Expert-in-the-loop 판정**: 자동 진단 결과에 대해 전문가가 즉시 '적절/오류/수정권고'를 판정하고 소견을 기록
- **SVG Spotlight**: 위배 요소의 위치를 정확히 찾아주는 고해상도 시각적 피드백 제공
- **스마트 리포팅**: 검수 내역을 즉시 마크다운(Markdown) 보고서로 추출하여 업무 효율 극대화
- **성능 최적화**: 대규모 DOM 환경에서도 쾌적한 UX를 제공하는 Batch 통신 아키텍처
- **상태 영속성**: `chrome.storage.local` 연동으로 브라우저를 닫아도 검수 세션 완벽 유지

## 🛠️ 기술 스택
- **Core**: React 18, TypeScript, SCSS (Module)
- **Extension**: Manifest V3, Chrome Side Panel API
- **Engine**: Custom JS Engine (`ABTCore`) + 33 Processors
- **Build**: Vite 4
- **State**: Zustand (Custom Persistence Middleware)
- **Icons**: Lucide React

## 📦 설치 및 실행
```bash
# 의존성 설치
npm install

# 프로덕션 빌드 (dist/ 폴더 생성)
npm run build
```

## 🔌 확장 프로그램 로드 방법
1. Chrome 브라우저에서 `chrome://extensions/` 주소로 이동합니다.
2. 우측 상단의 **'개발자 모드'**를 활성화합니다.
3. **'압축해제된 확장 프로그램을 로드합니다'** 버튼을 클릭합니다.
4. 프로젝트의 `dist` 폴더를 선택합니다.
5. 브라우저 툴바의 확장 프로그램 아이콘을 클릭하여 **AAK**를 실행하면 사이드 패널이 열립니다.

## 📂 프로젝트 구조
- `src/engine/`: 접근성 진단 코어 엔진 및 지침별 프로세서 (Content Script)
- `src/renderer/`: React 기반 Side Panel UI 대시보드
- `src/extension/`: 서비스 워커 및 익스텐션 배포 설정
- `docs/algorithms/`: 각 진단 알고리즘의 동작 원리 명세
- `.references/`: KWCAG 공식 지침 및 표준 데이터셋
