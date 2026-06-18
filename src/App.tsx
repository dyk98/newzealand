import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { BottomNav } from './components/BottomNav'
import { ContextModal } from './components/ContextModal'
import { contextCardMap, tripDays } from './data/tripData'
import { DayDetailPage } from './pages/DayDetailPage'
import { ItineraryListPage } from './pages/ItineraryListPage'
import { OverviewPage } from './pages/OverviewPage'
import { PrepPage } from './pages/PrepPage'
import { readStoredState, writeStoredState } from './utils/storage'

const appStateKey = 'newzealand-trip:app-state:v2'

type AppState = {
  completedTodoIds: string[]
  completedDayTodos: string[]
  likedDays: string[]
  selectedPlans: Record<string, string>
}

const defaultState: AppState = {
  completedTodoIds: [],
  completedDayTodos: [],
  likedDays: [],
  selectedPlans: Object.fromEntries(
    tripDays
      .filter((day) => day.weatherPlans?.length)
      .map((day) => [day.id, day.weatherPlans?.[0]?.id ?? '']),
  ),
}

function App() {
  const [hash, setHash] = useState(getCurrentHash)
  const [state, setState] = useState<AppState>(() => readStoredState(appStateKey, defaultState))
  const [selectedContextId, setSelectedContextId] = useState<string | null>(null)
  const [closingContextId, setClosingContextId] = useState<string | null>(null)

  useEffect(() => {
    const handleHashChange = () => setHash(getCurrentHash())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    writeStoredState(appStateKey, state)
  }, [state])

  const route = useMemo(() => resolveRoute(hash), [hash])
  const navActive = route.kind === 'overview' ? 'overview' : route.kind === 'todos' ? 'todos' : 'trip'
  const visibleContextId = selectedContextId ?? closingContextId
  const selectedContextCard = visibleContextId ? contextCardMap.get(visibleContextId) : undefined
  const isContextClosing = Boolean(closingContextId && !selectedContextId)

  const toggleTodo = (todoId: string) => {
    setState((current) => ({
      ...current,
      completedTodoIds: toggleItem(current.completedTodoIds, todoId),
    }))
  }

  const toggleDayTodo = (todoId: string) => {
    setState((current) => ({
      ...current,
      completedDayTodos: toggleItem(current.completedDayTodos, todoId),
    }))
  }

  const toggleLike = (dayId: string) => {
    setState((current) => ({
      ...current,
      likedDays: toggleItem(current.likedDays, dayId),
    }))
  }

  const selectPlan = (dayId: string, planId: string) => {
    setState((current) => ({
      ...current,
      selectedPlans: { ...current.selectedPlans, [dayId]: planId },
    }))
  }

  const openContextCard = (cardId: string) => {
    setClosingContextId(null)
    setSelectedContextId(cardId)
  }

  const closeContextCard = () => {
    if (!selectedContextId) return

    const closingId = selectedContextId
    setClosingContextId(closingId)
    setSelectedContextId(null)
    window.setTimeout(() => {
      setClosingContextId((current) => (current === closingId ? null : current))
    }, 280)
  }

  return (
    <>
      <BottomNav active={navActive} />

      {route.kind === 'overview' ? (
        <OverviewPage completedTodoIds={state.completedTodoIds} />
      ) : null}

      {route.kind === 'trip' ? <ItineraryListPage likedDays={state.likedDays} /> : null}

      {route.kind === 'todos' ? (
        <PrepPage completedTodoIds={state.completedTodoIds} onToggleTodo={toggleTodo} />
      ) : null}

      {route.kind === 'day' ? (
        <DayDetailPage
          key={route.day.id}
          day={route.day}
          completedTodos={state.completedDayTodos}
          liked={state.likedDays.includes(route.day.id)}
          selectedPlanId={state.selectedPlans[route.day.id]}
          onToggleTodo={toggleDayTodo}
          onToggleLike={() => toggleLike(route.day.id)}
          onSelectPlan={selectPlan}
          onOpenContext={openContextCard}
        />
      ) : null}

      {selectedContextCard ? (
        <ContextModal card={selectedContextCard} closing={isContextClosing} onClose={closeContextCard} />
      ) : null}
    </>
  )
}

function getCurrentHash() {
  if (typeof window === 'undefined') return 'overview'
  return window.location.hash.replace(/^#/, '') || 'overview'
}

function resolveRoute(hash: string):
  | { kind: 'overview' }
  | { kind: 'trip' }
  | { kind: 'todos' }
  | { kind: 'day'; day: (typeof tripDays)[number] } {
  if (hash === 'trip') return { kind: 'trip' }
  if (hash === 'todos') return { kind: 'todos' }
  const day = tripDays.find((item) => item.id === hash)
  if (day) return { kind: 'day', day }
  return { kind: 'overview' }
}

function toggleItem(items: string[], item: string) {
  return items.includes(item) ? items.filter((current) => current !== item) : [...items, item]
}

export default App
