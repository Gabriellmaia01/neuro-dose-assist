import { describe, it, expect } from "vitest";
import {
  sanitizarHorario,
  sanitizarEntradaDose,
  validarCamposObrigatorios,
  verificarDoseAbaixoLimite,
  verificarDoseAcimaLimite,
  obterErroDoseLimite,
} from "@/lib/validacaoDose";
import type { Medication } from "@/lib/medications";

describe("Validação e Sanitização de Dose (Funções Puras)", () => {
  describe("sanitizarHorario", () => {
    it("deve formatar corretamente horas e minutos válidos", () => {
      expect(sanitizarHorario("9:5")).toBe("09:05");
      expect(sanitizarHorario("14:30")).toBe("14:30");
    });

    it("deve limitar horários fora do intervalo 00-23 e 00-59", () => {
      expect(sanitizarHorario("25:70")).toBe("23:59");
      expect(sanitizarHorario("-5:-10")).toBe("00:00");
    });

    it("deve retornar o valor original se não contiver dois pontos", () => {
      expect(sanitizarHorario("invalido")).toBe("invalido");
    });
  });

  describe("sanitizarEntradaDose", () => {
    it("deve limitar casas decimais a no máximo duas", () => {
      expect(sanitizarEntradaDose("10.5555")).toBe("10.55");
      expect(sanitizarEntradaDose("20.5")).toBe("20.5");
      expect(sanitizarEntradaDose("50")).toBe("50");
    });
  });

  describe("validarCamposObrigatorios", () => {
    it("deve retornar erro quando algum campo obrigatório estiver vazio ou inválido", () => {
      const erro = validarCamposObrigatorios("", "med-1", "10", "Cefaleia");
      expect(erro).not.toBeNull();
      expect(erro?.titulo).toBe("Campos obrigatórios");

      const erroDoseZero = validarCamposObrigatorios("pac-1", "med-1", "0", "Cefaleia");
      expect(erroDoseZero).not.toBeNull();
    });

    it("deve retornar null quando todos os campos obrigatórios forem válidos", () => {
      const resultado = validarCamposObrigatorios("pac-1", "med-1", "15", "Dor crônica");
      expect(resultado).toBeNull();
    });
  });

  describe("Limites de dose", () => {
    const medExemplo: Medication = {
      id: "med-1",
      name: "Medicamento Teste",
      brandName: "Marca Teste",
      activeIngredient: "Princípio Ativo",
      therapeuticClass: "Analgésico",
      form: "Comprimido",
      minDose: 10,
      maxDose: 50,
      unit: "mg",
    };

    it("deve detectar dose abaixo do limite mínimo", () => {
      expect(verificarDoseAbaixoLimite("5", medExemplo)).toBe(true);
      expect(verificarDoseAbaixoLimite("10", medExemplo)).toBe(false);
      expect(verificarDoseAbaixoLimite("25", medExemplo)).toBe(false);
    });

    it("deve detectar dose acima do limite máximo", () => {
      expect(verificarDoseAcimaLimite("60", medExemplo)).toBe(true);
      expect(verificarDoseAcimaLimite("50", medExemplo)).toBe(false);
      expect(verificarDoseAcimaLimite("25", medExemplo)).toBe(false);
    });

    it("deve gerar mensagem explicativa correta de erro de limite", () => {
      const erroAbaixo = obterErroDoseLimite("5", medExemplo);
      expect(erroAbaixo?.titulo).toBe("Dose abaixo do limite");
      expect(erroAbaixo?.descricao).toContain("abaixo do limite mínimo de 10 mg");

      const erroAcima = obterErroDoseLimite("80", medExemplo);
      expect(erroAcima?.titulo).toBe("Dose acima do limite");
      expect(erroAcima?.descricao).toContain("excede o limite máximo de 50 mg");

      const semErro = obterErroDoseLimite("25", medExemplo);
      expect(semErro).toBeNull();
    });
  });
});

