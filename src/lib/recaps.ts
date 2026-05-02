import { getPool, sql } from './db';

export type Recap = {
  slug: string;
  title: string;
  youtube_url: string;
  channel: string | null;
  recap_date: string;
  summary: string;
  key_takeaways: string[];
  quotes: string[];
  actionable_notes: string[];
  personal_comments: string | null;
};

type RecapRow = {
  slug: string;
  title: string;
  youtube_url: string;
  channel: string | null;
  recap_date: Date;
  summary: string;
  key_takeaways: string | null;
  quotes: string | null;
  actionable_notes: string | null;
  personal_comments: string | null;
};

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function toRecap(row: RecapRow): Recap {
  return {
    slug: row.slug,
    title: row.title,
    youtube_url: row.youtube_url,
    channel: row.channel,
    recap_date: row.recap_date.toISOString().slice(0, 10),
    summary: row.summary,
    key_takeaways: parseJsonArray(row.key_takeaways),
    quotes: parseJsonArray(row.quotes),
    actionable_notes: parseJsonArray(row.actionable_notes),
    personal_comments: row.personal_comments
  };
}

export async function listRecaps(): Promise<Recap[]> {
  const pool = await getPool();
  const result = await pool.request().query<RecapRow>(
    `SELECT slug, title, youtube_url, channel, recap_date, summary,
            key_takeaways, quotes, actionable_notes, personal_comments
       FROM dbo.recaps
       ORDER BY recap_date DESC, slug DESC`
  );
  return result.recordset.map(toRecap);
}

export async function getRecap(slug: string): Promise<Recap | null> {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('slug', sql.NVarChar(200), slug)
    .query<RecapRow>(
      `SELECT slug, title, youtube_url, channel, recap_date, summary,
              key_takeaways, quotes, actionable_notes, personal_comments
         FROM dbo.recaps
         WHERE slug = @slug`
    );
  const row = result.recordset[0];
  return row ? toRecap(row) : null;
}
