import { createContentFetcher } from "../github/contentFetch";
import { createOctokit } from "../github/client";
import { getGithubConfig } from "../github/config";
import { Frontmatter } from "./frontmatterSchema";
import { parsePost } from "./parsePost";

export interface PostEntry {
  slug: string;
  path: string;
  sha: string;
}

// シングルトンのfetcherインスタンスを作成
const fetcher = createContentFetcher(createOctokit(), getGithubConfig());

/**
 * content/posts/以下のmdxファイルの一覧を取得
 * @returns slug, path, sha
 */
export async function listPosts(): Promise<PostEntry[]> {
  const files = await fetcher.fetchMdxFileList("content/posts/");
  return files.map((f) => ({
    slug: f.path.replace(/^content\/posts\//, "").replace(/\.mdx$/, ""),
    path: f.path,
    sha: f.sha,
  }));
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
  } catch {
    throw new Error(`Post not found: ${slug}`);
  }
}
