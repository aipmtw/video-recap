import { readFile } from 'node:fs/promises';
import sql from 'mssql';

const cfg = {
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  port: Number(process.env.AZURE_SQL_PORT || 1433),
  options: { encrypt: process.env.AZURE_SQL_ENCRYPT !== 'false' }
};

const seed = JSON.parse(
  await readFile(new URL('../db/seed.json', import.meta.url), 'utf8')
);

const pool = await sql.connect(cfg);

for (const r of seed) {
  await pool
    .request()
    .input('slug', sql.NVarChar(200), r.slug)
    .input('title', sql.NVarChar(400), r.title)
    .input('youtube_url', sql.NVarChar(500), r.youtube_url)
    .input('channel', sql.NVarChar(200), r.channel ?? null)
    .input('recap_date', sql.Date, new Date(r.recap_date))
    .input('summary', sql.NVarChar(sql.MAX), r.summary)
    .input('key_takeaways', sql.NVarChar(sql.MAX), JSON.stringify(r.key_takeaways ?? []))
    .input('quotes', sql.NVarChar(sql.MAX), JSON.stringify(r.quotes ?? []))
    .input('actionable_notes', sql.NVarChar(sql.MAX), JSON.stringify(r.actionable_notes ?? []))
    .input('personal_comments', sql.NVarChar(sql.MAX), r.personal_comments ?? null)
    .query(`
      MERGE dbo.recaps AS t
      USING (SELECT @slug AS slug) AS s
        ON t.slug = s.slug
      WHEN MATCHED THEN UPDATE SET
        title = @title,
        youtube_url = @youtube_url,
        channel = @channel,
        recap_date = @recap_date,
        summary = @summary,
        key_takeaways = @key_takeaways,
        quotes = @quotes,
        actionable_notes = @actionable_notes,
        personal_comments = @personal_comments,
        updated_at = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN INSERT
        (slug, title, youtube_url, channel, recap_date, summary,
         key_takeaways, quotes, actionable_notes, personal_comments)
        VALUES
        (@slug, @title, @youtube_url, @channel, @recap_date, @summary,
         @key_takeaways, @quotes, @actionable_notes, @personal_comments);
    `);
  console.log('Seeded:', r.slug);
}

await pool.close();
