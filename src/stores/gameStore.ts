import { create } from 'zustand'
import type { TimeOfDay, CatState, CatAction } from '../types'

interface GameState {
  // Time
  timeOfDay: TimeOfDay
  timeSpeed: number
  currentHour: number
  setTimeOfDay: (time: TimeOfDay) => void
  setCurrentHour: (hour: number) => void

  // Cats
  cats: CatState[]
  selectedCatId: string | null
  addCat: (cat: CatState) => void
  updateCat: (id: string, updates: Partial<CatState>) => void
  selectCat: (id: string | null) => void
  petCat: (id: string) => void

  // UI
  showUI: boolean
  toggleUI: () => void
}

const initialCats: CatState[] = [
  {
    id: 'cat-1',
    name: '나비',
    position: [0, 0, 0],
    rotation: 0,
    action: 'idle',
    targetPosition: null,
    targetFurniture: null,
    happiness: 80,
    color: '#F4A460', // 오렌지 치즈태비
    pattern: 'tabby',
    eyeColor: '#7CB342',
  },
  {
    id: 'cat-2',
    name: '우유',
    position: [2, 0, -1],
    rotation: Math.PI / 4,
    action: 'sitting',
    targetPosition: null,
    targetFurniture: null,
    happiness: 90,
    color: '#FAFAFA', // 하얀 고양이
    pattern: 'solid',
    eyeColor: '#42A5F5',
  },
  {
    id: 'cat-3',
    name: '까망',
    position: [-2, 0, 1],
    rotation: -Math.PI / 3,
    action: 'sleeping',
    targetPosition: null,
    targetFurniture: null,
    happiness: 70,
    color: '#2D2D2D', // 검은 고양이
    pattern: 'solid',
    eyeColor: '#FFD54F',
  },
  {
    id: 'cat-4',
    name: '삼색이',
    position: [-1, 0, -2],
    rotation: Math.PI / 6,
    action: 'playing',
    targetPosition: null,
    targetFurniture: null,
    happiness: 95,
    color: '#FFE4C4', // 삼색이 베이스
    pattern: 'calico',
    eyeColor: '#81C784',
  },
  {
    id: 'cat-5',
    name: '양말',
    position: [3, 0, 1],
    rotation: -Math.PI / 4,
    action: 'idle',
    targetPosition: null,
    targetFurniture: null,
    happiness: 85,
    color: '#A0A0A0', // 회색 턱시도
    pattern: 'bicolor',
    eyeColor: '#4FC3F7',
  },
]

export const useGameStore = create<GameState>((set) => ({
  // Time
  timeOfDay: 'noon',
  timeSpeed: 1,
  currentHour: 12,
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  setCurrentHour: (hour) => set({ currentHour: hour }),

  // Cats
  cats: initialCats,
  selectedCatId: null,
  addCat: (cat) => set((state) => ({ cats: [...state.cats, cat] })),
  updateCat: (id, updates) =>
    set((state) => ({
      cats: state.cats.map((cat) =>
        cat.id === id ? { ...cat, ...updates } : cat
      ),
    })),
  selectCat: (id) => set({ selectedCatId: id }),
  petCat: (id) =>
    set((state) => ({
      cats: state.cats.map((cat) =>
        cat.id === id
          ? { ...cat, happiness: Math.min(100, cat.happiness + 10), action: 'playing' as CatAction }
          : cat
      ),
    })),

  // UI
  showUI: true,
  toggleUI: () => set((state) => ({ showUI: !state.showUI })),
}))
