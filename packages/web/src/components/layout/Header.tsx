import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { BrandMark } from "./BrandMark";


interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-card/90 px-3 backdrop-blur-xl sm:px-5 md:px-8">
      <button
          onClick={onMenuClick}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      <BrandMark className="md:hidden" />
      <div className="ml-auto hidden min-w-0 items-center gap-3 sm:flex">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 leading-tight">
          <p className="max-w-40 truncate text-sm font-semibold">{user?.name}</p>
          <p className="text-xs capitalize text-muted-foreground">{user?.role}</p>
        </div>
      </div>

      <button
        onClick={logout}
        className="flex h-11 cursor-pointer items-center gap-2 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">
          Logout
        </span>
      </button>
    </header>
  );
}
