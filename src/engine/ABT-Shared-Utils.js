/**
 * ABT Shared Utilities
 * 모든 지침별 프로세서에서 공통으로 사용하는 유틸리티 모음
 */
window.ABTUtils = {
  /**
   * 요소의 CSS 셀렉터를 생성합니다.
   */
  getSelector: function(el) {
    if (el.id) return `#${el.id}`;
    if (el.className && typeof el.className === 'string') {
      return `.${el.className.split(/\s+/).filter(Boolean).join('.')}`;
    }
    return el.tagName.toLowerCase();
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
  }
};
