import { Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";

/**
 * envからOctokitオブジェクトを作成する
 * @returns Octokitオブジェクト
 */
export function createOctokit() {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_PRIVATE_KEY;
  const installationId = process.env.GITHUB_INSTALLATION_ID;

  if (!appId) {
    throw new Error("GITHUB_APP_ID is not defined");
  }
  if (!privateKey) {
    throw new Error("GITHUB_PRIVATE_KEY is not defined");
  }
  if (!installationId) {
    throw new Error("GITHUB_INSTALLATION_ID is not defined");
  }

  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
      installationId,
    },
  });
}
