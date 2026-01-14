import { z } from "zod";

const nullToUndefined = (value: unknown) => (value === null ? undefined : value);

const optionalString = z.preprocess(nullToUndefined, z.string().optional());
const optionalStringArray = z.preprocess(nullToUndefined, z.array(z.string()).optional());
const optionalDate = z.preprocess(nullToUndefined, z.coerce.date().optional());
const optionalPassword = z.preprocess(
  nullToUndefined,
  z.string().min(1, "パスワードは空にできません").optional(),
);

export const FrontmatterSchema = z
  .object({
    // 記事タイトル（必須）
    title: z.string(),

    // 公開範囲
    // public    : 全体公開
    // unlisted  : URLを知っている人のみ閲覧可
    // private   : 非公開
    // protected : パスワード付き公開
    access: z.enum(["public", "unlisted", "private", "protected"]).default("private"),

    // パスワード（access === "protected" のときのみ使用）
    password: optionalPassword,

    // 記事の概要・説明文（一覧表示やOGP用）
    description: optionalString,

    // サムネイル画像のURL
    thumbnail: optionalString,

    // 記事に付与するタグ
    topics: optionalStringArray,

    // 公開日（未指定の場合はビルド時やGit履歴から補完する想定）
    date: optionalDate,
  })
  .superRefine((data, ctx) => {
    if (data.access === "protected" && !data.password) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: 'access: "protected" の場合、password を指定してください。',
      });
    }
  });

export type Frontmatter = z.infer<typeof FrontmatterSchema>;
