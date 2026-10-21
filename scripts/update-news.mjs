import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const feeds = [
  'https://news.google.com/rss/search?q=Free+Fire+Madagascar&hl=fr&gl=MG&ceid=MG:fr',
  'https://news.google.com/rss/search?q=Free+Fire+esport+Madagascar&hl=fr&gl=MG&ceid=MG:fr',
];
const output = new URL('../frontend/public/news.json', import.meta.url);
const strip = (value) => value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/<[^>]*>/g, '').trim();
const text = (xml, tag) => strip(xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'))?.[1] ?? '');
const localTerms = /madagascar|malagasy|antananarivo|toliara|toamasina|tamatave|mahajanga|fianarantsoa|mg\b/i;
const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;

const items = [];
for (const feed of feeds) {
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
      items.push({ id, title, summary: description.slice(0, 280) || 'Nouvelle détectée dans une source publique.', url, source, publishedAt: publishedAt.toISOString(), region: 'Madagascar', verified: false });
    }
  } catch {
    // One unavailable public feed must not block the daily update.
  }
}
const unique = [...new Map(items.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).map((item) => [item.id, item])).values()].slice(0, 30);
await mkdir(new URL('../frontend/public/', import.meta.url), { recursive: true });
await writeFile(output, `${JSON.stringify(unique, null, 2)}\n`);
console.log(`Wrote ${unique.length} recent Madagascar news items to ${output.pathname}`);
