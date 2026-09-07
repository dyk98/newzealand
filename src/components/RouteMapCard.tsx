import { Maximize2, Route, X } from 'lucide-react'
import { useState } from 'react'

type RouteMapCardProps = {
  compact?: boolean
}

const routeMapImage = '/trip-media/south-island-route-map-watercolor.png'
const routeSummary =
  'Christchurch → Tekapo → Twizel ⇄ Mt Cook → Wanaka ⇄ Cardrona 滑雪 → Real Guns 射击 →（Arrowtown 条件性短停）→ Queenstown → Te Anau ⇄ Milford Sound（RealNZ 大巴 + 游船）→ Queenstown → Cromwell → Omarama →（Pukaki 条件性短停）→ Tekapo → Christchurch'

export function RouteMapCard({ compact = false }: RouteMapCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const openMap = () => {
    setIsOpen(true)
  }

  const closeMap = () => {
    setIsOpen(false)
  }

  return (
    <>
      <section className={`route-map-card ${compact ? 'is-compact' : ''}`} aria-label="本次南岛自驾路线图">
        <button className="route-map-preview" type="button" onClick={openMap}>
          <img src={routeMapImage} alt="按行程顺序绘制的南岛自驾示意图，不按地理比例" />
          <span className="route-map-expand">
            <Maximize2 size={16} />
            放大
          </span>
        </button>
        <div className="route-map-copy">
          <span>
            <Route size={16} />
            Route Map
          </span>
          <h2>本次南岛自驾路线</h2>
          <p>{routeSummary}</p>
        </div>
      </section>

      {isOpen ? (
        <div className="route-map-modal-backdrop" role="presentation" onClick={closeMap}>
          <article
            className="route-map-modal"
            role="dialog"
            aria-modal="true"
            aria-label="放大查看本次南岛自驾路线图"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="route-map-modal-close" type="button" aria-label="关闭路线图" onClick={closeMap}>
              <X size={19} />
            </button>
            <img className="route-map-modal-image" src={routeMapImage} alt="放大版南岛自驾行程顺序示意图，不按地理比例" />
          </article>
        </div>
      ) : null}
    </>
  )
}
