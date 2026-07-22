const OPEN_FDA_NDC_URL = "https://api.fda.gov/drug/ndc.json";
const OPEN_FDA_FETCH_TIMEOUT_MS = 5_000;
const MEDICATION_SEARCH_LIMIT = 10;
const MAX_NAME_LENGTH = 60;

interface OpenFdaNdcResult {
  brand_name?: string;
  generic_name?: string;
}

interface OpenFdaNdcResponse {
  results?: OpenFdaNdcResult[];
}

function escapeOpenFdaTerm(value: string): string {
  return value.replace(/[+"\\]/g, "\\$&");
}

function isCleanMedicationName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > MAX_NAME_LENGTH) return false;
  if (trimmed.includes(",")) return false;
  if (/\s+and\s+/i.test(trimmed)) return false;
  return true;
}

function nameMatchesSearch(name: string, search: string): boolean {
  const normalizedName = name.toLocaleLowerCase();
  const normalizedSearch = search.toLocaleLowerCase();

  if (normalizedName.startsWith(normalizedSearch)) return true;

  return normalizedName
    .split(/\s+/)
    .some((word) => word.startsWith(normalizedSearch));
}

function rankName(name: string, search: string): number {
  const normalizedName = name.toLocaleLowerCase();
  const normalizedSearch = search.toLocaleLowerCase();

  let score = 0;
  if (normalizedName === normalizedSearch) score += 1_000;
  else if (normalizedName.startsWith(normalizedSearch)) score += 500;

  score -= name.length;
  return score;
}

function extractCandidates(
  results: OpenFdaNdcResult[],
  search: string,
  fields: Array<"brand_name" | "generic_name">,
): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const result of results) {
    for (const field of fields) {
      const candidate = result[field];
      if (typeof candidate !== "string") continue;

      const name = candidate.trim();
      if (
        !isCleanMedicationName(name) ||
        !nameMatchesSearch(name, search)
      ) {
        continue;
      }

      const key = name.toLocaleLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      names.push(name);
    }
  }

  return names;
}

function takeTopNames(names: string[], search: string): string[] {
  return [...names]
    .sort((left, right) => rankName(right, search) - rankName(left, search))
    .slice(0, MEDICATION_SEARCH_LIMIT);
}

async function fetchOpenFdaResults(
  searchQuery: string,
): Promise<OpenFdaNdcResult[]> {
  const url =
    `${OPEN_FDA_NDC_URL}?search=${encodeURIComponent(searchQuery)}&limit=100`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(OPEN_FDA_FETCH_TIMEOUT_MS),
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`Medication search failed with status ${response.status}`);
  }

  const data = (await response.json()) as OpenFdaNdcResponse;
  return data.results ?? [];
}

export async function searchMedicationNames(search: string): Promise<string[]> {
  const trimmed = search.trim();
  if (!trimmed) return [];

  const escaped = escapeOpenFdaTerm(trimmed);
  const brandResults = await fetchOpenFdaResults(`brand_name:${escaped}*`);
  const names = extractCandidates(brandResults, trimmed, ["brand_name"]);

  if (names.length >= MEDICATION_SEARCH_LIMIT) {
    return takeTopNames(names, trimmed);
  }

  const genericResults = await fetchOpenFdaResults(`generic_name:${escaped}*`);
  const genericNames = extractCandidates(genericResults, trimmed, [
    "generic_name",
  ]);

  const seen = new Set(names.map((name) => name.toLocaleLowerCase()));
  for (const name of genericNames) {
    const key = name.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }

  return takeTopNames(names, trimmed);
}
