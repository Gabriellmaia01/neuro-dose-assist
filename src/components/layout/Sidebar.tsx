import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
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
 * Sidebar - Navegação lateral clara em estilo bento clínico (#F8FAFC).
 * Colapsa automaticamente para ícones entre 900px e 1279px e vira drawer abaixo de 900px.
 */
export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth >= 900 && window.innerWidth < 1280;
  });
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 900;
  });
  const asideRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const tabletQuery = window.matchMedia("(min-width: 900px) and (max-width: 1279px)");
    const mobileQuery = window.matchMedia("(max-width: 899px)");
    const handleTabletChange = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    const handleMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    setIsMobile(mobileQuery.matches);
    tabletQuery.addEventListener("change", handleTabletChange);
    mobileQuery.addEventListener("change", handleMobileChange);
    return () => {
      tabletQuery.removeEventListener("change", handleTabletChange);
      mobileQuery.removeEventListener("change", handleMobileChange);
    };
  }, []);

  // Impede foco via teclado na sidebar fora da tela em viewports mobile (<900px)
  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;
    (el as HTMLElement & { inert: boolean }).inert = isMobile && !isOpen;
  }, [isMobile, isOpen]);

  // Drawer mobile: foco inicial, trap de Tab, fechamento com Escape e trava de scroll
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key !== "Tab" || !asideRef.current) return;
      const focusable = asideRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobile, isOpen, onClose]);

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
      ref={asideRef}
      role={isMobile && isOpen ? "dialog" : undefined}
      aria-modal={isMobile && isOpen ? true : undefined}
      aria-hidden={isMobile && !isOpen ? true : undefined}
      aria-label="Menu lateral"
      data-open={isOpen ? "true" : "false"}
      data-collapsed={collapsed ? "true" : "false"}
      className="nd-sidebar"
    >
      {/* Topo: marca Neuro-Dose alinhada à borda inferior do Header (72px) */}
      <div
        className={cn(
          "h-[72px] flex items-center shrink-0 border-b border-[var(--nd-border)]",
          showLabels ? "justify-between px-5" : "justify-center px-2"
        )}
      >
        <Link
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-3 min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-accent)] rounded-xl"
        >
          <div
            className="w-9 h-9 rounded-xl bg-[var(--nd-primary)] text-white flex items-center justify-center shrink-0 shadow-sm"
            aria-hidden="true"
          >
            <Brain className="w-5 h-5" strokeWidth={1.75} />
          </div>
          {showLabels && (
            <span className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--nd-text)] truncate">
              Neuro-Dose
            </span>
          )}
        </Link>

        {/* Botão de fechar no drawer mobile */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="nd-mobile-only items-center justify-center w-11 h-11 -mr-2 rounded-full text-[var(--nd-text-secondary)] hover:text-[var(--nd-text)] hover:bg-[var(--nd-muted)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-accent)]"
          aria-label="Fechar menu lateral"
        >
          <X className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      {/* Navegação principal */}
      <nav
        aria-label="Navegação principal"
        className="flex-1 overflow-y-auto scrollbar-thin px-3.5 py-2"
      >
        {showLabels && (
          <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--nd-text-secondary)]">
            Menu
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
                    className={cn(
                      "w-[18px] h-[18px] shrink-0",
                      isActive ? "text-[var(--nd-primary)]" : "text-[var(--nd-icon)]"
                    )}
                    strokeWidth={isActive ? 2 : 1.65}
                    aria-hidden="true"
                  />
                  {showLabels && <span className="truncate">{item.name}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Grupo Sistema */}
        <div className="mt-5 pt-4 border-t border-[var(--nd-border)]">
          {showLabels && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--nd-text-secondary)]">
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
                      className={cn(
                        "w-[18px] h-[18px] shrink-0",
                        isActive ? "text-[var(--nd-primary)]" : "text-[var(--nd-icon)]"
                      )}
                      strokeWidth={isActive ? 2 : 1.65}
                      aria-hidden="true"
                    />
                    {showLabels && <span className="truncate">{item.name}</span>}
                  </NavLink>
                </li>
              );
            })}
            <li>
              <button
                type="button"
                onClick={handleLogout}
                title={!showLabels ? "Desconectar" : undefined}
                className={cn("nd-logout-btn", !showLabels && "justify-center px-0")}
              >
                <LogOut
                  className="w-[18px] h-[18px] shrink-0 text-[var(--nd-icon)]"
                  strokeWidth={1.65}
                  aria-hidden="true"
                />
                {showLabels && <span>Desconectar</span>}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Botão de recolher/expandir sidebar no desktop (>=900px) */}
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        className="nd-desktop-only nd-sidebar-toggle items-center justify-center absolute -right-4 top-[18px] w-9 h-9 rounded-full bg-[var(--nd-surface)] border border-[var(--nd-border-input)] text-[var(--nd-label)] hover:border-[var(--nd-border-hover)] hover:text-[var(--nd-text)] shadow-[var(--nd-shadow-sm)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-accent)] z-50"
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
