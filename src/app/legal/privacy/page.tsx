import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="max-w-md mx-auto">
        <Link href="/login" className="flex items-center gap-2 text-zinc-400 mb-8 hover:text-zinc-200">
          <ArrowLeft size={18} />
          <span>戻る</span>
        </Link>

        <h1 className="text-2xl font-bold text-zinc-100 mb-6">プライバシーポリシー</h1>

        <div className="prose prose-invert prose-sm text-zinc-400 space-y-4">
          <section>
            <h2 className="text-zinc-200 font-semibold text-base">収集する情報</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>アカウント情報（氏名、メールアドレス）</li>
              <li>プロフィール情報（年齢、身長、体重、目標）</li>
              <li>食事記録データ</li>
              <li>アプリの利用ログ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-zinc-200 font-semibold text-base">情報の利用目的</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>サービスの提供・改善</li>
              <li>PFC目標値の計算</li>
              <li>カスタマーサポート</li>
            </ul>
          </section>

          <section>
            <h2 className="text-zinc-200 font-semibold text-base">第三者提供</h2>
            <p>収集した情報は、法令に基づく場合を除き、第三者に提供しません。ただし、以下のサービスを利用します：</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Firebase（Google）: 認証・データ保存</li>
            </ul>
          </section>

          <section>
            <h2 className="text-zinc-200 font-semibold text-base">データの保管</h2>
            <p>データはFirebase（Google Cloud）に安全に保管されます。アカウント削除時にすべてのデータを完全に削除します。</p>
          </section>

          <section>
            <h2 className="text-zinc-200 font-semibold text-base">データの削除</h2>
            <p>設定画面の「アカウントを削除」からいつでも全データを削除できます。削除後のデータは復元できません。</p>
          </section>

          <section>
            <h2 className="text-zinc-200 font-semibold text-base">お問い合わせ</h2>
            <p>プライバシーに関するお問い合わせは 07yuki1101@gmail.com までご連絡ください。</p>
          </section>

          <p className="text-zinc-600 text-xs mt-8">最終更新: 2026年5月27日</p>
        </div>
      </div>
    </div>
  );
}
