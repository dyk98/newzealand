import { Home, ListChecks, Map as MapIcon } from 'lucide-react'
import { openAppHash } from '../utils/storage'

type BottomNavProps = {
  active: 'overview' | 'trip' | 'todos'
}

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="bottom-tabs" aria-label="主导航">
      <button
        className={active === 'overview' ? 'is-active' : ''}
        type="button"
        onClick={() => openAppHash('overview')}
      >
        <Home size={20} />
        总览
      </button>
      <button
        className={active === 'trip' ? 'is-active' : ''}
        type="button"
        onClick={() => openAppHash('trip')}
      >
        <MapIcon size={20} />
        行程
      </button>
      <button
        className={active === 'todos' ? 'is-active' : ''}
        type="button"
        onClick={() => openAppHash('todos')}
      >
        <ListChecks size={20} />
        待办
      </button>
    </nav>
  )
}
