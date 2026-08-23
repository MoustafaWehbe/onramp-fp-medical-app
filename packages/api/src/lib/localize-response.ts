import type { AppLanguage } from "./app-language";
import { localizeDeep } from "./app-language";
import { ensureCatalogArabic } from "./ensure-catalog-arabic";

export async function localizeResponse<T>(
  value: T,
  language: AppLanguage,
): Promise<T> {
  await ensureCatalogArabic(value, language);
  return localizeDeep(value, language);
}
