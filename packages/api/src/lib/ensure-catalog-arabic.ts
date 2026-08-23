import { ConditionCatalog, SymptomCatalog } from "../models";
import type { AppLanguage } from "./app-language";
import { translationService } from "../services/translation.service";
import { isUsableArabicTranslation } from "./translation-quality";

type CatalogKind = "condition" | "symptom";

type CatalogNode = {
  id?: string;
  name?: string | null;
  nameAr?: string | null;
  category?: string | null;
  categoryAr?: string | null;
  isCustom?: boolean;
  setDataValue?: (key: string, value: unknown) => void;
};

function isCustomSymptom(value: unknown): boolean {
  if (value instanceof SymptomCatalog) return Boolean(value.isCustom);
  if (value === null || typeof value !== "object") return false;
  return Boolean((value as { isCustom?: boolean }).isCustom);
}

function kindOf(value: unknown): CatalogKind | null {
  if (value instanceof ConditionCatalog) return "condition";
  if (value instanceof SymptomCatalog) {
    return value.isCustom ? null : "symptom";
  }

  if (value === null || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (!("name" in row) || !("nameAr" in row)) return null;
  if ("strength" in row) return null;
  if ("category" in row || "categoryAr" in row) {
    return isCustomSymptom(value) ? null : "symptom";
  }
  return "condition";
}

function collectCatalogNodes(
  value: unknown,
  out: CatalogNode[],
  seen: Set<object>,
): void {
  if (Array.isArray(value)) {
    for (const item of value) collectCatalogNodes(item, out, seen);
    return;
  }
  if (value === null || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);

  if (kindOf(value)) {
    out.push(value as CatalogNode);
  }

  const maybeModel = value as { dataValues?: Record<string, unknown> };
  const source =
    maybeModel.dataValues && typeof maybeModel.dataValues === "object"
      ? maybeModel.dataValues
      : (value as Record<string, unknown>);

  for (const [key, nested] of Object.entries(source)) {
    if (key === "sequelize" || key.startsWith("_")) continue;
    collectCatalogNodes(nested, out, seen);
  }
}

function setField(
  node: CatalogNode,
  key: "nameAr" | "categoryAr",
  value: string,
) {
  if (typeof node.setDataValue === "function") {
    node.setDataValue(key, value);
  } else {
    node[key] = value;
  }
}

async function persist(
  kind: CatalogKind,
  id: string,
  fields: { nameAr?: string; categoryAr?: string },
): Promise<void> {
  const Model = kind === "condition" ? ConditionCatalog : SymptomCatalog;
  await Model.update(fields, { where: { id } });
}

export async function ensureCatalogArabic<T>(
  value: T,
  language: AppLanguage,
): Promise<T> {
  if (language !== "ar") return value;

  const nodes: CatalogNode[] = [];
  collectCatalogNodes(value, nodes, new Set());
  if (nodes.length === 0) return value;

  const texts: string[] = [];
  const textIndexByValue = new Map<string, number>();
  const jobs: Array<{
    node: CatalogNode;
    kind: CatalogKind;
    field: "nameAr" | "categoryAr";
    source: string;
    textIndex: number;
  }> = [];

  const queueText = (text: string): number => {
    const existing = textIndexByValue.get(text);
    if (existing !== undefined) return existing;
    const index = texts.length;
    texts.push(text);
    textIndexByValue.set(text, index);
    return index;
  };

  for (const node of nodes) {
    const kind = kindOf(node);
    if (!kind) continue;

    const name = node.name?.trim();
    if (name && !isUsableArabicTranslation(name, node.nameAr)) {
      jobs.push({
        node,
        kind,
        field: "nameAr",
        source: name,
        textIndex: queueText(name),
      });
    }

    if (kind === "condition") continue;

    const category = node.category?.trim();
    if (
      category &&
      !isUsableArabicTranslation(category, node.categoryAr)
    ) {
      jobs.push({
        node,
        kind,
        field: "categoryAr",
        source: category,
        textIndex: queueText(category),
      });
    }
  }

  if (texts.length === 0) return value;

  const translated = await translationService.translateMany(texts, "en", "ar");
  const pendingPersists: Promise<void>[] = [];

  for (const job of jobs) {
    const candidate = translated[job.textIndex] ?? job.source;
    if (!isUsableArabicTranslation(job.source, candidate)) continue;
    if (candidate === job.source) continue;

    setField(job.node, job.field, candidate);

    if (job.node.id) {
      pendingPersists.push(
        persist(job.kind, job.node.id, { [job.field]: candidate }).catch(
          () => undefined,
        ),
      );
    }
  }

  await Promise.all(pendingPersists);
  return value;
}
