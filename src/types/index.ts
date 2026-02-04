export type TimeOfDay = 'morning' | 'noon' | 'evening' | 'night'

export type CatAction = 'idle' | 'walking' | 'sitting' | 'sleeping' | 'playing'

export interface CatState {
  id: string
  name: string
  position: [number, number, number]
  rotation: number
  action: CatAction
  targetPosition: [number, number, number] | null
  targetFurniture: string | null
  onFurniture: boolean
  knockingOff: boolean
  happiness: number
  color: string
  pattern: 'solid' | 'tabby' | 'bicolor' | 'calico'
  eyeColor: string
}

export interface TimeSettings {
  hour: number
  skyColor: string
  ambientIntensity: number
  sunIntensity: number
  sunColor: string
  indoorLightsOn: boolean
}

export interface FurnitureItem {
  id: string
  type: 'sofa' | 'table' | 'shelf' | 'plant' | 'lamp' | 'bed'
  position: [number, number, number]
  rotation: number
  scale: number
  isInteractable: boolean
}

export interface Waypoint {
  position: [number, number, number]
  type: 'rest' | 'play' | 'food' | 'window' | 'wander'
}
