import type { ContextCard, ContextLink, LocalFeatureCard, ReviewCheck, TodoItem } from '../types/trip'

type AdditionalActivity = {
  id: string
  dayId: string
  date: string
  name: string
  cn: string
  timing: string
  address: string
  experience: string
  plan: string
  review: string
  fallback: string
  price: string
  links: ContextLink[]
}

export const activityBookingNotice = '已购两项：10.01 Skyline 缆车 + 每人 3 次 Luge，五人实付 ¥1,777.90；10.03 RealNZ 避风港号游船，五人实付 ¥3,323.55。其余活动、滑雪雪票、Step On 雪具和餐厅仍未预订；正式预订前统一 review 日期、五人余位、实际班次、装备、总价、退改和当日衔接。'

export const additionalActivities: AdditionalActivity[] = [
  {
    id: 'te-anau-glowworm-caves',
    dayId: 'day-9',
    date: '10.02',
    name: 'Te Anau Glowworm Caves',
    cn: '蒂阿瑙萤火虫洞',
    timing: '下午场待订，含提前签到预留约三小时',
    address: 'RealNZ Visitor Centre, 85 Lakefront Drive, Te Anau, New Zealand',
    experience: '乘船穿过 Lake Te Anau，由向导带领进入洞穴，再乘小船安静观看洞顶萤光。洞内不允许拍照录像；入口需弯腰，途中有台阶。官网目的地页按约 2.5 小时介绍，另需提前 30 分钟签到。',
    plan: '已加入 10.02 五人计划，仍待预订。Queenstown 出发提前至 10:00，约 12:30–12:45 抵达后午餐与采购，14:00 起办理 Luxmore 入住。暂留约 14:30–17:30 给签到与下午团，再衔接 18:30 The Redcliff；这不是确认班次，必须 review 实际发船、返抵及酒店入住时间。用本项目替换下午长时间湖边散步，不再叠加影院。',
    review: '确认 10.02 下午五人余位、准确发船与返抵时间、提前 30 分钟签到、五人总价、退改与运营取消政策。核对入口弯腰和台阶是否适合所有人，以及 The Redcliff 晚餐时间。不能用赶路或未经酒店确认的提前入住来凑班次。',
    fallback: '下午无合适班次或抵达延误时，先联系商家处理预约，再恢复湖边短走与酒店休息；不默认改成深夜团，也不自动增加其他付费活动。次日 Milford 自驾、12:45 报到、早餐和休息安排仍保留。',
    price: '2026.09.08 官网参考 NZ$145 / 成人起，五成人 NZ$725 起；未支付，最终按出行日期报价。',
    links: [
      { label: 'RealNZ 萤火虫洞 / 预约 / 规则', url: 'https://www.realnz.com/en/experiences/glowworm-caves/te-anau-glowworm-caves/' },
      { label: 'RealNZ Te Anau / 时长参考', url: 'https://www.realnz.com/en/destinations/te-anau/' },
    ],
  },
]

const activityLinks = (activity: AdditionalActivity): ContextLink[] => [
  ...activity.links,
  { label: '集合点地图 / 导航', url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.address)}` },
]

export const additionalActivityContextCards: ContextCard[] = additionalActivities.map((activity) => ({
  id: activity.id,
  kind: 'booking',
  eyebrow: `${activity.date} 新增活动`,
  actionLabel: '活动',
  name: activity.name,
  cn: `${activity.cn} / 五人待预订`,
  body: activity.experience,
  source: '运营方官网于 2026.09.08 核对；仅为项目资料，不是实时余位、订单或付款证明。',
  tags: ['5 人', '待预订', '下单前 review'],
  quickFacts: [activity.timing, activity.price, activity.address],
  sections: [
    { title: '已加入计划 / 当日衔接', body: activity.plan },
    { title: '正式预订前一起 review', body: activity.review },
    { title: '天气 / 无位 / 延误方案', body: activity.fallback },
  ],
  respectTips: ['已列入路书不代表已预订；取得确认单后再勾选完成。', activity.review],
  links: activityLinks(activity),
}))

export const additionalActivityFeatureCards: Record<string, LocalFeatureCard> = Object.fromEntries(additionalActivities.map((activity) => [activity.id, {
  id: `feature-${activity.id}`,
  title: activity.name,
  subtitle: `${activity.date} / ${activity.cn}`,
  tag: '待预订 / 下单前 review',
  body: `${activity.experience} ${activity.plan}`,
  tags: ['5 人', '正式下单前 review'],
  links: activityLinks(activity),
}]))

export const additionalActivityReviewChecks: Record<string, ReviewCheck> = Object.fromEntries(additionalActivities.map((activity) => [activity.id, {
  id: `review-${activity.id}`,
  timing: '正式预订前一起 review / 出发前复核',
  title: `${activity.cn}五人订位与衔接`,
  detail: `${activity.review} ${activity.fallback}`,
  links: activityLinks(activity),
}]))

export const additionalActivityBookingTodos: TodoItem[] = additionalActivities.map((activity) => ({
  id: `book-${activity.id}-five-review`,
  dayId: activity.dayId,
  text: `${activity.date} 预订 ${activity.cn}五人名额`,
  due: '正式下单前一起 review',
  priority: 'high',
  amount: activity.price,
  note: `已加入计划但尚未预订。${activity.review}`,
}))

export const additionalActivityBudgetCards = additionalActivities.map((activity) => ({
  label: activity.cn,
  value: '五人待订 / 未支付',
  note: activity.price,
}))
