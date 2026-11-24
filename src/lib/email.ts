import emailjs from '@emailjs/browser';

// =====================================
// CONFIGURAÇÃO DO EMAILJS (VIA .env)
// =====================================
// Configure as variáveis opcionais no arquivo .env:
//   VITE_EMAILJS_SERVICE_ID=
//   VITE_EMAILJS_TEMPLATE_ID=
//   VITE_EMAILJS_PUBLIC_KEY=
//
// Template sugerido para EmailJS:
// Subject: Convite para acessar {{clinic_name}} - NeuroDose Assist
// Body:
//   Olá!
//
//   {{sender_name}} convidou você para participar da clínica "{{clinic_name}}"
//   como {{role}} no sistema NeuroDose Assist.
//
//   Para aceitar o convite, acesse o link abaixo:
//   {{invite_link}}
//
//   Atenciosamente,
//   Equipe NeuroDose Assist
// =====================================

interface EmailJsConfig {
    serviceId: string;
    templateId: string;
    publicKey: string;
}

let initializedPublicKey: string | null = null;

function getEmailJsConfig(): EmailJsConfig {
    return {
        serviceId: (import.meta.env.VITE_EMAILJS_SERVICE_ID || '').trim(),
        templateId: (import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '').trim(),
        publicKey: (import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '').trim(),
    };
}

/**
 * Indica se as credenciais do EmailJS estão definidas nas variáveis de ambiente.
 */
export function isEmailJsConfigured(): boolean {
    const { serviceId, templateId, publicKey } = getEmailJsConfig();
    return Boolean(serviceId && templateId && publicKey);
}

export interface InviteEmailParams {
    toEmail: string;
    clinicName: string;
    senderName: string;
    role: string;
    inviteLink: string;
}

/**
 * Envia um email de convite para a clínica.
 * Retorna false de forma graciosa quando o EmailJS não está configurado,
 * permitindo que a interface ofereça a cópia manual do link de convite.
 */
export async function sendInviteEmail(params: InviteEmailParams): Promise<boolean> {
    const { toEmail, clinicName, senderName, role, inviteLink } = params;
    const { serviceId, templateId, publicKey } = getEmailJsConfig();

    if (!serviceId || !templateId || !publicKey) {
        console.warn(
            '[Email] Credenciais do EmailJS não configuradas (VITE_EMAILJS_*). Use o link manual de convite.'
        );
        return false;
    }

    try {
        if (initializedPublicKey !== publicKey) {
            emailjs.init(publicKey);
            initializedPublicKey = publicKey;
        }

        const templateParams = {
            to_email: toEmail,
            clinic_name: clinicName,
            sender_name: senderName,
            role: getRoleLabel(role),
            invite_link: inviteLink,
        };

        await emailjs.send(serviceId, templateId, templateParams);
        return true;
    } catch (error) {
        console.error('[Email] Erro ao enviar convite:', error);
        return false;
    }
}

/**
 * Converte a role para label em português
 */
function getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
        owner: 'Proprietário',
        admin: 'Administrador',
        member: 'Membro',
    };
    return labels[role] || role;
}

/**
 * Gera o link de convite para o email
 */
export function generateInviteLink(inviteId: string, clinicId: string): string {
    // Usa a URL atual para gerar o link
    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://neurodose.vercel.app';

    return `${baseUrl}/clinic?invite=${inviteId}&clinic=${clinicId}`;
}
