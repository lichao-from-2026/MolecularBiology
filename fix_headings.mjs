import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllMdxFiles(rootPath) {
    const files = [];
    function walk(dir) {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                walk(fullPath);
            } else if (item.endsWith('.mdx') || item.endsWith('.md')) {
                files.push(fullPath);
            }
        }
    }
    walk(rootPath);
    return files;
}

function addHeadingNumbers(content) {
    const lines = content.split('\n');
    const result = [];
    let level1Num = 0;
    let level2Num = 0;
    let level3Num = 0;
    let level4Num = 0;

    const chineseNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        const match = line.match(/^(#{1,4})\s+(.+)$/);
        if (match) {
            const hashes = match[1].length;
            const contentText = match[2];

            if (hashes === 1) {
                if (!/^[一二三四五六七八九十]、/.test(contentText)) {
                    level1Num++;
                    level2Num = 0;
                    level3Num = 0;
                    level4Num = 0;
                    const numStr = chineseNums[level1Num - 1] || String(level1Num);
                    line = `# ${numStr}、${contentText}`;
                }
            } else if (hashes === 2) {
                if (!/^\d+\./.test(contentText)) {
                    level2Num++;
                    level3Num = 0;
                    level4Num = 0;
                    line = `## ${level2Num}. ${contentText}`;
                }
            } else if (hashes === 3) {
                if (!/^\d+\.\d+/.test(contentText)) {
                    level3Num++;
                    level4Num = 0;
                    line = `### ${level2Num}.${level3Num} ${contentText}`;
                }
            } else if (hashes === 4) {
                if (!/^\d+\.\d+\.\d+/.test(contentText)) {
                    level4Num++;
                    line = `#### ${level2Num}.${level3Num}.${level4Num} ${contentText}`;
                }
            }
        }
        result.push(line);
    }

    return result.join('\n');
}

function main() {
    const docsPath = path.join(__dirname, 'docs');
    const files = getAllMdxFiles(docsPath);

    let fixedCount = 0;
    for (const filepath of files) {
        const content = fs.readFileSync(filepath, 'utf-8');
        const newContent = addHeadingNumbers(content);

        if (content !== newContent) {
            fs.writeFileSync(filepath, newContent, 'utf-8');
            console.log(`Fixed: ${path.basename(filepath)}`);
            fixedCount++;
        }
    }

    console.log(`\nTotal files fixed: ${fixedCount}`);
}

main();
