import { createOctokit } from "./github";
import type { Endpoints } from "@octokit/types";

type GitTreeResponse =
  Endpoints["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"]["response"];
type GitTreeItem = NonNullable<GitTreeResponse["data"]["tree"]>[number];

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const REF = process.env.GITHUB_REF ?? "main";

const octokit = createOctokit();

/**
 * 指定リポジトリから MDX ファイルの一覧を取得する
 * @returns 各ファイルの詳細情報
 */
export async function fetchMdxFileList(): Promise<GitTreeItem[]> {
  const treeResponse = await octokit.request(
    "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
    { owner: OWNER, repo: REPO, tree_sha: REF, recursive: "1" }
  );

  const mdxFiles = (treeResponse.data.tree ?? []).filter(
    (item): item is GitTreeItem =>
      item.type === "blob" &&
      typeof item.path === "string" &&
      item.path.endsWith(".mdx")
  );

  return mdxFiles;
}

/**
 * 指定したファイル（blob）の本文を取得する
 * @param file - GitHub のツリー情報（GitTreeItem）
 * @returns ファイルの本文（文字列）
 */
export async function fetchFileContent(file: GitTreeItem): Promise<string> {
  const blobResponse = await octokit.request(
    "GET /repos/{owner}/{repo}/git/blobs/{file_sha}",
    {
      owner: OWNER,
      repo: REPO,
      file_sha: file.sha,
      headers: { Accept: "application/vnd.github.v3.raw" },
    }
  );
  return String(blobResponse.data);
}
