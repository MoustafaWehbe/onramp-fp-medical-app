import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../i18n", () => ({ default: { language: "en" } }));

vi.mock("../../hooks/health/useSymptoms", () => ({
  useProfileSymptoms: vi.fn(() => ({
    data: { data: [], pagination: null },
    isLoading: false,
    isError: false,
    isSuccess: true,
    error: null,
  })),
  useEnsureSymptomCatalog: vi.fn(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
  })),
  useCreateProfileSymptom: vi.fn(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
  })),
  useRemoveProfileSymptom: vi.fn(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
  })),
  useSymptomCatalogSearch: vi.fn(() => ({
    data: { data: [], pagination: null },
    isFetching: false,
    isFetched: true,
  })),
  useOnlineSymptomSearch: vi.fn(() => ({ data: [] })),
}));

import {
  SymptomsProvider,
  useSymptomsContext,
} from "../../providers/SymptomsProvider";

const SYMPTOM_ID = "33333333-3333-4333-8333-333333333333";
const ERROR_MESSAGE = "Select a symptom from the suggestions";

type Ctx = ReturnType<typeof useSymptomsContext>;

let ctx: Ctx | null = null;

function Probe() {
  ctx = useSymptomsContext();
  return null;
}

function renderProbe() {
  ctx = null;
  render(
    <SymptomsProvider>
      <Probe />
    </SymptomsProvider>,
  );
}

describe("SymptomsProvider selection validation", () => {
  it("shows the suggestion error while no valid suggestion is selected", async () => {
    renderProbe();

    await act(async () => {
      ctx?.onNameQueryChange("head");
    });

    expect(ctx?.formErrors.nameQuery?.message).toBe(ERROR_MESSAGE);
  });

  it("clears the suggestion error immediately after a catalog selection", async () => {
    renderProbe();

    await act(async () => {
      ctx?.onNameQueryChange("head");
    });
    expect(ctx?.formErrors.nameQuery?.message).toBe(ERROR_MESSAGE);

    await act(async () => {
      ctx?.selectSymptom({
        source: "catalog",
        symptom: {
          id: SYMPTOM_ID,
          name: "Headache",
          category: "Neurological",
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      });
    });

    expect(ctx?.formErrors.nameQuery).toBeUndefined();
    expect(ctx?.nameQuery).toBe("Headache");
  });

  it("clears the suggestion error immediately after an online selection", async () => {
    renderProbe();

    await act(async () => {
      ctx?.onNameQueryChange("dizz");
    });
    expect(ctx?.formErrors.nameQuery?.message).toBe(ERROR_MESSAGE);

    await act(async () => {
      ctx?.selectSymptom({ source: "online", name: "Dizziness" });
    });

    expect(ctx?.formErrors.nameQuery).toBeUndefined();
    expect(ctx?.nameQuery).toBe("Dizziness");
  });
});
