# Chrome Web Store Privacy & Permissions Justification

크롬 웹 스토어 심사 시 "단일 용도(Single Purpose)" 및 "최소 권한(Minimum Permissions)" 원칙을 준수하고 있음을 증명하기 위해 아래의 사용 근거를 제출 양식에 맞춰 복사하여 붙여넣으세요.

---

## 1. sidePanel 사용 근거
**Justification:**
This extension is an accessibility auditing tool that requires users to continuously interact with both the target webpage and the auditing dashboard simultaneously. The `sidePanel` permission is essential to display the auditing results, provide actionable insights, and allow users to manually evaluate DOM elements alongside the active webpage without obstructing their view or forcing them to switch tabs.

**(한국어 번역)**
이 확장 프로그램은 사용자가 검사 대상 웹페이지와 진단 대시보드를 동시에 보면서 상호작용해야 하는 접근성 진단 도구입니다. `sidePanel` 권한은 사용자의 시야를 가리거나 탭을 전환하게 만들지 않고, 활성화된 웹페이지 옆에서 진단 결과를 실시간으로 표시하고 DOM 요소를 수동으로 평가할 수 있도록 돕기 위해 필수적입니다.

---

## 2. storage 사용 근거
**Justification:**
The `storage` permission (specifically `chrome.storage.local`) is required to save the user's manual evaluation results, scores, and expert comments for the accessibility audit. This ensures that the user's progress is not lost when they close the side panel or navigate between pages, providing a persistent and reliable auditing session.

**(한국어 번역)**
접근성 진단에 대한 사용자의 수동 평가 결과, 점수, 그리고 전문가 코멘트를 저장하기 위해 `storage` 권한(`chrome.storage.local`)이 필요합니다. 이를 통해 사용자가 사이드 패널을 닫거나 페이지를 이동하더라도 작업 내역이 유실되지 않으며, 지속적이고 안정적인 진단 세션을 유지할 수 있습니다.

---

## 3. activeTab 사용 근거
**Justification:**
The `activeTab` permission is strictly used to inject our accessibility analysis engine (`abt-engine.js`) into the specific webpage the user chooses to audit. This allows the extension to read the DOM structure to detect accessibility violations (e.g., missing alt text, low contrast) only when the user explicitly initiates the scan, ensuring maximum privacy by not requiring broad host permissions upfront.

**(한국어 번역)**
`activeTab` 권한은 사용자가 명시적으로 진단을 시작한 특정 웹페이지에만 접근성 분석 엔진(`abt-engine.js`)을 주입하기 위해 사용됩니다. 이를 통해 DOM 구조를 읽어 접근성 위배 사항(예: 대체 텍스트 누락, 명도 대비 부족)을 탐지하며, 불필요하게 모든 호스트 권한을 요구하지 않아 사용자의 개인정보를 보호합니다.

---

## 4. scripting 사용 근거
**Justification:**
The `scripting` permission works in conjunction with `activeTab` to execute the DOM analysis script (`chrome.scripting.executeScript`). It is required to dynamically inject the evaluation engine into the current page to analyze the HTML structure, compute color contrasts, and highlight specific elements in the viewport when a user clicks on an issue in the side panel.

**(한국어 번역)**
`scripting` 권한은 `activeTab`과 연계하여 DOM 분석 스크립트를 실행(`chrome.scripting.executeScript`)하기 위해 사용됩니다. HTML 구조를 분석하고 명도 대비를 계산하며, 사용자가 사이드 패널에서 특정 이슈를 클릭했을 때 뷰포트 내의 해당 요소를 스포트라이트(Highlight) 처리하기 위해 현재 페이지에 진단 엔진을 동적으로 주입하는 데 필수적입니다.

---

## 5. tabs 사용 근거
**Justification:**
The `tabs` permission is used solely to identify the currently active tab (`chrome.tabs.query`) to establish a two-way communication channel between the side panel and the injected content script. We need to know the `tab.id` and `tab.url` to match the audit results to the correct session and to send commands like "scroll to element" to the correct window.

**(한국어 번역)**
`tabs` 권한은 사이드 패널과 주입된 콘텐츠 스크립트 간의 양방향 통신 채널을 구축하기 위해 현재 활성화된 탭을 식별(`chrome.tabs.query`)하는 목적으로만 사용됩니다. 진단 결과를 올바른 세션에 매칭시키고, "해당 요소로 스크롤(Locate Element)"과 같은 명령을 정확한 창에 전달하기 위해 `tab.id`와 `tab.url` 정보가 필요합니다.

---

## 6. 호스트 권한 (<all_urls>) 사용 근거
**Justification:**
The extension is a general-purpose Web Accessibility (A11y) auditing tool designed for web developers and QA engineers. As such, it must be able to audit *any* webpage the user is currently developing or testing, including internal enterprise sites, local development environments (localhost), and public domains. Therefore, `<all_urls>` is necessary because the target URLs cannot be predetermined. We only interact with the page when the user explicitly triggers the tool.

**(한국어 번역)**
이 확장 프로그램은 웹 개발자와 QA 엔지니어를 위해 설계된 범용 웹 접근성(A11y) 진단 도구입니다. 따라서 내부 기업망, 로컬 개발 환경(localhost) 및 퍼블릭 도메인을 포함하여 사용자가 현재 개발하거나 테스트 중인 **모든 종류의 웹페이지**를 진단할 수 있어야 합니다. 진단 대상 URL을 사전에 특정할 수 없으므로 `<all_urls>` 권한이 필수적입니다. (단, 사용자가 도구를 명시적으로 실행할 때만 해당 페이지와 상호작용합니다.)
