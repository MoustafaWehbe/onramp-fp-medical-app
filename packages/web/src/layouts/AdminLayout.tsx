import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "../components/layout/Header";
import { AdminSidebar } from "../components/layout/AdminSidebar";
import { MobileAdminSidebar } from "../components/layout/MobileAdminSidebar";


export function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar */}
      <MobileAdminSidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">

        <Header
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}