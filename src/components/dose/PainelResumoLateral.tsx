import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ClipboardCheck } from "lucide-react";
import { Patient } from "@/lib/patients";
import { Medication } from "@/lib/medications";

/**
 * Painel lateral com resumo em tempo real e dica.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas sidebar informativa
 *  - Segregação de Interfaces (I): recebe somente dados de exibição
 */

interface PropriedadesPainelResumo {
  pacienteSelecionado: Patient | undefined;
  medicamentoSelecionado: Medication | undefined;
  quantidadeDose: string;
  horarioDose: string;
  indicacao: string;
  carregandoDados: boolean;
  pacientes: Patient[];
  medicamentos: Medication[];
}

export function PainelResumoLateral({
  pacienteSelecionado,
  medicamentoSelecionado,
  quantidadeDose,
  horarioDose,
  indicacao,
  carregandoDados,
  pacientes,
  medicamentos,
}: PropriedadesPainelResumo) {
  return (
    <aside className="lg:col-span-4 space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <h2 className="font-display font-semibold text-base">Resumo</h2>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Paciente</span>
            <span className="font-medium truncate">{pacienteSelecionado?.name || "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Medicamento</span>
            <span className="font-medium truncate">{medicamentoSelecionado?.name || "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Dose</span>
            <span className="font-medium tabular-nums">
              {quantidadeDose ? `${quantidadeDose} mg` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Horário</span>
            <span className="font-medium tabular-nums">{horarioDose || "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Indicação</span>
            <span className="font-medium truncate">{indicacao || "—"}</span>
          </div>
        </div>

        {!carregandoDados && (pacientes.length === 0 || medicamentos.length === 0) && (
          <div className="mt-5 pt-5 border-t border-border space-y-3">
            <p className="text-sm font-medium">Faltam cadastros para registrar doses.</p>
            <div className="flex flex-col gap-2">
              {pacientes.length === 0 && (
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/patients">Cadastrar Paciente</Link>
                </Button>
              )}
              {medicamentos.length === 0 && (
                <Button asChild variant="outline" className="justify-start">
                  <Link to="/medications">Cadastrar Medicamento</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 text-primary mb-2">
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          <p className="text-sm font-semibold">Dica</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Para uma análise melhor, preencha indicação e efeitos percebidos (se houver).
        </p>
      </div>
    </aside>
  );
}
