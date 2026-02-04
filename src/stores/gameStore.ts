import { create } from 'zustand'
import type { TimeOfDay, CatState, CatAction } from '../types'

export interface FallenItem {
  id: string
  position: [number, number, number]
  type: 'cup' | 'vase' | 'book'
  createdAt: number
}

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

  // Fallen items
  fallenItems: FallenItem[]
  addFallenItem: (item: FallenItem) => void
  clearFallenItems: () => void

  // UI
  showUI: boolean
  toggleUI: () => void
}

// 힐링 분위기 - 대부분 휴식 중인 상태로 시작
const initialCats: CatState[] = [
  {
    id: 'cat-1',
    name: '나비',
    position: [-3.5, 0.6, -3],  // 소파 위
    rotation: Math.PI / 4,
    action: 'sleeping',         // 자고 있음
    targetPosition: null,
    targetFurniture: 'sofa1',
    onFurniture: true,
    knockingOff: false,
    happiness: 85,
    color: '#F4A460',
    pattern: 'tabby',
    eyeColor: '#7CB342',
  },
  {
    id: 'cat-2',
    name: '우유',
    position: [4.5, 2.1, -3.5],  // 캣타워 꼭대기
    rotation: -Math.PI / 3,
    action: 'sitting',           // 앉아서 내려다봄
    targetPosition: null,
    targetFurniture: 'cattree-top',
    onFurniture: true,
    knockingOff: false,
    happiness: 90,
    color: '#FAFAFA',
    pattern: 'solid',
    eyeColor: '#42A5F5',
  },
  {
    id: 'cat-3',
    name: '까망',
    position: [-1, 0.1, 3],      // 고양이 침대
    rotation: Math.PI / 6,
    action: 'sleeping',          // 웅크리고 자는 중
    targetPosition: null,
    targetFurniture: 'bed1',
    onFurniture: true,
    knockingOff: false,
    happiness: 95,
    color: '#2D2D2D',
    pattern: 'solid',
    eyeColor: '#FFD54F',
  },
  {
    id: 'cat-4',
    name: '삼색이',
    position: [3.5, 0.6, 2],     // 다른 소파
    rotation: -Math.PI / 2,
    action: 'idle',              // 멍때리는 중
    targetPosition: null,
    targetFurniture: 'sofa2',
    onFurniture: true,
    knockingOff: false,
    happiness: 80,
    color: '#FFE4C4',
    pattern: 'calico',
    eyeColor: '#81C784',
  },
  {
    id: 'cat-5',
    name: '양말',
    position: [3, 0.1, -1],      // 고양이 침대2
    rotation: Math.PI / 3,
    action: 'sleeping',          // 자는 중
    targetPosition: null,
    targetFurniture: 'bed2',
    onFurniture: true,
    knockingOff: false,
    happiness: 88,
    color: '#A0A0A0',
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

  // Fallen items
  fallenItems: [],
  addFallenItem: (item) => set((state) => ({
    fallenItems: [...state.fallenItems, item].slice(-10) // 최대 10개만 유지
  })),
  clearFallenItems: () => set({ fallenItems: [] }),

  // UI
  showUI: true,
  toggleUI: () => set((state) => ({ showUI: !state.showUI })),
}))
