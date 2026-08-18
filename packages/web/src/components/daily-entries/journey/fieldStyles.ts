import { cn } from "../../../lib/utils";

export const selectFieldClass = cn(
  "mt-1.5 flex h-11 w-full cursor-pointer rounded-xl border border-input bg-card px-3.5 text-base shadow-sm outline-none transition-[border-color,box-shadow] duration-200",
  "hover:border-primary/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25 sm:text-sm",
);

export const textareaFieldClass = cn(
  "mt-1.5 block min-h-24 w-full resize-y rounded-xl border border-input bg-card px-3.5 py-2.5 text-base shadow-sm outline-none transition-[border-color,box-shadow] duration-200",
  "placeholder:text-muted-foreground/80 hover:border-primary/40 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/25 sm:text-sm",
);

export const nestedCardClass =
  "rounded-2xl border border-border/80 bg-card p-4 shadow-soft";
