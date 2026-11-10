import { beforeEach, describe, expect, it, vi } from "vitest";
import { FirebaseUserSettingsService } from "@/services/firebase/userSettingsService";
import * as firestore from "firebase/firestore";

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => "server-time"),
}));

vi.mock("@/lib/firebase", () => ({ db: {} }));

const existingSnapshot = { exists: () => true, data: () => ({ profile: { fullName: "Pessoa" } }) };
const missingSnapshot = { exists: () => false, data: () => undefined };

describe("FirebaseUserSettingsService", () => {
  let service: FirebaseUserSettingsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FirebaseUserSettingsService();
    vi.mocked(firestore.doc).mockReturnValue("user-doc" as never);
    vi.mocked(firestore.updateDoc).mockResolvedValue();
    vi.mocked(firestore.setDoc).mockResolvedValue();
  });

  it("carrega configurações, retorna null para documento ausente e permissões", async () => {
    vi.mocked(firestore.getDoc)
      .mockResolvedValueOnce(existingSnapshot as never)
      .mockResolvedValueOnce(missingSnapshot as never)
      .mockRejectedValueOnce({ code: "permission-denied" });

    await expect(service.getUserSettings("user-1")).resolves.toEqual({
      profile: { fullName: "Pessoa" },
    });
    await expect(service.getUserSettings("user-1")).resolves.toBeNull();
    await expect(service.getUserSettings("user-1")).resolves.toBeNull();
    vi.mocked(firestore.getDoc).mockRejectedValueOnce(new Error("offline"));
    await expect(service.getUserSettings("user-1")).rejects.toThrow("offline");
  });

  it("salva as configurações criando ou atualizando o documento", async () => {
    vi.mocked(firestore.getDoc)
      .mockResolvedValueOnce(existingSnapshot as never)
      .mockResolvedValueOnce(missingSnapshot as never);

    await service.saveUserSettings("user-1", { profile: { fullName: "Atualizada" } });
    expect(firestore.updateDoc).toHaveBeenCalledWith(
      "user-doc",
      expect.objectContaining({ profile: { fullName: "Atualizada" }, updatedAt: "server-time" })
    );

    await service.saveUserSettings("user-1", { profile: { fullName: "Nova" } });
    expect(firestore.setDoc).toHaveBeenCalledWith(
      "user-doc",
      expect.objectContaining({ createdAt: "server-time", updatedAt: "server-time" })
    );
  });

  it("atualiza perfil, notificações e IA para documentos existentes e novos", async () => {
    vi.mocked(firestore.getDoc)
      .mockResolvedValueOnce(existingSnapshot as never)
      .mockResolvedValueOnce(missingSnapshot as never)
      .mockResolvedValueOnce(existingSnapshot as never)
      .mockResolvedValueOnce(missingSnapshot as never)
      .mockResolvedValueOnce(existingSnapshot as never)
      .mockResolvedValueOnce(missingSnapshot as never);

    await service.updateUserProfile("user-1", { specialty: "Neurologia" });
    await service.updateUserProfile("user-2", { specialty: "Clínica" });
    await service.updateNotificationSettings("user-1", {
      email: true, push: true, alerts: true, recommendations: true, reports: false,
    });
    await service.updateNotificationSettings("user-2", {
      email: false, push: false, alerts: false, recommendations: false, reports: false,
    });
    await service.updateAISettings("user-1", {
      autoAnalysis: true, riskAlerts: true, recommendations: true, confidence: "high",
    });
    await service.updateAISettings("user-2", {
      autoAnalysis: false, riskAlerts: false, recommendations: false, confidence: "low",
    });

    expect(firestore.updateDoc).toHaveBeenCalledTimes(3);
    expect(firestore.setDoc).toHaveBeenCalledTimes(3);
    expect(firestore.setDoc).toHaveBeenCalledWith(
      "user-doc",
      expect.objectContaining({
        notifications: expect.objectContaining({ email: true }),
        ai: expect.objectContaining({ confidence: "high" }),
      })
    );
  });

  it("propaga falhas de persistência", async () => {
    vi.mocked(firestore.getDoc).mockRejectedValueOnce(new Error("offline"));
    await expect(service.saveUserSettings("user-1", {})).rejects.toThrow("offline");
  });
});
