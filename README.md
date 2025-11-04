# Fuyu's Blog

Next.js 16 と GitHub API を使った、MDX ベースのブログシステムです。

## 特徴

- 📝 **GitHub ベースのコンテンツ管理**: MDX ファイルを GitHub リポジトリから取得
- ⚡ **Next.js 16 + TurboPack**: 高速なビルドと開発体験
- 🎨 **Tailwind CSS v4**: モダンなデザインシステム
- 💾 **効率的なキャッシュ戦略**: Cache Components による 1 時間 TTL のキャッシュ
- 🔐 **GitHub App 認証**: 安全な API 接続
- 🚀 **静的サイト生成**: ビルド時にすべての記事を事前レンダリング

## 実装状況

### ✅ 実装済み機能

- **コアシステム**

  - ✅ Next.js 16 App Router によるルーティング
  - ✅ GitHub API 経由での MDX コンテンツ取得
  - ✅ GitHub App 認証による安全な API アクセス
  - ✅ Zod による Frontmatter スキーマバリデーション
  - ✅ MDX レンダリング（next-mdx-remote-client）

- **キャッシュ機能**

  - ✅ Cache Components（`"use cache"`）による記事一覧のキャッシュ
  - ✅ 個別記事のキャッシュ（slug 別 cache tag）
  - ✅ 1 時間 TTL のキャッシュライフサイクル
  - ✅ キャッシュタグによる選択的無効化対応
  - ✅ Date 型の自動復元機能

- **記事管理**

  - ✅ 記事一覧表示（公開記事のみ）
  - ✅ 個別記事ページ
  - ✅ `visibility` による公開/非公開制御
  - ✅ 記事の日付順ソート（更新日/公開日）
  - ✅ 静的サイト生成（SSG）
  - ✅ Frontmatter による記事メタデータ管理

- **エラーハンドリング**

  - ✅ GitHub API レート制限チェック
  - ✅ 指数バックオフによるリトライ機構（最大 3 回）
  - ✅ 詳細なエラーログ出力
  - ✅ 404 ページ対応

- **UI/UX**
  - ✅ レスポンシブデザイン
  - ✅ ダークモード対応
  - ✅ シンタックスハイライト対応（MDX）
  - ✅ 記事説明文・サムネイル表示対応

### 🚧 未実装機能（将来の拡張予定）

- **アクセス制御**

  - ⏳ `accessMode: "unlisted"` による直リンクのみアクセス制御
  - ⏳ `accessMode: "protected"` によるパスワード保護

- **記事機能**

  - ⏳ `isDeep` フラグによる詳細記事の特別表示
  - ⏳ タグ/トピックによる記事フィルタリング
  - ⏳ 記事検索機能
  - ⏳ 関連記事の推薦
  - ⏳ 目次（Table of Contents）自動生成

- **パフォーマンス**

  - ⏳ 画像最適化（next/image 統合）
  - ⏳ OGP 画像の自動生成

- **分析・管理**

  - ⏳ Google Analytics 統合
  - ⏳ RSS フィード生成
  - ⏳ サイトマップ自動生成
  - ⏳ Webhook による自動キャッシュ無効化

- **その他**
  - ⏳ コメント機能
  - ⏳ いいね/リアクション機能
  - ⏳ 記事のシェア機能

## 技術スタック

- **フレームワーク**: Next.js 16.0.1 (App Router)
- **ランタイム**: React 19.2.0
- **言語**: TypeScript (strict mode)
- **スタイリング**: Tailwind CSS v4
- **MDX 処理**: next-mdx-remote-client
- **バリデーション**: Zod
- **GitHub API**: Octokit

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/fuyu28/my-blog
cd my-blog
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定します：

```bash
# GitHub App認証情報
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_INSTALLATION_ID=your_installation_id

# コンテンツを取得するGitHubリポジトリ
GITHUB_OWNER=your_github_username
GITHUB_REPO=your_content_repo
GITHUB_REF=main  # ブランチ名（デフォルト: main）
```

