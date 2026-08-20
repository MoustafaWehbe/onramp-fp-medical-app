import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "../ui/sheet";

import { AdminSidebar } from "./AdminSidebar";
import { useTranslation } from "react-i18next";


interface MobileAdminSidebarProps {
  open: boolean;
  onClose: () => void;
}


export function MobileAdminSidebar({
  open,
  onClose,
}: MobileAdminSidebarProps) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0">
        <SheetTitle className="sr-only">
          {t("navigation.admin.navigation")}
        </SheetTitle>

        <AdminSidebar onNavigate={onClose} />
      </SheetContent>
    </Sheet>
  );
}