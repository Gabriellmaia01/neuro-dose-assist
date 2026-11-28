import type { AuthUser, IAuthService } from "@/services/contracts";
import { setSpringTokenResolver } from "@/services/spring/httpClient";

interface StoredSandboxAccount {
  uid: string;
  email: string;
  password: string;
  displayName: string;
}

const USERS_KEY = "nd_sandbox_accounts_v1";
const SESSION_KEY = "nd_sandbox_session_v1";

let currentToken: string | null = null;
const listeners = new Set<(user: AuthUser | null) => void>();

function readAccounts(): Record<string, StoredSandboxAccount> {
  try {
    const raw = sessionStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAccounts(accounts: Record<string, StoredSandboxAccount>): void {
  sessionStorage.setItem(USERS_KEY, JSON.stringify(accounts));
}

function readSession(): { user: AuthUser; token: string } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(session: { user: AuthUser; token: string } | null): void {
  if (!session) {
    currentToken = null;
    sessionStorage.removeItem(SESSION_KEY);
    return;
  }
  currentToken = session.token;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function notifyAll(user: AuthUser | null): void {
  for (const cb of listeners) {
    cb(user);
  }
}

function makeAuthError(code: string, message: string): Error & { code: string } {
  const err = new Error(message) as Error & { code: string };
  err.code = code;
  return err;
}

async function mintSandboxJwt(user: AuthUser): Promise<string> {
  const configuredBase = import.meta.env.VITE_API_BASE_URL;
  const baseUrl =
    typeof configuredBase === "string" && configuredBase.trim().length > 0
      ? configuredBase.trim().replace(/\/+$/, "")
      : "/api/v1";
  const res = await fetch(`${baseUrl}/sandbox/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      uid: user.uid,
      email: user.email ?? "sandbox@neurodose.local",
      name: user.displayName ?? "Profissional Sandbox",
    }),
  });
  if (!res.ok) {
    throw makeAuthError("auth/network-request-failed", "Servidor Sandbox indisponível.");
  }
  const data = (await res.json()) as { token: string };
  return data.token;
}

const isSandboxActive =
  String(import.meta.env.VITE_SANDBOX_MODE || "").trim().toLowerCase() === "true";

if (isSandboxActive) {
  setSpringTokenResolver(async () => {
    if (currentToken) return currentToken;
    const existing = readSession();
    if (existing?.token) {
      currentToken = existing.token;
      return currentToken;
    }
    return null;
  });
}

export const sandboxAuthService: IAuthService = {
  async signUpWithEmail(email: string, password: string): Promise<AuthUser> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      throw makeAuthError("auth/invalid-email", "Email inválido.");
    }
    if (!password || password.length < 6) {
      throw makeAuthError("auth/weak-password", "A senha deve ter pelo menos 6 caracteres.");
    }

    const accounts = readAccounts();
    if (accounts[cleanEmail]) {
      throw makeAuthError("auth/email-already-in-use", "Este email já está em uso.");
    }

    const uid = `sandbox_${cleanEmail.replace(/[^a-z0-9]/g, "_").slice(0, 28)}`;
    const localPart = cleanEmail.split("@")[0].replace(/[._-]+/g, " ");
    const displayName = localPart.replace(/\b\w/g, (c) => c.toUpperCase());

    accounts[cleanEmail] = { uid, email: cleanEmail, password, displayName };
    writeAccounts(accounts);

    const user: AuthUser = { uid, email: cleanEmail, displayName, photoURL: null };
    const token = await mintSandboxJwt(user);
    writeSession({ user, token });
    notifyAll(user);
    return user;
  },

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes("@")) {
      throw makeAuthError("auth/invalid-email", "Email inválido.");
    }

    const accounts = readAccounts();
    const acc = accounts[cleanEmail];
    if (!acc) {
      throw makeAuthError("auth/user-not-found", "Usuário não encontrado.");
    }
    if (acc.password !== password) {
      throw makeAuthError("auth/wrong-password", "Senha incorreta.");
    }

    const user: AuthUser = {
      uid: acc.uid,
      email: acc.email,
      displayName: acc.displayName,
      photoURL: null,
    };
    const token = await mintSandboxJwt(user);
    writeSession({ user, token });
    notifyAll(user);
    return user;
  },

  async signInWithGoogle(): Promise<AuthUser> {
    const user: AuthUser = {
      uid: "sandbox_google_clinician",
      email: "helena.google.sandbox@neurodose.local",
      displayName: "Dra. Helena Vasconcelos",
      photoURL: null,
    };
    const token = await mintSandboxJwt(user);
    writeSession({ user, token });
    notifyAll(user);
    return user;
  },

  async signOut(): Promise<void> {
    writeSession(null);
    notifyAll(null);
  },

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const session = readSession();
    if (!session?.user.email) {
      throw makeAuthError("auth/requires-recent-login", "Usuário não autenticado.");
    }
    if (!newPassword || newPassword.length < 6) {
      throw makeAuthError("auth/weak-password", "A nova senha deve ter pelo menos 6 caracteres.");
    }
    const accounts = readAccounts();
    const acc = accounts[session.user.email];
    if (acc && acc.password !== currentPassword) {
      throw makeAuthError("auth/wrong-password", "Senha atual incorreta.");
    }
    if (acc) {
      acc.password = newPassword;
      writeAccounts(accounts);
    }
  },

  async sendPasswordReset(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      throw makeAuthError("auth/invalid-email", "Email inválido.");
    }
    // No-op seguro no Sandbox: não dispara e-mails externos.
  },

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    listeners.add(callback);
    const existing = readSession();
    if (existing) {
      currentToken = existing.token;
      queueMicrotask(() => callback(existing.user));
    } else {
      queueMicrotask(() => callback(null));
    }
    return () => {
      listeners.delete(callback);
    };
  },

  getCurrentUser(): AuthUser | null {
    return readSession()?.user ?? null;
  },
};
