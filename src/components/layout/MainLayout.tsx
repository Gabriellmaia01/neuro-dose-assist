import { ReactNode, useCallback, useRef, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * MainLayout - Estrutura principal da aplicação em layout bento clínico.
 * Sidebar clara à esquerda (#F8FAFC) + Topbar e canvas claro à direita (#F4F6F8).
 */
export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
    // Retorna o foco ao botão do menu no mobile após fechar o drawer
    if (typeof window !== "undefined" && window.innerWidth < 900) {
      window.requestAnimationFrame(() => {
        menuButtonRef.current?.focus();
      });
    }
  }, []);

  return (
    <div className="nd-shell">
      <a href="#main-content" className="nd-skip-link">
        Pular para o conteúdo principal
      </a>

      {/* Overlay do drawer mobile (<900px) */}
      {sidebarOpen && (
        <div
          className="nd-sidebar-backdrop"
          onClick={handleCloseSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      <div className="nd-main-column">
        <Header
          menuButtonRef={menuButtonRef}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main id="main-content" tabIndex={-1} className="nd-content-area nd-page-enter focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
