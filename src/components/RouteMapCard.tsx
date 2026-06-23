import { Maximize2, Route, X } from 'lucide-react'
import { useState } from 'react'

type RouteMapCardProps = {
  compact?: boolean
}

const routeMapImage = '/trip-media/south-island-route-map.png'
const routeSummary =
  'Christchurch → Tekapo → Twizel → Mt Cook → Wanaka → Arrowtown → Queenstown → Te Anau → Milford Sound → Queenstown → Cromwell → Omarama → Tekapo / Twizel → Christchurch'

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
          <img src={routeMapImage} alt="2026 国庆新西兰南岛自驾路线手绘图" />
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
            <img className="route-map-modal-image" src={routeMapImage} alt="放大版 2026 国庆新西兰南岛自驾路线手绘图" />
          </article>
        </div>
      ) : null}
    </>
  )
}
