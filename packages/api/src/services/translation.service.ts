export type AppLanguage = "en" | "ar";

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

export const translationService: TranslationService =
  new PassthroughTranslationService();
