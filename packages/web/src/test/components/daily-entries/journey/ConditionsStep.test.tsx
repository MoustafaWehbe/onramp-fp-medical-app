import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ConditionsStep } from "../../../../components/daily-entries/journey/ConditionsStep";
import type { UserCondition } from "../../../../lib/health/health-export";

vi.mock("../../../../i18n", () => ({ default: { language: "en" } }));

vi.mock("react-i18next", () => ({
  initReactI18next: { type: "languageDetector", init: vi.fn() },
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "dailyEntries.journey.composer.addCondition": "Add condition",
        "dailyEntries.journey.composer.loadingConditions": "Loading conditions…",
        "dailyEntries.journey.composer.newCondition": "New condition",
        "dailyEntries.journey.composer.condition": "Condition",
        "dailyEntries.journey.composer.selectCondition": "Select a condition",
        "dailyEntries.journey.composer.notes": "Notes",
        "dailyEntries.journey.composer.optionalNotes": "Optional notes",
        "dailyEntries.journey.composer.noConditionsAdded": "No conditions added yet",
        "dailyEntries.journey.composer.remove": "Remove",
        "dailyEntries.journey.composer.addConditionProfile": "Add to profile",
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

const CONDITIONS: UserCondition[] = [
  {
    id: "uc-1",
    userId: "u-1",
    conditionId: "c-1",
    description: null,
    diagnosedDate: null,
    status: "active",
    notes: null,
    active: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    condition: { id: "c-1", name: "Diabetes" },
  },
  {
    id: "uc-2",
    userId: "u-1",
    conditionId: "c-2",
    description: null,
    diagnosedDate: null,
    status: "active",
    notes: null,
    active: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    condition: { id: "c-2", name: "Asthma" },
  },
];

function defaultProps() {
  return {
    fields: [] as never[],
    conditions: CONDITIONS,
    isLoading: false,
    errorMessage: null,
    onStartAdd: vi.fn(() => true),
    onConfirm: vi.fn(),
    onRemove: vi.fn(),
    onComposerOpenChange: vi.fn(),
  };
}

describe("ConditionsStep", () => {
  it("clears the validation error when a condition is selected after a failed confirm", async () => {
    const user = userEvent.setup();
    const props = defaultProps();

    render(<ConditionsStep {...props} />);

    await user.click(screen.getByRole("button", { name: "Add condition" }));

    const confirmButton = screen.getByRole("button", { name: "Save" });
    await user.click(confirmButton);

    expect(screen.getByText("Condition is required")).toBeInTheDocument();

    const select = screen.getByRole("combobox", { name: "Condition" });
    await user.selectOptions(select, "uc-1");

    expect(screen.queryByText("Condition is required")).not.toBeInTheDocument();
  });

  it("still shows the placeholder option when nothing is selected", async () => {
    const user = userEvent.setup();
    const props = defaultProps();

    render(<ConditionsStep {...props} />);

    await user.click(screen.getByRole("button", { name: "Add condition" }));

    const select = screen.getByRole("combobox", { name: "Condition" });
    expect(select).toHaveValue("");
    expect(screen.getByRole("option", { name: "Select a condition" })).toBeInTheDocument();
  });
});
