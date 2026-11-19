import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * MainLayout - Estrutura principal da aplicação.
 * Sidebar escura à esquerda (#0F1E2E) + Topbar e conteúdo claros à direita (#F7F9FB).
 */
export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="nd-shell">
      {/* Overlay do drawer mobile (<900px) */}
      {sidebarOpen && (
        <div
          className="nd-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="nd-main-column">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="nd-content-area nd-page-enter">{children}</main>
      </div>
    </div>
  );
}
