import { useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import type { CatAction } from '../types'

// 가구 위치들 (인터랙션 포인트)
const FURNITURE_SPOTS = [
  { position: [-3.5, 0, -3] as [number, number, number], type: 'sofa', actions: ['sitting', 'sleeping'] },
  { position: [3.5, 0, 2] as [number, number, number], type: 'sofa', actions: ['sitting', 'sleeping'] },
  { position: [4.5, 0, -3.5] as [number, number, number], type: 'catTree', actions: ['sitting', 'playing'] },
  { position: [-1, 0, 3] as [number, number, number], type: 'bed', actions: ['sleeping', 'sitting'] },
  { position: [3, 0, -1] as [number, number, number], type: 'bed', actions: ['sleeping'] },
  { position: [0, 0, 4] as [number, number, number], type: 'window', actions: ['sitting', 'idle'] },
  { position: [5.5, 0, 1.5] as [number, number, number], type: 'window', actions: ['sitting', 'idle'] },
  { position: [0, 0, 0] as [number, number, number], type: 'table', actions: ['sitting', 'playing'] },
  { position: [-2, 0, -3] as [number, number, number], type: 'table', actions: ['idle'] },
]

// 랜덤 배회 포인트
const WANDER_POINTS: [number, number, number][] = [
  [0, 0, 0], [1, 0, 1], [-1, 0, 1], [2, 0, -2], [-2, 0, -1],
  [1, 0, -1], [-1, 0, 2], [3, 0, 1], [-3, 0, 0], [0, 0, -2],
]

// 더 짧은 시간으로 자주 움직이게
const ACTION_DURATIONS: Record<CatAction, [number, number]> = {
  idle: [1500, 3000],      // 1.5~3초
  walking: [2000, 4000],   // 2~4초
  sitting: [3000, 6000],   // 3~6초
  sleeping: [5000, 10000], // 5~10초
  playing: [1500, 3000],   // 1.5~3초
}

// 다음 행동 확률 (더 활발하게)
const NEXT_ACTIONS: Record<CatAction, { action: CatAction; weight: number }[]> = {
  idle: [
    { action: 'walking', weight: 50 },
    { action: 'playing', weight: 20 },
    { action: 'sitting', weight: 20 },
    { action: 'idle', weight: 10 },
  ],
  walking: [
    { action: 'idle', weight: 30 },
    { action: 'sitting', weight: 30 },
    { action: 'playing', weight: 20 },
    { action: 'walking', weight: 20 },
  ],
  sitting: [
    { action: 'walking', weight: 40 },
    { action: 'idle', weight: 25 },
    { action: 'sleeping', weight: 20 },
    { action: 'playing', weight: 15 },
  ],
  sleeping: [
    { action: 'idle', weight: 40 },
    { action: 'sitting', weight: 40 },
    { action: 'walking', weight: 20 },
  ],
  playing: [
    { action: 'walking', weight: 40 },
    { action: 'idle', weight: 30 },
    { action: 'playing', weight: 20 },
    { action: 'sitting', weight: 10 },
  ],
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function weightedRandom<T>(items: { action: T; weight: number }[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  let random = Math.random() * totalWeight

  for (const item of items) {
    random -= item.weight
    if (random <= 0) return item.action
  }

  return items[0].action
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomWanderPoint(): [number, number, number] {
  const base = pickRandom(WANDER_POINTS)
  return [
    base[0] + randomInRange(-0.5, 0.5),
    0,
    base[2] + randomInRange(-0.5, 0.5),
  ]
}

function getNearbyFurniture(currentPos: [number, number, number]): typeof FURNITURE_SPOTS[0] | null {
  // 50% 확률로 가구로 이동
  if (Math.random() > 0.5) return null

  const validSpots = FURNITURE_SPOTS.filter(spot => {
    const dx = spot.position[0] - currentPos[0]
    const dz = spot.position[2] - currentPos[2]
    const dist = Math.sqrt(dx * dx + dz * dz)
    return dist > 0.5 // 너무 가까운 곳 제외
  })

  return validSpots.length > 0 ? pickRandom(validSpots) : null
}

export function useCatBehavior(catId: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const runBehavior = () => {
      if (!mountedRef.current) return

      const state = useGameStore.getState()
      const cat = state.cats.find((c) => c.id === catId)
      if (!cat) return

      // 가중치 기반으로 다음 행동 선택
      const possibleActions = NEXT_ACTIONS[cat.action]
      const nextAction = weightedRandom(possibleActions)

      const updates: Partial<typeof cat> = { action: nextAction }

      if (nextAction === 'walking') {
        // 가구로 갈지 랜덤하게 배회할지
        const furniture = getNearbyFurniture(cat.position)

        if (furniture) {
          // 가구 근처로 이동
          updates.targetPosition = [
            furniture.position[0] + randomInRange(-0.3, 0.3),
            0,
            furniture.position[2] + randomInRange(-0.3, 0.3),
          ]
          updates.targetFurniture = furniture.type
        } else {
          // 랜덤 배회
          updates.targetPosition = getRandomWanderPoint()
          updates.targetFurniture = null
        }
      } else {
        updates.targetPosition = null
      }

      state.updateCat(catId, updates)

      // 다음 행동까지 시간
      const duration = ACTION_DURATIONS[nextAction]
      const timeout = randomInRange(duration[0], duration[1])

      timerRef.current = setTimeout(runBehavior, timeout)
    }

    // 각 고양이마다 다른 시작 딜레이
    const initialDelay = randomInRange(500, 2000)
    timerRef.current = setTimeout(runBehavior, initialDelay)

    return () => {
      mountedRef.current = false
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [catId])
}
