import { getPostBySlug, listPosts } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote-client/rsc";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await listPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export const revalidate = 86400;

export default async function PostPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = await params;
  const { content } = await getPostBySlug(slug);

  return (
    <main className="mx-auto max-w-3xl py-10 prose prose-neutral">
      <article>
        <h1 className="text-3xl font-bold mb-6">{slug}</h1>
        <MDXRemote source={content} />
      </article>
    </main>
  );
}
