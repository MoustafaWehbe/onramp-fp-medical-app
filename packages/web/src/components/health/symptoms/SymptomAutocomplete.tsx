import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { SymptomCatalog } from "../../../lib/health/health-export";
import { cn } from "../../../lib/utils";
import { useSymptomsContext } from "../../../providers/SymptomsProvider";
import { Input } from "../../ui/input";

const MIN_CHARS = 2;

type FlatOption =
  | { kind: "catalog"; symptom: SymptomCatalog }
  | { kind: "online"; name: string };

interface SymptomAutocompleteProps {
  id?: string;
  placeholder?: string;
}

export function SymptomAutocomplete({
  id,
  placeholder = "Search symptoms…",
}: SymptomAutocompleteProps) {
  const {
    nameQuery,
    onNameQueryChange,
    selectSymptom,
    catalogResults,
    onlineResults,
    isAutocompleteLoading,
    isAutocompleteFetched,
    isFormBusy,
  } = useSymptomsContext();

  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const flatOptions: FlatOption[] = [
    ...catalogResults.map(
      (symptom): FlatOption => ({ kind: "catalog", symptom }),
    ),
    ...onlineResults.map(
      (name): FlatOption => ({ kind: "online", name }),
    ),
  ];

  const showDropdown =
    open &&
    nameQuery.trim().length >= MIN_CHARS &&
    (flatOptions.length > 0 || isAutocompleteLoading || isAutocompleteFetched);

  useEffect(() => {
    setHighlightIndex(-1);
  }, [nameQuery, catalogResults.length, onlineResults.length]);

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

  function selectOption(option: FlatOption) {
    if (option.kind === "catalog") {
      selectSymptom({ source: "catalog", symptom: option.symptom });
    } else {
      selectSymptom({ source: "online", name: option.name });
    }
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, flatOptions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = flatOptions[highlightIndex];
      if (option) selectOption(option);
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
        placeholder={placeholder}
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
          {isAutocompleteLoading && flatOptions.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              Searching…
            </p>
          )}
          {!isAutocompleteLoading && flatOptions.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No symptoms found
            </p>
          )}
          {catalogResults.length > 0 && (
            <div>
              <p className="sticky top-0 bg-muted/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                In catalog
              </p>
              {catalogResults.map((symptom, index) => (
                <button
                  key={symptom.id}
                  id={`${listId}-option-${index}`}
                  role="option"
                  type="button"
                  aria-selected={highlightIndex === index}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-accent",
                    highlightIndex === index && "bg-accent",
                  )}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onClick={() =>
                    selectOption({ kind: "catalog", symptom })
                  }
                >
                  <span className="font-medium">{symptom.name}</span>
                  {symptom.category && (
                    <span className="text-xs text-muted-foreground">
                      {symptom.category}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
          {onlineResults.length > 0 && (
            <div>
              <p className="sticky top-0 bg-muted/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                BioPortal
              </p>
              {onlineResults.map((name, index) => {
                const flatIndex = catalogResults.length + index;
                return (
                  <button
                    key={`online-${name}`}
                    id={`${listId}-option-${flatIndex}`}
                    role="option"
                    type="button"
                    aria-selected={highlightIndex === flatIndex}
                    className={cn(
                      "flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent",
                      highlightIndex === flatIndex && "bg-accent",
                    )}
                    onMouseEnter={() => setHighlightIndex(flatIndex)}
                    onClick={() => selectOption({ kind: "online", name })}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          )}
          {isAutocompleteLoading && flatOptions.length > 0 && (
            <p className="border-t px-3 py-1.5 text-xs text-muted-foreground">
              Searching BioPortal…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
