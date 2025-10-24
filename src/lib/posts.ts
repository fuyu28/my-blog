import { fetchMdxFileList, fetchFileContent } from "./githubContent";

export interface PostEntry {
  slug: string;
  path: string;
  sha: string;
}

export async function listPosts(): Promise<PostEntry[]> {
  const files = await fetchMdxFileList("content/posts/");
  return files.map((f) => ({
    slug: f.path.replace(/^content\/posts\//, "").replace(/\.mdx$/, ""),
    path: f.path,
    sha: f.sha,
  }));
}

export async function getPostBySlug(
  slug: string
): Promise<{ slug: string; content: string }> {
  const posts = await listPosts();
  const entry = posts.find((p) => p.slug === slug);
  if (!entry) {
    throw new Error(`Post not found: ${slug}`);
  }

  const raw = await fetchFileContent(entry.sha);

  return {
    slug,
    content: raw,
  };
}
