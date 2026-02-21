import os
import re

file_map = {
    "111-processor.md": ("111-processor.md", "1.1.1", "적절한 대체 텍스트 제공"),
    "121-processor.md": ("122-processor.md", "1.2.2", "멀티미디어 대체 수단"),
    "131-processor.md": ("332-processor.md", "3.3.2", "표의 구성"),
    "132-processor.md": ("331-processor.md", "3.3.1", "콘텐츠의 선형 구조"),
    "133-processor.md": ("132-processor.md", "1.3.2", "명확한 지시사항 제공"),
    "141-processor.md": ("131-processor.md", "1.3.1", "색에 무관한 콘텐츠 인식"),
    "142-processor.md": ("133-processor.md", "1.3.3", "텍스트 콘텐츠의 명도 대비"),
    "143-processor.md": ("134-processor.md", "1.3.4", "자동 재생 음성 제어"),
    "144-processor.md": ("135-processor.md", "1.3.5", "콘텐츠 간의 구분"),
    "211-processor.md": ("211-processor.md", "2.1.1", "키보드 사용 보장"),
    "212-processor.md": ("212-processor.md", "2.1.2", "초점 이동과 표시"),
    "213-processor.md": ("213-processor.md", "2.1.3", "조작 가능"),
    "214-processor.md": ("214-processor.md", "2.1.4", "문자 단축키"),
    "221-processor.md": ("221-processor.md", "2.2.1", "응답 시간 조절"),
    "222-processor.md": ("222-processor.md", "2.2.2", "정지 기능 제공"),
    "231-processor.md": ("231-processor.md", "2.3.1", "깜빡임과 번쩍임 사용 제한"),
    "241-processor.md": ("241-processor.md", "2.4.1", "반복 영역 건너뛰기"),
    "242-processor.md": ("242-processor.md", "2.4.2", "제목 제공"),
    "243-processor.md": ("243-processor.md", "2.4.3", "적절한 링크 텍스트"),
    "251-processor.md": ("251-processor.md", "2.5.1", "단일 포인터 입력 지원"),
    "252-processor.md": ("252-processor.md", "2.5.2", "포인터 입력 취소"),
    "253-processor.md": ("253-processor.md", "2.5.3", "레이블과 네임"),
}

os.chdir("docs/algorithms")

# Rename files
for old_name, (new_name, num, title) in file_map.items():
    if os.path.exists(old_name) and old_name != new_name:
        os.rename(old_name, new_name)
        print(f"Renamed {old_name} -> {new_name}")

# Update contents
for old_name, (new_name, num, title) in file_map.items():
    if os.path.exists(new_name):
        with open(new_name, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        # Replace title (line 0)
        lines[0] = f"# ABT-{num}-Processor: {title} 알고리즘 v1.0\n"
        
        content = "".join(lines)
        
        # Replace wrong KWCAG references in text
        content = re.sub(r"KWCAG 6\.\d\.\d", f"KWCAG {num}", content)
        content = re.sub(r"KWCAG 2\.2-2\.5\.\d", f"KWCAG {num}", content)
        
        with open(new_name, "w", encoding="utf-8") as f:
            f.write(content)
        
        print(f"Updated content for {new_name}")

