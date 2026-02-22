import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const kwcagHierarchy = [
  {
    id: "5",
    title: "5. 인식의 용이성",
    items: [
      { id: "511", label: "적절한 대체 텍스트 제공" },
      { id: "521", label: "자막 제공" },
      { id: "531", label: "표의 구성" },
      { id: "532", label: "콘텐츠의 선형구조" },
      { id: "533", label: "명확한 지시사항 제공" },
      { id: "541", label: "색에 무관한 콘텐츠 인식" },
      { id: "542", label: "자동 재생 금지" },
      { id: "543", label: "텍스트 콘텐츠의 명도 대비" },
      { id: "544", label: "콘텐츠 간의 구분" }
    ]
  },
  {
    id: "6",
    title: "6. 운용의 용이성",
    items: [
      { id: "611", label: "키보드 사용 보장" },
      { id: "612", label: "초점 이동과 표시" },
      { id: "613", label: "조작 가능" },
      { id: "614", label: "문자 단축키" },
      { id: "621", label: "응답시간 조절" },
      { id: "622", label: "정지 기능 제공" },
      { id: "631", label: "깜빡임과 번쩍임 사용 제한" },
      { id: "641", label: "반복 영역 건너뛰기" },
      { id: "642", label: "제목 제공" },
      { id: "643", label: "적절한 링크 텍스트" },
      { id: "644", label: "고정된 참조 위치 정보" },
      { id: "651", label: "단일 포인터 입력 지원" },
      { id: "652", label: "포인터 입력 취소" },
      { id: "653", label: "레이블과 네임" },
      { id: "654", label: "동작기반 작동" }
    ]
  },
  {
    id: "7",
    title: "7. 이해의 용이성",
    items: [
      { id: "711", label: "기본 언어 표시" },
      { id: "721", label: "사용자 요구에 따른 실행" },
      { id: "722", label: "찾기 쉬운 도움 정보" },
      { id: "731", label: "오류 정정" },
      { id: "732", label: "레이블 제공" },
      { id: "733", label: "접근 가능한 인증" },
      { id: "734", label: "반복 입력 정보" }
    ]
  },
  {
    id: "8",
    title: "8. 견고성",
    items: [
      { id: "811", label: "마크업 오류 방지" },
      { id: "821", label: "웹 애플리케이션 접근성 준수" }
    ]
  }
];

export interface ABTItem {
  id: string;
  guideline_id: string;
  elementInfo: {
    selector: string;
    tagName: string;
    src?: string;
  };
  context: {
    smartContext: string;
  };
  result: {
    status: string;
    message: string;
  };
  currentStatus: string;
  finalComment: string;
  history: {
    timestamp: string;
    status: string;
    comment: string;
  }[];
}

interface ABTStore {
  items: ABTItem[];
  projectName: string;
  setItems: (items: ABTItem[]) => void;
  updateItemStatus: (id: string, judge: string) => void;
  clearItems: () => void;
  setProjectName: (name: string) => void;
}

export const useStore = create<ABTStore>()(
  persist(
    (set) => ({
      items: [],
      projectName: 'Default Project',
      setItems: (items) => set({ items }),
      updateItemStatus: (id, judge) => set((state) => ({
        items: state.items.map((item) => 
          item.id === id ? { ...item, judge } : item
        )
      })),
      clearItems: () => set({ items: [] }),
      setProjectName: (projectName) => set({ projectName }),
    }),
    {
      name: 'abt-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
