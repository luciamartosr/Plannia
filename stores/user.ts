import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  nickname: string;
  phone: string;
  city: string;
  notifEmail: boolean;
  notifWhatsapp: boolean;
  notifApp: boolean;
  createdAt: string;
}

export interface MockAccount {
  id: string;
  email: string;
  password: string;
  profile: UserProfile;
}

interface UserStore {
  session: UserProfile | null;
  accounts: MockAccount[];
  register: (fullName: string, email: string, password: string) => { ok: boolean; error?: string };
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  setNickname: (nickname: string) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      session: null,
      accounts: [],

      register(fullName, email, password) {
        const existing = get().accounts.find(
          (a) => a.email.toLowerCase() === email.toLowerCase()
        );
        if (existing) {
          return { ok: false, error: "Este correo ya está registrado." };
        }
        const id = `user-${Date.now()}`;
        const nickname = fullName.split(" ")[0];
        const profile: UserProfile = {
          id,
          fullName,
          email,
          nickname,
          phone: "",
          city: "",
          notifEmail: true,
          notifWhatsapp: false,
          notifApp: true,
          createdAt: new Date().toISOString(),
        };
        const account: MockAccount = { id, email, password, profile };
        set((s) => ({
          accounts: [...s.accounts, account],
          session: profile,
        }));
        return { ok: true };
      },

      login(email, password) {
        const account = get().accounts.find(
          (a) =>
            a.email.toLowerCase() === email.toLowerCase() &&
            a.password === password
        );
        if (!account) {
          return { ok: false, error: "Correo o contraseña incorrectos." };
        }
        set({ session: account.profile });
        return { ok: true };
      },

      logout() {
        set({ session: null });
      },

      setNickname(nickname) {
        const session = get().session;
        if (!session) return;
        const updated = { ...session, nickname };
        set((s) => ({
          session: updated,
          accounts: s.accounts.map((a) =>
            a.id === session.id ? { ...a, profile: updated } : a
          ),
        }));
      },

      updateProfile(patch) {
        const session = get().session;
        if (!session) return;
        const updated = { ...session, ...patch };
        set((s) => ({
          session: updated,
          accounts: s.accounts.map((a) =>
            a.id === session.id ? { ...a, profile: updated } : a
          ),
        }));
      },
    }),
    { name: "plannia-user" }
  )
);
