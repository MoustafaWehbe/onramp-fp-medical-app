interface ComposerFieldErrorProps {
  id: string;
  error?: string;
}

export function composerControlProps(errorId: string, error?: string) {
  return {
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
  };
}

export function ComposerFieldError({ id, error }: ComposerFieldErrorProps) {
  if (!error) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-destructive">
      {error}
    </p>
  );
}
