import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Cafe } from '../environment/Cafe'
import { Furniture } from '../environment/Furniture'
import { Lighting } from '../environment/Lighting'
import { CatManager } from '../cats/CatManager'
import { Interaction } from '../interaction/Interaction'
import { useTimeOfDay } from '../../hooks/useTimeOfDay'

function SkyBackground() {
  const { settings } = useTimeOfDay()
  return <color attach="background" args={[settings.skyColor]} />
}

function SceneContent() {
  return (
    <>
      <SkyBackground />
      <Lighting />

      <Suspense fallback={null}>
        <Cafe />
        <Furniture />
        <CatManager />
      </Suspense>

      <Interaction />

      <OrbitControls
        makeDefault
        minDistance={3}
        maxDistance={15}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2 - 0.1}
        target={[0, 0.5, 0]}
        enablePan={true}
        panSpeed={0.5}
        // Limit panning to cafe area
        onChange={(e) => {
          if (e?.target) {
            const controls = e.target
            const target = controls.target
            target.x = Math.max(-4, Math.min(4, target.x))
            target.z = Math.max(-3, Math.min(3, target.z))
          }
        }}
      />
    </>
  )
}

export function Scene() {
  return (
    <Canvas
      camera={{ position: [6, 6, 6], fov: 50 }}
      shadows
      dpr={[1, 2]}
      style={{ width: '100vw', height: '100vh' }}
    >
      <SceneContent />
    </Canvas>
  )
}
