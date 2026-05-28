import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="max-w-md mx-auto">
        <Link href="/login" className="flex items-center gap-2 text-zinc-400 mb-8 hover:text-zinc-200">
          <ArrowLeft size={18} />
          <span>戻る</span>
        </Link>

        <h1 className="text-2xl font-bold text-zinc-100 mb-6">利用規約</h1>

        <div className="prose prose-invert prose-sm text-zinc-400 space-y-4">
          <section>
            <h2 className="text-zinc-200 font-semibold text-base">第1条（適用）</h2>
            <p>本規約は、PFC Manager（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意した上で本サービスを利用するものとします。</p>
          </section>

          <section>
            <h2 className="text-zinc-200 font-semibold text-base">第2条（サービス内容）</h2>
            <p>本サービスは、食事記録およびPFC（タンパク質・脂質・炭水化物）管理機能を提供します。本サービスは医療行為ではなく、健康状態の診断・治療を目的としません。</p>
          </section>

          <section>
            <h2 className="text-zinc-200 font-semibold text-base">第3条（アカウント）</h2>
            <p>ユーザーはGoogleまたはAppleアカウントを使用してログインします。アカウントの管理はユーザーの責任で行うものとします。</p>
          </section>

          <section>
            <h2 className="text-zinc-200 font-semibold text-base">第4条（有料サービス）</h2>
            <p>有料プランはアプリ内課金にて提供されます。課金はApple App Storeを通じて処理され、Appleの規約に従います。</p>
          </section>

          <section>
            <h2 className="text-zinc-200 font-semibold text-base">第5条（禁止事項）</h2>
            <p>本サービスの逆コンパイル・リバースエンジニアリング、不正アクセス、他ユーザーへの迷惑行為を禁止します。</p>
          </section>

          <section>
            <h2 className="text-zinc-200 font-semibold text-base">第6条（免責事項）</h2>
            <p>本サービスは「現状有姿」で提供されます。運営者は本サービスの利用によって生じた損害に対して責任を負いません。</p>
          </section>

          <section>
            <h2 className="text-zinc-200 font-semibold text-base">第7条（改定）</h2>
            <p>本規約は予告なく変更する場合があります。重要な変更はアプリ内で通知します。</p>
          </section>

          <p className="text-zinc-600 text-xs mt-8">最終更新: 2026年5月27日</p>
        </div>
      </div>
    </div>
  );
}
