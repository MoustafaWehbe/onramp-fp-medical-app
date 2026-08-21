import { Op, type WhereOptions } from "sequelize";
import type { AppLanguage } from "./app-language";
import { containsArabicScript } from "./translation-quality";
import { translationService } from "../services/translation.service";

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

async function resolveSearchTerms(search: string): Promise<string[]> {
  const trimmed = search.trim();
  if (!trimmed) return [];

  const terms = new Set<string>([trimmed]);

  if (containsArabicScript(trimmed)) {
    const english = (await translationService.translate(trimmed, "ar", "en")).trim();
    if (english && english.toLowerCase() !== trimmed.toLowerCase()) {
      terms.add(english);
    }
  }

  return [...terms];
}

export async function buildLocalizedNameSearch(
  language: AppLanguage,
  search?: string,
  extraFields: Array<"category" | "strength"> = [],
): Promise<WhereOptions | undefined> {
  const trimmed = search?.trim();
  if (!trimmed) return undefined;

  const terms = await resolveSearchTerms(trimmed);
  const clauses: WhereOptions[] = [];
  const searchArabicColumns =
    language === "ar" || containsArabicScript(trimmed);

  for (const term of terms) {
    const pattern = `%${escapeLike(term)}%`;
    clauses.push({ name: { [Op.iLike]: pattern } });

    if (searchArabicColumns) {
      clauses.push({ nameAr: { [Op.iLike]: pattern } });
    }

    for (const field of extraFields) {
      clauses.push({ [field]: { [Op.iLike]: pattern } });
      if (searchArabicColumns && field === "category") {
        clauses.push({ categoryAr: { [Op.iLike]: pattern } });
      }
    }
  }

  return { [Op.or]: clauses };
}
