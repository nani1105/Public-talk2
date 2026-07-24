export const NEWS_CATEGORIES = ["Politics", "Local", "Sports", "World", "Business"] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export type NewsArticle = {
  id: string;
  title: string;
  category: NewsCategory;
  body: string;
  snippet: string;
  image_url: string;
  image_path: string;
  published_at: string;
};
