  🔴 優先度：高（セキュリティ・SEO・UX）

  1. visibility: "public"フィルタリング ⚠️ 重要

  現在の問題：
  // page.tsx - private記事も表示されている
  export default async function HomePage() {
    const posts = await listPosts(); // ← private含む全記事
    return (/* 全部表示 */);
  }

  影響：
  - ❌ visibility: "private"の記事がトップページに表示される
  - ❌ generateStaticParamsで全記事が静的生成される（private記事もアクセス可能）
  - ❌ 個別ページは404だが、タイトルと説明文は見える

  修正案：
  // posts.ts
  export async function listPublicPosts(): Promise<PostEntry[]> {
    const allPosts = await listPosts();
    return allPosts.filter(post => post.frontmatter.visibility === "public");
  }

  // page.tsx
  const posts = await listPublicPosts(); // ✅

  // [slug]/page.tsx
  export async function generateStaticParams() {
    const posts = await listPublicPosts(); // ✅
    return posts.map((p) => ({ slug: p.slug }));
  }

  ---
  2. 記事のソート機能

  現在の問題：
  - 記事の順序が不定（GitHub APIの返却順）
  - 最新記事が上に来ない

  修正案：
  // posts.ts
  export async function listPublicPosts(
    sortBy: "updatedAt" | "publishedAt" = "updatedAt"
  ): Promise<PostEntry[]> {
    const allPosts = await listPosts();
    const publicPosts = allPosts.filter(
      post => post.frontmatter.visibility === "public"
    );

    // 日付順でソート（新しい順）
    return publicPosts.sort((a, b) => {
      const dateA = a.frontmatter[sortBy];
      const dateB = b.frontmatter[sortBy];
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB.getTime() - dateA.getTime();
    });
  }

  ---
  3. メタデータ生成（SEO対策）

  現在の問題：
  - タイトルが固定
  - OGP画像・descriptionが設定されていない

  修正案：
  // app/layout.tsx
  export const metadata: Metadata = {
    title: {
      default: "Fuyu's blog",
      template: "%s | Fuyu's blog",
    },
    description: "技術メモとか雑記とか",
    openGraph: {
      type: "website",
      locale: "ja_JP",
      siteName: "Fuyu's blog",
    },
  };

  // app/post/[slug]/page.tsx
  export async function generateMetadata({ params }): Promise<Metadata> {
    const { slug } = await params;
    try {
      const { frontmatter } = await getPostBySlug(slug);
      return {
        title: frontmatter.title,
        description: frontmatter.description,
        openGraph: {
          title: frontmatter.title,
          description: frontmatter.description,
          images: frontmatter.thumbnail ? [frontmatter.thumbnail] : [],
        },
      };
    } catch {
      return { title: "記事が見つかりません" };
    }
  }

  ---
  🟡 優先度：中（UX改善）

  4. タグ（topics）の表示

  // page.tsx - 記事カードにタグ表示
  {post.frontmatter.topics && (
    <div className="flex flex-wrap gap-2">
      {post.frontmatter.topics.slice(0, 3).map(topic => (
        <span key={topic} className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
          {topic}
        </span>
      ))}
    </div>
  )}

  ---
  5. 記事タイプバッジの表示

  // 記事タイプの色分け
  const typeColors = {
    tech: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    hobby: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    misc: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  };

  <span className={`text-xs px-2 py-1 rounded ${typeColors[post.frontmatter.type]}`}>
    {post.frontmatter.type}
  </span>

  ---
  6. ISR（Incremental Static Regeneration）設定

  // app/page.tsx
  export const revalidate = 3600; // 1時間ごとに再生成

  // app/post/[slug]/page.tsx
  export const revalidate = 3600;

  ---
  🟢 優先度：低（追加機能）

  7. サムネイル画像の表示

  {post.frontmatter.thumbnail && (
    <img src={post.frontmatter.thumbnail} alt={post.frontmatter.title} />
  )}

  8. 記事数の表示

  <p className="text-sm text-zinc-500">全 {posts.length} 件</p>

  9. 空状態の処理

  {posts.length === 0 && (
    <p className="text-center text-zinc-500 py-10">記事がまだありません</p>
  )}

  ---
  推奨実装順序

  1. 🔴 visibility: "public"フィルタリング - セキュリティ最優先
  2. 🔴 記事のソート機能 - UX向上
  3. 🔴 メタデータ生成 - SEO対策
  4. 🟡 タグ表示 - 追加情報
  5. 🟡 記事タイプバッジ - カテゴリ識別
  6. 🟡 ISR設定 - パフォーマンス
