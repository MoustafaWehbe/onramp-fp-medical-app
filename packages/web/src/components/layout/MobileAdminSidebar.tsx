import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "../ui/sheet";

import { AdminSidebar } from "./AdminSidebar";


interface MobileAdminSidebarProps {
  open: boolean;
  onClose: () => void;
}


export function MobileAdminSidebar({
  open,
  onClose,
}: MobileAdminSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0">
        <SheetTitle className="sr-only">
          Admin navigation
        </SheetTitle>

        <AdminSidebar />
      </SheetContent>
    </Sheet>
  );
}