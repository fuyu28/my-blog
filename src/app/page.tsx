import Link from "next/link";
import { listPublicPosts } from "@/lib/content/posts";

export default async function HomePage() {
  const posts = await listPublicPosts();

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">Blog</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">最近書いたやつ</p>
      </header>

      <ul className="grid gap-6">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/post/${post.slug}`}
              className="block rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:shadow-lg hover:-translate-y-0.5 dark:bg-zinc-900 dark:border-zinc-800/70 dark:ring-white/5"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100 leading-tight line-clamp-2">
                  {post.frontmatter.title}
                </h2>

                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 break-all">
                  {post.path}
                </p>

                {post.frontmatter.description && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                    {post.frontmatter.description}
                  </p>
                )}

                {post.frontmatter.date && (
                  <div className="text-[10px] uppercase text-zinc-400 dark:text-zinc-600 tracking-wide">
                    date: {post.frontmatter.date.toLocaleDateString("ja-JP")}
                  </div>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
