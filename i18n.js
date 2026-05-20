// IPCC 多語言系統 — 繁體中文 / English / 日本語
(function () {
  var LANG_KEY = 'ipcc_lang';

  var T = {
    'zh-TW': {
      // ── 導航 ──
      'nav.home': '首頁',
      'nav.news': '最新消息',
      'nav.about': '關於我們',
      'nav.services': '專案服務',
      'nav.cases': '成功案例',
      'nav.contact': '與我們聯繫',

      // ── 頁尾 ──
      'footer.tagline': '整合系統、服務與數據，協助企業打造永續競爭力。',
      'footer.quick-links': '快速連結',
      'footer.service-items': '服務項目',
      'footer.address-title': '聯絡地址',
      'footer.north': '北區',
      'footer.central': '中區',
      'footer.outsource': '客服委外',
      'footer.training': '客服訓練',
      'footer.it': '資訊服務',
      'footer.copyright': '© 2025 東州互聯網實業股份有限公司 / 顯榮國際股份有限公司 版權所有',
      'footer.slogan': 'IPCC Group — 創新服務．永續經營',
      'footer.follow-us': '追蹤我們',

      // ── 通用按鈕 ──
      'btn.learn-more': '了解更多 →',
      'btn.view-all': '查看全部 →',
      'btn.contact-now': '立即免費諮詢',
      'btn.explore-services': '探索服務方案',
      'btn.free-consult': '免費諮詢',
      'btn.read-more': '閱讀更多 →',
      'btn.view-detail': '查看詳情 →',
      'btn.submit': '送出諮詢 →',
      'btn.learn-about-us': '深入了解我們 →',
      'btn.back': '← 返回',

      // ── 首頁 hero 數字 ──
      'home.stat.years': '集團年資',
      'home.stat.clients': '累計服務客戶',
      'home.stat.calls': '每日集團話務量',
      'home.stat.unit.year': '年',
      'home.stat.unit.calls': '通',

      // ── 首頁 最新消息 ──
      'home.news.title': '最新消息',
      'home.news.view-all': '查看全部 →',
      'home.news.tab.news': '最新消息',
      'home.news.tab.media': '媒體採訪',
      'home.news.tab.event': '活動',

      // ── 消息類別標籤 ──
      'news.badge.announcement': '公告',
      'news.badge.partnership': '合作',
      'news.badge.update': '動態',
      'news.badge.media': '媒體',
      'news.badge.event': '活動',

      // ── 首頁 服務 ──
      'home.services.title': '我們的服務',
      'home.services.subtitle': '整合客服委外、訓練與資訊技術，為企業和政府單位打造穩定、高效的服務體系',

      // ── 首頁 關於 ──
      'home.about.title': '我們是誰',
      'home.about.p1': '東州互聯網實業股份有限公司成立於 1996 年，初期以資訊系統整合為核心。1998 年與中華電信合作，投入 HINET 客服中心營運，正式跨入資訊服務與顧客服務領域。',
      'home.about.p2': '歷經數十年深耕，我們逐步發展出雙核心體系，整合「系統 × 服務 × 數據」，形成完整的企業營運解決方案。',
      'home.about.val1.title': '東州互聯網',
      'home.about.val1.desc': '資訊系統整合與數位基礎建構',
      'home.about.val2.title': '顯榮國際',
      'home.about.val2.desc': '多渠道客服營運與顧客體驗管理',
      'home.about.val3.title': '數據驅動',
      'home.about.val3.desc': '將服務轉化為決策資產',
      'home.about.val4.title': '永續經營',
      'home.about.val4.desc': '長期陪伴企業成長',
      'home.about.card.year-label': '成立年份',
      'home.about.card.title': '從系統到服務，從技術到體驗',
      'home.about.card.desc': '我們專注於客服體系建置與營運服務，提供客服訓練、客服委外及公部門專案支援，協助企業與政府單位打造穩定、高品質的服務流程。',
      'home.about.stat.years': '集團年資',
      'home.about.stat.calls': '每日話務量',
      'home.about.stat.clients': '服務客戶數',
      'home.about.stat.unit.year': '年',
      'home.about.stat.unit.calls': '通',

      // ── 首頁 CTA ──
      'home.cta.title': '準備好讓客服成為您的競爭優勢了嗎？',
      'home.cta.subtitle': '立即與我們的顧問團隊聯繫，了解最適合您的客服解決方案',
      'home.cta.phone-label': '免付費專線',
      'home.cta.line-label': 'LINE 社群諮詢',
      'home.cta.line-value': '加入官方帳號',

      // ── 麵包屑 / 頁面 Hero ──
      'page.home': '首頁',
      'page.about': '關於我們',
      'page.about.title': '關於東州集團',
      'page.about.subtitle': '三十年專注，打造台灣客服產業標竿',
      'page.about.intro': '集團簡介',
      'page.about.vision': '理念願景',
      'page.about.future': '未來展望',
      'page.about.awards': '榮譽認證',
      'page.about.security': '資訊安全',
      'page.news': '最新消息',
      'page.news.title': '最新消息',
      'page.news.subtitle': '集團動態、媒體報導與活動資訊',
      'page.news.tab.all': '全部',
      'page.news.tab.news': '最新消息',
      'page.news.tab.media': '媒體採訪',
      'page.news.tab.event': '活動',
      'page.news.no-content': '暫無內容',
      'page.media': '媒體採訪',
      'page.media.title': '媒體採訪',
      'page.event': '活動',
      'page.event.title': '活動報導',
      'page.services': '專案服務',
      'page.services.title': '專案服務',
      'page.services.subtitle': '整合性客服解決方案，協助企業與政府打造卓越服務體系',
      'page.services.training': '客服服務訓練',
      'page.services.it': '資訊服務',
      'page.cases': '成功案例',
      'page.cases.title': '成功案例',
      'page.cases.subtitle': '見證我們如何協助各產業提升服務品質',
      'page.cases.tab.all': '全部案例',
      'page.cases.tab.gov': '政府單位',
      'page.cases.tab.training': '訓練服務',
      'page.cases.gov': '政府案例',
      'page.cases.training': '訓練案例',
      'page.contact': '聯繫我們',
      'page.contact.title': '聯繫我們',
      'page.contact.subtitle': '讓我們了解您的需求，為您量身打造最適合的解決方案',

      // ── 關於我們 CTA ──
      'about.cta.title': '準備好合作了嗎？',
      'about.cta.subtitle': '立即聯繫我們的顧問，了解最適合您的客服解決方案',

      // ── 聯繫表單 ──
      'contact.form.title': '填寫諮詢表單',
      'contact.form.reply-note': '我們將在 1 個工作日內回覆您的需求',
      'contact.info.label': '立即諮詢',
      'contact.info.note': '無論您是需要客服委外、訓練服務或資訊技術支援，我們的顧問團隊將在 24 小時內與您聯繫。',
      'contact.info.phone': '免付費客服專線',
      'contact.info.line': 'LINE 官方帳號',
      'contact.info.line-value': '加入官方帳號諮詢',
      'contact.info.line-reply': '即時線上回覆',
      'contact.info.messenger': '傳送訊息給我們',
      'contact.info.messenger-reply': '即時線上回覆',
      'contact.info.office': '辦公地點',
      'contact.info.north': '北區',
      'contact.info.central': '中區',
      'contact.info.follow': '追蹤我們',
      'contact.form.name': '姓名 *',
      'contact.form.title-field': '職稱',
      'contact.form.company': '公司名稱 *',
      'contact.form.phone': '聯絡電話 *',
      'contact.form.email': '電子郵件 *',
      'contact.form.service': '感興趣的服務',
      'contact.form.time': '聯繫時段',
      'contact.form.message': '需求說明',
      'contact.form.privacy': '送出即表示您同意我們的隱私政策，您的資料將受到妥善保護',
      'contact.form.name-ph': '您的姓名',
      'contact.form.title-ph': '例：採購主管、HR 經理',
      'contact.form.company-ph': '您的公司或機關名稱',
      'contact.form.phone-ph': '09XX-XXX-XXX',
      'contact.form.message-ph': '請簡述您的客服現況與希望解決的問題，讓我們能為您提供最適合的建議…',
      'contact.form.svc-placeholder': '請選擇服務類型',
      'contact.form.svc-outsource': '客服委外服務',
      'contact.form.svc-training': '客服服務訓練',
      'contact.form.svc-it': '資訊服務解決方案',
      'contact.form.svc-multi': '多項服務整合',
      'contact.form.svc-other': '其他',
      'contact.form.time-placeholder': '請選擇方便聯繫的時段',
      'contact.form.time-am': '週一至週五 09:00 - 12:00',
      'contact.form.time-pm': '週一至週五 13:00 - 18:00',
      'contact.form.time-all': '週一至週五 全天皆可',
      'contact.form.time-sat': '週六 09:00 - 12:00',
      'contact.form.time-any': '不限時段，請來電或來信',
      'contact.modal.line': '掃描加入 LINE 官方帳號',
      'contact.modal.line-btn': '開啟 LINE 加入好友',
    },

    'en': {
      // ── Navigation ──
      'nav.home': 'Home',
      'nav.news': 'News',
      'nav.about': 'About',
      'nav.services': 'Services',
      'nav.cases': 'Cases',
      'nav.contact': 'Contact Us',

      // ── Footer ──
      'footer.tagline': 'Integrating systems, services and data to build sustainable competitive advantages for enterprises.',
      'footer.quick-links': 'Quick Links',
      'footer.service-items': 'Services',
      'footer.address-title': 'Our Offices',
      'footer.north': 'North',
      'footer.central': 'Central',
      'footer.outsource': 'Outsourced CS',
      'footer.training': 'CS Training',
      'footer.it': 'IT Services',
      'footer.copyright': '© 2025 East Zhou Internet Industrial Co., Ltd. / Xian Rong International Co., Ltd. All Rights Reserved.',
      'footer.slogan': 'IPCC Group — Innovation & Sustainability',
      'footer.follow-us': 'Follow Us',

      // ── Common buttons ──
      'btn.learn-more': 'Learn More →',
      'btn.view-all': 'View All →',
      'btn.contact-now': 'Contact Us Now',
      'btn.explore-services': 'Explore Services',
      'btn.free-consult': 'Free Consultation',
      'btn.read-more': 'Read More →',
      'btn.view-detail': 'View Details →',
      'btn.submit': 'Submit Inquiry →',
      'btn.learn-about-us': 'Learn More About Us →',
      'btn.back': '← Back',

      // ── Home hero stats ──
      'home.stat.years': 'Years of Experience',
      'home.stat.clients': 'Clients Served',
      'home.stat.calls': 'Daily Call Volume',
      'home.stat.unit.year': 'yrs',
      'home.stat.unit.calls': 'calls',

      // ── Home hero ──
      'home.hero.badge': 'East Zhou Internet × Xian Rong International — 30 Years in Taiwan\'s Customer Service Industry',
      'home.hero.title': 'Every message from your customer<br><span class="hero-title-accent">deserves to be taken seriously</span>',
      'home.hero.subtitle': 'We believe excellent service is more than answering questions —<br>it\'s about building trust for your brand and creating value in every conversation.',

      // ── Home news ──
      'home.news.title': 'Latest News',
      'home.news.view-all': 'View All →',
      'home.news.tab.news': 'News',
      'home.news.tab.media': 'Media',
      'home.news.tab.event': 'Events',

      // ── News badges ──
      'news.badge.announcement': 'Announcement',
      'news.badge.partnership': 'Partnership',
      'news.badge.update': 'Update',
      'news.badge.media': 'Media',
      'news.badge.event': 'Event',

      // ── Home services ──
      'home.services.title': 'Our Services',
      'home.services.subtitle': 'Integrating outsourced CS, training and IT solutions to help enterprises and government agencies build stable, high-performance service systems.',

      // ── Home about ──
      'home.about.title': 'Who We Are',
      'home.about.p1': 'East Zhou Internet Industrial Co., Ltd. was founded in 1996 with a focus on IT systems integration. In 1998, we partnered with Chunghwa Telecom to operate HINET\'s customer service center, officially entering the IT and customer service fields.',
      'home.about.p2': 'After decades of dedication, we developed a dual-core system integrating "Systems × Services × Data" to form a comprehensive business operations solution.',
      'home.about.val1.title': 'East Zhou Internet',
      'home.about.val1.desc': 'IT systems integration & digital infrastructure',
      'home.about.val2.title': 'Xian Rong International',
      'home.about.val2.desc': 'Multi-channel CS operations & customer experience management',
      'home.about.val3.title': 'Data-Driven',
      'home.about.val3.desc': 'Transforming service into decision-making assets',
      'home.about.val4.title': 'Sustainable Growth',
      'home.about.val4.desc': 'Long-term partnership for enterprise growth',
      'home.about.card.year-label': 'Founded',
      'home.about.card.title': 'From Systems to Service, From Technology to Experience',
      'home.about.card.desc': 'We specialize in customer service system setup and operations, offering CS training, outsourcing and public sector project support to help enterprises and government agencies build stable, high-quality service processes.',
      'home.about.stat.years': 'Years',
      'home.about.stat.calls': 'Daily Calls',
      'home.about.stat.clients': 'Clients',
      'home.about.stat.unit.year': 'yr',
      'home.about.stat.unit.calls': '',

      // ── Home CTA ──
      'home.cta.title': 'Ready to make customer service your competitive advantage?',
      'home.cta.subtitle': 'Contact our consulting team now to find the best customer service solution for you.',
      'home.cta.phone-label': 'Toll-Free Hotline',
      'home.cta.line-label': 'LINE Community',
      'home.cta.line-value': 'Add Official Account',

      // ── Pages ──
      'page.home': 'Home',
      'page.about': 'About',
      'page.about.title': 'About IPCC Group',
      'page.about.subtitle': '30 Years of Excellence in Taiwan\'s Customer Service Industry',
      'page.about.intro': 'Introduction',
      'page.about.vision': 'Vision & Mission',
      'page.about.future': 'Future Outlook',
      'page.about.awards': 'Awards',
      'page.about.security': 'Information Security',
      'page.news': 'News',
      'page.news.title': 'Latest News',
      'page.news.subtitle': 'Group updates, media coverage and event information',
      'page.news.tab.all': 'All',
      'page.news.tab.news': 'News',
      'page.news.tab.media': 'Media',
      'page.news.tab.event': 'Events',
      'page.news.no-content': 'No content available',
      'page.media': 'Media',
      'page.media.title': 'Media Coverage',
      'page.event': 'Events',
      'page.event.title': 'Events',
      'page.services': 'Services',
      'page.services.title': 'Services',
      'page.services.subtitle': 'Integrated customer service solutions to help enterprises and government agencies build outstanding service systems.',
      'page.services.training': 'CS Training',
      'page.services.it': 'IT Services',
      'page.cases': 'Cases',
      'page.cases.title': 'Success Stories',
      'page.cases.subtitle': 'See how we help industries across sectors improve their service quality.',
      'page.cases.tab.all': 'All Cases',
      'page.cases.tab.gov': 'Government',
      'page.cases.tab.training': 'Training',
      'page.cases.gov': 'Government Cases',
      'page.cases.training': 'Training Cases',
      'page.contact': 'Contact',
      'page.contact.title': 'Contact Us',
      'page.contact.subtitle': 'Tell us about your needs and we\'ll tailor the perfect solution for you.',

      // ── About CTA ──
      'about.cta.title': 'Ready to Work Together?',
      'about.cta.subtitle': 'Contact our consultants to find the best customer service solution for your needs.',

      // ── Contact form ──
      'contact.form.title': 'Inquiry Form',
      'contact.form.reply-note': 'We will respond within 1 business day.',
      'contact.info.label': 'Get In Touch',
      'contact.info.note': 'Whether you need outsourced CS, training or IT support, our consulting team will contact you within 24 hours.',
      'contact.info.phone': 'Toll-Free Customer Service',
      'contact.info.line': 'LINE Official Account',
      'contact.info.line-value': 'Add Official Account',
      'contact.info.line-reply': 'Real-time online reply',
      'contact.info.messenger': 'Send us a message',
      'contact.info.messenger-reply': 'Real-time online reply',
      'contact.info.office': 'Our Offices',
      'contact.info.north': 'North',
      'contact.info.central': 'Central',
      'contact.info.follow': 'Follow Us',
      'contact.form.name': 'Name *',
      'contact.form.title-field': 'Job Title',
      'contact.form.company': 'Company *',
      'contact.form.phone': 'Phone *',
      'contact.form.email': 'Email *',
      'contact.form.service': 'Service Needed',
      'contact.form.time': 'Preferred Contact Time',
      'contact.form.message': 'Your Requirements',
      'contact.form.privacy': 'By submitting you agree to our privacy policy. Your data will be protected.',
      'contact.form.name-ph': 'Your name',
      'contact.form.title-ph': 'e.g. Procurement Manager, HR Director',
      'contact.form.company-ph': 'Your company or organization',
      'contact.form.phone-ph': '+886-9XX-XXX-XXX',
      'contact.form.message-ph': 'Please describe your current CS needs and what issues you\'d like to solve…',
      'contact.form.svc-placeholder': 'Please select a service type',
      'contact.form.svc-outsource': 'Outsourced Customer Service',
      'contact.form.svc-training': 'CS Training Services',
      'contact.form.svc-it': 'IT Service Solutions',
      'contact.form.svc-multi': 'Multiple Services Integration',
      'contact.form.svc-other': 'Other',
      'contact.form.time-placeholder': 'Select preferred contact time',
      'contact.form.time-am': 'Mon–Fri 09:00 – 12:00',
      'contact.form.time-pm': 'Mon–Fri 13:00 – 18:00',
      'contact.form.time-all': 'Mon–Fri (all day)',
      'contact.form.time-sat': 'Saturday 09:00 – 12:00',
      'contact.form.time-any': 'Anytime — call or email',
      'contact.modal.line': 'Scan to add LINE Official Account',
      'contact.modal.line-btn': 'Open LINE to Add Friend',
    },

    'ja': {
      // ── ナビゲーション ──
      'nav.home': 'ホーム',
      'nav.news': 'ニュース',
      'nav.about': '会社概要',
      'nav.services': 'サービス',
      'nav.cases': '事例',
      'nav.contact': 'お問い合わせ',

      // ── フッター ──
      'footer.tagline': 'システム・サービス・データを統合し、企業の持続的な競争力構築を支援します。',
      'footer.quick-links': 'クイックリンク',
      'footer.service-items': 'サービス',
      'footer.address-title': '所在地',
      'footer.north': '北部',
      'footer.central': '中部',
      'footer.outsource': 'CS委託',
      'footer.training': 'CS研修',
      'footer.it': 'ITサービス',
      'footer.copyright': '© 2025 東州インターネット実業有限公司 / 顕栄インターナショナル株式会社 All Rights Reserved.',
      'footer.slogan': 'IPCC Group — 革新サービス・持続的経営',
      'footer.follow-us': 'フォローする',

      // ── ボタン ──
      'btn.learn-more': '詳しく見る →',
      'btn.view-all': 'すべて見る →',
      'btn.contact-now': '今すぐお問い合わせ',
      'btn.explore-services': 'サービスを見る',
      'btn.free-consult': '無料相談',
      'btn.read-more': '続きを読む →',
      'btn.view-detail': '詳細を見る →',
      'btn.submit': '送信する →',
      'btn.learn-about-us': '詳しく見る →',
      'btn.back': '← 戻る',

      // ── ホーム 数字 ──
      'home.stat.years': '業歴',
      'home.stat.clients': '累計顧客数',
      'home.stat.calls': '日次コール数',
      'home.stat.unit.year': '年',
      'home.stat.unit.calls': '件',

      // ── ホーム ヒーロー ──
      'home.hero.badge': '東州インターネット × 顕栄インターナショナル — 台湾のCSを30年支え続けて',
      'home.hero.title': 'お客様からのすべてのメッセージは<br><span class="hero-title-accent">真剣に向き合うに値する</span>',
      'home.hero.subtitle': '卓越したサービスとは、単に質問に答えることではなく——<br>あらゆる対話でブランドへの信頼を築き、企業に価値をもたらすことだと信じています。',

      // ── ホーム ニュース ──
      'home.news.title': '最新ニュース',
      'home.news.view-all': 'すべて見る →',
      'home.news.tab.news': 'ニュース',
      'home.news.tab.media': 'メディア',
      'home.news.tab.event': 'イベント',

      // ── ニュースバッジ ──
      'news.badge.announcement': 'お知らせ',
      'news.badge.partnership': '提携',
      'news.badge.update': '動向',
      'news.badge.media': 'メディア',
      'news.badge.event': 'イベント',

      // ── ホーム サービス ──
      'home.services.title': 'サービス一覧',
      'home.services.subtitle': 'CS委託・研修・ITソリューションを統合し、企業と政府機関が安定した高効率なサービス体制を構築できるよう支援します。',

      // ── ホーム 会社概要 ──
      'home.about.title': '私たちについて',
      'home.about.p1': '東州インターネット実業有限公司は1996年に設立され、当初はITシステム統合を中心としていました。1998年に中華電信と提携し、HINETカスタマーセンターの運営に参画、ITサービス・顧客サービス分野へと進出しました。',
      'home.about.p2': '数十年の専門的な取り組みを通じて、「システム × サービス × データ」を統合したデュアルコアシステムを構築し、包括的なビジネス運営ソリューションを形成してきました。',
      'home.about.val1.title': '東州インターネット',
      'home.about.val1.desc': 'ITシステム統合とデジタルインフラ構築',
      'home.about.val2.title': '顕栄インターナショナル',
      'home.about.val2.desc': 'マルチチャネルCS運営・顧客体験管理',
      'home.about.val3.title': 'データ駆動',
      'home.about.val3.desc': 'サービスを意思決定資産へと転換',
      'home.about.val4.title': '持続的経営',
      'home.about.val4.desc': '長期にわたる企業成長のパートナー',
      'home.about.card.year-label': '設立年',
      'home.about.card.title': 'システムからサービスへ、技術から体験へ',
      'home.about.card.desc': '私たちはCSシステムの構築と運営サービスに特化し、CS研修・委託・公共部門プロジェクト支援を提供することで、企業と政府機関が安定した高品質なサービスプロセスを構築できるよう支援しています。',
      'home.about.stat.years': '業歴',
      'home.about.stat.calls': '日次コール',
      'home.about.stat.clients': '顧客数',
      'home.about.stat.unit.year': '年',
      'home.about.stat.unit.calls': '件',

      // ── ホーム CTA ──
      'home.cta.title': 'カスタマーサービスを競争優位性にする準備はできていますか？',
      'home.cta.subtitle': '今すぐコンサルタントにご連絡いただき、最適なCSソリューションをご確認ください。',
      'home.cta.phone-label': 'フリーダイヤル',
      'home.cta.line-label': 'LINE コミュニティ',
      'home.cta.line-value': '公式アカウントを追加',

      // ── ページ ──
      'page.home': 'ホーム',
      'page.about': '会社概要',
      'page.about.title': 'IPCCグループについて',
      'page.about.subtitle': '30年の専門的な取り組みで、台湾のCS業界の基準を設定',
      'page.about.intro': '会社紹介',
      'page.about.vision': '理念とビジョン',
      'page.about.future': '将来展望',
      'page.about.awards': '受賞歴',
      'page.about.security': '情報セキュリティ',
      'page.news': 'ニュース',
      'page.news.title': '最新ニュース',
      'page.news.subtitle': 'グループの最新情報、メディア掲載、イベント情報',
      'page.news.tab.all': 'すべて',
      'page.news.tab.news': 'ニュース',
      'page.news.tab.media': 'メディア',
      'page.news.tab.event': 'イベント',
      'page.news.no-content': 'コンテンツがありません',
      'page.media': 'メディア',
      'page.media.title': 'メディア掲載',
      'page.event': 'イベント',
      'page.event.title': 'イベント',
      'page.services': 'サービス',
      'page.services.title': 'サービス',
      'page.services.subtitle': '企業と政府機関が卓越したサービス体制を構築できるよう、統合型CSソリューションをご提供します。',
      'page.services.training': 'CS研修',
      'page.services.it': 'ITサービス',
      'page.cases': '事例',
      'page.cases.title': '成功事例',
      'page.cases.subtitle': '様々な業界のサービス品質向上にどのように貢献しているかをご覧ください。',
      'page.cases.tab.all': 'すべての事例',
      'page.cases.tab.gov': '政府機関',
      'page.cases.tab.training': '研修サービス',
      'page.cases.gov': '政府機関事例',
      'page.cases.training': '研修事例',
      'page.contact': 'お問い合わせ',
      'page.contact.title': 'お問い合わせ',
      'page.contact.subtitle': 'ご要件をお聞かせください。最適なソリューションをご提案します。',

      // ── 会社概要 CTA ──
      'about.cta.title': '一緒に働く準備はできていますか？',
      'about.cta.subtitle': '今すぐコンサルタントにご連絡ください。最適なCSソリューションをご提案します。',

      // ── お問い合わせフォーム ──
      'contact.form.title': 'お問い合わせフォーム',
      'contact.form.reply-note': '1営業日以内にご返答いたします。',
      'contact.info.label': 'お問い合わせ',
      'contact.info.note': 'CS委託・研修・ITサポートのいずれをご希望でも、コンサルタントが24時間以内にご連絡いたします。',
      'contact.info.phone': 'フリーダイヤル',
      'contact.info.line': 'LINE公式アカウント',
      'contact.info.line-value': '公式アカウントを追加して相談',
      'contact.info.line-reply': 'リアルタイムオンライン返答',
      'contact.info.messenger': 'メッセージを送る',
      'contact.info.messenger-reply': 'リアルタイムオンライン返答',
      'contact.info.office': '所在地',
      'contact.info.north': '北部',
      'contact.info.central': '中部',
      'contact.info.follow': 'フォローする',
      'contact.form.name': 'お名前 *',
      'contact.form.title-field': '役職',
      'contact.form.company': '会社名 *',
      'contact.form.phone': '電話番号 *',
      'contact.form.email': 'メールアドレス *',
      'contact.form.service': 'ご希望のサービス',
      'contact.form.time': '希望連絡時間',
      'contact.form.message': 'ご要件',
      'contact.form.privacy': '送信することで、プライバシーポリシーに同意したことになります。',
      'contact.form.name-ph': 'お名前',
      'contact.form.title-ph': '例：調達マネージャー、人事部長',
      'contact.form.company-ph': '会社名または組織名',
      'contact.form.phone-ph': '+81-XX-XXXX-XXXX',
      'contact.form.message-ph': '現在のCS状況と解決したい課題をご記入ください…',
      'contact.form.svc-placeholder': 'サービスを選択してください',
      'contact.form.svc-outsource': 'CSアウトソーシング',
      'contact.form.svc-training': 'CS研修サービス',
      'contact.form.svc-it': 'ITサービスソリューション',
      'contact.form.svc-multi': '複数サービス統合',
      'contact.form.svc-other': 'その他',
      'contact.form.time-placeholder': '希望連絡時間を選択',
      'contact.form.time-am': '月〜金 09:00 – 12:00',
      'contact.form.time-pm': '月〜金 13:00 – 18:00',
      'contact.form.time-all': '月〜金（終日）',
      'contact.form.time-sat': '土曜 09:00 – 12:00',
      'contact.form.time-any': '時間不問（電話またはメール）',
      'contact.modal.line': 'LINE公式アカウントを追加するにはスキャン',
      'contact.modal.line-btn': 'LINEを開いて友達追加',
    }
  };

  // ── 目前語言 ───────────────────────────────────────────────
  var lang = localStorage.getItem(LANG_KEY) || 'zh-TW';

  // ── 取得翻譯值 ─────────────────────────────────────────────
  function t(key) {
    var dict = T[lang] || T['zh-TW'];
    return dict[key] !== undefined ? dict[key] : (T['zh-TW'][key] || '');
  }

  // ── 套用所有翻譯 ───────────────────────────────────────────
  function applyI18n() {
    // 第一次執行時儲存 data-i18n-html 的原始內容（管理員設定或預設中文）
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      if (!el.hasAttribute('data-i18n-orig')) {
        el.setAttribute('data-i18n-orig', el.innerHTML);
      }
    });

    // 切回繁中：還原 data-i18n-html 的原始中文內容
    if (lang === 'zh-TW') {
      document.querySelectorAll('[data-i18n-html][data-i18n-orig]').forEach(function (el) {
        el.innerHTML = el.getAttribute('data-i18n-orig');
      });
    }

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (val !== '') el.textContent = val;
    });

    // 非繁中：套用含 HTML 標籤的翻譯
    if (lang !== 'zh-TW') {
      document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
        var key = el.getAttribute('data-i18n-html');
        var val = t(key);
        if (val !== '') el.innerHTML = val;
      });
    }

    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-ph');
      var val = t(key);
      if (val !== '') el.placeholder = val;
    });
    // 更新 html lang 屬性
    document.documentElement.lang = lang === 'en' ? 'en' : lang === 'ja' ? 'ja' : 'zh-TW';
    // 更新語言切換器 UI
    updateSwitcherUI();
    // 日文字型
    if (lang === 'ja') loadJaFont();
  }

  // ── 更新語言切換器顯示 ─────────────────────────────────────
  var LANG_META = {
    'zh-TW': { flag: '🇹🇼', code: '繁中' },
    'en':    { flag: '🇺🇸', code: 'EN' },
    'ja':    { flag: '🇯🇵', code: '日本語' }
  };

  function updateSwitcherUI() {
    var meta = LANG_META[lang] || LANG_META['zh-TW'];
    var flagEl = document.querySelector('#langCurrentBtn .lang-flag');
    var codeEl = document.querySelector('#langCurrentBtn .lang-code');
    if (flagEl) flagEl.textContent = meta.flag;
    if (codeEl) codeEl.textContent = meta.code;
    document.querySelectorAll('.lang-opt').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  // ── 載入日文字型 ───────────────────────────────────────────
  function loadJaFont() {
    if (document.getElementById('noto-jp-font')) return;
    var link = document.createElement('link');
    link.id = 'noto-jp-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Noto Sans JP', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif";
  }

  // ── 公開函數 ───────────────────────────────────────────────
  window.switchLang = function (newLang) {
    lang = newLang;
    localStorage.setItem(LANG_KEY, newLang);
    applyI18n();
    closeLangMenu();
  };

  window.toggleLangMenu = function () {
    var menu = document.getElementById('langMenu');
    if (menu) menu.classList.toggle('open');
  };

  window.closeLangMenu = function () {
    var menu = document.getElementById('langMenu');
    if (menu) menu.classList.remove('open');
  };

  // 點擊外部關閉選單
  document.addEventListener('click', function (e) {
    if (!e.target.closest('#langSwitcher')) closeLangMenu();
  });

  // ── 初始化 ─────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyI18n);
  } else {
    applyI18n();
  }
})();
