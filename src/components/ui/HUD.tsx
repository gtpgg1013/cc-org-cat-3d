import { useGameStore } from '../../stores/gameStore'
import { useTimeOfDay } from '../../hooks/useTimeOfDay'
import type { TimeOfDay } from '../../types'
import './HUD.css'

const TIME_LABELS: Record<TimeOfDay, string> = {
  morning: '아침',
  noon: '낮',
  evening: '저녁',
  night: '밤',
}

const TIME_ICONS: Record<TimeOfDay, string> = {
  morning: '🌅',
  noon: '☀️',
  evening: '🌆',
  night: '🌙',
}

export function HUD() {
  const { timeOfDay, cycleTime } = useTimeOfDay()
  const cats = useGameStore((state) => state.cats)
  const selectedCatId = useGameStore((state) => state.selectedCatId)
  const showUI = useGameStore((state) => state.showUI)

  const selectedCat = cats.find((c) => c.id === selectedCatId)

  if (!showUI) return null

  return (
    <div className="hud">
      {/* Time Control */}
      <div className="hud-panel time-panel">
        <button className="time-button" onClick={cycleTime}>
          <span className="time-icon">{TIME_ICONS[timeOfDay]}</span>
          <span className="time-label">{TIME_LABELS[timeOfDay]}</span>
        </button>
      </div>

      {/* Cat List */}
      <div className="hud-panel cat-list-panel">
        <h3>고양이</h3>
        <div className="cat-list">
          {cats.map((cat) => (
            <div
              key={cat.id}
              className={`cat-item ${selectedCatId === cat.id ? 'selected' : ''}`}
            >
              <span
                className="cat-color"
                style={{ backgroundColor: cat.color }}
              />
              <span className="cat-name">{cat.name}</span>
              <span className="cat-happiness">
                {'❤️'.repeat(Math.floor(cat.happiness / 25))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Cat Info */}
      {selectedCat && (
        <div className="hud-panel cat-info-panel">
          <h3>{selectedCat.name}</h3>
          <div className="cat-details">
            <div className="stat">
              <span className="stat-label">상태</span>
              <span className="stat-value">
                {selectedCat.action === 'idle' && '멍때리는 중'}
                {selectedCat.action === 'walking' && '산책 중'}
                {selectedCat.action === 'sitting' && '앉아있음'}
                {selectedCat.action === 'sleeping' && '자는 중 💤'}
                {selectedCat.action === 'playing' && '신남!'}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">행복도</span>
              <div className="happiness-bar">
                <div
                  className="happiness-fill"
                  style={{ width: `${selectedCat.happiness}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="hud-panel instructions-panel">
        <p>🖱️ 드래그: 시점 회전</p>
        <p>🔍 스크롤: 줌</p>
        <p>👆 클릭: 고양이 쓰다듬기</p>
      </div>
    </div>
  )
}
