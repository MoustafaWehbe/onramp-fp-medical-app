import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "../ui/sheet";

import { Sidebar } from "./Sidebar";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({
  open,
  onClose,
}: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0">
        <SheetTitle className="sr-only">
          Navigation
        </SheetTitle>
        <Sidebar onNavigate={onClose} />
      </SheetContent>
    </Sheet>
  );
}