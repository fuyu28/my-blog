import { getPostBySlug, listPublicPosts } from "@/lib/content/posts";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";

// これで静的パスを事前に生成（公開記事のみ）
export async function generateStaticParams() {
  const posts = await listPublicPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  // ISR: 1時間ごとに再検証
  "use cache";
  cacheLife("hours");

  const { slug } = await params;
  const { frontmatter, content } = await getPostBySlug(slug);

  // visibility: "private"は非表示
  if (frontmatter.visibility === "private") {
    notFound();
  }

  return (
    <article className="space-y-10">
      {/* ヘッダー部分 */}
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {frontmatter.title}
        </h1>

        <div className="flex flex-col gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:gap-4">
          {frontmatter.updatedAt !== undefined && (
            <span>
              最終更新: {frontmatter.updatedAt.toLocaleDateString("ja-JP")}
            </span>
          )}
        </div>

        <div className="h-px bg-linear-to-r from-transparent via-zinc-300/60 to-transparent dark:via-zinc-700/60" />
      </header>

      {/* 本文部分 */}
      <div
        className="
          prose prose-zinc dark:prose-invert
          prose-headings:scroll-mt-24
          prose-headings:font-semibold
          prose-h2:text-xl
          prose-h3:text-lg
          prose-pre:bg-zinc-900 prose-pre:text-zinc-100 prose-pre:rounded-xl
          prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1 prose-code:text-zinc-900
          dark:prose-pre:bg-zinc-800 dark:prose-pre:text-zinc-100
          dark:prose-code:bg-zinc-800 dark:prose-code:text-zinc-100
          max-w-none
        "
      >
        <MDXRemote source={content} />
      </div>
    </article>
  );
}
