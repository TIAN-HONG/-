const STATUS = [
  "已邀请",
  "已报名分享会",
  "已参加分享会",
  "已发资料",
  "有意向面试",
  "已分配面试官",
  "面试通过",
  "协议签署中",
  "背调中",
  "已入企业微信",
  "已进入with_hr入职",
  "已入职/开始做单",
  "放弃/不合适",
];

const NEED_MEETING = new Set([
  "面试通过",
  "协议签署中",
  "背调中",
  "已入企业微信",
  "已进入with_hr入职",
  "已入职/开始做单",
]);

const NEED_INTERVIEW = new Set([
  "协议签署中",
  "背调中",
  "已入企业微信",
  "已进入with_hr入职",
  "已入职/开始做单",
]);

const STORAGE_KEY = "shishi_h5_demo_leads_v2";
const VIDEO_KEY = "shishi_h5_intro_video_watched_v1";
const DEFAULT_DEV = "DEV20260521001";
const INVITE_REWARD_AMOUNT = 500;

const app = document.querySelector("#app");
let modal = null;
let toastTimer = null;

const seedLeads = [
  {
    id: "lead-zhang",
    name: "张明",
    phone: "13812345678",
    wechat: "zhangming2024",
    identity: "HR",
    role: "交付顾问",
    industry: "互联网/游戏",
    channel: "朋友圈",
    developerId: DEFAULT_DEV,
    shareId: "seed-001",
    status: "已入企业微信",
    rewardStatus: "待入职后结算",
    note: "有 3 年招聘经验，资源较好",
    createdAt: "2026-05-18 14:30",
    interviewer: "王总",
    logs: [
      ["2026-05-20 10:30", "已参加分享会", "系统"],
      ["2026-05-21 15:20", "面试通过", "王总"],
      ["2026-05-22 09:00", "已入企业微信", "HR"],
    ],
  },
  {
    id: "lead-li",
    name: "李娜",
    phone: "13900001234",
    wechat: "lina_hunter",
    identity: "猎头顾问",
    role: "交付顾问",
    industry: "智能制造",
    channel: "微信私聊",
    developerId: DEFAULT_DEV,
    shareId: "seed-002",
    status: "面试通过",
    rewardStatus: "待入职后结算",
    note: "面试官：王总",
    createdAt: "2026-05-19 11:20",
    interviewer: "王总",
    logs: [
      ["2026-05-19 11:20", "已邀请", DEFAULT_DEV],
      ["2026-05-20 20:00", "已参加分享会", "发展人"],
      ["2026-05-21 16:30", "面试通过", "王总"],
    ],
  },
  {
    id: "lead-wang",
    name: "王强",
    phone: "13600009876",
    wechat: "wq_auto",
    identity: "行业专家",
    role: "BD+交付",
    industry: "智能制造/汽车",
    channel: "小红书",
    developerId: DEFAULT_DEV,
    shareId: "seed-003",
    status: "已报名分享会",
    rewardStatus: "待入职后结算",
    note: "制造业背景，有客户资源",
    createdAt: "2026-05-20 08:30",
    interviewer: "",
    logs: [
      ["2026-05-20 08:30", "已邀请", DEFAULT_DEV],
      ["2026-05-20 09:12", "已报名分享会", "候选人提交"],
    ],
  },
  {
    id: "lead-liu",
    name: "刘阳",
    phone: "13700004567",
    wechat: "liuyang_pm",
    identity: "项目经理",
    role: "PM",
    industry: "金融科技",
    channel: "朋友圈",
    developerId: DEFAULT_DEV,
    shareId: "seed-004",
    status: "已查看H5",
    rewardStatus: "待入职后结算",
    note: "项目经理背景，待确认是否参会",
    createdAt: "2026-05-21 13:00",
    interviewer: "",
    logs: [
      ["2026-05-21 13:08", "已观看录播", "候选人"],
      ["2026-05-21 13:00", "已邀请", DEFAULT_DEV],
    ],
  },
];

function getLeads() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedLeads));
    return [...seedLeads];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [...seedLeads];
  }
}

function saveLeads(leads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function resetDemo() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedLeads));
  localStorage.removeItem(VIDEO_KEY);
  go("invite");
  showToast("Demo 数据已重置");
}

