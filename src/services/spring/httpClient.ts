type TokenResolver = () => Promise<string | null>;

let customTokenResolver: TokenResolver | null = null;

export function setSpringTokenResolver(resolver: TokenResolver | null): void {
  customTokenResolver = resolver;
}

export class SpringApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = "api/error") {
    super(message);
    this.name = "SpringApiError";
    this.status = status;
    this.code = code;
  }
}

function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL;
  if (typeof configured === "string" && configured.trim().length > 0) {
    return configured.trim().replace(/\/+$/, "");
  }
  return "/api/v1";
}

async function resolveBearerToken(): Promise<string | null> {
  if (customTokenResolver) {
    return customTokenResolver();
  }
  const { auth } = await import("@/lib/firebase");
  const currentUser = auth?.currentUser;
  if (!currentUser || typeof currentUser.getIdToken !== "function") {
    return null;
  }
  return currentUser.getIdToken();
}

export async function springRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined>;
    skipAuth?: boolean;
  } = {}
): Promise<T> {
  const baseUrl = resolveApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const searchParams = new URLSearchParams();

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null && String(value) !== "") {
        searchParams.set(key, String(value));
      }
    }
  }

  const queryString = searchParams.toString();
  const url = `${baseUrl}${normalizedPath}${queryString ? `?${queryString}` : ""}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (!options.skipAuth) {
    const token = await resolveBearerToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  const parsed = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      (parsed && typeof parsed.message === "string" && parsed.message) ||
      `Erro na comunicação com o servidor (${response.status})`;
    const code =
      (parsed && typeof parsed.code === "string" && parsed.code) || "api/error";
    throw new SpringApiError(message, response.status, code);
  }

  return parsed as T;
}
