import { ConsultationOption } from "./types";

// UI label/description are separate from the id: the id is what's sent to
// the AI backend, the label/description are what the user sees.
export const CONSULTATION_OPTIONS: ConsultationOption[] = [
  {
    id: "remaining_meal",
    label: "今日の残りPFCから食事を考える",
    description: "残りのカロリー・PFCになるべく近づく食事を提案します",
  },
  {
    id: "protein",
    label: "タンパク質を補う食事を考える",
    description: "不足しているタンパク質を優先的に補う食事を提案します",
  },
  {
    id: "dinner",
    label: "今晩の夕食を考える",
    description: "残りのPFCに収まる夕食メニューを提案します",
  },
  {
    id: "convenience_store",
    label: "コンビニで買えるもので済ませる",
    description: "コンビニで手軽に買える食品の組み合わせを提案します",
  },
  {
    id: "daily_review",
    label: "今日の食事を振り返る",
    description: "今日食べた内容を振り返り、アドバイスをもらいます",
  },
];
