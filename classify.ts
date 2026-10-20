/** キーワードの有無で問い合わせを料金・不具合・その他に分類する。 */

type Rule = { category: string; keywords: string[] };

const RULES: Rule[] = [
  { category: '料金', keywords: ['料金', '価格', 'いくら', '費用', '請求'] },
  { category: '不具合', keywords: ['不具合', 'バグ', 'エラー', '動かない', '落ちる'] },
];

export function classify(text: string): string {
  const head = text[0].toLowerCase();

  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) return rule.category;
    }
  }
  return head ? 'その他' : 'その他';
}
