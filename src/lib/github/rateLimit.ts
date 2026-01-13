import { Octokit } from "octokit";

/**
 * レートリミット情報
 */
export interface RateLimitInfo {
  limit: number; // 1時間あたりの制限数
  remaining: number; // 残り回数
  reset: Date; // リセット時刻
  used: number; // 使用回数
}

/**
 * GitHubのレートリミット情報を取得
 * @param octokit - Octokitインスタンス
 * @returns レートリミット情報
 */
export async function getRateLimitInfo(octokit: Octokit): Promise<RateLimitInfo> {
  const response = await octokit.request("GET /rate_limit");
  const { core } = response.data.resources;

  return {
    limit: core.limit,
    remaining: core.remaining,
    reset: new Date(core.reset * 1000),
    used: core.used,
  };
}

/**
 * レートリミットをチェックし、残りが少ない場合は警告
 * @param octokit - Octokitインスタンス
 * @param threshold - 警告を出す閾値（デフォルト: 100）
 */
export async function checkRateLimit(octokit: Octokit, threshold: number = 100): Promise<void> {
  const info = await getRateLimitInfo(octokit);

  if (info.remaining < threshold) {
    const resetTime = info.reset.toLocaleString("ja-JP");
    console.warn(
      `⚠️ GitHub API レートリミット警告: 残り ${info.remaining}/${info.limit} (リセット: ${resetTime})`,
    );
  }

  if (info.remaining === 0) {
    const waitTime = Math.ceil((info.reset.getTime() - Date.now()) / 1000 / 60);
    throw new Error(
      `GitHub APIのレートリミットに達しました。${waitTime}分後 (${info.reset.toLocaleString("ja-JP")}) にリセットされます。`,
    );
  }
}

/**
 * リトライ付きのAPI呼び出し
 * @param fn - 実行する関数
 * @param maxRetries - 最大リトライ回数（デフォルト: 3）
 * @param baseDelay - 基本待機時間（ミリ秒、デフォルト: 1000）
 * @returns 関数の実行結果
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // 最後の試行の場合はエラーをthrow
      if (attempt === maxRetries) {
        break;
      }

      // 429エラー（Too Many Requests）または5xxエラーの場合のみリトライ
      const shouldRetry =
        error instanceof Error &&
        (error.message.includes("429") ||
          error.message.includes("rate limit") ||
          error.message.includes("5"));

      if (!shouldRetry) {
        throw error;
      }

      // エクスポネンシャルバックオフ: 1秒、2秒、4秒...
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`⚠️ API呼び出し失敗 (試行 ${attempt + 1}/${maxRetries + 1}): ${error.message}`);
      console.warn(`   ${delay}ms後にリトライします...`);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
