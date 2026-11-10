import { beforeEach, describe, expect, it, vi } from "vitest";
import { FirebaseNoteService } from "@/services/firebase/noteService";
import * as database from "firebase/database";

vi.mock("firebase/database", () => ({
  ref: vi.fn(),
  push: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
  remove: vi.fn(),
  update: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ realtimeDb: {} }));

describe("FirebaseNoteService", () => {
  let service: FirebaseNoteService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FirebaseNoteService();
    vi.mocked(database.ref).mockImplementation((_db, path) => path as never);
  });

  it("cria uma nota e grava apenas os campos definidos", async () => {
    vi.mocked(database.push).mockReturnValueOnce({ key: "note-1" } as never);
    vi.mocked(database.set).mockResolvedValueOnce();

    await expect(
      service.saveNote(
        {
          patientId: "patient-1",
          title: "Evolução",
          content: "Conteúdo",
          category: "Evolução",
        },
        "user-1"
      )
    ).resolves.toBe("note-1");

    expect(database.set).toHaveBeenCalledWith(
      { key: "note-1" },
      expect.objectContaining({
        patientId: "patient-1",
        title: "Evolução",
        createdBy: "user-1",
      })
    );
  });

  it("atualiza uma nota existente e propaga falhas de gravação", async () => {
    vi.mocked(database.update).mockResolvedValueOnce();
    await expect(
      service.saveNote(
        {
          id: "note-existing",
          patientId: "patient-1",
          title: "Atualizada",
          content: "Conteúdo novo",
          category: "Outro",
        },
        "user-1"
      )
    ).resolves.toBe("note-existing");
    expect(database.update).toHaveBeenCalledWith(
      "users/user-1/notes/note-existing",
      expect.objectContaining({ title: "Atualizada" })
    );

    vi.mocked(database.update).mockRejectedValueOnce(new Error("offline"));
    await expect(
      service.saveNote(
        {
          id: "note-existing",
          patientId: "patient-1",
          title: "Falha",
          content: "",
          category: "Outro",
        },
        "user-1"
      )
    ).rejects.toThrow("offline");
  });

  it("filtra notas por paciente e ordena por data decrescente", async () => {
    vi.mocked(database.get).mockResolvedValueOnce({
      exists: () => true,
      val: () => ({
        older: { patientId: "patient-1", title: "Antiga", createdAt: "2026-01-01" },
        newer: { patientId: "patient-1", title: "Recente", createdAt: "2026-02-01" },
        other: { patientId: "patient-2", title: "Outra", createdAt: "2026-03-01" },
      }),
    } as never);

    await expect(service.getPatientNotes("user-1", "patient-1")).resolves.toMatchObject([
      { id: "newer", title: "Recente" },
      { id: "older", title: "Antiga" },
    ]);

    vi.mocked(database.get).mockResolvedValueOnce({
      exists: () => true,
      val: () => ({
        a: { patientId: "patient-1", title: "A", createdAt: "2026-01-01" },
        b: { patientId: "patient-2", title: "B", createdAt: "2026-02-01" },
      }),
    } as never);
    await expect(service.getAllNotes("user-1")).resolves.toHaveLength(2);
  });

  it("trata snapshot ausente e erros de leitura conforme o contrato", async () => {
    vi.mocked(database.get)
      .mockResolvedValueOnce({ exists: () => false } as never)
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ exists: () => false } as never)
      .mockRejectedValueOnce(new Error("offline"));

    await expect(service.getPatientNotes("user-1", "patient-1")).resolves.toEqual([]);
    await expect(service.getPatientNotes("user-1", "patient-1")).resolves.toEqual([]);
    await expect(service.getAllNotes("user-1")).resolves.toEqual([]);
    await expect(service.getAllNotes("user-1")).resolves.toEqual([]);

    vi.mocked(database.remove).mockRejectedValueOnce(new Error("offline"));
    await expect(service.deleteNote("note-1", "user-1")).rejects.toThrow("offline");
  });
});
