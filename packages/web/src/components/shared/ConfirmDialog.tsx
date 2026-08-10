import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visual style for the confirm action. Defaults to destructive. */
  confirmVariant?: "default" | "destructive";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  className?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "destructive",
  loading = false,
  onConfirm,
  className,
}: ConfirmDialogProps) {
  async function handleConfirm() {
    await onConfirm();
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (loading) return;
        onOpenChange(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg focus:outline-none",
            className,
          )}
          onEscapeKeyDown={(event) => {
            if (loading) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (loading) event.preventDefault();
          }}
        >
          <Dialog.Title className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </Dialog.Title>

          {description != null && (
            <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </Dialog.Description>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              disabled={loading}
              onClick={() => {
                void handleConfirm();
              }}
            >
              {loading ? "Please wait…" : confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
