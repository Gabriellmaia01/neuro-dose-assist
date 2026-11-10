import { beforeEach, describe, expect, it, vi } from "vitest";
import { FirebaseActivityLogService } from "@/services/firebase/activityLogService";
import * as database from "firebase/database";

vi.mock("firebase/database", () => ({
  ref: vi.fn(),
  push: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ realtimeDb: {} }));

describe("FirebaseActivityLogService", () => {
  let service: FirebaseActivityLogService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FirebaseActivityLogService();
    vi.mocked(database.ref).mockImplementation((_db, path) => path as never);
  });

  it("registra a descrição, os dados do usuário e metadados", async () => {
    vi.mocked(database.push).mockReturnValueOnce({ key: "log-1" } as never);
    vi.mocked(database.set).mockResolvedValueOnce();

    await expect(
      service.logActivity({
        action: "create",
        entityType: "patient",
        entityId: "patient-1",
        entityName: "Paciente",
        userId: "user-1",
        metadata: { source: "test" },
      })
    ).resolves.toBe("log-1");

    expect(database.set).toHaveBeenCalledWith(
      { key: "log-1" },
      expect.objectContaining({
        description: "cadastrou paciente: Paciente",
        userName: "Usuário",
        userEmail: "",
        metadata: { source: "test" },
      })
    );
  });

  it("retorna null quando a gravação falha", async () => {
    vi.mocked(database.push).mockReturnValueOnce({ key: "log-2" } as never);
    vi.mocked(database.set).mockRejectedValueOnce(new Error("offline"));

    await expect(
      service.logActivity({
        action: "delete",
        entityType: "appointment",
        entityId: "appointment-1",
        entityName: "Consulta",
        userId: "user-1",
      })
    ).resolves.toBeNull();
  });

  it("retorna logs em ordem decrescente com limite e filtra por entidade ou ação", async () => {
    vi.mocked(database.get).mockResolvedValue({
      exists: () => true,
      val: () => ({
        first: { entityType: "patient", action: "create", timestamp: "2026-01-01T10:00:00Z" },
        second: { entityType: "dose", action: "update", timestamp: "2026-01-03T10:00:00Z" },
        third: { entityType: "patient", action: "update", timestamp: "2026-01-02T10:00:00Z" },
      }),
    } as never);

    const logs = await service.getActivityLogs("user-1", 2);
    expect(logs.map((log) => log.id)).toEqual(["second", "third"]);
    await expect(service.getActivityLogsByEntity("user-1", "patient")).resolves.toHaveLength(2);
    await expect(service.getActivityLogsByAction("user-1", "update")).resolves.toHaveLength(2);
  });

  it("retorna listas vazias para snapshot ausente ou erro de leitura", async () => {
    vi.mocked(database.get)
      .mockResolvedValueOnce({ exists: () => false } as never)
      .mockRejectedValueOnce({ code: "PERMISSION_DENIED" })
      .mockRejectedValueOnce(new Error("offline"));

    await expect(service.getActivityLogs("user-1")).resolves.toEqual([]);
    await expect(service.getActivityLogs("user-1")).resolves.toEqual([]);
    await expect(service.getActivityLogs("user-1")).resolves.toEqual([]);
  });
});
