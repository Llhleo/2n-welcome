#!/data/data/com.termux/files/usr/bin/bash
# 2nPush.sh - 一键 add、commit、推送 main 分支到 GitHub
# 用法: ./2nPush.sh -m "你的提交信息"

set -e  # 任一命令失败就停下

# 参数解析
while [[ $# -gt 0 ]]; do
    case "$1" in
        -m)
            shift
            if [[ $# -gt 0 ]]; then
                MSG="$1"
            else
                echo "❌ 错误：-m 后面必须跟提交信息"
                exit 1
            fi
            shift
            ;;
        -h|--help)
            echo "用法: $0 -m \"commit message\""
            echo "示例: $0 -m \"fix core path\""
            exit 0
            ;;
        *)
            echo "❌ 未知参数: $1"
            echo "使用 -h 查看帮助"
            exit 1
            ;;
    esac
done

if [[ -z "$MSG" ]]; then
    echo "❌ 错误：必须提供 -m 参数，例如: $0 -m \"init commit\""
    exit 1
fi

echo "👉 git add ."
git add .

echo "👉 git commit -m \"$MSG\""
git commit -m "$MSG"

echo "👉 git branch -M main"
git branch -M main

echo "👉 git push -u origin main -v"
git push -u origin main -v

echo "✅ 推送完成！"
