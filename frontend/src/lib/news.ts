export type NewsCategory = 'Tournois' | 'Communauté' | 'Compétition' | 'Actualités';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  region: string;
  category: NewsCategory;
  verified: boolean;
}

export async function loadNews(): Promise<NewsItem[]> {
  const response = await fetch('/news.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Impossible de charger les actualités (${response.status})`);
  const items = (await response.json()) as unknown;
  if (!Array.isArray(items)) throw new Error('Format d’actualités invalide');
  return items as NewsItem[];
}

export function formatNewsDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
