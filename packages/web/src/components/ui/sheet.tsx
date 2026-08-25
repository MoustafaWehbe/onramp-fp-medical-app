import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  side?: "left" | "right" | "top" | "bottom";
}

const Sheet = SheetPrimitive.Root;

const SheetTitle = SheetPrimitive.Title;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ className, side="left", children, ...props }, ref) => {
  const { t } = useTranslation();

  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay
        className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out print:hidden"
      />

    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 gap-4 bg-background p-6 shadow-lift transition duration-300 ease-out print:hidden",
        side === "left" && "inset-y-0 start-0 h-full w-64 border-s sm:max-w-sm",
        side === "right" && "inset-y-0 end-0 h-full w-64 border-e sm:max-w-sm",
        side === "top" && "inset-x-0 top-0 h-1/2 w-full border-b sm:max-w-lg",
        side === "bottom" && "inset-x-0 bottom-0 h-1/2 w-full border-t sm:max-w-lg",
        className,
      )}
      {...props}
    >
      {children}

      <SheetPrimitive.Close className="absolute end-3 top-2.5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-muted-foreground opacity-80 transition-colors hover:bg-secondary hover:text-foreground hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <X className="h-5 w-5" aria-hidden />
        <span className="sr-only">{t("common.close")}</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
);});

SheetContent.displayName = SheetPrimitive.Content.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetTitle,
};
