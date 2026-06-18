import { useEffect, useRef, useState } from 'react'

export function useJellyIndex(targetIndex: number) {
  const [visualIndex, setVisualIndex] = useState(targetIndex)
  const positionRef = useRef(targetIndex)
  const velocityRef = useRef(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current)

    if (Math.abs(positionRef.current - targetIndex) < 0.001) {
      positionRef.current = targetIndex
      velocityRef.current = 0
      setVisualIndex(targetIndex)
      return undefined
    }

    const tick = () => {
      const distance = targetIndex - positionRef.current
      velocityRef.current = (velocityRef.current + distance * 0.18) * 0.72
      positionRef.current += velocityRef.current

      if (Math.abs(distance) < 0.001 && Math.abs(velocityRef.current) < 0.001) {
        positionRef.current = targetIndex
        velocityRef.current = 0
        setVisualIndex(targetIndex)
        frameRef.current = null
        return
      }

      setVisualIndex(positionRef.current)
      frameRef.current = window.requestAnimationFrame(tick)
    }

    frameRef.current = window.requestAnimationFrame(tick)

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [targetIndex])

  return visualIndex
}
