# Pachypus Portfolio Manager

マダガスカル産パキプスなどの高額植物について、仕入れ、在庫、販売、費用、利益、証明書、履歴、庭ビューを一元管理する Next.js アプリです。

## 技術構成

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui 風のローカル UI コンポーネント
- localStorage 保存
- Supabase へ移行しやすい `types / calculations / storage` 分離

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## 公開方法

### GitHub に置く

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create
git push -u origin main
```

### Web 公開する

このリポジトリは GitHub Pages で公開できます。`main` ブランチに push すると、GitHub Actions が自動で静的サイトを書き出して公開します。

公開URL:

```text
https://sugurusu.github.io/Pachypus/
```

Vercel に移す場合も、このまま GitHub リポジトリを import すれば動きます。

## 実装済み

- ダッシュボード集計
- 総仕入額、総売上、粗利益、純利益、手数料、費用、投資回収率
- 総仕入本数、販売済み本数、在庫本数、販売中本数
- 未販売在庫の想定評価額
- 個体一覧、検索、ステータスフィルター
- 個体詳細編集
- ロット追加と本数分の個体自動生成
- 販売入力と利益自動計算
- 費用入力
- 証明書ステータス管理
- 庭ビュー、販売履歴の棚
- 履歴ページ、月別売上/利益の簡易表示
- 初期デモデータ投入

## 初期データ

- ロット: `2026年5月 石垣島パキプス3本`
- `PACHY-001`: 売却済み、販売価格 700,000円、純利益 550,000円
- `PACHY-002`: 在庫、想定販売価格 700,000円
- `PACHY-003`: 在庫、想定販売価格 700,000円

## データ保存

データはブラウザの localStorage に保存されます。ヘッダー右上のリセットボタンで初期デモデータに戻せます。

## Supabase 移行メモ

`src/lib/types.ts` のモデルをテーブル定義に対応させ、`src/lib/storage.ts` の actions を Supabase CRUD に置き換える構成です。集計ロジックは `src/lib/calculations.ts` に分離しているため、クライアント集計から SQL/RPC 集計へ段階的に移行できます。

## Phase 2 候補

- 写真アップロード
- 書類ファイル添付
- グラフの本格化
- CSV エクスポート
- PWA 対応
