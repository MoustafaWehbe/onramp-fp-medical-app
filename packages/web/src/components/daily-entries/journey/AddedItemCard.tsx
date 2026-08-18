import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../../ui/button";
import { nestedCardClass } from "./fieldStyles";

interface AddedItemCardProps {
  title: string;
  details: string[];
  removeLabel: string;
  onRemove: () => void;
  children?: ReactNode;
}

export function AddedItemCard({
  title,
  details,
  removeLabel,
  onRemove,
  children,
}: AddedItemCardProps) {
  return (
    <div className={`${nestedCardClass} py-3`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate font-semibold">{title}</p>
          {details.map((detail, index) => (
            <p key={`${index}-${detail}`} className="break-words text-sm text-muted-foreground">
              {detail}
            </p>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-destructive hover:text-destructive"
          aria-label={removeLabel}
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </div>
      {children}
    </div>
  );
}
