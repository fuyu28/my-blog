import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">記事が見つかりません</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        指定された記事は存在しないか、削除された可能性があります。
      </p>
      <Link
        href="/"
        className="inline-block rounded-lg border border-zinc-300 px-4 py-2 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        ← 記事一覧に戻る
      </Link>
    </div>
  );
}