#### GitHub App の作成方法

1. [GitHub Developer Settings](https://github.com/settings/apps) で GitHub App を作成
2. 以下の権限を付与:
   - **Repository permissions**: Contents (Read-only)
3. Private Key を生成してダウンロード
4. 作成した App をリポジトリにインストール

### 4. コンテンツリポジトリの準備

ブログ記事用のリポジトリに`content/posts/`ディレクトリを作成し、MDX ファイルを配置します。

#### MDX ファイルの例

```mdx
---
title: "初めての記事"
type: "tech"
visibility: "public"
accessMode: "public"
description: "これはサンプル記事です"
publishedAt: "2025-01-01"
updatedAt: "2025-01-05"
topics: ["Next.js", "React"]
---

# 見出し

本文をここに書きます。
```

#### Frontmatter フィールドの詳細

すべての MDX ファイルは YAML 形式の Frontmatter でメタデータを定義します。Zod スキーマによる厳密なバリデーションが行われます。

##### 必須フィールド

| フィールド | 型                            | 説明           | 例                      |
| ---------- | ----------------------------- | -------------- | ----------------------- |
| `title`    | `string`                      | 記事のタイトル | `"Next.js 16 の新機能"` |
| `type`     | `"tech" \| "hobby" \| "misc"` | 記事のカテゴリ | `"tech"`                |

##### オプションフィールド（デフォルト値あり）

| フィールド   | 型                                      | デフォルト値 | 説明                                                                              | 例         |
| ------------ | --------------------------------------- | ------------ | --------------------------------------------------------------------------------- | ---------- |
| `visibility` | `"public" \| "private"`                 | `"private"`  | 公開状態。`"private"`の記事は表示されない                                         | `"public"` |
| `accessMode` | `"public" \| "unlisted" \| "protected"` | `"public"`   | アクセス制限。`"unlisted"`は直リンクのみ、`"protected"`はパスワード保護（未実装） | `"public"` |
| `isDeep`     | `boolean`                               | `false`      | 詳細記事フラグ（将来の機能拡張用）                                                | `true`     |

##### オプションフィールド（任意）

| フィールド    | 型                  | 説明                         | 例                                             |
| ------------- | ------------------- | ---------------------------- | ---------------------------------------------- |
| `thumbnail`   | `string`            | サムネイル画像の URL         | `"https://example.com/image.png"`              |
| `publishedAt` | `string` (ISO 8601) | 記事の公開日                 | `"2025-01-05"` または `"2025-01-05T10:00:00Z"` |
| `updatedAt`   | `string` (ISO 8601) | 記事の最終更新日             | `"2025-01-10"`                                 |
| `description` | `string`            | 記事の要約・説明文           | `"Next.js 16の新機能を解説します"`             |
| `topics`      | `string[]`          | 記事に関連するトピック・タグ | `["Next.js", "React", "TypeScript"]`           |

##### 完全な例

```mdx
---
title: "Next.js 16 の Cache Components を使ってみた"
type: "tech"
visibility: "public"
accessMode: "public"
thumbnail: "https://example.com/nextjs-cache.png"
publishedAt: "2025-01-05"
updatedAt: "2025-01-10"
description: "Next.js 16 で導入された Cache Components の使い方と実装例を紹介します。"
topics: ["Next.js", "React", "キャッシュ戦略"]
isDeep: false
---

# Cache Components の基本

ここから本文が始まります...
```

##### バリデーションエラーについて

- 必須フィールドが欠けている場合、ビルド時にエラーが発生します
- `type`, `visibility`, `accessMode` の値は列挙型で定義されているため、指定外の値は使用できません
- 日付フィールドは ISO 8601 形式（`YYYY-MM-DD` または `YYYY-MM-DDTHH:mm:ssZ`）で記述してください

## 開発コマンド

```bash
# 開発サーバーの起動（TurboPack使用）
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバーの起動
npm start

# リンターの実行
npm run lint
```

開発サーバーは http://localhost:3000 で起動します。

## プロジェクト構造

```
my-blog/
├── src/
│   ├── app/                    # App Router
│   │   ├── page.tsx           # トップページ（記事一覧）
│   │   ├── post/[slug]/       # 個別記事ページ
│   │   └── layout.tsx         # ルートレイアウト
│   ├── components/            # Reactコンポーネント
│   │   └── Footer.tsx        # フッター（Client Component）
│   ├── lib/
│   │   ├── github/           # GitHub API関連
│   │   │   ├── client.ts    # Octokit認証
│   │   │   ├── config.ts    # GitHub設定
│   │   │   └── contentFetch.ts  # コンテンツ取得
│   │   └── content/          # コンテンツ処理
│   │       ├── posts.ts      # 記事取得API（キャッシュあり）
│   │       ├── parsePost.ts  # MDXパース
│   │       └── frontmatterSchema.ts  # Zodスキーマ
│   └── env.d.ts              # 環境変数の型定義
├── CLAUDE.md                  # Claude Code向けドキュメント
└── README.md                  # このファイル
```

## キャッシュ戦略

このブログは**Next.js 16 の Cache Components**を使用した効率的なキャッシュを実装しています。

### キャッシュの仕組み

- **データレイヤーでのみキャッシュ**: `src/lib/content/posts.ts`の関数にキャッシュロジックを集約
- **キャッシュ期間**: 1 時間（`cacheLife("hours")`）
- **キャッシュタグ**:
  - `"posts"`: すべての記事（一覧取得）
  - `"post-{slug}"`: 個別記事（例: `"post-hello-world"`）

### キャッシュの無効化

記事を更新した場合、以下のコマンドでキャッシュを無効化できます：

```typescript
// すべての記事のキャッシュを無効化
revalidateTag("posts");

// 特定の記事のみ無効化
revalidateTag("post-hello-world");
```

### Date 型の取り扱い

キャッシュされたデータでは、Date 型は文字列として保存されます。`restoreDates()`関数が自動的に Date オブジェクトに復元します。

## デプロイ

### Vercel へのデプロイ（推奨）

1. [Vercel](https://vercel.com)にログイン
2. リポジトリをインポート
3. 環境変数を設定（`.env.local`の内容をコピー）
4. デプロイ

### その他のプラットフォーム

Next.js 16 をサポートする任意のプラットフォームにデプロイできます：

- Netlify
- Cloudflare Pages
- AWS Amplify
- 自前の Node.js サーバー

## トラブルシューティング

### GitHub API のレート制限エラー

```
Error: GitHub API rate limit exceeded
```

→ GitHub App 認証が正しく設定されているか確認してください。Personal Access Token ではなく、GitHub App を使用する必要があります。

### ビルドエラー: "Cannot find module"

```
Error: Cannot find module '@/lib/...'
```

→ `tsconfig.json`の`paths`設定を確認してください。`@/*`が`./src/*`にマッピングされている必要があります。

### 記事が表示されない

1. `visibility: "public"`が設定されているか確認
2. GitHub App がリポジトリへのアクセス権限を持っているか確認
3. `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_REF`が正しいか確認

### Frontmatter のバリデーションエラー

```
Error: Invalid frontmatter in post: ...
```

→ Frontmatter のフィールドが正しく設定されているか確認してください：

- **必須フィールドの不足**: `title` と `type` は必ず指定する必要があります
- **不正な enum 値**: `type` は `"tech"`, `"hobby"`, `"misc"` のいずれか、`visibility` は `"public"` または `"private"` である必要があります
- **日付形式エラー**: `publishedAt` と `updatedAt` は ISO 8601 形式（`2025-01-05` または `2025-01-05T10:00:00Z`）で記述してください
- **配列形式エラー**: `topics` は配列形式で記述してください（例: `["Next.js", "React"]`）

## ライセンス

このプロジェクトは [MIT ライセンス](LICENSE) の下で公開されています。
