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

      {/* Subtle bounce light - 따뜻한 분위기 */}
      <hemisphereLight
        args={['#FFF8E7', '#D4A574', 0.3]}
      />

      {/* 실내 포인트 조명 (따뜻한 느낌) */}
      {settings.indoorLightsOn && (
        <>
          <pointLight position={[-4, 2, -1.5]} intensity={0.4} color="#FFE4B5" distance={5} />
          <pointLight position={[4.5, 2, 0.5]} intensity={0.4} color="#FFE4B5" distance={5} />
        </>
      )}
    </>
  )
}
