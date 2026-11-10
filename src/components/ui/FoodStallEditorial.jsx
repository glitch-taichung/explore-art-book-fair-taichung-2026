import React from 'react'
import Picture from './Picture'

/**
 * 飲食攤專屬當代畫報／瀑布排版組件 (Contemporary Culinary Editorial Spread)
 *
 * 設計原則（遵循使用者指引）：
 * 1. 激浪式瀑布排版：圖片大小混插（4:3、3:4、1:1），多欄錯落、充滿呼吸感
 * 2. 瀑布式排版的照片全部靠左 (align="left", object-left, items-start, justify-start)
 * 3. 要對應的文字剛好對應在圖片旁邊（可在圖片下方、上方或側邊，視排版節奏而定）
 * 4. 無圖片的品項（如「鹽之花布朗尼」）隨機、純粹地排在旁邊，絕無任何多餘符號、標籤或框線
 * 5. 綠色限定品統一採用 lime-stroke font-bold
 * 6. 全面維持當代大字風格 (text-title sm:text-[1.35rem] font-bold text-ink leading-tight)
 */

// 1. 三更小尾巴 (wandertail)
function WandertailSpread() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 sm:gap-x-12 sm:gap-y-16 items-start">
        {/* 第 1 欄 */}
        <div className="space-y-12 sm:space-y-16 flex flex-col items-start">
          {/* 午後起司盒 (4:3，文字在下，靠左) */}
          <div className="flex flex-col items-start w-full">
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-transparent flex justify-start items-start">
              <Picture
                path="exhibitors/wandertail/books/午後經典"
                label="午後起司盒"
                ratio="4 / 3"
                align="left"
                className="w-full h-full object-cover object-left"
              />
            </div>
            <div className="mt-3 text-left">
              <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
                午後起司盒
              </h3>
            </div>
          </div>

          {/* 鹽之花布朗尼：純粹大字隨機排在起司盒旁，無任何多餘符號或標籤 */}
          <div className="py-4 text-left">
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              鹽之花布朗尼
            </h3>
          </div>

          {/* 素醉起司盒 (1:1，文字在下，靠左) */}
          <div className="flex flex-col items-start w-full sm:-translate-y-2">
            <div className="relative w-full aspect-square max-w-[340px] overflow-hidden bg-transparent flex justify-start items-start">
              <Picture
                path="exhibitors/wandertail/books/素醉起司盒"
                label="素醉起司盒"
                ratio="1 / 1"
                align="left"
                className="w-full h-full object-cover object-left"
              />
            </div>
            <div className="mt-3 text-left">
              <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
                素醉起司盒
              </h3>
            </div>
          </div>
        </div>

        {/* 第 2 欄 (垂直錯落下移) */}
        <div className="space-y-12 sm:space-y-16 sm:translate-y-8 lg:translate-y-10 flex flex-col items-start">
          {/* 百搭起司盒 (3:4 直式，文字在上，靠左) */}
          <div className="flex flex-col items-start w-full">
            <div className="mb-3 text-left">
              <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
                百搭起司盒
              </h3>
            </div>
            <div className="relative w-full aspect-[3/4] max-w-[340px] overflow-hidden bg-transparent flex justify-start items-start">
              <Picture
                path="exhibitors/wandertail/books/百搭起司盒"
                label="百搭起司盒"
                ratio="3 / 4"
                align="left"
                className="w-full h-full object-cover object-left"
              />
            </div>
          </div>

          {/* 飽睏起司盒 (4:3，文字在下，靠左) */}
          <div className="flex flex-col items-start w-full">
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-transparent flex justify-start items-start">
              <Picture
                path="exhibitors/wandertail/books/飽睏起司盒"
                label="飽睏起司盒"
                ratio="4 / 3"
                align="left"
                className="w-full h-full object-cover object-left"
              />
            </div>
            <div className="mt-3 text-left">
              <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
                飽睏起司盒
              </h3>
            </div>
          </div>
        </div>

        {/* 第 3 欄 */}
        <div className="space-y-12 sm:space-y-16 sm:col-span-2 lg:col-span-1 flex flex-col items-start">
          {/* 微醺起司盒 (4:3，文字在下，靠左) */}
          <div className="flex flex-col items-start w-full">
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-transparent flex justify-start items-start">
              <Picture
                path="exhibitors/wandertail/books/微醺起司盒"
                label="微醺起司盒"
                ratio="4 / 3"
                align="left"
                className="w-full h-full object-cover object-left"
              />
            </div>
            <div className="mt-3 text-left">
              <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
                微醺起司盒
              </h3>
            </div>
          </div>

          {/* 限定單人獨享盒 (3:4 直式，綠色字剛好對應在旁，靠左) */}
          <div className="flex flex-col items-start w-full sm:translate-y-4">
            <div className="mb-3 text-left">
              <h3 className="lime-stroke text-title sm:text-[1.35rem] font-bold leading-tight">
                限定單人獨享盒
              </h3>
            </div>
            <div className="relative w-full aspect-[3/4] max-w-[340px] overflow-hidden bg-transparent flex justify-start items-start">
              <Picture
                path="exhibitors/wandertail/books/單人獨享盒"
                label="限定單人獨享盒"
                ratio="3 / 4"
                align="left"
                className="w-full h-full object-cover object-left"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 2. 頑固油飯 (onegu)
