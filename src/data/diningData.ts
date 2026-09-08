import type { ContextCard, ContextLink, LocalFeatureCard, ReviewCheck, TodoItem } from '../types/trip'

type DiningStop = {
  id: string
  dayId: string
  date: string
  meal: string
  name: string
  address: string
  experience: string
  plan: string
  hours: string
  booking: string
  links: ContextLink[]
  price?: string
  priority: 'high' | 'medium' | 'low'
  optional?: boolean
}

export const diningNotice = '5 人同行，无忌口，餐饮预算不设上限。以下均为待订计划，营业时间及样例菜单于 2026.09.08 核对，实际桌位、菜单、价格和退改条款以餐厅确认单为准。'

export const diningStops: DiningStop[] = [
  {
    id: 'poppies', dayId: 'day-3', date: '09.26', meal: '晚餐', name: 'Poppies',
    address: '1 Benmore Place, Twizel, New Zealand',
    experience: 'Twizel 的当地食材晚餐与南阿尔卑斯山景环境，适合抵达湖区后的第一顿正式餐。',
    plan: '目标 19:00 五人晚餐，先完成 Birch Hill Escape 入住。若取车或公路进度拖延，提前联系餐厅调整；不要为了赶餐压缩安全驾驶。',
    hours: '当前周一、周二及周五至周日供应晚餐 17:30–20:30，周三、周四休息；09.26 为周六，仍须确认当日营业。',
    booking: '提前确认五人桌、末轮入座和迟到处理。订不到时改 Twizel 镇中心餐厅或简餐。',
    links: [{ label: 'Poppies 官网 / 菜单 / 订位', url: 'https://www.poppiescafe.com/' }],
    priority: 'medium',
  },
  {
    id: 'moraine', dayId: 'day-4', date: '09.27', meal: '重点晚餐', name: 'The Moraine',
    address: 'Mt Cook Lakeside Retreat, 86 Mount Cook Road (SH80), Lake Pukaki, New Zealand',
    experience: '主厨多道品鉴菜单与 Ben Ohau 山景庄园环境；不住度假村也可以预约用餐。',
    plan: '目标 18:30 入座，实际时段由餐厅确认。徒步后回 Twizel 洗漱，再按预约乘车往返餐厅；为晚餐留时间，下午可选短线不全部叠加。餐后回 Birch Hill Escape，不更换住宿。',
    hours: '官网欢迎非住客预约主厨品鉴；09.27 的开餐、结束时间及五人同桌需要单独确认。',
    booking: '优先询订五人主厨品鉴，确认用餐时长、同桌安排、总价与退改条款。需要饮酒则预订五人往返接送；默认只订晚餐，不自动加餐后观星。',
    links: [
      { label: 'The Moraine 餐饮 / 预约', url: 'https://mtcookretreat.nz/dine/' },
      { label: '餐饮预约条款', url: 'https://mtcookretreat.nz/terms-and-conditions/' },
    ],
    priority: 'high',
  },
  {
    id: 'kika', dayId: 'day-5', date: '09.28', meal: '晚餐', name: 'Kika',
    address: '2 Dunmore Street, Wanaka 9305, New Zealand',
    experience: '以新西兰当季食材结合全球风味的创意分享菜，五人可以一起尝试多种菜式。',
    plan: '目标 19:00 五人晚餐。领取并检查雪具后先采购次日补给、换衣，再集合用餐；Après / Big Fig 保留为未订成或领取装备延误时的备选。',
    hours: '当前每日 17:30 起供应晚餐，圣诞节及 Boxing Day 休息；09.28 为周一，实际仍以订位确认为准。',
    price: '官网样例厨师推荐分享菜单 NZ$115 / 人；五人餐食 NZ$575，饮料另计。',
    booking: '优先订五人桌，确认厨师推荐分享菜单、餐时和退改。当天菜品随供应变化，样例菜不代表一定供应。',
    links: [
      { label: 'Kika 菜单', url: 'https://kika.nz/wanaka-fine-dining-restaurant-menu/' },
      { label: 'Kika 订位', url: 'https://kika.nz/dinner-reservations/' },
    ],
    priority: 'high',
  },
  {
    id: 'muttonbird', dayId: 'day-6', date: '09.29', meal: '滑雪后晚餐', name: 'Muttonbird',
    address: 'Post Office Lane, 33 Ardmore Street, Wanaka 9305, New Zealand',
    experience: '轻松氛围中的季节料理；菜单随当地生产者当天供应变化，适合滑雪后认真吃一顿。',
    plan: '目标 19:00 五人晚餐。先结束滑雪、归还装备并回住宿洗漱，再到餐厅；装备或接驳延误时及时联系店家，不冒险赶路。',
    hours: 'Wānaka 官方旅游页当前列周二至周六 17:30–22:00；09.29 为周二，餐厅菜单每日变化。',
    booking: '提前订五人桌，确认所选菜单、用餐时长及迟到处理；未订成或明显疲劳时用 Big Fig / 外带兜底。',
    links: [
      { label: 'Muttonbird 菜单', url: 'https://muttonbird.co.nz/menu' },
      { label: '联系 / 订位入口', url: 'https://muttonbird.co.nz/contact' },
      { label: 'Wānaka 官方餐厅资料', url: 'https://www.wanaka.co.nz/explore/muttonbird/' },
    ],
    priority: 'medium',
  },
  {
    id: 'botswana', dayId: 'day-7', date: '09.30', meal: '湖景晚餐', name: 'Botswana Butchery Queenstown',
    address: '17 Marine Parade, Queenstown, New Zealand',
    experience: '优质肉类、湖景、壁炉和 Archer’s Cottage 老建筑氛围，作为抵达皇后镇后的正式晚餐。',
    plan: '目标 18:30 五人晚餐，先完成 Rees 入住和停车，再乘车或按已确认方式进市中心。想要景观座位可提出请求，但不当作保证。',
    hours: '当前 Queenstown 店列每日 11:00–23:00；具体用餐时段与末轮入座以店家为准。',
    booking: '提前订五人桌，确认菜单、景观座位请求和退改；官网订位入口若不可用，联系 Queenstown 店 +64 3 442 6994。饮酒则安排往返接送。',
    links: [{ label: 'Queenstown 店 / 订位入口', url: 'https://botswanabutchery.nz/queenstown/' }],
    priority: 'medium',
  },
  {
    id: 'true-south', dayId: 'day-8', date: '10.01', meal: '酒店品鉴晚餐', name: 'True South Dining Room',
    address: 'The Rees Hotel, 377 Frankton Road, Queenstown, New Zealand',
    experience: '以南岛食材为主的品鉴晚餐，位于你们已经预订的 Rees 内。酒店住宿费用不代表已经包含这顿晚餐。',
    plan: '目标 19:00 五人晚餐。Skyline 下山后回 Rees 洗漱休息，再去餐厅；Blue Kanu 保留为口味或桌位备选。',
    hours: '官网提供晚餐预约；10.01 的五人时段和当前品鉴菜单需确认。',
    price: '官网样例六道 Trust the Chef 菜单 NZ$175 / 人，配酒 NZ$260 / 人；五人分别为 NZ$875 / NZ$1,300，实际菜单可能更新。',
    booking: '向餐厅询订五人完整品鉴，确认全桌菜单、时长和配酒。景观座位需提出请求；不要默认住宿订单包含餐食或配酒。',
    links: [{ label: 'True South 菜单 / 晚餐订位', url: 'https://therees.co.nz/food-wine/true-south-dining-room/' }],
    priority: 'medium',
  },
  {
    id: 'redcliff', dayId: 'day-9', date: '10.02', meal: '峡湾前夜晚餐', name: 'The Redcliff',
    address: '12 Mokonui Street, Te Anau 9600, New Zealand',
    experience: '古朴环境里的现代料理，作为 Te Anau 的第一顿正式晚餐。',
    plan: '目标 18:00–18:30 五人入座。下午先入住 Luxmore，买好 Milford 次日早餐和随身补给；晚餐后回酒店整理和休息。',
    hours: '10.02 周五的营业、菜单和末轮入座需向店家确认，不按未核实的固定营业时间执行。',
    booking: '提前询订五人早晚餐；未订成时可用 The Fat Duck 或 The Ranch，不增加夜间远途活动。',
    links: [{ label: 'The Redcliff 菜单 / 订位', url: 'https://theredcliff.co.nz/' }],
    priority: 'medium',
  },
  {
    id: 'fat-duck', dayId: 'day-10', date: '10.03', meal: '峡湾返程晚餐', name: 'The Fat Duck Te Anau',
    address: '124 Town Centre, Te Anau, New Zealand',
    experience: 'Te Anau 本地 gastropub 的季节料理与南方食材，峡湾一日团后留一顿舒适晚餐。',
    plan: '目标 19:00 五人晚餐，以 RealNZ 最终返程安排为前提。预计返抵约 16:50 不是保证；明确延误时提前联系餐厅，必要时改用 The Ranch 或外带。',
    hours: '当前官网列晚间 16:30 起营业，10.03 为周六；晚餐网上订位有当日截止时间，建议提前完成。',
    booking: '询订时说明参加 Milford 一日团，问清迟到、改时和取消条款，不把临时改餐视为免费取消原订位。',
    links: [{ label: 'The Fat Duck Te Anau / 菜单 / 订位', url: 'https://www.thefatduck.co.nz/' }],
    priority: 'medium',
  },
  {
    id: 'amisfield', dayId: 'day-11', date: '10.04', meal: '重点品鉴晚餐', name: 'Amisfield Restaurant',
    address: '10 Lake Hayes Road, Queenstown 9371, New Zealand',
    experience: '围绕新西兰本地、季节、野生与特有食材设计的完整晚间品鉴。午间 Cellar Door & Bistro 是不同产品。',
    plan: '优先询订 18:30 起的五人晚餐。下午保留休整和 Hydro Attack 天气改期余量，但需为晚餐接送留足时间；餐后由预订车辆送回 Pinewood。',
    hours: '当前公布周三至周日 18:30 起供应晚间品鉴；10.04 为周日，五人余位尚未确认。',
    price: '当前晚间品鉴 NZ$490 / 人，五人餐食 NZ$2,450；酒配及往返接送另计，不当作已付费用。',
    booking: '最优先处理五人 Evening Tasting Menu，确认用餐时长、付款与退改。订的是晚间品鉴，不是午餐 Bistro 或仅品酒；若无位，先评估 10.01 调换晚餐，不自行改订。',
    links: [
      { label: 'Amisfield 晚餐 / 菜单 / 订位', url: 'https://amisfield.co.nz/pages/dining' },
      { label: '餐厅位置 / 联系', url: 'https://amisfield.co.nz/pages/contact' },
    ],
    priority: 'high',
  },
  {
    id: 'stoaker', dayId: 'day-12', date: '10.05', meal: '公路午餐', name: 'The Stoaker Room Cromwell',
    address: '180 State Highway 8B, Cromwell 9310, New Zealand',
    experience: '用橡木酒桶蒸、烤、烟熏当地食材；招牌分享拼盘适合五人尝试不同味道。',
    plan: '目标 12:00–13:15 午餐，13:15 左右离开 Cromwell。替换原 Omarama 午餐；Omarama 改为约 14:45–15:00 短休和进度检查，不再安排第二顿午餐。',
    hours: 'Cromwell 店当前每日 12:00 起营业，晚间厨房约 19:30 收单。10.05 是周一；Mt Difficulty 当前周一不营业，不列为当天默认餐厅。',
    booking: '预订 Cromwell 店五人午餐并说明离店目标，不要订到 Wanaka 分店。下午还有自驾，司机不喝酒；进度落后时联系餐厅并取消可选观景停留。',
    links: [
      { label: 'Stoaker 菜单 / 餐厅介绍', url: 'https://www.thestoakerroom.co.nz/restaurant' },
      { label: 'Cromwell 店订位', url: 'https://www.thestoakerroom.co.nz/reservations-cromwell' },
      { label: 'Mt Difficulty 营业日参考', url: 'https://www.mtdifficulty.nz/dine' },
    ],
    priority: 'medium',
  },
  {
    id: 'kohan', dayId: 'day-12', date: '10.05', meal: '湖区晚餐', name: 'Kohan Japanese Restaurant',
    address: '6 Rapuwai Lane, Lake Tekapo, New Zealand',
    experience: '三文鱼、寿司与日式料理，在连续西餐之间换一种口味。',
    plan: '目标 18:30 五人晚餐。先完成 Tekapo 入住，再按时间短走湖边；行车延误时先联系住宿和餐厅，不跳过入住去赶吃饭。',
    hours: '官网当前晚餐列 17:30–20:00，个别日期会休息；10.05 为周一，具体营业和末轮入座仍需确认。',
    booking: '提前确认五人桌，可电话 +64 3 680 6688。未订成时保留 Dark Sky Diner 或附近简餐；Dark Sky Diner 仅 walk-in。',
    links: [{ label: 'Kohan 晚餐菜单 / 联系', url: 'https://kohannz.com/?page_id=14' }],
    priority: 'medium',
  },
  {
    id: 'inati', dayId: 'day-13', date: '10.06', meal: '新西兰收尾晚餐', name: 'INATI',
    address: '48 Hereford Street, Christchurch Central, New Zealand',
    experience: '厨师吧台与分享式品鉴菜单，以 Canterbury 和新西兰食材为主，作为新西兰段的收尾晚餐。',
    plan: '先守住 18:00 前还车和 18:30 末班接驳，目标 19:00 前完成机场酒店入住，再打车进城，询订 19:30 左右五人晚餐。餐后打车返回机场酒店，这是额外一次市区往返。',
    hours: '当前官网列周二至周六 17:00 起供应晚餐，周日周一休息；10.06 为周二，但 19:30 入座及完整品鉴能否安排必须确认。',
    price: '官网样例八道分享菜单 NZ$185 / 人，配酒 NZ$275 / 人；五人分别为 NZ$925 / NZ$1,375，以当日菜单为准。',
    booking: '优先询订五人 Trust Us 菜单，确认最晚入座、时长及返程接送。若店家不能接受目标时间或还车接驳延误，先联系改餐，不以付费晚还租车换取晚餐。',
    links: [
      { label: 'INATI 官网 / 订位', url: 'https://inati.nz/' },
      { label: 'INATI 样例菜单', url: 'https://inati.nz/menu/' },
    ],
    priority: 'high',
  },
  {
    id: 'gimlet', dayId: 'day-2', date: '09.25', meal: '条件性午餐', name: 'Gimlet at Cavendish House',
    address: '33 Russell Street, Melbourne VIC 3000, Australia',
    experience: '历史建筑内的餐厅，以海鲜、肉类和经典餐饮氛围作为墨尔本午餐升级候选。',
    plan: '不加入默认时间线。只有入境寄存顺利、店家明确可 12:00 开始并在 13:15 前完成用餐时考虑；需替换一部分 CBD / 河岸步行，不能在原路线之上叠加。13:45 离开 CBD 的底线不变。',
    hours: '当前每日 12:00 起营业；09.25 是维州公共假日，另核对营业、菜单、附加费及取消条款。',
    booking: '先评估时间能否成立，再决定是否订位；不为了正餐冒险赶机场。所有报价按澳元 AUD 识别。',
    links: [{ label: 'Gimlet 官网 / 联系', url: 'https://gimlet.melbourne/contact' }],
    priority: 'low', optional: true,
  },
  {
    id: 'cafe-sydney', dayId: 'day-14', date: '10.07', meal: '条件性海港晚餐', name: 'Cafe Sydney',
    address: 'Level 5, Customs House, 31 Alfred Street, Circular Quay, Sydney, Australia',
    experience: '海港大桥和歌剧院方向的屋顶景观餐厅，作为落地顺利时的悉尼餐饮升级候选。',
    plan: '不加入默认时间线。须 20:00 前办完机场酒店入住、餐厅确认接受约 20:45 入座且有五人位，才用晚餐替换部分海港步行；不能同时执行完整夜游和长餐。时间不成立就留在酒店附近吃。',
    hours: '当前周一至周六提供午晚餐，FAQ 列至 22:00；必须问清末轮入座。露台受天气影响，不保证景观位置。',
    booking: '官网当前列 24 小时内取消或未到店收费 AUD 100 / 人，五人 AUD 500；不能当作免费可取消候选。未确认航班与时间风险前不锁定付费订位。',
    links: [
      { label: 'Cafe Sydney 餐厅 / 景观', url: 'https://cafesydney.com/' },
      { label: '营业 / 订位 / 退改说明', url: 'https://cafesydney.com/frequently-asked-questions/' },
    ],
    priority: 'low', optional: true,
  },
]

