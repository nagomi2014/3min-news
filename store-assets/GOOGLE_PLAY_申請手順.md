# 3分ニュース ── Google Play 申請手順

PWA（公開済みサイト）をAndroidアプリにして Google Play で配信するための手順書です。
**矢上さんが操作する部分**と**私（Claude）がやる部分**を分けています。

- 公開済みサイト：https://nagomi2014.github.io/3min-news/
- アプリのパッケージ名（永久に変更不可）：`work.elife.news`
- プライバシーポリシー：https://nagomi2014.github.io/3min-news/privacy.html

> 論文アプリ（鍼灸エビデンス・デイリー）と同じ流れです。違いは URL とパッケージ名、
> そして **STEP4（assetlinks の置き場所）** だけ。ニュースは GitHub Pages なので少し置き方が違います（私が対応）。

---

## 全体像（所要：テスト14日を含む）

```
STEP1  Play Console アカウント … 既にお持ち → スキップ
STEP2  PWABuilder で アプリ本体(AAB)を生成          … 矢上さん（5分・私が画面指示）
STEP3  Play Console でアプリ作成 → AABアップロード   … 矢上さん
STEP4  署名証明書のSHA256で assetlinks を設置         … 私（GitHub Pagesのルートに置く）
STEP5  ストア情報・データセーフティ・レーティング入力 … 矢上さん（文面は用意済み store-listing.md）
STEP6  クローズドテスト（12人・14日間）             … 矢上さん＋テスター
STEP7  本番公開申請 → 審査 → 公開                    … 矢上さん
```

---

## STEP2　PWABuilder でアプリ本体(AAB)を生成
1. https://www.pwabuilder.com/ を開く
2. 入力欄に `https://nagomi2014.github.io/3min-news/` を入れて **Start**
3. **Package For Stores** → **Android** の **Generate Package**
4. オプション（重要）：
   - **Package ID**：`work.elife.news`
   - **App name**：3分ニュース
   - **Signing key**：**「Create new」**（新しい署名鍵を作る）
   - そのほかは既定のままでOK
5. **Download** した ZIP の中身：
   - `app-release-signed.aab` … Playにアップロードするファイル
   - `signing.keystore` ＋ パスワードのメモ … **絶対に無くさない／私に渡さず社長が保管**
   - `assetlinks.json` … STEP4で使う（SHA-256が入っている）
6. ZIP内 `next-steps.html` に署名鍵の **SHA-256 fingerprint** が載っています。それを私に教えてください。

## STEP3　Play Console でアプリ作成 → AABアップロード
1. **アプリを作成**（名前：3分ニュース／日本語／アプリ／無料）
2. **テスト → クローズドテスト** で新トラック作成 → **リリースを作成** → `app-release-signed.aab` をアップロード
3. **Play アプリ署名** が自動で有効になります（そのままでOK）

## STEP4　assetlinks を設置（私がやります）
> ⚠️ GitHub Pages特有の注意：Digital Asset Links は **ドメインの直下**
> `https://nagomi2014.github.io/.well-known/assetlinks.json` に置く必要があります
> （`/3min-news/` の下ではダメ）。3分ニュースはサブフォルダ配信なので、私が
> **`nagomi2014.github.io` ルート用リポジトリ**を用意して、そこに assetlinks を設置します。
1. Play Console → **テスト＆リリース → 設定 → アプリの署名** の **SHA-256 フィンガープリント** をコピー
2. それを私に貼ってください → 私がルートに `assetlinks.json` を設置・公開します
3. これで起動時にアドレスバーが消え、本物のアプリらしい全画面表示になります

## STEP5　ストア情報の入力（文面は用意済み）
`store-listing.md` の内容をコピペ。
- グラフィック：`app_icon_512.png`／`feature_graphic_1024x500.png`／スクショ `screen_1〜3`
- プライバシーポリシー URL：https://nagomi2014.github.io/3min-news/privacy.html
- データセーフティ：すべて「収集なし／共有なし」／レーティング：全年齢／広告：なし

## STEP6　クローズドテスト（12人・14日間）
テスター12人以上のGmailを登録 → オプトインURLを共有 → 12人参加のまま14日間継続。

## STEP7　本番公開
14日完了後、本番トラックに同じAABを昇格 → 審査（数日）→ 公開🎉

---

## 困ったら
詰まったら画面のスクショを見せてください。STEP2（PWABuilder）とSTEP4（assetlinks）は私が細かくサポートします。
