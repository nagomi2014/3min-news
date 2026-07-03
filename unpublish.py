#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""3分ニュース ── 取り下げ（公開済みの号をアプリから消す）

指定日の号を data/index.json から取り除き、data/editions/<date>.json を削除する。
「自動公開したが内容がまずい」と気づいたときの“ワンタップ削除”用。

使い方:
    python unpublish.py 2026-07-04
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
EDITIONS = ROOT / "data" / "editions"
INDEX = ROOT / "data" / "index.json"


def main():
    if len(sys.argv) < 2:
        print("使い方: python unpublish.py YYYY-MM-DD")
        sys.exit(1)
    date = sys.argv[1]

    if not INDEX.exists():
        print("❌ index.json がありません")
        sys.exit(1)

    data = json.loads(INDEX.read_text(encoding="utf-8"))
    eds = data.get("editions", [])
    target = [e for e in eds if e.get("date") == date]
    if target:
        print(f"🗑  取り下げます: {date}（{target[0].get('label', date)}）")
    else:
        print(f"⚠  {date} の号は index に登録されていません（既に取り下げ済み？）")

    data["editions"] = [e for e in eds if e.get("date") != date]
    INDEX.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"🧾 index.json を更新（{len(eds)}件 → {len(data['editions'])}件）")

    f = EDITIONS / f"{date}.json"
    if f.exists():
        f.unlink()
        print(f"🧹 号ファイルを削除: data/editions/{date}.json")
    else:
        print("（号ファイルは既にありません）")

    print(f"✅ 取り下げ完了: {date}  ── push すればアプリから消えます")


if __name__ == "__main__":
    main()
