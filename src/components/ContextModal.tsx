import { useRef, useState } from 'react'
import type { UIEvent } from 'react'
import { ExternalLink, Info, X } from 'lucide-react'
import type { ContextCard, ContextTab } from '../types/trip'
import { openExternalLink } from '../utils/storage'

type ContextModalProps = {
  card: ContextCard
  closing: boolean
  onClose: () => void
}

export function ContextModal({ card, closing, onClose }: ContextModalProps) {
  const [modalState, setModalState] = useState<{
    cardId: string
    activeTab: ContextTab
    activeImageIndex: number
  }>({
    cardId: card.id,
    activeTab: 'overview',
    activeImageIndex: 0,
  })
  const trackRef = useRef<HTMLDivElement | null>(null)
  const images = card.gallery?.length ? card.gallery : card.image ? [card.image] : []
  const galleryImages = images.slice(1)
  const activeTab = modalState.cardId === card.id ? modalState.activeTab : 'overview'
  const activeImageIndex = modalState.cardId === card.id ? modalState.activeImageIndex : 0
  const tabs = [
    { id: 'overview' as const, label: '速览', available: true },
    { id: 'story' as const, label: '了解', available: Boolean(card.sections?.length) },
    { id: 'rules' as const, label: '规则', available: Boolean(card.respectTips?.length) },
    {
      id: 'photo' as const,
      label: '拍照',
      available: Boolean(card.photoTips?.length || galleryImages.length),
    },
  ].filter((tab) => tab.available)

  const currentTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : 'overview'

  const selectImage = (index: number) => {
    const boundedIndex = Math.max(0, Math.min(index, images.length - 1))
    setModalState({
      cardId: card.id,
      activeTab: currentTab,
      activeImageIndex: boundedIndex,
    })
    trackRef.current?.scrollTo({
      left: trackRef.current.clientWidth * boundedIndex,
      behavior: 'smooth',
    })
  }

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const nextIndex = Math.round(target.scrollLeft / Math.max(1, target.clientWidth))
    if (nextIndex !== activeImageIndex) {
      setModalState({
        cardId: card.id,
        activeTab: currentTab,
        activeImageIndex: nextIndex,
      })
    }
  }

  return (
    <div
      className={`context-modal-backdrop ${closing ? 'is-closing' : ''}`}
      role="presentation"
      onClick={onClose}
    >
      <article
        className={`context-modal context-${card.kind}`}
        role="dialog"
        aria-modal="true"
        aria-label={`${card.name} 相关信息`}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="drawer-close" type="button" aria-label="关闭相关信息" onClick={onClose}>
          <X size={18} />
        </button>

        {images.length ? (
          <div className="context-hero-carousel">
            <div
              className="context-hero-track"
              ref={trackRef}
              onScroll={handleScroll}
              aria-label={`${card.name} 图片轮播`}
              key={card.id}
            >
              {images.map((image, index) => (
                <img
                  className="context-hero-image"
                  src={image}
                  alt={`${card.name} 图片 ${index + 1}`}
                  key={image}
                />
              ))}
            </div>
            {images.length > 1 ? (
              <>
                <div className="context-image-count">
                  {activeImageIndex + 1}/{images.length}
                </div>
                <div className="context-hero-dots" aria-label="选择图片">
                  {images.map((image, index) => (
                    <button
                      className={activeImageIndex === index ? 'is-active' : ''}
                      type="button"
                      aria-label={`查看第 ${index + 1} 张图片`}
                      key={image}
                      onClick={() => selectImage(index)}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <div className="context-modal-visual">
            <Info size={34} />
          </div>
        )}

        <div className="context-modal-body">
          <span>{card.eyebrow}</span>
          <h2>{card.name}</h2>
          <strong>{card.cn}</strong>

          <div className="context-inner-tabs" role="tablist" aria-label="详情内容">
            {tabs.map((tab) => (
              <button
                className={currentTab === tab.id ? 'is-active' : ''}
                type="button"
                role="tab"
                aria-selected={currentTab === tab.id}
                key={tab.id}
                onClick={() =>
                  setModalState({
                    cardId: card.id,
                    activeTab: tab.id,
                    activeImageIndex,
                  })
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {currentTab === 'overview' ? (
            <div className="context-tab-panel" role="tabpanel" key="overview">
              <p>{card.body}</p>
              {card.quickFacts?.length ? (
                <div className="quick-facts" aria-label="快速信息">
                  {card.quickFacts.map((fact) => (
                    <span key={fact}>{fact}</span>
                  ))}
                </div>
              ) : null}
              {card.links?.length ? (
                <div className="context-links" aria-label="官方链接">
                  {card.links.map((link) => (
                    <button type="button" key={link.url} onClick={() => openExternalLink(link.url)}>
                      {link.label}
                      <ExternalLink size={14} />
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="tag-row">
                {card.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              {card.source ? <p className="context-source">图片来源：{card.source}</p> : null}
            </div>
          ) : null}

          {currentTab === 'story' && card.sections?.length ? (
            <div className="context-tab-panel" role="tabpanel" key="story">
              <div className="context-detail-sections">
                {card.sections.map((section, index) => (
                  <details className="context-detail-section" key={section.title} open={index === 0}>
                    <summary>{section.title}</summary>
                    <p>{section.body}</p>
                  </details>
                ))}
              </div>
            </div>
          ) : null}

          {currentTab === 'rules' && card.respectTips?.length ? (
            <div className="context-tab-panel" role="tabpanel" key="rules">
              <section className="respect-guide" aria-label="习俗和规则提醒">
                <h3>习俗 / 规则提醒</h3>
                <ol>
                  {card.respectTips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ol>
              </section>
            </div>
          ) : null}

          {currentTab === 'photo' ? (
            <div className="context-tab-panel" role="tabpanel" key="photo">
              {images.length > 1 ? (
                <div className="context-photo-thumbs" aria-label="图片缩略图">
                  {images.map((image, index) => (
                    <button
                      className={activeImageIndex === index ? 'is-active' : ''}
                      type="button"
                      key={image}
                      onClick={() => selectImage(index)}
                    >
                      <img src={image} alt={`${card.name} 缩略图 ${index + 1}`} />
                    </button>
                  ))}
                </div>
              ) : null}
              {card.photoTips?.length ? (
                <section className="photo-guide" aria-label="拍照指导">
                  <h3>拍照指导</h3>
                  <ol>
                    {card.photoTips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ol>
                </section>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>
    </div>
  )
}
