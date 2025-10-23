declare namespace NodeJS {
  interface ProcessEnv {
    GITHUB_APP_ID: number;
    GITHUB_PRIVATE_KEY: string;
    GITHUB_INSTALLATION_ID: number;
    GITHUB_OWNER: string;
    GITHUB_REPO: string;
    GITHUB_REF?: string;
    NODE_ENV?: "development" | "production" | "test";
  }
}
