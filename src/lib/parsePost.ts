import matter from "gray-matter";
import { FrontmatterSchema, Frontmatter } from "./frontmatterSchema";

export interface ParsedPost {
  frontmatter: Frontmatter;
  content: string;
}

export function parsePost(rawMdx: string): ParsedPost {
  const { data, content } = matter(rawMdx);
  const frontmatter = FrontmatterSchema.parse(data);
  return { frontmatter, content };
}
