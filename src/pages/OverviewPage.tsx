import { BaggageClaim, Map as MapIcon } from 'lucide-react'
import { prepBudgetCards, todoGroups } from '../data/tripData'
import { openAppHash } from '../utils/storage'

type OverviewPageProps = {
  completedTodoIds: string[]
}

export function OverviewPage({ completedTodoIds }: OverviewPageProps) {
  const allPrepItems = todoGroups.flatMap((group) => group.items)
  const prepItemIds = new Set(allPrepItems.map((item) => item.id))
  const completedPrepItems = completedTodoIds.filter((todoId) => prepItemIds.has(todoId)).length
  const progress = Math.round((completedPrepItems / Math.max(1, allPrepItems.length)) * 100)
  const stayBudget = prepBudgetCards.find((card) => card.label === '住宿控制目标')?.value ?? 'NZ$5500-7200'
  const stats = [
    { label: '旅行天数', value: '13 天', note: '09.24-10.06' },
    { label: '南岛自驾', value: '11 天', note: '基督城取还车' },
    { label: '准备进度', value: `${progress}%`, note: `${completedPrepItems}/${allPrepItems.length} 项完成` },
    { label: '住宿目标', value: stayBudget, note: '四人全程' },
  ]

  return (
    <main className="app-shell" aria-label="旅行总览">
      <section className="phone-canvas page-canvas">
        <section className="overview-hero">
          <img src="/trip-media/lake-pukaki-mt-cook.jpg" alt="新西兰湖泊和雪山路线总览" />
          <div className="overview-hero-content">
            <span>2026 国庆新西兰行</span>
            <h1>13 天南岛自驾路书</h1>
            <p>09.24 广州出发，经香港、悉尼、基督城，完成南岛自驾主线。</p>
          </div>
        </section>

        <section className="overview-stats overview-dashboard" aria-label="核心状态">
          {stats.map((stat) => (
            <article key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <p>{stat.note}</p>
            </article>
          ))}
        </section>

        <section className="overview-action-grid" aria-label="主要入口">
          <button className="overview-action-button is-primary" type="button" onClick={() => openAppHash('trip')}>
            <MapIcon size={24} />
            <span>行程</span>
            <strong>看完整 Day 列表</strong>
            <p>每天路线、时间线、住宿和当天 checklist 都在这里。</p>
          </button>

          <button className="overview-action-button" type="button" onClick={() => openAppHash('todos')}>
            <BaggageClaim size={24} />
            <span>准备</span>
            <strong>处理行前清单</strong>
            <p>住宿、租车、活动、证件保险和携带物品集中确认。</p>
          </button>
        </section>
      </section>
    </main>
  )
}
