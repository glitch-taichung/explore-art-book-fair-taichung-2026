import { schedule } from '../data/schedule'
import programsData from '../data/generated/programs.json' with { type: 'json' }
import speakerProfiles from '../data/generated/speakers.json' with { type: 'json' }
import { exhibitorList } from '../data/exhibitors'

/**
 * 依據 programId 統整出最豐富、完整的活動詳細資料
 * 包含：xlsx 原文介紹、中英文講者簡介、相簿圖片清單、簡化時間與地點
 */
export function getProgramDetails(programId) {
  const s = schedule.find((item) => item.id === programId) || null
  if (!s) return null

  // 1. 簡化日期時間 (例如: 12/13 SUN 11:00 - 11:30，書展兩日則分行呈現)
  const isD1 = s.date.includes('12-12')
  const dateFormatted = isD1 ? '12/12' : '12/13'
  const dayName = isD1 ? 'SAT' : 'SUN'
  let timeSimple = `${dateFormatted} ${dayName}  ${s.start} - ${s.end}`
  if (s.id.startsWith('fair')) {
    timeSimple = '12/12 SAT  13:00 - 21:00\n12/13 SUN  10:00 - 17:30'
  }

  // 2. 比對 programs.json 抓取完整富文本活動簡介
  const matchedP = programsData.find(
    (p) =>
      p.title &&
      (p.title.includes(s.title) ||
        s.title.includes(p.title.split('\n')[0]) ||
        (s.id.startsWith('woodbook') && p.title.includes('木頭書')) ||
        (s.id.startsWith('riso') && p.title.includes('Riso')) ||
        (s.id.startsWith('kids') && p.title.includes('故事盒')) ||
        (s.id.startsWith('tour') && p.title.includes('傻瓜書日')) ||
        (s.id === 'opening' && p.title.includes('開場')) ||
        (s.id === 'silent-party' && p.title.includes('聽我放音樂')))
  )

  // 3. 特殊活動相簿與講者整合
  let topImage = `programs/${s.id}/cover`
  let carouselPhotos = []
  let singleBottomImage = null
  let stackedImages = null
  let topVideoEmbed = null
  let richIntro = matchedP?.intro || s.blurb || ''
  let statement = null
  let hosts = []
  let links = []

  // 外部相關網站連結（報名連結固定置於 Modal 最底部，不混入此處）
  if (matchedP?.links?.length) {
    links.push(...matchedP.links)
  }

  if (s.id === 'forum') {
    topImage = 'programs/forum/hero'
    richIntro =
      '從出版社群、藝術書展到小誌典藏，探討 Zine 的創作、流通與保存，以及獨立出版如何維持自主性。現場提供中英文逐步口譯。\n\n' +
      '本次論壇邀請來自首爾、新加坡與香港的三位講者，從出版社群、藝術書展與文獻典藏三個面向，分享亞洲不同城市的獨立出版實踐。由臺灣當代文化實驗場 C-LAB 的黃羿瑄主持，從臺灣出版現場的觀察出發，串聯不同城市的經驗與思考。'
    statement = richIntro
    hosts = [
      {
        name: 'Oh Jong-gil 吳鍾佶',
        org: 'Seoul Publishers Table',
        role: '講者',
        photo: 'programs/forum/speaker-1',
        bioZh: '自 2017 年推出首部獨立出版作品以來，吳鍾佶（Oh Jong-gil）便持續投身於小說與散文的創作。同時，他是Seoul Publishers Table（서울 퍼블리셔스 테이블） 的籌辦團隊成員之一，也是首爾的獨立書店 Storage Book & Film（스토리지북앤필름）的一員 。此外，吳鍾佶經營獨立出版社「Sijeol（시절）」，與各領域的作家攜手合作，出版詩歌、散文及小說。Sijeol 致力於提倡具包容性、對多元聲音與經驗開放的文學，期許能走在當代韓國文學的最前沿。',
        bioEn: 'Since publishing my first independent publication in 2017, I have been writing fiction and essays. I am part of the organizing team behind Seoul Publishers Table, an independent publishing fair in Seoul, and I also work at Storage Book & Film, an independent bookstore in Seoul. In addition, I run Sijeol, an independent publishing house that collaborates with a diverse range of writers to publish poetry, essays, and fiction. Sijeol seeks to be at the forefront of contemporary Korean literature by championing literature that is inclusive and open to diverse voices and experiences.'
      },
      {
        name: 'S. Yi Yao Chao 周亦瑤',
        org: 'Asia Art Archive 亞洲藝術文獻庫',
        role: '講者',
        photo: 'programs/forum/speaker-2',
        bioZh: '周亦瑤（S. Yi Yao Chao）是一位雕塑家，現任亞洲藝術文獻庫（Asia Art Archive）的小誌圖書館員（Zine Librarian）。她負責統籌「試下zine：小誌駐場計劃」（Try Try Zine Residency）。在 2025 年的曼谷藝術書展（BKKABF）中，她利用 zine 駐場藝術家留下的邊角廢料，打造了一個名為 "Shadow Library" 的快閃展位與工作坊。周亦瑤曾為紐約現代藝術博物館（MoMA）的 post 平台撰寫專題文章。其藝術駐村經歷包括：2019 年廣州時代美術館第四季的 Banyan Commune 駐村計畫，以及 2026 年秋季香港大嶼山「海巫」（seawitch）的駐村。',
        bioEn: 'S. Yi Yao Chao is a sculptor and the Zine Librarian at Asia Art Archive. She organizes the Try Try Zine Residency. The "Shadow Library" at the Bangkok Art Book Fair (BKABF) is a pop-up table and workshop made out of the zine residents scraps for the Bangkok Art Book Fair (BKKABF) 2025. Chao has contributed writing to post, an online resource of the Museum of Modern Art. Her art residency participation includes the Times Museum’s fourth Banyan Commune residency in Guangzhou 2019 and seawitch resident in Lantau Island, Hong Kong, Fall 2026.',
        ig: ['@yiyaochao', '@asiaartarchive']
      },
      {
        name: 'Renée Ting',
        org: 'Singapore Art Book Fair',
        role: '講者',
        photo: 'programs/forum/speaker-3',
        bioZh: 'Renée Ting 是 Thing Books 的創辦人，也是新加坡藝術書展的總監。',
        bioEn: 'Renée Ting is the founder of Thing Books and director of the Singapore Art Book Fair.',
        ig: ['@singaporeartbookfair']
      },
      {
        name: '黃羿瑄 HUANG, Yi-Hsuan',
        org: '臺灣當代文化實驗場 C-LAB',
        role: '主持',
        photo: 'programs/forum/moderator',
        bioZh: '黃羿瑄現為臺灣當代文化實驗場（C-LAB）當代藝術實驗平台專員。其策展與研究實踐聚焦於亞洲語境下的記憶與哀悼方法。她以展覽製作作為開展策展方法的基礎，並探討展覽如何作為連結藝術作品、空間與觀眾的「介面」。近期策展計畫包括：韓國首爾視聽館《轉花》（2024）、國立臺北教育大學北師美術館《亂流：半睡飛行夢》（2025）、臺中毛刺空間《生活是座乾涸的水池》（2026）、韓國釜山市立美術館《未來博物館學》中 C-LAB 參展計畫「亞非神經網絡」（2026）、臺灣當代文化實驗場《循光而行》（2026），以及台北當代藝術館《當未來不再被紀念》（2026）。她亦是獨立出版藝術家書《深陷其中》（2024）的作者，並為策展團隊 Nn̄g Project 成員。',
        bioEn: 'Huang Yi-Hsuan is currently a Specialist at C-LAB’s Contemporary Art Platform. Her curatorial and research practices focus on approaches to memory and mourning within Asian contexts. She regards exhibition production as a foundation for developing curatorial methodologies, and explores how exhibitions can function as an “interface” that connects artworks, spaces, and audiences. Her recent curatorial projects include Trans-plant at the Audio Visual Pavilion, South Korea (2024); The Limit Is the Turbulent Skies at the MoNTUE, Taipei, Taiwan (2025); Life Is a Hushed Pond at Glitch, Taichung, Taiwan (2026); Afrasian Neural Network, C-LAB’s presentation to Future Museology at the Busan Museum of Art, South Korea (2026); Along the Path of Light at C-LAB, Taipei, Taiwan (2026); and When Tomorrow is Forgotten at MoCA, Taipei, Taiwan (2026). She is also the author of the independently published artist’s book In the Abyss (2024) and a member of the curatorial collective Nn̄g Project.',
        ig: ['@qq1xuan']
      }
    ]
    carouselPhotos = hosts.map((h) => ({
      caption: `${h.name} (${h.role})`,
      path: h.photo
    }))
  } else if (s.id.startsWith('woodbook')) {
    topImage = 'programs/woodbook-1/木頭書示意圖-白底'
    singleBottomImage = 'programs/woodbook-1/個人照'
    hosts = [
      {
        name: '施絜晴 / Jie',
        org: '創作者、寫作者、美術老師、藝術出版工作者',
        bioZh:
          '是創作者、寫作者、美術老師，也是藝術出版工作者。畢業於北藝大美術系研究所，常以文本創作出發，衍伸探討不同媒材、介面的敘事可能，並探問書寫者的身份、權力與詮釋方法的歧異性。迷戀書的形式，並自出版小誌、藝術家創作書等。目前也是遊牧木瓜出版社的一員，曾隨出版社至多場大型國際書展進行交流。',
        ig: ['@j._.___']
      }
    ]
    richIntro = `木頭也能做成書？\n──異材質藝術家書工作坊──以書為載體，用特殊材質做一本屬於自己的藝術家書。\n\n藝術家書籍（Artist’s Book）是一種以「書」作為載體、材料或形式的一種藝術創作類型。近年來，臺灣有越來越多藝術家透過書進行創作，他們不只用紙張做書，更運用許多特殊材質，做出不同於紙本書的「書」。\n\n在這場工作坊中，主講者施絜晴將與大家分享國內外的異材質藝術家書籍，並帶領參與者親手製作一本「木頭書」，體驗手製非紙本書的樂趣。\n\n每一種木頭的色澤、木紋、粗細質感、厚薄度、韌性或易脆性、氣味都不一樣，這些細微的差異，將是影響你決定「如何構成一本木頭書」的重要因素。在這裡，沒有標準的木頭書，只有屬於你的木頭書。讓我們打開感官，專注感受材料所帶來的色、香、質、型，製作出世上唯一的木頭手工書。\n\n這本木頭書不只能用來欣賞，也能真的使用，或當作一個獨特的紀念品，紀念自己專注、投入的時刻。`
  } else if (s.id.startsWith('riso')) {
    topImage = 'programs/riso-1/workshop3'
    hosts = [
      {
        name: 'meadowroom 草地房',
        org: 'Riso 印刷工作室與小型出版社',
        bioZh:
          matchedP?.hostBio ||
          '位於台中的 Riso 印刷工作室與小型出版社，於 2024 年創立。靈感多來自生活中的觀察與日常物件，再以草地房的視覺語言與 Riso 詮釋。目前專注於 Riso 書籍以及每月一封的草地信計畫，用 Riso 印刷的實體信件記錄工作室的日常。',
        ig: ['@meadowandroom']
      }
    ]
    richIntro =
      '剪一剪、貼一貼，再讓紙上的想像「啪！」地印出來！從一張紙、一份稿件，到一件親手印製的作品，跟著草地房一起認識 RISO，發現創作不紙這樣！\n\n孔版印刷（RISO）是一種特殊的印刷方式。這次的工作坊想讓沒碰過 RISO 的人也能輕鬆認識這台機器。我們會把工作室的 RISO 機跟 7 個油墨滾筒帶到現場，從 RISO 的原理開始介紹，用簡單的媒材讓大家學習製作 RISO 稿件，也親自操作 RISO 機印製。'
    carouselPhotos = [
      { caption: 'meadowroom 草地房 Logo', path: 'programs/riso-1/meadowroom_logo' },
      { caption: 'Riso 工作坊主視覺', path: 'programs/riso-1/hero' },
      { caption: 'Riso 印刷體驗 01', path: 'programs/riso-1/workshop1' },
      { caption: 'Riso 印刷體驗 02', path: 'programs/riso-1/workshop2' },
      { caption: 'Riso 印刷體驗 04', path: 'programs/riso-1/workshop4' }
    ]
  } else if (s.id === 'salon-1') {
    topImage = 'speakers/葉忠宜'
    statement = null
    richIntro = null
    hosts = [
      {
        name: '葉忠宜 Chung-Yi Yeh',
        org: '重本書店 Weight Books',
        bioZh:
          '葉忠宜，平面設計師，日本京都藝術大學碩士。設計工作室「卵形 ovalgraphic」、重本書店創辦人。創辦字體設計專業雜誌《Typography字誌》並統籌企劃《Zeitgeist》設計教育書系。曾獲台灣出版設計大獎金蝶獎金獎，並入選德國萊比錫「世界最美麗的書」。2023 年入選「國際平面設計聯盟 AGI」。',
        ig: ['@yehchungyi', '@weightbooks']
      }
    ]
  } else if (s.id === 'salon-2') {
    topImage = 'speakers/方序中'
    statement = null
    richIntro = '從裝幀設計到感性敘事，設計與閱讀跨界的一場談話。'
    hosts = [
      {
        name: '方序中 Joe Fang',
        org: '究方社 JOEFANGSTUDIO',
        bioZh:
          '究方社（JOEFANGSTUDIO）創意總監。作品跨足唱片包裝、主視覺設計、策展等領域，曾多次入圍金曲獎最佳裝幀設計。持續透過設計訴說土地、記憶與文化的故事。'
      }
    ]
  } else if (s.id === 'salon-3') {
    topImage = 'programs/salon-3/space'
    stackedImages = null
    carouselPhotos = [
      { caption: '曾哲偉', path: 'programs/salon-3/speaker' },
      { caption: '品度藝術 PRNDL.art', path: 'programs/salon-3/logo' }
    ]
    statement = '遠方的鼓聲：「PRNDL.criticism」與東亞藝評的跨國實驗'
    richIntro = `閱讀，是認識一個地方最溫和也最深入的方式。透過文字，我們聽見遠方的鼓聲，也看見另一個社會如何思考自身的歷史與當下。\n\n「PRNDL.criticism」是一個以台灣為基地、以繁體中文與英文雙語運作的藝術評論平台，聚焦東亞與東南亞的當代藝術書寫，並與ArtsEquator（新加坡）、Afterall（英國）、湄公河文化中心（台灣）等國際組織合作，將該區域內的重要評論引介給中文讀者；同時發起「青春的迫切性」系列專題，委託年輕寫作者書寫他們親身參與的國際交流經驗。\n\n本場講座將分享該平台如何在有限資源下建立國際合作關係、翻譯如何成為一種編輯與策展的工作，以及在數位出版的時代，評論平台能為藝術社群扮演什麼樣的角色。講座也將介紹平台的投稿機制，歡迎對藝術書寫、翻譯與國際交流有興趣的朋友一同參與。`
    hosts = [
      {
        name: '曾哲偉 Tseng Che-Wei',
        org: '品度藝術 PRNDL.art',
        bioZh: `品度藝術（PRNDL.art）負責人，近年來以策展、研究與評論書寫等方式參與藝術實踐，現為臺灣文化政策研究學會、中華民國藝評人協會會員。同時就讀於國立臺北教育大學當代藝術評論與策展研究全英語碩士學位學程（CCSCA）。\n\n評論文章以中英雙語寫作，關注台灣、韓國與東南亞當代藝術，曾發表於《Ocula中文》《ArtReview中文》《典藏ARTouch》《CLABO實驗波》等平台，入圍第九屆國際藝術評論獎（IAAC）。近期參與展覽專案有「瓶中船」（2026，基隆美術館）計劃主持、「一四九海浬的時間：對抗遺忘」（2025，國家人權博物館）協同策展人、「漂流的阿波伎：水、風及星辰之徑」（2024，濟州道立美術館）合作策展人、「一百坪的散步練習」（2023，鳳甲美術館）共同研究等。`,
        ig: ['@tsengchewei', '@prndl.art']
      }
    ]
  } else if (s.id === 'salon-4') {
    topImage = 'programs/salon-4/space'
    singleBottomImage = 'programs/salon-4/logo'
    statement = null
    richIntro =
      '在日常裡長出一座圖書館。本冊圖書館（Artqpie Library）創立於台中，以空間為載體、以出版為媒介，持續串聯創作者與讀者。結合閱讀空間、展覽策劃與獨立出版，探索書本在城市與日常中的更多可能。'
    hosts = [
      {
        name: '本冊圖書館 Artqpie Library',
        org: '台中獨立藝文空間與出版社',
        ig: ['@artqpie']
      }
    ]
    stackedImages = null
  } else if (s.id === 'salon-5') {
    topImage = 'exhibitors/zitdim/logo'
    stackedImages = [
      'exhibitors/carp/logo',
      'exhibitors/yao/logo',
      'exhibitors/glitch/logo'
    ]
    richIntro = `匯聚來自台南與台中的四個獨立藝術空間，從空間營運、策展實驗到在地實踐，展開一場關於藝術、出版與城市文化活力的跨界對話。\n\n節點 Zit-Dim Art Space｜Tainan\n節點於2019年在台南成立，港澳臺共同合作經營之藝術空間，試圖創建亞洲平台，致力當代藝術推廣、教育經營、田野累積、文化研究、自製出版與策展規劃；重視實驗性，跨媒材合作、國際駐村等藝術交流。\n\n鯉魚藝廊 Carp Gallery｜Taichung\n鯉魚藝廊為台中獨立藝術空間，持續引介具實驗性、觀念性之當代藝術創作與獨立出版。\n\n窯座 YÁO｜Taichung\n窯座為台中的獨立藝術空間，致力於推動當代藝術實驗性計畫與青年創作者之跨領域對話。\n\n毛刺 Glitch｜Taichung\n毛刺為台中在地藝術空間，專注於當代視覺文化、書籍裝幀與實驗性藝術交流。`
    hosts = []
  } else if (s.id === 'salon-6') {
    topImage = 'exhibitors/nodate/logo'
    carouselPhotos = [
      { caption: '陳敬元', path: 'programs/salon-6/陳敬元' },
      { caption: '陳念瑩', path: 'programs/salon-6/陳念瑩' },
      { caption: '張玉音', path: 'programs/salon-6/張玉音' },
      { caption: '羅智信', path: 'programs/salon-6/羅智信' }
    ]
    statement = '紙本派，集合！—藝術書從作品集走向文化敘事'
    richIntro = `當藝術不只是被印在紙上，而是透過紙張、裝幀、閱讀動作重新被創造，藝術書究竟還是一本書，還是一件可以被閱讀的作品？\n野点 nodate 的主題式藝術書出版品《白髮 Grey Hair》與《廣場 Square》，分別從台灣日常記憶與公共空間出發，透過小屋造型外盒、卷軸式風景、全幅圖像與摺頁結構，探索裝幀如何超越包裝，成為結合藝術家、設計師、編輯者的多角敘事。\n\n本場講座邀請藝術家陳念瑩與陳敬元，從兩本作品的創作歷程出發，分享如何將記憶、空間與圖像轉化為可以親手閱讀的藝術書。從紙材選擇、印刷裝幀到閱讀體驗，一起思考：當圖像可以數位傳播、內容可以被快速複製，藝術書如何透過物質、閱讀行為與創作者的觀點，成為一種不可被螢幕完全取代的文化體驗。`
    hosts = [
      { name: '講者：陳敬元、陳念瑩', org: '' },
      { name: '主持：張玉音、羅智信', org: '' },
      {
        name: '野点 nodate',
        org: '恆成紙業內容品牌',
        bioZh:
          '恆成紙業內容品牌野点nodate，將「紙」的物質性與承載文化抽象意涵，透過材質、文化內容出版品、感官企劃，重新定義載體與內容的各種可能關係。包括主題式ARTBOOK、次文化梳理出版系列，以紙張、出版品、配件作為文化實驗場，持續打破傳統出版與媒體界線，對載體型態、製作方式進行再思考。'
      }
    ]
  } else if (s.id.startsWith('tour')) {
    topImage = 'programs/tour-1/cover'
    singleBottomImage = 'programs/tour-1/LSZ_1935'
    hosts = [
      {
        name: '林君燁 Lin Junye',
        org: '傻瓜書日 photobook dummy day',
        bioZh:
          '編輯、撰稿人及藝術書展策展，關注影像與藝術出版實踐。2018 年起主持傻瓜書日，策劃四屆藝術書展，並參展挪威 MOMENTUM 12 雙年展。著有《熱帶島讀》及《奶油刀》，編輯 Please Take Your Shoes Off And Come in 等書。曾受瑞士文化基金會邀請進行策展研究、擔任 Plat(t)form 專家，並獲美國 10×10 Photobooks 研究獎助。',
        ig: ['@fotobookdummiesday']
      }
    ]
    richIntro =
      '向台灣觀眾介紹藝術出版的概念、流變及實踐的場域，並以一本本藝術書作為串連，帶領觀眾認識現場的藝術出版社與書作。'
  } else if (s.id === 'silent-party') {
    topVideoEmbed = 'https://www.instagram.com/p/DClreeSP7fg/embed/'
    singleBottomImage = 'speakers/賓哥'
    statement = null
    richIntro =
      '深夜圖書館化身台語金曲 PARTY！跟著台中感傷唱片行游璨賓的 DJ 節奏，在卡帶／書頁／旋律之間，放鬆心靈，融化知識的距離！'
    hosts = [
      {
        name: '游璨賓',
        org: '感傷唱片行創辦人',
        bioZh: `游璨賓，台灣唯一卡式帶專賣「感傷唱片行」創辦人。2016年同勤美文創聚落合作創立「感傷唱片行」快閃店。於2017年到香港銅鑼灣POP-UP，並在台中成立實體店，喚起台港許多朋友對卡帶的回憶。2020起成立同名音樂廠牌發行卡帶專輯，將台灣的音樂推向海外。\n\n選樂風格緊扣「都會」與「生活感」，擅長游走於 Soul、Funk、Jazzy Hip-hop、City Pop 以及 90年代華語流行與 R&B 之間。他總能精準捕捉城市的縮影，用音樂勾勒出輕鬆、時髦且帶點浪漫的微醺氛圍，帶領聽眾在實體音樂的類比質地中，展開一場跨越時空的音樂散步。\n\n同時，他也是台灣少數以「華語卡式錄音帶」作為主要播放媒介的 DJ。他認為好的音樂不應只停留在他那一輩，藉由 DJ 演出讓更多年輕朋友重新接觸優秀的台灣音樂。`,
        ig: ['@being_yu']
      }
    ]
  } else if (s.id === 'opening') {
    topImage = 'programs/opening/cover'
    hosts = [
      {
        name: 'Pinchi (aka NULLX)',
        bioZh:
          matchedP?.hostBio ||
          'NULLX 橫跨媒體藝術、實驗劇場與聲音藝術，以軟硬體開發與系統整合，將系統化為創作語彙。在訊號與物質之間，以現場即興與即時能量的轉換，讓當下發生的一切流動、變形、延續，探索身體與時空在當代的關係。Pinchi 同時是位音樂創作者，以精巧的音色變化穿梭於各式風格之間。'
      }
    ]
  } else if (matchedP) {
    richIntro = matchedP.intro || s.blurb || ''
    if (matchedP.host) {
      hosts = [
        {
          name: matchedP.host,
          bioZh: matchedP.hostBio,
          ig: matchedP.ig
        }
      ]
    }
  }

  return {
    ...s,
    timeSimple,
    topImage,
    carouselPhotos,
    singleBottomImage,
    stackedImages,
    topVideoEmbed,
    richIntro,
    statement,
    hosts,
    links
  }
}
