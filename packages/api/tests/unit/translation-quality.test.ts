import {
  containsArabicScript,
  isUsableArabicTranslation,
} from "../../src/lib/translation-quality";

describe("containsArabicScript", () => {
  it("detects Arabic characters", () => {
    expect(containsArabicScript("صداع")).toBe(true);
    expect(containsArabicScript("Headache")).toBe(false);
  });
});

describe("isUsableArabicTranslation", () => {
  it("accepts Arabic script", () => {
    expect(isUsableArabicTranslation("Headache", "صداع")).toBe(true);
  });

  it("accepts identical text (proper nouns)", () => {
    expect(isUsableArabicTranslation("Panadol", "Panadol")).toBe(true);
  });

  it("rejects empty translations", () => {
    expect(isUsableArabicTranslation("Headache", "   ")).toBe(false);
  });

  it("rejects Latin gibberish for English sources", () => {
    expect(isUsableArabicTranslation("Headache", "xkqzm")).toBe(false);
  });

  it("rejects replacement characters", () => {
    expect(isUsableArabicTranslation("Headache", "صدا\uFFFDع")).toBe(false);
  });
});