function nowText() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function uid() {
  return `lead-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function routeParams() {
  const query = new URLSearchParams(location.search);
  const hashQuery = new URLSearchParams((location.hash.split("?")[1] || "").trim());
  return {
    developerId: query.get("developerId") || hashQuery.get("developerId") || DEFAULT_DEV,
    channel: query.get("channel") || hashQuery.get("channel") || "朋友圈",
    shareId: query.get("shareId") || hashQuery.get("shareId") || "demo-share",
  };
}

function pageName() {
  const clean = (location.hash || "").slice(1).split("?")[0];
  if (clean) return clean;
  return document.body.dataset.page || pageFromPath() || "site";
}

function go(page, params = {}) {
  const file = PAGE_FILES[page];
  if (file) {
    const search = new URLSearchParams(params).toString();
    location.href = search ? `${file}?${search}` : file;
    return;
  }
  const search = new URLSearchParams(params).toString();
  location.hash = search ? `${page}?${search}` : page;
}

const PAGE_FILES = {
  home: "index.html",
  site: "site.html",
  "site-client": "client.html",
  "site-partner": "partner.html",
  "site-candidate": "candidate.html",
  "site-developer": "developer.html",
  invite: "../miniapp-h5/invite.html",
};

function pageFromPath() {
  const file = location.pathname.split("/").pop() || "index.html";
  const match = Object.entries(PAGE_FILES).find(([, value]) => value === file);
  return match?.[0];
}

function leadById(id) {
  return getLeads().find((lead) => lead.id === id) || getLeads()[0];
}

function updateLead(id, patch, logText, operator = "发展人") {
  const leads = getLeads();
  const index = leads.findIndex((lead) => lead.id === id);
  if (index < 0) return;
  const current = leads[index];
  const logs = [...(current.logs || [])];
  if (logText) logs.unshift([nowText(), logText, operator]);
  const next = { ...current, ...patch, logs };
  if (patch.status === "已入职/开始做单") {
    next.rewardStatus = "待结算";
    next.rewardAmount = next.rewardAmount || INVITE_REWARD_AMOUNT;
    next.rewardCreatedAt = nowText();
  }
  if (patch.status === "已进入with_hr入职" && !next.rewardStatus) {
    next.rewardStatus = "待入职后结算";
  }
  leads[index] = next;
  saveLeads(leads);
}

function maskPhone(phone = "") {
  return phone.replace(/^(\d{3})\d{4}(\d+)/, "$1****$2");
}

function shortName(name = "候选人") {
  if (name.length <= 1) return name;
  return `${name[0]}**`;
}

function badgeClass(status) {
  if (["已入企业微信", "已进入with_hr入职", "已入职/开始做单"].includes(status)) return "good";
  if (["已报名分享会", "已参加分享会", "面试通过", "协议签署中", "背调中"].includes(status)) return "warn";
  if (status === "放弃/不合适") return "bad";
  return "";
}

function hasLogOrStatus(lead, status) {
  return lead.status === status || (lead.logs || []).some((log) => log[1] === status);
}

function hasWatchedVideo() {
  return localStorage.getItem(VIDEO_KEY) === "1";
}

function setWatchedVideo() {
  localStorage.setItem(VIDEO_KEY, "1");
}

function h(strings, ...values) {
  return strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "");
}

function shell(screen, aside = defaultAside()) {
  const bottomMatch = screen.match(/<div class="bottom-bar[\s\S]*$/);
  const bottomHtml = bottomMatch ? bottomMatch[0] : "";
  const screenHtml = bottomMatch ? screen.slice(0, bottomMatch.index) : screen;
  app.innerHTML = `
    <main class="demo-shell">
      ${aside}
      <section class="phone-wrap" aria-label="H5 demo">
        <div class="phone">
          <div class="dynamic-island"></div>
          <div class="phone-status"><span>20:26</span><span></span><span>5G ▮</span></div>
          <div class="mobile-screen" id="mobileScreen">${screenHtml}</div>
          ${bottomHtml}
          <div class="home-indicator"></div>
        </div>
      </section>
    </main>
    ${modal || ""}
  `;
  bindCommon();
}

function siteShell(content, aside = defaultAside()) {
  app.innerHTML = `
    <main class="website-shell">${content}</main>
    ${modal || ""}
  `;
  bindCommon();
}

function entryShell() {
  app.innerHTML = `
    <main class="entry-shell">
      <section class="entry-hero">
        <p class="eyebrow">试试咨询 · 主站与 H5 裂变工具</p>
        <h1>两个载体，分开演示</h1>
        <p>PC 主站负责品牌信任和三类入口展示；H5 裂变工具负责发展人邀请、候选合伙人转化和状态推进。</p>
        <div class="entry-grid">
          <article class="entry-card">
            <span>01</span>
            <h2>PC 主站</h2>
            <p>展示公司定位、平台能力、客户入口、合伙人入口和求职者入口，重点建立信任。</p>
            <button class="btn primary" data-go="site">打开主站演示</button>
          </article>
          <article class="entry-card">
            <span>02</span>
            <h2>H5 裂变工具</h2>
            <p>发展人分享链接，候选人看视频、报名分享会、提交意向，发展人跟进线索和奖励。</p>
            <button class="btn primary" data-go="invite">打开 H5 演示</button>
          </article>
        </div>
      </section>
    </main>
  `;
  bindCommon();
}

function defaultAside() {
  return `
    <aside class="demo-aside">
      <p class="eyebrow">试试咨询 · 合伙人裂变 H5 Demo</p>
      <h1>把线下发展合伙人的流程串成一个可点击闭环</h1>
      <p>
        这个 demo 把创始人解析会里的核心表达产品化：试试不是传统猎头公司，而是一个去中心化招聘交易平台；
        用系统、SOP、数据资产和透明分佣，让有经验的人能更自由、更直接地通过结果挣钱。
      </p>
      <div class="flow-map">
        <div class="flow-item"><b>1</b><div><span>发展人分享</span><small>复制专属链接或生成海报，链接携带 developerId / channel / shareId。</small></div></div>
        <div class="flow-item"><b>2</b><div><span>候选人预热</span><small>候选人没到会议时间也能先看 3 分钟录播，理解平台、市场机会和分佣逻辑。</small></div></div>
        <div class="flow-item"><b>3</b><div><span>报名与意向</span><small>看完视频后可报名分享会、测算收益、提交入伙意向。</small></div></div>
        <div class="flow-item"><b>4</b><div><span>人工推进</span><small>发展人或 HR 人工确认参会、资料、面试、协议、背调、企微。</small></div></div>
        <div class="flow-item"><b>5</b><div><span>进入 with_hr</span><small>面试通过并加入企微后，带入关键字段跳转自助入职。</small></div></div>
      </div>
      <div class="aside-actions">
        <button class="btn" data-go="home">演示入口</button>
        <button class="btn primary" data-go="invite">候选人端</button>
        <button class="btn" data-go="dashboard">发展人工具台</button>
        <button class="btn" data-go="overview">闭合链路总览</button>
        <button class="btn ghost" data-action="reset">重置 demo</button>
      </div>
    </aside>
  `;
}

function header(title, sub, back = "") {
  return `
    <header class="screen-head">
      <div class="mini-nav">
        ${back ? `<button class="back-btn" data-go="${back}" aria-label="返回">‹</button>` : `<span class="back-placeholder"></span>`}
        <strong>${title}</strong>
        <button class="wechat-capsule" data-go="dashboard" aria-label="小程序菜单"><span></span><i></i></button>
      </div>
      ${sub ? `<p>${sub}</p>` : ""}
    </header>
  `;
}

function bottom(labels) {
  if (labels.length === 1) {
    return `<div class="bottom-bar single"><button class="btn primary" ${labels[0].attrs || ""}>${labels[0].text}</button></div>`;
  }
  return `
    <div class="bottom-bar">
      <button class="btn" ${labels[0].attrs || ""}>${labels[0].text}</button>
      <button class="btn primary" ${labels[1].attrs || ""}>${labels[1].text}</button>
    </div>
  `;
}

function renderOverview() {
  shell(`
    ${header("H5闭合链路总览", "从邀请到 with_hr 入职的一期完整演示。")}
    <div class="content">
      ${overviewCard("发展人端", "登录工具台 → 生成专属邀请链接 → 微信/朋友圈/小红书分享", "查看发展人工具台", "dashboard")}
      ${overviewCard("候选合伙人端", "打开 H5 → 先看录播视频 → 查看介绍/测算收益 → 报名分享会/提交意向", "查看候选人邀请页", "invite")}
      ${overviewCard("录播预热", "分享会内容基本稳定时，先用 3 分钟视频承接未到会议时间的候选人。", "查看视频页", "video")}
      ${overviewCard("系统生成线索", "候选人提交后自动归属发展人，进入线索列表与详情页。", "查看我的候选人", "leads")}
      ${overviewCard("人工推进状态", "发展人或 HR 标记分享会、资料、面试、协议、背调、企微。", "查看候选人详情", "lead-detail?id=lead-wang")}
      ${overviewCard("with_hr 入职", "已入企微/可入职后，跳转 with_hr 自助入职并带入来源字段。", "查看入职引导", "onboarding?id=lead-zhang")}
    </div>
    ${bottom([{ text: "候选人端", attrs: 'data-go="invite"' }, { text: "发展人工具台", attrs: 'data-go="dashboard"' }])}
  `);
}

function renderSite() {
  siteShell(`
    <nav class="site-nav">
      <div class="site-brand"><span>试</span>试试咨询</div>
      <div class="site-links">
        <button class="btn small" data-go="home">演示入口</button>
        <button class="btn small" data-go="site">主站首页</button>
        <button class="btn small" data-go="invite">另开H5裂变</button>
      </div>
    </nav>

    <header class="site-hero">
      <p class="site-kicker" style="color:rgba(255,255,255,.78)">企业招聘交付 + 猎头合伙人平台</p>
      <h1>试试咨询</h1>
      <p>试试不是传统猎头公司，而是一个以行业合伙人为核心的招聘交易平台。我们用系统、SOP 和项目协同机制，连接企业客户、BD、项目经理、交付顾问与候选人资源。</p>
      <div class="site-actions">
        <button class="btn primary" data-go="invite">了解合伙人机制</button>
        <button class="btn" data-go="home">返回演示入口</button>
      </div>
      <div class="site-metrics">
        <div class="site-metric"><b>平台化</b><span>连接客户、顾问与候选人资源</span></div>
        <div class="site-metric"><b>SOP</b><span>把招聘交付变成可复制流程</span></div>
        <div class="site-metric"><b>协同</b><span>BD、PM、交付按角色合作</span></div>
        <div class="site-metric"><b>结果</b><span>按贡献参与项目收益</span></div>
      </div>
    </header>

    <section class="site-section">
      <p class="site-kicker">试试是什么</p>
      <h2>不是再做一家猎头公司，而是重做招聘交付的协作方式</h2>
      <p>传统招聘服务高度依赖个人顾问和小团队，客户、职位、候选人和交付能力很难高效匹配。试试希望通过平台机制，把不同角色组织到同一个交易网络里。</p>
      <div class="site-grid">
        <article class="site-card">
          <strong>连接企业客户</strong>
          <p>让客户需求进入标准化项目流程，由行业合伙人和项目经理协同拆解交付。</p>
        </article>
        <article class="site-card">
          <strong>连接专业顾问</strong>
          <p>让 HR、猎头、行业专家可以按交付、BD、PM 等角色参与项目，而不是只依赖传统雇佣关系。</p>
        </article>
        <article class="site-card">
          <strong>连接候选人资源</strong>
          <p>通过系统、资料、流程和后续 AI 匹配能力，提高职位与人才之间的匹配效率。</p>
        </article>
      </div>
    </section>

    <section class="site-section alt">
      <p class="site-kicker">为什么我们要重做招聘交付</p>
      <h2>市场足够大，但传统模式不够高效</h2>
      <div class="site-grid">
        <article class="site-card">
          <strong>行业分散</strong>
          <p>招聘服务市场长期分散，客户找不到真正懂行业的人，顾问也很难持续获得好项目。</p>
        </article>
        <article class="site-card">
          <strong>成本高、分佣低</strong>
          <p>传统猎头公司的办公室、底薪、社保和管理层级消耗了大量收益，真正交付的人激励不足。</p>
        </article>
        <article class="site-card">
          <strong>协作不透明</strong>
          <p>客户、BD、PM、顾问和候选人资源之间缺少统一流程，容易出现重复沟通和无效竞争。</p>
        </article>
      </div>
    </section>

    <section class="site-section">
      <p class="site-kicker">平台能力</p>
      <h2>我们提供的不只是顾问，而是一套招聘交付基础设施</h2>
      <p>创始团队的大规模招聘管理经验，沉淀为系统、数据、SOP、培训和运营协同能力，让招聘从个人经验走向平台交付。</p>
      <div class="site-grid two">
        <article class="site-card"><strong>标准化 SOP</strong><p>把岗位分析、候选人推荐、面试推进、Offer 和回款节点拆成可追踪流程。</p></article>
        <article class="site-card"><strong>with_hr 系统</strong><p>承接入职、项目、协同、分佣和运营管理，让前端裂变和后端做单衔接。</p></article>
        <article class="site-card"><strong>行业运营合伙人</strong><p>用懂行业的人管理项目质量，帮助新顾问降低进入复杂岗位的门槛。</p></article>
        <article class="site-card"><strong>培训与运营中台</strong><p>用学习资料、项目辅导和运营支持，帮助非传统猎头也能按标准流程参与交付。</p></article>
      </div>
    </section>

    <section class="site-section alt">
      <p class="site-kicker">创始人想做的事</p>
      <div class="site-grid two">
        <article class="site-card emphasis">
          <strong>让有经验的人换一种方式做招聘</strong>
          <p>很多有经验的 HR、猎头和行业专家，到了某个阶段不一定适合继续回到传统公司体系里。试试希望给这些人一套能承接项目、协同交付、按结果获得收益的平台基础设施。</p>
        </article>
        <article class="site-card">
          <strong>靠专业、资源和结果获得收益</strong>
          <p>你不只是加入一家公司，而是进入一个可以把经验、资源和时间转化成长期能力的招聘交易网络。收益按项目角色、客户合同、回款和财务复核确认。</p>
        </article>
      </div>
    </section>

    <section class="site-section">
      <div class="site-footer-cta">
        <div>
          <strong>想了解自己适不适合成为合伙人？</strong>
          <p>进入小程序 H5，先看录播、测算收益、报名分享会。</p>
        </div>
        <button class="btn primary" data-go="invite">单独打开 H5</button>
      </div>
    </section>
  `);
}

function renderSiteV2() {
  siteShell(`
    <nav class="site-nav">
      <div class="site-brand"><span>试</span><div><b>试试咨询</b><small>招聘交易平台</small></div></div>
      <div class="site-links">
        <button class="link-button" data-anchor="#site-solutions">解决方案</button>
        <button class="link-button" data-anchor="#site-founder">创始人理念</button>
        <button class="link-button" data-anchor="#site-system">系统能力</button>
        <button class="link-button" data-anchor="#site-cases">案例背书</button>
        <button class="btn small" data-go="home">演示入口</button>
        <button class="btn primary small" data-go="invite">单独打开H5</button>
      </div>
    </nav>

    <header class="site-hero">
      <div class="site-hero-copy">
        <p class="site-kicker">企业招聘交付 + 猎头合伙人平台</p>
        <h1>试试咨询招聘交易平台解决方案</h1>
        <p>主站负责建立品牌信任，讲清楚试试是谁、创始人为什么做这件事，以及平台如何用 with_hr、SOP、数据资产和运营中台，把企业客户、BD、项目经理、交付顾问、候选人资源连接到同一张招聘交易网络里。</p>
        <div class="site-actions">
          <button class="btn primary" data-go="invite">了解合伙人机制</button>
          <button class="btn" data-anchor="#site-system">查看系统能力</button>
        </div>
      </div>
      <div class="site-hero-visual" aria-hidden="true">
        <div class="site-visual-card main"><span>with_hr</span><b>项目 / 入职 / 分佣 / 协同</b></div>
        <div class="site-visual-card one">企业客户</div>
        <div class="site-visual-card two">行业顾问</div>
        <div class="site-visual-card three">候选人资源</div>
        <div class="site-orbit"></div>
      </div>
    </header>

    <section class="site-section site-intro">
      <div>
        <p class="site-kicker">主站定位</p>
        <h2>不是普通官网，而是试试平台能力的解释页</h2>
        <p>PC 主站面向企业客户、潜在合伙人和求职者：企业看到交付能力，合伙人看到平台机制，求职者看到岗位机会与服务可信度。真正的合伙人转化动作进入独立 H5 裂变工具完成。</p>
      </div>
      <div class="site-metrics light">
        <div class="site-metric"><b>平台化</b><span>连接客户、顾问和候选人资源</span></div>
        <div class="site-metric"><b>SOP</b><span>把招聘交付变成可复制流程</span></div>
        <div class="site-metric"><b>协同</b><span>BD、PM、交付按角色合作</span></div>
        <div class="site-metric"><b>结果</b><span>按贡献参与项目收益</span></div>
      </div>
    </section>

    <section class="site-section" id="site-solutions">
      <p class="site-kicker">热门解决方案</p>
      <h2>围绕招聘交易链路，而不是只展示公司介绍</h2>
      <div class="site-grid solution-grid">
        <article class="site-card solution-card blue"><span>01</span><strong>企业招聘交付</strong><p>从职位需求、项目拆解、顾问协同到候选人推荐，帮助客户更快找到合适人选。</p></article>
        <article class="site-card solution-card"><span>02</span><strong>猎头合伙人平台</strong><p>让 HR、猎头、行业专家以 BD、PM、交付顾问等角色参与项目。</p></article>
        <article class="site-card solution-card"><span>03</span><strong>发展人裂变增长</strong><p>用 H5 承接分享、报名、资料、面试、协议、背调、入职状态推进。</p></article>
        <article class="site-card solution-card"><span>04</span><strong>求职者简历授权</strong><p>展示热招岗位、成功案例和咨询入口，后续对接职位数据与推荐服务。</p></article>
        <article class="site-card solution-card"><span>05</span><strong>运营中台服务</strong><p>统一培训、资料、答疑、项目辅导、质量管理和节点跟进。</p></article>
        <article class="site-card solution-card"><span>06</span><strong>with_hr 入职承接</strong><p>把 H5 前置线索沉淀到正式入职、做单、协同和分佣系统。</p></article>
      </div>
    </section>

    <section class="site-section alt">
      <p class="site-kicker">全部解决方案</p>
      <h2>从获客、交付到入职做单的完整架构</h2>
      <div class="site-solution-layout">
        <aside class="site-solution-menu">
          <b>企业客户</b><b>合伙人增长</b><b>交付协同</b><b>数据资产</b><b>系统能力</b><b>运营中台</b>
        </aside>
        <div class="site-solution-list">
          <article><strong>招聘交付流程标准化</strong><p>岗位分析、寻访、推荐、面试推进、Offer、回款节点统一沉淀。</p></article>
          <article><strong>客户关系与 BD 协同</strong><p>客户资源、职位机会、BD 贡献与后续交付关系清晰记录。</p></article>
          <article><strong>项目经理交付管理</strong><p>PM 负责拆解需求、分配顾问、盯进度、控质量，让复杂职位能被组织化交付。</p></article>
          <article><strong>候选人与简历资源协同</strong><p>候选人授权、岗位匹配、推荐记录、脱敏案例逐步沉淀为可复用数据资产。</p></article>
          <article><strong>with_hr 自助入职与分佣承接</strong><p>合伙人从 H5 进入正式入职系统后，继续完成身份、角色、项目和收益归属确认。</p></article>
          <article><strong>发展人奖励与裂变追踪</strong><p>邀请链接携带 developerId / channel / shareId，方便统计来源、推进状态与奖励复核。</p></article>
        </div>
      </div>
    </section>

    <section class="site-section founder-section" id="site-founder">
      <div class="founder-copy">
        <p class="site-kicker">创始人想传达的事</p>
        <h2>把招聘服务从“个人经验生意”，升级为“平台化交易网络”</h2>
        <p>创始人想讲清楚的不是“我们又开了一家猎头公司”，而是招聘行业长期分散、低效、协作不透明，应该有一种新的组织方式：让懂行业、懂岗位、有人脉、有交付能力的人，通过平台机制一起完成招聘交易。</p>
        <p>试试希望给 35+ HR、资深猎头和行业专家一条新的职业路径：不必只回到传统雇佣体系里，也能靠专业、资源和结果获得长期收益，真正“站着挣钱”。</p>
      </div>
      <div class="founder-points">
        <div><b>市场足够大</b><span>招聘服务是数千亿到万亿级机会，但仍高度分散。</span></div>
        <div><b>角色重新组织</b><span>BD、PM、交付、发展人按贡献进入同一套协作规则。</span></div>
        <div><b>收益更透明</b><span>具体收益以项目角色、客户合同、回款和财务复核为准。</span></div>
      </div>
    </section>

    <section class="site-section" id="site-system">
      <p class="site-kicker">系统能力</p>
      <h2>试试的核心壁垒，是系统、SOP、数据和运营中台共同形成的交付基础设施</h2>
      <div class="system-row">
        <article class="system-card primary"><strong>with_hr</strong><p>正式承接合伙人自助入职、项目做单、面试官确认、HR 终审、企业微信登录、后续协同与分佣。</p></article>
        <article class="system-card"><strong>SOP 流程</strong><p>把岗位分析、候选人推荐、面试推进、协议背调、入职做单拆成可追踪节点。</p></article>
        <article class="system-card"><strong>数据资产</strong><p>客户、职位、候选人、简历授权、交付案例持续沉淀，后续支撑更精确匹配。</p></article>
        <article class="system-card"><strong>运营中台</strong><p>提供资料、培训、答疑、项目辅导、质量管理和人工状态推进。</p></article>
        <article class="system-card"><strong>AI 匹配路线</strong><p>在标准数据和流程成熟后，引入岗位与人才的智能匹配，提高推荐效率。</p></article>
      </div>
    </section>

    <section class="site-section alt" id="site-cases">
      <p class="site-kicker">客户与案例背书</p>
      <h2>用行业场景证明交付能力，用脱敏案例建立信任</h2>
      <div class="case-strip">
        <span>智能制造客户</span><span>汽车供应链客户</span><span>互联网业务客户</span><span>消费零售客户</span><span>医疗健康客户</span>
      </div>
      <div class="site-grid three">
        <article class="site-card"><strong>企业客户看到什么</strong><p>公司简介、平台优势、服务流程、成功案例、顾问协同机制和咨询入口。</p></article>
        <article class="site-card"><strong>合伙人看到什么</strong><p>适合人群、角色分工、分佣机制、平台赋能、Q&A 和独立 H5 转化入口。</p></article>
        <article class="site-card"><strong>求职者看到什么</strong><p>热招岗位、简历授权价值、成功案例和顾问联系入口，职位数据后续从 with_hr 同步。</p></article>
      </div>
    </section>

    <section class="site-section">
      <div class="site-footer-cta">
        <div><strong>主站负责说明平台，H5负责承接转化</strong><p>合伙人入口会单独打开微信 H5：看录播、测收益、报名分享会、提交意向、推进面试与入职。</p></div>
        <button class="btn primary" data-go="invite">单独打开 H5 裂变页</button>
      </div>
    </section>

    <footer class="site-footer">
      <div><strong>试试咨询</strong><p>招聘交易平台解决方案</p></div>
      <div><b>主站</b><button class="link-button" data-anchor="#site-solutions">解决方案</button><button class="link-button" data-anchor="#site-founder">创始人理念</button></div>
      <div><b>系统</b><button class="link-button" data-anchor="#site-system">with_hr</button><button class="link-button" data-anchor="#site-system">运营中台</button></div>
      <div><b>转化</b><button class="link-button" data-go="invite">H5裂变页</button><button class="link-button" data-go="dashboard">发展人工具台</button></div>
    </footer>
  `);
}

function siteWebNav(active = "home") {
  const navs = [
    ["site-client", "客户入口", "client"],
    ["site-partner", "合伙人入口", "partner"],
    ["site-candidate", "求职者入口", "candidate"],
  ];
  return `
    <nav class="web-nav">
      <button class="web-logo" data-go="site">试试咨询</button>
      <div class="web-nav-links">
        ${navs.map(([page, label, key]) => `<button class="link-button ${active === key ? "active" : ""}" data-go="${page}">${label}</button>`).join("")}
        <button class="web-workbench" data-go="site-developer">发展人工具台</button>
      </div>
    </nav>
  `;
}

function siteWebFooter() {
  return `
    <footer class="web-footer">
      <div><b>关于试试咨询</b><p>以行业运营合伙人为核心，连接企业客户、猎头顾问、项目经理与高质量人才。</p></div>
      <div><b>企业服务</b><span>招聘交付</span><span>组织咨询</span><span>背调协同</span></div>
      <div><b>合作伙伴</b><span>成为合伙人</span><span>合伙人体系</span><span>平台赋能</span></div>
      <div><b>联系我们</b><span>企业微信：试试咨询</span><span>邮箱：contact@shishi.com</span></div>
    </footer>
  `;
}

function numberedTitle(num, title) {
  return `<div class="web-number-title"><span>${num}</span><h2>${title}</h2></div>`;
}

function renderSiteHome() {
  siteShell(`
    ${siteWebNav("home")}
    <main class="web-main">
      <section class="web-hero">
        <div>
          <h1>试试咨询</h1>
          <h3>企业招聘交付 + 猎头合伙人平台</h3>
          <p>试试不是传统猎头公司，而是一个去中心化招聘交易平台。创始人想传达的是：招聘行业市场足够大，但长期分散、低效、协作不透明，试试要用平台、系统、SOP 和运营中台，把客户、BD、PM、交付顾问与候选人资源组织起来。</p>
          <div class="web-actions">
            <button class="btn primary" data-go="site-partner">了解合伙人机制</button>
            <button class="btn" data-go="site-client">查看企业服务</button>
            <button class="btn" data-go="site-candidate">查看热招职位</button>
          </div>
          <div class="web-checks">
            <span>覆盖互联网、制造、金融、大健康、出海等重点行业</span>
            <span>with_hr 承接入职、做单、协同与分佣</span>
          </div>
        </div>
      </section>

      <section class="web-section center">
        <h2>一个主站，三类入口，一个核心转化工具</h2>
        <p>主站负责建立信任；H5 负责合伙人裂变；with_hr 负责正式入职和做单。</p>
        <div class="web-entry-grid">
          <article class="web-entry-card" data-go="site-client"><span>企</span><h3>客户HR / 企业负责人</h3><p>看公司实力、合作案例、交付优势，并留下招聘需求。</p><button class="link-button" data-go="site-client">进入客户入口</button></article>
          <article class="web-entry-card highlight" data-go="site-partner"><span>合</span><h3>潜在合伙人</h3><p>看适合人群、加入流程、赚钱方式、分佣规则和平台赋能。</p><button class="link-button" data-go="site-partner">进入合伙人入口</button></article>
          <article class="web-entry-card" data-go="site-candidate"><span>才</span><h3>求职者 / 候选人</h3><p>看行业机会和脱敏职位，授权简历后获得顾问匹配。</p><button class="link-button" data-go="site-candidate">进入求职者入口</button></article>
        </div>
      </section>

      <section class="web-section muted">
        <h2>行业运营合伙人阵容</h2>
        <p>把创始人想讲的“平台化组织方式”落到角色：有人带客户，有人管项目，有人交付候选人，有人做运营和训练。</p>
        <div class="web-category-grid">
          <article><b>智能制造 & 汽车</b><span>质量/供应链/研发/生产运营</span></article>
          <article><b>互联网 & 游戏</b><span>研发/产品/运营/商业化</span></article>
          <article><b>金融 & 金融科技</b><span>风控/产品/算法/业务拓展</span></article>
          <article><b>大健康 & 出海</b><span>医疗器械/海外市场/跨境供应链</span></article>
        </div>
      </section>

      <section class="web-section">
        <h2>先给用户一个答案，再收集线索</h2>
        <p>客户、合伙人、求职者都可以通过轻量测算获得参考结果，但页面必须明确：测算是基于平台经验的业务参考，不是收入、周期或录用承诺。</p>
        <div class="web-form-card">
          <div class="web-tabs"><span class="active">合伙人收益测算</span><span>客户招聘周期预估</span><span>求职者岗位匹配</span></div>
          <div class="web-form-grid">
            <label>当前身份<input placeholder="如：HR / 猎头 / 行业专家" /></label>
            <label>行业方向<input placeholder="如：智能制造 / 互联网 / 大健康" /></label>
            <label>可投入时间<input placeholder="如：每周 10 小时" /></label>
            <label>联系方式<input placeholder="手机号或微信号" /></label>
          </div>
          <button class="btn primary">保存测算并联系我</button>
        </div>
      </section>

      <section class="web-section muted">
        <h2>用结果建立信任</h2>
        <div class="web-proof-grid">
          <article><strong>15天</strong><b>关键岗位快速关闭</b><p>适合岗位画像清晰、面试流程顺畅的中高级职位。</p></article>
          <article><strong>10个月</strong><b>制造业年度供应商项目</b><p>60+ 职位委托，30+ 专属顾问，持续交付中。</p></article>
          <article><strong>关键岗位</strong><b>行业定向寻访</b><p>围绕同业 Top 公司人才地图，进行精准推荐。</p></article>
        </div>
      </section>
    </main>
    ${siteWebFooter()}
  `);
}

function renderSiteClient() {
  siteShell(`
    ${siteWebNav("client")}
    <main class="web-main">
      <section class="web-page-hero"><h1>客户入口：让客户快速相信试试能交付</h1><p>不是只展示公司介绍，而是证明试试具备平台化招聘交付能力：行业合伙人、项目经理、顾问团队、with_hr 流程系统和运营中台共同完成交付。</p></section>
      <section class="web-section">${numberedTitle(1, "公司简介")}<div class="web-note">试试咨询以 <b>行业运营合伙人为核心</b>，连接企业客户、项目经理、猎头顾问和候选人。我们不依赖单一顾问，而是通过 SOP、系统和运营中台，把招聘交付做成可复制的团队能力。</div></section>
      <section class="web-section muted">${numberedTitle(2, "合作案例")}<div class="web-proof-grid"><article><b>某SaaS软件公司</b><h3>研发团队快速搭建</h3><p>推荐88人，面试37人，入职13人，关闭周期15天。</p></article><article><b>某制造业企业</b><h3>年度供应商合作</h3><p>60+ 职位委托，30+ 专属顾问，合作10个月持续交付。</p></article><article><b>某金融科技公司</b><h3>关键岗位快速关闭</h3><p>同业人才摸排，精准推荐，入职后持续跟进。</p></article></div></section>
      <section class="web-section">${numberedTitle(3, "优势提炼")}<div class="web-feature-grid"><article><b>行业合伙人网络</b><p>深耕垂直行业，懂岗位、懂人才、懂客户业务。</p></article><article><b>专属项目组交付</b><p>项目经理 + 多名顾问协同，不把交付压在单个顾问身上。</p></article><article><b>with_hr流程系统</b><p>进度透明、节点可追踪，让客户知道招聘推进到哪里。</p></article><article><b>背调工具</b><p>背调协同先人工记录，后续按量级评估接口化。</p></article><article><b>运营中台支持</b><p>培训、资料、答疑、质量管理和交付辅导共同支撑项目。</p></article></div></section>
      <section class="web-section muted">${numberedTitle(4, "商机建议")}<div class="web-form-card"><p>填写信息，获得首批推荐时间和预计关闭周期参考。</p><div class="web-form-grid"><label>职位难度<input /></label><label>招聘紧急程度<input /></label><label>岗位画像清晰度<input /></label><label>公司名称<input placeholder="请输入公司名称" /></label><label>联系方式<input placeholder="手机号或微信号" /></label></div><button class="btn primary">获取预估报告并联系我</button></div></section>
    </main>
    ${siteWebFooter()}
  `);
}

function renderSitePartner() {
  siteShell(`
    ${siteWebNav("partner")}
    <main class="web-main">
      <section class="web-page-hero partner"><span>一期核心转化入口</span><h1>合伙人入口：把线下发展合伙人的讲解流程产品化</h1><p>创始人想传达的是：试试不是再做一家猎头公司，而是“人力资源领域的滴滴”。让 35+ HR、资深猎头、行业专家，凭专业、资源和结果在平台上站着挣钱。</p></section>
      <section class="web-section">${numberedTitle(1, "合伙人画像")}<div class="web-feature-grid three"><article><b>有HR、招聘、猎头或行业资源的人</b><p>具备招聘相关经验、客户关系或行业人脉资源。</p></article><article><b>希望兼职或全职参与招聘交付的人</b><p>不一定回到传统雇佣体系，也可以用碎片时间参与项目。</p></article><article><b>具备客户开发、项目管理或候选人交付能力的人</b><p>BD、PM、交付顾问、发展人都能找到角色。</p></article></div></section>
      <section class="web-section muted">${numberedTitle(2, "如何加入")}<div class="web-flow">${["发展人邀请/看录播", "参加正式解析会", "阅读资料包", "表达意向并面试", "腾讯签协议", "知了背调", "企微与with_hr入职"].map((x, i) => `<div><span>${i + 1}</span><b>${x}</b></div>`).join("")}</div><div class="web-warn">未参加解析会或未完成人工确认沟通、未通过面试，不能继续进入协议、背调和入职。</div></section>
      <section class="web-section">${numberedTitle(3, "如何挣钱")}<div class="web-split-grid"><article class="strong"><b>65%</b><p>交付角色基础收益示意</p></article><article><b>10%</b><p>BD 贡献示意</p></article><article><b>5%</b><p>PM 项目管理示意</p></article><article><b>发展人</b><p>邀请入职后的发展奖励，由平台规则和财务复核确认。</p></article></div><p class="web-muted-text">收益比例用于解释角色分工，以项目角色、客户合同、回款和财务复核为准，不作为收入承诺。</p></section>
      <section class="web-section muted">${numberedTitle(4, "平台赋能")}<div class="web-feature-grid three"><article><b>招聘渠道</b><p>多渠道职位与候选人资源协同。</p></article><article><b>行业运营合伙人</b><p>行业打法、项目辅导和质量把控。</p></article><article><b>with_hr系统工具</b><p>入职、做单、协同、分佣统一承接。</p></article><article><b>新人培训</b><p>资料包、解析会、Q&A和SOP训练。</p></article><article><b>项目组辅导</b><p>PM 全程指导复杂岗位交付。</p></article><article><b>运营中台</b><p>减少个人单打独斗的学习成本。</p></article></div></section>
      <section class="web-section"><h2>发展人裂变链路：从触达到入职，减少人工重复讲解</h2><div class="web-flow compact">${["私域触达", "发送H5链接", "查看H5页面", "报名/提交", "人工确认流程", "企微引导入职"].map((x, i) => `<div><span>${i + 1}</span><b>${x}</b></div>`).join("")}</div><div class="web-actions"><button class="btn primary" data-go="site-developer">进入发展人工具台</button><button class="btn" data-go="invite">查看H5裂变页</button></div></section>
    </main>
    ${siteWebFooter()}
  `);
}

function renderSiteCandidate() {
  siteShell(`
    ${siteWebNav("candidate")}
    <main class="web-main">
      <section class="web-page-hero"><h1>求职者入口：展示机会，并完成简历授权</h1><p>让求职者看到真实行业机会、脱敏热招岗位和顾问服务价值，授权简历后由顾问先匹配、再确认推荐。</p></section>
      <section class="web-section"><h2>热招职位</h2><div class="job-board">${["互联网 / 游戏", "智能制造 / 汽车", "金融 / 金融科技", "大健康", "出海 / 跨境"].map((cat) => `<article><h3>${cat}</h3>${["Java后端架构师｜上海｜50-90万", "前端技术专家｜北京｜45-80万", "业务负责人｜深圳｜60-100万"].map((job) => `<div><b>${job}</b><button>立即沟通</button></div>`).join("")}</article>`).join("")}</div></section>
      <section class="web-section muted"><div class="web-form-card narrow"><h2>测算可匹配岗位</h2><p>授权简历后，专业顾问将为你匹配合适职位机会。测算只做参考，不承诺录用周期。</p><div class="web-form-grid single"><label>姓名<input placeholder="请输入姓名" /></label><label>手机号<input placeholder="请输入手机号" /></label><label>简历附件（可选）<input placeholder="支持 PDF、Word" /></label></div><label class="web-consent"><input type="checkbox" /> 我同意试试咨询基于我的求职意向进行职位匹配、顾问联系和简历推荐前确认</label><button class="btn primary">提交并测算可匹配岗位</button></div></section>
    </main>
    ${siteWebFooter()}
  `);
}

function renderSiteDeveloper() {
  siteShell(`
    ${siteWebNav("developer")}
    <main class="web-main">
      <section class="web-page-hero partner"><h1>发展人工具台</h1><p>管理你的邀请链接，跟踪候选合伙人进展。PC 主站展示结构，真正移动端转化仍由独立 H5 承接。</p></section>
      <section class="web-section"><div class="developer-id"><div><span>发展人ID</span><b>DEV20260521001</b></div><div><span>累计邀请</span><b>12 人</b></div></div></section>
      <section class="web-section"><h2>专属H5邀请链接</h2><div class="web-link-card"><span>https://shishi.example/h5/referral/DEV20260521001?developerId=DEV20260521001&channel=wechat</span><button class="btn primary" data-action="copy-link" data-link="https://shishi.example/h5/referral/DEV20260521001?developerId=DEV20260521001&channel=wechat">复制链接</button></div><div class="web-channel-grid"><span>微信朋友圈<br><small>配合文案分享链接</small></span><span>私域微信<br><small>一对一发送链接</small></span><span>小红书 / 社交媒体<br><small>内容营销推广</small></span></div></section>
      <section class="web-section muted"><h2>邀请数据概览</h2><div class="web-split-grid"><article><b>5</b><p>待跟进</p></article><article><b>4</b><p>面试中</p></article><article><b>3</b><p>已加入</p></article><article><b>12</b><p>总计</p></article></div></section>
      <section class="web-section"><h2>最近邀请记录</h2><div class="web-table"><div><b>张**</b><span>已加入</span><span>2026-05-20</span><span>朋友圈</span><button>查看详情</button></div><div><b>李**</b><span>面试中</span><span>2026-05-19</span><span>微信私聊</span><button>查看详情</button></div><div><b>王**</b><span>已报名分享会</span><span>2026-05-18</span><span>小红书</span><button>查看详情</button></div></div></section>
      <section class="web-section muted"><div class="web-tip"><b>使用提示</b><p>发展人需人工确认参会、资料、面试、协议、背调、企微状态；候选人加入企业微信后，引导进入 with_hr 自助入职。</p></div></section>
    </main>
    ${siteWebFooter()}
  `);
}

function overviewCard(title, body, cta, page) {
  return `
    <article class="card">
      <h3>${title}</h3>
      <p>${body}</p>
      <button class="btn small" data-go="${page}" style="margin-top:12px">${cta}</button>
    </article>
  `;
}

function renderInvite() {
  const p = routeParams();
  const watched = hasWatchedVideo();
  shell(`
    ${header("成为试试咨询猎头合伙人", "由发展人邀请进入 H5。没到分享会时间，也可以先看录播了解平台、分佣、赋能和做单流程。")}
    <div class="content">
      <section class="card hero-card">
        <h3>去中心化招聘交易平台</h3>
        <p>试试不是传统猎头公司，而是把客户、候选人、猎头顾问、BD、项目经理连接起来的平台。平台提供系统、SOP、法税、数据资产和运营支持，让真正创造结果的人获得更高比例回报。</p>
        <span class="invite-code">邀请人 ${p.developerId}</span>
      </section>

      <section class="card">
        <h3>创始人想讲清楚的三件事</h3>
        ${infoRow("行业机会", "5000亿-万亿级市场，极度分散")}
        ${infoRow("平台模式", "像人力资源领域的滴滴")}
        ${infoRow("核心使命", "让有经验的人站着挣钱")}
      </section>

      <section class="card video-card">
        <div class="play-mark">▶</div>
        <h3>先看 3 分钟了解合伙人机制</h3>
        <p>分享会内容大体稳定，候选人可以先通过录播了解行业机会、平台模式、角色分工、分佣方式和加入流程。</p>
        <div class="video-progress" style="margin-top:18px"><span style="width:${watched ? "100" : "18"}%"></span></div>
        <button class="btn ${watched ? "" : "primary"}" data-go="video" style="margin-top:14px">${watched ? "已观看，重新查看" : "播放介绍视频"}</button>
      </section>

      <section class="card">
        <h3>试试是什么</h3>
        <p>试试要做的是招聘行业的交易基础设施：不靠办公室、底薪和层级堆成本，而是通过平台把客户关系户、顾问、项目经理和候选人资源组织起来。</p>
      </section>

      <section class="card">
        <h3>为什么现在加入</h3>
        <p>中国猎头市场足够大，但长期分散、低效、分佣不透明。很多顾问只拿到项目收益的一小部分，客户找不到合适顾问，顾问也很难高效获得好职位。</p>
      </section>

      <section class="card">
        <h3>创始人想做的事</h3>
        <p>让有经验的 HR、猎头和行业专家，不再只依赖一家公司或一个老板，而是能凭专业、资源和结果，在平台上更自由地做事、站着挣钱。</p>
      </section>

      <div class="grid-2">
        <button class="btn blue" data-go="signup">报名分享会</button>
        <button class="btn" data-go="calc">先测算收益</button>
      </div>

      <section class="section-title"><h3>适合谁加入</h3></section>
      <div class="grid-3">
        ${["HR", "猎头顾问", "项目经理", "行业专家", "客户BD", "兼职合伙人"].map((x) => `<span class="pill">${x}</span>`).join("")}
      </div>

      <section class="section-title"><h3>怎么赚钱</h3></section>
      <section class="card">
        <h3>透明分佣，把钱分给真正做事的人</h3>
        <p>传统猎头顾问往往只能拿到约 30% 的项目收益，大量收入被固定成本和公司层级吸收。试试希望把更多收益分给 BD、PM、交付顾问和发展人，平台只保留系统、运营和激励所需部分。</p>
      </section>
      <article class="card money-card"><div><h4>交付</h4><span>推荐候选人，基础比例 65%</span></div><strong>65%</strong></article>
      <article class="card money-card"><div><h4>BD</h4><span>贡献客户资源或签约机会</span></div><strong>10%</strong></article>
      <article class="card money-card"><div><h4>PM</h4><span>项目管理与团队协同</span></div><strong>5%</strong></article>
      <article class="card money-card"><div><h4>发展人</h4><span>邀请新合伙人，沉淀来源</span></div><strong>+</strong></article>

      <section class="card">
        <h3>如何分钱</h3>
        ${splitRow("公司运营与激励", "20%")}
        ${splitRow("BD", "10%")}
        ${splitRow("PM", "5%")}
        ${splitRow("交付", "65%")}
        <p style="margin-top:10px">实际分佣以客户合同、项目角色、回款和财务复核为准。</p>
      </section>

      <section class="section-title"><h3>平台赋能</h3></section>
      <section class="card">
        <h3>给你的不是一个职位，而是一套基础设施</h3>
        <p>试试提供 SOP、系统工具、行业项目协同、培训资料、运营中台、加密简历库和后续 AI 匹配能力，帮助非传统猎头也能按标准流程进入项目。</p>
      </section>
      <div class="grid-2">
        ${["招聘渠道", "行业合伙人", "with_hr系统", "新人培训", "项目辅导", "运营中台"].map((x) => `<span class="pill">${x}</span>`).join("")}
      </div>

      <section class="card">
        <h3>平台护城河</h3>
        <p>试试的核心不是某一个客户或某一个顾问，而是品牌、用户生态和数字资产。通过标准化 SOP、加密简历库、AI 匹配和项目协同，让个人经验可以被放大，让资源可以被安全流转。</p>
      </section>

      <section class="card">
        <h3>为什么适合 35+ HR 和资深从业者</h3>
        <p>很多 HR 和招聘从业者有 10 到 15 年经验，却在传统组织里被年龄、成本和层级限制。试试希望提供一套创业基础设施，让这批人不必重新开公司，也能用经验、客户、候选人和行业理解获得收入。</p>
      </section>

      <section class="card">
        <h3>加入流程</h3>
        <div class="steps">
          ${["发展人邀请", "观看录播初步了解", "报名分享会", "参加正式解析会", "阅读资料包", "运营合伙人面试", "腾讯签协议", "知了背调", "加入企业微信", "进入with_hr自助入职"].map((s, i) => step(i + 1, s, "")).join("")}
        </div>
      </section>

      <div class="notice">重要提示：录播只用于先了解和预热；正式推进仍需参加解析会或被人工确认完成等效沟通，不面试不能进入协议、背调和入职。</div>

      <section class="card">
        <h3>常见问题</h3>
        ${faq("全职和兼职有什么区别？", "全职/兼职都可按项目角色参与，一期先以合作人身份和项目分工推进。")}
        ${faq("有底薪、社保或 KPI 吗？", "根据资料口径，合伙人没有底薪和社保，也不是传统雇佣 KPI 模式，收益与项目角色、回款和财务复核相关。")}
        ${faq("没有客户资源，只做交付可以吗？", "可以。只做交付时重点参与候选人推荐和过程协同，基础比例按交付角色理解。")}
        ${faq("加入需要费用吗？", "页面不承诺具体费用政策，正式以协议和运营合伙人说明为准。")}
        ${faq("背调会联系现在单位吗？", "背调环节以知了背调工具和授权流程为准，具体范围会在正式推进前说明。")}
      </section>
    </div>
    ${bottom([{ text: "报名分享会", attrs: 'data-go="signup"' }, { text: "提交入伙意向", attrs: 'data-go="intent"' }])}
  `);
}

function splitRow(label, value) {
  return `<div class="split-row"><span>${label}</span><b>${value}</b></div>`;
}

function step(num, title, text) {
  return `<div class="step"><span class="step-num">${num}</span><div><strong>${title}</strong>${text ? `<p>${text}</p>` : ""}</div></div>`;
}

function faq(q, a) {
  return `<div class="faq-item"><button class="faq-button" data-action="faq">${q}<span>+</span></button><div class="faq-answer">${a}</div></div>`;
}

function renderSignup() {
  const p = routeParams();
  const watched = hasWatchedVideo();
  shell(`
    ${header("报名分享会", "留下基础信息，发展人会邀请你参加最近一场合伙人解析会。", "invite")}
    <form class="content form" data-form="signup">
      <section class="card">
        <h3>${watched ? "已看过录播介绍" : "还没看录播？"}</h3>
        <p>${watched ? "你已完成初步了解，仍建议参加正式解析会听答疑和真实案例。" : "如果暂时没到分享会时间，可以先看 3 分钟录播，了解基础机制后再报名。"}</p>
        <button type="button" class="btn small" data-go="video" style="margin-top:12px">${watched ? "重新查看视频" : "先看视频"}</button>
      </section>
      <section class="card">
        <h3>本周分享会</h3>
        <p><b>周三 20:00｜线上腾讯会议</b></p>
        <p>报名后由发展人发送会议链接；正式推进仍以参会或人工确认沟通为准。</p>
      </section>
      ${field("姓名", "name", "请输入真实姓名", "text", true)}
      ${field("手机号", "phone", "用于接收分享会提醒", "tel", true)}
      ${field("微信号", "wechat", "便于发展人联系", "text", true)}
      ${selectField("当前身份", "identity", ["HR", "猎头顾问", "项目经理", "行业专家", "客户BD", "兼职合伙人"])}
      ${selectField("意向角色", "role", ["交付顾问", "BD+交付", "PM", "运营合伙人"])}
      ${field("行业方向", "industry", "如：智能制造/互联网/金融/大健康", "text", true)}
      <input type="hidden" name="developerId" value="${p.developerId}" />
      <input type="hidden" name="channel" value="${p.channel}" />
      <input type="hidden" name="shareId" value="${p.shareId}" />
      <div class="notice good">我同意试试咨询基于本次合伙人招募联系我，并记录邀请来源。</div>
    </form>
    ${bottom([{ text: "返回介绍页", attrs: 'data-go="invite"' }, { text: "提交报名", attrs: 'data-submit="signup"' }])}
  `);
}

function renderIntent() {
  const latest = getLeads()[0];
  shell(`
    ${header("提交入伙意向", "有明确加入意向时填写，系统会生成候选合伙人线索卡片。", "invite")}
    <form class="content form" data-form="intent">
      ${field("姓名", "name", "请输入真实姓名", "text", true, latest?.name || "")}
      ${field("手机号", "phone", "请输入手机号", "tel", true, latest?.phone || "")}
      ${field("微信号", "wechat", "请输入微信号", "text", true, latest?.wechat || "")}
      ${selectField("当前身份", "identity", ["HR", "猎头顾问", "项目经理", "行业专家", "客户BD", "兼职合伙人"], latest?.identity)}
      ${selectField("意向角色", "role", ["交付顾问", "BD+交付", "PM", "运营合伙人"], latest?.role)}
      ${field("行业方向", "industry", "如：互联网/游戏", "text", true, latest?.industry || "")}
      ${selectField("资源情况", "resource", ["有候选人资源", "有客户资源", "有团队资源", "有行业经验", "只想兼职"])}
      ${selectField("可投入时间", "time", ["每周 5 小时", "每周 10 小时", "每周 20 小时+", "接近全职"])}
      ${textareaField("过往经历", "experience", "简单描述招聘、猎头、项目或行业资源经历")}
      ${field("简历/名片附件", "attachment", "Demo 中填写文件名即可", "text", false)}
      <div class="notice">提交意向不等于入职。需参加解析会并通过运营合伙人面试后，才能进入协议、背调、企微和 with_hr 入职。</div>
    </form>
    ${bottom([{ text: "保存草稿", attrs: 'data-action="draft"' }, { text: "提交意向", attrs: 'data-submit="intent"' }])}
  `);
}

function field(label, name, placeholder, type = "text", required = false, value = "") {
  return `
    <label class="field">
      <span>${label}</span>
      <input name="${name}" type="${type}" placeholder="${placeholder}" value="${value}" ${required ? "required" : ""} />
    </label>
  `;
}

function textareaField(label, name, placeholder) {
  return `
    <label class="field">
      <span>${label}</span>
      <textarea name="${name}" placeholder="${placeholder}"></textarea>
    </label>
  `;
}

function selectField(label, name, options, selected = "") {
  return `
    <label class="field">
      <span>${label}</span>
      <select name="${name}">
        ${options.map((x) => `<option ${x === selected ? "selected" : ""}>${x}</option>`).join("")}
      </select>
    </label>
  `;
}

function renderCalc() {
  shell(`
    ${header("合伙人收益测算", "基于角色分工做参考测算，结果不承诺出单周期或固定收入。", "invite")}
    <form class="content form" data-form="calc">
      ${selectField("你准备做什么角色", "calcRole", ["只做交付", "BD+交付", "PM 管理"])}
      ${selectField("你每月可推荐候选人", "candidates", ["1-3 人", "4-8 人", "9 人以上"])}
      ${selectField("你是否有客户资源", "clients", ["暂无客户", "有潜在客户", "可直接引荐"])}
      ${selectField("可投入时间", "time", ["碎片兼职", "每周 10 小时", "接近全职"])}
      ${selectField("擅长行业", "industry", ["互联网/游戏", "智能制造", "金融科技", "大健康", "出海/跨境", "其他"])}
      <section class="card">
        <h3>测算口径</h3>
        <p>创始人强调，试试不是给人画固定收入，而是把项目收益规则讲透明。示例按单个项目收入 6.5 万、交付 65%、BD 10%、PM 5% 的角色比例展示。</p>
      </section>
      <div class="notice">资料里提到“多久出单不具有参考性”，所以本 demo 只给收益结构和行动建议，不承诺开单周期。</div>
    </form>
    ${bottom([{ text: "返回", attrs: 'data-go="invite"' }, { text: "查看测算结果", attrs: 'data-submit="calc"' }])}
  `);
}

function renderCalcResult() {
  const raw = sessionStorage.getItem("shishi_calc") || "{}";
  const calc = JSON.parse(raw);
  const income = calc.calcRole === "BD+交付" ? 48750 : calc.calcRole === "PM 管理" ? 3250 : 42250;
  const path = calc.calcRole === "BD+交付" ? "BD+交付双角色" : calc.calcRole === "PM 管理" ? "项目管理协同" : "交付顾问优先";
  shell(`
    ${header("测算结果", "这是参考结果，用来帮助你理解角色收益，不作为收入承诺。", "calc")}
    <div class="content">
      <section class="card">
        <h3>参考单项目收益</h3>
        <div class="result-number">约 ${(income / 10000).toFixed(1)} 万</div>
        <p>按 ${calc.calcRole || "只做交付"} × 示例项目收入 6.5 万估算。</p>
        <div class="notice" style="margin-top:12px">实际以客户合同、角色分工、回款和财务复核为准。</div>
      </section>
      <section class="card">
        <h3>你可能适合的路径</h3>
        <p><b>${path}</b></p>
        <p>建议先报名解析会，听完整平台规则、真实案例和角色边界，再判断是否提交入伙意向。</p>
      </section>
      <section class="card">
        <h3>为什么不能承诺多久开单</h3>
        <p>开单受到客户岗位、候选人匹配、面试周期、回款节点影响。当前页面只展示收入结构和行动建议，不承诺固定周期。</p>
      </section>
    </div>
    ${bottom([{ text: "重新测算", attrs: 'data-go="calc"' }, { text: "报名分享会", attrs: 'data-go="signup"' }])}
  `);
}

function renderVideo() {
  const watched = hasWatchedVideo();
  shell(`
    ${header("3 分钟合伙人机制介绍", "在正式分享会前，先用录播完成基础了解。", "invite")}
    <div class="content">
      <section class="card video-card">
        <div class="play-mark">▶</div>
        <h3>试试咨询合伙人机制录播</h3>
        <p>建议视频内容：万亿级招聘服务市场为什么长期分散低效、试试为什么像“人力资源领域的滴滴”、交付/BD/PM/发展人如何分工、分佣怎么理解、平台如何赋能、为什么还需要正式解析会和面试。</p>
        <div class="video-progress" style="margin-top:18px"><span style="width:${watched ? "100" : "34"}%"></span></div>
        <p style="margin-top:10px">${watched ? "已完成观看" : "Demo 中点击下方按钮模拟看完视频"}</p>
      </section>
      <section class="card">
        <h3>这段视频要传达什么</h3>
        ${infoRow("平台定位", "去中心化招聘交易平台")}
        ${infoRow("加入机会", "用经验和资源参与真实项目")}
        ${infoRow("收益逻辑", "按贡献分钱")}
        ${infoRow("平台支持", "SOP、系统、数据资产、运营中台")}
      </section>
      <section class="card">
        <h3>创始人想解决的问题</h3>
        <p>很多有经验的 HR、猎头和行业专家，到了 35 岁以后不一定适合继续被传统公司体系筛选。试试希望给这些人一套能承接项目、协同交付、沉淀数据资产、按结果获得收益的平台基础设施。</p>
      </section>
      <section class="card">
        <h3>看完后可以做什么</h3>
        ${infoRow("报名分享会", "可继续")}
        ${infoRow("提交入伙意向", "可继续")}
        ${infoRow("查看基础资料包", "可预览")}
        ${infoRow("推进协议/背调/入职", "仍需正式解析会和面试")}
      </section>
      <div class="notice">录播不能替代正式解析会。解析会的答疑、业务判断和信任建立仍然是入职前的重要门槛。</div>
    </div>
    ${bottom([{ text: "返回介绍页", attrs: 'data-go="invite"' }, { text: watched ? "报名分享会" : "标记已看完", attrs: watched ? 'data-go="signup"' : 'data-action="watch-video"' }])}
  `);
}

function renderSubmitted() {
  const id = new URLSearchParams(location.hash.split("?")[1] || "").get("id");
  const lead = id ? leadById(id) : getLeads()[0];
  const watched = hasWatchedVideo();
  shell(`
    ${header("提交成功", "你的合伙人意向已记录，发展人和运营合伙人会继续推进。", "invite")}
    <div class="content">
      <section class="card" style="text-align:center;padding:28px 16px">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--green);margin:0 auto 18px"></div>
        <h3>已生成候选合伙人线索</h3>
        <p>线索已归属到邀请你的发展人 ${lead.developerId}</p>
      </section>
      <section class="card">
        <h3>接下来会发生什么</h3>
        <div class="steps">
          ${step(1, "发展人确认你的报名与参会情况", "")}
          ${step(2, watched ? "已看录播，可先复习基础资料" : "先看录播完成基础了解", "")}
          ${step(3, "参加正式解析会后解锁完整资料包", "")}
          ${step(4, "运营合伙人安排面试", "")}
          ${step(5, "通过后进入协议、背调、企微和 with_hr 入职", "")}
        </div>
      </section>
      <div class="notice">请保存发展人微信，准时参加分享会。录播只做预热，未参加解析会或未被人工确认等效沟通、不面试，不能继续推进。</div>
    </div>
    ${bottom([{ text: watched ? "查看资料包" : "先看录播", attrs: watched ? `data-go="docs?id=${lead.id}"` : 'data-go="video"' }, { text: "联系发展人", attrs: 'data-action="contact"' }])}
  `);
}

function renderDocs() {
  const id = new URLSearchParams(location.hash.split("?")[1] || "").get("id");
  const lead = id ? leadById(id) : getLeads()[0];
  const watched = hasWatchedVideo();
  const fullUnlocked = hasLogOrStatus(lead, "已参加分享会");
  const previewUnlocked = watched || fullUnlocked;
  shell(`
    ${header("合伙人资料包", "录播后可预览基础资料；参加解析会后由发展人或 HR 人工确认解锁完整资料。", `lead-detail?id=${lead.id}`)}
    <div class="content">
      <div class="notice ${fullUnlocked ? "good" : ""}">
        当前状态：${fullUnlocked ? "完整资料包已解锁" : watched ? "已看录播，可预览基础资料；完整资料待参会确认" : "未看录播/未确认参会，资料包暂未解锁"}
      </div>
      <section class="card">
        <h3>平台模式说明</h3>
        <p>试试把企业客户、客户关系、项目管理、交付顾问和候选人资源连接在一起，用系统、SOP、法税、背调和数据资产降低协作成本，让不同角色按贡献参与项目收益。</p>
      </section>
      <section class="card">
        <h3>创始人寄语</h3>
        <p>我们希望让有经验的 HR、猎头和行业专家，换一种方式靠专业和结果做事。不是简单找一份工作，而是在一个更透明、更协作的平台上，把经验、资源和时间转化成长期能力。</p>
      </section>
      ${docCard("企业产品介绍", "客户服务、交付优势、合作场景", previewUnlocked, fullUnlocked ? "查看" : "预览")}
      ${docCard("运营中台服务说明", "渠道、项目辅导、系统工具、SOP 与培训", previewUnlocked, fullUnlocked ? "查看" : "预览")}
      ${docCard("数据资产与简历库说明", "加密简历库、简历归属、跨项目匹配与后续 AI 能力", previewUnlocked, fullUnlocked ? "查看" : "预览")}
      ${docCard("合伙人协议说明", "签署流程、角色边界、分佣与注意事项", fullUnlocked, "查看")}
      ${docCard("发展人常见问题 Q&A", "全职/兼职、社保、费用、背调、支持方式", previewUnlocked, fullUnlocked ? "查看" : "预览")}
      <section class="card">
        <h3>阅读后下一步</h3>
        <p>录播和基础资料能帮候选人先判断兴趣；正式推进仍需要参加解析会或由发展人/HR 人工确认完成等效沟通。</p>
      </section>
    </div>
    ${bottom([{ text: "返回详情", attrs: `data-go="lead-detail?id=${lead.id}"` }, { text: "提交入伙意向", attrs: 'data-go="intent"' }])}
  `);
}

function docCard(title, desc, unlocked, cta = "查看") {
  return `
    <section class="card">
      <h3>${title}</h3>
      <p>${desc}</p>
      <button class="btn small" style="margin-top:12px" ${unlocked ? 'data-action="doc"' : "disabled"}>${unlocked ? cta : "待解锁"}</button>
    </section>
  `;
}

function renderDashboard() {
  const leads = getLeads();
  const rewards = rewardLeads();
  const settled = rewards.filter((x) => x.rewardStatus === "已结算").reduce((sum, x) => sum + x.rewardAmount, 0);
  const pending = rewards.filter((x) => ["待结算", "待入职后结算"].includes(x.rewardStatus)).reduce((sum, x) => sum + x.rewardAmount, 0);
  const stat = (matcher) => leads.filter(matcher).length;
  const link = `${location.origin}${location.pathname}#invite?developerId=${DEFAULT_DEV}&channel=朋友圈&shareId=demo-${Date.now()}`;
  shell(`
    ${header("发展人工具台", "管理邀请链接、候选合伙人进展和发展奖励。")}
    <div class="dashboard-stats">
      <div class="stat"><strong>${leads.length}</strong><span>累计邀请</span></div>
      <div class="stat"><strong>${stat((x) => ["已查看H5", "已报名分享会"].includes(x.status))}</strong><span>待跟进</span></div>
      <div class="stat"><strong>${stat((x) => x.status === "已报名分享会")}</strong><span>已报名</span></div>
      <div class="stat"><strong>${stat((x) => ["已分配面试官", "面试通过"].includes(x.status))}</strong><span>面试中</span></div>
      <div class="stat"><strong>${stat((x) => ["已入企业微信", "已进入with_hr入职", "已入职/开始做单"].includes(x.status))}</strong><span>已加入</span></div>
    </div>
    <div class="content">
      <section class="card">
        <h3>专属邀请链接</h3>
        <div class="link-box">${link}</div>
        <div class="grid-2" style="margin-top:12px">
          <button class="btn" data-action="copy-link" data-link="${link}">复制链接</button>
          <button class="btn" data-action="poster">生成海报</button>
        </div>
      </section>
      <section class="card">
        <h3>发展奖励</h3>
        <div class="grid-2" style="margin-top:12px">
          <div class="stat"><strong>¥${pending}</strong><span>待结算</span></div>
          <div class="stat"><strong>¥${settled}</strong><span>已结算</span></div>
        </div>
        <p style="margin-top:12px">创始人提到平台要形成“10%价值链”：有人带来客户，有人带来合伙人，都应该被记录和激励。候选人完成入职后，系统生成发展奖励。</p>
        <button class="btn small" data-go="rewards" style="margin-top:12px">查看奖励明细</button>
      </section>
      <section class="card">
        <h3>分享渠道</h3>
        <div class="grid-2">
          ${["微信私聊", "朋友圈", "小红书", "解析会邀约"].map((x) => `<span class="pill">${x}</span>`).join("")}
        </div>
      </section>
      <section class="card">
        <h3>最近邀请记录</h3>
        <div class="steps">
          ${leads.slice(0, 4).map((lead) => leadMini(lead)).join("")}
        </div>
      </section>
    </div>
    ${bottom([{ text: "邀请新合伙人", attrs: 'data-go="invite"' }, { text: "查看全部线索", attrs: 'data-go="leads"' }])}
  `);
}

