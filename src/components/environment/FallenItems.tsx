import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore } from '../../stores/gameStore'
import type { FallenItem } from '../../stores/gameStore'

function Cup({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  const rotationX = useRef(Math.PI / 2 + Math.random() * 0.5)
  const rotationZ = useRef(Math.random() * Math.PI * 2)

  return (
    <group ref={ref} position={position} rotation={[rotationX.current, 0, rotationZ.current]}>
      {/* 컵 몸통 */}
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.035, 0.08, 12]} />
        <meshToonMaterial color="#FFFFFF" />
      </mesh>
      {/* 컵 손잡이 */}
      <mesh position={[0.045, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.018, 0.006, 8, 12]} />
        <meshToonMaterial color="#FFFFFF" />
      </mesh>
    </group>
  )
}

function Vase({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  const rotationX = useRef(Math.PI / 2 + Math.random() * 0.3)
  const rotationZ = useRef(Math.random() * Math.PI * 2)

  return (
    <group ref={ref} position={position} rotation={[rotationX.current, 0, rotationZ.current]}>
      {/* 화병 - 눕혀진 상태 */}
      <mesh castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.12, 12]} />
        <meshToonMaterial color="#7CB9E8" />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.04, 0.03, 0.02, 12]} />
        <meshToonMaterial color="#7CB9E8" />
      </mesh>
    </group>
  )
}

function Book({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  const rotationY = useRef(Math.random() * Math.PI * 2)
  const bookColor = useRef(['#8B4513', '#2F4F4F', '#8B0000', '#191970'][Math.floor(Math.random() * 4)])

  return (
    <group ref={ref} position={position} rotation={[0, rotationY.current, 0]}>
      {/* 책 - 바닥에 펼쳐진 상태 */}
      <mesh castShadow position={[0, 0.01, 0]}>
        <boxGeometry args={[0.1, 0.02, 0.07]} />
        <meshToonMaterial color={bookColor.current} />
      </mesh>
      {/* 페이지 */}
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[0.09, 0.015, 0.065]} />
        <meshToonMaterial color="#FFF8DC" />
      </mesh>
    </group>
  )
}

function FallenItemMesh({ item }: { item: FallenItem }) {
  const ref = useRef<THREE.Group>(null)
  const age = Date.now() - item.createdAt

  // 등장 애니메이션
  useFrame(() => {
    if (!ref.current) return
    const currentAge = Date.now() - item.createdAt
    if (currentAge < 500) {
      // 바운스 효과
      const progress = currentAge / 500
      const bounce = Math.sin(progress * Math.PI) * 0.1 * (1 - progress)
      ref.current.position.y = item.position[1] + bounce
    }
  })

  // 오래된 아이템은 점점 투명해짐 (10초 후)
  const opacity = age > 10000 ? Math.max(0, 1 - (age - 10000) / 5000) : 1

  if (opacity <= 0) return null

  return (
    <group ref={ref} position={item.position}>
      {item.type === 'cup' && <Cup position={[0, 0, 0]} />}
      {item.type === 'vase' && <Vase position={[0, 0, 0]} />}
      {item.type === 'book' && <Book position={[0, 0, 0]} />}
    </group>
  )
}

export function FallenItems() {
  const fallenItems = useGameStore((state) => state.fallenItems)

  return (
    <group>
      {fallenItems.map((item) => (
        <FallenItemMesh key={item.id} item={item} />
      ))}
    </group>
  )
}
