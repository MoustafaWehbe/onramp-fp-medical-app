const ARABIC_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export function containsArabicScript(value: string | null | undefined): boolean {
  return ARABIC_SCRIPT.test(value ?? "");
}

export function isUsableArabicTranslation(
  source: string | null | undefined,
  translated: string | null | undefined,
): boolean {
  const original = (source ?? "").trim();
  const text = (translated ?? "").trim();
  if (!text) return false;
  if (text.includes("\uFFFD")) return false;
  if (text === original) return true;
  if (containsArabicScript(text)) return true;
  if (!/[A-Za-z]{2,}/.test(original)) return true;
  return false;
}
