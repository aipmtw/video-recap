import Link from 'next/link';
import type { Recap } from '@/lib/recaps';

export function RecapList({ recaps }: { recaps: Recap[] }) {
  if (recaps.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">
        尚未發布任何影片重點筆記。
      </p>
    );
  }
  return (
    <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
      {recaps.map((r) => (
        <li key={r.slug} className="p-5 transition hover:bg-stone-50">
          <Link href={`/video-recap/${r.slug}`} className="block">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-lg font-semibold text-stone-900">{r.title}</h3>
              <time className="shrink-0 text-xs text-stone-500" dateTime={r.recap_date}>
                {r.recap_date}
              </time>
            </div>
            {r.channel && (
              <p className="mt-1 text-xs text-stone-500">頻道:{r.channel}</p>
            )}
            <p className="mt-2 text-sm leading-relaxed text-stone-600 line-clamp-3">
              {r.summary}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
