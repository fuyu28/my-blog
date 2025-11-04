import type { Endpoints } from "@octokit/types";
import { Octokit } from "octokit";
import { GithubConfig } from "./config";
import { cache } from "react";

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
  // cache()でラップして同一ビルド内の重複排除
  const fetchMdxFileList = cache(
    async (pathPrefix?: string): Promise<GitTreeItem[]> => {
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
    }
  );

  const fetchFileContent = cache(async (sha: string): Promise<string> => {
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
  });

  const fetchFileContentByPath = cache(
    async (path: string): Promise<string> => {
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
    }
  );

  return {
    fetchMdxFileList,
    fetchFileContent,
    fetchFileContentByPath,
  };
}
