import { StrictMode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  DailyEntriesProvider,
  useDailyEntriesContext,
} from "../../../providers/DailyEntriesProvider";
import { LogEntry } from "../../../pages/log/LogEntry";
import type { DailyEntry } from "../../../lib/daily-entries/daily-entries-exports";

vi.mock("react-i18next", () => ({
  initReactI18next: { type: "languageDetector", init: vi.fn() },
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("../../../hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "u-1", role: "user" } }),
}));

const EXISTING_ENTRY: DailyEntry = {
  id: "e-1",
  entryDate: "2026-08-26",
  moodRating: 2,
  sleepHours: 5,
  journalNotes: "original journal",
  symptoms: [],
  medications: [],
  conditions: [],
  doctorVisits: [],
} as unknown as DailyEntry;

const getDailyEntryMock = vi.fn(async () => EXISTING_ENTRY);

vi.mock("../../../lib/daily-entries/api", () => ({
  listDailyEntries: vi.fn(async () => ({ data: [EXISTING_ENTRY], pagination: { currentPage: 1, pageSize: 15, totalItems: 1, totalPages: 1 } })),
  getDailyEntry: (...args: unknown[]) => getDailyEntryMock(...(args as [])),
  createDailyEntry: vi.fn(async () => {
    throw new Error("should not create");
  }),
  updateDailyEntry: vi.fn(async () => {
    throw new Error("should not update");
  }),
  removeDailyEntry: vi.fn(async () => ({})),
}));

const SYMPTOMS = [
  {
    id: "us-1",
    userId: "u-1",
    catalogId: "s-1",
    active: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
    catalog: { id: "s-1", name: "Headache", category: "Neurological" },
  },
];

function pag() {
  return { currentPage: 1, pageSize: 100, totalItems: 1, totalPages: 1 };
}

vi.mock("../../../lib/health/health-export", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("../../../lib/health/health-export")
  >();
  return {
    ...actual,
    listProfileSymptoms: vi.fn(async () => ({ data: SYMPTOMS, pagination: pag() })),
    listProfileMedications: vi.fn(async () => ({ data: [], pagination: pag() })),
    listProfileConditions: vi.fn(async () => ({ data: [], pagination: pag() })),
    listProfileDoctors: vi.fn(async () => ({ data: [], pagination: pag() })),
    listProfileClinics: vi.fn(async () => ({ data: [], pagination: pag() })),
  };
});

function Harness() {
  const { openCreate, openEdit } = useDailyEntriesContext();
  return (
    <div>
      <button type="button" onClick={openCreate}>open-create</button>
      <button type="button" onClick={() => openEdit(EXISTING_ENTRY)}>open-edit</button>
      <LogEntry />
    </div>
  );
}

function currentStepNumber(): string | undefined {
  return document
    .querySelector<HTMLElement>('[aria-current="step"]')
    ?.textContent?.replace(/\D+/g, "");
}

function renderApp() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const rendered = render(
    <QueryClientProvider client={client}>
      <StrictMode>
        <DailyEntriesProvider>
          <Harness />
        </DailyEntriesProvider>
      </StrictMode>
    </QueryClientProvider>,
  );
  return { client, unmount: rendered.unmount };
}

async function fillStepOne(user: ReturnType<typeof userEvent.setup>) {
  const journal = await screen.findByLabelText("dailyEntries.journey.journalNotes");
  await user.clear(journal);
  await user.type(journal, "rough night");
  await user.click(screen.getByRole("radio", { name: /4/i }));
}

async function goToSymptomsAndAddOne(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "dailyEntries.journey.continue" }));
  await waitFor(() => expect(currentStepNumber()).toBe("2"));

  await user.click(screen.getByRole("button", { name: "dailyEntries.journey.composer.addSymptom" }));
  await user.selectOptions(screen.getByRole("combobox"), "us-1");
  await user.type(screen.getByLabelText("dailyEntries.journey.composer.severity"), "5");
  await user.click(screen.getByRole("button", { name: "dailyEntries.journey.saveEntry" }));
  expect(await screen.findByText("Headache")).toBeInTheDocument();
}

