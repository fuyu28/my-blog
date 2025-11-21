import { createContentFetcher } from "../github/contentFetch";
import { createOctokit } from "../github/client";
import { getGithubConfig } from "../github/config";
import { Frontmatter } from "./frontmatterSchema";
import { parsePost } from "./parsePost";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";

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
 * Cache Components機能で1時間キャッシュ
 * @returns キャッシュされた記事一覧（Dateフィールドは文字列）
 */
async function listPostsCached(): Promise<PostEntry[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts");
  const files = await fetcher.fetchMdxFileList("content/posts/");

  // 各ファイルのfrontmatterを並列で取得
  const entries = await Promise.all(
    files.map(async (f) => {
      try {
        const raw = await fetcher.fetchFileContent(f.sha);
        const { frontmatter } = parsePost(raw);

        return {
          slug: f.path.replace(/^content\/posts\//, "").replace(/\.mdx$/, ""),
          path: f.path,
          sha: f.sha,
          frontmatter,
        };
      } catch (error) {
        console.warn("Skipping post due to invalid frontmatter", {
          path: f.path,
          error: error instanceof Error ? error.message : error,
        });
        return null;
      }
    })
  );

  return entries.filter(
    (entry): entry is PostEntry => entry !== null
  );
}

/**
 * frontmatterを持つオブジェクトのDateフィールドを文字列からDateオブジェクトに変換
 * キャッシュからの復元時に必要
 * @param item frontmatterを含むオブジェクト（PostEntryまたは記事データ）
 * @returns Dateオブジェクト復元済みのオブジェクト
 */
function restoreDates<T extends { frontmatter: Frontmatter }>(item: T): T {
  return {
    ...item,
    frontmatter: {
      ...item.frontmatter,
      publishedAt: item.frontmatter.publishedAt
        ? new Date(item.frontmatter.publishedAt)
        : undefined,
      updatedAt: item.frontmatter.updatedAt
        ? new Date(item.frontmatter.updatedAt)
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

  // 公開かつ accessMode: "public" のみフィルタ
  const publicPosts = allPosts.filter(
    (post) =>
      post.frontmatter.visibility === "public" &&
      post.frontmatter.accessMode === "public"
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
 * スラグから記事を取得（内部関数・キャッシュ化）
 * Cache Components機能で1時間キャッシュ
 * @param slug 記事のスラグ
 * @returns キャッシュされた記事データ（Dateフィールドは文字列）
 */
async function getPostBySlugCached(
  slug: string
): Promise<{ frontmatter: Frontmatter; content: string }> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts", `post-${slug}`);

  const path = `content/posts/${slug}.mdx`;
  const raw = await fetcher.fetchFileContentByPath(path);
  const { frontmatter, content } = parsePost(raw);

  return {
    frontmatter,
    content,
  };
}

/**
 * スラグから記事を取得
 * @param slug 記事のスラグ
 * @returns frontmatter（Dateオブジェクト復元済み）とcontent
 * @throws notFound() 記事が見つからない場合やエラー時
 */
export async function getPostBySlug(
  slug: string
): Promise<{ frontmatter: Frontmatter; content: string }> {
  try {
    const post = await getPostBySlugCached(slug);
    return restoreDates(post);
  } catch (error) {
    // エラー内容をログに記録
    if (error instanceof Error) {
      console.error(`Failed to fetch post: ${slug}`, {
        path: `content/posts/${slug}.mdx`,
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