const mapLink = (stop: DiningStop): ContextLink => ({
  label: '地图 / 导航（核对入口）',
  url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.name}, ${stop.address}`)}`,
})

export const diningContextCards: ContextCard[] = diningStops.map((stop) => ({
  id: `dining-${stop.id}`,
  kind: 'food',
  eyebrow: `${stop.date} ${stop.meal}`,
  actionLabel: stop.optional ? '餐饮候选' : '餐厅',
  name: stop.name,
  cn: `${stop.meal} / ${stop.optional ? '满足条件才考虑' : '五人待订'}`,
  body: stop.experience,
  source: '餐厅官网与当地旅游资料，2026.09.08 核对；非实时库存或订位确认。',
  tags: ['5 人', '无忌口', '预算不限', stop.optional ? '条件性备选' : '待订'],
  quickFacts: [stop.address, stop.price ?? '餐费按菜单 / 餐厅报价，未计为已付'],
  sections: [
    { title: '行程衔接', body: stop.plan },
    { title: '当前营业参考', body: stop.hours },
    { title: '订位与确认事项', body: stop.booking },
  ],
  respectTips: ['推荐不等于订位成功；取得确认单后再勾选完成。', '配酒自愿选择；需要自驾的人不喝酒。'],
  links: [...stop.links, mapLink(stop)],
}))

