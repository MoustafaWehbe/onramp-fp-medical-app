import {
  Sheet,
  SheetContent,
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
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
}