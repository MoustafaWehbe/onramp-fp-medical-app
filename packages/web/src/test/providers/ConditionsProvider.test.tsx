import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../i18n", () => ({ default: { language: "en" } }));

vi.mock("../../hooks/health/useConditions", () => ({
  useProfileConditions: vi.fn(() => ({
    data: { data: [], pagination: null },
    isLoading: false,
    isError: false,
    isSuccess: true,
    error: null,
  })),
  useAllConditionSymptoms: vi.fn(() => ({
    data: { data: [], pagination: null },
  })),
  useEnsureConditionCatalog: vi.fn(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
  })),
  useCreateProfileCondition: vi.fn(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
  })),
  useUpdateProfileCondition: vi.fn(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
  })),
  useRemoveProfileCondition: vi.fn(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
  })),
  useLinkConditionSymptom: vi.fn(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
  })),
  useUnlinkConditionSymptom: vi.fn(() => ({
    isPending: false,
    mutateAsync: vi.fn(),
  })),
  useConditionCatalogSearch: vi.fn(() => ({
    data: { data: [], pagination: null },
    isFetching: false,
    isFetched: true,
  })),
  useOnlineConditionSearch: vi.fn(() => ({ data: [] })),
}));

vi.mock("../../hooks/health/useSymptoms", () => ({
  useProfileSymptoms: vi.fn(() => ({
    data: { data: [], pagination: null },
  })),
}));

import {
  ConditionsProvider,
  useConditionsContext,
} from "../../providers/ConditionsProvider";

const CONDITION_ID = "22222222-2222-4222-8222-222222222222";
const ERROR_MESSAGE = "Select a condition from the suggestions";

type Ctx = ReturnType<typeof useConditionsContext>;

let ctx: Ctx | null = null;

function Probe() {
  ctx = useConditionsContext();
  return null;
}

function renderProbe() {
  ctx = null;
  render(
    <ConditionsProvider>
      <Probe />
    </ConditionsProvider>,
  );
}

describe("ConditionsProvider selection validation", () => {
  it("shows the suggestion error while no valid suggestion is selected", async () => {
    renderProbe();

    await act(async () => {
      ctx?.onNameQueryChange("asth");
    });

    expect(ctx?.formErrors.nameQuery?.message).toBe(ERROR_MESSAGE);
  });

  it("clears the suggestion error immediately after a catalog selection", async () => {
    renderProbe();

    await act(async () => {
      ctx?.onNameQueryChange("asth");
    });
    expect(ctx?.formErrors.nameQuery?.message).toBe(ERROR_MESSAGE);

    await act(async () => {
      ctx?.selectCondition({
        source: "catalog",
        condition: {
          id: CONDITION_ID,
          name: "Asthma",
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      });
    });

    expect(ctx?.formErrors.nameQuery).toBeUndefined();
    expect(ctx?.nameQuery).toBe("Asthma");
  });

  it("clears the suggestion error immediately after an online selection", async () => {
    renderProbe();

    await act(async () => {
      ctx?.onNameQueryChange("rare");
    });
    expect(ctx?.formErrors.nameQuery?.message).toBe(ERROR_MESSAGE);

    await act(async () => {
      ctx?.selectCondition({ source: "online", name: "Rare Condition" });
    });

    expect(ctx?.formErrors.nameQuery).toBeUndefined();
    expect(ctx?.nameQuery).toBe("Rare Condition");
  });
});