export const diningFeatureCards: Record<string, LocalFeatureCard> = Object.fromEntries(diningStops.map((stop) => [stop.id, {
  id: `dining-feature-${stop.id}`,
  title: stop.name,
  tag: stop.optional ? '条件性候选' : '五人待订',
  subtitle: `${stop.date} ${stop.meal}`,
  body: `${stop.experience} ${stop.plan}${stop.price ? ` ${stop.price}` : ''}`,
  tags: ['无忌口', '预算不限', stop.optional ? '先核对时间' : '提前确认五人席位'],
  links: [...stop.links, mapLink(stop)],
}]))

export const diningReviewChecks: Record<string, ReviewCheck> = Object.fromEntries(diningStops.map((stop) => [stop.id, {
  id: `review-dining-${stop.id}`,
  timing: stop.optional ? '决定是否执行前' : '出发前 + 前一天复核',
  title: `${stop.name} ${stop.optional ? '候选条件' : '五人订位'}`,
  detail: `${stop.hours} ${stop.booking}`,
  links: [...stop.links, mapLink(stop)],
}]))

export const diningBookingTodos: TodoItem[] = diningStops.map((stop) => ({
  id: `book-dining-${stop.id}-five`,
  dayId: stop.dayId,
  text: `${stop.date} ${stop.optional ? '评估' : '预订'} ${stop.name} ${stop.meal}`,
  due: stop.priority === 'high' ? '优先询订 / 出发前' : '出发前确认',
  priority: stop.priority,
  ...(stop.price ? { amount: stop.price } : {}),
  note: `${stop.optional ? '仅为候选，不自动订位。' : '五人待订，无忌口。'} ${stop.booking}`,
}))
