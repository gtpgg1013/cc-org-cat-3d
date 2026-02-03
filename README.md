# Cat Cafe 3D

Three.js + React Three Fiber로 만든 스타일라이즈드 3D 고양이 카페

## Features

- 아늑한 3D 카페 환경 (소파, 테이블, 캣타워, 화분 등)
- 5마리의 귀여운 고양이 (각각 다른 색상과 무늬)
- AI 기반 고양이 행동 (배회, 앉기, 자기, 놀기)
- 가구와 인터랙션 (소파에 앉기, 창가에서 바깥 보기 등)
- 시간대 변화 (아침/낮/저녁/밤)
- 클릭으로 고양이 쓰다듬기 + 하트 이펙트
- 툰셰이딩 스타일

## Tech Stack

| 영역 | 기술 |
|------|------|
| 렌더링 | Three.js + React Three Fiber |
| UI 프레임워크 | React 19 |
| 상태관리 | Zustand |
| 스타일 | CSS + drei |
| 빌드 | Vite |
| 언어 | TypeScript |

## Getting Started

```bash
# 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── canvas/        # 메인 3D 씬
│   │   └── Scene.tsx
│   ├── cats/          # 고양이 컴포넌트
│   │   ├── Cat.tsx
│   │   └── CatManager.tsx
│   ├── environment/   # 카페 환경
│   │   ├── Cafe.tsx
│   │   ├── Furniture.tsx
│   │   └── Lighting.tsx
│   ├── interaction/   # 인터랙션
│   │   └── Interaction.tsx
│   └── ui/            # UI 컴포넌트
│       ├── HUD.tsx
│       └── HUD.css
├── hooks/             # 커스텀 훅
│   ├── useCatBehavior.ts
│   └── useTimeOfDay.ts
├── stores/            # Zustand 스토어
│   └── gameStore.ts
├── types/             # TypeScript 타입
│   └── index.ts
└── shaders/           # 셰이더
    └── toonGradient.ts
```

## Controls

| 조작 | 동작 |
|------|------|
| 마우스 드래그 | 시점 회전 |
| 마우스 휠 | 줌 인/아웃 |
| 고양이 클릭 | 쓰다듬기 |
| 상단 버튼 | 시간대 변경 |

## Cats

| 이름 | 색상 | 패턴 | 눈 색깔 |
|------|------|------|---------|
| 나비 | 오렌지 | 태비 | 초록 |
| 우유 | 하얀색 | 단색 | 파랑 |
| 까망 | 검정 | 단색 | 노랑 |
| 삼색이 | 베이지 | 칼리코 | 초록 |
| 양말 | 회색 | 턱시도 | 하늘색 |

## License

MIT
