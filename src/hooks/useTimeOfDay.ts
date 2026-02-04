import { useMemo } from 'react'
import { useGameStore } from '../stores/gameStore'
import type { TimeOfDay, TimeSettings } from '../types'

// 힐링스러운 따뜻한 조명 설정
const TIME_PRESETS: Record<TimeOfDay, TimeSettings> = {
  morning: {
    hour: 8,
    skyColor: '#B4D7E8',      // 부드러운 하늘색
    ambientIntensity: 0.5,
    sunIntensity: 0.8,
    sunColor: '#FFF8E7',      // 따뜻한 아침 햇살
    indoorLightsOn: false,
  },
  noon: {
    hour: 14,                 // 오후 2시 - 가장 힐링스러운 시간
    skyColor: '#C9E4F0',      // 맑은 하늘
    ambientIntensity: 0.55,
    sunIntensity: 0.9,
    sunColor: '#FFFAF0',      // 따뜻한 햇살
    indoorLightsOn: false,
  },
  evening: {
    hour: 17,
    skyColor: '#FFD4A3',      // 골든아워
    ambientIntensity: 0.4,
    sunIntensity: 0.6,
    sunColor: '#FFB347',      // 따뜻한 노을
    indoorLightsOn: true,
  },
  night: {
    hour: 21,
    skyColor: '#2D3A4A',      // 부드러운 밤하늘
    ambientIntensity: 0.25,   // 너무 어둡지 않게
    sunIntensity: 0.15,
    sunColor: '#6B8CAE',      // 달빛
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
