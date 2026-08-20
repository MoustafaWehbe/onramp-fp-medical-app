import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "react-i18next";
import type { Clinic } from "../../../lib/health/health-export";
import { cn } from "../../../lib/utils";
import { useClinicsContext } from "../../../providers/ClinicsProvider";
import { Input } from "../../ui/input";

const MIN_CHARS = 2;

interface ClinicAutocompleteProps {
  id?: string;
  placeholder?: string;
}

export function ClinicAutocomplete({
  id,
  placeholder,
}: ClinicAutocompleteProps) {
  const { t } = useTranslation();
  const {
    nameQuery,
    onNameQueryChange,
    selectClinic,
    catalogResults,
    isAutocompleteLoading,
    isFormBusy,
  } = useClinicsContext();

  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const showDropdown =
    open &&
    nameQuery.trim().length >= MIN_CHARS &&
    (catalogResults.length > 0 || isAutocompleteLoading);

  useEffect(() => {
    setHighlightIndex(-1);
  }, [nameQuery, catalogResults.length]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (highlightIndex < 0) return;
    const el = document.getElementById(`${listId}-option-${highlightIndex}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex, listId]);

  function selectOption(clinic: Clinic) {
    selectClinic({ source: "catalog", clinic });
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, catalogResults.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const clinic = catalogResults[highlightIndex];
      if (clinic) selectOption(clinic);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showDropdown && highlightIndex >= 0
            ? `${listId}-option-${highlightIndex}`
            : undefined
        }
        autoComplete="off"
        disabled={isFormBusy}
        placeholder={placeholder ?? t("health.clinics.searchPlaceholder")}
        value={nameQuery}
        onChange={(e) => {
          onNameQueryChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {showDropdown && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border bg-card text-card-foreground shadow-md"
        >
          {isAutocompleteLoading && catalogResults.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {t("health.clinics.searching")}
            </p>
          )}
          {catalogResults.length > 0 && (
            <div>
              <p className="sticky top-0 bg-muted/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                {t("health.clinics.inCatalog")}
              </p>
              <ul>
                {catalogResults.map((clinic, index) => (
                  <li key={clinic.id} id={`${listId}-option-${index}`} role="option" aria-selected={highlightIndex === index}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-accent",
                        highlightIndex === index && "bg-accent",
                      )}
                      onMouseEnter={() => setHighlightIndex(index)}
                      onClick={() => selectOption(clinic)}
                    >
                      <span className="font-medium">{clinic.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {[clinic.address, clinic.phone]
                          .filter(Boolean)
                          .join(" \u00b7 ") || t("health.clinics.noDetails")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
