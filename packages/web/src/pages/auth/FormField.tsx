import { cloneElement, type ReactElement } from "react";
import { Label } from "../../components/ui/label";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  description?: string;
  children: ReactElement;
}

export function FormField({ id, label, error, description, children }: FormFieldProps) {
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;
  const describedBy =
    [description ? descriptionId : undefined, error ? errorId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, {
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
      })}
      {error ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
      {description ? (
        <p id={descriptionId} className="text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
