"use client";

export function Footer() {
  return (
    <footer className="mx-auto max-w-3xl px-4 py-12 text-center text-xs text-zinc-400 dark:text-zinc-600">
      © {new Date().getFullYear()} Fuyu
    </footer>
  );
}
