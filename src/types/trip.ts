import type { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'

export type ContextCardKind = 'place' | 'drive' | 'note' | 'booking' | 'food' | 'flight'
export type ContextTab = 'overview' | 'story' | 'rules' | 'photo'
export type Tone =
  | 'sun'
  | 'drive'
  | 'weather'
  | 'hike'
  | 'food'
  | 'rest'
  | 'flight'
  | 'city'
  | 'booking'

export type ContextSection = {
  title: string
  body: string
}

export type ContextLink = {
  label: string
  url: string
}

export type ContextCard = {
  id: string
  kind: ContextCardKind
  eyebrow: string
  actionLabel: string
  name: string
  cn: string
  image?: string
  source?: string
  body: string
  tags: string[]
  gallery?: string[]
  quickFacts?: string[]
  sections?: ContextSection[]
  respectTips?: string[]
  photoTips?: string[]
  links?: ContextLink[]
}

export type RouteStep = {
  label: string
  name: string
  note: string
}

export type TimelineItem = {
  time: string
  title: string
  meta: string
  detail: string
  tone: Tone
  icon: ComponentType<LucideProps>
  featured?: boolean
  contextIds?: string[]
}

export type WeatherPlan = {
  id: string
  label: string
  title: string
  detail: string
}

export type LocalFeatureCard = {
  id: string
  title: string
  subtitle?: string
  image?: string
  imageAlt?: string
  body: string
  tag?: string
  tags?: string[]
  link?: ContextLink
  links?: ContextLink[]
}

export type LocalFeatureGroup = {
  id: string
  eyebrow: string
  title: string
  summary?: string
  cards?: LocalFeatureCard[]
  contextIds?: string[]
}

export type TripDay = {
  id: string
  date: string
  day: number
  title: string
  shortTitle: string
  cities: string
  summary: string
  heroImage: string
  heroAlt: string
  focus: string
  focusNote: string
  routeSteps: RouteStep[]
  metrics: Array<{ label: string; value: string }>
  timeline: TimelineItem[]
  accommodation: string
  intensity: string
  note: string
  todos: string[]
  importantTip?: string
  localFeatureGroups?: LocalFeatureGroup[]
  previewContextIds: string[]
  weatherPlans?: WeatherPlan[]
  tags: string[]
  early: boolean
  longTransit: boolean
  freeDay: boolean
  requiredBooking: boolean
}

export type TodoItem = {
  id: string
  text: string
  due?: string
  dayId?: string
  priority?: 'high' | 'medium' | 'low'
  note?: string
  amount?: string
}

export type TodoGroup = {
  id: string
  title: string
  subtitle: string
  eyebrow?: string
  summary?: string
  items: TodoItem[]
}
