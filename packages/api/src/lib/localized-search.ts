import { Op, type WhereOptions } from "sequelize";
import type { AppLanguage } from "./app-language";

function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

export function buildLocalizedNameSearch(
  language: AppLanguage,
  search?: string,
  extraFields: Array<"category" | "strength"> = [],
): WhereOptions | undefined {
  const trimmed = search?.trim();
  if (!trimmed) return undefined;

  const pattern = `%${escapeLike(trimmed)}%`;
  const clauses: WhereOptions[] = [{ name: { [Op.iLike]: pattern } }];

  if (language === "ar") {
    clauses.push({ nameAr: { [Op.iLike]: pattern } });
  }

  for (const field of extraFields) {
    clauses.push({ [field]: { [Op.iLike]: pattern } });
    if (language === "ar" && field === "category") {
      clauses.push({ categoryAr: { [Op.iLike]: pattern } });
    }
  }

  return { [Op.or]: clauses };
}
