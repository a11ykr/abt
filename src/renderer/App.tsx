import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Info, Search, Edit3, Clock, ChevronRight, ChevronDown, ChevronLeft, Filter, FileText, CheckCircle2, AlertCircle, Trash2, Folder, FolderOpen, FileCode2, RotateCcw, X, Image as ImageIcon, PlusCircle, ExternalLink, PanelRightClose } from 'lucide-react';
import styles from './styles/App.module.scss';
import { useStore, kwcagHierarchy, ABTItem } from './store/useStore';

const guidelineNames: Record<string, string> = {
  "ALL": "전체 지침"
};

const normalizeUrl = (u: string) => u.replace(/\/$/, "").split('?')[0].split('#')[0];

const App = () => {
  const { items, setItems, addReport, updateItemStatus, setGuidelineScore, removeSession, clearItems, projectName } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [judgingId, setJudgingId] = useState<string | null>(null);
  const [tempComment, setTempComment] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [copyStatus, setCopyStatus] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [isPropPanelOpen, setIsPropPanelOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [currentTabInfo, setCurrentTabInfo] = useState<{url: string, title: string} | null>(null);
  const [isManualDashboard, setIsManualDashboard] = useState(false);
  const [lastTriggeredScanTime, setLastTriggeredScanTime] = useState<number>(0);
  const [isAuditing, setIsAuditing] = useState(false);
  
  const isPopup = useMemo(() => new URLSearchParams(window.location.search).get('mode') === 'popup', []);
  const sourceWindowId = useMemo(() => {
    const id = new URLSearchParams(window.location.search).get('windowId');
    return id ? parseInt(id) : null;
  }, []);

  // 여러 창(사이드 패널, 팝업) 간의 데이터 실시간 동기화
  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage) return;

    const storageListener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes['abt-storage']) {
        console.log("ABT: Storage changed in another window, rehydrating store...");
        (useStore.persist as any).rehydrate();
      }
    };

    chrome.storage.onChanged.addListener(storageListener);
    return () => chrome.storage.onChanged.removeListener(storageListener);
  }, []);

  useEffect(() => {
    const updateCurrentTab = () => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        const queryOptions = (isPopup && sourceWindowId) 
          ? { active: true, windowId: sourceWindowId } 
          : { active: true, lastFocusedWindow: true };

        chrome.tabs.query(queryOptions, (tabs) => {
          const validTab = tabs.find(t => t.url && !t.url.startsWith('chrome-extension://')) || tabs[0];
          if (validTab) {
            setCurrentTabInfo({
              url: validTab.url || "",
              title: validTab.title || ""
            });
          }
        });
      }
    };

    updateCurrentTab();

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const tabListener = (tabId: number, changeInfo: any, tab: chrome.tabs.Tab) => {
        if (changeInfo.status === 'complete' && tab.active) {
          updateCurrentTab();
        }
      };
      const activeListener = () => updateCurrentTab();

      chrome.tabs.onUpdated.addListener(tabListener);
      chrome.tabs.onActivated.addListener(activeListener);

      return () => {
        chrome.tabs.onUpdated.removeListener(tabListener);
        chrome.tabs.onActivated.removeListener(activeListener);
      };
    }
  }, [isPopup, sourceWindowId]);

  const handleStartAudit = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      setIsAuditing(true);
      setLastTriggeredScanTime(Date.now());
      
      chrome.runtime.sendMessage({ 
        type: 'RUN_AUDIT', 
        windowId: isPopup ? sourceWindowId : null 
      });

      setTimeout(() => setIsAuditing(false), 10000);
    }
  };

  const sessions = useMemo(() => {
    const map = new Map<number, any>();
    let currentOrigin: string | null = null;
    try {
      if (currentTabInfo?.url) {
        currentOrigin = new URL(currentTabInfo.url).origin;
      }
    } catch (e) {}

    [...items].reverse().forEach(item => {
      const scanId = item.pageInfo?.scanId || 0;
      const url = item.pageInfo?.url || "Unknown URL";
      try {
        const itemOrigin = new URL(url).origin;
        if (currentOrigin && itemOrigin !== currentOrigin) return;
      } catch (e) {}

      if (!map.has(scanId)) {
        map.set(scanId, item.pageInfo || {
          url: "Unknown URL",
          pageTitle: "Unknown Page",
          timestamp: new Date().toISOString(),
          scanId: scanId
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.scanId - a.scanId);
  }, [items, currentTabInfo?.url]);

  useEffect(() => {
    if (!currentTabInfo?.url) return;
    
    const latestSessionForUrl = sessions.find(s => normalizeUrl(s.url) === normalizeUrl(currentTabInfo.url));
    
    if (latestSessionForUrl) {
      const sessionTime = new Date(latestSessionForUrl.timestamp).getTime();
      
      if (!selectedSessionId && !isManualDashboard && lastTriggeredScanTime === 0) {
        setSelectedSessionId(latestSessionForUrl.scanId);
      }
      else if (lastTriggeredScanTime > 0 && sessionTime > lastTriggeredScanTime - 1000) {
        setSelectedSessionId(latestSessionForUrl.scanId);
        setIsManualDashboard(false);
        setLastTriggeredScanTime(0);
        setIsAuditing(false);
      }
    }
  }, [currentTabInfo?.url, sessions, selectedSessionId, isManualDashboard, lastTriggeredScanTime]);

  useEffect(() => {
    setIsManualDashboard(false);
  }, [currentTabInfo?.url]);

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
    return id;
  };

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.runtime) return;

    const port = chrome.runtime.connect({ name: 'abt-sidepanel' });
    const extensionListener = (message: any) => {
      if (message.type === 'UPDATE_ABT_LIST') {
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

  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedSessionId) {
      result = result.filter(i => i.pageInfo?.scanId === selectedSessionId);
    }
    if (activeTab !== "ALL") {
      result = result.filter(i => i.guideline_id === activeTab);
    }
    if (statusFilter !== "ALL") {
      result = result.filter(i => i.currentStatus === statusFilter);
    }
    return result;
  }, [items, selectedSessionId, activeTab, statusFilter]);

  const allGroupedItems = useMemo(() => {
    const itemMap: Record<string, ABTItem[]> = {};
    filteredItems.forEach(item => {
      if (!itemMap[item.guideline_id]) itemMap[item.guideline_id] = [];
      itemMap[item.guideline_id].push(item);
    });

    const result: {gid: string, label: string, items: ABTItem[]}[] = [];
    kwcagHierarchy.forEach(principle => {
      principle.items.forEach(item => {
        result.push({
          gid: item.id,
          label: item.label,
          items: itemMap[item.id] || []
        });
      });
    });
    return result;
  }, [filteredItems]);

  useEffect(() => {
    const errorGids = allGroupedItems
      .filter(g => g.items.some(i => i.currentStatus === '오류'))
      .map(g => g.gid);
    
    if (errorGids.length > 0) {
      setExpandedGroups(prev => [...new Set([...prev, ...errorGids])]);
    }
  }, [allGroupedItems]);

  const sessionItems = useMemo(() => {
    return items.filter(i => i.pageInfo?.scanId === selectedSessionId);
  }, [items, selectedSessionId]);

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
    const fails = sessionItems.filter(i => i.currentStatus === '오류').length;
    const inapps = sessionItems.filter(i => i.currentStatus === '부적절').length;
    const recs = sessionItems.filter(i => i.currentStatus === '수정 권고').length;
    md += `## 📊 진단 요약\n- **❌ 오류:** ${fails}건\n- **🚫 부적절:** ${inapps}건\n- **⚠️ 수정 권고:** ${recs}건\n\n---\n\n`;

    const activeGuidelines = Array.from(new Set(sessionItems.filter(i => i.currentStatus !== '적절').map(i => i.guideline_id)));
    activeGuidelines.forEach(gid => {
      md += `## 📘 ${getGuidelineName(gid)}\n\n`;
      const gidItems = sessionItems.filter(i => i.guideline_id === gid && i.currentStatus !== '적절');
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
          types: [{ description: 'Markdown File', accept: { 'text/markdown': ['.md'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(md);
        await writable.close();
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') copyToClipboard(md);
      }
    } else copyToClipboard(md);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2000);
    });
  };

  const handleLocate = (selector: string) => {
    chrome.runtime.sendMessage({ 
      type: 'locate-element', 
      selector,
      windowId: isPopup ? sourceWindowId : null
    });
  };

  const selectedItem = items.find(i => i.id === selectedId);

  return (
    <div className={styles.container}>
      <header className={styles.extHeader}>
        <div className={styles.brand}>
          <Shield size={18} className={styles.logo} />
          <div className={styles.titleInfo}>
            <h1>ABT Auditor</h1>
            <span>{isPopup ? 'Window' : 'Extension'}</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => { setSelectedSessionId(null); setIsManualDashboard(true); }} title="새 진단" className={styles.iconBtn}><PlusCircle size={16} /></button>
          
          {isPopup ? (
            <button 
              onClick={() => {
                if (typeof chrome !== 'undefined' && chrome.sidePanel) {
                  const targetWinId = sourceWindowId || chrome.windows.WINDOW_ID_CURRENT;
                  (chrome as any).sidePanel.open({ windowId: targetWinId }, () => {
                    window.close();
                  });
                }
              }} 
              title="사이드 패널로 돌리기" 
              className={styles.iconBtn}
            >
              <PanelRightClose size={16} />
            </button>
          ) : (
            <button 
              onClick={() => {
                if (typeof chrome !== 'undefined' && chrome.windows) {
                  chrome.windows.getCurrent((currentWin) => {
                    const winId = currentWin.id;
                    chrome.windows.create({
                      url: chrome.runtime.getURL(`sidepanel.html?mode=popup&windowId=${winId}`),
                      type: 'popup',
                      width: 750,
                      height: 900
                    });
                    
                    if (winId) {
                      chrome.runtime.sendMessage({ type: 'POP_OUT', windowId: winId });
                    }
                  });
                }
              }} 
              title="창 분리하기" 
              className={styles.iconBtn}
            >
              <ExternalLink size={16} />
            </button>
          )}

          <button onClick={clearItems} title="전체 삭제" className={styles.iconBtn}><Trash2 size={16} /></button>
          <button onClick={generateMarkdownReport} title="리포트 추출" className={`${styles.iconBtn} ${copyStatus ? styles.success : ''}`}><FileText size={16} /></button>
        </div>
      </header>

      {!selectedSessionId ? (
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
            <button 
              className={`${styles.startBtn} ${isAuditing ? styles.loading : ''}`} 
              onClick={handleStartAudit}
              disabled={isAuditing}
            >
              {isAuditing ? '진단 중...' : '진단 시작 (Start Audit)'}
            </button>
            {sessions.length > 0 && (
              <div className={styles.historyOption}>
                <p>
                  이 사이트에 대한 과거 진단 기록이 있습니다.<br/>
                  (최근 기록: {new Date(sessions[0].timestamp).toLocaleString()})
                </p>
                <div className={styles.optionBtns}>
                   <button className={styles.viewPrevBtn} onClick={() => setSelectedSessionId(sessions[0].scanId)}>
                     최근 결과 보기
                   </button>
                </div>
              </div>
            )}
          </div>
          <div className={styles.features}>
            <div className={styles.featItem}><CheckCircle2 size={14} /> KWCAG 2.2 지침</div>
            <div className={styles.featItem}><CheckCircle2 size={14} /> 실시간 판정</div>
          </div>
        </div>
      ) : (
        <div className={styles.workArea}>
          <div className={styles.statsSummary}>
            <div className={`${styles.statLine} ${statusFilter === 'ALL' ? styles.active : ''}`} onClick={() => setStatusFilter('ALL')}>전체 <span>{sessionItems.length}</span></div>
            <div className={`${styles.statLine} ${styles.fail} ${statusFilter === '오류' ? styles.active : ''}`} onClick={() => setStatusFilter('오류')}>오류 <span>{sessionItems.filter(i => i.currentStatus === '오류').length}</span></div>
            <div className={`${styles.statLine} ${styles.review} ${statusFilter === '검토 필요' ? styles.active : ''}`} onClick={() => setStatusFilter('검토 필요')}>검토 필요 <span>{sessionItems.filter(i => i.currentStatus === '검토 필요').length}</span></div>
            <div className={`${styles.statLine} ${styles.pass} ${statusFilter === '적절' ? styles.active : ''}`} onClick={() => setStatusFilter('적절')}>검토 완료 <span>{sessionItems.filter(i => i.currentStatus === '적절').length}</span></div>
          </div>

          <div className={styles.sessionSelector}>
            <Clock size={12} />
            <select value={selectedSessionId || ""} onChange={(e) => setSelectedSessionId(Number(e.target.value))}>
              {sessions.map(s => (
                <option key={s.scanId} value={s.scanId}>
                  {new Date(s.timestamp).toLocaleString()} ({s.pageTitle})
                </option>
              ))}
            </select>
          </div>
          
          <div className={styles.groupedList}>
            {allGroupedItems.map((group) => {
              const isExpanded = expandedGroups.includes(group.gid);
              const hasError = group.items.some(i => i.currentStatus === '오류');

              return (
                <section key={group.gid} className={styles.groupSection}>
                  <header className={`${styles.groupHeader} ${hasError ? styles.hasError : ''}`} onClick={() => toggleGroup(group.gid)}>
                    <div className={styles.headerLeft}>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span className={styles.gidLabel}>{group.gid} {group.label}</span>
                    </div>
                    <div className={styles.headerRight}>
                      {(() => {
                        const total = group.items.length;
                        const manualScore = total > 0 ? group.items[0].manualScore : undefined;

                        if (manualScore !== undefined) {
                          return (
                            <span 
                              className={`${styles.scoreBadge} ${manualScore < 60 ? styles.bad : manualScore < 90 ? styles.warning : styles.good}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const val = prompt("점수 입력 (0-100):", manualScore.toString());
                                if (val !== null && selectedSessionId) setGuidelineScore(selectedSessionId, group.gid, parseInt(val));
                              }}
                              title="클릭하여 점수를 수정할 수 있습니다."
                            >
                              {manualScore}점 (수동)
                            </span>
                          );
                        }

                        if (total === 0) return (
                          <span 
                            className={styles.naBadge}
                            onClick={(e) => {
                              e.stopPropagation();
                              alert("N/A 항목은 검출된 요소가 없어 점수를 저장할 수 없습니다.");
                            }}
                          >
                            N/A
                          </span>
                        );

                        const pass = group.items.filter(i => i.currentStatus === '적절').length;
                        const fail = group.items.filter(i => ['오류', '부적절'].includes(i.currentStatus)).length;
                        const review = group.items.filter(i => ['검토 필요', '수정 권고'].includes(i.currentStatus)).length;
                        
                        if (fail === 0 && review > 0 && group.items.some(i => i.currentStatus === '검토 필요')) {
                          return (
                            <span 
                              className={`${styles.scoreBadge} ${styles.manual}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const val = prompt("수동 검사 점수 입력 (0-100):");
                                if (val !== null && selectedSessionId) setGuidelineScore(selectedSessionId, group.gid, parseInt(val));
                              }}
                              title="자동 진단이 어려운 항목입니다. 클릭하여 직접 점수를 입력하세요."
                            >
                              수동 검사 필요
                            </span>
                          );
                        }

                        let score = 100;
                        const exhaustiveGids = ['1.1.1', '1.3.1', '2.1.1', '2.4.2', '2.4.3', '2.5.3', '3.3.2'];
                        
                        if (exhaustiveGids.includes(group.gid)) {
                          score = Math.round(((pass * 100 + review * 50) / (total * 100)) * 100);
                        } else {
                          const rawScore = 100 * Math.pow(0.8, fail) * Math.pow(0.95, review);
                          score = Math.round(rawScore);
                          if (total > 0 && pass === total) score = 100;
                        }

                        return (
                          <span 
                            className={`${styles.scoreBadge} ${score < 60 ? styles.bad : score < 90 ? styles.warning : styles.good}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const val = prompt("점수 직접 수정 (0-100):", score.toString());
                              if (val !== null && selectedSessionId) setGuidelineScore(selectedSessionId, group.gid, parseInt(val));
                            }}
                            title="클릭하여 점수를 직접 수정할 수 있습니다."
                          >
                            {score}점
                          </span>
                        );
                      })()}
                      <span className={styles.countBadge}>{group.items.length}</span>
                    </div>
                  </header>
                  
                  {isExpanded && (
                    <div className={styles.groupContent}>
                      {group.items.length === 0 ? (
                        <div className={styles.emptyState}>검출된 항목이 없습니다.</div>
                      ) : (
                        group.items.map((item) => (
                          <article key={item.id} onClick={() => { setSelectedId(item.id); handleLocate(item.elementInfo.selector); }} className={`${styles.miniCard} ${selectedId === item.id ? styles.selected : ''}`}>
                            <div className={styles.cardLayout}>
                              {item.elementInfo.src && item.elementInfo.src !== 'N/A' && (
                                <div className={styles.thumbBox}><img src={item.elementInfo.src} alt="미리보기" /></div>
                              )}
                              <div className={styles.cardMain}>
                                <div className={styles.cardTop}>
                                  <div className={`${styles.miniStatus} ${styles[item.currentStatus.replace(' ', '_')]}`}>{item.currentStatus}</div>
                                </div>
                                <h3>{item.result?.message}</h3>
                                {item.guideline_id === '1.1.1' && (
                                  <div className={styles.markupSnippet}>
                                    &lt;{item.elementInfo.tagName.toLowerCase()} <span className={styles.attrName}>{(item.elementInfo as any).sourceAttr || 'alt'}</span>=<span className={styles.attrVal}>"{item.elementInfo.alt || ''}"</span> ... /&gt;
                                  </div>
                                )}
                                <code className={styles.selector}>{item.elementInfo.selector}</code>
                              </div>
                            </div>
                            {selectedId === item.id && (
                              <div className={styles.miniDetail}>
                                <div className={styles.smartContextView}>
                                  {item.guideline_id === '1.1.1' ? (
                                    <>
                                      <span>...{item.context.smartContext.split(item.elementInfo.alt || "")[0]}</span>
                                      <span className={styles.highlight}>[{((item.elementInfo as any).sourceAttr || 'alt')}="{item.elementInfo.alt || ''}"]</span>
                                      <span>{item.context.smartContext.split(item.elementInfo.alt || "")[1]}...</span>
                                    </>
                                  ) : item.guideline_id === '1.3.2' && item.elementInfo.selector === 'outline' ? (
                                    <div className={styles.outlineView}>
                                      {(item.context as any).outline?.map((h: any, idx: number) => (
                                        <div key={idx} className={`${styles.outlineItem} ${styles['h'+h.level]}`}>
                                          <span className={styles.level}>H{h.level}</span>
                                          <span className={styles.text}>{h.text || '(텍스트 없음)'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <span>"{item.context.smartContext}"</span>
                                  )}
                                </div>
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
                        ))
                      )}
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
