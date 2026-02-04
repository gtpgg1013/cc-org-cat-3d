import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { CatState, CatAction } from '../../types'
import { useCatBehavior } from '../../hooks/useCatBehavior'
import { useGameStore } from '../../stores/gameStore'

// ============================================
// Easing Functions - 자연스러운 움직임의 핵심
// ============================================
const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const easeOutQuad = (t: number): number => {
  return 1 - (1 - t) * (1 - t)
}

const easeInQuad = (t: number): number => {
  return t * t
}

// ============================================
// Cat Body Component - 귀여운 고양이 모델
// ============================================
interface CatBodyProps {
  color: string
  pattern: 'solid' | 'tabby' | 'bicolor' | 'calico'
  eyeColor: string
  action: CatAction
  isHappy: boolean
  moveProgress: number // 0-1 이동 진행도
}

function CatBody({ color, pattern, eyeColor, action, isHappy, moveProgress }: CatBodyProps) {
  const tailRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Group>(null)
  const leftEarRef = useRef<THREE.Group>(null)
  const rightEarRef = useRef<THREE.Group>(null)
  const frontLeftLegRef = useRef<THREE.Mesh>(null)
  const frontRightLegRef = useRef<THREE.Mesh>(null)
  const backLeftLegRef = useRef<THREE.Mesh>(null)
  const backRightLegRef = useRef<THREE.Mesh>(null)

  const isSleeping = action === 'sleeping'
  const isSitting = action === 'sitting' || isSleeping
  const isWalking = action === 'walking'
  const isPlaying = action === 'playing'

  // 랜덤 오프셋 (각 고양이마다 다른 타이밍)
  const offsets = useMemo(() => ({
    blink: Math.random() * 10,
    ear: Math.random() * 5,
    head: Math.random() * 3,
    tail: Math.random() * 2,
    breath: Math.random() * Math.PI,
  }), [])

  const [isBlinking, setIsBlinking] = useState(false)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // === 꼬리 애니메이션 ===
    if (tailRef.current) {
      if (isHappy || isPlaying) {
        // 행복할 때 - 빠르게 흔들기
        tailRef.current.rotation.x = Math.sin(time * 8) * 0.5 + 0.7
        tailRef.current.rotation.z = Math.sin(time * 6) * 0.4
      } else if (isWalking) {
        // 걸을 때 - 균형 맞추듯
        tailRef.current.rotation.x = 0.5
        tailRef.current.rotation.z = Math.sin(time * 4 + offsets.tail) * 0.25
      } else if (isSleeping) {
        // 잘 때 - 거의 안 움직임
        tailRef.current.rotation.x = 0.2
        tailRef.current.rotation.z = Math.sin(time * 0.3) * 0.05
      } else {
        // idle - 느긋하게
        tailRef.current.rotation.x = Math.sin(time * 1.5 + offsets.tail) * 0.15 + 0.6
        tailRef.current.rotation.z = Math.sin(time * 1) * 0.1
      }
    }

    // === 숨쉬기 애니메이션 ===
    if (bodyRef.current) {
      const breatheSpeed = isSleeping ? 0.8 : 2
      const breatheAmount = isSleeping ? 0.025 : 0.012
      const breath = Math.sin(time * breatheSpeed + offsets.breath)
      bodyRef.current.scale.y = 1 + breath * breatheAmount
      bodyRef.current.scale.x = 1 + breath * breatheAmount * 0.5
    }

    // === 머리 움직임 ===
    if (headRef.current) {
      if (isPlaying) {
        headRef.current.rotation.y = Math.sin(time * 3) * 0.25
        headRef.current.rotation.z = Math.sin(time * 2.5) * 0.1
      } else if (isWalking) {
        // 걸을 때 살짝 까딱
        headRef.current.rotation.x = Math.sin(time * 8) * 0.02
      } else if (isSitting && !isSleeping) {
        // 앉아서 주변 관찰
        headRef.current.rotation.y = Math.sin(time * 0.4 + offsets.head) * 0.35
      } else if (!isSleeping) {
        // idle - 가끔 주변 보기
        headRef.current.rotation.y = Math.sin(time * 0.6 + offsets.head) * 0.2
      }
    }

    // === 귀 움직임 ===
    if (leftEarRef.current && rightEarRef.current && !isSleeping) {
      // 가끔 귀 쫑긋
      const earTwitch = Math.sin(time * 6 + offsets.ear) > 0.97 ? 0.15 : 0
      leftEarRef.current.rotation.z = -0.2 + earTwitch
      rightEarRef.current.rotation.z = 0.2 - earTwitch
    }

    // === 눈 깜빡임 ===
    if (!isSleeping && Math.sin(time * 0.4 + offsets.blink) > 0.985 && !isBlinking) {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 120)
    }

    // === 다리 애니메이션 ===
    if (isWalking && moveProgress > 0) {
      const walkCycle = time * 10
      const walkAmount = 0.35
      if (frontLeftLegRef.current) frontLeftLegRef.current.rotation.x = Math.sin(walkCycle) * walkAmount
      if (frontRightLegRef.current) frontRightLegRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * walkAmount
      if (backLeftLegRef.current) backLeftLegRef.current.rotation.x = Math.sin(walkCycle + Math.PI) * walkAmount
      if (backRightLegRef.current) backRightLegRef.current.rotation.x = Math.sin(walkCycle) * walkAmount
    } else {
      // 부드럽게 원위치
      [frontLeftLegRef, frontRightLegRef, backLeftLegRef, backRightLegRef].forEach(ref => {
        if (ref.current) {
          ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, 0, 0.1)
        }
      })
    }
  })

  const bodyY = isSitting ? 0.13 : 0.2
  const headY = isSitting ? 0.08 : 0.14

  return (
    <group>
      {/* Body */}
      <group ref={bodyRef} position={[0, bodyY, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshToonMaterial color={color} />
        </mesh>
        <mesh castShadow position={[0, -0.02, 0.02]}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshToonMaterial color={color} />
        </mesh>
        {pattern === 'bicolor' && (
          <mesh position={[0, -0.04, 0.07]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshToonMaterial color="#FFFFFF" />
          </mesh>
        )}
        {pattern === 'calico' && (
          <>
            <mesh position={[0.09, 0.04, 0.09]}>
              <sphereGeometry args={[0.055, 8, 8]} />
              <meshToonMaterial color="#F4A460" />
            </mesh>
            <mesh position={[-0.07, 0, 0.1]}>
              <sphereGeometry args={[0.045, 8, 8]} />
              <meshToonMaterial color="#2D2D2D" />
            </mesh>
          </>
        )}
      </group>

      {/* Head */}
      <group ref={headRef} position={[0, bodyY + headY, 0.13]}>
        <mesh castShadow>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshToonMaterial color={color} />
        </mesh>

        {/* 볼 */}
        <mesh position={[-0.07, -0.02, 0.06]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshToonMaterial color={color} />
        </mesh>
        <mesh position={[0.07, -0.02, 0.06]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshToonMaterial color={color} />
        </mesh>

        {/* 귀 */}
        <group ref={leftEarRef} position={[-0.07, 0.1, 0]} rotation={[0, 0, -0.2]}>
          <mesh castShadow>
            <coneGeometry args={[0.04, 0.08, 4]} />
            <meshToonMaterial color={color} />
          </mesh>
          <mesh position={[0.007, -0.01, 0.012]}>
            <coneGeometry args={[0.018, 0.045, 4]} />
            <meshToonMaterial color="#FFB6C1" />
          </mesh>
        </group>
        <group ref={rightEarRef} position={[0.07, 0.1, 0]} rotation={[0, 0, 0.2]}>
          <mesh castShadow>
            <coneGeometry args={[0.04, 0.08, 4]} />
            <meshToonMaterial color={color} />
          </mesh>
          <mesh position={[-0.007, -0.01, 0.012]}>
            <coneGeometry args={[0.018, 0.045, 4]} />
            <meshToonMaterial color="#FFB6C1" />
          </mesh>
        </group>

        {/* 눈 */}
        {!isSleeping && !isBlinking ? (
          <>
            <group position={[-0.04, 0.01, 0.1]}>
              <mesh>
                <sphereGeometry args={[0.022, 12, 12]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              <mesh position={[0, 0, 0.01]}>
                <sphereGeometry args={[0.016, 12, 12]} />
                <meshBasicMaterial color={eyeColor} />
              </mesh>
              <mesh position={[0, 0, 0.018]}>
                <sphereGeometry args={[0.009, 8, 8]} />
                <meshBasicMaterial color="#1a1a1a" />
              </mesh>
              <mesh position={[0.005, 0.006, 0.021]}>
                <sphereGeometry args={[0.004, 6, 6]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            </group>
            <group position={[0.04, 0.01, 0.1]}>
              <mesh>
                <sphereGeometry args={[0.022, 12, 12]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              <mesh position={[0, 0, 0.01]}>
                <sphereGeometry args={[0.016, 12, 12]} />
                <meshBasicMaterial color={eyeColor} />
              </mesh>
              <mesh position={[0, 0, 0.018]}>
                <sphereGeometry args={[0.009, 8, 8]} />
                <meshBasicMaterial color="#1a1a1a" />
              </mesh>
              <mesh position={[-0.005, 0.006, 0.021]}>
                <sphereGeometry args={[0.004, 6, 6]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            </group>
          </>
        ) : (
          // 감은 눈 (잠자거나 깜빡임)
          <>
            <mesh position={[-0.04, 0.01, 0.11]} rotation={[0, 0, 0.2]}>
              <torusGeometry args={[0.015, 0.005, 8, 12, Math.PI]} />
              <meshBasicMaterial color="#2d2d2d" />
            </mesh>
            <mesh position={[0.04, 0.01, 0.11]} rotation={[0, 0, -0.2]} scale={[-1, 1, 1]}>
              <torusGeometry args={[0.015, 0.005, 8, 12, Math.PI]} />
              <meshBasicMaterial color="#2d2d2d" />
            </mesh>
          </>
        )}

        {/* 코 */}
        <mesh position={[0, -0.02, 0.12]}>
          <sphereGeometry args={[0.016, 8, 8]} />
          <meshToonMaterial color="#FF91A4" />
        </mesh>

        {/* 입 */}
        <mesh position={[0, -0.04, 0.1]} rotation={[0.2, 0, 0]}>
          <torusGeometry args={[0.01, 0.003, 8, 12, Math.PI]} />
          <meshBasicMaterial color="#FF91A4" />
        </mesh>

        {/* 수염 */}
        {[[-1, -0.15], [-1, 0], [-1, 0.15], [1, -0.15], [1, 0], [1, 0.15]].map(([side, angle], i) => (
          <mesh key={i} position={[side * 0.06, -0.012, 0.09]} rotation={[angle * 0.25, 0, side * 0.12]}>
            <cylinderGeometry args={[0.0015, 0.001, 0.05, 4]} />
            <meshBasicMaterial color="#888888" />
          </mesh>
        ))}
      </group>

      {/* 다리 */}
      {!isSitting ? (
        <>
          <mesh ref={frontLeftLegRef} castShadow position={[-0.06, 0.06, 0.08]}>
            <capsuleGeometry args={[0.03, 0.06, 4, 8]} />
            <meshToonMaterial color={pattern === 'bicolor' ? '#FFFFFF' : color} />
          </mesh>
          <mesh ref={frontRightLegRef} castShadow position={[0.06, 0.06, 0.08]}>
            <capsuleGeometry args={[0.03, 0.06, 4, 8]} />
            <meshToonMaterial color={pattern === 'bicolor' ? '#FFFFFF' : color} />
          </mesh>
          <mesh ref={backLeftLegRef} castShadow position={[-0.06, 0.06, -0.06]}>
            <capsuleGeometry args={[0.033, 0.06, 4, 8]} />
            <meshToonMaterial color={color} />
          </mesh>
          <mesh ref={backRightLegRef} castShadow position={[0.06, 0.06, -0.06]}>
            <capsuleGeometry args={[0.033, 0.06, 4, 8]} />
            <meshToonMaterial color={color} />
          </mesh>
          {/* 발 */}
          <mesh position={[-0.06, 0.012, 0.09]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshToonMaterial color={pattern === 'bicolor' ? '#FFFFFF' : color} />
          </mesh>
          <mesh position={[0.06, 0.012, 0.09]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshToonMaterial color={pattern === 'bicolor' ? '#FFFFFF' : color} />
          </mesh>
          <mesh position={[-0.06, 0.012, -0.06]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshToonMaterial color={color} />
          </mesh>
          <mesh position={[0.06, 0.012, -0.06]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshToonMaterial color={color} />
          </mesh>
        </>
      ) : (
        // 앉은 자세 다리
        <>
          <mesh castShadow position={[-0.045, 0.035, 0.08]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshToonMaterial color={pattern === 'bicolor' ? '#FFFFFF' : color} />
          </mesh>
          <mesh castShadow position={[0.045, 0.035, 0.08]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshToonMaterial color={pattern === 'bicolor' ? '#FFFFFF' : color} />
          </mesh>
          <mesh castShadow position={[-0.09, 0.06, -0.01]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshToonMaterial color={color} />
          </mesh>
          <mesh castShadow position={[0.09, 0.06, -0.01]}>
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshToonMaterial color={color} />
          </mesh>
        </>
      )}

      {/* 꼬리 */}
      <group ref={tailRef} position={[0, bodyY - 0.02, -0.14]} rotation={[0.6, 0, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.025, 0.14, 4, 8]} />
          <meshToonMaterial color={color} />
        </mesh>
        <mesh castShadow position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshToonMaterial color={pattern === 'tabby' ? '#8B4513' : color} />
        </mesh>
      </group>
    </group>
  )
}

// ============================================
// Heart Particle Effect
// ============================================
function Heart({ startPosition }: { startPosition: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null)
  const [opacity, setOpacity] = useState(1)
  const startTime = useRef(Date.now())
  const randomOffset = useMemo(() => ({
    x: (Math.random() - 0.5) * 0.2,
    rotSpeed: 0.5 + Math.random() * 0.5,
  }), [])

  useFrame(() => {
    if (!ref.current) return
    const elapsed = (Date.now() - startTime.current) / 1000
    const progress = Math.min(elapsed / 1.8, 1)
    const easedProgress = easeOutQuad(progress)

    ref.current.position.y = startPosition.y + easedProgress * 1.0
    ref.current.position.x = startPosition.x + Math.sin(easedProgress * Math.PI * 2) * 0.1 + randomOffset.x
    ref.current.scale.setScalar((1 - progress * 0.3) * (0.8 + Math.sin(progress * 8) * 0.15))
    ref.current.rotation.z = progress * Math.PI * randomOffset.rotSpeed

    setOpacity(1 - easeInQuad(progress))
  })

  if (opacity <= 0) return null

  return (
    <mesh ref={ref} position={[startPosition.x, startPosition.y, startPosition.z]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#FF69B4" transparent opacity={opacity} />
    </mesh>
  )
}

// ============================================
// Main Cat Component
// ============================================
interface CatProps {
  catData: CatState
}

export function Cat({ catData }: CatProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { id, position, action, targetPosition, onFurniture, knockingOff, color, pattern, eyeColor } = catData

  const updateCat = useGameStore((state) => state.updateCat)
  const petCat = useGameStore((state) => state.petCat)
  const selectCat = useGameStore((state) => state.selectCat)
  const addFallenItem = useGameStore((state) => state.addFallenItem)

  const [hearts, setHearts] = useState<THREE.Vector3[]>([])
  const [isHappy, setIsHappy] = useState(false)

  // 이동 상태 추적
  const moveState = useRef({
    startPos: new THREE.Vector3(),
    startY: 0,
    progress: 0,
    isJumping: false,
    hasKnocked: false,
  })

  useCatBehavior(id)

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    petCat(id)
    selectCat(id)
    setIsHappy(true)
    setTimeout(() => setIsHappy(false), 4000)

    if (groupRef.current) {
      const basePos = groupRef.current.position.clone()
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          const pos = basePos.clone()
          pos.y += 0.35
          pos.x += (Math.random() - 0.5) * 0.15
          setHearts((prev) => [...prev, pos])
        }, i * 120)
      }
      setTimeout(() => setHearts([]), 2500)
    }
  }

  useFrame((_, delta) => {
    if (!groupRef.current) return

    const current = groupRef.current.position
    const ms = moveState.current

    if (action === 'walking' && targetPosition) {
      const tx = targetPosition[0]
      const ty = targetPosition[1]
      const tz = targetPosition[2]

      // 새로운 이동 시작
      if (ms.progress === 0 || ms.startPos.distanceTo(new THREE.Vector3(tx, ty, tz)) > 0.1) {
        ms.startPos.copy(current)
        ms.startY = current.y
        ms.progress = 0
        ms.isJumping = ty > 0.15 || ms.startY > 0.15
        ms.hasKnocked = false
      }

      const dx = tx - ms.startPos.x
      const dz = tz - ms.startPos.z
      const totalDist = Math.sqrt(dx * dx + dz * dz)

      if (totalDist > 0.1) {
        // 이동 속도 계산
        const speed = (action === 'playing' ? 2.5 : 1.2) * delta / totalDist
        ms.progress = Math.min(ms.progress + speed, 1)

        // Easing 적용
        const easedProgress = easeInOutCubic(ms.progress)

        // XZ 이동
        current.x = ms.startPos.x + dx * easedProgress
        current.z = ms.startPos.z + dz * easedProgress

        // Y 이동 (점프 또는 걷기)
        if (ms.isJumping) {
          // 포물선 점프
          const jumpHeight = Math.max(ty, ms.startY) + 0.3
          const parabola = 4 * easedProgress * (1 - easedProgress) // 0→1→0
          const linearY = ms.startY + (ty - ms.startY) * easedProgress
          current.y = linearY + parabola * jumpHeight * 0.5
        } else {
          // 걷기 바운스
          const bounce = Math.sin(ms.progress * Math.PI * 6) * 0.01
          current.y = Math.max(0, ty) + bounce
        }

        // 방향 전환 (부드럽게)
        const targetRotation = Math.atan2(dx, dz)
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          targetRotation,
          0.08
        )

        // 도착
        if (ms.progress >= 1) {
          current.x = tx
          current.y = ty
          current.z = tz

          // 테이블에서 물건 떨어뜨리기
          if (knockingOff && !ms.hasKnocked) {
            ms.hasKnocked = true
            const itemTypes: ('cup' | 'vase' | 'book')[] = ['cup', 'vase', 'book']
            addFallenItem({
              id: `fallen-${Date.now()}-${Math.random()}`,
              position: [
                current.x + (Math.random() - 0.5) * 0.4,
                0.05,
                current.z + (Math.random() - 0.5) * 0.4
              ],
              type: itemTypes[Math.floor(Math.random() * itemTypes.length)],
              createdAt: Date.now()
            })
          }

          ms.progress = 0
          updateCat(id, {
            action: 'idle',
            targetPosition: null,
            knockingOff: false,
            position: [tx, ty, tz]
          })
        }
      }
    } else if (action === 'playing' && targetPosition) {
      // 놀기 - 빠르게 움직임
      const tx = targetPosition[0]
      const tz = targetPosition[2]
      const dx = tx - current.x
      const dz = tz - current.z
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist > 0.15) {
        const speed = 2.5 * delta
        current.x += (dx / dist) * speed
        current.z += (dz / dist) * speed
        current.y = Math.abs(Math.sin(Date.now() * 0.015)) * 0.03

        const targetRotation = Math.atan2(dx, dz)
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, 0.15)
      } else {
        updateCat(id, { action: 'idle', targetPosition: null })
      }
    } else {
      // 정지 상태 - 부드럽게 안정화
      const baseY = onFurniture ? position[1] : 0
      current.y = THREE.MathUtils.lerp(current.y, baseY, 0.03)
      ms.progress = 0
    }
  })

  return (
    <>
      <group
        ref={groupRef}
        position={position}
        name={`cat-${id}`}
        onClick={handleClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <CatBody
          color={color}
          pattern={pattern}
          eyeColor={eyeColor}
          action={action}
          isHappy={isHappy}
          moveProgress={moveState.current.progress}
        />
      </group>
      {hearts.map((pos, i) => (
        <Heart key={`${id}-heart-${i}-${pos.x}`} startPosition={pos} />
      ))}
    </>
  )
}
