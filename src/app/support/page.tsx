import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-12">
      <div className="max-w-md mx-auto">
        <Link href="/login" className="flex items-center gap-2 text-zinc-400 mb-8 hover:text-zinc-200">
          <ArrowLeft size={18} />
          <span>戻る</span>
        </Link>

        <h1 className="text-2xl font-bold text-zinc-100 mb-6">サポート</h1>

        <div className="prose prose-invert prose-sm text-zinc-400 space-y-6">
          <section>
            <h2 className="text-zinc-200 font-semibold text-base">お問い合わせ</h2>
            <p>PFC Log の不具合・ご要望は 07yuki1101@gmail.com までご連絡ください。通常3営業日以内にお返事します。</p>
          </section>

          <section>
            <h2 className="text-zinc-200 font-semibold text-base">よくある質問</h2>
            <div className="space-y-4">
              <div>
                <p className="text-zinc-200">プレミアムでは何ができますか？</p>
                <p>AI相談が1日30回、栄養成分表示の撮影読み取りが1日50回まで使えるようになります（無料プランはAI相談1日1回、撮影読み取り1日5回まで）。</p>
              </div>
              <div>
                <p className="text-zinc-200">プレミアムを解約するには？</p>
                <p>iPhoneの「設定」→ Apple ID →「サブスクリプション」から PFC Log を選んで解約できます。</p>
              </div>
              <div>
                <p className="text-zinc-200">機種変更したら購入が反映されません</p>
                <p>同じApple IDでサインインした状態で、アプリの「設定」→「購入を復元する」を押してください。</p>
              </div>
              <div>
                <p className="text-zinc-200">データを削除したい</p>
                <p>アプリの「設定」→「アカウントを削除」から、すべてのデータを削除できます。</p>
              </div>
            </div>
          </section>

          <p>
            <Link href="/legal/terms" className="text-emerald-400 underline">利用規約</Link>
            ・
            <Link href="/legal/privacy" className="text-emerald-400 underline">プライバシーポリシー</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
