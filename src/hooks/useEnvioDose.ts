import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/contexts/ClinicContext";
import { Patient } from "@/lib/patients";
import { Medication } from "@/lib/medications";
import { analyzeDose, AnalysisResult, type ConfidenceLevel } from "@/services/aiService";
import { saveDose } from "@/lib/doses";
import { validarCamposObrigatorios, obterErroDoseLimite } from "@/lib/validacaoDose";
import { toast } from "@/hooks/use-toast";

/**
 * Hook responsável pelo envio, análise e persistência da dose.
 * Princípio SOLID:
 *  - Responsabilidade Única (S): apenas lógica de envio
 *  - Inversão de Dependência (D): depende de interfaces (analyzeDose, saveDose)
 */

export interface ParametrosEnvio {
  pacienteIdSelecionado: string;
  medicamentoIdSelecionado: string;
  quantidadeDose: string;
  horarioDose: string;
  indicacao: string;
  humor: number[];
  energia: number[];
  sono: number[];
  efeitos: string;
  pacienteSelecionado: Patient | undefined;
  medicamentoSelecionado: Medication | undefined;
  todosMedicamentos: Medication[];
  nivelConfianca: ConfidenceLevel;
}

export interface RetornoEnvioDose {
  analisando: boolean;
  resultadoAnalise: AnalysisResult | null;
  mostrarResultado: boolean;
  enviarDose: () => Promise<void>;
  novoRegistro: () => void;
}

export function useEnvioDose(parametros: ParametrosEnvio): RetornoEnvioDose {
  const { user } = useAuth();
  const { effectiveUserId } = useClinic();

  const [analisando, setAnalisando] = useState(false);
  const [resultadoAnalise, setResultadoAnalise] = useState<AnalysisResult | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const {
    pacienteIdSelecionado,
    medicamentoIdSelecionado,
    quantidadeDose,
    horarioDose,
    indicacao,
    humor,
    energia,
    sono,
    efeitos,
    pacienteSelecionado,
    medicamentoSelecionado,
    todosMedicamentos,
    nivelConfianca,
  } = parametros;

  const enviarDose = async () => {
    // Validar campos obrigatórios
    const erroCampos = validarCamposObrigatorios(
      pacienteIdSelecionado,
      medicamentoIdSelecionado,
      quantidadeDose,
      indicacao
    );
    if (erroCampos) {
      toast({ title: erroCampos.titulo, description: erroCampos.descricao, variant: "destructive" });
      return;
    }

    // Validar limites de dose
    const erroLimite = obterErroDoseLimite(quantidadeDose, medicamentoSelecionado);
    if (erroLimite) {
      toast({ title: erroLimite.titulo, description: erroLimite.descricao, variant: "destructive" });
      return;
    }

    setAnalisando(true);
    try {
      // Preparar contexto do medicamento para a IA
      const contextoMedicamento = medicamentoSelecionado
        ? {
            name: medicamentoSelecionado.name,
            brandName: medicamentoSelecionado.brandName,
            activeIngredient: medicamentoSelecionado.activeIngredient,
            therapeuticClass: medicamentoSelecionado.therapeuticClass,
            minDose: medicamentoSelecionado.minDose,
            maxDose: medicamentoSelecionado.maxDose,
            unit: medicamentoSelecionado.unit,
          }
        : undefined;

      // Preparar lista de medicamentos para verificação de interações
      const medicamentosParaChecagem = todosMedicamentos.map((m) => ({
        id: m.id,
        name: m.name,
        therapeuticClass: m.therapeuticClass,
        activeIngredient: m.activeIngredient,
      }));

      const resultado = await analyzeDose(
        {
          patientId: pacienteIdSelecionado,
          medicationId: medicamentoIdSelecionado,
          dose: quantidadeDose,
          time: horarioDose,
          indication: indicacao,
        },
        {
          mood: humor[0],
          energy: energia[0],
          sleep: sono[0],
          effects: efeitos,
        },
        contextoMedicamento,
        medicamentosParaChecagem,
        nivelConfianca
      );
      setResultadoAnalise(resultado);

      // Salvar no Firebase
      try {
        await saveDose(
          {
            patientId: pacienteIdSelecionado,
            medicationId: medicamentoIdSelecionado,
            doseAmount: quantidadeDose,
            time: horarioDose,
            indication: indicacao,
            subjectiveState: {
              mood: humor[0],
              energy: energia[0],
              sleep: sono[0],
              effects: efeitos,
            },
            analysis: resultado,
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          effectiveUserId,
          { patientName: pacienteSelecionado?.name, medicationName: medicamentoSelecionado?.name },
          { name: user.displayName || undefined, email: user.email || undefined }
        );

        setMostrarResultado(true);
        toast({
          title: "Dose Registrada!",
          description: "Dados salvos com sucesso no histórico.",
        });
      } catch (erroSalvar) {
        console.error("Falha ao salvar dose:", erroSalvar);
        toast({
          title: "Erro ao salvar",
          description: "Análise concluída, mas falha ao salvar no histórico.",
          variant: "destructive",
        });
        // Exibir resultado mesmo se falhar ao salvar
        setMostrarResultado(true);
      }
    } catch {
      toast({
        title: "Erro na análise",
        description: "Falha ao processar análise da dose.",
        variant: "destructive",
      });
    } finally {
      setAnalisando(false);
    }
  };

  const novoRegistro = () => {
    setMostrarResultado(false);
    setResultadoAnalise(null);
  };

  return {
    analisando,
    resultadoAnalise,
    mostrarResultado,
    enviarDose,
    novoRegistro,
  };
}