function leadMini(lead) {
  return `
    <button class="card lead-card" data-go="lead-detail?id=${lead.id}" style="text-align:left">
      <div class="lead-top">
        <strong>${shortName(lead.name)}</strong>
        <span class="badge ${badgeClass(lead.status)}">${lead.status}</span>
      </div>
      <p>${lead.channel} · ${lead.createdAt}</p>
    </button>
  `;
}

function renderLeads() {
  const leads = getLeads();
  const filter = new URLSearchParams(location.hash.split("?")[1] || "").get("filter") || "全部";
  const filtered = filter === "全部" ? leads : leads.filter((lead) => mapFilter(lead.status) === filter);
  const tabs = ["全部", "待跟进", "已报名", "已参会", "面试中", "已加入", "不合适"];
  shell(`
    ${header("我的候选合伙人", "查看由你的邀请链接产生的候选合伙人线索。", "dashboard")}
    <div class="tabs">
      ${tabs.map((tab) => `<button class="tab ${tab === filter ? "active" : ""}" data-go="leads?filter=${tab}">${tab}</button>`).join("")}
    </div>
    <div class="content">
      ${filtered.map((lead) => `
        <button class="card lead-card" data-go="lead-detail?id=${lead.id}" style="text-align:left">
          <div class="lead-top">
            <div><strong>${shortName(lead.name)}</strong><p>${maskPhone(lead.phone)}</p></div>
            <span class="badge ${badgeClass(lead.status)}">${lead.status}</span>
          </div>
          ${infoRow("当前身份", lead.identity)}
          ${infoRow("意向角色", lead.role)}
          ${infoRow("来源", lead.channel)}
          ${infoRow("时间", lead.createdAt)}
          <p>备注：${lead.note || "暂无"}</p>
        </button>
      `).join("") || `<div class="card"><h3>暂无线索</h3><p>当前筛选条件下没有候选合伙人。</p></div>`}
    </div>
    ${bottom([{ text: "返回工具台", attrs: 'data-go="dashboard"' }, { text: "邀请新合伙人", attrs: 'data-go="invite"' }])}
  `);
}

