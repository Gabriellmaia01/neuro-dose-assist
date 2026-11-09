import { describe, it, expect, vi, beforeEach } from "vitest";
import { FirebasePatientService } from "@/services/firebase/patientService";
import * as firebaseDb from "firebase/database";

vi.mock("firebase/database", () => ({
  ref: vi.fn(),
  push: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
  remove: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  realtimeDb: {},
}));

vi.mock("@/lib/activityLog", () => ({
  logActivity: vi.fn().mockResolvedValue("log-id-123"),
}));

describe("Serviço de Pacientes (FirebasePatientService)", () => {
  let service: FirebasePatientService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FirebasePatientService();

    const mockStorage: Record<string, string> = {};
    globalThis.localStorage = {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, val: string) => {
        mockStorage[key] = val;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        for (const k of Object.keys(mockStorage)) delete mockStorage[k];
      }),
      length: 0,
      key: vi.fn(),
    } as any;
  });

  describe("getPatients", () => {
    it("deve retornar lista de pacientes quando existirem dados no snapshot", async () => {
      const mockData = {
        p1: { name: "Carlos Pereira", age: 50, condition: "Epilepsia", gender: "Masculino" },
        p2: { name: "Ana Souza", age: 35, condition: "Enxaqueca", gender: "Feminino" },
      };

      vi.mocked(firebaseDb.get).mockResolvedValueOnce({
        exists: () => true,
        val: () => mockData,
      } as any);

      const result = await service.getPatients("user-123");

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("p1");
      expect(result[0].name).toBe("Carlos Pereira");
      expect(result[1].id).toBe("p2");
    });

    it("deve retornar array vazio quando o snapshot não existir", async () => {
      vi.mocked(firebaseDb.get).mockResolvedValueOnce({
        exists: () => false,
      } as any);

      const result = await service.getPatients("user-123");
      expect(result).toEqual([]);
    });

    it("deve retornar array vazio silenciosamente se ocorrer erro de permissão", async () => {
      vi.mocked(firebaseDb.get).mockRejectedValueOnce({
        code: "PERMISSION_DENIED",
        message: "Permission denied",
      });

      const result = await service.getPatients("user-123");
      expect(result).toEqual([]);
    });
  });

  describe("savePatient", () => {
    it("deve criar novo paciente quando id não for fornecido", async () => {
      const mockPushRef = { key: "novo-paciente-id" };
      vi.mocked(firebaseDb.push).mockReturnValueOnce(mockPushRef as any);
      vi.mocked(firebaseDb.set).mockResolvedValueOnce();

      const newId = await service.savePatient(
        {
          name: "Novo Paciente",
          age: 28,
          gender: "Outro",
          condition: "Distonia",
        },
        "user-123",
        { name: "Dr. Silva", email: "silva@med.com" }
      );

      expect(newId).toBe("novo-paciente-id");
      expect(firebaseDb.set).toHaveBeenCalledTimes(1);
    });

    it("deve atualizar paciente existente quando id for fornecido", async () => {
      vi.mocked(firebaseDb.update).mockResolvedValueOnce();

      const id = await service.savePatient(
        {
          id: "p-existente",
          name: "Paciente Atualizado",
          age: 29,
          gender: "Outro",
          condition: "Distonia",
        },
        "user-123"
      );

      expect(id).toBe("p-existente");
      expect(firebaseDb.update).toHaveBeenCalledTimes(1);
    });

    it("deve converter erro de permissão em mensagem amigável", async () => {
      vi.mocked(firebaseDb.push).mockReturnValueOnce({ key: "k" } as any);
      vi.mocked(firebaseDb.set).mockRejectedValueOnce({
        code: "permission_denied",
      });

      await expect(
        service.savePatient(
          { name: "Teste", age: 30, gender: "Masculino", condition: "Dor" },
          "user-123"
        )
      ).rejects.toThrow("Permissão negada");
    });
  });

  describe("deletePatient", () => {
    it("deve chamar remove no ref correto e registrar atividade", async () => {
      vi.mocked(firebaseDb.remove).mockResolvedValueOnce();

      await service.deletePatient("p-remover", "user-123", "Paciente Remover");

      expect(firebaseDb.remove).toHaveBeenCalledTimes(1);
    });
  });
});
