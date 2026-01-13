"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ProtectedPostActionState } from "./page";

interface Props {
  title: string;
  verifyAction: (
    state: ProtectedPostActionState | undefined,
    formData: FormData,
  ) => Promise<ProtectedPostActionState>;
  hasPassword: boolean;
}

export function ProtectedPostGate({ title, verifyAction, hasPassword }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(verifyAction, {
    success: false,
    error: undefined,
  });

  // 認証成功時にページを再読み込みして本文を取得
  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-8 shadow-sm ring-1 ring-amber-100 dark:border-amber-900/60 dark:bg-amber-950/30 dark:ring-amber-900/40">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-amber-900 dark:text-amber-100">{title}</h1>
        <p className="text-sm text-amber-900/80 dark:text-amber-100/80">
          この投稿はパスワードで保護されています。
        </p>
      </div>

      {hasPassword ? (
        <form action={formAction} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex-1">
            <span className="sr-only">パスワード</span>
            <input
              type="password"
              name="password"
              required
              className="block w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm shadow-inner outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-50 dark:shadow-none dark:focus:border-amber-500 dark:focus:ring-amber-900/60"
              placeholder="パスワードを入力"
              aria-label="保護記事パスワード"
            />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-60 dark:bg-amber-500 dark:hover:bg-amber-400"
          >
            {pending ? "検証中..." : "閲覧する"}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-amber-900/80 dark:text-amber-100/80">
          Frontmatter に
          <code className="mx-1 rounded bg-amber-100 px-2 py-0.5 text-xs dark:bg-amber-900">
            protectedPassword
          </code>
          を設定してください。
        </p>
      )}

      {state?.error && (
        <p className="mt-3 text-sm font-medium text-amber-800 dark:text-amber-200">{state.error}</p>
      )}
    </div>
  );
}
