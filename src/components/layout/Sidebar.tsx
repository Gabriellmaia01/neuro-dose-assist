import { useState } from "react";
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
import { Button } from "@/components/ui/button";
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
 * Sidebar - Menu de navegação lateral (Swiss Clinical Minimalist / Awwwards)
 * Estrutura com hairlines cirúrgicos, estados de foco táteis e design responsivo.
 */
export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-sidebar/95 backdrop-blur-2xl border-r border-sidebar-border/80 transition-all duration-300 flex flex-col select-none",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        collapsed ? "lg:w-20" : "lg:w-64",
        "w-72"
      )}
    >
      {/* Cabeçalho do Brand / Identidade */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-violet-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 shadow-sm shadow-teal-500/10">
            <Brain className="w-5 h-5 text-teal-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-sidebar-foreground">
                Neuro<span className="text-teal-400">Dose</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-sidebar-foreground/50">
                Decision OS v2.4
              </span>
            </div>
          )}
        </div>

        {/* Botão de Fechar no Mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Lista de Navegação Principal */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-sidebar-foreground/40">
            Módulos Clínicos
          </div>
        )}

        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30 shadow-sm shadow-teal-500/10"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
              )}
            >
              {/* Barra lateral ativa */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-teal-400 rounded-r-full" />
              )}
              <item.icon
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-colors",
                  isActive ? "text-teal-400" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                )}
              />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}

        {/* Seção Secundária */}
        <div className="pt-4 mt-4 border-t border-sidebar-border/60">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-sidebar-foreground/40">
              Sistema
            </div>
          )}
          {secondaryNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-teal-400 rounded-r-full" />
                )}
                <item.icon
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 shrink-0 transition-colors",
                    isActive ? "text-teal-400" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                  )}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Rodapé com Logout */}
      <div className="p-3 border-t border-sidebar-border/80">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full text-xs font-mono tracking-wider uppercase text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 rounded-xl h-10 transition-colors",
            collapsed ? "justify-center px-0" : "justify-start px-3"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0 text-destructive/80" />
          {!collapsed && <span className="ml-2.5">Desconectar</span>}
        </Button>
      </div>

      {/* Alternador de Recolhimento - Desktop */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border items-center justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground transition-all shadow-md z-50 hover:scale-110 active:scale-95"
        aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
}
