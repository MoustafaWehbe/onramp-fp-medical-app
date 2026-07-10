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
): Promise<ExternalCondition[]> {
  const { data } = await axios.get(BASE_URL, {
    params: {
      terms: term,
      maxList: 10,
  
    },
    timeout: 5_000,
  });
   

  const names: string[] = data[3] ?? [];

  
  return names.map((nameArray, index) => ({
    name: cleanName(nameArray[0]),
    }));
}