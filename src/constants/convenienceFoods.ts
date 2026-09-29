import { Food } from "@/types";

// コンビニで実際に買える定番商品のカタログ。
// 数値は各チェーンの公表栄養成分表示をもとにした目安値（味・時期による改定で変動するため、
// 厳密な記録が必要な場合はパッケージ記載の実際の値を優先してください）。
export const CONVENIENCE_FOODS: Omit<Food, "id">[] = [
  // ── セブン-イレブン ──
  { name: "サラダチキン(プレーン)", brand: "セブン-イレブン", calorie: 113, protein: 24.3, fat: 1.4, carb: 0.4, unit: "袋", servingSize: 1, category: "convenience" },
  { name: "サラダチキン(スモーク)", brand: "セブン-イレブン", calorie: 116, protein: 23.7, fat: 1.8, carb: 1.0, unit: "袋", servingSize: 1, category: "convenience" },
  { name: "味付き半熟ゆでたまご", brand: "セブン-イレブン", calorie: 76, protein: 6.5, fat: 5.2, carb: 0.3, unit: "個", servingSize: 1, category: "convenience" },
  { name: "からあげ棒", brand: "セブン-イレブン", calorie: 175, protein: 10.8, fat: 11.2, carb: 6.9, unit: "本", servingSize: 1, category: "convenience" },
  { name: "金の食パン(6枚切)", brand: "セブン-イレブン", calorie: 174, protein: 5.7, fat: 3.0, carb: 31.7, unit: "枚", servingSize: 1, category: "convenience" },
  { name: "おにぎり 鮭", brand: "セブン-イレブン", calorie: 179, protein: 4.6, fat: 1.9, carb: 34.9, unit: "個", servingSize: 1, category: "convenience" },
  { name: "セブンカフェ カフェラテ(S)", brand: "セブン-イレブン", calorie: 60, protein: 3.0, fat: 3.3, carb: 4.7, unit: "杯", servingSize: 1, category: "convenience" },

  // ── ローソン ──
  { name: "サラダチキン(プレーン)", brand: "ローソン", calorie: 114, protein: 24.1, fat: 1.5, carb: 0.5, unit: "個", servingSize: 1, category: "convenience" },
  { name: "サラダチキンバー(プレーン)", brand: "ローソン", calorie: 54, protein: 11.6, fat: 0.6, carb: 0.3, unit: "本", servingSize: 1, category: "convenience" },
  { name: "からあげクン(レギュラー)", brand: "ローソン", calorie: 208, protein: 12.0, fat: 13.0, carb: 10.5, unit: "パック(5個)", servingSize: 1, category: "convenience" },
  { name: "ブランパン", brand: "ローソン", calorie: 179, protein: 8.0, fat: 10.0, carb: 13.0, unit: "個", servingSize: 1, category: "convenience" },
  { name: "ギリシャヨーグルト脂肪0(プレーン)", brand: "ローソン", calorie: 60, protein: 10.0, fat: 0, carb: 4.4, unit: "個", servingSize: 1, category: "convenience" },
  { name: "からあげクン(チーズ)", brand: "ローソン", calorie: 219, protein: 11.5, fat: 14.0, carb: 11.2, unit: "パック(5個)", servingSize: 1, category: "convenience" },
  { name: "ロカボパン(小麦ふすま)", brand: "ローソン", calorie: 162, protein: 8.5, fat: 8.0, carb: 15.0, unit: "個", servingSize: 1, category: "convenience" },

  // ── ファミリーマート ──
  { name: "ファミチキ", brand: "ファミリーマート", calorie: 235, protein: 16.3, fat: 14.8, carb: 8.3, unit: "個", servingSize: 1, category: "convenience" },
  { name: "サラダチキン(プレーン)", brand: "ファミリーマート", calorie: 111, protein: 24.0, fat: 1.0, carb: 0.5, unit: "個", servingSize: 1, category: "convenience" },
  { name: "焼き鳥(塩)", brand: "ファミリーマート", calorie: 130, protein: 14.0, fat: 6.5, carb: 2.0, unit: "本2本", servingSize: 1, category: "convenience" },
  { name: "無添加国産十六穀おにぎり", brand: "ファミリーマート", calorie: 168, protein: 3.8, fat: 1.0, carb: 35.5, unit: "個", servingSize: 1, category: "convenience" },
  { name: "ファミマルグリークヨーグルト脂肪0", brand: "ファミリーマート", calorie: 59, protein: 9.8, fat: 0.1, carb: 4.5, unit: "個", servingSize: 1, category: "convenience" },
];
