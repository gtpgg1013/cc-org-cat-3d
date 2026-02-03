import { useGameStore } from '../../stores/gameStore'
import { Cat } from './Cat'

export function CatManager() {
  const cats = useGameStore((state) => state.cats)

  return (
    <group name="cats">
      {cats.map((cat) => (
        <Cat key={cat.id} catData={cat} />
      ))}
    </group>
  )
}
