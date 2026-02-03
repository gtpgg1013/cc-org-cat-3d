import * as THREE from 'three'
import { useTimeOfDay } from '../../hooks/useTimeOfDay'

const WALL_COLOR = '#F5E6D3'
const FLOOR_COLOR = '#8B7355'

function Wall({
  position,
  rotation,
  size
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshToonMaterial color={WALL_COLOR} />
    </mesh>
  )
}

function Window({
  position,
  rotation,
  size
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  size: [number, number]
}) {
  const { settings } = useTimeOfDay()

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        color={settings.skyColor}
        side={THREE.DoubleSide}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[12, 10]} />
      <meshToonMaterial color={FLOOR_COLOR} />
    </mesh>
  )
}

function Ceiling() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]}>
      <planeGeometry args={[12, 10]} />
      <meshToonMaterial color="#FFFFFF" />
    </mesh>
  )
}

export function Cafe() {
  const { settings } = useTimeOfDay()

  return (
    <group>
      <Floor />
      <Ceiling />

      {/* Back wall */}
      <Wall position={[0, 2, -5]} size={[12, 4, 0.2]} />

      {/* Front wall with windows */}
      <Wall position={[-4.5, 2, 5]} size={[3, 4, 0.2]} />
      <Wall position={[4.5, 2, 5]} size={[3, 4, 0.2]} />
      <Wall position={[0, 3.5, 5]} size={[6, 1, 0.2]} />
      <Wall position={[0, 0.5, 5]} size={[6, 1, 0.2]} />

      {/* Windows */}
      <Window position={[0, 2, 4.85]} size={[6, 2]} />

      {/* Left wall */}
      <Wall position={[-6, 2, 0]} rotation={[0, Math.PI / 2, 0]} size={[10, 4, 0.2]} />

      {/* Right wall with window */}
      <Wall position={[6, 2, -2.5]} rotation={[0, Math.PI / 2, 0]} size={[5, 4, 0.2]} />
      <Wall position={[6, 2, 4]} rotation={[0, Math.PI / 2, 0]} size={[2, 4, 0.2]} />
      <Wall position={[6, 3.5, 1.5]} rotation={[0, Math.PI / 2, 0]} size={[3, 1, 0.2]} />
      <Wall position={[6, 0.5, 1.5]} rotation={[0, Math.PI / 2, 0]} size={[3, 1, 0.2]} />
      <Window position={[5.85, 2, 1.5]} rotation={[0, Math.PI / 2, 0]} size={[3, 2]} />

      {/* Indoor lights */}
      {settings.indoorLightsOn && (
        <>
          <pointLight position={[-2, 3.5, 0]} intensity={0.8} color="#FFF5E0" distance={8} />
          <pointLight position={[2, 3.5, 0]} intensity={0.8} color="#FFF5E0" distance={8} />
          <pointLight position={[0, 3.5, 2]} intensity={0.6} color="#FFF5E0" distance={6} />
        </>
      )}
    </group>
  )
}
