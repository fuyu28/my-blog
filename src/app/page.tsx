import { MDXRemote } from "next-mdx-remote-client/rsc";

async function getContent(): Promise<string> {
  const url =
    "https://raw.githubusercontent.com/fuyu28/my-blog-contents/refs/heads/main/test.mdx";
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.statusText}`);
  }
  const text = await res.text();
  return text;
}

export default async function Page() {
  const source = await getContent();

  return (
    <article className="prose prose-neutral">
      <MDXRemote source={source} />;
    </article>
  );
}
