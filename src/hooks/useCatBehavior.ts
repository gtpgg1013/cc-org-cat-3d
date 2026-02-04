import { useEffect, useRef } from 'react'
import { useGameStore } from '../stores/gameStore'
import type { CatAction } from '../types'

/**
 * 진짜 고양이처럼 행동하는 AI 시스템
 *
 * 실제 고양이 관찰 기반:
 * - 하루 16시간 수면 (67%)
 * - 그루밍 15%
 * - 휴식/관찰 13%
 * - 활동 5%
 */

// 가구 위치 - 고양이가 좋아하는 스팟
const FAVORITE_SPOTS = [
  // 높은 곳 (고양이가 좋아함)
  { id: 'cattree-top', pos: [4.5, 2.1, -3.5] as const, comfort: 0.95 },
  { id: 'cattree-mid', pos: [4.5, 1.3, -3.5] as const, comfort: 0.9 },
  // 푹신한 곳
  { id: 'sofa1', pos: [-3.5, 0.6, -3] as const, comfort: 0.85 },
  { id: 'sofa2', pos: [3.5, 0.6, 2] as const, comfort: 0.85 },
  // 침대
  { id: 'bed1', pos: [-1, 0.1, 3] as const, comfort: 0.9 },
  { id: 'bed2', pos: [3, 0.1, -1] as const, comfort: 0.9 },
  // 테이블 (장난치기 좋음)
  { id: 'table1', pos: [0, 0.55, 0] as const, comfort: 0.5, mischief: true },
  { id: 'table2', pos: [-2, 0.55, -3] as const, comfort: 0.5, mischief: true },
]

// 바닥 순찰 포인트
const PATROL_POINTS = [
  [0, 0, 1.5], [0, 0, -1.5], [1.5, 0, 0], [-1.5, 0, 0],
  [-2.5, 0, 1], [2.5, 0, -0.5], [1, 0, 3], [-3, 0, 2],
] as const

// 진짜 고양이 같은 행동 가중치
const BEHAVIOR_MATRIX: Record<CatAction, Record<CatAction, number>> = {
  sleeping: {
    sleeping: 70,    // 계속 자기
    idle: 20,        // 일어나서 멍때리기
    sitting: 8,      // 앉기
    walking: 1,      // 드물게 이동
    playing: 1,      // 아주 드물게 놀기
  },
  idle: {
    sleeping: 30,    // 다시 잠들기
    idle: 35,        // 계속 멍
    sitting: 20,     // 앉기
    walking: 10,     // 이동
    playing: 5,      // 놀기
  },
  sitting: {
    sleeping: 40,    // 앉다가 잠들기
    idle: 25,        // 멍때리기
    sitting: 20,     // 계속 앉아있기
    walking: 10,     // 이동
    playing: 5,      // 놀기
  },
  walking: {
    sleeping: 5,     // 걷다가 잠들진 않음
    idle: 30,        // 멈춰서 멍
    sitting: 35,     // 앉기
    walking: 20,     // 계속 걷기
    playing: 10,     // 놀기
  },
  playing: {
    sleeping: 5,     // 놀다가 지쳐서 잠
    idle: 20,        // 멈추기
    sitting: 15,     // 앉기
    walking: 30,     // 뛰어다니기
    playing: 30,     // 계속 놀기
  },
}

// 행동별 지속 시간 (ms) - 더 현실적으로
const DURATIONS: Record<CatAction, [number, number]> = {
  sleeping: [8000, 20000],  // 오래 잠
  idle: [3000, 8000],       // 멍때리기
  sitting: [4000, 10000],   // 앉아있기
  walking: [2000, 4000],    // 짧게 이동
  playing: [2000, 5000],    // 놀기
}

function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function pickWeighted(weights: Record<CatAction, number>): CatAction {
  const entries = Object.entries(weights) as [CatAction, number][]
  const total = entries.reduce((sum, [, w]) => sum + w, 0)
  let r = Math.random() * total
  for (const [action, weight] of entries) {
    r -= weight
    if (r <= 0) return action
  }
  return 'idle'
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function distance2D(a: readonly number[], b: readonly number[]): number {
  const dx = a[0] - b[0]
  const dz = a[2] - b[2]
  return Math.sqrt(dx * dx + dz * dz)
}

export function useCatBehavior(catId: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const decide = () => {
      if (!mountedRef.current) return

      const state = useGameStore.getState()
      const cat = state.cats.find(c => c.id === catId)
      if (!cat) return

      // 다음 행동 결정 (현재 행동 기반 마르코프 체인)
      const weights = BEHAVIOR_MATRIX[cat.action]
      const nextAction = pickWeighted(weights)

      const updates: Partial<typeof cat> = { action: nextAction }

      if (nextAction === 'walking') {
        // 어디로 갈지 결정
        const goToFurniture = Math.random() < 0.6

        if (goToFurniture) {
          // comfort가 높은 스팟 선호
          const validSpots = FAVORITE_SPOTS.filter(s =>
            distance2D(cat.position, s.pos) > 1.5
          )

          if (validSpots.length > 0) {
            // comfort 가중치로 선택
            const totalComfort = validSpots.reduce((sum, s) => sum + s.comfort, 0)
            let r = Math.random() * totalComfort
            let spot = validSpots[0]
            for (const s of validSpots) {
              r -= s.comfort
              if (r <= 0) { spot = s; break }
            }

            updates.targetPosition = [...spot.pos] as [number, number, number]
            updates.targetFurniture = spot.id
            updates.onFurniture = true

            // 테이블이면 장난칠 수도
            if ('mischief' in spot && spot.mischief && Math.random() < 0.25) {
              updates.knockingOff = true
            }
          } else {
            // 바닥 순찰
            const point = pickRandom(PATROL_POINTS)
            updates.targetPosition = [point[0], 0, point[2]]
            updates.targetFurniture = null
            updates.onFurniture = false
          }
        } else {
          // 바닥 순찰 - 가까운 포인트로
          const nearPoints = PATROL_POINTS.filter(p =>
            distance2D(cat.position, p) > 0.8 && distance2D(cat.position, p) < 3
          )
          const point = nearPoints.length > 0 ? pickRandom(nearPoints) : pickRandom(PATROL_POINTS)
          updates.targetPosition = [point[0] + randomRange(-0.2, 0.2), 0, point[2] + randomRange(-0.2, 0.2)]
          updates.targetFurniture = null
          updates.onFurniture = false
        }
      } else if (nextAction === 'playing') {
        // 놀 때는 근처에서 뛰어다님
        updates.targetPosition = [
          cat.position[0] + randomRange(-1, 1),
          0,
          cat.position[2] + randomRange(-1, 1)
        ]
        updates.targetFurniture = null
        updates.onFurniture = false
      } else {
        // 휴식 계열 행동
        updates.targetPosition = null
        updates.knockingOff = false
      }

      state.updateCat(catId, updates)

      // 다음 결정 시간
      const [min, max] = DURATIONS[nextAction]
      const delay = randomRange(min, max)
      timerRef.current = setTimeout(decide, delay)
    }

    // 초기 딜레이 (각 고양이마다 다르게)
    timerRef.current = setTimeout(decide, randomRange(1000, 3000))

    return () => {
      mountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [catId])
}
