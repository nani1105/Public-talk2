export type NewsCategory =
  | "Politics"
  | "Local"
  | "Sports"
  | "World"
  | "Business";

export interface NewsArticle {
  id: string;
  title: string;
  category: NewsCategory;
  body: string;
  coverImage: string;
  publishedAt: string;
}

export const NEWS_CATEGORIES: NewsCategory[] = [
  "Politics",
  "Local",
  "Sports",
  "World",
  "Business",
];
