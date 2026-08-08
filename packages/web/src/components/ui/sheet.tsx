import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

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
>(({ className, side="left", children, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay
      className="fixed inset-0 z-50 bg-black/50"
    />

    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out",
        side === "left" && "inset-y-0 left-0 h-full w-60 border-r sm:max-w-sm",
        side === "right" && "inset-y-0 right-0 h-full w-60 border-l sm:max-w-sm",
        side === "top" && "inset-x-0 top-0 h-1/2 w-full border-b sm:max-w-lg",
        side === "bottom" && "inset-x-0 bottom-0 h-1/2 w-full border-t sm:max-w-lg",
        className,
      )}
      {...props}
    >
      {children}

      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
));

SheetContent.displayName = SheetPrimitive.Content.displayName;

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetTitle,
};