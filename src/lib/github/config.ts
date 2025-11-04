export interface GithubConfig {
  owner: string;
  repo: string;
  ref: string;
}

export function getGithubConfig(): GithubConfig {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const ref = process.env.GITHUB_REF ?? "main";
  if (!owner || !repo) {
    throw new Error("Github config is incomplete");
  }

  return { owner, repo, ref };
}
