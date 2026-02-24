import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Info, Search, Edit3, Clock, ChevronRight, ChevronDown, ChevronLeft, Filter, FileText, CheckCircle2, AlertCircle, Trash2, Folder, FolderOpen, FileCode2, RotateCcw, X } from 'lucide-react';
import styles from './styles/App.module.scss';
import { useStore, kwcagHierarchy } from './store/useStore';
const guidelineNames: Record<string, string> = {
  "ALL": "전체 지침",
  "511": "5.1.1 적절한 대체 텍스트",
  "521": "5.2.1 자막 제공",
  "611": "6.1.1 키보드 사용 보장",
  "612": "6.1.2 초점 이동과 표시",
  "613": "6.1.3 조작 가능",
  "631": "6.3.1 번쩍임 제한",
  "641": "6.4.1 건너뛰기 링크",
  "642": "6.4.2 제목 제공",
  "643": "6.4.3 링크 텍스트"
};

const App = () => {
  const { items, setItems, addReport, updateItemStatus, removeSession, clearItems, projectName } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [judgingId, setJudgingId] = useState<string | null>(null);
  const [tempComment, setTempComment] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [copyStatus, setCopyStatus] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [isPropPanelOpen, setIsPropPanelOpen] = useState(false);
  const [selectedSessionUrl, setSelectedSessionUrl] = useState<string | null>(null);
  const [currentTabInfo, setCurrentTabInfo] = useState<{url: string, title: string} | null>(null);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          setCurrentTabInfo({
            url: tabs[0].url || "",
            title: tabs[0].title || ""
          });
        }
      });
    }
  }, []);

  const handleStartAudit = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'RUN_AUDIT' });
    }
  };

  const sessions = useMemo(() => {
    const map = new Map<string, any>();
    // 최신 세션이 상단에 오도록 items를 역순으로 순회
    [...items].reverse().forEach(item => {
      const url = item.pageInfo?.url || "Unknown URL";
      if (!map.has(url)) {
        map.set(url, item.pageInfo || {
          url: "Unknown URL",
          pageTitle: "Unknown Page",
          timestamp: new Date().toISOString(),
          scanId: 0
        });
      }
    });
    const result = Array.from(map.values());
    console.log("ABT: Detected sessions (latest first):", result);
    return result;
  }, [items]);

  useEffect(() => {
    if (sessions.length > 0) {
      // 새로운 세션이 추가되거나 최신 세션이 바뀌면 자동 선택
      // (첫 로드 시 또는 새로운 스캔 시작 시)
      if (!selectedSessionUrl || !sessions.some(s => s.url === selectedSessionUrl)) {
        setSelectedSessionUrl(sessions[0].url);
      }
    }
  }, [sessions, selectedSessionUrl]);

  const toggleGroup = (gid: string) => {
    setExpandedGroups(prev => 
      prev.includes(gid) ? prev.filter(id => id !== gid) : [...prev, gid]
    );
  };

  const getGuidelineName = (id: string) => {
    for (const group of kwcagHierarchy) {
      const found = group.items.find(item => item.id === id);
      if (found) return found.label;
    }
    return guidelineNames[id] || id;
  };

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.runtime) return;

    // Connect to background for persistent relay
    const port = chrome.runtime.connect({ name: 'abt-sidepanel' });
    const extensionListener = (message: any) => {
      if (message.type === 'UPDATE_ABT_LIST') {
        console.log("ABT DEBUG: Data received via Extension:", message.data);
        setIsConnected(true);
        addReport(message.data);
      }
    };
    chrome.runtime.onMessage.addListener(extensionListener);
    port.onMessage.addListener(extensionListener);
    setIsConnected(true); 
    return () => {
      chrome.runtime.onMessage.removeListener(extensionListener);
      port.disconnect();
    };
  }, [addReport]);

  const guidelineTabs = useMemo(() => {
    const ids = Array.from(new Set(items.map(i => i.guideline_id)));
    return ["ALL", ...ids];
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedSessionUrl) {
      result = result.filter(i => i.pageInfo?.url === selectedSessionUrl);
    }
    if (activeTab !== "ALL") {
      result = result.filter(i => i.guideline_id === activeTab);
    }
    if (statusFilter !== "ALL") {
      result = result.filter(i => i.currentStatus === statusFilter);
    }
    return result;
  }, [items, selectedSessionUrl, activeTab, statusFilter]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof filteredItems> = {};
    filteredItems.forEach(item => {
      if (!groups[item.guideline_id]) {
        groups[item.guideline_id] = [];
      }
      groups[item.guideline_id].push(item);
    });

    return Object.keys(groups)
      .sort((a, b) => {
        return parseInt(a) - parseInt(b);
      })
      .map(gid => ({
        gid,
        label: getGuidelineName(gid),
        items: groups[gid]
      }));
  }, [filteredItems]);

  useEffect(() => {
    const errorGids = groupedItems
      .filter(g => g.items.some(i => i.currentStatus === '오류'))
      .map(g => g.gid);
    
    if (errorGids.length > 0) {
      setExpandedGroups(prev => {
        const next = [...new Set([...prev, ...errorGids])];
        return next;
      });
    }
  }, [groupedItems]);

  // 전체 통계 계산 (선택된 세션 기준)
  const sessionItems = useMemo(() => {
    return items.filter(i => i.pageInfo?.url === selectedSessionUrl);
  }, [items, selectedSessionUrl]);

  const handleJudge = (id: string, nextStatus: string) => {
    const nextItems = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          currentStatus: nextStatus,
          finalComment: tempComment,
          history: [...item.history, {
            timestamp: new Date().toLocaleTimeString(),
            status: nextStatus,
            comment: tempComment || "전문가 판정 완료"
          }]
        };
      }
      return item;
    });
    setItems(nextItems);
    setJudgingId(null);
    setTempComment("");
  };

  const generateMarkdownReport = async () => {
    const date = new Date().toLocaleDateString();
    let md = `# 🛡️ ABT 접근성 진단 리포트 (${date})\n\n`;
    
    const fails = items.filter(i => i.currentStatus === '오류').length;
    const inapps = items.filter(i => i.currentStatus === '부적절').length;
    const recs = items.filter(i => i.currentStatus === '수정 권고').length;
    
    md += `## 📊 진단 요약\n`;
    md += `- **❌ 오류:** ${fails}건\n`;
    md += `- **🚫 부적절:** ${inapps}건\n`;
    md += `- **⚠️ 수정 권고:** ${recs}건\n\n`;
    md += `---\n\n`;

    const activeGuidelines = Array.from(new Set(items.filter(i => i.currentStatus !== '적절').map(i => i.guideline_id)));
    
    activeGuidelines.forEach(gid => {
      md += `## 📘 ${getGuidelineName(gid)}\n\n`;
      const gidItems = items.filter(i => i.guideline_id === gid && i.currentStatus !== '적절');
      
      gidItems.forEach(item => {
        const statusIcon = item.currentStatus === '오류' ? '❌' : item.currentStatus === '부적절' ? '🚫' : '⚠️';
        md += `### ${statusIcon} [${item.currentStatus}] ${item.elementInfo.selector}\n`;
        md += `- **진단 결과:** ${item.result.message}\n`;
        if (item.finalComment) md += `- **QA 전문가 소견:** ${item.finalComment}\n`;
        md += `- **대상 요소:** \`${item.elementInfo.tagName}\`\n`;
        md += `- **주변 맥락:** *"${item.context.smartContext}"*\n\n`;
      });
    });

    md += `---\n*Generated by ABT (A11Y Browser Tester) Desktop*`;
    
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: `ABT_Report_${new Date().toISOString().split('T')[0]}.md`,
          types: [{
            description: 'Markdown File',
            accept: { 'text/markdown': ['.md'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(md);
        await writable.close();
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          console.error("File save failed, falling back to clipboard", err);
          copyToClipboard(md);
        }
      }
    } else {
      copyToClipboard(md);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    });
  };

  const selectedItem = items.find(i => i.id === selectedId);


  const handleLocate = (selector: string) => {
    const message = {
      type: 'locate-element',
      selector: selector
    };
    chrome.runtime.sendMessage(message);
  };

  return (
    <div className={styles.container}>
      <header className={styles.extHeader}>
        <div className={styles.brand}>
          <Shield size={18} className={styles.logo} />
          <div className={styles.titleInfo}>
            <h1>ABT Auditor</h1>
            <span>Extension</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button onClick={clearItems} title="전체 삭제" className={styles.iconBtn}><Trash2 size={16} /></button>
          <button onClick={generateMarkdownReport} title="리포트 추출" className={`${styles.iconBtn} ${copyStatus ? styles.success : ''}`}><FileText size={16} /></button>
        </div>
      </header>

      {items.length === 0 ? (
        <div className={styles.dashboard}>
          <div className={styles.hero}>
            <div className={styles.heroIcon}><Shield size={48} /></div>
            <h2>Ready to Audit</h2>
            <p>현재 페이지의 접근성을 진단합니다.</p>
            {currentTabInfo && (
              <div className={styles.pagePreview}>
                <span className={styles.pageTitle}>{currentTabInfo.title}</span>
                <span className={styles.pageUrl}>{currentTabInfo.url}</span>
              </div>
            )}
            <button className={styles.startBtn} onClick={handleStartAudit}>
              진단 시작 (Start Audit)
            </button>
          </div>
          <div className={styles.features}>
            <div className={styles.featItem}><CheckCircle2 size={14} /> KWCAG 2.2 지침</div>
            <div className={styles.featItem}><CheckCircle2 size={14} /> 실시간 판정</div>
          </div>
        </div>
      ) : (
        <div className={styles.workArea}>
          <div className={styles.statsSummary}>
            <div className={styles.statLine} onClick={() => setStatusFilter('ALL')}>전체 <span>{sessionItems.length}</span></div>
            <div className={`${styles.statLine} ${styles.fail}`} onClick={() => setStatusFilter('오류')}>오류 <span>{sessionItems.filter(i => i.currentStatus === '오류').length}</span></div>
          </div>
          
          <div className={styles.groupedList}>
            {groupedItems.map((group) => {
              const isExpanded = expandedGroups.includes(group.gid);
              const hasError = group.items.some(i => i.currentStatus === '오류');
              
              const formattedGid = group.gid.length === 3 
                ? `${group.gid[0]}.${group.gid[1]}.${group.gid[2]}`
                : group.gid;

              return (
                <section key={group.gid} className={styles.groupSection}>
                  <header 
                    className={`${styles.groupHeader} ${hasError ? styles.hasError : ''}`}
                    onClick={() => toggleGroup(group.gid)}
                  >
                    <div className={styles.headerLeft}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className={styles.gidLabel}>{formattedGid} {group.label}</span>
                    </div>
                    <span className={styles.countBadge}>{group.items.length}</span>
                  </header>
                  
                  {isExpanded && (
                    <div className={styles.groupContent}>
                      {group.items.map((item) => (
                        <article 
                          key={item.id} 
                          onClick={() => { setSelectedId(item.id); handleLocate(item.elementInfo.selector); }}
                          className={`${styles.miniCard} ${selectedId === item.id ? styles.selected : ''}`}
                        >
                          <div className={styles.cardTop}>
                            <div className={`${styles.miniStatus} ${item.currentStatus === '오류' ? styles.fail : styles.pass}`}>
                              {item.currentStatus}
                            </div>
                          </div>
                          <h3>{item.result?.message}</h3>
                          <code className={styles.selector}>{item.elementInfo.selector}</code>
                          
                          {selectedId === item.id && (
                            <div className={styles.miniDetail}>
                              <p className={styles.ctx}>"{item.context.smartContext}"</p>
                              <div className={styles.miniActions}>
                                <button onClick={(e) => { e.stopPropagation(); setJudgingId(item.id); setTempComment(item.finalComment); }}>판정</button>
                                <button onClick={(e) => { e.stopPropagation(); setIsPropPanelOpen(true); }}>상세</button>
                              </div>
                            </div>
                          )}
                          
                          {judgingId === item.id && (
                            <div className={styles.miniJudge} onClick={e => e.stopPropagation()}>
                              <textarea value={tempComment} onChange={e => setTempComment(e.target.value)} />
                              <div className={styles.judgeBtns}>
                                <button onClick={() => handleJudge(item.id, '적절')} className={styles.pBtn}>적절</button>
                                <button onClick={() => handleJudge(item.id, '오류')} className={styles.fBtn}>오류</button>
                              </div>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      )}

      {isPropPanelOpen && selectedItem && (
        <div className={styles.fullPropPanel}>
          <header>
            <h3>Detail View</h3>
            <button onClick={() => setIsPropPanelOpen(false)}><X size={18} /></button>
          </header>
          <div className={styles.propBody}>
            <section>
              <h4>Selector</h4>
              <code>{selectedItem.elementInfo.selector}</code>
            </section>
            <section>
              <h4>Context</h4>
              <p>{selectedItem.context.smartContext}</p>
            </section>
            <section>
              <h4>History</h4>
              {selectedItem.history.map((h: any, i: number) => (
                <div key={i} className={styles.histItem}>
                  <span>{h.timestamp}</span>
                  <strong>{h.status}</strong>
                  <p>{h.comment}</p>
                </div>
              ))}
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
