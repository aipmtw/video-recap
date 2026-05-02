import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRecap } from '@/lib/recaps';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recap = await getRecap(slug);
  if (!recap) return { title: '找不到頁面' };
  return {
    title: `${recap.title} | 影片重點筆記`,
    description: recap.summary
  };
}

export default async function RecapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recap = await getRecap(slug);
  if (!recap) notFound();

  return (
    <article className="recap-prose">
      <nav className="mb-6 text-sm">
        <Link href="/video-recap" className="text-stone-500 hover:text-stone-900">
          ← 回到所有筆記
        </Link>
      </nav>

      <header className="mb-8 border-b border-stone-200 pb-6">
        <h1 className="text-3xl font-semibold leading-snug tracking-wide text-stone-900">
          {recap.title}
        </h1>
        <dl className="mt-4 space-y-1 text-sm text-stone-500">
          {recap.channel && (
            <div><dt className="inline">頻道:</dt> <dd className="inline">{recap.channel}</dd></div>
          )}
          <div>
            <dt className="inline">發布日期:</dt>{' '}
            <dd className="inline"><time dateTime={recap.recap_date}>{recap.recap_date}</time></dd>
          </div>
          <div>
            <dt className="inline">原始影片:</dt>{' '}
            <dd className="inline">
              <a
                href={recap.youtube_url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-rose-700 underline-offset-2 hover:underline"
              >
                YouTube 連結
              </a>
            </dd>
          </div>
        </dl>
      </header>

      <Section title="影片摘要">
        <p>{recap.summary}</p>
      </Section>

      {recap.key_takeaways.length > 0 && (
        <Section title="重點整理">
          <ul className="list-disc space-y-2 pl-6">
            {recap.key_takeaways.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </Section>
      )}

      {recap.quotes.length > 0 && (
        <Section title="重要引言與想法">
          <ul className="space-y-3">
            {recap.quotes.map((q, i) => (
              <li key={i} className="border-l-4 border-stone-300 pl-4 italic text-stone-700">
                「{q}」
              </li>
            ))}
          </ul>
        </Section>
      )}

      {recap.actionable_notes.length > 0 && (
        <Section title="可執行筆記">
          <ul className="list-decimal space-y-2 pl-6">
            {recap.actionable_notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </Section>
      )}

      {recap.personal_comments && (
        <Section title="個人觀點">
          <p>{recap.personal_comments}</p>
        </Section>
      )}
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold tracking-wide text-stone-900">{title}</h2>
      <div className="text-stone-800">{children}</div>
    </section>
  );
}
