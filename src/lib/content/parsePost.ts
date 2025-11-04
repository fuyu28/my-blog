import matter from "gray-matter";
import { FrontmatterSchema, Frontmatter } from "./frontmatterSchema";

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
    // バリデーションエラーの詳細を表示
    console.error("❌ Frontmatter validation failed:");
    console.error(JSON.stringify(result.error.format(), null, 2));

    // エラーメッセージを構築
    const errorMessages = result.error.issues.map(
      (issue) => `  - ${issue.path.join(".")}: ${issue.message}`
    );

    throw new Error(
      `Invalid frontmatter:\n${errorMessages.join("\n")}\n\nReceived data:\n${JSON.stringify(data, null, 2)}`
    );
  }

  return { frontmatter: result.data, content };
}