function renderRewards() {
  const rewards = rewardLeads();
  const pendingPayable = rewards.filter((x) => x.rewardStatus === "待结算").reduce((sum, x) => sum + x.rewardAmount, 0);
  const inProgress = rewards.filter((x) => x.rewardStatus === "待入职后结算").reduce((sum, x) => sum + x.rewardAmount, 0);
  const settled = rewards.filter((x) => x.rewardStatus === "已结算").reduce((sum, x) => sum + x.rewardAmount, 0);
  shell(`
    ${header("发展奖励", "邀请候选人加入试试并完成入职后，发展人可在小程序查看奖励与结算进度。", "dashboard")}
    <div class="content">
      <section class="card hero-card">
        <h3>可结算奖励</h3>
        <div class="result-number">¥${pendingPayable}</div>
        <p>Demo 口径：候选人达到“已入职/开始做单”后生成待结算奖励。真实规则可按公司发展人激励政策配置。</p>
      </section>
      <div class="grid-3">
        <div class="stat"><strong>¥${inProgress}</strong><span>推进中</span></div>
        <div class="stat"><strong>¥${pendingPayable}</strong><span>待结算</span></div>
        <div class="stat"><strong>¥${settled}</strong><span>已结算</span></div>
      </div>
      <div class="notice">一期建议先做“奖励记录 + 状态展示 + 财务人工确认”。自动打款涉及实名、税务、风控和微信支付企业付款权限，可作为二期接口能力。</div>
      <section class="card">
        <h3>奖励规则示例</h3>
        ${infoRow("触发条件", "候选人已入职/开始做单")}
        ${infoRow("示例奖励", `¥${INVITE_REWARD_AMOUNT}/人`)}
        ${infoRow("结算方式", "财务复核后发放")}
        ${infoRow("到账方式", "微信零钱/银行卡/线下打款待定")}
      </section>
      <section class="card">
        <h3>为什么要做奖励可视化</h3>
        <p>发展人愿意持续分享的前提，是看得见自己带来的线索、入职结果和收益状态。把奖励透明化，能把一次性邀请变成持续裂变。</p>
      </section>
      <section class="card">
        <h3>奖励明细</h3>
        ${rewards.map((lead) => rewardRow(lead)).join("")}
      </section>
    </div>
    ${bottom([{ text: "返回工具台", attrs: 'data-go="dashboard"' }, { text: "申请结算", attrs: 'data-action="withdraw"' }])}
  `);
}

