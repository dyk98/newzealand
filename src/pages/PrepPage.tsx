import { useState } from 'react'
import {
  BaggageClaim,
  BedDouble,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Flag,
  ListChecks,
  MapPinned,
  Plane,
  ShieldCheck,
  Sparkles,
  Utensils,
  WalletCards,
} from 'lucide-react'
import { criticalPrepItems, prepBudgetCards, todoGroups } from '../data/tripData'
import { openAppHash } from '../utils/storage'
import type { TodoGroup, TodoItem } from '../types/trip'

type PrepPageProps = {
  completedTodoIds: string[]
  onToggleTodo: (todoId: string) => void
}

type PrepTab = 'required' | 'checklist' | 'completed'

const coreGroupIds = new Set(['stays', 'car', 'transit', 'activities', 'documents'])
const checklistGroupIds = new Set(['road', 'cash', 'food', 'packing'])
const prepTodoIds = new Set([
  ...criticalPrepItems.map((item) => item.id),
  ...todoGroups.flatMap((group) => group.items.map((item) => item.id)),
])
const itemTimingLabels: Record<string, string> = {
  'critical-complete-nztd': '出发当天',
  'car-luggage': '取车现场',
  'book-keydrop': '10.05 复核',
}

export function PrepPage({ completedTodoIds, onToggleTodo }: PrepPageProps) {
  const [activeTab, setActiveTab] = useState<PrepTab>('required')
  const completedSet = new Set(completedTodoIds)
  const coreGroups = todoGroups.filter((group) => coreGroupIds.has(group.id))
  const checklistGroups = todoGroups.filter((group) => checklistGroupIds.has(group.id))
  const coreItems = [...criticalPrepItems, ...coreGroups.flatMap((group) => group.items)]
  const checklistItems = checklistGroups.flatMap((group) => group.items)
  const completedCore = coreItems.filter((item) => completedSet.has(item.id)).length
  const completedChecklist = checklistItems.filter((item) => completedSet.has(item.id)).length
  const completedTotal = completedTodoIds.filter((todoId) => prepTodoIds.has(todoId)).length
  const pendingCore = coreItems.length - completedCore
  const pendingChecklist = checklistItems.length - completedChecklist
  const coreProgress = Math.round((completedCore / Math.max(1, coreItems.length)) * 100)
  const pendingCritical = criticalPrepItems.filter((item) => !completedSet.has(item.id))
  const completedItems = [...criticalPrepItems, ...todoGroups.flatMap((group) => group.items)].filter((item) =>
    completedSet.has(item.id),
  )
  const tabs: Array<{ id: PrepTab; label: string; count: number }> = [
    { id: 'required', label: '必办', count: pendingCore },
    { id: 'checklist', label: '行前检查', count: pendingChecklist },
    { id: 'completed', label: '已完成', count: completedTotal },
  ]

  return (
    <main className="app-shell" aria-label="行前准备">
      <section className="phone-canvas page-canvas">
        <header className="overview-hero page-hero prep-hero">
          <img src="/trip-media/twizel-landscape.jpg" alt="新西兰行前准备背景" />
          <div className="overview-hero-content">
            <span>Prep</span>
            <h1>行前准备</h1>
            <p>先完成影响出行的核心事项，再处理打包、餐饮和路况检查。</p>
          </div>
        </header>

        <section className="todo-progress-card prep-status-card" aria-label="核心准备进度">
          <div>
            <Sparkles size={24} />
            <span>核心准备进度</span>
          </div>
          <strong>
            {completedCore}/{coreItems.length}
          </strong>
          <div className="progress-track" aria-label={`核心准备完成度 ${coreProgress}%`}>
            <span style={{ width: `${coreProgress}%` }} />
          </div>
          <p>剩余 {pendingCore} 项核心待办；{checklistItems.length} 项行前检查另行统计。</p>
        </section>

        <section className="prep-tab-shell" aria-label="准备事项分类">
          <div className="prep-tabs" role="tablist" aria-label="行前准备分类">
            {tabs.map((tab) => (
              <button
                id={`prep-tab-${tab.id}`}
                className={activeTab === tab.id ? 'is-active' : ''}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`prep-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                key={tab.id}
              >
                <span>{tab.label}</span>
                <b>{tab.count}</b>
              </button>
            ))}
          </div>

          <section
            className="prep-tab-panel"
            id="prep-panel-required"
            role="tabpanel"
            aria-labelledby="prep-tab-required"
            hidden={activeTab !== 'required'}
          >
              <PrepTimingCard />

              {pendingCritical.length ? (
                <section className="prep-critical-card" aria-label="最重要的准备">
                  <div className="prep-critical-heading">
                    <ShieldCheck size={22} />
                    <div>
                      <span>Must do</span>
                      <h2>入境证件关键项</h2>
                    </div>
                  </div>
                  <div className="todo-list prep-list prep-critical-list">
                    {pendingCritical.map((item) => (
                      <PrepItemButton
                        item={item}
                        done={false}
                        timingLabel={getTimingLabel(item)}
                        priorityLabel="必须"
                        onToggleTodo={onToggleTodo}
                        key={item.id}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              <PrepGroupList
                groups={coreGroups}
                completedSet={completedSet}
                priorityLabel="必须"
                showTiming
                onToggleTodo={onToggleTodo}
              />

              <BudgetDisclosure />
          </section>

          <section
            className="prep-tab-panel"
            id="prep-panel-checklist"
            role="tabpanel"
            aria-labelledby="prep-tab-checklist"
            hidden={activeTab !== 'checklist'}
          >
              <div className="prep-tab-intro">
                <ListChecks size={22} />
                <div>
                  <strong>不计入核心准备进度</strong>
                  <p>路况、现金、餐饮和打包仍保留，按需展开处理。</p>
                </div>
              </div>
              <PrepGroupList
                groups={checklistGroups}
                completedSet={completedSet}
                priorityLabel="重点"
                onToggleTodo={onToggleTodo}
              />
              {pendingChecklist === 0 ? <PrepEmptyState title="行前检查已全部完成" /> : null}
          </section>

          <section
            className="prep-tab-panel"
            id="prep-panel-completed"
            role="tabpanel"
            aria-labelledby="prep-tab-completed"
            hidden={activeTab !== 'completed'}
          >
              <div className="prep-tab-intro is-completed">
                <CheckCircle2 size={22} />
                <div>
                  <strong>{completedTotal} 项已完成</strong>
                  <p>已订住宿、租车等不再占用待办页面；点击仍可撤销。</p>
                </div>
              </div>

              <div className="todo-list prep-list prep-completed-list">
                {completedItems.map((item) => (
                  <PrepItemButton
                    item={item}
                    done
                    onToggleTodo={onToggleTodo}
                    key={item.id}
                  />
                ))}
              </div>
              {completedTotal === 0 ? <PrepEmptyState title="还没有完成的事项" /> : null}
          </section>
        </section>

        <section className="next-card">
          <div>
            <span>旅途中提醒</span>
            <h2>每日事项放回 Day 详情</h2>
            <p>这里管理出发前准备；当天几点怎么做，在每天页面的 Checklist 里看。</p>
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

function PrepTimingCard() {
  return (
    <section className="prep-timing-card" aria-label="必办事项时间边界">
      <div className="prep-timing-heading">
        <Clock3 size={22} />
        <div>
          <span>Timing</span>
          <h2>不是所有项目都要在离家前完成</h2>
        </div>
      </div>
      <div className="prep-timing-grid">
        <article>
          <b>离家前完成</b>
          <p>尽早完成必要预订、NZeTA、证件保险和酒店 / 交通书面确认，不把审批拖到出发前一天。</p>
        </article>
        <article className="is-departure-day">
          <b>09.24 出发当天</b>
          <p>NZTD 最早中国时间 16:40 提交；17:00 到 HKG 后办理，MEL 登机前完成。</p>
        </article>
        <article>
          <b>旅途中</b>
          <p>取车现场检查行李容量；10.05 再确认还车和末班接驳。</p>
        </article>
      </div>
    </section>
  )
}

function PrepGroupList({
  groups,
  completedSet,
  priorityLabel,
  showTiming = false,
  onToggleTodo,
}: {
  groups: TodoGroup[]
  completedSet: Set<string>
  priorityLabel?: string
  showTiming?: boolean
  onToggleTodo: (todoId: string) => void
}) {
  const visibleGroups = groups
    .map((group) => ({
      group,
      items: group.items.filter((item) => !completedSet.has(item.id)),
    }))
    .filter(({ items }) => items.length)

  return (
    <section className="todo-page-groups prep-page-groups" aria-label="待办分组">
      {visibleGroups.map(({ group, items }) => (
        <PrepGroupDisclosure
          group={group}
          items={items}
          statusLabel={`剩 ${items.length}`}
          completedSet={completedSet}
          priorityLabel={priorityLabel}
          showTiming={showTiming}
          onToggleTodo={onToggleTodo}
          key={group.id}
        />
      ))}
    </section>
  )
}

function PrepGroupDisclosure({
  group,
  items,
  statusLabel,
  completedSet,
  priorityLabel,
  showTiming = false,
  onToggleTodo,
}: {
  group: TodoGroup
  items: TodoItem[]
  statusLabel: string
  completedSet: Set<string>
  priorityLabel?: string
  showTiming?: boolean
  onToggleTodo: (todoId: string) => void
}) {
  const showPriorityBadges = hasMixedPriority(items)

  return (
    <details className={`todo-group-card prep-group-card prep-group-disclosure prep-group-${group.id}`}>
      <summary className="todo-group-heading prep-group-heading">
        <div className="todo-group-icon">{groupIcon(group.id)}</div>
        <div className="prep-group-heading-copy">
          {group.eyebrow ? <span className="prep-eyebrow">{group.eyebrow}</span> : null}
          <h2>{group.title}</h2>
          <p>{group.subtitle}</p>
        </div>
        <span className="prep-group-count">{statusLabel}</span>
        <ChevronDown className="prep-group-chevron" size={18} aria-hidden="true" />
      </summary>

      <div className="todo-list prep-list">
        {sortPrepItems(items).map((item) => {
          const done = completedSet.has(item.id)

          return (
            <PrepItemButton
              item={item}
              done={done}
              timingLabel={showTiming ? getTimingLabel(item) : undefined}
              priorityLabel={showPriorityBadges && isPriorityVisible(item, done) ? priorityLabel : undefined}
              onToggleTodo={onToggleTodo}
              key={item.id}
            />
          )
        })}
      </div>
    </details>
  )
}

function PrepItemButton({
  item,
  done,
  timingLabel,
  priorityLabel,
  onToggleTodo,
}: {
  item: TodoItem
  done: boolean
  timingLabel?: string
  priorityLabel?: string
  onToggleTodo: (todoId: string) => void
}) {
  const showDeadline = Boolean(item.due && (!timingLabel || item.due !== '出发前'))

  return (
    <button
      className={`todo-item todo-page-item prep-item priority-${item.priority ?? 'medium'} ${done ? 'is-done' : ''}`}
      type="button"
      onClick={() => onToggleTodo(item.id)}
    >
      <span className="todo-check">{done ? <CheckCircle2 size={22} /> : <Circle size={22} />}</span>
      <span className="todo-copy prep-copy">
        <span className="todo-title-line">
          <b>{item.text}</b>
          {timingLabel ? <span className="timing-badge">{timingLabel}</span> : null}
          {showDeadline ? <span className="deadline-badge">截止 {item.due}</span> : null}
          {priorityLabel ? <span className="priority-badge">{priorityLabel}</span> : null}
        </span>
      </span>
    </button>
  )
}

function BudgetDisclosure() {
  return (
    <details className="prep-budget-disclosure">
      <summary>
        <span className="todo-group-icon">
          <WalletCards size={20} />
        </span>
        <span>
          <small>Budget</small>
          <strong>预算与已订摘要</strong>
          <em>住宿、租车、活动和证件费用</em>
        </span>
        <b>{prepBudgetCards.length} 项</b>
        <ChevronDown size={18} aria-hidden="true" />
      </summary>
      <section className="prep-budget-grid" aria-label="准备预算摘要">
        {prepBudgetCards.map((card) => (
          <article key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.note}</p>
          </article>
        ))}
      </section>
    </details>
  )
}

function PrepEmptyState({ title }: { title: string }) {
  return (
    <div className="prep-empty-state">
      <CheckCircle2 size={28} />
      <strong>{title}</strong>
    </div>
  )
}

function getTimingLabel(item: TodoItem) {
  return itemTimingLabels[item.id] ?? '离家前'
}

function groupIcon(groupId: string) {
  if (groupId === 'critical') return <ShieldCheck size={20} />
  if (groupId === 'stays') return <BedDouble size={20} />
  if (groupId === 'car') return <Car size={20} />
  if (groupId === 'transit') return <Plane size={20} />
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
