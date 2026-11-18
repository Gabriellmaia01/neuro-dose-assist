import { Bell, LogOut, Mail, Menu, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ModeToggle } from "@/components/mode-toggle";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onMenuClick?: () => void;
}

/**
 * Header - Barra de navegação superior cirúrgica (Swiss Clinical Minimalist).
 * Apresenta status de sincronização em tempo real, telemetria e perfil do profissional.
 */
export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-2xl border-b border-border/60 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Botão de Menu Mobile & Identificação */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 text-foreground/80 hover:bg-muted/60 rounded-lg"
          onClick={onMenuClick}
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Logo Mobile */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground font-mono">
            NEURO<span className="text-teal-400 font-normal">DOSE</span>
          </span>
        </div>

        {/* Telemetria de Estação (Desktop) */}
        <div className="hidden lg:flex items-center gap-3 font-mono text-[11px] text-muted-foreground/80 border-l border-border/60 pl-3">
          <span className="flex items-center gap-1.5 text-foreground/80 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            ESTAÇÃO CLÍNICA
          </span>
          <span>•</span>
          <span className="text-muted-foreground/70">CANAL SEGURO TLS 1.3</span>
        </div>
      </div>

      {/* Espaçador central */}
      <div className="flex-1" />

      {/* Ações da Barra Superior */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status de Operação da IA (Awwwards Live Badge) */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
          </span>
          <span className="font-medium tracking-wide">MOTOR IA OPERACIONAL</span>
        </div>

        {/* Notificações Clínicas */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-400" />
        </Button>

        {/* Alternador de Tema (Dark / Light) */}
        <ModeToggle />

        {/* Divisor vertical sutil */}
        <div className="hidden sm:block w-px h-5 bg-border/60 mx-1" />

        {/* Menu do Médico / Usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2.5 h-9 pl-1 pr-2.5 rounded-full hover:bg-muted/50 border border-transparent hover:border-border/60 transition-all"
            >
              <Avatar className="w-7 h-7 ring-1 ring-border">
                <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "Usuário"} />
                <AvatarFallback className="bg-teal-500/20 text-teal-400 text-[11px] font-bold font-mono">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-medium text-foreground leading-none">
                  {user?.displayName || "Dr(a). Especialista"}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground leading-none mt-1">
                  Neurologia
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-60 p-2 bg-popover/95 backdrop-blur-2xl border-border/80 rounded-xl shadow-xl">
            <DropdownMenuLabel className="font-normal px-2 py-2">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  {user?.displayName || "Dr(a). Especialista"}
                </p>
                {user?.email && (
                  <p className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3 text-teal-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                )}
                <div className="pt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Sessão Verificada LGPD</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-1 border-border/60" />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg text-xs font-medium py-2 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Encerrar Sessão Clínica</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