function rewardRow(lead) {
  const status = lead.rewardStatus;
  const badge = status === "待结算" ? "warn" : status === "已结算" ? "good" : "";
  return `
    <button class="card lead-card" data-go="lead-detail?id=${lead.id}" style="text-align:left;margin-top:10px">
      <div class="lead-top">
        <div><strong>${shortName(lead.name)}</strong><p>${lead.status}</p></div>
        <span class="badge ${badge}">${status}</span>
      </div>
      ${infoRow("发展奖励", `¥${lead.rewardAmount}`)}
      ${infoRow("来源渠道", lead.channel)}
    </button>
  `;
}

function mapFilter(status) {
  if (["已查看H5", "已邀请"].includes(status)) return "待跟进";
  if (status === "已报名分享会") return "已报名";
  if (["已参加分享会", "已发资料", "有意向面试"].includes(status)) return "已参会";
  if (["已分配面试官", "面试通过", "协议签署中", "背调中"].includes(status)) return "面试中";
  if (["已入企业微信", "已进入with_hr入职", "已入职/开始做单"].includes(status)) return "已加入";
  if (status === "放弃/不合适") return "不合适";
  return "待跟进";
}

function rewardStage(lead) {
  if (lead.rewardStatus && lead.rewardStatus !== "待入职后结算") return lead.rewardStatus;
  if (["已入职/开始做单"].includes(lead.status)) return "待结算";
  if (["已进入with_hr入职", "已入企业微信"].includes(lead.status)) return "待入职后结算";
  return "未达成";
}

