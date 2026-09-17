import { Users, Zap, Activity } from "lucide-react";
import { type EstatisticasPainel } from "@/lib/tiposPainel";

interface PropriedadesCabecalhoPainel {
  estatisticas: EstatisticasPainel;
}

/**
 * Seção hero/cabeçalho do painel com status do sistema e contadores rápidos.
 * Responsabilidade única: renderizar o cabeçalho do painel.
 */
export function CabecalhoPainel({ estatisticas }: PropriedadesCabecalhoPainel) {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/5 shadow-2xl group">
      {/* Padrão de fundo refinado */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      {/* Orbes de destaque animadas */}
      <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-teal-500/20 to-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:from-teal-500/30 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-gradient-to-tr from-violet-500/15 to-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10 p-5 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div className="space-y-3 sm:space-y-4">
            {/* Badge de status */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-emerald-200/90 uppercase tracking-wider">Sistema Ativo</span>
            </div>

            {/* Título */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Painel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300">Controle</span>
              </h1>
              <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-lg leading-relaxed">
                Monitoramento inteligente e apoio à decisão clínica em tempo real.
              </p>
            </div>

            {/* Contadores rápidos */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-teal-300" />
                </div>
                <div>
                  <span className="font-semibold text-white">{estatisticas.pacientesAtivos}</span>
                  <span className="text-slate-400 ml-1 text-xs sm:text-sm">pacientes</span>
                </div>
              </div>
              <div className="hidden sm:block w-px h-6 bg-white/10" />
              <div className="flex items-center gap-2 text-sm">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-violet-300" />
                </div>
                <div>
                  <span className="font-semibold text-white">{estatisticas.inferenciasIA}</span>
                  <span className="text-slate-400 ml-1 text-xs sm:text-sm">análises IA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lado direito — Card de status */}
          <div className="hidden lg:flex flex-col items-end gap-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/30 to-cyan-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-teal-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Status: Otimizado</p>
                <p className="text-xs text-slate-400">Última sincronização: agora</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
