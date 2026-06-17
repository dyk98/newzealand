import { CheckCircle2, Circle, Clock, Flag, ListChecks, Plane, ShieldCheck } from 'lucide-react'
import { BottomNav } from '../components/BottomNav'
import { todoGroups, tripDays } from '../data/tripData'
import { openAppHash } from '../utils/storage'

type TodosPageProps = {
  completedTodoIds: string[]
  onToggleTodo: (todoId: string) => void
}

export function TodosPage({ completedTodoIds, onToggleTodo }: TodosPageProps) {
  const total = todoGroups.reduce((sum, group) => sum + group.items.length, 0)
  const completed = completedTodoIds.length
  const progress = Math.round((completed / Math.max(1, total)) * 100)

  return (
    <main className="app-shell" aria-label="统一待办">
      <section className="phone-canvas page-canvas">
        <header className="list-hero todo-hero">
          <span>Checklist</span>
          <h1>出发前和旅途中待办</h1>
          <p>只保存在本机，不做多人同步。这里管全局准备，每一天详情里管当天提醒。</p>
        </header>

        <section className="todo-progress-card">
          <div>
            <ListChecks size={24} />
            <span>完成进度</span>
          </div>
          <strong>{progress}%</strong>
          <div className="progress-track" aria-label={`总待办完成度 ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <p>
            {completed}/{total} 项已完成
          </p>
        </section>

        <section className="todo-page-groups" aria-label="待办分组">
          {todoGroups.map((group) => {
            const groupDone = group.items.filter((item) => completedTodoIds.includes(item.id)).length
            return (
              <article className="todo-group-card" key={group.id}>
                <div className="todo-group-heading">
                  <div className="todo-group-icon">{groupIcon(group.id)}</div>
                  <div>
                    <h2>{group.title}</h2>
                    <p>{group.subtitle}</p>
                  </div>
                  <span>
                    {groupDone}/{group.items.length}
                  </span>
                </div>
                <div className="todo-list">
                  {group.items.map((item) => {
                    const done = completedTodoIds.includes(item.id)
                    const day = item.dayId ? tripDays.find((tripDay) => tripDay.id === item.dayId) : undefined
                    return (
                      <button
                        className={`todo-item todo-page-item priority-${item.priority ?? 'medium'} ${done ? 'is-done' : ''}`}
                        type="button"
                        key={item.id}
                        onClick={() => onToggleTodo(item.id)}
                      >
                        <span className="todo-check">
                          {done ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                        </span>
                        <span className="todo-copy">
                          <b>{item.text}</b>
                          <small>
                            {item.due ? `截止 ${item.due}` : ''}
                            {item.due && day ? ' · ' : ''}
                            {day ? `${day.date} Day ${day.day}` : ''}
                          </small>
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
            <span>每日提醒</span>
            <h2>当天细节在 Day 详情里</h2>
            <p>全局待办解决“该不该准备”；每天详情解决“当天几点怎么做”。</p>
          </div>
          <button type="button" onClick={() => openAppHash('trip')}>
            <Flag size={18} />
            看行程
          </button>
        </section>

        <BottomNav active="todos" />
      </section>
    </main>
  )
}

function groupIcon(groupId: string) {
  if (groupId === 'documents') return <ShieldCheck size={20} />
  if (groupId === 'booking') return <Plane size={20} />
  if (groupId === 'gear') return <Clock size={20} />
  return <ListChecks size={20} />
}
