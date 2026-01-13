import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-zinc-600 dark:text-zinc-400">お探しのページが見つかりませんでした</p>
      <Link
        href="/"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700 dark:bg-zinc-100
  dark:text-zinc-900"
      >
        トップページへ戻る
      </Link>
    </div>
  );
}
