import matter from "gray-matter";
import { FrontmatterSchema, Frontmatter } from "./frontmatterSchema";

export class FrontmatterValidationError extends Error {
  issues: string[];

  constructor(issues: string[]) {
    super("Invalid frontmatter");
    this.name = "FrontmatterValidationError";
    this.issues = issues;
  }
}

export interface ParsedPost {
  frontmatter: Frontmatter;
  content: string;
}

/**
 * 生のデータをfrontmatterとmdxに分離する
 * @param rawMdx 生のmdxファイル
 * @returns frontmatter: 周辺情報のjson, content: 中身のmdx
 */
export function parsePost(rawMdx: string): ParsedPost {
  const { data, content } = matter(rawMdx);

  // Zodのバリデーション（詳細なエラー情報付き）
  const result = FrontmatterSchema.safeParse(data);

  if (!result.success) {
    const errorMessages = result.error.issues.map(
      (issue) => `${issue.path.join(".") || "unknown"}: ${issue.message}`
    );

    // ログは呼び出し側で扱うため、ここでは詳細を投げない
    throw new FrontmatterValidationError(errorMessages);
  }

  return { frontmatter: result.data, content };
}
