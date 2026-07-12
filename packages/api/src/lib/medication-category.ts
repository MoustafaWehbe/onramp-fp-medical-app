const OPEN_FDA_NDC_URL = "https://api.fda.gov/drug/ndc.json";
const OPEN_FDA_LABEL_URL = "https://api.fda.gov/drug/label.json";
const OPEN_FDA_FETCH_TIMEOUT_MS = 10_000;

interface OpenFdaNdcResult {
  brand_name?: string;
  generic_name?: string;
  active_ingredients?: Array<{ name?: string }>;
  openfda?: {
    pharm_class_epc?: string[];
    pharm_class_moa?: string[];
    pharm_class_cs?: string[];
  };
  pharm_class?: string[];
}

interface OpenFdaNdcResponse {
  results?: OpenFdaNdcResult[];
}

interface OpenFdaLabelResult {
  purpose?: string[];
}

interface OpenFdaLabelResponse {
  results?: OpenFdaLabelResult[];
}

const CLASS_CATEGORY_RULES: Array<{ pattern: RegExp; category: string }> = [
  {
    pattern:
      /nonsteroidal anti-inflammatory|nsaid|analgesic|antipyretic|opioid agonist|pain reliever|fever reducer/i,
    category: "Painkiller",
  },
  {
    pattern: /antibiotic|anti-bacterial|penicillin|cephalosporin|macrolide/i,
    category: "Antibiotic",
  },
  {
    pattern: /antihistamine|histamine h1 antagonist/i,
    category: "Antihistamine",
  },
  {
    pattern: /alpha.?1.?adrenergic agonist|decongestant|nasal decongestant/i,
    category: "Decongestant",
  },
  { pattern: /expectorant|cough suppressant/i, category: "Cough" },
  {
    pattern: /proton pump|antacid|h2 antagonist|antiulcer|gastrointestinal/i,
    category: "Digestive",
  },
  {
    pattern: /antidepressant|ssri|snri|selective serotonin/i,
    category: "Antidepressant",
  },
  {
    pattern:
      /ace inhibitor|beta blocker|calcium channel|antihypertensive|diuretic/i,
    category: "Cardiovascular",
  },
  {
    pattern: /biguanide|insulin|antidiabetic|hypoglycemic/i,
    category: "Diabetes",
  },
  { pattern: /corticosteroid|glucocorticoid/i, category: "Steroid" },
  {
    pattern: /bronchodilator|beta-2 adrenergic agonist/i,
    category: "Respiratory",
  },
  { pattern: /antifungal/i, category: "Antifungal" },
  { pattern: /antiviral/i, category: "Antiviral" },
  { pattern: /statin|lipid/i, category: "Cholesterol" },
  { pattern: /anticoagulant|antiplatelet/i, category: "Blood-thinner" },
];

const INGREDIENT_CATEGORY_MAP: Record<string, string> = {
  acetaminophen: "Painkiller",
  ibuprofen: "Painkiller",
  aspirin: "Painkiller",
  naproxen: "Painkiller",
  "acetylsalicylic acid": "Painkiller",
  amoxicillin: "Antibiotic",
  azithromycin: "Antibiotic",
  penicillin: "Antibiotic",
  metformin: "Diabetes",
  loratadine: "Antihistamine",
  cetirizine: "Antihistamine",
  diphenhydramine: "Antihistamine",
  omeprazole: "Digestive",
  lisinopril: "Cardiovascular",
};

