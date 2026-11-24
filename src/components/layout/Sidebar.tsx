import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Pill,
  Users,
  Activity,
  History,
  Settings,
  Brain,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Calendar,
  Building2,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Pacientes", href: "/patients", icon: Users },
  { name: "Agenda", href: "/appointments", icon: Calendar },
  { name: "Medicamentos", href: "/medications", icon: Pill },
  { name: "Registrar Dose", href: "/dose", icon: Activity },
  { name: "Histórico", href: "/history", icon: History },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Relatórios", href: "/reports", icon: FileText },
  { name: "Clínica", href: "/clinic", icon: Building2 },
];

const secondaryNavigation = [
  { name: "Configurações", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * Sidebar - Navegação lateral escura e sóbria (#0F1E2E).
 * Colapsa automaticamente para ícones entre 900px e 1279px e vira drawer abaixo de 900px.
 */
export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 900 && window.innerWidth < 1280;
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 900px) and (max-width: 1279px)");
    const handleViewportChange = (e: MediaQueryListEvent) => {
      setCollapsed(e.matches);
    };
    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (onClose && window.innerWidth < 900) {
      onClose();
    }
  };

  // No drawer mobile (<900px), sempre exibe os rótulos; no desktop respeita collapsed
  const showLabels = !collapsed || isOpen;

  return (
    <aside
      aria-label="Menu lateral"
      data-open={isOpen ? "true" : "false"}
      data-collapsed={collapsed ? "true" : "false"}
      className="nd-sidebar"
    >
      {/* Topo: marca Neuro-Dose */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-[var(--nd-dark-border)] shrink-0",
          showLabels ? "justify-between px-4" : "justify-center px-2"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-[var(--nd-radius)] border border-[var(--nd-dark-accent-soft)] flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <Brain
              className="w-[18px] h-[18px] text-[var(--nd-dark-accent-soft)]"
              strokeWidth={1.5}
            />
          </div>
          {showLabels && (
            <span className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--nd-dark-text)] truncate">
              Neuro-Dose
            </span>
          )}
        </div>

        {/* Botão de fechar no drawer mobile */}
        <button
          type="button"
          onClick={onClose}
          className="nd-mobile-only items-center justify-center w-8 h-8 rounded-[var(--nd-radius)] text-[var(--nd-dark-text-secondary)] hover:text-[var(--nd-dark-text)] hover:bg-[var(--nd-dark-hover)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-dark-accent-soft)]"
          aria-label="Fechar menu lateral"
        >
          <X className="w-[18px] h-[18px]" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      {/* Navegação principal */}
      <nav
        aria-label="Navegação principal"
        className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4"
      >
        {showLabels && (
          <p className="px-3 mb-2 text-[12px] font-medium text-[var(--nd-dark-text-secondary)]">
            Módulos clínicos
          </p>
        )}

        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={handleNavClick}
                  aria-current={isActive ? "page" : undefined}
                  title={!showLabels ? item.name : undefined}
                  className={cn(
                    "nd-nav-item",
                    !showLabels && "justify-center px-0"
                  )}
                >
                  <item.icon
                    className="w-[18px] h-[18px] shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  {showLabels && <span className="truncate">{item.name}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Grupo Sistema */}
        <div className="mt-6 pt-4 border-t border-[var(--nd-dark-border)]">
          {showLabels && (
            <p className="px-3 mb-2 text-[12px] font-medium text-[var(--nd-dark-text-secondary)]">
              Sistema
            </p>
          )}
          <ul className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={handleNavClick}
                    aria-current={isActive ? "page" : undefined}
                    title={!showLabels ? item.name : undefined}
                    className={cn(
                      "nd-nav-item",
                      !showLabels && "justify-center px-0"
                    )}
                  >
                    <item.icon
                      className="w-[18px] h-[18px] shrink-0"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    {showLabels && <span className="truncate">{item.name}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Rodapé: Desconectar (neutro, sem vermelho) */}
      <div className="p-3 border-t border-[var(--nd-dark-border)] shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          title={!showLabels ? "Desconectar" : undefined}
          className={cn("nd-logout-btn", !showLabels && "justify-center px-0")}
        >
          <LogOut
            className="w-[18px] h-[18px] shrink-0"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          {showLabels && <span>Desconectar</span>}
        </button>
      </div>

      {/* Botão de recolher/expandir sidebar no desktop (>=900px) */}
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="nd-desktop-only items-center justify-center absolute -right-3 top-[20px] w-6 h-6 rounded-full bg-[var(--nd-surface)] border border-[var(--nd-border-input)] text-[var(--nd-label)] hover:border-[var(--nd-border-hover)] hover:text-[var(--nd-text)] shadow-[var(--nd-shadow-sm)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-accent)] z-50"
        aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
        aria-expanded={!collapsed}
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
        )}
      </button>
    </aside>
  );
}
