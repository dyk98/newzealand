import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })

try {
  const trip = await server.ssrLoadModule('/src/data/tripData.ts')
  const activities = await server.ssrLoadModule('/src/data/activityData.ts')
  const dining = await server.ssrLoadModule('/src/data/diningData.ts')
  const { PrepPage } = await server.ssrLoadModule('/src/pages/PrepPage.tsx')
  const { OverviewPage } = await server.ssrLoadModule('/src/pages/OverviewPage.tsx')
  const { DayDetailPage } = await server.ssrLoadModule('/src/pages/DayDetailPage.tsx')
  const { ContextModal } = await server.ssrLoadModule('/src/components/ContextModal.tsx')
  const appSource = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
  const itinerary = await readFile(new URL('../src/content/itinerary.md', import.meta.url), 'utf8')
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8')
  const routeMapSource = await readFile(new URL('../src/components/RouteMapCard.tsx', import.meta.url), 'utf8')
  const allTodos = [...trip.criticalPrepItems, ...trip.todoGroups.flatMap(group => group.items)]
  const activityTodos = trip.todoGroups.find(group => group.id === 'activities').items
  const dayMap = new Map(trip.tripDays.map(day => [day.id, day]))
  const allContexts = new Set(trip.contextCards.map(card => card.id))
  const noop = () => {}

  assert.equal(trip.tripParty.size, 5)
  assert.equal(trip.tripDays.length, 15)
  assert.equal(activities.additionalActivities.length, 1)
  assert.equal(activityTodos.length, 7, '6 activities plus one Step On rental')
  assert.equal(dining.diningStops.filter(stop => !stop.optional).length, 12)
  assert.equal(dining.diningStops.filter(stop => stop.optional).length, 2)
  assert.equal(new Set(allTodos.map(todo => todo.id)).size, allTodos.length, 'unique todo IDs')
  assert.equal(allContexts.size, trip.contextCards.length, 'unique context IDs')

  const expectedDates = new Map([
    ['te-anau-glowworm-caves', ['day-9', '10.02']],
  ])
  for (const activity of activities.additionalActivities) {
    assert.deepEqual([activity.dayId, activity.date], expectedDates.get(activity.id))
    const day = dayMap.get(activity.dayId)
    const context = trip.contextCardMap.get(activity.id)
    const purchased = Boolean(activity.purchased)
    assert.ok(context)
    if (purchased) {
      assert.ok(context.tags.includes('已购') && context.tags.includes(activity.purchased.departure))
      assert.ok(day.timeline.some(item => item.contextIds?.includes(activity.id) && /已购/.test(item.title)))
      assert.ok(activityTodos.some(todo => todo.id === `book-${activity.id}-five` && /已购买/.test(todo.text)))
      assert.match(activity.price, /2,979\.37/)
      assert.match(activity.plan, /15:15/)
    } else {
      assert.ok(context.tags.includes('待预订') && context.tags.includes('下单前 review'))
      assert.ok(day.timeline.some(item => item.contextIds?.includes(activity.id) && /待订/.test(item.title)))
      assert.ok(activityTodos.some(todo => todo.id === `book-${activity.id}-five-review`))
      assert.match(activity.plan, /review/)
    }
    assert.ok(day.previewContextIds.includes(activity.id))
    assert.ok(day.reviewChecks.some(check => check.id === `review-${activity.id}`))
    assert.ok(day.localFeatureGroups.some(group => group.cards?.some(card => card.id === `feature-${activity.id}`)))
    assert.match(activity.review, /五人/)
    assert.match(activity.fallback, /退款|预约/)
    assert.ok(itinerary.includes(activity.name) && readme.includes(activity.name))
    const modalHtml = renderToStaticMarkup(createElement(ContextModal, { card: context, closing: false, onClose: noop }))
    assert.ok(modalHtml.includes(purchased ? '五人已购' : '五人待预订'))
    const dayHtml = renderToStaticMarkup(createElement(DayDetailPage, {
      day, completedTodos: [], liked: false,
      onToggleTodo: noop, onToggleLike: noop, onSelectPlan: noop, onOpenContext: noop,
    }))
    assert.ok(dayHtml.includes('review') && dayHtml.includes(context.cn.split(' / ')[0]))
  }

  const verifyContextReferences = value => {
    if (Array.isArray(value)) return value.forEach(verifyContextReferences)
    if (!value || typeof value !== 'object') return
    for (const [key, child] of Object.entries(value)) {
      if (key === 'contextIds' || key === 'previewContextIds') {
        for (const id of child) assert.ok(allContexts.has(id), `unknown context: ${id}`)
      } else verifyContextReferences(child)
    }
  }
  verifyContextReferences(trip.tripDays)

  // Pending reservations must not inherit older checkboxes; purchased activities auto-complete.
  const legacyCompleted = new Set([
    'book-cardrona-ski', 'book-cardrona-fifth', 'record-cardrona-order',
    'book-real-guns-five', 'book-milford-five', 'book-hydro-attack-five', 'book-skyline-five',
    ...dining.diningStops.map(stop => `book-dining-${stop.id}-five`),
    'book-all-stays', 'book-car', 'book-wanaka-sundale',
  ])
  const milfordBooking = activityTodos.find(todo => todo.id === 'book-milford-haven-five')
  const skylineBooking = activityTodos.find(todo => todo.id === 'book-skyline-gondola-luge-five')
  const glowwormBooking = activityTodos.find(todo => todo.id === 'book-te-anau-glowworm-caves-five')
  const cardronaPass = activityTodos.find(todo => todo.id === 'book-cardrona-lift-pass-three')
  const racersEdgeRental = activityTodos.find(todo => todo.id === 'book-racers-edge-rental-three')
  const bookedIds = new Set(['book-milford-haven-five', 'book-skyline-gondola-luge-five', 'book-te-anau-glowworm-caves-five', 'book-cardrona-lift-pass-three', 'book-racers-edge-rental-three'])
  const pendingReservationTodos = [...activityTodos.filter(todo => !bookedIds.has(todo.id)), ...dining.diningBookingTodos]
  assert.ok(milfordBooking)
  assert.match(milfordBooking.text, /已购买/)
  assert.match(milfordBooking.amount, /3,323\.55/)
  assert.match(milfordBooking.note, /12:45/)
  assert.match(milfordBooking.note, /不含大巴/)
  assert.ok(skylineBooking)
  assert.match(skylineBooking.text, /已购买/)
  assert.match(skylineBooking.amount, /1,777\.90/)
  assert.match(skylineBooking.note, /每人 3 次 Luge/)
  assert.ok(glowwormBooking)
  assert.match(glowwormBooking.text, /已购买/)
  assert.match(glowwormBooking.amount, /2,979\.37/)
  assert.match(glowwormBooking.note, /15:15/)
  assert.match(glowwormBooking.note, /14:45/)
  assert.ok(cardronaPass)
  assert.match(cardronaPass.text, /已购/)
  assert.match(cardronaPass.amount, /552/)
  assert.match(cardronaPass.note, /CT291054/)
  assert.ok(racersEdgeRental)
  assert.match(racersEdgeRental.text, /已购/)
  assert.match(racersEdgeRental.amount, /255/)
  assert.match(racersEdgeRental.note, /251514190424594/)
  assert.match(racersEdgeRental.note, /22 Ardmore/)
  for (const todo of pendingReservationTodos) {
    assert.ok(todo.id.endsWith('-five-review'))
    assert.ok(!legacyCompleted.has(todo.id), `new reservation inherits completed state: ${todo.id}`)
    assert.match(todo.due, /review/)
  }
  assert.ok(!appSource.includes("'book-cardrona-ski'"), 'ski must not auto-complete')
  assert.ok(appSource.includes("'book-milford-haven-five'"), 'Milford cruise purchase must auto-complete')
  assert.ok(appSource.includes("'book-skyline-gondola-luge-five'"), 'Skyline purchase must auto-complete')
  assert.ok(appSource.includes("'book-te-anau-glowworm-caves-five'"), 'Glowworm purchase must auto-complete')
  assert.ok(appSource.includes("'book-cardrona-lift-pass-three'"), 'Cardrona three-person pass must auto-complete')
  assert.ok(appSource.includes("'book-racers-edge-rental-three'"), 'Racers Edge rental must auto-complete')
  assert.ok(appSource.includes("'book-all-stays'"), 'legacy lodging migration preserved')
  for (const id of ['book-chc-outbound-extra', 'book-car', 'book-wanaka-doug-ledgerwood', 'book-pinewood-original', 'book-tekapo-coulson-lane']) {
    assert.ok(appSource.includes(`'${id}'`) && allTodos.some(todo => todo.id === id), `${id} completion preserved`)
  }
  const prepHtml = renderToStaticMarkup(createElement(PrepPage, { completedTodoIds: [...legacyCompleted, ...bookedIds], onToggleTodo: noop }))
  assert.ok(prepHtml.includes('Skyline、萤火虫洞、Milford、Cardrona 三人雪票与 Racers Edge 雪具已购'))
  for (const word of ['萤火虫洞', 'Racers Edge', '3,323.55', '1,777.90', '2,979.37', 'CT291054', '251514190424594']) assert.ok(prepHtml.includes(word))

  const activeText = JSON.stringify(trip.tripDays) + JSON.stringify(trip.contextCards)
    + JSON.stringify(trip.prepBudgetCards) + JSON.stringify(trip.todoGroups) + itinerary + readme
  for (const removed of ['Grand Circle', 'mt-cook-grand-circle', '冰川飞行', 'mtcookskiplanes.com', '3,745']) {
    assert.ok(!activeText.includes(removed), `removed flight remains in active content: ${removed}`)
    assert.ok(!JSON.stringify(trip.budgetCards).includes(removed), `removed flight remains in budget: ${removed}`)
  }
  assert.ok(!trip.contextCardMap.has('mt-cook-grand-circle'))
  assert.ok(!dayMap.get('day-4').timeline.some(item => item.tone === 'flight'))
  assert.match(dayMap.get('day-4').summary, /休息/)
  for (const removedMilfordPlan of ['普通大巴', '09:50 首选', '10:10 备选', 'NZ$1245', 'NZ$1,245', '不建议自驾去 Milford']) {
    assert.ok(!activeText.includes(removedMilfordPlan), `old Milford coach plan remains: ${removedMilfordPlan}`)
    assert.ok(!routeMapSource.includes(removedMilfordPlan), `old Milford coach route remains: ${removedMilfordPlan}`)
  }
  const day10 = dayMap.get('day-10')
  assert.match(day10.summary, /SH94 自驾/)
  assert.match(day10.summary, /3,323\.55/)
  assert.ok(day10.timeline.some(item => item.time.includes('12:45') && item.title.includes('避风港号')))
  assert.ok(day10.timeline.some(item => item.title.includes('主付费停车场') && item.detail.includes('NZ$10 / 小时')))
  assert.ok(day10.timeline.some(item => item.time.includes('19:30') && item.title.includes('Fat Duck')))
  assert.ok(!day10.timeline.some(item => item.icon?.displayName === 'Bus' || item.title.includes('大巴')))
  assert.match(routeMapSource, /SH94 自驾 \+ 已购 RealNZ 避风港号游船/)
  for (const cards of [trip.prepBudgetCards, trip.budgetCards]) {
    const milfordCard = cards.find(card => card.label === 'Milford 游船已购')
    assert.equal(milfordCard.value, '¥3,323.55 / 5 人')
    assert.match(milfordCard.note, /12:45/)
    const skylineCard = cards.find(card => card.label === 'Skyline 已购')
    assert.equal(skylineCard.value, '¥1,777.90 / 5 人')
    assert.match(skylineCard.note, /每人 3 次 Luge/)
    const glowwormCard = cards.find(card => card.label === '萤火虫洞已购')
    assert.equal(glowwormCard.value, '¥2,979.37 / 5 人')
    assert.match(glowwormCard.note, /15:15/)
    const cardronaCard = cards.find(card => card.label === 'Cardrona 雪票已购')
    assert.equal(cardronaCard.value, 'NZ$552 / 3 人')
    assert.match(cardronaCard.note, /CT291054/)
    const rentalCard = cards.find(card => card.label === 'Racers Edge 雪具已购')
    assert.equal(rentalCard.value, 'NZ$255 / 3 人')
    assert.match(rentalCard.note, /251514190424594/)
  }
  const day8 = dayMap.get('day-8')
  assert.match(day8.summary, /Skyline.*已购/)
  assert.match(day8.summary, /1,777\.90/)
  assert.ok(day8.timeline.some(item => item.title.includes('已购 Skyline') && item.detail.includes('1,777.90')))
  assert.ok(day8.todos.some(todo => todo.includes('已购 Skyline') && todo.includes('1,777.90')))
  assert.ok(!activeText.includes('book-skyline-five-review'))
  assert.ok(!activeText.includes('五成人 NZ$495'))
  assert.ok(!activeText.includes('约 RMB 1980'))
  for (const stale of [/原 4 人.{0,20}已购/, /原 4 位.{0,20}已购/, /Cardrona.{0,40}已购买/, /不把付费观星团设为必做/]) {
    assert.ok(!stale.test(activeText), `stale booking wording: ${stale}`)
  }
  assert.ok(!activeText.includes('book-cardrona-five-review'))
  assert.ok(!activeText.includes('book-burton-step-on-five-review'))
  const day6 = dayMap.get('day-6')
  assert.match(day6.summary, /CT291054/)
  assert.match(day6.summary, /251514190424594/)
  assert.match(day6.summary, /2 人不上雪/)
  assert.ok(day6.timeline.some(item => /2 人留在 Base|不上雪道/.test(item.title + item.detail)))
  assert.ok(day6.timeline.some(item => item.detail.includes('22 Ardmore')))
  assert.ok(day6.todos.some(todo => todo.includes('CT291054')))
  assert.ok(day6.todos.some(todo => todo.includes('251514190424594')))
  const day5 = dayMap.get('day-5')
  assert.ok(day5.timeline.some(item => item.title.includes('Racers Edge') && item.detail.includes('251514190424594')))
  const day9 = dayMap.get('day-9')
  assert.match(day9.summary, /15:15/)
  assert.match(day9.summary, /2,979\.37/)
  assert.ok(day9.timeline.some(item => item.title.includes('已购 Te Anau 萤火虫洞') && item.detail.includes('2,979.37')))
  assert.ok(day9.timeline.some(item => item.time.includes('15:15') && item.time.includes('14:45')))
  assert.ok(day9.todos.some(todo => todo.includes('已购 10.02 萤火虫洞') && todo.includes('2,979.37')))
  assert.ok(!activeText.includes('book-te-anau-glowworm-caves-five-review'))
  assert.ok(!activeText.includes('萤火虫洞待订'))
  assert.ok(!activeText.includes('NZ$725'))
  assert.ok(!activeText.includes('暂留窗口'))
  assert.ok(dayMap.get('day-9').timeline.some(item => item.time === '10:00' && item.title.includes('出发')))
  assert.ok(dayMap.get('day-4').timeline.some(item => item.time.includes('17:00') && item.title.includes('Birch Hill')))
  for (const removedStargazing of ['tekapo-summit-stargazing', 'summit-stargazing', 'the-summit-experience', 'Summit Experience', '正式观星待订', 'Summit 五人正式观星']) {
    assert.ok(!activeText.includes(removedStargazing), `paid stargazing remains in active content: ${removedStargazing}`)
    assert.ok(!JSON.stringify(trip.budgetCards).includes(removedStargazing), `paid stargazing remains in budget: ${removedStargazing}`)
  }
  assert.ok(!trip.contextCardMap.has('tekapo-summit-stargazing'))
  const day12 = dayMap.get('day-12')
  assert.match(day12.summary, /免费自由观星/)
  assert.ok(day12.timeline.some(item => item.title.includes('免费自由观星') && item.detail.includes('不为找更黑的地方夜间开车')))
  assert.ok(!day12.todos.some(todo => /观星|Summit/.test(todo)))
  assert.match(dayMap.get('day-13').summary, /18:00 前还车/)
  assert.match(dayMap.get('day-13').summary, /18:30 末班接驳/)
  const toCents = value => Math.round(Number(value.replace(/[^\d.]/g, '')) * 100)
  for (const cards of [trip.prepBudgetCards, trip.budgetCards]) {
    const total = cards.find(card => card.label === '住宿当前合计')
    const currentStays = cards.find(card => card.label === '当前入住方案')
    const pendingCancellation = cards.find(card => card.label === '原 Wanaka 待退订费用')
    assert.equal(total.value, '¥44,210.65')
    assert.equal(currentStays.value, '¥43,033.03')
    assert.equal(pendingCancellation.value, '¥1,177.62')
    assert.match(pendingCancellation.note, /1,177\.62/)
    assert.doesNotMatch(pendingCancellation.note, /Sundale|2,824\.00/)
    assert.equal(toCents(total.value), toCents(currentStays.value) + toCents(pendingCancellation.value))
  }
  const overviewHtml = renderToStaticMarkup(createElement(OverviewPage, { completedTodoIds: [...legacyCompleted] }))
  assert.ok(overviewHtml.includes('44,210.65') && overviewHtml.includes('待退订费用'))
  const day11 = dayMap.get('day-11')
  assert.match(day11.accommodation, /Pinewood/)
  assert.match(day11.accommodation, /1,018\.38/)
  assert.match(day11.accommodation, /第 5 人床位仍需落实/)
  assert.ok(allTodos.some(todo => todo.id === 'resolve-pinewood-fifth-bed'))
  assert.match(day12.accommodation, /17 Coulson Lane/)
  assert.match(day12.accommodation, /4,976\.71/)
  assert.match(day12.accommodation, /1 间房 \/ 5 位成人/)
  assert.ok(allTodos.some(todo => todo.id === 'book-tekapo-coulson-lane'))
  assert.ok(!allTodos.some(todo => todo.id === 'stay-fifth-tekapo'))
  for (const id of ['day-5', 'day-6']) {
    assert.match(dayMap.get(id).accommodation, /Doug Ledgerwood Drive/)
    assert.match(dayMap.get(id).accommodation, /5,830\.82/)
  }
  assert.ok(trip.contextCardMap.has('wanaka-doug-ledgerwood-stay'))
  assert.ok(!trip.contextCardMap.has('wanaka-split-stays'))
  assert.ok(!allTodos.some(todo => todo.id === 'book-wanaka-sundale' || todo.id === 'confirm-wanaka-split-stays'))
  // Old reservations remain in accounting until refunded, never in the actual stay/route.
  const dailyStart = itinerary.indexOf('# 09.24')
  assert.ok(dailyStart >= 0)
  const activeRouteText = JSON.stringify(trip.tripDays) + JSON.stringify(trip.contextCards) + itinerary.slice(dailyStart)
  for (const stale of ['Sundale', '汉普郡', 'Hampshire', '212 Brownston', '217 Wanaka Mount Aspiring', '4,001.62', '1,177.62', '2,824.00']) {
    assert.ok(!activeRouteText.includes(stale), `superseded lodging leaked into active itinerary: ${stale}`)
  }
  for (const obsolete of ['38,270.17', '40,099.37', '41,276.99', '1,794.43', '776.05', 'Stay In Tekapo Backpackers', '14 Rapuwai Lane', '¥1,267']) {
    assert.ok(!activeText.includes(obsolete), `obsolete stay detail remains: ${obsolete}`)
  }
  for (const refunded of ['Sundale', '2,824.00', '4,001.62', '44,100.99', '9,832.44']) {
    assert.ok(!activeText.includes(refunded), `refunded lodging or stale subtotal still counted: ${refunded}`)
  }
  assert.ok(!appSource.includes('wanaka-cancellation'), 'cancellation must not be auto-completed')

  console.log('PASS: paid stargazing removed; Skyline, glowworm, Milford, Cardrona passes and Racers Edge rentals remain booked; 2 activities and 12 main restaurants remain pending review.')
  console.log('PASS: context references, SSR pages, legacy completion isolation, lodging total and return-car boundaries.')
  console.log('PASS: latest lodging plan RMB 43,033.03 + Hampshire pending RMB 1,177.62 = provisional lodging total RMB 44,210.65; Pinewood fifth bed remains explicit.')
} finally {
  await server.close()
}
