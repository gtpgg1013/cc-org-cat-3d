import { useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import type { CatAction } from '../types'

// 가구 스팟 - 고양이가 앉을 수 있는 곳
interface FurnitureSpot {
  id: string
  position: [number, number, number]
  actions: CatAction[]
  canKnockOff?: boolean
}

const FURNITURE_SPOTS: FurnitureSpot[] = [
  // 소파
  { id: 'sofa1', position: [-3.5, 0.6, -3], actions: ['sitting', 'sleeping'] },
  { id: 'sofa2', position: [3.5, 0.6, 2], actions: ['sitting', 'sleeping'] },
  // 캣타워
  { id: 'cattree1', position: [4.5, 1.3, -3.5], actions: ['sitting', 'playing'] },
  { id: 'cattree2', position: [4.5, 2.1, -3.5], actions: ['sitting', 'idle'] },
  // 고양이 침대
  { id: 'bed1', position: [-1, 0.1, 3], actions: ['sleeping', 'sitting'] },
  { id: 'bed2', position: [3, 0.1, -1], actions: ['sleeping'] },
  // 테이블 (물건 떨어뜨림)
  { id: 'table1', position: [0, 0.55, 0], actions: ['sitting'], canKnockOff: true },
  { id: 'table2', position: [-2, 0.55, -3], actions: ['idle'], canKnockOff: true },
  { id: 'table3', position: [2, 0.55, 2], actions: ['sitting'], canKnockOff: true },
]

// 바닥에서 안전하게 걸을 수 있는 포인트들 (가구 사이 빈 공간)
const FLOOR_WAYPOINTS: [number, number, number][] = [
  // 중앙 영역
  [0, 0, 1.5],
  [0, 0, -1.5],
  [1.5, 0, 0],
  [-1.5, 0, 0],
  // 왼쪽 영역
  [-2.5, 0, 1],
  [-2.5, 0, -1],
  [-1, 0, -1.5],
  // 오른쪽 영역
  [2.5, 0, -0.5],
  [2.5, 0, 0.5],
  [1, 0, 3],
  // 가장자리
  [-3, 0, 2],
  [3, 0, -2],
  [0, 0, 3.5],
]

const ACTION_DURATIONS: Record<CatAction, [number, number]> = {
  idle: [2000, 4000],
  walking: [2000, 5000],
  sitting: [4000, 8000],
  sleeping: [6000, 12000],
  playing: [2000, 4000],
}

const BEHAVIOR_WEIGHTS: Record<CatAction, { action: CatAction; weight: number }[]> = {
  idle: [
    { action: 'walking', weight: 60 },
    { action: 'sitting', weight: 25 },
    { action: 'playing', weight: 15 },
  ],
  walking: [
    { action: 'idle', weight: 30 },
    { action: 'sitting', weight: 40 },
    { action: 'walking', weight: 30 },
  ],
  sitting: [
    { action: 'walking', weight: 50 },
    { action: 'sleeping', weight: 30 },
    { action: 'idle', weight: 20 },
  ],
  sleeping: [
    { action: 'sitting', weight: 50 },
    { action: 'idle', weight: 30 },
    { action: 'walking', weight: 20 },
  ],
  playing: [
    { action: 'walking', weight: 40 },
    { action: 'idle', weight: 40 },
    { action: 'playing', weight: 20 },
  ],
}

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function pickWeighted<T>(items: { action: T; weight: number }[]): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0)
  let r = Math.random() * total
  for (const item of items) {
    r -= item.weight
    if (r <= 0) return item.action
  }
  return items[0].action
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function distance(a: [number, number, number], b: [number, number, number]): number {
  const dx = a[0] - b[0]
  const dz = a[2] - b[2]
  return Math.sqrt(dx * dx + dz * dz)
}

export function useCatBehavior(catId: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const tick = () => {
      if (!mountedRef.current) return

      const state = useGameStore.getState()
      const cat = state.cats.find(c => c.id === catId)
      if (!cat) return

      // 다음 행동 결정
      const nextAction = pickWeighted(BEHAVIOR_WEIGHTS[cat.action])
      const updates: Partial<typeof cat> = { action: nextAction }

      if (nextAction === 'walking') {
        // 50% 바닥 이동, 50% 가구로 점프
        const goToFurniture = Math.random() < 0.5

        if (goToFurniture) {
          // 현재 위치에서 먼 가구 선택
          const validSpots = FURNITURE_SPOTS.filter(s =>
            distance(cat.position, s.position) > 1.5
          )

          if (validSpots.length > 0) {
            const spot = pickRandom(validSpots)
            updates.targetPosition = [...spot.position] as [number, number, number]
            updates.targetFurniture = spot.id
            updates.onFurniture = true

            if (spot.canKnockOff && Math.random() < 0.3) {
              updates.knockingOff = true
            }
          } else {
            // 갈 곳 없으면 바닥
            const point = pickRandom(FLOOR_WAYPOINTS)
            updates.targetPosition = [point[0] + randomRange(-0.2, 0.2), 0, point[2] + randomRange(-0.2, 0.2)]
            updates.targetFurniture = null
            updates.onFurniture = false
          }
        } else {
          // 바닥 이동 - 가까운 waypoint 중 하나 선택
          const nearPoints = FLOOR_WAYPOINTS
            .map(p => ({ point: p, dist: distance(cat.position, p) }))
            .filter(p => p.dist > 0.5 && p.dist < 4)
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 5)

          if (nearPoints.length > 0) {
            const chosen = pickRandom(nearPoints).point
            updates.targetPosition = [chosen[0] + randomRange(-0.2, 0.2), 0, chosen[2] + randomRange(-0.2, 0.2)]
          } else {
            updates.targetPosition = [cat.position[0] + randomRange(-1, 1), 0, cat.position[2] + randomRange(-1, 1)]
          }
          updates.targetFurniture = null
          updates.onFurniture = false
        }
      } else {
        updates.targetPosition = null
        updates.knockingOff = false
      }

      state.updateCat(catId, updates)

      // 다음 틱 예약
      const [min, max] = ACTION_DURATIONS[nextAction]
      timerRef.current = setTimeout(tick, randomRange(min, max))
    }

    // 시작
    timerRef.current = setTimeout(tick, randomRange(500, 2000))

    return () => {
      mountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [catId])
}
