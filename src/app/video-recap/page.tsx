import { listRecaps } from '@/lib/recaps';
import { RecapList } from '@/components/RecapList';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: '所有影片重點筆記 | Video Recap',
  description: '所有已發布的 YouTube 影片重點筆記彙整'
};

export default async function ArchivePage() {
  const recaps = await listRecaps();
  return (
    <section>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-wide text-stone-900">
          所有影片重點筆記
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          依發布時間由新至舊排列,共 {recaps.length} 篇。
        </p>
      </header>
      <RecapList recaps={recaps} />
    </section>
  );
}
