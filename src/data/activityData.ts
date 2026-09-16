import type { ContextCard, ContextLink, LocalFeatureCard, ReviewCheck, TodoItem } from '../types/trip'

type PurchasedActivity = {
  budgetLabel: string
  amount: string
  amountLabel: string
  departure: string
  checkIn: string
  returnAt: string
}

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
  purchased?: PurchasedActivity
}

export const activityBookingNotice =
  '已购三项：10.01 Skyline 缆车 + 每人 3 次 Luge，五人实付 ¥1,777.90；10.02 Te Anau Glowworm Caves 15:15 班次，五人实付 ¥2,979.37；10.03 RealNZ 避风港号游船，五人实付 ¥3,323.55。其余活动、滑雪雪票、Step On 雪具和餐厅仍未预订；正式预订前统一 review 日期、五人余位、实际班次、装备、总价、退改和当日衔接。'

export const additionalActivities: AdditionalActivity[] = [
  {
    id: 'te-anau-glowworm-caves',
    dayId: 'day-9',
    date: '10.02',
    name: 'Te Anau Glowworm Caves',
    cn: '蒂阿瑙萤火虫洞',
    timing: '已购 15:15 班次；14:45 报到，约 17:30 返回',
    address: 'RealNZ Visitor Centre, 85 Lakefront Drive, Te Anau, New Zealand',
    experience:
      '乘船穿过 Lake Te Anau，由向导带领进入洞穴，再乘小船安静观看洞顶萤光。洞内不允许拍照录像；入口需弯腰，途中有台阶。官方体验约 2 小时 15 分，须提前 30 分钟报到。',
    plan: '五人已购 15:15 班次，实付 ¥2,979.37 人民币。Queenstown 10:00 出发，约 12:30–12:45 抵达后午餐与采购，14:00 起办理 Luxmore 入住，14:45 到 RealNZ Visitor Centre 报到。约 17:30 回镇上，衔接 18:30 The Redcliff。保存订单确认和退改条款。',
    review:
      '出发前保存五人订单、确认 15:15 班次、14:45 报到和退改条款。核对入口弯腰和台阶是否适合所有人。车程延误时先联系 RealNZ；不要默认改更晚班次，以免挤压 18:30 晚餐和次日 Milford 休息。',
    fallback:
      '天气、水位或运营取消时按订单条款改期或退款；先联系商家，再恢复湖边短走与酒店休息。不自动改深夜团。次日 Milford 自驾、12:45 报到、早餐和休息安排仍保留。',
    price: '五人已购，实付 ¥2,979.37 人民币；15:15 开船，14:45 报到，约 17:30 返回。',
    purchased: {
      budgetLabel: '萤火虫洞已购',
      amount: '¥2,979.37',
      amountLabel: '实付 ¥2,979.37 人民币 / 5 人',
      departure: '15:15',
      checkIn: '14:45',
      returnAt: '17:30',
    },
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

export const additionalActivityContextCards: ContextCard[] = additionalActivities.map((activity) =>
  activity.purchased
    ? {
        id: activity.id,
        kind: 'booking',
        eyebrow: `${activity.date} 已购活动`,
        actionLabel: '活动',
        name: activity.name,
        cn: `${activity.cn} / 五人已购`,
        body: activity.experience,
        source: '五人订单已支付；保存确认单、15:15 班次、14:45 报到时间和退改条款。',
        tags: ['5 人', '已购', activity.purchased.departure],
        quickFacts: [activity.timing, activity.price, activity.address],
        sections: [
          { title: '已购班次 / 当日衔接', body: activity.plan },
          { title: '出发前复核', body: activity.review },
          { title: '运营取消 / 延误', body: activity.fallback },
        ],
        respectTips: ['保存订单确认，14:45 前到 RealNZ Visitor Centre 报到。', activity.review],
        links: activityLinks(activity),
      }
    : {
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
      },
)

export const additionalActivityFeatureCards: Record<string, LocalFeatureCard> = Object.fromEntries(
  additionalActivities.map((activity) => [
    activity.id,
    {
      id: `feature-${activity.id}`,
      title: activity.name,
      subtitle: `${activity.date} / ${activity.cn}`,
      tag: activity.purchased ? `已购 ${activity.purchased.departure}` : '待预订 / 下单前 review',
      body: `${activity.experience} ${activity.plan}`,
      tags: activity.purchased ? ['5 人', '已购', activity.purchased.departure] : ['5 人', '正式下单前 review'],
      links: activityLinks(activity),
    },
  ]),
)

export const additionalActivityReviewChecks: Record<string, ReviewCheck> = Object.fromEntries(
  additionalActivities.map((activity) => [
    activity.id,
    {
      id: `review-${activity.id}`,
      timing: activity.purchased ? '出发前复核' : '正式预订前一起 review / 出发前复核',
      title: activity.purchased ? `${activity.cn}已购订单与报到` : `${activity.cn}五人订位与衔接`,
      detail: `${activity.review} ${activity.fallback}`,
      links: activityLinks(activity),
    },
  ]),
)

export const additionalActivityBookingTodos: TodoItem[] = additionalActivities.map((activity) =>
  activity.purchased
    ? {
        id: `book-${activity.id}-five`,
        dayId: activity.dayId,
        text: `${activity.date} ${activity.cn}五人已购买`,
        amount: activity.purchased.amountLabel,
        note: `${activity.purchased.departure} 开船；${activity.purchased.checkIn} 到 RealNZ Visitor Centre 报到，约 ${activity.purchased.returnAt} 返回。体验约 2 小时 15 分。保存订单并核对退改；洞内禁拍。`,
        priority: 'high',
      }
    : {
        id: `book-${activity.id}-five-review`,
        dayId: activity.dayId,
        text: `${activity.date} 预订 ${activity.cn}五人名额`,
        due: '正式下单前一起 review',
        priority: 'high',
        amount: activity.price,
        note: `已加入计划但尚未预订。${activity.review}`,
      },
)

export const additionalActivityBudgetCards = additionalActivities.map((activity) =>
  activity.purchased
    ? {
        label: activity.purchased.budgetLabel,
        value: `${activity.purchased.amount} / 5 人`,
        note: activity.price,
      }
    : {
        label: activity.cn,
        value: '五人待订 / 未支付',
        note: activity.price,
      },
)
