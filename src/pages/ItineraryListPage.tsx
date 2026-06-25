import { BedDouble, CalendarDays, Car, Clock, ListChecks, Sparkles } from 'lucide-react'
import { RouteMapCard } from '../components/RouteMapCard'
import { tripDays } from '../data/tripData'
import { openAppHash } from '../utils/storage'

type ItineraryListPageProps = {
  likedDays: string[]
}

export function ItineraryListPage({ likedDays }: ItineraryListPageProps) {
  return (
    <main className="app-shell" aria-label="行程列表">
      <section className="phone-canvas page-canvas">
        <header className="overview-hero page-hero">
          <img src="/trip-media/lake-wanaka.jpg" alt="新西兰湖边行程列表背景" />
          <div className="overview-hero-content">
            <span>Itinerary</span>
            <h1>09.24-10.06 全部行程</h1>
            <p>先看每天节奏，再点进具体日期。重点日、早起日、长途交通日和恢复日都已标出来。</p>
          </div>
        </header>

        <RouteMapCard compact />

        <section className="day-list" aria-label="每日行程">
          {tripDays.map((day) => (
            <button
              className={`day-list-card ${day.day === 4 || day.day === 9 ? 'is-key' : ''}`}
              type="button"
              key={day.id}
              onClick={() => openAppHash(day.id)}
            >
              <img src={day.heroImage} alt="" />
              <div className="day-list-body">
                <div className="day-list-topline">
                  <span>
                    <CalendarDays size={14} />
                    {day.date} Day {day.day}
                  </span>
                  {likedDays.includes(day.id) ? <em>已收藏</em> : null}
                </div>
                <h2>{day.title}</h2>
                <p>{day.summary}</p>
                <div className="day-list-meta">
                  <span>
                    <BedDouble size={13} />
                    {day.accommodation}
                  </span>
                  <span>
                    <Clock size={13} />
                    {day.intensity}
                  </span>
                </div>
                <div className="status-chip-row">
                  {day.early ? (
                    <strong>
                      <Clock size={12} />
                      早起
                    </strong>
                  ) : null}
                  {day.longTransit ? (
                    <strong>
                      <Car size={12} />
                      长交通
                    </strong>
                  ) : null}
                  {day.freeDay ? (
                    <strong>
                      <Sparkles size={12} />
                      自由/恢复
                    </strong>
                  ) : null}
                  {day.requiredBooking ? (
                    <strong>
                      <ListChecks size={12} />
                      有预订
                    </strong>
                  ) : null}
                </div>
              </div>
            </button>
          ))}
        </section>
      </section>
    </main>
  )
}
