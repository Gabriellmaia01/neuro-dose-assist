import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pill } from "lucide-react";
import { Patient } from "@/lib/patients";
import { Medication } from "@/lib/medications";
import { sanitizarEntradaDose, sanitizarHorario } from "@/lib/validacaoDose";

/**
 * Etapa 1 — Informações da Dose.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas UI da etapa 1
 *  - Segregação de Interfaces (I): props específicas para o que este componente precisa
 */

interface PropriedadesEtapaInformacoes {
  pacientes: Patient[];
  medicamentos: Medication[];
  carregandoDados: boolean;
  pacienteIdSelecionado: string;
  onPacienteChange: (valor: string) => void;
  medicamentoIdSelecionado: string;
  onMedicamentoChange: (valor: string) => void;
  quantidadeDose: string;
  onQuantidadeDoseChange: (valor: string) => void;
  formaAdministracao: string;
  onFormaAdministracaoChange: (valor: string) => void;
  horarioDose: string;
  onHorarioDoseChange: (valor: string) => void;
  indicacao: string;
  onIndicacaoChange: (valor: string) => void;
  doseAcimaLimite: boolean;
  doseAbaixoLimite: boolean;
  medicamentoSelecionado: Medication | undefined;
}

export function EtapaInformacoesDose({
  pacientes,
  medicamentos,
  carregandoDados,
  pacienteIdSelecionado,
  onPacienteChange,
  medicamentoIdSelecionado,
  onMedicamentoChange,
  quantidadeDose,
  onQuantidadeDoseChange,
  formaAdministracao,
  onFormaAdministracaoChange,
  horarioDose,
  onHorarioDoseChange,
  indicacao,
  onIndicacaoChange,
  doseAcimaLimite,
  doseAbaixoLimite,
  medicamentoSelecionado,
}: PropriedadesEtapaInformacoes) {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Pill className="w-5 h-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg">
            Informações da Dose
          </h2>
          <p className="text-sm text-muted-foreground">
            Selecione paciente, medicamento e contexto da dose
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Paciente */}
        <div className="space-y-2">
          <Label htmlFor="patientId">Paciente</Label>
          <Select value={pacienteIdSelecionado} onValueChange={onPacienteChange}>
            <SelectTrigger id="patientId" className="h-11">
              <SelectValue placeholder={carregandoDados ? "Carregando…" : "Selecione…"} />
            </SelectTrigger>
            <SelectContent>
              {pacientes.length > 0 ? (
                pacientes.map((p) => (
                  <SelectItem key={p.id} value={p.id || "unknown"}>
                    {p.name}, {p.age} anos
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  {carregandoDados ? "Carregando…" : "Nenhum paciente cadastrado"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Medicamento */}
        <div className="space-y-2">
          <Label htmlFor="medicationId">Medicamento</Label>
          <Select value={medicamentoIdSelecionado} onValueChange={onMedicamentoChange}>
            <SelectTrigger id="medicationId" className="h-11">
              <SelectValue placeholder={carregandoDados ? "Carregando…" : "Selecione…"} />
            </SelectTrigger>
            <SelectContent>
              {medicamentos.length > 0 ? (
                medicamentos.map((m) => (
                  <SelectItem key={m.id} value={m.id || "unknown"}>
                    {m.name} ({m.brandName})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  {carregandoDados ? "Carregando…" : "Nenhum medicamento cadastrado"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Dose (mg) */}
        <div className="space-y-2">
          <Label htmlFor="doseAmount">Dose (mg)</Label>
          <Input
            id="doseAmount"
            name="doseAmount"
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            autoComplete="off"
            placeholder="Ex.: 20…"
            value={quantidadeDose}
            onChange={(e) => onQuantidadeDoseChange(sanitizarEntradaDose(e.target.value))}
            className="h-11"
          />
          {doseAbaixoLimite ? (
            <p className="text-xs text-destructive font-medium">
              ⚠ Dose abaixo do limite mínimo de {medicamentoSelecionado?.minDose} mg para {medicamentoSelecionado?.name}.
            </p>
          ) : doseAcimaLimite ? (
            <p className="text-xs text-destructive font-medium">
              ⚠ Dose excede o limite máximo de {medicamentoSelecionado?.maxDose} mg para {medicamentoSelecionado?.name}.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Use o valor em mg (ex.: 20). Evite texto.
            </p>
          )}
        </div>

        {/* Forma de Administração */}
        <div className="space-y-2">
          <Label htmlFor="adminForm">Forma de Administração</Label>
          <Select value={formaAdministracao} onValueChange={onFormaAdministracaoChange}>
            <SelectTrigger id="adminForm" className="h-11">
              <SelectValue placeholder="Selecione…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="oral">Oral</SelectItem>
              <SelectItem value="sublingual">Sublingual</SelectItem>
              <SelectItem value="injection">Injetável</SelectItem>
              <SelectItem value="topical">Tópico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Horário */}
        <div className="space-y-2">
          <Label htmlFor="doseTime">Horário</Label>
          <Input
            id="doseTime"
            name="doseTime"
            type="time"
            autoComplete="off"
            value={horarioDose}
            onChange={(e) => onHorarioDoseChange(sanitizarHorario(e.target.value))}
            className="h-11"
          />
        </div>

        {/* Indicação */}
        <div className="space-y-2">
          <Label htmlFor="indication">Indicação</Label>
          <Input
            id="indication"
            name="indication"
            autoComplete="off"
            maxLength={100}
            placeholder="Ex.: TDAH, depressão…"
            value={indicacao}
            onChange={(e) => onIndicacaoChange(e.target.value)}
            className="h-11"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Informe o motivo clínico (uma ou mais condições).
            </p>
            <span
              className={`text-xs tabular-nums ${
                indicacao.length >= 100 ? "text-destructive font-medium" : "text-muted-foreground"
              }`}
            >
              {indicacao.length}/100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
