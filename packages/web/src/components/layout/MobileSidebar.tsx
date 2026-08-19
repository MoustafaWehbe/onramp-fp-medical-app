import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "../ui/sheet";

import { Sidebar } from "./Sidebar";
import { useTranslation } from "react-i18next";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({
  open,
  onClose,
}: MobileSidebarProps) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0">
        <SheetTitle className="sr-only">
          {t("navigation.primaryNavigation")}
        </SheetTitle>
        <Sidebar onNavigate={onClose} />
      </SheetContent>
    </Sheet>
  );
}