describe("Daily Entry journey state persistence", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("create mode: keeps step 1 values and current step after adding a symptom", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "open-create" }));
    await fillStepOne(user);
    await goToSymptomsAndAddOne(user);

    // Journey did NOT jump back to Step 1
    await waitFor(() => expect(currentStepNumber()).toBe("2"));

    // Going back to Step 1: draft intact, symptom still present afterwards
    await user.click(screen.getByRole("button", { name: "dailyEntries.journey.back" }));
    const journal = await screen.findByLabelText("dailyEntries.journey.journalNotes");
    expect(journal).toHaveValue("rough night");
    expect(currentStepNumber()).toBe("1");

    await user.click(screen.getByRole("button", { name: "dailyEntries.journey.continue" }));
    await waitFor(() => expect(currentStepNumber()).toBe("2"));
    expect(screen.getByText("Headache")).toBeInTheDocument();
  });

  it("create journey resumes (values + step) after leaving to add profile symptoms and returning", async () => {
    const user = userEvent.setup();
    const first = renderApp();

    await user.click(screen.getByRole("button", { name: "open-create" }));
    await fillStepOne(user);
    await user.click(screen.getByRole("button", { name: "dailyEntries.journey.continue" }));
    await waitFor(() => expect(currentStepNumber()).toBe("2"));

    // User navigates away to /health-profile: the whole page unmounts
    first.unmount();

    // ...and returns to /log/view: a fresh provider mounts
    renderApp();

    // Panel auto-reopens at the symptoms step
    await screen.findByRole("dialog", { name: "Add daily entry" });
    await waitFor(() => expect(currentStepNumber()).toBe("2"));

    // Draft intact: going back shows the previously entered values
    await user.click(screen.getByRole("button", { name: "dailyEntries.journey.back" }));
    const journal = await screen.findByLabelText("dailyEntries.journey.journalNotes");
    expect(journal).toHaveValue("rough night");
    expect(currentStepNumber()).toBe("1");
    await user.click(screen.getByRole("button", { name: "dailyEntries.journey.continue" }));
    await waitFor(() => expect(currentStepNumber()).toBe("2"));

    // They can now add the symptom they left for
    await user.click(screen.getByRole("button", { name: "dailyEntries.journey.composer.addSymptom" }));
    await user.selectOptions(screen.getByRole("combobox"), "us-1");
    await user.type(screen.getByLabelText("dailyEntries.journey.composer.severity"), "5");
    await user.click(screen.getByRole("button", { name: "dailyEntries.journey.saveEntry" }));
    expect(await screen.findByText("Headache")).toBeInTheDocument();
    expect(currentStepNumber()).toBe("2");

    // Closing the journey discards the draft: next open starts fresh
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(screen.queryByLabelText("dailyEntries.journey.journalNotes")).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "open-create" }));
    const freshJournal = await screen.findByLabelText("dailyEntries.journey.journalNotes");
    await waitFor(() => expect(freshJournal).toHaveValue(""));
    expect(currentStepNumber()).toBe("1");
  });

  it("edit mode: populates the entry once per session and mid-session refetches do not wipe edits", async () => {
    const user = userEvent.setup();
    const { client } = renderApp();

    await user.click(screen.getByRole("button", { name: "open-edit" }));

    // Populated from the selected entry
    const journal = await screen.findByLabelText("dailyEntries.journey.journalNotes");
    await waitFor(() => expect(journal).toHaveValue("original journal"));

    // User starts editing before/while background refetches happen
    await fillStepOne(user);
    await goToSymptomsAndAddOne(user);

    // Simulate react-query background refetch handing back a NEW object identity
    const refetched = { ...EXISTING_ENTRY, journalNotes: `refetched-${Date.now()}` };
    getDailyEntryMock.mockImplementation(async () => refetched);
    await client.invalidateQueries({ queryKey: ["daily-entries"] });
    await client.refetchQueries({ type: "active" });
    await waitFor(() => expect(client.isFetching()).toBe(0));

    // Session state must survive: same step, draft intact, symptom intact
    await waitFor(() => expect(currentStepNumber()).toBe("2"));
    expect(screen.getByText("Headache")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "dailyEntries.journey.back" }));
    const journalAfter = await screen.findByLabelText("dailyEntries.journey.journalNotes");
    expect(journalAfter).toHaveValue("rough night");

    // Ending the session and starting a NEW one repopulates from the entry
    await user.click(screen.getByRole("button", { name: "dailyEntries.journey.cancel" }));
    await waitFor(() => {
      expect(screen.queryByLabelText("dailyEntries.journey.journalNotes")).not.toBeInTheDocument();
    });

    getDailyEntryMock.mockImplementation(async () => EXISTING_ENTRY);
    await client.invalidateQueries({ queryKey: ["daily-entries"] });
    await client.refetchQueries({ type: "active" });
    await waitFor(() => expect(client.isFetching()).toBe(0));
    await user.click(screen.getByRole("button", { name: "open-edit" }));
    const journalReopened = await screen.findByLabelText("dailyEntries.journey.journalNotes");
    await waitFor(() => expect(journalReopened).toHaveValue("original journal"));
    expect(currentStepNumber()).toBe("1");
  });
});
