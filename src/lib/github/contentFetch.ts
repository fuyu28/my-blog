import type { Endpoints } from "@octokit/types";
import { Octokit } from "octokit";
import { GithubConfig } from "./config";

type GitTreeResponse =
  Endpoints["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"]["response"];
type GitTreeItem = NonNullable<GitTreeResponse["data"]["tree"]>[number];

/**
 * Content Fetcherインターフェース
 */
export interface ContentFetcher {
  fetchMdxFileList(pathPrefix?: string): Promise<GitTreeItem[]>;
  fetchFileContent(sha: string): Promise<string>;
  fetchFileContentByPath(path: string): Promise<string>;
}

/**
 * GitHub APIを使用してコンテンツを取得するFetcherを作成
 * @param octokit - Octokitインスタンス
 * @param config - GitHub設定（owner, repo, ref）
 * @returns ContentFetcherオブジェクト
 */
export function createContentFetcher(
  octokit: Octokit,
  config: GithubConfig
): ContentFetcher {
  return {
    /**
     * 指定リポジトリから MDX ファイルの一覧を取得する
     * @param pathPrefix - パスの先頭フィルタ用
     * @returns 各ファイルの詳細情報
     */
    async fetchMdxFileList(pathPrefix?: string): Promise<GitTreeItem[]> {
      const treeResponse = await octokit.request(
        "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
        {
          owner: config.owner,
          repo: config.repo,
          tree_sha: config.ref,
          recursive: "1",
        }
      );

      const mdxFiles = (treeResponse.data.tree ?? []).filter(
        (item): item is GitTreeItem =>
          item.type === "blob" &&
          typeof item.path === "string" &&
          item.path.endsWith(".mdx") &&
          (!pathPrefix || item.path.startsWith(pathPrefix))
      );

      return mdxFiles;
    },

    /**
     * 指定したファイル（blob）のSHAから本文を取得する
     * @param sha - ファイルのSHA
     * @returns ファイルの本文（文字列）
     */
    async fetchFileContent(sha: string): Promise<string> {
      const blobResponse = await octokit.request(
        "GET /repos/{owner}/{repo}/git/blobs/{file_sha}",
        {
          owner: config.owner,
          repo: config.repo,
          file_sha: sha,
          headers: { Accept: "application/vnd.github.v3.raw" },
        }
      );
      return String(blobResponse.data);
    },

    /**
     * パスを指定してファイル内容を取得する
     * @param path - ファイルパス（例: "content/posts/test.mdx"）
     * @returns ファイルの本文（文字列）
     */
    async fetchFileContentByPath(path: string): Promise<string> {
      const response = await octokit.request(
        "GET /repos/{owner}/{repo}/contents/{path}",
        {
          owner: config.owner,
          repo: config.repo,
          path,
          ref: config.ref,
        }
      );

      // レスポンスがファイルの場合、contentフィールドがある
      if (
        "content" in response.data &&
        typeof response.data.content === "string"
      ) {
        // Base64デコード
        return Buffer.from(response.data.content, "base64").toString("utf-8");
      }

      throw new Error(`File not found or is not a file: ${path}`);
    },
  };
}
