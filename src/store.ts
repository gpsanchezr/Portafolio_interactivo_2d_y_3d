import { create } from 'zustand'

export type Section = 'about'|'skills'|'services'|'projects'|'contact'|null
export type Weather  = 'day'|'night'|'sakura'|'rain'
export type CameraMode = 'firstPerson'|'thirdPerson'|'panoramic'
export type AppMode = 'world3d'|'rpg2d'

interface Store {
  loadingProgress: number
  setLoadingProgress: (n: number) => void
  isLoaded: boolean
  setIsLoaded: (b: boolean) => void
  introComplete: boolean
  setIntroComplete: (b: boolean) => void

  activePanel: string | null
  setActivePanel: (id: string | null) => void
  currentSection: Section
  setCurrentSection: (s: Section) => void

  audioEnabled: boolean
  toggleAudio: () => void

  weather: Weather
  setWeather: (w: Weather) => void

  cameraMode: CameraMode
  setCameraMode: (m: CameraMode) => void

  appMode: AppMode
  setAppMode: (m: AppMode) => void

  minimapVisible: boolean
  toggleMinimap: () => void
  minimapExpanded: boolean
  setMinimapExpanded: (b: boolean) => void

  playerPos: [number, number, number]
  setPlayerPos: (p: [number, number, number]) => void

  // Teleport: click on minimap zone → teleport character there
  teleportTarget: [number, number, number] | null
  setTeleportTarget: (p: [number, number, number] | null) => void

  achievements: string[]
  unlockAchievement: (id: string) => void

  isMobile: boolean
}

export const useStore = create<Store>((set, get) => ({
  loadingProgress: 0,
  setLoadingProgress: n => set({ loadingProgress: n }),
  isLoaded: false,
  setIsLoaded: b => set({ isLoaded: b }),
  introComplete: false,
  setIntroComplete: b => set({ introComplete: b }),

  activePanel: null,
  setActivePanel: id => set({ activePanel: id }),
  currentSection: null,
  setCurrentSection: s => set({ currentSection: s }),

  audioEnabled: false,
  toggleAudio: () => set(s => ({ audioEnabled: !s.audioEnabled })),

  weather: 'sakura',
  setWeather: w => set({ weather: w }),

  cameraMode: 'thirdPerson',
  setCameraMode: m => set({ cameraMode: m }),

  appMode: 'world3d',
  setAppMode: m => set({ appMode: m }),

  minimapVisible: true,
  toggleMinimap: () => set(s => ({ minimapVisible: !s.minimapVisible })),
  minimapExpanded: false,
  setMinimapExpanded: b => set({ minimapExpanded: b }),

  playerPos: [0, 5, 5],
  setPlayerPos: p => set({ playerPos: p }),

  teleportTarget: null,
  setTeleportTarget: p => set({ teleportTarget: p }),

  achievements: [],
  unlockAchievement: id => {
    const { achievements } = get()
    if (!achievements.includes(id)) set({ achievements: [...achievements, id] })
  },

  isMobile: /iPhone|iPad|Android/i.test(navigator.userAgent),
}))

// Legacy alias
export const useWorldStore = useStore
