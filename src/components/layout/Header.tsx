import { Bell, LogOut, Mail, Menu, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

interface HeaderProps {
  onMenuClick?: () => void;
}

const ROUTE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/patients": "Pacientes",
  "/appointments": "Agenda",
  "/medications": "Medicamentos",
  "/dose": "Registrar Dose",
  "/history": "Histórico",
  "/analytics": "Analytics",
  "/reports": "Relatórios",
  "/clinic": "Clínica",
  "/settings": "Configurações",
};

/**
 * Header - Barra superior clínica (#FFFFFF, 64px, borda inferior 1px #E3E9EF).
 * Contém breadcrumb à esquerda e status operacional, notificações e perfil à direita.
 */
export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentSection = ROUTE_TITLES[location.pathname] ?? "Dashboard";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "DR";
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[var(--nd-surface)] border-b border-[var(--nd-border)] px-4 min-[900px]:px-8 flex items-center justify-between gap-4 shrink-0">
      {/* Esquerda: botão menu mobile + breadcrumb simples */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="nd-mobile-only items-center justify-center w-9 h-9 rounded-[var(--nd-radius)] text-[var(--nd-label)] hover:bg-[var(--nd-muted)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-accent)] shrink-0"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
        </button>

        <nav aria-label="Localização atual" className="min-w-0">
          <ol className="flex items-center gap-1.5 text-[13px] text-[var(--nd-text-secondary)] truncate">
            <li>Painel</li>
            <li aria-hidden="true" className="text-[var(--nd-icon)]">/</li>
            <li aria-current="page" className="font-medium text-[var(--nd-text)] truncate">
              {currentSection}
            </li>
          </ol>
        </nav>
      </div>

      {/* Direita: chip status IA · sino · perfil (gap 20px, sem alternador de tema) */}
      <div className="flex items-center gap-5 shrink-0">
        {/* Chip Motor IA operacional (ponto estático 8px #1E7A4D, sem pulso nem glow) */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--nd-radius)] bg-[var(--nd-bg)] border border-[var(--nd-border)] text-[13px] font-medium text-[var(--nd-label)]">
          <span
            className="w-2 h-2 rounded-full bg-[var(--nd-success)] shrink-0"
            aria-hidden="true"
          />
          <span>Motor IA operacional</span>
        </div>

        {/* Sino com bolinha estática de notificação */}
        <button
          type="button"
          className="relative inline-flex items-center justify-center w-9 h-9 rounded-[var(--nd-radius)] text-[var(--nd-icon)] hover:text-[var(--nd-text)] hover:bg-[var(--nd-bg)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-accent)]"
          aria-label="Notificações"
        >
          <Bell className="w-[18px] h-[18px]" strokeWidth={1.5} aria-hidden="true" />
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--nd-accent)]"
            aria-hidden="true"
          />
        </button>

        {/* Avatar com nome e especialidade */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 py-1 pl-1 pr-2 rounded-[var(--nd-radius)] hover:bg-[var(--nd-bg)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-accent)]"
              aria-label="Menu do perfil"
            >
              <Avatar className="w-8 h-8 border border-[var(--nd-border)]">
                <AvatarImage
                  src={user?.photoURL || undefined}
                  alt={user?.displayName || "Profissional"}
                />
                <AvatarFallback className="bg-[var(--nd-muted)] text-[var(--nd-primary)] text-[12px] font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-[14px] font-medium text-[var(--nd-text)] leading-[1.2]">
                  {user?.displayName || "Dr(a). Especialista"}
                </span>
                <span className="text-[12px] text-[var(--nd-text-secondary)] leading-[1.2] mt-0.5">
                  Neurologia
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 p-1.5 bg-[var(--nd-surface)] border border-[var(--nd-border)] rounded-[var(--nd-radius)] shadow-[var(--nd-shadow-popover)]"
          >
            <DropdownMenuLabel className="font-normal px-2.5 py-2">
              <div className="flex flex-col space-y-1">
                <p className="text-[14px] font-medium text-[var(--nd-text)]">
                  {user?.displayName || "Dr(a). Especialista"}
                </p>
                {user?.email && (
                  <p className="text-[12px] text-[var(--nd-text-secondary)] flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-[var(--nd-icon)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    <span className="truncate">{user.email}</span>
                  </p>
                )}
                <div className="pt-1 flex items-center gap-1.5 text-[12px] text-[var(--nd-success)]">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <span>Sessão verificada LGPD</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-1 bg-[var(--nd-border)]" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer rounded-[6px] px-2.5 py-2 text-[13px] font-medium text-[var(--nd-label)] focus:bg-[var(--nd-bg)] focus:text-[var(--nd-text)] flex items-center gap-2"
            >
              <LogOut className="w-4 h-4 text-[var(--nd-icon)]" strokeWidth={1.5} aria-hidden="true" />
              <span>Desconectar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
