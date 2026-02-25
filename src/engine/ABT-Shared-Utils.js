/**
 * ABT Shared Utilities
 * 모든 지침별 프로세서에서 공통으로 사용하는 유틸리티 모음
 */
window.ABTUtils = Object.assign(window.ABTUtils || {}, {
  /**
   * 요소의 CSS 셀렉터를 생성합니다.
   */
  getSelector: function(el) {
    if (el.id) return `#${el.id}`;
    // 클래스명이 있는 경우
    if (el.className && typeof el.className === 'string') {
      const classes = el.className.split(/\s+/).filter(Boolean).join('.');
      if (classes) {
        // 동일 클래스를 가진 형제들 중 몇 번째인지 계산 (고유성 강화)
        const siblings = Array.from(el.parentElement?.children || []).filter(s => s.className === el.className);
        if (siblings.length > 1) {
          const index = siblings.indexOf(el) + 1;
          return `.${classes}:nth-of-type(${index})`;
        }
        return `.${classes}`;
      }
    }

    // ID나 클래스가 없는 경우 태그명 + 순서로 생성
    const tagName = el.tagName.toLowerCase();
    const allOfSameTag = Array.from(el.parentElement?.children || []).filter(s => s.tagName.toLowerCase() === tagName);
    if (allOfSameTag.length > 1) {
      const index = allOfSameTag.indexOf(el) + 1;
      return `${tagName}:nth-of-type(${index})`;
    }
    return tagName;
  },

  /**
   * 요소 주변의 텍스트 맥락을 스마트하게 추출합니다.
   * @param {HTMLElement} el - 대상 요소
   * @param {number} length - 추출할 앞뒤 글자 수 (기본 50자)
   */
  getSmartContext: function(el, length = 50) {
    const parent = el.closest('div, section, article, li, a, button, p, h1, h2, h3, h4, h5, h6') || el.parentElement;
    if (!parent) return "";
    
    const fullText = parent.innerText.replace(/\s+/g, ' ').trim();
    // 요소가 가진 텍스트가 있다면 해당 위치를 기준으로, 없다면 전체에서 검색
    const targetText = el.innerText || el.getAttribute('alt') || "";
    const index = targetText ? fullText.indexOf(targetText) : -1;
    
    if (index === -1) return fullText.substring(0, length * 2);
    
    const start = Math.max(0, index - length);
    const end = Math.min(fullText.length, index + targetText.length + length);
    return fullText.substring(start, end);
  },

  /**
   * 두 문자열 간의 단어 기반 유사도를 계산합니다.
   */
  calculateSimilarity: function(str1, str2) {
    if (!str1 || !str2) return 0;
    const clean = (s) => s.toLowerCase().replace(/[^\w\sㄱ-힣]/g, '');
    const words1 = new Set(clean(str1).split(/\s+/).filter(Boolean));
    const words2 = clean(str2).split(/\s+/).filter(Boolean);
    
    if (words1.size === 0) return 0;
    
    const intersection = words2.filter(word => words1.has(word));
    return intersection.length / Math.max(words1.size, 1);
  },

  /**
   * RGB 색상 문자열(rgb(r,g,b))에서 상대 휘도(Luminance)를 계산합니다.
   */
  getLuminance: function(colorStr) {
    const rgb = colorStr.match(/\d+/g);
    if (!rgb || rgb.length < 3) return 0;
    
    const [r, g, b] = rgb.map(c => {
      let v = parseInt(c) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },

  /**
   * 두 휘도 값 사이의 명도 대비를 계산합니다.
   */
  getContrastRatio: function(l1, l2) {
    const brighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (brighter + 0.05) / (darker + 0.05);
  },

  /**
   * 요소가 화면에 표시되는지(숨겨져 있지 않은지) 확인합니다.
   */
  isHidden: function(el) {
    if (!el) return true;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return true;
    
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return true;
    
    // 부모 요소 중 하나라도 숨겨져 있는지 체크
    let parent = el.parentElement;
    while (parent) {
      try {
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') return true;
      } catch (e) {}
      parent = parent.parentElement;
    }

    return false;
  },

  /**
   * 요소가 이미지 대체 기법(IR) 또는 스크린 리더 전용(SR-only)으로 숨겨져 있는지 확인합니다.
   */
  isImageReplacement: function(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);

    // 1. text-indent 기법
    const textIndent = parseInt(style.textIndent);
    if (Math.abs(textIndent) > 500) return true;

    // 2. font-size: 0 기법
    const fontSize = parseInt(style.fontSize);
    if (fontSize === 0) return true;

    // 3. sr-only / blind 클래스 표준 기법 (position: absolute + clip)
    const isAbsolute = style.position === 'absolute';
    const isClipped = style.clip === 'rect(0px, 0px, 0px, 0px)' || style.clip === 'rect(1px, 1px, 1px, 1px)';
    const isClipPath = style.clipPath === 'inset(50%)' || style.clipPath === 'inset(100%)';
    
    if (isAbsolute && (isClipped || isClipPath)) return true;

    // 4. 위치를 화면 밖으로 밀어내는 기법
    const left = parseInt(style.left);
    const top = parseInt(style.top);
    if (isAbsolute && (left < -5000 || top < -5000)) return true;

    return false;
  }
});
