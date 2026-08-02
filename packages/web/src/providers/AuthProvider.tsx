import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiClient } from "../lib/api-client";
import { isAppRole, type AppRole } from "../lib/auth/roles";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AppRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(input: unknown): AuthUser {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid auth user payload");
  }

  const candidate = input as Record<string, unknown>;
  const { id, email, name, role } = candidate;

  if (
    typeof id !== "string" ||
    typeof email !== "string" ||
    typeof name !== "string" ||
    typeof role !== "string"
  ) {
    throw new Error("Invalid auth user payload");
  }

  if (!isAppRole(role)) {
    throw new Error(`Unsupported role: ${role}`);
  }

  return { id, email, name, role };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount — access token cookie is sent automatically
  useEffect(() => {
    apiClient
      .get<{ data: unknown }>("/auth/me")
      .then(({ data }) => setUser(toAuthUser(data.data)))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string): Promise<AuthUser> {
    const { data } = await apiClient.post<{
      data: { user: unknown };
    }>("/auth/login", { email, password });
    const user = toAuthUser(data.data.user);
    setUser(user);
    return user;
  }

  async function register(
    email: string,
    password: string,
    name: string,
  ): Promise<void> {
    await apiClient.post("/auth/register", { email, password, name });
  }

  async function logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      setUser(null);
    }
  }

  function updateUser(partial: Partial<AuthUser>) {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuthContext must be used within <AuthProvider>");
  return ctx;
}
