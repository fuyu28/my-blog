import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.string().optional()
);

const optionalDate = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.coerce.date().optional()
);

const optionalStringArray = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.array(z.string()).optional()
);

const optionalPassword = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.string().min(1, "パスワードは空にできません").optional()
);

export const FrontmatterSchema = z
  .object({
    // 記事タイトル
    title: z.string(),
    // サムネイル画像URL
    thumbnail: optionalString,
    // 記事タイプ (技術 / 趣味 / 雑記)
    type: z.enum(["tech", "hobby", "misc"]),
    // 公開状態 (公開 / 非公開)
    visibility: z.enum(["public", "private"]).default("private"),
    // 公開形式 (全体公開 / 限定公開 / パスワード付き公開)
    accessMode: z.enum(["public", "unlisted", "protected"]).default("public"),
    // 個別パスワード（protected のとき必須）
    protectedPassword: optionalPassword,
    // Deep状態可否
    isDeep: z.boolean().default(false),
    // 公開日
    publishedAt: optionalDate,
    // 更新日
    updatedAt: optionalDate,
    // 説明文
    description: optionalString,
    // タグ
    topics: optionalStringArray,
  })
  .superRefine((data, ctx) => {
    // protected のときはパスワードを必須にする
    if (data.accessMode === "protected" && !data.protectedPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["protectedPassword"],
        message:
          'accessMode: "protected" の場合、protectedPassword を指定してください。',
      });
    }
  });

export type Frontmatter = z.infer<typeof FrontmatterSchema>;
