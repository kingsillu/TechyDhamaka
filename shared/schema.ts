import { z } from "zod";

export const insertArticleSchema = z.object({
  title: z.string(),
  summary: z.string(),
  category: z.enum(["news", "gaming", "technology", "entertainment"]),
  externalUrl: z.string().url(),
  imageUrl: z.string().url().optional(),
  publishedAt: z.string(),
  source: z.string(),
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type Article = InsertArticle & {
  id: string;
};
