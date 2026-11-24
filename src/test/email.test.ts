import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import emailjs from "@emailjs/browser";
import {
  isEmailJsConfigured,
  sendInviteEmail,
  generateInviteLink,
} from "@/lib/email";

vi.mock("@emailjs/browser", () => ({
  default: {
    init: vi.fn(),
    send: vi.fn(),
  },
}));

describe("Serviço de E-mail de Convites (EmailJS via .env)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("retorna false sem inicializar nem enviar quando variáveis de ambiente estão ausentes", async () => {
    vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "");
    vi.stubEnv("VITE_EMAILJS_TEMPLATE_ID", "");
    vi.stubEnv("VITE_EMAILJS_PUBLIC_KEY", "");

    expect(isEmailJsConfigured()).toBe(false);

    const sent = await sendInviteEmail({
      toEmail: "medica@clinica.com",
      clinicName: "Clínica Neuro",
      senderName: "Dr. Carlos",
      role: "admin",
      inviteLink: "https://app.test/clinic?invite=1&clinic=2",
    });

    expect(sent).toBe(false);
    expect(emailjs.init).not.toHaveBeenCalled();
    expect(emailjs.send).not.toHaveBeenCalled();
  });

  it("retorna false quando a configuração está incompleta", async () => {
    vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "svc_123");
    vi.stubEnv("VITE_EMAILJS_TEMPLATE_ID", "tpl_456");
    vi.stubEnv("VITE_EMAILJS_PUBLIC_KEY", "   ");

    expect(isEmailJsConfigured()).toBe(false);

    const sent = await sendInviteEmail({
      toEmail: "medica@clinica.com",
      clinicName: "Clínica Neuro",
      senderName: "Dr. Carlos",
      role: "member",
      inviteLink: "https://app.test/clinic?invite=1&clinic=2",
    });

    expect(sent).toBe(false);
    expect(emailjs.send).not.toHaveBeenCalled();
  });

  it("inicializa e envia e-mail usando exclusivamente as credenciais do ambiente", async () => {
    vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "svc_env_1");
    vi.stubEnv("VITE_EMAILJS_TEMPLATE_ID", "tpl_env_2");
    vi.stubEnv("VITE_EMAILJS_PUBLIC_KEY", "pub_env_3");
    vi.mocked(emailjs.send).mockResolvedValueOnce({ status: 200, text: "OK" });

    expect(isEmailJsConfigured()).toBe(true);

    const sent = await sendInviteEmail({
      toEmail: "colega@clinica.com",
      clinicName: "Instituto Central",
      senderName: "Dra. Helena",
      role: "admin",
      inviteLink: "https://app.test/clinic?invite=abc&clinic=xyz",
    });

    expect(sent).toBe(true);
    expect(emailjs.init).toHaveBeenCalledWith("pub_env_3");
    expect(emailjs.send).toHaveBeenCalledWith("svc_env_1", "tpl_env_2", {
      to_email: "colega@clinica.com",
      clinic_name: "Instituto Central",
      sender_name: "Dra. Helena",
      role: "Administrador",
      invite_link: "https://app.test/clinic?invite=abc&clinic=xyz",
    });
  });

  it("retorna false graciosamente se o EmailJS falhar no envio", async () => {
    vi.stubEnv("VITE_EMAILJS_SERVICE_ID", "svc_env_1");
    vi.stubEnv("VITE_EMAILJS_TEMPLATE_ID", "tpl_env_2");
    vi.stubEnv("VITE_EMAILJS_PUBLIC_KEY", "pub_env_4");
    vi.mocked(emailjs.send).mockRejectedValueOnce(new Error("EmailJS down"));

    const sent = await sendInviteEmail({
      toEmail: "colega@clinica.com",
      clinicName: "Instituto Central",
      senderName: "Dra. Helena",
      role: "member",
      inviteLink: "https://app.test/clinic?invite=abc&clinic=xyz",
    });

    expect(sent).toBe(false);
  });

  it("gera o link de convite com os parâmetros invite e clinic", () => {
    const link = generateInviteLink("inv-1", "cli-2");
    expect(link).toContain("/clinic?invite=inv-1&clinic=cli-2");
  });
});