function OneguSpread() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 lg:gap-18 items-start">
        {/* 左欄 */}
        <div className="space-y-12 sm:space-y-16 flex flex-col items-start">
          {/* 單車 (4:3，靠左) */}
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-transparent flex justify-start items-start">
            <Picture
              path="exhibitors/onegu/books/50頑固油飯-單車"
              ratio="4 / 3"
              align="left"
              className="w-full h-full object-cover object-left"
            />
          </div>

          <div className="space-y-5 text-left">
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              頑固油飯
            </h3>
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              台派老靈魂油飯
            </h3>
          </div>

          {/* 小海味 (3:4 直式，靠左) */}
          <div className="relative w-full aspect-[3/4] max-w-[380px] overflow-hidden bg-transparent flex justify-start items-start">
            <Picture
              path="exhibitors/onegu/books/50頑固油飯-小海味"
              ratio="3 / 4"
              align="left"
              className="w-full h-full object-cover object-left"
            />
          </div>

          <div className="text-left">
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              大人系威士鴨油飯
            </h3>
          </div>
        </div>

        {/* 右欄 (錯落節奏) */}
        <div className="space-y-12 sm:space-y-16 md:pt-12 flex flex-col items-start">
          <div className="space-y-5 text-left">
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              小鮮貝干貝酥油飯
            </h3>
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              小海味烏魚子油飯
            </h3>
          </div>

          {/* 繽紛 (4:3，靠左) */}
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-transparent flex justify-start items-start">
            <Picture
              path="exhibitors/onegu/books/50頑固油飯-繽紛"
              ratio="4 / 3"
              align="left"
              className="w-full h-full object-cover object-left"
            />
          </div>

          <div className="space-y-5 text-left">
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              辣個香皮蛋油飯
            </h3>
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              繽紛系霓虹蝦款
            </h3>
          </div>

          {/* 單車2 (1:1 正方，靠左) */}
          <div className="relative w-full aspect-square max-w-[380px] overflow-hidden bg-transparent flex justify-start items-start">
            <Picture
              path="exhibitors/onegu/books/50頑固油飯-單車2"
              ratio="1 / 1"
              align="left"
              className="w-full h-full object-cover object-left"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// 3. Narcos.sugar (narcos)