function escapeOpenFdaTerm(value: string): string {
  return value.replace(/[+"\\]/g, "\\$&");
}

function normalizeName(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function cleanPharmClass(value: string): string {
  return value.replace(/\s*\[(EPC|CS|MoA)\]\s*/gi, "").trim();
}

function mapTextToCategory(text: string): string | null {
  for (const rule of CLASS_CATEGORY_RULES) {
    if (rule.pattern.test(text)) {
      return rule.category;
    }
  }
  return null;
}

function mapIngredientToCategory(ingredient: string): string | null {
  return INGREDIENT_CATEGORY_MAP[normalizeName(ingredient)] ?? null;
}

function collectPharmClasses(result: OpenFdaNdcResult): string[] {
  const classes = [
    ...(result.openfda?.pharm_class_epc ?? []),
    ...(result.pharm_class ?? []),
    ...(result.openfda?.pharm_class_cs ?? []),
    ...(result.openfda?.pharm_class_moa ?? []),
  ];

  return classes.map(cleanPharmClass);
}

function collectActiveIngredients(result: OpenFdaNdcResult): string[] {
  return (result.active_ingredients ?? [])
    .map((ingredient) => ingredient.name?.trim())
    .filter((name): name is string => Boolean(name));
}

function scoreNdcResult(result: OpenFdaNdcResult, name: string): number {
  const target = normalizeName(name);
  const generic = normalizeName(result.generic_name ?? "");
  const brand = normalizeName(result.brand_name ?? "");
  let score = 0;

  if (generic === target) score += 1_000;
  else if (brand === target) score += 900;
  else if (generic.split(/\s+and\s+/)[0] === target) score += 500;

  if (collectPharmClasses(result).length > 0) score += 100;
  if (!generic.includes(" and ") && !generic.includes(",")) score += 50;

  return score;
}

function resolveCategoryFromNdcResults(
  results: OpenFdaNdcResult[],
  name: string,
): string | null {
  const ranked = [...results].sort(
    (left, right) => scoreNdcResult(right, name) - scoreNdcResult(left, name),
  );

  for (const result of ranked) {
    for (const pharmClass of collectPharmClasses(result)) {
      const category = mapTextToCategory(pharmClass);
      if (category) return category;
    }
  }

  for (const result of ranked) {
    for (const ingredient of collectActiveIngredients(result)) {
      const category = mapIngredientToCategory(ingredient);
      if (category) return category;
    }
  }

  return null;
}

async function fetchOpenFdaNdcResults(
  searchQuery: string,
): Promise<OpenFdaNdcResult[]> {
  const url =
    `${OPEN_FDA_NDC_URL}?search=${encodeURIComponent(searchQuery)}&limit=20`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(OPEN_FDA_FETCH_TIMEOUT_MS),
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(
      `Medication category lookup failed with status ${response.status}`,
    );
  }

  const data = (await response.json()) as OpenFdaNdcResponse;
  return data.results ?? [];
}

async function fetchLabelPurpose(name: string): Promise<string[]> {
  const escaped = escapeOpenFdaTerm(name);
  const queries = [
    `openfda.generic_name:"${escaped}"`,
    `openfda.brand_name:"${escaped}"`,
  ];

  for (const query of queries) {
    const url =
      `${OPEN_FDA_LABEL_URL}?search=${encodeURIComponent(query)}&limit=1`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(OPEN_FDA_FETCH_TIMEOUT_MS),
    });

    if (response.status === 404) continue;
    if (!response.ok) {
      throw new Error(
        `Medication category lookup failed with status ${response.status}`,
      );
    }

    const data = (await response.json()) as OpenFdaLabelResponse;
    const purpose = data.results?.[0]?.purpose;
    if (purpose?.length) return purpose;
  }

  return [];
}

export async function lookupMedicationCategory(
  name: string,
): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const escaped = escapeOpenFdaTerm(trimmed);
  const [brandResults, genericResults] = await Promise.all([
    fetchOpenFdaNdcResults(`brand_name:"${escaped}"`),
    fetchOpenFdaNdcResults(`generic_name:"${escaped}"`),
  ]);

  const category = resolveCategoryFromNdcResults(
    [...brandResults, ...genericResults],
    trimmed,
  );
  if (category) return category;

  const purposes = await fetchLabelPurpose(trimmed);
  for (const purpose of purposes) {
    const mapped = mapTextToCategory(purpose);
    if (mapped) return mapped;
  }

  return mapIngredientToCategory(trimmed);
}
