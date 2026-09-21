import { useState } from "react";

/**
 * Hook responsável pelo estado do formulário de dose.
 * Princípio SOLID: Responsabilidade Única (S) — apenas gerenciar estado do formulário.
 */

export interface EstadoFormularioDose {
  // Etapa 1 — Informações da Dose
  pacienteIdSelecionado: string;
  setPacienteIdSelecionado: (valor: string) => void;
  medicamentoIdSelecionado: string;
  setMedicamentoIdSelecionado: (valor: string) => void;
  quantidadeDose: string;
  setQuantidadeDose: (valor: string) => void;
  formaAdministracao: string;
  setFormaAdministracao: (valor: string) => void;
  horarioDose: string;
  setHorarioDose: (valor: string) => void;
  indicacao: string;
  setIndicacao: (valor: string) => void;

  // Etapa 2 — Estado Subjetivo
  humor: number[];
  setHumor: (valor: number[]) => void;
  energia: number[];
  setEnergia: (valor: number[]) => void;
  sono: number[];
  setSono: (valor: number[]) => void;
  efeitos: string;
  setEfeitos: (valor: string) => void;

  // Controle de navegação
  etapa: number;
  setEtapa: (valor: number) => void;

  // Reiniciar formulário
  reiniciarFormulario: () => void;
}

export function useFormularioDose(): EstadoFormularioDose {
  // Etapa 1
  const [pacienteIdSelecionado, setPacienteIdSelecionado] = useState("");
  const [medicamentoIdSelecionado, setMedicamentoIdSelecionado] = useState("");
  const [quantidadeDose, setQuantidadeDose] = useState("");
  const [formaAdministracao, setFormaAdministracao] = useState("");
  const [horarioDose, setHorarioDose] = useState("08:00");
  const [indicacao, setIndicacao] = useState("");

  // Etapa 2
  const [humor, setHumor] = useState([3]);
  const [energia, setEnergia] = useState([5]);
  const [sono, setSono] = useState([7]);
  const [efeitos, setEfeitos] = useState("");

  // Navegação
  const [etapa, setEtapa] = useState(1);

  const reiniciarFormulario = () => {
    setEtapa(1);
  };

  return {
    pacienteIdSelecionado,
    setPacienteIdSelecionado,
    medicamentoIdSelecionado,
    setMedicamentoIdSelecionado,
    quantidadeDose,
    setQuantidadeDose,
    formaAdministracao,
    setFormaAdministracao,
    horarioDose,
    setHorarioDose,
    indicacao,
    setIndicacao,
    humor,
    setHumor,
    energia,
    setEnergia,
    sono,
    setSono,
    efeitos,
    setEfeitos,
    etapa,
    setEtapa,
    reiniciarFormulario,
  };
}
