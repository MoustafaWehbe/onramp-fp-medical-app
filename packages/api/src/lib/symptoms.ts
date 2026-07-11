import axios from "axios";

const BASE_URL = "https://data.bioontology.org/search";

const BIOPORTAL_API_KEY = (): string | undefined => process.env.BIOPORTAL_API_KEY;

export interface ExternalSymptom {
  name: string;
}

interface BioPortalItem {
  prefLabel?: string;
}

function cleanName(raw: string): string {
  return raw
    .replace(/[{}"\\]/g, "")
    .trim();
}

export async function searchSymptomsFromApi(
  term: string,
): Promise<ExternalSymptom[]> {
  const query = term.trim();

  if (!query) {
    return [];
  }

  const apiKey = BIOPORTAL_API_KEY();

  if (!apiKey) {
    console.error("BIOPORTAL_API_KEY is not set");
    return [];
  }

  const { data } = await axios.get(BASE_URL, {
    params: {
      q: query,
      ontologies: "SNOMEDCT",
      semantic_types: "T184,T033", // Sign or Symptom + Finding
      include: "prefLabel",
      page: 1,
      pagesize: 10,
      apikey: apiKey,
    },
    timeout: 5000,
  });

  const items: BioPortalItem[] = Array.isArray(data?.collection)
    ? data.collection
    : [];

  const names = [
    ...new Set(
      items
        .map((item) =>
          typeof item.prefLabel === "string"
            ? cleanName(item.prefLabel)
            : null,
        )
        .filter((name): name is string => Boolean(name)),
    ),
  ];

  return names.map((name) => ({
    name,
  }));
}