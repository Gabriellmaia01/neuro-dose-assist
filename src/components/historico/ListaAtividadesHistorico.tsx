import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, FileText, Loader2, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ActivityLog } from "@/lib/activityLog";
import { configuracaoAcao, configuracaoEntidade } from "@/lib/tiposHistorico";

/**
 * Aba de atividades (logs de CRUD).
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas renderização de logs de atividade
 *  - Segregação de Interfaces (I): recebe apenas logs e estado de carregamento
 */

interface PropriedadesListaAtividades {
  logs: ActivityLog[];
  carregando: boolean;
}

export function ListaAtividadesHistorico({
  logs,
  carregando,
}: PropriedadesListaAtividades) {
  if (carregando) {
    return (
      <div className="glass-card rounded-2xl p-12 flex items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-muted-foreground font-medium">
          Carregando atividades…
        </span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <FileText
            className="w-7 h-7 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <p className="font-display font-semibold text-lg">
          Nenhuma atividade registrada
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          As atividades serão registradas conforme você usar o sistema.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {logs.map((log) => {
        const config = configuracaoAcao[log.action] || configuracaoAcao.create;
        const entidade =
          configuracaoEntidade[log.entityType] || configuracaoEntidade.patient;
        const IconeAcao = config.icon;
        const IconeEntidade = entidade.icon;

        const dt = new Date(log.timestamp);
        const rotuloDataHora = format(dt, "dd/MM/yyyy 'às' HH:mm", {
          locale: ptBR,
        });

        return (
          <li key={log.id}>
            <div
              className={cn(
                "w-full glass-card rounded-2xl p-5 transition-colors duration-200 hover:bg-card/90"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                    config.color
                  )}
                >
                  <IconeAcao className="w-6 h-6" aria-hidden="true" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", config.color)}
                    >
                      {config.label}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-muted/50">
                      <IconeEntidade className="w-3 h-3 mr-1" />
                      {entidade.label}
                    </Badge>
                  </div>

                  <p className="font-medium mt-2">{log.entityName}</p>

                  <p className="text-sm text-muted-foreground mt-1">
                    {log.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" aria-hidden="true" />
                      <span className="font-medium text-foreground/80">
                        {log.userName || log.userEmail || "Usuário"}
                      </span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      {rotuloDataHora}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
