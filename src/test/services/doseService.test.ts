import { describe, it, expect, vi, beforeEach } from "vitest";
import { FirebaseDoseService } from "@/services/firebase/doseService";
import * as firebaseDb from "firebase/database";

vi.mock("firebase/database", () => ({
  ref: vi.fn((_db, path) => ({ path })),
  push: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
  remove: vi.fn(),
  query: vi.fn((targetRef, ...constraints) => ({ targetRef, constraints })),
  orderByChild: vi.fn((field) => ({ type: "orderByChild", field })),
  equalTo: vi.fn((value) => ({ type: "equalTo", value })),
  limitToLast: vi.fn((count) => ({ type: "limitToLast", count })),
}));

vi.mock("@/lib/firebase", () => ({
  realtimeDb: {},
}));

vi.mock("@/lib/activityLog", () => ({
  logActivity: vi.fn().mockResolvedValue("log-dose-123"),
}));

describe("Serviço de Doses (FirebaseDoseService)", () => {
  let service: FirebaseDoseService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FirebaseDoseService();
  });

  describe("getDoses", () => {
    it("deve ordenar as doses por timestamp em ordem decrescente", async () => {
      const mockData = {
        d1: {
          id: "d1",
          doseAmount: "10",
          timestamp: "2026-01-01T10:00:00.000Z",
        },
        d2: {
          id: "d2",
          doseAmount: "20",
          timestamp: "2026-01-03T10:00:00.000Z",
        },
        d3: {
          id: "d3",
          doseAmount: "15",
          timestamp: "2026-01-02T10:00:00.000Z",
        },
      };

      vi.mocked(firebaseDb.get).mockResolvedValueOnce({
        exists: () => true,
        val: () => mockData,
      } as any);

      const doses = await service.getDoses("user-123");

      expect(doses).toHaveLength(3);
      expect(doses[0].id).toBe("d2"); // Mais recente
      expect(doses[1].id).toBe("d3");
      expect(doses[2].id).toBe("d1"); // Mais antigo
    });

    it("deve retornar array vazio se não houver doses salvas", async () => {
      vi.mocked(firebaseDb.get).mockResolvedValueOnce({
        exists: () => false,
      } as any);

      const doses = await service.getDoses("user-123");
      expect(doses).toEqual([]);
    });

    it("deve aplicar query com orderByChild('timestamp') e limitToLast quando limit for informado", async () => {
      const mockData = {
        d1: { id: "d1", patientId: "p1", doseAmount: "10", timestamp: "2026-01-01T10:00:00.000Z" },
        d2: { id: "d2", patientId: "p2", doseAmount: "20", timestamp: "2026-01-03T10:00:00.000Z" },
        d3: { id: "d3", patientId: "p1", doseAmount: "15", timestamp: "2026-01-02T10:00:00.000Z" },
      };

      vi.mocked(firebaseDb.get).mockResolvedValueOnce({
        exists: () => true,
        val: () => mockData,
      } as any);

      const doses = await service.getDoses("user-123", { limit: 2 });

      expect(firebaseDb.orderByChild).toHaveBeenCalledWith("timestamp");
      expect(firebaseDb.limitToLast).toHaveBeenCalledWith(2);
      expect(firebaseDb.query).toHaveBeenCalledTimes(1);
      expect(doses).toHaveLength(2);
      expect(doses[0].id).toBe("d2");
      expect(doses[1].id).toBe("d3");
    });

    it("deve aplicar query filtrada por patientId com orderByChild e equalTo", async () => {
      const mockData = {
        d1: { id: "d1", patientId: "p-alvo", doseAmount: "10", timestamp: "2026-01-01T10:00:00.000Z" },
        d2: { id: "d2", patientId: "p-alvo", doseAmount: "20", timestamp: "2026-01-04T10:00:00.000Z" },
      };

      vi.mocked(firebaseDb.get).mockResolvedValueOnce({
        exists: () => true,
        val: () => mockData,
      } as any);

      const doses = await service.getDoses("user-123", { patientId: "p-alvo", limit: 1 });

      expect(firebaseDb.orderByChild).toHaveBeenCalledWith("patientId");
      expect(firebaseDb.equalTo).toHaveBeenCalledWith("p-alvo");
      expect(firebaseDb.query).toHaveBeenCalledTimes(1);
      expect(doses).toHaveLength(1);
      expect(doses[0].id).toBe("d2");
    });

    it("deve fazer fallback seguro em memória se o índice ainda não existir no Firebase RTDB", async () => {
      const mockData = {
        d1: { id: "d1", patientId: "p1", doseAmount: "10", timestamp: "2026-01-01T10:00:00.000Z" },
        d2: { id: "d2", patientId: "p2", doseAmount: "20", timestamp: "2026-01-03T10:00:00.000Z" },
        d3: { id: "d3", patientId: "p1", doseAmount: "15", timestamp: "2026-01-02T10:00:00.000Z" },
      };

      vi.mocked(firebaseDb.get)
        .mockRejectedValueOnce(new Error("Index not defined, add \".indexOn\": \"patientId\""))
        .mockResolvedValueOnce({
          exists: () => true,
          val: () => mockData,
        } as any);

      const doses = await service.getDoses("user-123", { patientId: "p1", limit: 1 });

      expect(firebaseDb.get).toHaveBeenCalledTimes(2);
      expect(doses).toHaveLength(1);
      expect(doses[0].id).toBe("d3");
    });
  });

  describe("saveDose", () => {
    it("deve salvar a dose incluindo timestamp ISO e registrar atividade", async () => {
      vi.mocked(firebaseDb.push).mockReturnValueOnce({ key: "dose-key-999" } as any);
      vi.mocked(firebaseDb.set).mockResolvedValueOnce();

      const newId = await service.saveDose(
        {
          patientId: "paciente-1",
          medicationId: "med-1",
          doseAmount: "30",
          time: "14:00",
          indication: "Espasticidade",
          subjectiveState: { mood: 4, energy: 3 },
          analysis: {
            efficacyPrediction: 85,
            confidenceScore: 90,
            sideEffectRisk: "low",
            reasoning: "OK",
            suggestedAdjustments: "Manter",
            riskFactors: [],
          },
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        "user-123",
        { patientName: "João", medicationName: "Baclofeno" }
      );

      expect(newId).toBe("dose-key-999");
      expect(firebaseDb.set).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteDose", () => {
    it("deve deletar a dose pelo caminho users/userId/doses/doseId", async () => {
      vi.mocked(firebaseDb.remove).mockResolvedValueOnce();

      await service.deleteDose("dose-999", "user-123");

      expect(firebaseDb.remove).toHaveBeenCalledTimes(1);
    });
  });
});

