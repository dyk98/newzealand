import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  BedDouble,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Circle,
  CloudSun,
  Heart,
  ListChecks,
  MapPin,
  Mountain,
  Navigation,
  Route,
  Umbrella,
} from 'lucide-react'
import { contextCardMap, tripDays } from '../data/tripData'
import { useJellyIndex } from '../hooks/useJellyIndex'
import type { TripDay } from '../types/trip'
import { openAppHash } from '../utils/storage'

type DayDetailPageProps = {
  day: TripDay
  completedTodos: string[]
  liked: boolean
  selectedPlanId?: string
  onToggleTodo: (todoId: string) => void
  onToggleLike: () => void
  onSelectPlan: (dayId: string, planId: string) => void
  onOpenContext: (cardId: string) => void
}

export function DayDetailPage({
  day,
  completedTodos,
  liked,
  selectedPlanId,
  onToggleTodo,
  onToggleLike,
  onSelectPlan,
  onOpenContext,
}: DayDetailPageProps) {
  const [activePanel, setActivePanel] = useState<'route' | 'prep'>(() => getDefaultPanel(day, completedTodos))
  const selectedPlan =
    day.weatherPlans?.find((plan) => plan.id === selectedPlanId) ?? day.weatherPlans?.[0]
  const completedCount = day.todos.filter((todo) => completedTodos.includes(todoKey(day.id, todo))).length
  const panelTargetIndex = activePanel === 'prep' ? 0 : 1
  const panelVisualIndex = useJellyIndex(panelTargetIndex)
  const planTargetIndex = Math.max(
    0,
    day.weatherPlans?.findIndex((plan) => plan.id === selectedPlan?.id) ?? 0,
  )
  const planVisualIndex = useJellyIndex(planTargetIndex)
  const progress = Math.round((completedCount / Math.max(1, day.todos.length)) * 100)
  const nextDay = tripDays.find((item) => item.day === day.day + 1)
  const routeColumns = useMemo(() => {
    return `repeat(${Math.min(4, day.routeSteps.length)}, minmax(0, 1fr))`
  }, [day.routeSteps.length])
  const panelIndicatorStyle = {
    transform: `translate3d(${panelVisualIndex * 100}%, 0, 0)`,
  } as CSSProperties
  const planSwitchStyle = {
    '--tab-count': day.weatherPlans?.length ?? 1,
  } as CSSProperties
  const planIndicatorStyle = {
    transform: `translate3d(${planVisualIndex * 100}%, 0, 0)`,
  } as CSSProperties

  const handleToggleDayTodo = (todo: string, done: boolean) => {
    onToggleTodo(todoKey(day.id, todo))
    if (!done && completedCount + 1 >= day.todos.length) {
      setActivePanel('route')
    }
  }

  return (
    <main className="app-shell" aria-label={`${day.date} Day ${day.day} 路书`}>
      <section className="phone-canvas">
        <div className="hero-card">
          <img className="hero-image" src={day.heroImage} alt={day.heroAlt} />
          <div className="hero-scrim" />

          <header className="hero-nav">
            <button
              className="glass-icon-button"
              type="button"
              aria-label="返回行程列表"
              onClick={() => openAppHash('trip')}
            >
              <ChevronLeft size={22} strokeWidth={2.8} />
            </button>
            <button
              className={`glass-icon-button ${liked ? 'is-liked' : ''}`}
              type="button"
              aria-label="收藏这一天"
              onClick={onToggleLike}
            >
              <Heart size={20} strokeWidth={2.8} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </header>

          <div className="hero-content">
            <div className="day-pill">
              <CalendarDays size={15} />
              {day.date} Day {day.day}
            </div>
            <h1>
              <span>{day.shortTitle}</span>
              <span>{day.title}</span>
            </h1>
            <p>{day.summary}</p>
          </div>
        </div>

        <section className="summary-deck" aria-label="当天摘要">
          <div className="summary-card primary">
            <div>
              <span>今日重点</span>
              <strong>{day.focus}</strong>
              <em>{day.focusNote}</em>
            </div>
            <Mountain size={30} strokeWidth={2.4} />
          </div>
          {day.metrics.map((metric) => (
            <div className="summary-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
          <div className="summary-card route-summary-card">
            <span>今日动线</span>
            <div className="summary-route-steps" style={{ gridTemplateColumns: routeColumns }}>
              {day.routeSteps.map((step) => (
                <strong className="summary-route-step" key={`${step.label}-${step.name}`}>
                  <small>{step.label}</small>
                  <b>{step.name}</b>
                  <em>{step.note}</em>
                </strong>
              ))}
            </div>
          </div>
        </section>

        {day.importantTip ? (
          <section className="soft-alert">
            <div className="alert-icon">
              <Umbrella size={19} />
            </div>
            <div>
              <strong>重要提醒</strong>
              <p>{day.importantTip}</p>
            </div>
          </section>
        ) : null}

        {day.previewContextIds.length ? (
          <section className="place-preview" aria-label="今日核心看点">
            <div>
              <span>Highlights</span>
              <h2>今日核心看点</h2>
            </div>
            <div className="place-mini-row">
              {day.previewContextIds.map((cardId) => {
                const card = contextCardMap.get(cardId)
                if (!card) return null
                return (
                  <button
                    className="place-mini-card"
                    data-context-id={card.id}
                    type="button"
                    key={card.id}
                    onClick={() => onOpenContext(card.id)}
                  >
                    {card.image ? <img src={card.image} alt="" /> : <span className="mini-fallback">{card.actionLabel}</span>}
                    <span>{card.name}</span>
                  </button>
                )
              })}
            </div>
          </section>
        ) : null}

        <section className="day-panels" aria-label="当天信息切换">
          <div className="content-tabs" role="tablist" aria-label={`Day ${day.day} 内容`}>
            <span className="content-tab-indicator" style={panelIndicatorStyle} aria-hidden="true" />
            <button
              className={activePanel === 'prep' ? 'is-active' : ''}
              type="button"
              role="tab"
              aria-selected={activePanel === 'prep'}
              onClick={() => setActivePanel('prep')}
            >
              <ListChecks size={17} />
              出发前确认
              <span>
                {completedCount}/{day.todos.length}
              </span>
            </button>
            <button
              className={activePanel === 'route' ? 'is-active' : ''}
              type="button"
              role="tab"
              aria-selected={activePanel === 'route'}
              onClick={() => setActivePanel('route')}
            >
              <Route size={17} />
              今天怎么走
            </button>
          </div>

          {activePanel === 'route' ? (
            <div className="panel-content" role="tabpanel">
              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <span>Timeline</span>
                    <h2>今天怎么走</h2>
                  </div>
                  <div className="tiny-status">{day.intensity}</div>
                </div>

                <div className="timeline">
                  {day.timeline.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <article
                        className={`timeline-item tone-${item.tone} ${item.featured ? 'is-featured' : ''}`}
                        key={`${item.time}-${item.title}`}
                        style={{ '--delay': `${index * 42}ms` } as CSSProperties}
                      >
                        <div className="timeline-time">{item.time}</div>
                        <div className="timeline-node">
                          <Icon size={18} strokeWidth={2.6} />
                        </div>
                        <div className="timeline-card">
                          <div className="timeline-card-title">
                            <h3>{item.title}</h3>
                            {item.featured ? <span>核心</span> : null}
                          </div>
                          <p className="timeline-meta">{item.meta}</p>
                          <p>{item.detail}</p>
                          {item.contextIds?.length ? (
                            <div className="timeline-context-actions">
                              {item.contextIds.map((cardId) => {
                                const card = contextCardMap.get(cardId)
                                if (!card) return null
                                return (
                                  <button
                                    type="button"
                                    className={`context-chip context-${card.kind}`}
                                    data-context-id={card.id}
                                    key={card.id}
                                    title={`${card.actionLabel}：${card.name}`}
                                    onClick={() => onOpenContext(card.id)}
                                  >
                                    <MapPin size={14} />
                                    <span className="context-chip-label">{card.actionLabel}</span>
                                    <span className="context-chip-name">{card.name}</span>
                                  </button>
                                )
                              })}
                            </div>
                          ) : null}
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>

              {selectedPlan && day.weatherPlans?.length ? (
                <section className="section-block compact">
                  <div className="section-heading">
                    <div>
                      <span>Plan</span>
                      <h2>当天方案</h2>
                    </div>
                  </div>
                  <div className="plan-switch" style={planSwitchStyle}>
                    <span className="plan-switch-indicator" style={planIndicatorStyle} aria-hidden="true" />
                    {day.weatherPlans.map((plan) => (
                      <button
                        className={plan.id === selectedPlan.id ? 'is-active' : ''}
                        key={plan.id}
                        type="button"
                        onClick={() => onSelectPlan(day.id, plan.id)}
                      >
                        {plan.label}
                      </button>
                    ))}
                  </div>
                  <article className="selected-plan">
                    <div className="selected-plan-icon">
                      <CloudSun size={25} />
                    </div>
                    <div>
                      <h3>{selectedPlan.title}</h3>
                      <p>{selectedPlan.detail}</p>
                    </div>
                  </article>
                </section>
              ) : null}

              <section className="section-block compact">
                <div className="section-heading">
                  <div>
                    <span>Stay</span>
                    <h2>住宿与备注</h2>
                  </div>
                </div>
                <article className="selected-plan stay-card">
                  <div className="selected-plan-icon">
                    <BedDouble size={24} />
                  </div>
                  <div>
                    <h3>{day.accommodation}</h3>
                    <p>{day.note}</p>
                  </div>
                </article>
              </section>
            </div>
          ) : (
            <div className="panel-content" role="tabpanel">
              <section className="section-block prep-panel">
                <div className="section-heading">
                  <div>
                    <span>Checklist</span>
                    <h2>当日 To-do</h2>
                  </div>
                  <div className="progress-badge">{progress}%</div>
                </div>
                <div className="progress-track" aria-label={`待办完成度 ${progress}%`}>
                  <span style={{ width: `${progress}%` }} />
                </div>
                <div className="todo-list">
                  {day.todos.map((todo) => {
                    const key = todoKey(day.id, todo)
                    const done = completedTodos.includes(key)
                    return (
                      <button
                        className={`todo-item ${done ? 'is-done' : ''}`}
                        key={key}
                        type="button"
                        onClick={() => handleToggleDayTodo(todo, done)}
                      >
                        <span className="todo-check">
                          {done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                        </span>
                        <span>{todo}</span>
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>
          )}
        </section>

        {nextDay ? (
          <section className="next-card">
            <div>
              <span>下一站</span>
              <h2>
                {nextDay.date} Day {nextDay.day} {nextDay.shortTitle}
              </h2>
              <p>{nextDay.summary}</p>
            </div>
            <button type="button" onClick={() => openAppHash(nextDay.id)}>
              <Navigation size={18} />
              看 Day {nextDay.day}
            </button>
          </section>
        ) : null}
      </section>
    </main>
  )
}

function getDefaultPanel(day: TripDay, completedTodos: string[]) {
  return day.todos.every((todo) => completedTodos.includes(todoKey(day.id, todo))) ? 'route' : 'prep'
}

function todoKey(dayId: string, todo: string) {
  return `${dayId}:${todo}`
}
