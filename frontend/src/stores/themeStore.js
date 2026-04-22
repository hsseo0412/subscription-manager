import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const systemTheme =
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'

const useThemeStore = create(
  persist(
    (set) => ({
      theme: systemTheme,
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    { name: 'theme-storage' },
  ),
)

export default useThemeStore
