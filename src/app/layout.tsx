import "./globals.css";
import Link from "next/link";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className="bg-linear-to-br from-zinc-50 via-white to-zinc-100 text-zinc-900 dark:from-zinc-900 dark:via-zinc-950 dark:to-black dark:text-zinc-100"
    >
      <body className="min-h-screen antialiased">
        <header className="border-b border-zinc-200/60 bg-white/70 backdrop-blur-md dark:bg-zinc-900/60 dark:border-zinc-800/60">
          <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
            <Link
              href="/"
              className="text-2xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100 hover:opacity-80"
            >
              Fuyu`s blog
            </Link>

            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              技術メモとか雑記とか
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>

        <Suspense
          fallback={
            <footer className="mx-auto max-w-3xl px-4 py-12 text-center text-xs text-zinc-400 dark:text-zinc-600">
              © 2025 Fuyu
            </footer>
          }
        >
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}
