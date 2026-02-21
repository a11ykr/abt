#!/bin/bash
cd docs/algorithms/

# Rename files and update headers
declare -A file_map=(
  ["111-processor.md"]="111-processor.md"
  ["121-processor.md"]="122-processor.md"  # 멀티미디어 대체 수단 -> 1.2.2 (assuming 자막 is 1.2.1, wait let's just make it 122 if it's 1.2.2)
  ["131-processor.md"]="332-processor.md"  # 표의 구성 -> 3.3.2
  ["132-processor.md"]="331-processor.md"  # 콘텐츠의 선형화 -> 3.3.1
  ["133-processor.md"]="132-processor.md"  # 감각적 특징 (명확한 지시사항 제공) -> 1.3.2
  ["141-processor.md"]="131-processor.md"  # 색상 활용 (색에 무관한 콘텐츠 인식) -> 1.3.1
  ["142-processor.md"]="133-processor.md"  # 명암비 -> 1.3.3
  ["143-processor.md"]="134-processor.md"  # 배경음 제어 -> 1.3.4
  ["144-processor.md"]="135-processor.md"  # 콘텐츠 간의 구분 -> 1.3.5
  ["211-processor.md"]="211-processor.md"
  ["212-processor.md"]="212-processor.md"
  ["213-processor.md"]="213-processor.md"
  ["214-processor.md"]="214-processor.md"
  ["221-processor.md"]="221-processor.md"
  ["222-processor.md"]="222-processor.md"
  ["231-processor.md"]="231-processor.md"
  ["241-processor.md"]="241-processor.md"
  ["242-processor.md"]="242-processor.md"
  ["243-processor.md"]="243-processor.md"
  ["251-processor.md"]="251-processor.md"
  ["252-processor.md"]="252-processor.md"
  ["253-processor.md"]="253-processor.md"
)

declare -A header_map=(
  ["111-processor.md"]="1.1.1"
  ["122-processor.md"]="1.2.2"
  ["332-processor.md"]="3.3.2"
  ["331-processor.md"]="3.3.1"
  ["132-processor.md"]="1.3.2"
  ["131-processor.md"]="1.3.1"
  ["133-processor.md"]="1.3.3"
  ["134-processor.md"]="1.3.4"
  ["135-processor.md"]="1.3.5"
  ["211-processor.md"]="2.1.1"
  ["212-processor.md"]="2.1.2"
  ["213-processor.md"]="2.1.3"
  ["214-processor.md"]="2.1.4"
  ["221-processor.md"]="2.2.1"
  ["222-processor.md"]="2.2.2"
  ["231-processor.md"]="2.3.1"
  ["241-processor.md"]="2.4.1"
  ["242-processor.md"]="2.4.2"
  ["243-processor.md"]="2.4.3"
  ["251-processor.md"]="2.5.1"
  ["252-processor.md"]="2.5.2"
  ["253-processor.md"]="2.5.3"
)

declare -A name_map=(
  ["111-processor.md"]="적절한 대체 텍스트 제공"
  ["122-processor.md"]="멀티미디어 대체 수단"
  ["332-processor.md"]="표의 구성"
  ["331-processor.md"]="콘텐츠의 선형 구조"
  ["132-processor.md"]="명확한 지시사항 제공"
  ["131-processor.md"]="색에 무관한 콘텐츠 인식"
  ["133-processor.md"]="텍스트 콘텐츠의 명도 대비"
  ["134-processor.md"]="자동 재생 음성 제어"
  ["135-processor.md"]="콘텐츠 간의 구분"
  ["211-processor.md"]="키보드 사용 보장"
  ["212-processor.md"]="초점 이동과 표시"
  ["213-processor.md"]="조작 가능"
  ["214-processor.md"]="문자 단축키"
  ["221-processor.md"]="응답 시간 조절"
  ["222-processor.md"]="정지 기능 제공"
  ["231-processor.md"]="깜빡임과 번쩍임 사용 제한"
  ["241-processor.md"]="반복 영역 건너뛰기"
  ["242-processor.md"]="제목 제공"
  ["243-processor.md"]="적절한 링크 텍스트"
  ["251-processor.md"]="단일 포인터 입력 지원"
  ["252-processor.md"]="포인터 입력 취소"
  ["253-processor.md"]="레이블과 네임"
)

# Step 1: Rename files first
for old_file in "${!file_map[@]}"; do
  new_file="${file_map[$old_file]}"
  if [ -f "$old_file" ]; then
    if [ "$old_file" != "$new_file" ]; then
      mv "$old_file" "$new_file"
      echo "Renamed $old_file -> $new_file"
    fi
  fi
done

# Step 2: Update headers and text
for file in "${!header_map[@]}"; do
  if [ -f "$file" ]; then
    num="${header_map[$file]}"
    name="${name_map[$file]}"
    
    # Replace the first line completely to avoid regex issues
    sed -i '' "1s/.*/# ABT-${num}-Processor: ${name} 알고리즘 v1.0/" "$file"
    
    # Fix KWCAG 6.x.x typos in text
    sed -i '' -E "s/KWCAG 6\.[0-9]\.[0-9]/KWCAG ${num}/g" "$file"
    # Fix KWCAG 1.x / 2.x typos in text to match new num
    sed -i '' -E "s/KWCAG 1\.[0-9]/KWCAG ${num}/g" "$file"
    sed -i '' -E "s/WCAG\/KWCAG 1\.[0-9]/KWCAG ${num}/g" "$file"
    
    # Standardize KWCAG 2.2-2.5.1 -> KWCAG 2.5.1
    sed -i '' -E "s/KWCAG 2\.2-2\.5\.[0-9]/KWCAG ${num}/g" "$file"

    echo "Updated content in $file"
  fi
done
