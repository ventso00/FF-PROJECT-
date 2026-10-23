import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const queries = [
  { q: 'Free Fire Madagascar tournoi', category: 'Tournois' },
  { q: 'Free Fire Madagascar équipe joueur créateur', category: 'Communauté' },
  { q: 'FFWS Afrique Madagascar', category: 'Compétition' },
  { q: 'Free Fire Madagascar actualité', category: 'Actualités' },
];
const output = new URL('../frontend/public/news.json', import.meta.url);
const strip = (value) => value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<[^>]*>/g, '').trim();
const text = (xml, tag) => strip(xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))?.[1] ?? '');
const localTerms = /madagascar|malagasy|antananarivo|toliara|toamasina|tamatave|mahajanga|fianarantsoa|mg\b/i;
const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
const classify = (value, fallback) => {
  if (/tournoi|scrim|championnat|compétition|prize.?pool|ffws/i.test(value)) return 'Tournois';
  if (/équipe|team|joueur|créateur|guilde|recrutement/i.test(value)) return 'Communauté';
  return fallback;
};
const items = [];
for (const { q, category } of queries) {
  const feed = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=fr&gl=MG&ceid=MG:fr`;
  try {
    const response = await fetch(feed, { headers: { 'user-agent': 'MadaFF-Hub-NewsBot/1.0' } });
    if (!response.ok) continue;
    const xml = await response.text();
    for (const block of xml.match(/<item>[\s\S]*?<\/item>/gi) ?? []) {
      const title = text(block, 'title');
      const url = text(block, 'link');
      const source = text(block, 'source') || 'Source publique';
      const description = text(block, 'description');
      const publishedAt = new Date(text(block, 'pubDate'));
      const searchable = `${title} ${description} ${source}`;
      if (!title || !url || !Number.isFinite(publishedAt.getTime())) continue;
      if (publishedAt.getTime() < cutoff || !/(free fire|ffws|battle royale)/i.test(searchable) || !localTerms.test(searchable)) continue;
      const id = createHash('sha256').update(`${title}|${url}`).digest('hex').slice(0, 16);
      items.push({
        id,
        title,
        summary: description.slice(0, 280) || 'Nouvelle détectée dans une source publique.',
        url,
        source,
        publishedAt: publishedAt.toISOString(),
        region: 'Madagascar',
        category: classify(searchable, category),
        verified: false,
      });
    }
  } catch {
    // Un flux public indisponible ne doit pas bloquer le build ou le déploiement.
  }
}
const unique = [...new Map(items.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).map((item) => [item.id, item])).values()].slice(0, 40);
await mkdir(new URL('../frontend/public/', import.meta.url), { recursive: true });
await writeFile(output, `${JSON.stringify(unique, null, 2)}\n`);
console.log(`Analysed ${queries.length} public searches; wrote ${unique.length} recent Madagascar FF items.`);
