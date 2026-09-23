export const NEWS_CATEGORIES = [
  "తాజా వార్తలు",
  "ఆంధ్రప్రదేశ్",
  "తెలంగాణ",
  "జాతీయం",
  "అంతర్జాతీయం",
  "బిజినెస్",
  "క్రీడలు",
  "సినిమా",
  "ఫీచర్ పేజీలు",
  "Politics",
  "Local",
  "Sports",
  "World",
  "Business",
] as const;

export type NewsCategory = string;

export type NewsArticle = {
  id: string;
  title: string;
  category: string;
  body: string;
  snippet: string;
  image_url: string;
  image_path: string;
  published_at: string;
};
