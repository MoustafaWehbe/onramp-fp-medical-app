import { LogOut, User,Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";


interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center border-b bg-card px-4 md:px-6 gap-3">
      <button
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span className="max-w-[120px] truncate sm:max-w-none">
          {user?.name}
        </span>
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">
          Logout
        </span>
      </button>
    </header>
  );
}