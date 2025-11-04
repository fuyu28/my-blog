import { z } from "zod";

export const FrontmatterSchema = z.object({
  // 記事タイトル
  title: z.string(),
  // サムネイル画像URL
  thumbnail: z.string().nullish(),
  // 記事タイプ (技術 / 趣味 / 雑記)
  type: z.enum(["tech", "hobby", "misc"]),
  // 公開状態 (公開 / 非公開)
  visibility: z.enum(["public", "private"]).default("private"),
  // 公開形式 (全体公開 / 限定公開 / パスワード付き公開)
  accessMode: z.enum(["public", "unlisted", "protected"]).default("public"),
  // Deep状態可否
  isDeep: z.boolean().default(false),
  // 公開日
  publishedAt: z.coerce.date().nullish(),
  // 更新日
  updatedAt: z.coerce.date().nullish(),
  // 説明文
  description: z.string().nullish(),
  // タグ
  topics: z.array(z.string()).nullish(),
});

export type Frontmatter = z.infer<typeof FrontmatterSchema>;
