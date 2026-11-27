import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Bell, LogOut, Mail, Menu, Search, ShieldCheck, WifiOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface HeaderProps {
  onMenuClick?: () => void;
  menuButtonRef?: RefObject<HTMLButtonElement>;
}

const ROUTE_ITEMS = [
  { href: "/", label: "Dashboard", keywords: "painel inicio home telemetria" },
  { href: "/patients", label: "Pacientes", keywords: "prontuario cadastro paciente" },
  { href: "/appointments", label: "Agenda", keywords: "consulta horario retorno exame" },
  { href: "/medications", label: "Medicamentos", keywords: "farmaco interacao bula classe" },
  { href: "/dose", label: "Registrar Dose", keywords: "posologia analise aplicacao" },
  { href: "/history", label: "Histórico", keywords: "auditoria logs doses" },
  { href: "/analytics", label: "Analytics", keywords: "preditivo graficos risco tendencia" },
  { href: "/reports", label: "Relatórios", keywords: "pdf exportar dossie" },
  { href: "/clinic", label: "Clínica", keywords: "equipe membros convite" },
  { href: "/settings", label: "Configurações", keywords: "perfil crm senha notificacoes" },
];

const ROUTE_TITLES: Record<string, string> = Object.fromEntries(
  ROUTE_ITEMS.map((item) => [item.href, item.label])
);

/**
 * Header - Barra superior clínica luminosa (inspirada em bento moderno, paleta #1B4965 / #2C7A7B).
 * Contém busca rápida de módulos, status real de conectividade, notificações e perfil.
 */
