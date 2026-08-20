import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "../components/layout/Header";
import { AdminSidebar } from "../components/layout/AdminSidebar";
import { MobileAdminSidebar } from "../components/layout/MobileAdminSidebar";
import { AmbientBackground } from "../components/motion/AmbientBackground";
import { PageReveal } from "../components/motion/PageReveal";

export function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="app-canvas relative flex h-dvh overflow-hidden">
      <AmbientBackground />
      <a
        href="#main-content"
        className="fixed start-4 top-3 z-[200] -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <div className="relative z-10 hidden h-full shrink-0 md:block">
        <AdminSidebar />
      </div>

      <MobileAdminSidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="relative z-10 flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />

        <main
          id="main-content"
          tabIndex={-1}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 outline-none sm:px-6 md:px-8 md:py-7"
        >
          <div className="mx-auto w-full max-w-7xl">
            <PageReveal>
              <Outlet />
            </PageReveal>
          </div>
        </main>
      </div>
    </div>
  );
}
