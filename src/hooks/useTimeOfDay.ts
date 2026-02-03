import { useMemo } from 'react'
import { useGameStore } from '../stores/gameStore'
import type { TimeOfDay, TimeSettings } from '../types'

const TIME_PRESETS: Record<TimeOfDay, TimeSettings> = {
  morning: {
    hour: 8,
    skyColor: '#87CEEB',
    ambientIntensity: 0.4,
    sunIntensity: 0.7,
    sunColor: '#FFF5E6',
    indoorLightsOn: false,
  },
  noon: {
    hour: 12,
    skyColor: '#ADD8E6',
    ambientIntensity: 0.5,
    sunIntensity: 1.0,
    sunColor: '#FFFFFF',
    indoorLightsOn: false,
  },
  evening: {
    hour: 18,
    skyColor: '#FFA07A',
    ambientIntensity: 0.3,
    sunIntensity: 0.5,
    sunColor: '#FF8C00',
    indoorLightsOn: true,
  },
  night: {
    hour: 22,
    skyColor: '#1a1a2e',
    ambientIntensity: 0.15,
    sunIntensity: 0.1,
    sunColor: '#4169E1',
    indoorLightsOn: true,
  },
}

export function useTimeOfDay() {
  const timeOfDay = useGameStore((state) => state.timeOfDay)
  const setTimeOfDay = useGameStore((state) => state.setTimeOfDay)

  const settings = useMemo(() => TIME_PRESETS[timeOfDay], [timeOfDay])

  const cycleTime = () => {
    const times: TimeOfDay[] = ['morning', 'noon', 'evening', 'night']
    const currentIndex = times.indexOf(timeOfDay)
    const nextIndex = (currentIndex + 1) % times.length
    setTimeOfDay(times[nextIndex])
  }

  return {
    timeOfDay,
    settings,
    setTimeOfDay,
    cycleTime,
  }
}
