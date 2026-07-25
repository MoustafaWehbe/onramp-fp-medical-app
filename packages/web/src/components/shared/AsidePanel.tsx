import {
  useEffect,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

export interface AsidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  className?: string;
}

export function AsidePanel({
  open,
  onClose,
  title,
  children,
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Delete",
  editDisabled,
  deleteDisabled,
  className,
}: AsidePanelProps) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100]",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close panel"
        className={cn(
          "absolute inset-0 bg-foreground/40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Details"}
        className={cn(
          "absolute top-0 right-0 bottom-0 flex h-dvh w-full max-w-md flex-col border-l bg-background shadow-xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
          className,
        )}
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b px-4 py-4">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 className="truncate text-lg font-semibold tracking-tight">
                {title}
              </h2>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {children}
        </div>

        {(onEdit || onDelete) && (
          <footer className="flex shrink-0 gap-2 border-t px-4 py-4">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={editDisabled}
                onClick={onEdit}
              >
                <Pencil className="mr-1.5 h-4 w-4" />
                {editLabel}
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                disabled={deleteDisabled}
                onClick={onDelete}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                {deleteLabel}
              </Button>
            )}
          </footer>
        )}
      </aside>
    </div>,
    document.body,
  );
}