function NarcosSpread() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 lg:gap-18 items-start">
        {/* 左欄 */}
        <div className="space-y-12 sm:space-y-16 flex flex-col items-start">
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-transparent flex justify-start items-start">
            <Picture
              path="exhibitors/narcos/books/NARCOS.SUGAR-01"
              ratio="4 / 3"
              align="left"
              className="w-full h-full object-cover object-left"
            />
          </div>

          <div className="space-y-5 text-left">
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              三分糖肉桂捲
            </h3>
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              蘋果肉桂捲
            </h3>
          </div>

          <div className="relative w-full aspect-square max-w-[380px] overflow-hidden bg-transparent flex justify-start items-start">
            <Picture
              path="exhibitors/narcos/books/無麩質 白玉抹茶巴斯克"
              ratio="1 / 1"
              align="left"
              className="w-full h-full object-cover object-left"
            />
          </div>

          <div className="text-left">
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              無麩質巴斯克
            </h3>
          </div>

          <div className="relative w-full aspect-[4/3] overflow-hidden bg-transparent flex justify-start items-start">
            <Picture
              path="exhibitors/narcos/books/無麩質 檸香原味巴斯克"
              ratio="4 / 3"
              align="left"
              className="w-full h-full object-cover object-left"
            />
          </div>

          <div className="text-left">
            <h3 className="lime-stroke text-title sm:text-[1.35rem] font-bold leading-tight">
              限定湯品⁈
            </h3>
          </div>
        </div>

        {/* 右欄 */}
        <div className="space-y-12 sm:space-y-16 md:pt-14 flex flex-col items-start">
          <div className="text-left">
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              馬告可可司康
            </h3>
          </div>

          <div className="relative w-full aspect-square max-w-[380px] overflow-hidden bg-transparent flex justify-start items-start">
            <Picture
              path="exhibitors/narcos/books/三分糖肉桂捲"
              ratio="1 / 1"
              align="left"
              className="w-full h-full object-cover object-left"
            />
          </div>

          <div className="text-left">
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              芝麻焙茶磅蛋糕
            </h3>
          </div>

          <div className="relative w-full aspect-[4/3] overflow-hidden bg-transparent flex justify-start items-start">
            <Picture
              path="exhibitors/narcos/books/馬告可可司康_香料堅果醬"
              ratio="4 / 3"
              align="left"
              className="w-full h-full object-cover object-left"
            />
          </div>

          <div className="space-y-5 text-left">
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              香料堅果醬
            </h3>
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              香濃肉桂醬
            </h3>
          </div>

          <div className="relative w-full aspect-[4/3] overflow-hidden bg-transparent flex justify-start items-start">
            <Picture
              path="exhibitors/narcos/books/過往擺攤照（會再重新配置）"
              ratio="4 / 3"
              align="left"
              className="w-full h-full object-cover object-left"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// 4. jammm果醬 (jammmm)
function JammmmSpread() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 sm:gap-x-12 sm:gap-y-16 items-start">
        {/* 第 1 欄 */}
        <div className="space-y-12 sm:space-y-16 flex flex-col items-start">
          {/* 禮盒 (4:3，文字在下，靠左) */}
          <div className="flex flex-col items-start w-full">
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-transparent flex justify-start items-start">
              <Picture
                path="exhibitors/jammmm/books/禮盒"
                label="1～4入禮盒"
                ratio="4 / 3"
                align="left"
                className="w-full h-full object-cover object-left"
              />
            </div>
            <div className="mt-3 text-left">
              <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
                1～4入禮盒
              </h3>
            </div>
          </div>

          {/* 形象照 1 (3:4，靠左) */}
          <div className="relative w-full aspect-[3/4] max-w-[340px] overflow-hidden bg-transparent flex justify-start items-start">
            <Picture
              path="exhibitors/jammmm/books/jammm-形象照片 (1)"
              ratio="3 / 4"
              align="left"
              className="w-full h-full object-cover object-left"
            />
          </div>

          {/* 晨光草莓 (1:1，文字在下，靠左) */}
          <div className="flex flex-col items-start w-full">
            <div className="relative w-full aspect-square max-w-[340px] overflow-hidden bg-transparent flex justify-start items-start">
              <Picture
                path="exhibitors/jammmm/books/晨光草莓"
                label="晨光草莓"
                ratio="1 / 1"
                align="left"
                className="w-full h-full object-cover object-left"
              />
            </div>
            <div className="mt-3 text-left">
              <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
                晨光草莓
              </h3>
            </div>
          </div>
        </div>

        {/* 第 2 欄 (錯落下移) */}
        <div className="space-y-12 sm:space-y-16 sm:translate-y-8 flex flex-col items-start">
          {/* 香草佛卡夏佐果醬 (4:3，文字在上，靠左) */}
          <div className="flex flex-col items-start w-full">
            <div className="mb-3 text-left">
              <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
                香草佛卡夏佐果醬
              </h3>
            </div>
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-transparent flex justify-start items-start">
              <Picture
                path="exhibitors/jammmm/books/jammm_佛卡夏+果醬"
                label="香草佛卡夏佐果醬"
                ratio="4 / 3"
                align="left"
                className="w-full h-full object-cover object-left"
              />
            </div>
          </div>

          {/* 系列文字 1 */}
          <div className="py-2 text-left">
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              英國柑橘果醬大賽金牌風味系列
            </h3>
          </div>

          {/* 形象照 2 (4:3，靠左) */}
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-transparent flex justify-start items-start">
            <Picture
              path="exhibitors/jammmm/books/jammm-形象照片 (2)"
              ratio="4 / 3"
              align="left"
              className="w-full h-full object-cover object-left"
            />
          </div>
        </div>

        {/* 第 3 欄 */}
        <div className="space-y-12 sm:space-y-16 sm:col-span-2 lg:col-span-1 flex flex-col items-start">
          {/* 香酥蒜味法國麵包 (3:4 直式，文字在旁，靠左) */}
          <div className="flex flex-col items-start w-full">
            <div className="relative w-full aspect-[3/4] max-w-[340px] overflow-hidden bg-transparent flex justify-start items-start">
              <Picture
                path="exhibitors/jammmm/books/jammm_香蒜麵包"
                label="香酥蒜味法國麵包"
                ratio="3 / 4"
                align="left"
                className="w-full h-full object-cover object-left"
              />
            </div>
            <div className="mt-3 text-left">
              <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
                香酥蒜味法國麵包
              </h3>
            </div>
          </div>

          {/* 金門高粱桶柑 (4:3，靠左) */}
          <div className="flex flex-col items-start w-full">
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-transparent flex justify-start items-start">
              <Picture
                path="exhibitors/jammmm/books/金門高粱桶柑"
                label="金門高粱桶柑"
                ratio="4 / 3"
                align="left"
                className="w-full h-full object-cover object-left"
              />
            </div>
            <div className="mt-3 text-left">
              <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
                金門高粱桶柑
              </h3>
            </div>
          </div>

          {/* 系列文字 2 */}
          <div className="py-2 text-left">
            <h3 className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
              台灣在地特色水果果醬系列
            </h3>
          </div>

          {/* 形象照 3 (4:3，靠左) */}
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-transparent flex justify-start items-start">
            <Picture
              path="exhibitors/jammmm/books/jammm-形象照片"
              ratio="4 / 3"
              align="left"
              className="w-full h-full object-cover object-left"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// 5. 激浪特攻本部 ✕ pebbling (純攝影畫廊拼貼排版，完全無圖說文字，全部靠左)
