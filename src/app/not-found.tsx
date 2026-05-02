import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-2xl font-semibold text-stone-900">找不到這個頁面</h1>
      <p className="mt-3 text-sm text-stone-600">您要找的影片重點筆記可能已被移除或尚未發布。</p>
      <Link href="/" className="mt-6 inline-block text-rose-700 hover:underline">
        返回首頁
      </Link>
    </section>
  );
}
