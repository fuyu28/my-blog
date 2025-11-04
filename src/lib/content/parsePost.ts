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
  const frontmatter = FrontmatterSchema.parse(data);
  return { frontmatter, content };
}
