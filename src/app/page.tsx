import Link from "next/link";
import { listPosts } from "@/lib/posts";

export default async function HomePage(): Promise<React.ReactElement> {
  const posts = await listPosts();
  console.log(posts);
  return (
    <main className="mx-auto max-w-3xl py-10 space-y-6">
      <h1 className="text-3xl font-bold">Blog</h1>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.slug} className="border-b pb-4">
            <Link
              href={`/post/${post.slug}`}
              className="text-xl font-semibold hover:underline"
            >
              {post.slug}
            </Link>
            <div className="text-sm text-gray-500 break-all">
              <span className="font-mono">{post.path}</span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
