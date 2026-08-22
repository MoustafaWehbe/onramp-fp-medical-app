import axios from "axios";
import type { AppLanguage } from "../lib/app-language";
import { isUsableArabicTranslation } from "../lib/translation-quality";

export interface TranslationService {
  translate(
    text: string,
    source: AppLanguage,
    target: AppLanguage,
  ): Promise<string>;

  translateMany(
    texts: string[],
    source: AppLanguage,
    target: AppLanguage,
  ): Promise<string[]>;
}

export class PassthroughTranslationService implements TranslationService {
  async translate(
    text: string,
    _source: AppLanguage,
    _target: AppLanguage,
  ): Promise<string> {
    return text;
  }

  async translateMany(
    texts: string[],
    source: AppLanguage,
    target: AppLanguage,
  ): Promise<string[]> {
    return Promise.all(
      texts.map((text) => this.translate(text, source, target)),
    );
  }
}

type GoogleTranslateResponse = {
  data?: {
    translations?: Array<{ translatedText?: string }>;
  };
};

const GOOGLE_TRANSLATE_URL =
  "https://translation.googleapis.com/language/translate/v2";
const BATCH_SIZE = 50;

export class GoogleTranslateTranslationService implements TranslationService {
  constructor(private readonly apiKey: string) {}

  async translate(
    text: string,
    source: AppLanguage,
    target: AppLanguage,
  ): Promise<string> {
    const [result] = await this.translateMany([text], source, target);
    return result ?? text;
  }

  async translateMany(
    texts: string[],
    source: AppLanguage,
    target: AppLanguage,
  ): Promise<string[]> {
    if (source === target || texts.length === 0) {
      return [...texts];
    }

    const results = [...texts];
    const pendingIndexes: number[] = [];
    const pendingTexts: string[] = [];

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (!text?.trim()) {
        results[i] = text;
        continue;
      }
      pendingIndexes.push(i);
      pendingTexts.push(text);
    }

    for (let start = 0; start < pendingTexts.length; start += BATCH_SIZE) {
      const chunk = pendingTexts.slice(start, start + BATCH_SIZE);
      const indexChunk = pendingIndexes.slice(start, start + BATCH_SIZE);

      try {
        const translated = await this.requestTranslate(chunk, source, target);
        for (let j = 0; j < chunk.length; j++) {
          const original = chunk[j];
          const candidate = translated[j] ?? original;
          results[indexChunk[j]] = this.acceptOrFallback(
            original,
            candidate,
            target,
          );
        }
      } catch {
        for (const idx of indexChunk) {
          results[idx] = texts[idx];
        }
      }
    }

    return results;
  }

  private acceptOrFallback(
    original: string,
    candidate: string,
    target: AppLanguage,
  ): string {
    if (target !== "ar") return candidate;
    return isUsableArabicTranslation(original, candidate) ? candidate : original;
  }

  private async requestTranslate(
    texts: string[],
    source: AppLanguage,
    target: AppLanguage,
  ): Promise<string[]> {
    const { data } = await axios.post<GoogleTranslateResponse>(
      GOOGLE_TRANSLATE_URL,
      {
        q: texts,
        source,
        target,
        format: "text",
      },
      {
        params: { key: this.apiKey },
        headers: { "Content-Type": "application/json" },
        timeout: 15_000,
      },
    );

    const translations = data.data?.translations ?? [];
    return texts.map((original, i) => {
      const raw = translations[i]?.translatedText;
      return typeof raw === "string" ? decodeHtmlEntities(raw) : original;
    });
  }
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function createTranslationService(): TranslationService {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY?.trim();
  if (!apiKey || process.env.NODE_ENV === "test") {
    return new PassthroughTranslationService();
  }
  return new GoogleTranslateTranslationService(apiKey);
}

let cachedService: TranslationService | null = null;

function getTranslationService(): TranslationService {
  if (!cachedService) {
    cachedService = createTranslationService();
  }
  return cachedService;
}

export const translationService: TranslationService = {
  translate(text, source, target) {
    return getTranslationService().translate(text, source, target);
  },
  translateMany(texts, source, target) {
    return getTranslationService().translateMany(texts, source, target);
  },
};