function rewardLeads() {
  return getLeads().map((lead) => ({
    ...lead,
    rewardAmount: lead.rewardAmount || INVITE_REWARD_AMOUNT,
    rewardStatus: rewardStage(lead),
  }));
}

function infoRow(label, value) {
  return `<div class="info-row"><span>${label}</span><b>${value || "-"}</b></div>`;
}

function renderLeadDetail() {
  const id = new URLSearchParams(location.hash.split("?")[1] || "").get("id") || "lead-zhang";
  const lead = leadById(id);
  const currentIndex = Math.max(0, STATUS.indexOf(lead.status));
  shell(`
    ${header("候选合伙人详情", "人工确认关键节点，系统保留来源和操作记录。", "leads")}
    <div class="content">
      <section class="card">
        <h3>基础信息</h3>
        ${infoRow("姓名", lead.name)}
        ${infoRow("手机号", lead.phone)}
        ${infoRow("微信号", lead.wechat)}
        ${infoRow("当前身份", lead.identity)}
        ${infoRow("意向角色", lead.role)}
        ${infoRow("行业方向", lead.industry)}
        ${infoRow("来源渠道", lead.channel)}
        ${infoRow("邀请时间", lead.createdAt)}
        ${infoRow("发展人ID", lead.developerId)}
      </section>

      <section class="card">
        <h3>发展奖励</h3>
        ${infoRow("奖励状态", rewardStage(lead))}
        ${infoRow("示例金额", `¥${lead.rewardAmount || INVITE_REWARD_AMOUNT}`)}
        <p style="margin-top:10px">候选人完成入职后生成待结算奖励，最终发放以公司政策和财务复核为准。</p>
      </section>

      <section class="card">
        <h3>状态进度</h3>
        <div class="timeline">
          ${STATUS.filter((x) => x !== "放弃/不合适").map((status, index) => timelineItem(lead, status, index, currentIndex)).join("")}
        </div>
      </section>

      <div class="notice">未参加解析会，不能推进到面试通过、协议、背调和入职；未面试通过，不能推进到协议、背调、企微和入职。</div>

      <section class="card">
        <h3>跟进备注</h3>
        ${(lead.logs || []).map((log) => `<div class="stat-row"><span>${log[0]}<br>${log[2]}</span><b>${log[1]}</b></div>`).join("")}
      </section>
    </div>
    ${bottom([{ text: "联系", attrs: 'data-action="contact"' }, { text: "入职链接", attrs: `data-action="onboarding-link" data-id="${lead.id}"` }])}
  `);
}

