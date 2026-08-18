import type { KeyboardEvent, ReactNode } from "react";
import { Check, X } from "lucide-react";
import { Button } from "../../ui/button";

interface ItemComposerProps {
  title: string;
  children: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ItemComposer({
  title,
  children,
  onCancel,
  onConfirm,
}: ItemComposerProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter") return;
    if (event.target instanceof HTMLTextAreaElement) return;
    if (event.target instanceof HTMLButtonElement) return;
    if (event.target instanceof HTMLElement && event.target.closest("button")) return;

    event.preventDefault();
    onConfirm();
  }

  return (
    <div
      role="group"
      aria-label={title}
      className="rounded-2xl border border-primary/25 bg-card p-4 shadow-lift"
      onKeyDown={handleKeyDown}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h4 className="font-semibold">{title}</h4>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Cancel"
            onClick={onCancel}
          >
            <X className="h-5 w-5" aria-hidden />
          </Button>
          <Button
            type="button"
            size="icon"
            aria-label="Save"
            onClick={onConfirm}
          >
            <Check className="h-5 w-5" aria-hidden />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
