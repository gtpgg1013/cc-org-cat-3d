import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { CatState, CatAction } from '../../types'
import { useCatBehavior } from '../../hooks/useCatBehavior'
import { useGameStore } from '../../stores/gameStore'

interface CatBodyProps {
  color: string
  pattern: 'solid' | 'tabby' | 'bicolor' | 'calico'
  eyeColor: string
  action: CatAction
  isHappy: boolean
}

function CatBody({ color, pattern, eyeColor, action, isHappy }: CatBodyProps) {
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

  // 패턴에 따른 색상
  const patternColors = useMemo(() => {
    switch (pattern) {
      case 'tabby':
        return { secondary: '#8B4513', spots: true }
      case 'bicolor':
        return { secondary: '#FFFFFF', spots: false }
      case 'calico':
        return { secondary: '#F4A460', tertiary: '#2D2D2D', spots: true }
      default:
        return { secondary: color, spots: false }
    }
  }, [pattern, color])

  const offsets = useMemo(() => ({
    blink: Math.random() * 10,
    ear: Math.random() * 5,
    head: Math.random() * 3,
    idle: Math.random() * 2,
  }), [])

  const [isBlinking, setIsBlinking] = useState(false)

  useFrame((state) => {
    const time = state.clock.elapsedTime

    // === TAIL ANIMATION ===
    if (tailRef.current) {
      if (isHappy || isPlaying) {
        tailRef.current.rotation.x = Math.sin(time * 12) * 0.6 + 0.8
        tailRef.current.rotation.z = Math.sin(time * 8) * 0.4
      } else if (isWalking) {
        tailRef.current.rotation.x = 0.6
        tailRef.current.rotation.z = Math.sin(time * 6) * 0.3
      } else if (isSleeping) {
        tailRef.current.rotation.x = 0.3
        tailRef.current.rotation.z = Math.sin(time * 0.5) * 0.1
      } else {
        tailRef.current.rotation.x = Math.sin(time * 2 + offsets.idle) * 0.2 + 0.7
        tailRef.current.rotation.z = Math.sin(time * 1.5) * 0.15
      }
    }

    // === BODY BREATHING ===
    if (bodyRef.current) {
      const breatheSpeed = isSleeping ? 1 : 2.5
      const breatheAmount = isSleeping ? 0.03 : 0.015
      bodyRef.current.scale.y = Math.sin(time * breatheSpeed) * breatheAmount + 1
      bodyRef.current.scale.x = Math.sin(time * breatheSpeed + Math.PI) * (breatheAmount * 0.5) + 1
    }

    // === HEAD MOVEMENT ===
    if (headRef.current) {
      if (isPlaying) {
        headRef.current.rotation.y = Math.sin(time * 4) * 0.3
        headRef.current.rotation.z = Math.sin(time * 3) * 0.15
        headRef.current.rotation.x = Math.sin(time * 5) * 0.1
      } else if (isWalking) {
        headRef.current.rotation.y = Math.sin(time * 3) * 0.05
        headRef.current.rotation.x = Math.sin(time * 6) * 0.02
      } else if (isSitting && !isSleeping) {
        headRef.current.rotation.y = Math.sin(time * 0.5 + offsets.head) * 0.4
        headRef.current.rotation.z = Math.sin(time * 0.3) * 0.05
      } else if (!isSleeping) {
        headRef.current.rotation.y = Math.sin(time * 0.8 + offsets.head) * 0.2
        headRef.current.rotation.z = Math.sin(time * 0.4) * 0.1
      }
    }

    // === EAR TWITCHING ===
    if (leftEarRef.current && rightEarRef.current && !isSleeping) {
      const earTwitch = Math.sin(time * 8 + offsets.ear) > 0.95 ? 0.2 : 0
      leftEarRef.current.rotation.z = -0.2 + earTwitch
      rightEarRef.current.rotation.z = 0.2 - earTwitch
      if (Math.sin(time * 2 + offsets.ear) > 0.8) {
        leftEarRef.current.rotation.x = Math.sin(time * 10) * 0.15
      }
    }

    // === EYE BLINKING ===
    if (!isSleeping && Math.sin(time * 0.5 + offsets.blink) > 0.98 && !isBlinking) {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }

    // === LEG ANIMATION ===
    if (isWalking) {
      // 다리 움직임 속도를 실제 이동과 맞춤 (15 = useFrame의 바운스 속도)
      const walkSpeed = 15
      const walkAmount = 0.4
      if (frontLeftLegRef.current) frontLeftLegRef.current.rotation.x = Math.sin(time * walkSpeed) * walkAmount
      if (frontRightLegRef.current) frontRightLegRef.current.rotation.x = Math.sin(time * walkSpeed + Math.PI) * walkAmount
      if (backLeftLegRef.current) backLeftLegRef.current.rotation.x = Math.sin(time * walkSpeed + Math.PI) * walkAmount
      if (backRightLegRef.current) backRightLegRef.current.rotation.x = Math.sin(time * walkSpeed) * walkAmount
    } else {
      [frontLeftLegRef, frontRightLegRef, backLeftLegRef, backRightLegRef].forEach(ref => {
        if (ref.current) ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, 0, 0.15)
      })
    }
  })

  const bodyY = isSitting ? 0.15 : 0.22
  const headY = isSitting ? 0.1 : 0.16

  return (
    <group>
      {/* Body */}
      <group ref={bodyRef} position={[0, bodyY, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.17, 16, 16]} />
          <meshToonMaterial color={color} />
        </mesh>
        <mesh castShadow position={[0, -0.02, 0.02]}>
          <sphereGeometry args={[0.14, 12, 12]} />
          <meshToonMaterial color={color} />
        </mesh>
        {/* 무늬 (bicolor - 배 하얀색) */}
        {pattern === 'bicolor' && (
          <mesh position={[0, -0.05, 0.08]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshToonMaterial color="#FFFFFF" />
          </mesh>
        )}
        {/* 삼색이 점 */}
        {pattern === 'calico' && (
          <>
            <mesh position={[0.1, 0.05, 0.1]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshToonMaterial color="#F4A460" />
            </mesh>
            <mesh position={[-0.08, 0, 0.12]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshToonMaterial color="#2D2D2D" />
            </mesh>
          </>
        )}
      </group>

      {/* Head */}
      <group ref={headRef} position={[0, bodyY + headY, 0.14]}>
        <mesh castShadow>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshToonMaterial color={color} />
        </mesh>

        {/* 볼 */}
        <mesh position={[-0.08, -0.02, 0.07]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshToonMaterial color={color} />
        </mesh>
        <mesh position={[0.08, -0.02, 0.07]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshToonMaterial color={color} />
        </mesh>

        {/* 삼색이/태비 얼굴 무늬 */}
        {pattern === 'calico' && (
          <mesh position={[0.06, 0.03, 0.11]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshToonMaterial color="#F4A460" />
          </mesh>
        )}
        {pattern === 'tabby' && (
          <mesh position={[0, 0.08, 0.1]}>
            <boxGeometry args={[0.02, 0.04, 0.02]} />
            <meshToonMaterial color={patternColors.secondary} />
          </mesh>
        )}

        {/* Ears */}
        <group ref={leftEarRef} position={[-0.08, 0.11, 0]} rotation={[0, 0, -0.2]}>
          <mesh castShadow>
            <coneGeometry args={[0.045, 0.09, 4]} />
            <meshToonMaterial color={color} />
          </mesh>
          <mesh position={[0.008, -0.01, 0.015]}>
            <coneGeometry args={[0.02, 0.05, 4]} />
            <meshToonMaterial color="#FFB6C1" />
          </mesh>
        </group>
        <group ref={rightEarRef} position={[0.08, 0.11, 0]} rotation={[0, 0, 0.2]}>
          <mesh castShadow>
            <coneGeometry args={[0.045, 0.09, 4]} />
            <meshToonMaterial color={color} />
          </mesh>
          <mesh position={[-0.008, -0.01, 0.015]}>
            <coneGeometry args={[0.02, 0.05, 4]} />
            <meshToonMaterial color="#FFB6C1" />
          </mesh>
        </group>

        {/* Eyes - 더 작고 귀엽게 */}
        {!isSleeping && !isBlinking ? (
          <>
            <group position={[-0.045, 0.015, 0.11]}>
              <mesh>
                <sphereGeometry args={[0.025, 12, 12]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              <mesh position={[0, 0, 0.012]}>
                <sphereGeometry args={[0.018, 12, 12]} />
                <meshBasicMaterial color={eyeColor} />
              </mesh>
              <mesh position={[0, 0, 0.02]}>
                <sphereGeometry args={[0.01, 8, 8]} />
                <meshBasicMaterial color="#1a1a1a" />
              </mesh>
              <mesh position={[0.006, 0.008, 0.024]}>
                <sphereGeometry args={[0.005, 6, 6]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            </group>
            <group position={[0.045, 0.015, 0.11]}>
              <mesh>
                <sphereGeometry args={[0.025, 12, 12]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              <mesh position={[0, 0, 0.012]}>
                <sphereGeometry args={[0.018, 12, 12]} />
                <meshBasicMaterial color={eyeColor} />
              </mesh>
              <mesh position={[0, 0, 0.02]}>
                <sphereGeometry args={[0.01, 8, 8]} />
                <meshBasicMaterial color="#1a1a1a" />
              </mesh>
              <mesh position={[-0.006, 0.008, 0.024]}>
                <sphereGeometry args={[0.005, 6, 6]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            </group>
          </>
        ) : (
          <>
            <mesh position={[-0.045, 0.015, 0.12]} rotation={[0, 0, 0.3]}>
              <torusGeometry args={[0.018, 0.006, 8, 12, Math.PI]} />
              <meshBasicMaterial color="#2d2d2d" />
            </mesh>
            <mesh position={[0.045, 0.015, 0.12]} rotation={[0, 0, -0.3]} scale={[-1, 1, 1]}>
              <torusGeometry args={[0.018, 0.006, 8, 12, Math.PI]} />
              <meshBasicMaterial color="#2d2d2d" />
            </mesh>
          </>
        )}

        {/* Nose */}
        <mesh position={[0, -0.025, 0.13]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshToonMaterial color="#FF91A4" />
        </mesh>

        {/* Mouth */}
        <mesh position={[0, -0.045, 0.11]} rotation={[0.2, 0, 0]}>
          <torusGeometry args={[0.012, 0.004, 8, 12, Math.PI]} />
          <meshBasicMaterial color="#FF91A4" />
        </mesh>

        {/* Whiskers */}
        {[[-1, -0.2], [-1, 0], [-1, 0.2], [1, -0.2], [1, 0], [1, 0.2]].map(([side, angle], i) => (
          <mesh key={i} position={[side * 0.065, -0.015, 0.1]} rotation={[angle * 0.3, 0, side * 0.15]}>
            <cylinderGeometry args={[0.002, 0.001, 0.06, 4]} />
            <meshBasicMaterial color="#888888" />
          </mesh>
        ))}
      </group>

      {/* Legs */}
      {!isSitting ? (
        <>
          <mesh ref={frontLeftLegRef} castShadow position={[-0.07, 0.07, 0.09]}>
            <capsuleGeometry args={[0.035, 0.07, 4, 8]} />
            <meshToonMaterial color={pattern === 'bicolor' ? '#FFFFFF' : color} />
          </mesh>
          <mesh ref={frontRightLegRef} castShadow position={[0.07, 0.07, 0.09]}>
            <capsuleGeometry args={[0.035, 0.07, 4, 8]} />
            <meshToonMaterial color={pattern === 'bicolor' ? '#FFFFFF' : color} />
          </mesh>
          <mesh ref={backLeftLegRef} castShadow position={[-0.07, 0.07, -0.07]}>
            <capsuleGeometry args={[0.038, 0.07, 4, 8]} />
            <meshToonMaterial color={color} />
          </mesh>
          <mesh ref={backRightLegRef} castShadow position={[0.07, 0.07, -0.07]}>
            <capsuleGeometry args={[0.038, 0.07, 4, 8]} />
            <meshToonMaterial color={color} />
          </mesh>
          {/* 발 */}
          <mesh position={[-0.07, 0.015, 0.1]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshToonMaterial color={pattern === 'bicolor' ? '#FFFFFF' : color} />
          </mesh>
          <mesh position={[0.07, 0.015, 0.1]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshToonMaterial color={pattern === 'bicolor' ? '#FFFFFF' : color} />
          </mesh>
          <mesh position={[-0.07, 0.015, -0.07]}>
            <sphereGeometry args={[0.033, 8, 8]} />
            <meshToonMaterial color={color} />
          </mesh>
          <mesh position={[0.07, 0.015, -0.07]}>
            <sphereGeometry args={[0.033, 8, 8]} />
            <meshToonMaterial color={color} />
          </mesh>
        </>
      ) : (
        <>
          <mesh castShadow position={[-0.05, 0.04, 0.1]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshToonMaterial color={pattern === 'bicolor' ? '#FFFFFF' : color} />
          </mesh>
          <mesh castShadow position={[0.05, 0.04, 0.1]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshToonMaterial color={pattern === 'bicolor' ? '#FFFFFF' : color} />
          </mesh>
          <mesh castShadow position={[-0.1, 0.07, -0.02]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshToonMaterial color={color} />
          </mesh>
          <mesh castShadow position={[0.1, 0.07, -0.02]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshToonMaterial color={color} />
          </mesh>
        </>
      )}

      {/* Tail */}
      <group ref={tailRef} position={[0, bodyY - 0.02, -0.16]} rotation={[0.8, 0, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.03, 0.16, 4, 8]} />
          <meshToonMaterial color={color} />
        </mesh>
        <mesh castShadow position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshToonMaterial color={pattern === 'tabby' ? patternColors.secondary : color} />
        </mesh>
      </group>
    </group>
  )
}

function Heart({ startPosition }: { startPosition: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null)
  const [opacity, setOpacity] = useState(1)
  const startTime = useRef(Date.now())
  const randomX = useMemo(() => (Math.random() - 0.5) * 0.3, [])

  useFrame(() => {
    if (!ref.current) return
    const elapsed = (Date.now() - startTime.current) / 1000
    const progress = elapsed / 1.5
    if (progress < 1) {
      ref.current.position.y = startPosition.y + progress * 1.2
      ref.current.position.x = startPosition.x + Math.sin(progress * Math.PI * 2) * 0.15 + randomX
      ref.current.scale.setScalar((1 - progress * 0.5) * (0.8 + Math.sin(progress * 10) * 0.2))
      ref.current.rotation.z = progress * Math.PI * 0.5
      setOpacity(1 - progress)
    }
  })

  if (opacity <= 0) return null

  return (
    <mesh ref={ref} position={[startPosition.x, startPosition.y, startPosition.z]}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial color="#FF69B4" transparent opacity={opacity} />
    </mesh>
  )
}

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
  const hasKnockedRef = useRef(false)

  useCatBehavior(id)

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    petCat(id)
    selectCat(id)
    setIsHappy(true)
    setTimeout(() => setIsHappy(false), 3000)

    if (groupRef.current) {
      const basePos = groupRef.current.position.clone()
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const pos = basePos.clone()
          pos.y += 0.4
          pos.x += (Math.random() - 0.5) * 0.2
          setHearts((prev) => [...prev, pos])
        }, i * 150)
      }
      setTimeout(() => setHearts([]), 2000)
    }
  }

  // Reset knock state when action changes
  if (!knockingOff) {
    hasKnockedRef.current = false
  }

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const current = groupRef.current.position

    if (action === 'walking' && targetPosition) {
      const tx = targetPosition[0]
      const ty = targetPosition[1]
      const tz = targetPosition[2]
      const dx = tx - current.x
      const dz = tz - current.z
      const dist = Math.sqrt(dx * dx + dz * dz)

      // 먼저 바닥으로 내려와야 걸을 수 있음
      const isOnGround = current.y < 0.15

      if (!isOnGround && ty < 0.1) {
        // 가구에서 바닥으로 내려오는 중 - 먼저 점프해서 내려옴
        current.y = THREE.MathUtils.lerp(current.y, 0, 0.15)
        // 방향만 미리 돌림
        const targetRotation = Math.atan2(dx, dz)
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, 0.1)
      } else if (dist > 0.2) {
        // 이동
        const speed = 1.8 * delta
        current.x += (dx / dist) * speed
        current.z += (dz / dist) * speed

        // 방향 전환
        const targetRotation = Math.atan2(dx, dz)
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotation, 0.1)

        // 높이 처리
        if (ty > 0.1 && dist < 0.6) {
          // 가구 근처 - 점프해서 올라감
          current.y = THREE.MathUtils.lerp(current.y, ty, 0.12)
        } else {
          // 바닥에서 걷기 (작은 바운스)
          const bounce = Math.abs(Math.sin(state.clock.elapsedTime * 14)) * 0.015
          current.y = THREE.MathUtils.lerp(current.y, bounce, 0.2)
        }
      } else {
        // 도착
        current.x = tx
        current.z = tz
        current.y = THREE.MathUtils.lerp(current.y, ty, 0.2)

        // 테이블에서 물건 떨어뜨리기
        if (knockingOff && !hasKnockedRef.current) {
          hasKnockedRef.current = true
          const itemTypes: ('cup' | 'vase' | 'book')[] = ['cup', 'vase', 'book']
          const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)]
          addFallenItem({
            id: `fallen-${Date.now()}`,
            position: [
              current.x + (Math.random() - 0.5) * 0.5,
              0.05,
              current.z + (Math.random() - 0.5) * 0.5
            ],
            type: itemType,
            createdAt: Date.now()
          })
        }

        updateCat(id, { action: 'idle', targetPosition: null, knockingOff: false })
      }
    } else {
      // idle/sitting/sleeping - 현재 높이 유지
      const baseY = current.y < 0.1 ? 0 : current.y
      current.y = THREE.MathUtils.lerp(current.y, baseY, 0.05)
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
        <CatBody color={color} pattern={pattern} eyeColor={eyeColor} action={action} isHappy={isHappy} />
      </group>
      {hearts.map((pos, i) => (
        <Heart key={`${id}-heart-${i}`} startPosition={pos} />
      ))}
    </>
  )
}
