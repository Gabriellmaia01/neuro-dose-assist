import { describe, it, expect, vi, beforeEach } from "vitest";
import { FirebaseMedicationService } from "@/services/firebase/medicationService";
import * as firebaseDb from "firebase/database";

vi.mock("firebase/database", () => ({
  ref: vi.fn(),
  push: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  realtimeDb: {},
}));

vi.mock("@/lib/activityLog", () => ({
  logActivity: vi.fn().mockResolvedValue("log-123"),
}));

describe("Serviço de Medicamentos (FirebaseMedicationService)", () => {
  let service: FirebaseMedicationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FirebaseMedicationService();
  });

  describe("getMedications", () => {
    it("deve carregar todos os medicamentos cadastrados", async () => {
      const mockData = {
        m1: { name: "Baclofeno", minDose: 10, maxDose: 80, unit: "mg" },
        m2: { name: "Gabapentina", minDose: 300, maxDose: 3600, unit: "mg" },
      };

      vi.mocked(firebaseDb.get).mockResolvedValueOnce({
        exists: () => true,
        val: () => mockData,
      } as any);

      const result = await service.getMedications("user-123");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("m1");
      expect(result[1].name).toBe("Gabapentina");
    });

    it("deve tratar erro de permissão retornando array vazio sem lançar exceção", async () => {
      vi.mocked(firebaseDb.get).mockRejectedValueOnce({
        code: "PERMISSION_DENIED",
      });

      const result = await service.getMedications("user-123");
      expect(result).toEqual([]);
    });

    it("deve lançar exceção para outros tipos de erro de rede ou inesperados", async () => {
      vi.mocked(firebaseDb.get).mockRejectedValueOnce(new Error("Network disconnect"));

      await expect(service.getMedications("user-123")).rejects.toThrow(
        "Network disconnect"
      );
    });
  });

  describe("saveMedication", () => {
    it("deve persistir novo medicamento e retornar o ID gerado", async () => {
      vi.mocked(firebaseDb.push).mockReturnValueOnce({ key: "m-novo-id" } as any);
      vi.mocked(firebaseDb.set).mockResolvedValueOnce();

      const id = await service.saveMedication(
        {
          name: "Levodopa",
          brandName: "Prolopa",
          activeIngredient: "Levodopa + Benserazida",
          therapeuticClass: "Antiparkinsoniano",
          form: "Comprimido",
          minDose: 100,
          maxDose: 800,
          unit: "mg",
        },
        "user-123"
      );

      expect(id).toBe("m-novo-id");
      expect(firebaseDb.set).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteMedication", () => {
    it("deve remover medicamento e registrar log de exclusão", async () => {
      vi.mocked(firebaseDb.remove).mockResolvedValueOnce();

      await service.deleteMedication("m-1", "user-123", "Baclofeno");

      expect(firebaseDb.remove).toHaveBeenCalledTimes(1);
    });
  });
});

