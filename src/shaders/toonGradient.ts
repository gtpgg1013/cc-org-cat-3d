import * as THREE from 'three'

export function createToonGradientTexture(steps: number = 4): THREE.DataTexture {
  const colors = new Uint8Array(steps)

  for (let i = 0; i < steps; i++) {
    colors[i] = Math.floor((i / (steps - 1)) * 255)
  }

  const texture = new THREE.DataTexture(colors, steps, 1, THREE.RedFormat)
  texture.needsUpdate = true
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter

  return texture
}

// Pre-created gradient textures
export const toonGradient3 = createToonGradientTexture(3)
export const toonGradient4 = createToonGradientTexture(4)
export const toonGradient5 = createToonGradientTexture(5)
