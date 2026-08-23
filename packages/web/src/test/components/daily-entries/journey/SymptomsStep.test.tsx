import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { SymptomsStep } from "../../../../components/daily-entries/journey/SymptomsStep";
import type { UserSymptom } from "../../../../lib/health/health-export";

vi.mock("../../../../i18n", () => ({ default: { language: "en" } }));

vi.mock("react-i18next", () => ({
  initReactI18next: { type: "languageDetector", init: vi.fn() },
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "dailyEntries.journey.composer.addSymptom": "Add symptom",
        "dailyEntries.journey.composer.loadingSymptoms": "Loading symptoms…",
        "dailyEntries.journey.composer.newSymptom": "New symptom",
        "dailyEntries.journey.composer.symptom": "Symptom",
        "dailyEntries.journey.composer.selectSymptom": "Select a symptom",
        "dailyEntries.journey.composer.severity": "Severity",
        "dailyEntries.journey.composer.severityPlaceholder": "1-10",
        "dailyEntries.journey.composer.severityValue": "Severity: {value}",
        "dailyEntries.journey.composer.notes": "Notes",
        "dailyEntries.journey.composer.optionalNotes": "Optional notes",
        "dailyEntries.journey.composer.noSymptomsAdded": "No symptoms added yet",
        "dailyEntries.journey.composer.remove": "Remove",
        "dailyEntries.journey.composer.addSymptomProfile": "Add to profile",
        "dailyEntries.journey.cancel": "Cancel",
        "dailyEntries.journey.saveEntry": "Save",
      };
      return map[key] ?? key;
    },
  }),
}));

vi.mock("react-router-dom", () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

const SYMPTOMS: UserSymptom[] = [
  {
    id: "us-1",
    userId: "u-1",
    catalogId: "s-1",
    active: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    catalog: { id: "s-1", name: "Headache", category: "Neurological" },
  },
  {
    id: "us-2",
    userId: "u-1",
    catalogId: "s-2",
    active: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    catalog: { id: "s-2", name: "Fatigue", category: null },
  },
];

function defaultProps() {
  return {
    fields: [] as never[],
    symptoms: SYMPTOMS,
    isLoading: false,
    errorMessage: null,
    onStartAdd: vi.fn(() => true),
    onConfirm: vi.fn(),
    onRemove: vi.fn(),
    onComposerOpenChange: vi.fn(),
  };
}

describe("SymptomsStep", () => {
  it("clears the validation error when a symptom is selected after a failed confirm", async () => {
    const user = userEvent.setup();
    const props = defaultProps();

    render(<SymptomsStep {...props} />);

    await user.click(screen.getByRole("button", { name: "Add symptom" }));

    const confirmButton = screen.getByRole("button", { name: "Save" });
    await user.click(confirmButton);

    expect(screen.getByText("Symptom is required")).toBeInTheDocument();

    const select = screen.getByRole("combobox", { name: "Symptom" });
    await user.selectOptions(select, "us-1");

    expect(screen.queryByText("Symptom is required")).not.toBeInTheDocument();
  });

  it("still shows the placeholder option when nothing is selected", async () => {
    const user = userEvent.setup();
    const props = defaultProps();

    render(<SymptomsStep {...props} />);

    await user.click(screen.getByRole("button", { name: "Add symptom" }));

    const select = screen.getByRole("combobox", { name: "Symptom" });
    expect(select).toHaveValue("");
    expect(screen.getByRole("option", { name: "Select a symptom" })).toBeInTheDocument();
  });
});