function PebblingSpread() {
  const photos = [
    { path: 'exhibitors/pebbling/books/激浪門口', ratio: '4 / 3' },
    { path: 'exhibitors/pebbling/books/激浪店內飲品', ratio: '3 / 4' },
    { path: 'exhibitors/pebbling/books/激浪內部1', ratio: '4 / 3' },
    { path: 'exhibitors/pebbling/books/激浪內部2', ratio: '4 / 3' },
    { path: 'exhibitors/pebbling/books/Pebbling1', ratio: '3 / 4' },
    { path: 'exhibitors/pebbling/books/Pebbling2', ratio: '1 / 1' },
  ]

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 items-start">
        {photos.map((item, idx) => (
          <div
            key={idx}
            className={`relative w-full overflow-hidden bg-transparent flex justify-start items-start ${
              idx === 1 || idx === 4 ? 'sm:translate-y-4' : ''
            }`}
          >
            <Picture
              path={item.path}
              ratio={item.ratio}
              align="left"
              className="w-full h-full object-cover object-left"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// 預設飲食攤通用排版
function DefaultFoodSpread({ vendor }) {
  const menu = vendor.menu || []
  return (
    <div className="w-full space-y-6 text-left">
      {menu.map((m, idx) => (
        <h3 key={idx} className="text-title sm:text-[1.35rem] font-bold text-ink leading-tight">
          {typeof m === 'string' ? m : m.name || m.title}
        </h3>
      ))}
    </div>
  )
}

export default function FoodStallEditorial({ vendor }) {
  if (!vendor) return null

  if (vendor.id === 'wandertail') {
    return <WandertailSpread />
  }
  if (vendor.id === 'onegu') {
    return <OneguSpread />
  }
  if (vendor.id === 'narcos') {
    return <NarcosSpread />
  }
  if (vendor.id === 'jammmm') {
    return <JammmmSpread />
  }
  if (vendor.id === 'pebbling') {
    return <PebblingSpread />
  }

  return <DefaultFoodSpread vendor={vendor} />
}
