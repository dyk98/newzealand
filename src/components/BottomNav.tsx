import { BaggageClaim, Home, Map as MapIcon } from 'lucide-react'
import type { CSSProperties } from 'react'
import { useJellyIndex } from '../hooks/useJellyIndex'

type BottomNavProps = {
  active: 'overview' | 'trip' | 'todos'
}

const activeIndex: Record<BottomNavProps['active'], number> = {
  overview: 0,
  trip: 1,
  todos: 2,
}

export function BottomNav({ active }: BottomNavProps) {
  const targetIndex = activeIndex[active]
  const visualIndex = useJellyIndex(targetIndex)
  const indicatorStyle = {
    transform: `translate3d(${visualIndex * 100}%, 0, 0)`,
  } as CSSProperties

  return (
    <nav className="bottom-tabs" aria-label="主导航">
      <span className="bottom-tab-indicator" style={indicatorStyle} aria-hidden="true" />
      <button
        className={active === 'overview' ? 'is-active' : ''}
        type="button"
        onClick={() => navigateAppHash('overview')}
      >
        <Home size={20} />
        总览
      </button>
      <button
        className={active === 'trip' ? 'is-active' : ''}
        type="button"
        onClick={() => navigateAppHash('trip')}
      >
        <MapIcon size={20} />
        行程
      </button>
      <button
        className={active === 'todos' ? 'is-active' : ''}
        type="button"
        onClick={() => navigateAppHash('todos')}
      >
        <BaggageClaim size={20} />
        准备
      </button>
    </nav>
  )
}

function navigateAppHash(hash: string) {
  if (window.location.hash.replace(/^#/, '') === hash) return
  window.location.hash = hash
}
