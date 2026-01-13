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
    title: z.string(),
    access: z.enum(["public", "unlisted", "private", "protected"]).default("private"),
    password: optionalPassword,
    description: optionalString,
    thumbnail: optionalString,
    topics: optionalStringArray,
    date: optionalDate,
  })
  .superRefine((data, ctx) => {
    if (data.access === "protected" && !data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: 'access: "protected" の場合、password を指定してください。',
      });
    }
  });

export type Frontmatter = z.infer<typeof FrontmatterSchema>;
