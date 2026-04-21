# PowerShell script to fix markdown heading formats
# Format: # 一、 for level 1, ## 1. for level 2, ### 1.1 for level 3, #### 1.1.1 for level 4

function Get-MarkdownFiles {
    param([string]$Path, [string]$Pattern = "*.mdx")
    Get-ChildItem -Path $Path -Recurse -File -Filter $Pattern | Where-Object { $_.FullName -notmatch "\\node_modules\\" }
}

function Add-HeadingNumbers {
    param(
        [string[]]$Lines,
        [string]$FilePath
    )

    $result = @()
    $level1Num = 0
    $level2Num = 0
    $level3Num = 0
    $level4Num = 0
    $prevLevel = 0

    $chineseNums = @("", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十")

    foreach ($line in $Lines) {
        if ($line -match '^(#{1,4})\s+(.+)$') {
            $hashes = $matches[1].Length
            $content = $matches[2]

            if ($hashes -eq 1) {
                # Level 1: # 一、Xxxx (keep as is, only add Chinese numeral if not present)
                if ($content -notmatch "^[一二三四五六七八九十]、") {
                    $level1Num++
                    $level2Num = 0
                    $level3Num = 0
                    $level4Num = 0
                    $numStr = $chineseNums[$level1Num]
                    $line = "# $numStr、$content"
                }
            }
            elseif ($hashes -eq 2) {
                # Level 2: ## 1. Xxxx
                if ($content -notmatch "^\d+\.") {
                    $level2Num++
                    $level3Num = 0
                    $level4Num = 0
                    $line = "## $level2Num. $content"
                }
            }
            elseif ($hashes -eq 3) {
                # Level 3: ### 1.1 Xxxx
                if ($content -notmatch "^\d+\.\d+") {
                    $level3Num++
                    $level4Num = 0
                    $line = "### $level2Num.$level3Num $content"
                }
            }
            elseif ($hashes -eq 4) {
                # Level 4: #### 1.1.1 Xxxx
                if ($content -notmatch "^\d+\.\d+\.\d+") {
                    $level4Num++
                    $line = "#### $level2Num.$level3Num.$level4Num $content"
                }
            }
        }
        $result += $line
    }

    return $result
}

# Process all MDX files in docs folder
$docsPath = "c:\DiskE\LY\molecular_biology\docs"
$files = Get-MarkdownFiles -Path $docsPath

$fixedCount = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $lines = $content -split "`n"

    $newLines = Add-HeadingNumbers -Lines $lines -FilePath $file.FullName
    $newContent = $newLines -join "`n"

    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
        $fixedCount++
    }
}

Write-Host "`nTotal files fixed: $fixedCount" -ForegroundColor Cyan
