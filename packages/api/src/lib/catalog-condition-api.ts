import axios from "axios";

const BASE_URL = "https://clinicaltables.nlm.nih.gov/api/conditions/v3/search";

export interface ExternalCondition {
  name: string;
}

// clean name if it contains any of the following characters: { } " \
function cleanName(raw:string):string{
  return raw.replace(/[{}"\\]/g, "").trim();
}

export async function searchConditionsFromApi(
  term: string,
): Promise<string[]> {
  const { data } = await axios.get(BASE_URL, {
    params: {
      terms: term,
      maxList: 10,
    },
    timeout: 5_000,
  });
  const names: unknown[] = Array.isArray(data) && Array.isArray(data[3]) ? data[3] : [];
  return names
    .filter((entry): entry is string[] => Array.isArray(entry) && typeof entry[0] === "string")
    .map((entry) => cleanName(entry[0]));
}