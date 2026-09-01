import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../i18n", () => ({ default: { language: "en" } }));

vi.mock("../../hooks/health/useMedications", () => ({
  useProfileMedications: vi.fn(() => ({
    data: { data: [], pagination: null },
    isLoading: false,
    isError: false,
    isSuccess: true,
    error: null,
  })),
  useEnsureCatalogMedication: vi.fn(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
  })),
  useCreateProfileMedication: vi.fn(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
  })),
  useUpdateProfileMedication: vi.fn(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
  })),
  useRemoveProfileMedication: vi.fn(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
  })),
  useCatalogMedicationSearch: vi.fn(() => ({
    data: { data: [], pagination: null },
    isFetching: false,
    isFetched: true,
  })),
  useOnlineMedicationSearch: vi.fn(() => ({ data: [] })),
}));

import {
  MedicationsProvider,
  useMedicationsContext,
} from "../../providers/MedicationsProvider";

const MEDICATION_ID = "11111111-1111-4111-8111-111111111111";
const ERROR_MESSAGE = "Select a medication from the suggestions";

type Ctx = ReturnType<typeof useMedicationsContext>;

let ctx: Ctx | null = null;

function Probe() {
  ctx = useMedicationsContext();
  return null;
}

function renderProbe() {
  ctx = null;
  render(
    <MedicationsProvider>
      <Probe />
    </MedicationsProvider>,
  );
}

describe("MedicationsProvider selection validation", () => {
  it("shows the suggestion error while no valid suggestion is selected", async () => {
    renderProbe();

    await act(async () => {
      ctx?.onNameQueryChange("ibu");
    });

    expect(ctx?.formErrors.nameQuery?.message).toBe(ERROR_MESSAGE);
  });

  it("clears the suggestion error immediately after a catalog selection", async () => {
    renderProbe();

    await act(async () => {
      ctx?.onNameQueryChange("ibu");
    });
    expect(ctx?.formErrors.nameQuery?.message).toBe(ERROR_MESSAGE);

    await act(async () => {
      ctx?.selectMedication({
        source: "catalog",
        medication: {
          id: MEDICATION_ID,
          name: "Ibuprofen",
          strength: "500mg",
          category: "Pain Relief",
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      });
    });

    expect(ctx?.formErrors.nameQuery).toBeUndefined();
    expect(ctx?.nameQuery).toBe("Ibuprofen");
  });

  it("clears the suggestion error immediately after an online selection", async () => {
    renderProbe();

    await act(async () => {
      ctx?.onNameQueryChange("newmed");
    });
    expect(ctx?.formErrors.nameQuery?.message).toBe(ERROR_MESSAGE);

    await act(async () => {
      ctx?.selectMedication({ source: "online", name: "NewMed" });
    });

    expect(ctx?.formErrors.nameQuery).toBeUndefined();
    expect(ctx?.nameQuery).toBe("NewMed");
  });
});
