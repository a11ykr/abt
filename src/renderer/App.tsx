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
  const isElectron = !!(window as any).electronAPI;
  const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime && !!chrome.runtime.sendMessage;
  const { items, setItems, addReport, updateItemStatus, removeSession, clearItems, projectName } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [judgingId, setJudgingId] = useState<string | null>(null);
  const [tempComment, setTempComment] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [copyStatus, setCopyStatus] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['5', '6', '7', '8']);
  const [isPropPanelOpen, setIsPropPanelOpen] = useState(false);
  const [selectedSessionUrl, setSelectedSessionUrl] = useState<string | null>(null);

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

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
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
    // 1. Electron Messaging Pattern
    let cleanupElectron: (() => void) | undefined;
    if (isElectron) {
      cleanupElectron = (window as any).electronAPI.onUpdateAbtList((data: any) => {
        console.log("ABT DEBUG: Data received via Electron:", data);
        setIsConnected(true);
        addReport(data);
      });
    }

    // 2. Chrome Extension Messaging Pattern (Task 3 Implementation Target)
    const extensionListener = (message: any) => {
      if (message.type === 'UPDATE_ABT_LIST') {
        console.log("ABT DEBUG: Data received via Extension:", message.data);
        setIsConnected(true);
        addReport(message.data);
      }
    };

    if (isExtension) {
      chrome.runtime.onMessage.addListener(extensionListener);
      // Initial connection check could go here
      setIsConnected(true); 
    }

    return () => {
      if (cleanupElectron) cleanupElectron();
      if (isExtension) {
        chrome.runtime.onMessage.removeListener(extensionListener);
      }
    };
  }, [addReport, isElectron, isExtension]);

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

  const generateMarkdownReport = () => {
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
    
    navigator.clipboard.writeText(md).then(() => {
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

    if (isElectron) {
      (window as any).electronAPI.sendToBrowser(message);
    } else if (isExtension) {
      // Extension messaging (Task 3)
      chrome.runtime.sendMessage(message);
    } else {
      console.log("ABT: Locate element requested (No API):", selector);
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar} aria-label="프로젝트 내비게이션">
        <header className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.logoBox}>
              <Shield size={20} strokeWidth={2.5} />
            </div>
            <div className={styles.titleGroup}>
              <h1>ABT Engine</h1>
              <span>Desktop Auditor</span>
            </div>
          </div>
        </header>
        
        <nav className={styles.navArea}>
          <h2>검수 세션</h2>
          <ul className={styles.sessionList}>
            {sessions.length === 0 ? (
              <li className={styles.noSession}>No scan sessions yet</li>
            ) : (
              sessions.map((session, idx) => (
                <li key={idx} className={styles.sessionItem}>
                  <button 
                    className={`${styles.sessionBtn} ${selectedSessionUrl === session.url ? styles.active : ''}`}
                    onClick={() => setSelectedSessionUrl(session.url)}
                  >
                    <div className={styles.pulse}></div>
                    <div className={styles.sessionInfo}>
                      <span className={styles.sessionTitle}>
                        {session.timestamp ? (
                          `${new Date(session.timestamp).toLocaleDateString()} ${new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`
                        ) : ""} {session.pageTitle || "Untitled Page"}
                      </span>
                      <span className={styles.sessionUrl}>{session.url || "No URL"}</span>
                    </div>
                  </button>
                  <button 
                    className={styles.sessionDeleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`'${session.pageTitle}' 세션의 모든 데이터를 삭제하시겠습니까?`)) {
                        removeSession(session.url);
                        if (selectedSessionUrl === session.url) {
                          setSelectedSessionUrl(null);
                        }
                      }
                    }}
                    title="세션 삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))
            )}
          </ul>

          <div className={styles.treeMenuSection}>
            <div className={styles.treeHeader}>
              <h2>KWCAG 2.2 지침</h2>
              <button onClick={() => setActiveTab("ALL")} className={`${styles.allBtn} ${activeTab === "ALL" ? styles.active : ""}`}>전체</button>
            </div>
            
            <ul className={styles.treeList}>
              {kwcagHierarchy.map(group => {
                const groupItemCount = sessionItems.filter(i => group.items.some(gi => gi.id === i.guideline_id)).length;
                return (
                  <li key={group.id} className={styles.treeGroup}>
                    <button 
                      className={styles.treeGroupBtn} 
                      onClick={() => toggleNode(group.id)}
                    >
                      {expandedNodes.includes(group.id) ? <FolderOpen size={14} className={styles.treeIcon} /> : <Folder size={14} className={styles.treeIcon} />}
                      <span className={styles.groupTitle}>{group.title}</span>
                      <span className={styles.groupCount}>{groupItemCount > 0 && groupItemCount}</span>
                      {expandedNodes.includes(group.id) ? <ChevronDown size={14} className={styles.chevron} /> : <ChevronRight size={14} className={styles.chevron} />}
                    </button>
                    
                    {expandedNodes.includes(group.id) && (
                      <ul className={styles.treeChildren}>
                        {group.items.map(item => {
                          const count = sessionItems.filter(i => i.guideline_id === item.id).length;
                          return (
                            <li key={item.id}>
                              <button
                                className={`${styles.treeItemBtn} ${activeTab === item.id ? styles.active : ''}`}
                                onClick={() => setActiveTab(item.id)}
                              >
                                <FileCode2 size={12} className={styles.itemIcon} />
                                <span className={styles.itemId}>{item.id}</span>
                                <span className={styles.itemLabel} title={item.label}>{item.label}</span>
                                {count > 0 && <span className={styles.itemCount}>{count}</span>}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <footer className={styles.sidebarFooter}>
          <div className={styles.connStatus}>
            <span>Browser Connection</span>
            <div className={`${styles.badge} ${isConnected ? styles.connected : styles.waiting}`}>
              <div className={styles.dot}></div>
              {isConnected ? 'On' : 'Off'}
            </div>
          </div>
        </footer>
      </aside>

      <main className={styles.mainBoard}>
        <header className={styles.topHeader}>
          <div className={styles.headingArea}>
            <h2>{projectName} - 검수 보드</h2>
            <ul className={styles.summaryStats}>
      <li 
        className={`${styles.allSummary} ${statusFilter === 'ALL' ? styles.active : ''}`}
        onClick={() => setStatusFilter('ALL')}
      >
        전체 {sessionItems.length}
      </li>
      <li 
        className={`${styles.failSummary} ${statusFilter === '오류' ? styles.active : ''}`}
        onClick={() => setStatusFilter('오류')}
      >
        오류 {sessionItems.filter(i => i.currentStatus === '오류').length}
      </li>
      <li 
        className={`${styles.warnSummary} ${statusFilter === '수정 권고' ? styles.active : ''}`}
        onClick={() => setStatusFilter('수정 권고')}
      >
        수정 권고 {sessionItems.filter(i => i.currentStatus === '수정 권고').length}
      </li>
      <li 
        className={`${styles.reviewSummary} ${statusFilter === '검토 필요' ? styles.active : ''}`}
        onClick={() => setStatusFilter('검토 필요')}
      >
        검토 필요 {sessionItems.filter(i => i.currentStatus === '검토 필요').length}
      </li>
            </ul>
          </div>
          <div className={styles.topActions}>
            <button 
              onClick={() => {
                if(window.confirm('정말 모든 검수 데이터를 초기화하시겠습니까?')) {
                  clearItems();
                }
              }}
              className={styles.clearBtn}
              title="검수 데이터 전체 삭제"
            >
              <Trash2 size={16} />
              <span className={styles.btnText}>전체 삭제</span>
            </button>
            <button 
              onClick={generateMarkdownReport}
              className={`${styles.reportBtn} ${copyStatus ? styles.copied : styles.ready}`}
            >
              {copyStatus ? <CheckCircle2 size={18} /> : <FileText size={18} />}
              {copyStatus ? "리포트 복사됨!" : "리포트 추출 (Jira용)"}
            </button>
          </div>
        </header>



        <div className={styles.boardBody}>
          <section className={`${styles.contentArea} ${styles.customScrollbar}`}>
            {filteredItems.length === 0 ? (
              <div className={styles.emptyState}>
                <Search size={40} />
                <p>No Data Detected</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <article 
                  key={item.id} 
                  onClick={() => {
                    setSelectedId(item.id);
                    handleLocate(item.elementInfo.selector);
                  }}
                  className={`${styles.card} ${selectedId === item.id ? styles.selected : ''}`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.meta}>
                      <span className={styles.badge}>{getGuidelineName(item.guideline_id)}</span>
                      <code>{item.elementInfo?.selector}</code>
                    </div>
                    <div className={`${styles.statusTag} ${
                      item.currentStatus === '오류' ? styles.fail :
                      item.currentStatus === '부적절' ? styles.inappropriate :
                      item.currentStatus === '수정 권고' ? styles.recommendation :
                      item.currentStatus === '검토 필요' ? styles.needs_review :
                      styles.pass
                    }`}>
                      {item.currentStatus === '오류' && <AlertCircle size={12} />}
                      {item.currentStatus}
                    </div>
                  </div>
                  
                  <div className={styles.mainInfo}>
                    <div className={styles.preview}>
                      {item.elementInfo.tagName === 'VIDEO' ? (
                        <div className={styles.videoIcon}>
                          <Clock size={32} />
                          <span>VIDEO</span>
                        </div>
                      ) : (
                        <img src={item.elementInfo?.src} alt="" />
                      )}
                    </div>
                    <div className={styles.textInfo}>
                      <h3>{item.result?.message}</h3>
                      <div className={styles.contextBox}>
                        <h4>Context Analysis</h4>
                        <p>"...{item.context?.smartContext}..."</p>
                      </div>
                      {item.finalComment && (
                        <div className={styles.commentBox}>
                          <h4>Expert Judgement</h4>
                          <p>{item.finalComment}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {judgingId === item.id ? (
                    <div className={styles.judgingArea}>
                      <div className={styles.quickChips}>
                        <button onClick={() => setTempComment("주변 정보와 중복되어 장식용 처리를 요청드립니다.")}>#중복정보</button>
                        <button onClick={() => setTempComment("기능형 이미지에 적절한 동작 설명이 포함되어 있습니다.")}>#적절한동작</button>
                        <button onClick={() => setTempComment("불필요한 수식어(사진, 이미지) 삭제를 수정 권고(요청)합니다.")}>#수식어삭제</button>
                      </div>
                      <textarea 
                        value={tempComment}
                        onChange={(e) => setTempComment(e.target.value)}
                        placeholder="개발자에게 전달할 정성 평가 의견을 입력하세요..."
                      />
                      <div className={styles.btnGroup}>
                        <button onClick={() => setJudgingId(null)} className={styles.cancelBtn}>취소</button>
                        <button onClick={() => handleJudge(item.id, '적절')} className={styles.passBtn}>적절함 확인</button>
                        <button onClick={() => handleJudge(item.id, '수정 권고')} className={styles.recomBtn}>개선 권고 요청</button>
                        <button onClick={() => handleJudge(item.id, '부적절')} className={styles.inappBtn}>수정 요청 (부적절)</button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.cardFooter}>
                      <div className={styles.actionGroup}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setJudgingId(item.id); setTempComment(item.finalComment); }}
                          className={styles.actionBtn}
                        >
                          <Edit3 size={14} /> 수정
                        </button>
                        {item.currentStatus === '검토 필요' ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleJudge(item.id, '적절'); }}
                            className={`${styles.actionBtn} ${styles.confirmBtn}`}
                          >
                            <CheckCircle2 size={14} /> 검토 완료
                          </button>
                        ) : item.currentStatus === '적절' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleJudge(item.id, '검토 필요'); }}
                            className={`${styles.actionBtn} ${styles.undoBtn}`}
                          >
                            <RotateCcw size={14} /> 검토 필요로 되돌리기
                          </button>
                        )}
                      </div>
                      <button 
                        className={styles.detailBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedId === item.id && isPropPanelOpen) {
                            setIsPropPanelOpen(false);
                          } else {
                            setSelectedId(item.id);
                            setIsPropPanelOpen(true);
                            handleLocate(item.elementInfo.selector);
                          }
                        }}
                      >
                        <span>자세히 보기</span>
                        {selectedId === item.id && isPropPanelOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
                      </button>
                    </div>
                  )}
                </article>
              ))
            )}
          </section>

          {isPropPanelOpen && (
            <aside className={styles.propPanel}>
              <div className={styles.propHeader}>
                <h3><div className={styles.indicator}></div> 상세 속성 및 이력</h3>
                <button className={styles.closeBtn} onClick={() => setIsPropPanelOpen(false)}>
                  <X size={18} />
                </button>
              </div>
              {selectedItem ? (
                <div className={`${styles.propContent} ${styles.customScrollbar}`}>
                  <section>
                    <h4>Technical Metadata</h4>
                    <div className={styles.techMeta}>
                      {`<${selectedItem.elementInfo.tagName.toLowerCase()} ...>`}
                    </div>
                    <div className={styles.tagList}>
                      <div className={styles.tagItem}>
                        <label>Tag</label>
                        <span>{selectedItem.elementInfo.tagName}</span>
                      </div>
                      <div className={styles.tagItem}>
                        <label>ID</label>
                        <span>{selectedItem.guideline_id}</span>
                      </div>
                    </div>
                  </section>
                  
                  <section>
                    <h4>Judgment Timeline</h4>
                    <ul className={styles.timeline}>
                      {selectedItem.history.map((log: any, i: number) => (
                        <li key={i}>
                          <div className={styles.dot}></div>
                          <time>{log.timestamp}</time>
                          <div className={styles.logStatus}>{log.status}</div>
                          <p className={styles.logComment}>"{log.comment}"</p>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h4>Compliance Guide</h4>
                    <div className={styles.guideBox}>
                      <Info size={20} style={{ flexShrink: 0 }} />
                      <p>
                        {selectedItem.guideline_id === '1.1.1' ? "텍스트가 아닌 콘텐츠에는 그 의미나 용도를 알 수 있도록 대체 텍스트를 제공해야 합니다." : 
                         selectedItem.guideline_id === '1.2' ? "멀티미디어 콘텐츠에는 자막, 대본 또는 수어를 제공해야 합니다." : 
                         "웹 접근성 준수 지침에 따라 적절한 대체 수단을 제공하세요."}
                      </p>
                    </div>
                  </section>
                </div>
              ) : (
                <div className={styles.emptyProp}>
                  <ChevronRight size={32} />
                  <p>Select an item to view details</p>
                </div>
              )}
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