export function Header({ onMenuClick, menuButtonRef }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("keydown", handleShortcut);
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const currentSection = ROUTE_TITLES[location.pathname] ?? "Dashboard";

  const filteredRoutes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ROUTE_ITEMS.slice(0, 5);
    return ROUTE_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.includes(q)
    );
  }, [searchQuery]);

  const handleSelectRoute = (href: string) => {
    setSearchQuery("");
    setSearchOpen(false);
    navigate(href);
  };

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
    <header className="sticky top-0 z-30 h-[72px] bg-[var(--nd-surface)]/95 backdrop-blur-md border-b border-[var(--nd-border)] px-4 min-[900px]:px-8 flex items-center justify-between gap-3 sm:gap-4 shrink-0">
      {/* Esquerda: menu mobile + busca rápida em pílula */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 max-w-md">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={onMenuClick}
          className="nd-mobile-only items-center justify-center w-11 h-11 -ml-2 rounded-full text-[var(--nd-label)] hover:bg-[var(--nd-muted)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-accent)] shrink-0"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" strokeWidth={1.65} aria-hidden="true" />
        </button>

        {/* Busca rápida (desktop/tablet) */}
        <div className="relative hidden sm:block flex-1 max-w-[340px]">
          <Search
            className="w-4 h-4 text-[var(--nd-icon)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="search"
            role="combobox"
            aria-expanded={searchOpen}
            aria-controls="header-quick-search-list"
            aria-autocomplete="list"
            aria-activedescendant={
              searchOpen && filteredRoutes[activeIndex]
                ? `quick-route-${activeIndex}`
                : undefined
            }
            value={searchQuery}
            onFocus={() => {
              setSearchOpen(true);
              setActiveIndex(0);
            }}
            onBlur={() => {
              if (blurTimeoutRef.current !== null) {
                window.clearTimeout(blurTimeoutRef.current);
              }
              blurTimeoutRef.current = window.setTimeout(() => {
                setSearchOpen(false);
                blurTimeoutRef.current = null;
              }, 150);
            }}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
              setActiveIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && filteredRoutes.length > 0) {
                e.preventDefault();
                setSearchOpen(true);
                setActiveIndex((prev) => (prev + 1) % filteredRoutes.length);
              } else if (e.key === "ArrowUp" && filteredRoutes.length > 0) {
                e.preventDefault();
                setSearchOpen(true);
                setActiveIndex((prev) => (prev - 1 + filteredRoutes.length) % filteredRoutes.length);
              } else if (e.key === "Enter" && filteredRoutes.length > 0) {
                e.preventDefault();
                const selected = filteredRoutes[activeIndex] ?? filteredRoutes[0];
                handleSelectRoute(selected.href);
              } else if (e.key === "Escape") {
                setSearchOpen(false);
                searchInputRef.current?.blur();
              }
            }}
            placeholder="Buscar módulo clínico…"
            aria-label="Buscar módulo clínico"
            className="w-full h-10 pl-10 pr-14 rounded-full bg-[var(--nd-bg)] border border-[var(--nd-border)] text-[13px] text-[var(--nd-text)] placeholder:text-[var(--nd-placeholder)] focus:outline-none focus:border-[var(--nd-accent)] focus:bg-[var(--nd-surface)] transition-colors duration-150"
          />
          <kbd
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full bg-[var(--nd-surface)] border border-[var(--nd-border)] text-[11px] font-medium text-[var(--nd-text-secondary)]"
          >
            ⌘K
          </kbd>

          {searchOpen && (
            <div
              id="header-quick-search-list"
              role="listbox"
              aria-label="Atalhos de navegação"
              className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl bg-[var(--nd-surface)] border border-[var(--nd-border)] shadow-[var(--nd-shadow-popover)] p-1.5"
            >
              {filteredRoutes.length === 0 ? (
                <p className="px-3 py-2 text-[13px] text-[var(--nd-text-secondary)]">
                  Nenhum módulo encontrado
                </p>
              ) : (
                filteredRoutes.map((route, idx) => (
                  <button
                    key={route.href}
                    id={`quick-route-${idx}`}
                    type="button"
                    role="option"
                    aria-selected={idx === activeIndex}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectRoute(route.href);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-[13px] font-medium text-[var(--nd-text)] transition-colors ${idx === activeIndex ? "bg-[var(--nd-bg)]" : "hover:bg-[var(--nd-bg)]"
                      }`}
                  >
                    <span>{route.label}</span>
                    {location.pathname === route.href && (
                      <span className="text-[11px] text-[var(--nd-accent)] font-semibold">
                        Atual
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Localização compacta em mobile */}
        <nav aria-label="Localização atual" className="sm:hidden min-w-0">
          <ol className="flex items-center gap-1.5 text-[14px] truncate">
            <li aria-current="page" className="font-semibold text-[var(--nd-text)] truncate">
              {currentSection}
            </li>
          </ol>
        </nav>
      </div>

      {/* Direita: busca mobile · status de conectividade · notificações · perfil */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Busca rápida mobile (<640px) */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="sm:hidden inline-flex items-center justify-center w-11 h-11 rounded-full bg-[var(--nd-bg)] border border-[var(--nd-border)] text-[var(--nd-label)] hover:text-[var(--nd-primary)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-accent)]"
              aria-label="Buscar módulo clínico"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.65} aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-72 p-3 bg-[var(--nd-surface)] border border-[var(--nd-border)] rounded-2xl shadow-[var(--nd-shadow-popover)]"
          >
            <div className="relative mb-2">
              <Search
                className="w-4 h-4 text-[var(--nd-icon)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar módulo clínico…"
                aria-label="Filtrar módulos clínicos"
                className="w-full h-11 pl-9 pr-3 rounded-full bg-[var(--nd-bg)] border border-[var(--nd-border)] text-[16px] text-[var(--nd-text)] placeholder:text-[var(--nd-placeholder)] focus:outline-none focus:border-[var(--nd-accent)]"
              />
            </div>
            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {filteredRoutes.length === 0 ? (
                <p className="px-3 py-2 text-[13px] text-[var(--nd-text-secondary)]">
                  Nenhum módulo encontrado
                </p>
              ) : (
                filteredRoutes.map((route) => (
                  <button
                    key={route.href}
                    type="button"
                    onClick={() => handleSelectRoute(route.href)}
                    className="w-full min-h-[44px] flex items-center justify-between px-3 rounded-xl text-left text-[14px] font-medium text-[var(--nd-text)] hover:bg-[var(--nd-bg)]"
                  >
                    <span>{route.label}</span>
                    {location.pathname === route.href && (
                      <span className="text-[11px] text-[var(--nd-accent)] font-semibold">
                        Atual
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Indicador real de conectividade (on-line / off-line) */}
        <div
          role="status"
          aria-live="polite"
          className={
            isOnline
              ? "hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--nd-bg)] border border-[var(--nd-border)] text-[12px] font-medium text-[var(--nd-label)]"
              : "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--nd-warning-bg)] border border-[var(--nd-warning)]/30 text-[12px] font-medium text-[var(--nd-warning)]"
          }
        >
          {isOnline ? (
            <>
              <span
                className="w-2 h-2 rounded-full bg-[var(--nd-success)] shrink-0"
                aria-hidden="true"
              />
              <span>Conectado</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span>Sem conexão</span>
            </>
          )}
        </div>

        {/* Central rápida de notificações clínicas (botão circular estilo bento) */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative inline-flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-[var(--nd-bg)] border border-[var(--nd-border)] text-[var(--nd-label)] hover:text-[var(--nd-primary)] hover:border-[var(--nd-border-hover)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-accent)]"
              aria-label="Notificações clínicas"
            >
              <Bell className="w-[18px] h-[18px]" strokeWidth={1.65} aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-72 p-4 bg-[var(--nd-surface)] border border-[var(--nd-border)] rounded-2xl shadow-[var(--nd-shadow-popover)]"
          >
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[var(--nd-border)]">
              <p className="text-[13px] font-semibold text-[var(--nd-text)]">
                Notificações clínicas
              </p>
            </div>
            <p className="text-[13px] text-[var(--nd-text-secondary)] leading-relaxed">
              Os alertas de interação medicamentosa e tendências de risco são atualizados em tempo real nos módulos clínicos.
            </p>
            <div className="mt-3 pt-2.5 border-t border-[var(--nd-border)] flex items-center justify-between gap-2">
              <Link to="/" className="nd-link">
                Alertas no Dashboard
              </Link>
              <Link to="/analytics" className="nd-link">
                Riscos em Analytics
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        {/* Avatar com nome e e-mail */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 py-1 pl-1 pr-2.5 rounded-full hover:bg-[var(--nd-bg)] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--nd-accent)]"
              aria-label="Menu do perfil"
            >
              <Avatar className="w-9 h-9 border border-[var(--nd-border)] shrink-0">
                <AvatarImage
                  src={user?.photoURL || undefined}
                  alt={user?.displayName || "Profissional"}
                />
                <AvatarFallback className="bg-[var(--nd-accent-soft)] text-[var(--nd-primary)] text-[12px] font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col text-left min-w-0">
                <span className="text-[13px] font-semibold text-[var(--nd-text)] leading-[1.2] truncate max-w-[160px]">
                  {user?.displayName || "Dr(a). Especialista"}
                </span>
                <span className="text-[12px] text-[var(--nd-text-secondary)] leading-[1.2] mt-0.5 truncate max-w-[160px]">
                  {user?.email || "Neurologia"}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-64 p-1.5 bg-[var(--nd-surface)] border border-[var(--nd-border)] rounded-2xl shadow-[var(--nd-shadow-popover)]"
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
              className="cursor-pointer rounded-xl px-2.5 py-2 text-[13px] font-medium text-[var(--nd-label)] focus:bg-[var(--nd-bg)] focus:text-[var(--nd-text)] flex items-center gap-2"
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
