import { listRecaps } from '@/lib/recaps';
import { RecapList } from '@/components/RecapList';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const recaps = await listRecaps();
  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-wide text-stone-900">
          精選影片重點筆記
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          從值得反覆觀看的 YouTube 影片中,整理成繁體中文的重點摘要與行動筆記。
        </p>
      </div>
      <RecapList recaps={recaps} />
    </section>
  );
}