function timelineItem(lead, status, index, currentIndex) {
  const done = index < currentIndex;
  const current = index === currentIndex;
  const canMark = index === currentIndex + 1 || (lead.status === "已查看H5" && status === "已报名分享会");
  const hint = NEED_MEETING.has(status)
    ? "需先参加解析会"
    : NEED_INTERVIEW.has(status)
      ? "需先面试通过"
      : "";
  return `
    <div class="timeline-item ${done ? "done" : ""} ${current ? "current" : ""}">
      <span class="timeline-dot"></span>
      <div class="timeline-body">
        <strong>${status}</strong>
        ${hint && !done ? `<small>${hint}</small>` : ""}
        ${canMark ? `<button class="btn small" style="margin-top:8px" data-action="mark-status" data-id="${lead.id}" data-status="${status}">标记此状态</button>` : ""}
      </div>
    </div>
  `;
}

function renderOnboarding() {
  const id = new URLSearchParams(location.hash.split("?")[1] || "").get("id") || "lead-zhang";
  const lead = leadById(id);
  shell(`
    ${header("进入 with_hr 自助入职", "面试通过并完成企微加入后，进入正式入职与做单系统。", `lead-detail?id=${lead.id}`)}
    <div class="content">
      <div class="notice good">当前可入职：已完成前置确认，可跳转 with_hr。</div>
      <section class="card">
        <h3>将带入 with_hr 的信息</h3>
        ${infoRow("发展人", lead.developerId)}
        ${infoRow("入职渠道", `H5裂变邀请 / ${lead.channel}`)}
        ${infoRow("合作人类型", "猎头合伙人")}
        ${infoRow("意向角色", lead.role)}
        ${infoRow("面试官", lead.interviewer || "待分配")}
        ${infoRow("行业方向", lead.industry)}
      </section>
      <section class="card">
        <h3>进入后继续完成</h3>
        <p>自助完善身份与合作信息、面试官/HR 终审确认、企业微信登录和系统权限开通、进入项目做单与分佣流程。</p>
      </section>
      <section class="card">
        <h3>边界说明</h3>
        <p>H5 只负责前置获客和状态推进，正式入职、做单、分佣继续由 with_hr 承接。</p>
      </section>
    </div>
    ${bottom([{ text: "返回详情", attrs: `data-go="lead-detail?id=${lead.id}"` }, { text: "进入with_hr", attrs: `data-action="enter-withhr" data-id="${lead.id}"` }])}
  `);
}

