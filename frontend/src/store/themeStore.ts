import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  oscuro: boolean;
  alternar: () => void;
}

const prefiereOscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      oscuro: prefiereOscuro,
      alternar: () => set((state) => ({ oscuro: !state.oscuro })),
    }),
    { name: "food-store-tema" },
  ),
);

const aplicarTema = (oscuro: boolean) => {
  document.documentElement.classList.toggle("dark", oscuro);
};

aplicarTema(useThemeStore.getState().oscuro);
useThemeStore.subscribe((state) => aplicarTema(state.oscuro));
