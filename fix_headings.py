# -*- coding: utf-8 -*-
import os
import re

def get_all_mdx_files(root_path):
    files = []
    for dirpath, dirnames, filenames in os.walk(root_path):
        for filename in filenames:
            if filename.endswith('.mdx'):
                files.append(os.path.join(dirpath, filename))
    return files

def add_heading_numbers(content):
    lines = content.split('\n')
    result = []
    level1_num = 0
    level2_num = 0
    level3_num = 0
    level4_num = 0

    chinese_nums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

    for line in lines:
        match = re.match(r'^(#{1,4})\s+(.+)$', line)
        if match:
            hashes = len(match.group(1))
            content_text = match.group(2)

            if hashes == 1:
                # Level 1: # 一、Xxxx
                if not re.match(r'^[一二三四五六七八九十]、', content_text):
                    level1_num += 1
                    level2_num = 0
                    level3_num = 0
                    level4_num = 0
                    num_str = chinese_nums[level1_num - 1] if level1_num <= len(chinese_nums) else str(level1_num)
                    line = f"# {num_str}、{content_text}"

            elif hashes == 2:
                # Level 2: ## 1. Xxxx
                if not re.match(r'^\d+\.', content_text):
                    level2_num += 1
                    level3_num = 0
                    level4_num = 0
                    line = f"## {level2_num}. {content_text}"

            elif hashes == 3:
                # Level 3: ### 1.1 Xxxx
                if not re.match(r'^\d+\.\d+', content_text):
                    level3_num += 1
                    level4_num = 0
                    line = f"### {level2_num}.{level3_num} {content_text}"

            elif hashes == 4:
                # Level 4: #### 1.1.1 Xxxx
                if not re.match(r'^\d+\.\d+\.\d+', content_text):
                    level4_num += 1
                    line = f"#### {level2_num}.{level3_num}.{level4_num} {content_text}"

        result.append(line)

    return '\n'.join(result)

def main():
    docs_path = r"c:\DiskE\LY\molecular_biology\docs"
    files = get_all_mdx_files(docs_path)

    fixed_count = 0
    for filepath in files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        new_content = add_heading_numbers(content)

        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed: {os.path.basename(filepath)}")
            fixed_count += 1

    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == "__main__":
    main()