function bindCommon() {
  document.querySelectorAll("[data-anchor]").forEach((el) => {
    el.addEventListener("click", () => document.querySelector(el.dataset.anchor)?.scrollIntoView({ behavior: "smooth" }));
  });

  document.querySelectorAll("[data-go]").forEach((el) => {
    el.addEventListener("click", () => go(el.dataset.go));
  });

  document.querySelectorAll("[data-action='reset']").forEach((el) => {
    el.addEventListener("click", resetDemo);
  });

  document.querySelectorAll("[data-action='faq']").forEach((el) => {
    el.addEventListener("click", () => el.closest(".faq-item").classList.toggle("open"));
  });

  document.querySelectorAll("[data-submit]").forEach((el) => {
    el.addEventListener("click", () => submitForm(el.dataset.submit));
  });

  document.querySelectorAll("[data-action='draft']").forEach((el) => {
    el.addEventListener("click", () => showToast("草稿已保存"));
  });

  document.querySelectorAll("[data-action='contact']").forEach((el) => {
    el.addEventListener("click", () => showToast("Demo：这里会唤起微信/电话联系"));
  });

  document.querySelectorAll("[data-action='doc']").forEach((el) => {
    el.addEventListener("click", () => showToast("Demo：这里打开线上化资料详情"));
  });

  document.querySelectorAll("[data-action='watch-video']").forEach((el) => {
    el.addEventListener("click", () => {
      setWatchedVideo();
      showToast("已记录：完成录播观看");
      go("signup");
    });
  });

  document.querySelectorAll("[data-action='poster']").forEach((el) => {
    el.addEventListener("click", () => showToast("Demo：已生成分享海报"));
  });

  document.querySelectorAll("[data-action='withdraw']").forEach((el) => {
    el.addEventListener("click", () => showToast("Demo：已提交结算申请，等待财务复核"));
  });

  document.querySelectorAll("[data-action='copy-link']").forEach((el) => {
    el.addEventListener("click", async () => {
      await navigator.clipboard?.writeText(el.dataset.link || "");
      showToast("邀请链接已复制");
    });
  });

  document.querySelectorAll("[data-action='mark-status']").forEach((el) => {
    el.addEventListener("click", () => markStatus(el.dataset.id, el.dataset.status));
  });

  document.querySelectorAll("[data-action='onboarding-link']").forEach((el) => {
    el.addEventListener("click", () => openOnboardingModal(el.dataset.id));
  });

  document.querySelectorAll("[data-action='enter-withhr']").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      const lead = leadById(id);
      updateLead(id, { status: "已进入with_hr入职" }, "已进入with_hr入职", "系统");
      showToast(`Demo：跳转 /self-onboarding?developerId=${lead.developerId}`);
      setTimeout(() => go(`lead-detail?id=${id}`), 650);
    });
  });

  document.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.querySelectorAll("[data-modal-confirm]").forEach((el) => {
    el.addEventListener("click", () => {
      const { id, status } = el.dataset;
      updateLead(id, { status }, status, "发展人");
      closeModal();
      go(`lead-detail?id=${id}`);
      showToast(`已标记：${status}`);
    });
  });
}

function submitForm(type) {
  const form = document.querySelector(`[data-form="${type}"]`);
  if (!form) return;
  if (!form.reportValidity()) return;
  const data = Object.fromEntries(new FormData(form).entries());

  if (type === "calc") {
    sessionStorage.setItem("shishi_calc", JSON.stringify(data));
    go("calc-result");
    return;
  }

  const p = routeParams();
  const lead = {
    id: uid(),
    name: data.name,
    phone: data.phone,
    wechat: data.wechat,
    identity: data.identity,
    role: data.role,
    industry: data.industry,
    channel: data.channel || p.channel,
    developerId: data.developerId || p.developerId,
    shareId: data.shareId || p.shareId,
    status: type === "signup" ? "已报名分享会" : "有意向面试",
    rewardStatus: "待入职后结算",
    rewardAmount: INVITE_REWARD_AMOUNT,
    note: type === "intent" ? `${data.resource || ""}；${data.time || ""}` : "报名分享会",
    createdAt: nowText(),
    interviewer: "",
    logs: [
      [nowText(), type === "signup" ? "已报名分享会" : "提交入伙意向", "候选人提交"],
      ...(hasWatchedVideo() ? [[nowText(), "已观看录播", "系统"]] : []),
      [nowText(), "已邀请", data.developerId || p.developerId],
    ],
  };
  const leads = [lead, ...getLeads()];
  saveLeads(leads);
  go(`submitted?id=${lead.id}`);
}

function markStatus(id, status) {
  const lead = leadById(id);
  const hasMeeting = hasLogOrStatus(lead, "已参加分享会");
  const hasInterview = hasLogOrStatus(lead, "面试通过");

  if (NEED_MEETING.has(status) && !hasMeeting) {
    openModal("暂不能推进到面试通过", "当前候选人还未标记“已参加分享会”。录播只用于初步了解，根据一期规则，未参加解析会或未被人工确认等效沟通，不能推进到面试通过、协议、背调和入职。", [
      { text: "知道了", attrs: "data-modal-close" },
      { text: "先标记参会", attrs: `data-modal-confirm data-id="${id}" data-status="已参加分享会"` },
    ]);
    return;
  }

  if (NEED_INTERVIEW.has(status) && !hasInterview) {
    openModal("暂不能推进到后续状态", "当前候选人还未标记“面试通过”。未面试通过，不能推进到协议、背调、企微和入职。", [
      { text: "知道了", attrs: "data-modal-close" },
      { text: "标记面试通过", attrs: `data-modal-confirm data-id="${id}" data-status="面试通过"` },
    ]);
    return;
  }

  openModal(`确认标记“${status}”？`, "确认后会更新候选人状态，并在跟进备注中留下操作记录。", [
    { text: "取消", attrs: "data-modal-close" },
    { text: "确认标记", attrs: `data-modal-confirm data-id="${id}" data-status="${status}"` },
  ]);
}

function openOnboardingModal(id) {
  const lead = leadById(id);
  const canOnboard = STATUS.indexOf(lead.status) >= STATUS.indexOf("已入企业微信");
  if (!canOnboard) {
    openModal("暂不能生成入职链接", "候选人还未进入“已入企业微信”状态。一期规则下，需要面试通过并完成企微加入后再引导进入 with_hr。", [
      { text: "知道了", attrs: "data-modal-close" },
      { text: "标记已入企微", attrs: `data-modal-confirm data-id="${id}" data-status="已入企业微信"` },
    ]);
    return;
  }
  openModal("生成入职链接", `将为候选人生成 with_hr 自助入职入口，并带入发展人 ${lead.developerId}、渠道 ${lead.channel}、意向角色 ${lead.role}。`, [
    { text: "取消", attrs: "data-modal-close" },
    { text: "查看引导页", attrs: `data-go="onboarding?id=${id}" data-modal-close` },
  ]);
}

function openModal(title, body, actions) {
  modal = `
    <div class="modal-mask">
      <div class="modal">
        <h3>${title}</h3>
        <p>${body}</p>
        <div class="modal-actions">
          ${actions.map((a, i) => `<button class="btn ${i === 1 ? "primary" : ""}" ${a.attrs}>${a.text}</button>`).join("")}
        </div>
      </div>
    </div>
  `;
  route();
}

function closeModal() {
  modal = null;
  route();
}

function showToast(text) {
  clearTimeout(toastTimer);
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = text;
  document.body.appendChild(el);
  toastTimer = setTimeout(() => el.remove(), 1800);
}

function route() {
  const page = pageName();
  if (page === "home") return entryShell();
  if (page === "site") return renderSiteHome();
  if (page === "site-client") return renderSiteClient();
  if (page === "site-partner") return renderSitePartner();
  if (page === "site-candidate") return renderSiteCandidate();
  if (page === "site-developer") return renderSiteDeveloper();
  if (page === "invite") return renderInvite();
  if (page === "overview") return renderOverview();
  if (page === "signup") return renderSignup();
  if (page === "intent") return renderIntent();
  if (page === "calc") return renderCalc();
  if (page === "calc-result") return renderCalcResult();
  if (page === "video") return renderVideo();
  if (page === "submitted") return renderSubmitted();
  if (page === "docs") return renderDocs();
  if (page === "dashboard") return renderDashboard();
  if (page === "leads") return renderLeads();
  if (page === "rewards") return renderRewards();
  if (page === "lead-detail") return renderLeadDetail();
  if (page === "onboarding") return renderOnboarding();
  return entryShell();
}

window.addEventListener("hashchange", () => {
  modal = null;
  route();
});

route();
