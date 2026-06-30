#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""3分ニュース 公開ヘルパー（公開リポジトリ用）

承認済みの下書き data/news.json を、本番の号 data/editions/<edition>.json に確定し、
data/index.json（号の一覧・新しい順）へ登録する。号はバックナンバーとして貯まる。

使い方:
    python publish.py            # 検証→号を確定→index更新
    python publish.py --check    # 検証のみ（書き込まない）
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DRAFT = ROOT / "data" / "news.json"
EDITIONS = ROOT / "data" / "editions"
INDEX = ROOT / "data" / "index.json"

REQUIRED_ITEM = {"id", "category", "title", "summary", "harry_take"}
CATEGORIES = {
    "鍼灸・東洋医学",
    "手技・徒手療法",
    "柔道整復・外傷",
    "スポーツ医学・運動",
    "栄養・食事",
    "AI×治療院経営",
    "集客・業界トレンド",
}


def validate(data: dict) -> list:
    errors = []
    if not data.get("edition"):
        errors.append("edition（YYYY-MM-DD）がありません")
    items = data.get("items", [])
    if len(items) != 3:
        errors.append(f"items は3本にしてください（現在 {len(items)} 本）")
    for i, it in enumerate(items, 1):
        missing = REQUIRED_ITEM - set(it)
        if missing:
            errors.append(f"item{i}: 欠けている項目 {missing}")
        if it.get("category") and it["category"] not in CATEGORIES:
            errors.append(f"item{i}: category '{it.get('category')}' は規定外")
        if not str(it.get("summary", "")).strip():
            errors.append(f"item{i}: summary が空です")
    return errors


def update_index(date: str, label: str):
    data = {"editions": []}
    if INDEX.exists():
        data = json.loads(INDEX.read_text(encoding="utf-8"))
    eds = [e for e in data.get("editions", []) if e.get("date") != date]
    eds.append({"date": date, "label": label})
    eds.sort(key=lambda e: e["date"], reverse=True)
    data["editions"] = eds
    INDEX.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    check_only = "--check" in sys.argv
    if not DRAFT.exists():
        print(f"❌ {DRAFT} が見つかりません（朝ルーティンの下書きが未保存）")
        sys.exit(1)

    data = json.loads(DRAFT.read_text(encoding="utf-8"))
    errors = validate(data)
    if errors:
        print("❌ 検証エラー:")
        for e in errors:
            print("  -", e)
        sys.exit(1)

    date = data["edition"]
    label = data.get("edition_label", date)
    print(f"✅ 検証OK ── {date} / 3本そろっています")
    for i, it in enumerate(data["items"], 1):
        print(f"   {i}. [{it['category']}] {it['title']}")

    if check_only:
        print("（--check のため書き込みなし）")
        return

    EDITIONS.mkdir(parents=True, exist_ok=True)
    dest = EDITIONS / f"{date}.json"
    dest.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    update_index(date, label)
    print(f"🗂  号を確定: {dest.relative_to(ROOT)}")
    print(f"🧾 index更新: {INDEX.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
