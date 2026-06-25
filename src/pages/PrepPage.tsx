import {
  BaggageClaim,
  BedDouble,
  CalendarDays,
  Car,
  CheckCircle2,
  Circle,
  Flag,
  ListChecks,
  MapPinned,
  Plane,
  ShieldCheck,
  Sparkles,
  Utensils,
  WalletCards,
} from 'lucide-react'
import { criticalPrepItems, prepBudgetCards, todoGroups, tripDays } from '../data/tripData'
import { openAppHash } from '../utils/storage'
import type { TodoItem } from '../types/trip'

type PrepPageProps = {
  completedTodoIds: string[]
  onToggleTodo: (todoId: string) => void
}

const prepTodoIds = new Set([
  ...criticalPrepItems.map((item) => item.id),
  ...todoGroups.flatMap((group) => group.items.map((item) => item.id)),
])

export function PrepPage({ completedTodoIds, onToggleTodo }: PrepPageProps) {
  const total = prepTodoIds.size
  const completed = completedTodoIds.filter((todoId) => prepTodoIds.has(todoId)).length
  const progress = Math.round((completed / Math.max(1, total)) * 100)

  return (
    <main className="app-shell" aria-label="行前准备">
      <section className="phone-canvas page-canvas">
        <header className="overview-hero page-hero prep-hero">
          <img src="/trip-media/twizel-landscape.jpg" alt="新西兰行前准备背景" />
          <div className="overview-hero-content">
            <span>Prep</span>
            <h1>行前准备</h1>
            <p>来自路书“事先准备”：先看预订和预算，再逐项勾掉证件、租车、活动和携带清单。</p>
          </div>
        </header>

        <section className="prep-critical-card" aria-label="最重要的准备">
          <div className="prep-critical-heading">
            <ShieldCheck size={22} />
            <h2>最重要的准备</h2>
          </div>
          <div className="todo-list prep-list prep-critical-list">
            {criticalPrepItems.map((item) => {
              const done = completedTodoIds.includes(item.id)

              return (
                <button
                  className={`todo-item todo-page-item prep-item priority-high ${done ? 'is-done' : ''}`}
                  type="button"
                  key={item.id}
                  onClick={() => onToggleTodo(item.id)}
                >
                  <span className="todo-check">
                    {done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </span>
                  <span className="todo-copy prep-copy">
                    <span className="todo-title-line">
                      <b>{item.text}</b>
                    </span>
                    {item.note ? <em>{item.note}</em> : null}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="todo-progress-card prep-status-card">
          <div>
            <Sparkles size={24} />
            <span>准备进度</span>
          </div>
          <strong>
            {completed}/{total}
          </strong>
          <div className="progress-track" aria-label={`行前准备完成度 ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <p>{progress}% 已完成，只统计行前准备清单。</p>
        </section>

        <section className="prep-budget-grid" aria-label="准备预算摘要">
          {prepBudgetCards.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <p>{card.note}</p>
            </article>
          ))}
        </section>

        <section className="todo-page-groups prep-page-groups" aria-label="行前准备分组">
          {todoGroups.map((group) => {
            const groupDone = group.items.filter((item) => completedTodoIds.includes(item.id)).length
            const showPriorityBadges = hasMixedPriority(group.items)

            return (
              <article className={`todo-group-card prep-group-card prep-group-${group.id}`} key={group.id}>
                <div className="todo-group-heading prep-group-heading">
                  <div className="todo-group-icon">{groupIcon(group.id)}</div>
                  <div>
                    {group.eyebrow ? <span className="prep-eyebrow">{group.eyebrow}</span> : null}
                    <h2>{group.title}</h2>
                    <p>{group.subtitle}</p>
                  </div>
                  <span>
                    {groupDone}/{group.items.length}
                  </span>
                </div>

                {group.summary ? <p className="prep-group-summary">{group.summary}</p> : null}

                <div className="todo-list prep-list">
                  {sortPrepItems(group.items).map((item) => {
                    const done = completedTodoIds.includes(item.id)
                    const day = item.dayId ? tripDays.find((tripDay) => tripDay.id === item.dayId) : undefined
                    const meta = [
                      item.due ? `截止 ${item.due}` : '',
                      item.amount,
                      day ? `${day.date} Day ${day.day}` : '',
                    ]
                      .filter(Boolean)
                      .join(' · ')

                    return (
                      <button
                        className={`todo-item todo-page-item prep-item priority-${item.priority ?? 'medium'} ${done ? 'is-done' : ''}`}
                        type="button"
                        key={item.id}
                        onClick={() => onToggleTodo(item.id)}
                      >
                        <span className="todo-check">
                          {done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                        </span>
                        <span className="todo-copy prep-copy">
                          <span className="todo-title-line">
                            <b>{item.text}</b>
                            {showPriorityBadges && isPriorityVisible(item, done) ? (
                              <span className="priority-badge">优先</span>
                            ) : null}
                          </span>
                          {meta ? <small>{meta}</small> : null}
                          {item.note ? <em>{item.note}</em> : null}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </article>
            )
          })}
        </section>

        <section className="next-card">
          <div>
            <span>旅途中提醒</span>
            <h2>每日事项放回 Day 详情</h2>
            <p>这里专门管理行前准备；当天几点怎么做、当天必须确认什么，在每天页面的 Checklist 里看。</p>
          </div>
          <button type="button" onClick={() => openAppHash('trip')}>
            <Flag size={18} />
            看行程
          </button>
        </section>
      </section>
    </main>
  )
}

function groupIcon(groupId: string) {
  if (groupId === 'stays') return <BedDouble size={20} />
  if (groupId === 'car') return <Car size={20} />
  if (groupId === 'road') return <MapPinned size={20} />
  if (groupId === 'cash') return <WalletCards size={20} />
  if (groupId === 'food') return <Utensils size={20} />
  if (groupId === 'activities') return <Plane size={20} />
  if (groupId === 'documents') return <ShieldCheck size={20} />
  if (groupId === 'packing') return <BaggageClaim size={20} />
  if (groupId === 'budget') return <WalletCards size={20} />
  if (groupId === 'calendar') return <CalendarDays size={20} />
  return <ListChecks size={20} />
}

function sortPrepItems(items: TodoItem[]) {
  const priorityRank: Record<NonNullable<TodoItem['priority']>, number> = {
    high: 0,
    medium: 1,
    low: 2,
  }

  return [...items].sort((a, b) => {
    const aRank = priorityRank[a.priority ?? 'medium']
    const bRank = priorityRank[b.priority ?? 'medium']
    return aRank - bRank
  })
}

function isPriorityVisible(item: TodoItem, done: boolean) {
  return item.priority === 'high' && !done
}

function hasMixedPriority(items: TodoItem[]) {
  const normalizedPriorities = new Set(items.map((item) => item.priority ?? 'medium'))
  return normalizedPriorities.has('high') && normalizedPriorities.size > 1
}
