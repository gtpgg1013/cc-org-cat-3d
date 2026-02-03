import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTimeOfDay } from '../../hooks/useTimeOfDay'

export function Lighting() {
  const { settings } = useTimeOfDay()
  const sunRef = useRef<THREE.DirectionalLight>(null)

  // Smoothly interpolate light values
  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.intensity = THREE.MathUtils.lerp(
        sunRef.current.intensity,
        settings.sunIntensity,
        0.05
      )
    }
  })

  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={settings.ambientIntensity} />

      {/* Main directional light (sun) */}
      <directionalLight
        ref={sunRef}
        position={[10, 15, 10]}
        intensity={settings.sunIntensity}
        color={settings.sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
      />

      {/* Fill light from windows */}
      <directionalLight
        position={[0, 5, 8]}
        intensity={settings.sunIntensity * 0.3}
        color={settings.skyColor}
      />

      {/* Subtle bounce light from floor */}
      <hemisphereLight
        args={['#87CEEB', '#8B7355', 0.2]}
      />
    </>
  )
}
