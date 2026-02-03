import * as THREE from 'three'

interface FurnitureProps {
  position: [number, number, number]
  rotation?: number
}

function Sofa({ position, rotation = 0 }: FurnitureProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Base */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.6, 0.8]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.7, -0.3]} castShadow>
        <boxGeometry args={[2, 0.8, 0.2]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>
      {/* Cushions */}
      <mesh position={[-0.5, 0.5, 0.1]} castShadow>
        <boxGeometry args={[0.8, 0.3, 0.5]} />
        <meshToonMaterial color="#CD853F" />
      </mesh>
      <mesh position={[0.5, 0.5, 0.1]} castShadow>
        <boxGeometry args={[0.8, 0.3, 0.5]} />
        <meshToonMaterial color="#CD853F" />
      </mesh>
      {/* Armrests */}
      <mesh position={[-1.05, 0.5, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.8]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>
      <mesh position={[1.05, 0.5, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.8]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>
    </group>
  )
}

function Table({ position, rotation = 0 }: FurnitureProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Top */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 16]} />
        <meshToonMaterial color="#DEB887" />
      </mesh>
      {/* Leg */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, 0.5, 8]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.04, 16]} />
        <meshToonMaterial color="#8B4513" />
      </mesh>
    </group>
  )
}

function CatTree({ position, rotation = 0 }: FurnitureProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Base */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.2, 0.8]} />
        <meshToonMaterial color="#D2B48C" />
      </mesh>
      {/* Post */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 8]} />
        <meshToonMaterial color="#F5DEB3" />
      </mesh>
      {/* Platform 1 */}
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.1, 16]} />
        <meshToonMaterial color="#D2B48C" />
      </mesh>
      {/* Upper post */}
      <mesh position={[0.2, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.7, 8]} />
        <meshToonMaterial color="#F5DEB3" />
      </mesh>
      {/* Platform 2 */}
      <mesh position={[0.2, 2.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.1, 0.4]} />
        <meshToonMaterial color="#D2B48C" />
      </mesh>
    </group>
  )
}

function Plant({ position, rotation = 0 }: FurnitureProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Pot */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.4, 8]} />
        <meshToonMaterial color="#CD853F" />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 8]} />
        <meshToonMaterial color="#4a3728" />
      </mesh>
      {/* Leaves */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[
            Math.sin((i * Math.PI * 2) / 5) * 0.15,
            0.6 + Math.random() * 0.2,
            Math.cos((i * Math.PI * 2) / 5) * 0.15,
          ]}
          rotation={[Math.random() * 0.3, (i * Math.PI * 2) / 5, Math.random() * 0.3]}
          castShadow
        >
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshToonMaterial color="#228B22" />
        </mesh>
      ))}
    </group>
  )
}

function Shelf({ position, rotation = 0 }: FurnitureProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[1.2, 2, 0.3]} />
        <meshToonMaterial color="#DEB887" />
      </mesh>
      {/* Shelves */}
      {[0.3, 1, 1.7].map((y, i) => (
        <mesh key={i} position={[0, y, 0.05]} castShadow>
          <boxGeometry args={[1.1, 0.05, 0.25]} />
          <meshToonMaterial color="#CD853F" />
        </mesh>
      ))}
      {/* Books/items */}
      <mesh position={[-0.3, 0.5, 0.05]} castShadow>
        <boxGeometry args={[0.3, 0.35, 0.15]} />
        <meshToonMaterial color="#4169E1" />
      </mesh>
      <mesh position={[0.2, 1.2, 0.05]} castShadow>
        <boxGeometry args={[0.25, 0.3, 0.12]} />
        <meshToonMaterial color="#DC143C" />
      </mesh>
    </group>
  )
}

function CatBed({ position, rotation = 0 }: FurnitureProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Outer rim */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <torusGeometry args={[0.35, 0.1, 8, 16]} />
        <meshToonMaterial color="#F4A460" />
      </mesh>
      {/* Cushion */}
      <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
        <meshToonMaterial color="#FFDAB9" />
      </mesh>
    </group>
  )
}

function Lamp({ position, rotation = 0 }: FurnitureProps) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
        <meshToonMaterial color="#2F4F4F" />
      </mesh>
      {/* Pole */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
        <meshToonMaterial color="#2F4F4F" />
      </mesh>
      {/* Shade */}
      <mesh position={[0, 1.35, 0]}>
        <coneGeometry args={[0.2, 0.25, 16, 1, true]} />
        <meshToonMaterial color="#FFF8DC" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export function Furniture() {
  return (
    <group>
      {/* Sofas */}
      <Sofa position={[-3.5, 0, -3]} rotation={Math.PI / 2} />
      <Sofa position={[3.5, 0, 2]} rotation={-Math.PI / 2} />

      {/* Tables */}
      <Table position={[-2, 0, -3]} />
      <Table position={[2, 0, 2]} />
      <Table position={[0, 0, 0]} />

      {/* Cat furniture */}
      <CatTree position={[4.5, 0, -3.5]} />
      <CatBed position={[-1, 0, 3]} />
      <CatBed position={[3, 0, -1]} />

      {/* Decorations */}
      <Plant position={[-5, 0, 4]} />
      <Plant position={[5, 0, 4]} />
      <Plant position={[-5, 0, -4]} />

      <Shelf position={[-5.7, 0, 0]} rotation={Math.PI / 2} />

      <Lamp position={[-4, 0, -1.5]} />
      <Lamp position={[4.5, 0, 0.5]} />
    </group>
  )
}
