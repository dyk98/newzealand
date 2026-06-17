import {
  BedDouble,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  Plane,
  WalletCards,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { BottomNav } from '../components/BottomNav'
import { budgetCards, overviewStats, todoGroups, tripDays } from '../data/tripData'
import { openAppHash } from '../utils/storage'

type OverviewPageProps = {
  completedTodoIds: string[]
}

export function OverviewPage({ completedTodoIds }: OverviewPageProps) {
  const allTodos = todoGroups.flatMap((group) => group.items)
  const progress = Math.round((completedTodoIds.length / Math.max(1, allTodos.length)) * 100)
  const earlyDays = tripDays.filter((day) => day.early)
  const longTransitDays = tripDays.filter((day) => day.longTransit)
  const freeDays = tripDays.filter((day) => day.freeDay)
  const stays = tripDays.map((day) => `${day.date} ${day.accommodation}`)

  return (
    <main className="app-shell" aria-label="旅行总览">
      <section className="phone-canvas page-canvas">
        <section className="overview-hero">
          <img src="/trip-media/lake-pukaki-mt-cook.jpg" alt="新西兰湖泊和雪山路线总览" />
          <div className="overview-hero-content">
            <span>2026 国庆新西兰行</span>
            <h1>13 天南岛自驾路书</h1>
            <p>09.24 广州出发，经香港、悉尼、基督城，完成 Mt Cook、Wanaka、Queenstown、Te Anau、Milford Sound 主线。</p>
          </div>
        </section>

        <section className="overview-stats" aria-label="核心概览">
          {overviewStats.map((stat) => (
            <article key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </section>

        <section className="section-block compact">
          <div className="section-heading">
            <div>
              <span>Flow</span>
              <h2>整体路线节奏</h2>
            </div>
          </div>
          <div className="route-rhythm">
            <article>
              <Plane size={22} />
              <strong>先跨境中转</strong>
              <p>广州包车到 HKG，悉尼白天短游，夜抵基督城。</p>
            </article>
            <article>
              <Car size={22} />
              <strong>中段自驾核心</strong>
              <p>Tekapo、Mt Cook、Wanaka、Queenstown、Te Anau 串成首次友好南岛线。</p>
            </article>
            <article>
              <BedDouble size={22} />
              <strong>后段留缓冲</strong>
              <p>Milford 后回 Queenstown，再从中部湖区回基督城机场。</p>
            </article>
          </div>
        </section>

        <section className="section-block compact">
          <div className="section-heading">
            <div>
              <span>Days</span>
              <h2>每天核心亮点</h2>
            </div>
            <button className="tiny-action" type="button" onClick={() => openAppHash('trip')}>
              全部行程
            </button>
          </div>
          <div className="overview-day-strip">
            {tripDays.map((day) => (
              <button
                className={`overview-day-card ${day.day === 4 ? 'is-key' : ''}`}
                type="button"
                key={day.id}
                onClick={() => openAppHash(day.id)}
              >
                <img src={day.heroImage} alt="" />
                <span>
                  {day.date} Day {day.day}
                </span>
                <strong>{day.shortTitle}</strong>
                <em>{day.focus}</em>
              </button>
            ))}
          </div>
        </section>

        <section className="section-block compact">
          <div className="section-heading">
            <div>
              <span>Sleep</span>
              <h2>每晚住宿城市</h2>
            </div>
          </div>
          <div className="stay-grid">
            {stays.map((stay) => (
              <span key={stay}>{stay}</span>
            ))}
          </div>
        </section>

        <section className="overview-alert-grid" aria-label="重点日期">
          <AlertBucket icon={<Clock size={20} />} title="早起日" items={earlyDays.map(dayLabel)} />
          <AlertBucket icon={<Car size={20} />} title="长途交通日" items={longTransitDays.map(dayLabel)} />
          <AlertBucket icon={<CalendarDays size={20} />} title="恢复 / 自由日" items={freeDays.map(dayLabel)} />
        </section>

        <section className="section-block compact">
          <div className="section-heading">
            <div>
              <span>Bookings</span>
              <h2>必须提前预订</h2>
            </div>
          </div>
          <div className="booking-priority">
            <strong>住宿：CHC / Twizel / Wanaka / Queenstown / Te Anau / CHC</strong>
            <strong>租车：09.26-10.06，7 座 SUV / MPV，确认 key drop</strong>
            <strong>Milford Sound：10.02 Te Anau 出发大巴 + 游船</strong>
            <strong>签证保险：澳洲入境、新西兰入境、驾照翻译和旅行保险</strong>
          </div>
        </section>

        <section className="section-block compact">
          <div className="section-heading">
            <div>
              <span>Budget</span>
              <h2>预算概览</h2>
            </div>
            <WalletCards size={22} />
          </div>
          <div className="budget-grid">
            {budgetCards.map((card) => (
              <article key={card.label}>
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <p>{card.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="next-card prep-overview-card">
          <div>
            <span>准备状态</span>
            <h2>{progress}% 已完成</h2>
            <p>统一待办覆盖证件、预订、装备和每日关键提醒。所有勾选状态只保存在本机。</p>
          </div>
          <button type="button" onClick={() => openAppHash('todos')}>
            <CheckCircle2 size={18} />
            看待办
          </button>
        </section>

        <BottomNav active="overview" />
      </section>
    </main>
  )
}

function AlertBucket({
  icon,
  title,
  items,
}: {
  icon: ReactNode
  title: string
  items: string[]
}) {
  return (
    <article className="overview-alert-card">
      <div>{icon}</div>
      <strong>{title}</strong>
      <p>{items.join('、')}</p>
    </article>
  )
}

function dayLabel(day: { date: string; day: number; shortTitle: string }) {
  return `${day.date} Day ${day.day} ${day.shortTitle}`
}
