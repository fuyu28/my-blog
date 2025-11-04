import { createContentFetcher } from "../github/contentFetch";
import { createOctokit } from "../github/client";
import { getGithubConfig } from "../github/config";
import { Frontmatter } from "./frontmatterSchema";
import { parsePost } from "./parsePost";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";

export interface PostEntry {
  slug: string;
  path: string;
  sha: string;
  frontmatter: Frontmatter;
}

// シングルトンのfetcherインスタンスを作成
const fetcher = createContentFetcher(createOctokit(), getGithubConfig());

/**
 * content/posts/以下のmdxファイルの一覧を取得（内部関数・キャッシュ化）
 * unstable_cache()で永続的にキャッシュ（ビルド間で共有）
 */
const listPostsCached = unstable_cache(
  async (): Promise<PostEntry[]> => {
    const files = await fetcher.fetchMdxFileList("content/posts/");

    // 各ファイルのfrontmatterを並列で取得
    const entries = await Promise.all(
      files.map(async (f) => {
        const raw = await fetcher.fetchFileContent(f.sha);
        const { frontmatter } = parsePost(raw);

        return {
          slug: f.path.replace(/^content\/posts\//, "").replace(/\.mdx$/, ""),
          path: f.path,
          sha: f.sha,
          frontmatter,
        };
      })
    );

    return entries;
  },
  ["posts-list"], // キャッシュキー
  {
    revalidate: 3600, // 1時間ごとに再検証
    tags: ["posts"], // タグでまとめて無効化可能
  }
);

/**
 * Dateフィールドを文字列からDateオブジェクトに変換
 * キャッシュからの復元時に必要
 */
function restoreDates(entry: PostEntry): PostEntry {
  return {
    ...entry,
    frontmatter: {
      ...entry.frontmatter,
      publishedAt: entry.frontmatter.publishedAt
        ? new Date(entry.frontmatter.publishedAt)
        : undefined,
      updatedAt: entry.frontmatter.updatedAt
        ? new Date(entry.frontmatter.updatedAt)
        : undefined,
    },
  };
}

/**
 * content/posts/以下のmdxファイルの一覧を取得
 * @returns slug, path, sha, frontmatter（Dateオブジェクト復元済み）
 */
export async function listPosts(): Promise<PostEntry[]> {
  const entries = await listPostsCached();
  return entries.map(restoreDates);
}

/**
 * 公開記事のみを取得し、日付順でソート
 * @param sortBy - ソートする日付フィールド（デフォルト: updatedAt）
 * @returns 公開記事のみの配列（新しい順）
 */
export async function listPublicPosts(
  sortBy: "updatedAt" | "publishedAt" = "updatedAt"
): Promise<PostEntry[]> {
  const allPosts = await listPosts();

  // visibility: "public" のみフィルタ
  const publicPosts = allPosts.filter(
    (post) => post.frontmatter.visibility === "public"
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

/**
 * スラグからポストを取得する
 * @param slug 表示するページのスラグ
 * @returns frontmatter: indexのjson, content: 中身のmdx
 */
export async function getPostBySlug(
  slug: string
): Promise<{ frontmatter: Frontmatter; content: string }> {
  const path = `content/posts/${slug}.mdx`;

  try {
    const raw = await fetcher.fetchFileContentByPath(path);
    const { frontmatter, content } = parsePost(raw);

    return {
      frontmatter,
      content,
    };
  } catch (error) {
    // エラー内容をログに記録
    if (error instanceof Error) {
      console.error(`Failed to fetch post: ${slug}`, {
        path,
        error: error.message,
      });

      // レートリミットエラーの場合は詳細を表示
      if (error.message.includes("rate limit")) {
        console.error("  → GitHub APIのレートリミットに達しました");
      }
    }

    // 記事が見つからない場合、Next.jsのnot-foundページを表示
    notFound();
  }
}
