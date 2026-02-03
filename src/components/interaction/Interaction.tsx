import { useGameStore } from '../../stores/gameStore'

export function Interaction() {
  const selectCat = useGameStore((state) => state.selectCat)

  const handleBackgroundClick = () => {
    selectCat(null)
  }

  return (
    <mesh
      position={[0, 0.001, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={handleBackgroundClick}
    >
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}
