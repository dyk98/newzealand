export function readStoredState<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

export function writeStoredState<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function openAppHash(hash: string) {
  const nextHash = hash.replace(/^#/, '')
  if (window.location.hash.replace(/^#/, '') === nextHash) return
  window.location.hash = nextHash
}

export function openExternalLink(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
