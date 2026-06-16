<template>
  <div class="wms-observatory">
    <!-- Decorative corner flourishes -->
    <div class="flourish tl"></div>
    <div class="flourish tr"></div>
    <div class="flourish bl"></div>
    <div class="flourish br"></div>

    <!-- Hero band -->
    <section class="hero-band" style="--i: 0">
      <div class="hero-content">
        <span class="hero-eyebrow">WAREHOUSE CONTROL</span>
        <h1 class="hero-title">星辉仓储运营台</h1>
        <p class="hero-copy">聚合入库、出库、库存、波次和设备状态，让当日作业节奏一屏可见。</p>
      </div>
      <div class="hero-badge">
        <div class="live-dot"></div>
        <div class="badge-body">
          <span class="badge-label">CURRENT SHIFT</span>
          <span class="badge-value">早班 A 组</span>
          <span class="badge-date">{{ todayText }}</span>
        </div>
      </div>
    </section>

    <!-- Metric specimen grid -->
    <section class="specimen-grid">
      <article v-for="(metric, i) in metrics" :key="metric.label"
        class="specimen-card" :class="'tone-' + metric.tone" :style="{ '--j': i + 1 }">
        <div class="specimen-icon-wrap">
          <svg-icon :icon-class="metric.icon" class="specimen-icon" />
        </div>
        <div class="specimen-body">
          <span class="specimen-label">{{ metric.label }}</span>
          <strong class="specimen-value">{{ metric.value }}</strong>
          <span class="specimen-delta">{{ metric.delta }}</span>
        </div>
      </article>
    </section>

    <!-- Workspace: entries + tasks -->
    <section class="workspace-grid">
      <!-- Operations ledger -->
      <div class="ledger-card" style="--k: 5">
        <div class="ledger-head">
          <div class="ledger-head-left">
            <span class="ledger-icon">◈</span>
            <div>
              <span class="ledger-eyebrow">OPERATIONS</span>
              <h2 class="ledger-title">业务入口</h2>
            </div>
          </div>
          <span class="ledger-note">按现场作业顺序排列</span>
        </div>

        <div class="entry-grid">
          <button v-for="entry in entries" :key="entry.title" class="entry-btn" type="button">
            <span class="entry-icon-box">
              <svg-icon :icon-class="entry.icon" />
            </span>
            <strong class="entry-name">{{ entry.title }}</strong>
            <span class="entry-desc">{{ entry.desc }}</span>
            <em class="entry-status">{{ entry.status }}</em>
          </button>
        </div>
      </div>

      <!-- Task flow -->
      <div class="ledger-card" style="--k: 6">
        <div class="ledger-head">
          <div class="ledger-head-left">
            <span class="ledger-icon">≡</span>
            <div>
              <span class="ledger-eyebrow">TASK FLOW</span>
              <h2 class="ledger-title">今日任务流</h2>
            </div>
          </div>
          <div class="ledger-live">
            <span class="live-pulse"></span>
            <span>LIVE</span>
          </div>
        </div>

        <div class="task-list">
          <article v-for="(task, ti) in tasks" :key="task.name"
            class="task-item" :style="{ '--l': ti }">
            <span class="task-rank">{{ task.rank }}</span>
            <div class="task-body">
              <strong class="task-name">{{ task.name }}</strong>
              <span class="task-meta">{{ task.owner }} · {{ task.area }}</span>
            </div>
            <span class="task-count">{{ task.count }}</span>
          </article>
        </div>
      </div>
    </section>

    <!-- Bottom: timeline + health + alerts -->
    <section class="bottom-grid">
      <!-- Work rhythm timeline -->
      <div class="ledger-card" style="--k: 7">
        <div class="ledger-head">
          <div class="ledger-head-left">
            <span class="ledger-icon">◉</span>
            <div>
              <span class="ledger-eyebrow">RHYTHM</span>
              <h2 class="ledger-title">作业节奏</h2>
            </div>
          </div>
        </div>

        <ol class="timeline">
          <li v-for="(step, si) in timeline" :key="step.time"
            :style="{ '--m': si }">
            <time class="tl-time">{{ step.time }}</time>
            <span class="tl-dot"></span>
            <div class="tl-body">
              <strong class="tl-title">{{ step.title }}</strong>
              <p class="tl-desc">{{ step.desc }}</p>
            </div>
          </li>
        </ol>
      </div>

      <!-- Health gauges -->
      <div class="ledger-card" style="--k: 8">
        <div class="ledger-head">
          <div class="ledger-head-left">
            <span class="ledger-icon">⏢</span>
            <div>
              <span class="ledger-eyebrow">HEALTH</span>
              <h2 class="ledger-title">库存与设备</h2>
            </div>
          </div>
        </div>

        <div class="health-list">
          <div v-for="(item, hi) in health" :key="item.label"
            class="health-item" :style="{ '--n': hi }">
            <div class="health-row">
              <span class="health-label">{{ item.label }}</span>
              <strong class="health-value">{{ item.value }}</strong>
            </div>
            <div class="health-track">
              <i class="health-fill" :style="{ width: item.percent + '%' }"
                :class="{
                  'fill-ok': item.percent >= 80,
                  'fill-warn': item.percent >= 60 && item.percent < 80,
                  'fill-alert': item.percent < 60
                }"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div class="ledger-card" style="--k: 9">
        <div class="ledger-head">
          <div class="ledger-head-left">
            <span class="ledger-icon">▲</span>
            <div>
              <span class="ledger-eyebrow">ALERTS</span>
              <h2 class="ledger-title">异常与通知</h2>
            </div>
          </div>
        </div>

        <div class="alert-list">
          <article v-for="(notice, ni) in notices" :key="notice.title"
            class="alert-item" :class="'level-' + notice.level"
            :style="{ '--p': ni }">
            <span class="alert-badge">{{ notice.levelText }}</span>
            <div class="alert-body">
              <strong class="alert-name">{{ notice.title }}</strong>
              <p class="alert-desc">{{ notice.desc }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts" name="Index">
interface MetricItem {
  label: string
  value: string
  delta: string
  icon: string
  tone: string
}

interface EntryItem {
  title: string
  desc: string
  status: string
  icon: string
}

interface TaskItem {
  rank: string
  name: string
  owner: string
  area: string
  count: string
}

interface TimelineItem {
  time: string
  title: string
  desc: string
}

interface HealthItem {
  label: string
  value: string
  percent: number
}

interface NoticeItem {
  level: string
  levelText: string
  title: string
  desc: string
}

const todayText = computed(() => new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short'
}))

const metrics = ref<MetricItem[]>([
  { label: '今日入库', value: '1,286', delta: '+12.8% 较昨日', icon: 'enter', tone: 'amber' },
  { label: '今日出库', value: '1,048', delta: '96.4% 准时率', icon: 'shopping', tone: 'sage' },
  { label: '库存预警', value: '23', delta: '7 项高优先级', icon: 'bell', tone: 'danger' },
  { label: '设备在线', value: '98.7%', delta: '42 台 AGV / PDA', icon: 'online', tone: 'ok' }
])

const entries = ref<EntryItem[]>([
  { title: '入库管理', desc: '到货、质检、上架', status: '待上架 48', icon: 'enter' },
  { title: '出库管理', desc: '拣货、复核、打包', status: '待复核 31', icon: 'shopping' },
  { title: '库存管理', desc: '盘点、移库、冻结', status: '预警 23', icon: 'chart' },
  { title: '波次调度', desc: '订单聚合与分派', status: '运行 6', icon: 'nested' },
  { title: '发运交接', desc: '装车、交接、签收', status: '待装车 12', icon: 'guide' },
  { title: 'IoT 设备', desc: 'AGV、PDA、传感器', status: '在线 98.7%', icon: 'monitor' }
])

const tasks = ref<TaskItem[]>([
  { rank: '01', name: '收货月台卸货确认', owner: '入库组', area: 'Dock A', count: '18 单' },
  { rank: '02', name: '高优先级订单拣货', owner: '出库组', area: 'Zone C', count: '42 单' },
  { rank: '03', name: '库存差异复核', owner: '库存组', area: 'Aisle 07', count: '9 项' },
  { rank: '04', name: 'AGV 低电量调度', owner: '设备组', area: 'Fleet 02', count: '3 台' }
])

const timeline = ref<TimelineItem[]>([
  { time: '08:30', title: '入库波峰', desc: '预计 3 个供应商到货，优先释放 Dock A/B。' },
  { time: '10:15', title: '第一轮波次', desc: '电商订单合并拣货，C 区小件优先。' },
  { time: '14:00', title: '库存复核', desc: '低库存 SKU 与冻结库位同步核查。' },
  { time: '17:20', title: '发运截单', desc: '干线车辆交接前完成复核和装车确认。' }
])

const health = ref<HealthItem[]>([
  { label: '可用库容', value: '72%', percent: 72 },
  { label: '拣货完成率', value: '86%', percent: 86 },
  { label: '设备在线率', value: '98%', percent: 98 },
  { label: '异常闭环率', value: '64%', percent: 64 }
])

const notices = ref<NoticeItem[]>([
  { level: 'high', levelText: '高', title: 'A-07-12 库位复核', desc: 'SKU 数量与系统库存差异 8 件。' },
  { level: 'medium', levelText: '中', title: 'PDA 12 离线', desc: '最后心跳 11 分钟前，建议设备组排查。' },
  { level: 'low', levelText: '低', title: '发运批次待确认', desc: '华东干线还有 2 个托盘未交接。' }
])
</script>

<style scoped>
/* ============================================================
   VICTORIAN CONSERVATORY — Dashboard
   Matching the cache monitoring page aesthetic.
   ============================================================ */
.wms-observatory {
  --bg-deep: #111c15;
  --bg-card: #17231b;
  --bg-card-alt: #1c2a22;

  --copper: #c8956c;
  --copper-light: rgba(200, 149, 108, 0.15);
  --copper-glow: rgba(200, 149, 108, 0.25);
  --gold: #d4a857;
  --sage: #8fb89a;
  --sage-dim: #4a6b52;
  --cream: #e8dfd0;
  --cream-mid: #b8ae98;
  --cream-dim: #8a7e6a;
  --green-ok: #6b9e82;
  --red-err: #c47a6c;

  --font-display: 'Libre Baskerville', 'Noto Serif SC', 'Georgia', serif;
  --font-body: 'DM Sans', 'Noto Sans SC', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  padding: 24px 28px;
  min-height: calc(100vh - 84px);
  background: var(--bg-deep);
  color: var(--cream);
  font-family: var(--font-body);
  position: relative;
  overflow: hidden;
}

/* Background botanical pattern */
.wms-observatory::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.02;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q35 15 30 25 Q25 15 30 5Z M25 20 Q30 30 35 20 M30 25 Q20 35 30 45 Q40 35 30 25Z' fill='none' stroke='%23c8956c' stroke-width='0.5'/%3E%3C/svg%3E");
  background-size: 60px 60px;
}

/* ============================================================
   CORNER FLOURISHES
   ============================================================ */
.flourish {
  position: absolute;
  width: 40px;
  height: 40px;
  pointer-events: none;
  z-index: 2;
}

.flourish::before,
.flourish::after {
  content: '';
  position: absolute;
  background: var(--copper);
  opacity: 0.25;
}

.flourish.tl { top: 8px; left: 8px; }
.flourish.tl::before { top: 0; left: 0; width: 20px; height: 1px; }
.flourish.tl::after  { top: 0; left: 0; width: 1px; height: 20px; }

.flourish.tr { top: 8px; right: 8px; }
.flourish.tr::before { top: 0; right: 0; width: 20px; height: 1px; }
.flourish.tr::after  { top: 0; right: 0; width: 1px; height: 20px; }

.flourish.bl { bottom: 8px; left: 8px; }
.flourish.bl::before { bottom: 0; left: 0; width: 20px; height: 1px; }
.flourish.bl::after  { bottom: 0; left: 0; width: 1px; height: 20px; }

.flourish.br { bottom: 8px; right: 8px; }
.flourish.br::before { bottom: 0; right: 0; width: 20px; height: 1px; }
.flourish.br::after  { bottom: 0; right: 0; width: 1px; height: 20px; }

/* ============================================================
   HERO BAND
   ============================================================ */
.hero-band {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 28px 30px;
  margin-bottom: 20px;
  border: 1px solid rgba(200, 149, 108, 0.08);
  background: var(--bg-card);
  position: relative;
  overflow: hidden;
  animation: fadeUp 0.4s ease both;
  animation-delay: calc(var(--i, 0) * 0.06s);
}

.hero-band::after {
  content: '';
  position: absolute;
  top: -80px;
  right: -40px;
  width: 300px;
  height: 300px;
  border: 1px dashed rgba(200, 149, 108, 0.12);
  border-radius: 50%;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-eyebrow {
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--copper);
  font-weight: 600;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(28px, 3vw, 38px);
  font-weight: 700;
  line-height: 1.15;
  margin: 6px 0 10px;
  color: var(--cream);
}

.hero-copy {
  max-width: 540px;
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: var(--cream-mid);
}

.hero-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border: 1px solid var(--copper-light);
  background: rgba(200, 149, 108, 0.04);
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green-ok);
  box-shadow: 0 0 8px rgba(107, 158, 130, 0.5);
  animation: livePulse 2.5s ease-in-out infinite;
}

@keyframes livePulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(107, 158, 130, 0.5); }
  50%      { opacity: 0.4; box-shadow: 0 0 3px rgba(107, 158, 130, 0.2); }
}

.badge-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.badge-label {
  font-size: 9px;
  letter-spacing: 0.15em;
  color: var(--cream-dim);
  font-weight: 600;
}

.badge-value {
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 600;
  color: var(--cream);
  line-height: 1;
}

.badge-date {
  font-size: 10px;
  color: var(--cream-dim);
}

/* ============================================================
   SPECIMEN GRID (Metrics)
   ============================================================ */
.specimen-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.specimen-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: var(--bg-card);
  border: 1px solid rgba(200, 149, 108, 0.08);
  animation: fadeUp 0.4s ease both;
  animation-delay: calc(0.08s + var(--j, 0) * 0.04s);
  transition: border-color 0.3s, background 0.3s;
}

.specimen-card:hover {
  border-color: rgba(200, 149, 108, 0.2);
  background: var(--bg-card-alt);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.specimen-icon-wrap {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--copper-light);
  flex-shrink: 0;
}

.specimen-icon {
  font-size: 18px;
}

.specimen-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.specimen-label {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cream-mid);
  font-weight: 600;
}

.specimen-value {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--cream);
  line-height: 1.1;
}

.specimen-delta {
  font-size: 11px;
  color: var(--cream-dim);
}

/* Tone variants */
.specimen-card.tone-amber .specimen-icon { color: var(--copper); }
.specimen-card.tone-sage .specimen-icon { color: var(--sage); }
.specimen-card.tone-danger .specimen-icon { color: var(--red-err); }
.specimen-card.tone-ok .specimen-icon { color: var(--green-ok); }

/* ============================================================
   WORKSPACE GRID
   ============================================================ */
.workspace-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 14px;
  margin-bottom: 18px;
}

.ledger-card {
  background: var(--bg-card);
  border: 1px solid rgba(200, 149, 108, 0.08);
  animation: fadeUp 0.4s ease both;
  animation-delay: calc(0.15s + var(--k, 0) * 0.04s);
  transition: border-color 0.3s, background 0.3s;
}

.ledger-card:hover {
  border-color: rgba(200, 149, 108, 0.18);
}

.ledger-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(200, 149, 108, 0.06);
}

.ledger-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ledger-icon {
  font-size: 14px;
  color: var(--copper);
  opacity: 0.6;
}

.ledger-eyebrow {
  display: block;
  font-size: 9px;
  letter-spacing: 0.15em;
  color: var(--cream-dim);
  font-weight: 600;
  margin-bottom: 2px;
}

.ledger-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  font-style: italic;
  margin: 0;
  color: var(--cream);
}

.ledger-note {
  font-size: 11px;
  color: var(--cream-dim);
  letter-spacing: 0.03em;
}

.ledger-live {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--green-ok);
  font-weight: 600;
}

.live-pulse {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--green-ok);
  box-shadow: 0 0 6px rgba(107, 158, 130, 0.5);
  animation: livePulse 2.5s ease-in-out infinite;
}

/* ============================================================
   ENTRY GRID (Business operations)
   ============================================================ */
.entry-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 14px 18px 18px;
}

.entry-btn {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  text-align: left;
  cursor: pointer;
  border: 1px solid rgba(200, 149, 108, 0.08);
  background: rgba(10, 14, 10, 0.35);
  color: inherit;
  font: inherit;
  transition: border-color 0.25s, background 0.25s, transform 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.entry-btn:hover,
.entry-btn:focus-visible {
  border-color: rgba(200, 149, 108, 0.28);
  background: rgba(200, 149, 108, 0.06);
  outline: none;
  transform: translateY(-1px);
}

.entry-icon-box {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  border: 1px solid var(--copper-light);
  color: var(--copper);
  font-size: 16px;
}

.entry-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--cream);
}

.entry-desc {
  font-size: 11px;
  color: var(--cream-mid);
}

.entry-status {
  margin-top: 6px;
  font-size: 11px;
  color: var(--copper);
  font-style: normal;
  font-weight: 600;
  letter-spacing: 0.05em;
}

/* ============================================================
   TASK LIST
   ============================================================ */
.task-list {
  padding: 10px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.task-item {
  display: grid;
  grid-template-columns: 30px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid rgba(200, 149, 108, 0.06);
  background: rgba(10, 14, 10, 0.25);
  animation: fadeUp 0.3s ease both;
  animation-delay: calc(0.2s + var(--l, 0) * 0.04s);
  transition: background 0.2s, border-color 0.2s;
}

.task-item:hover {
  background: rgba(200, 149, 108, 0.04);
  border-color: rgba(200, 149, 108, 0.12);
}

.task-rank {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--copper);
  font-weight: 600;
}

.task-body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.task-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--cream);
}

.task-meta {
  font-size: 11px;
  color: var(--cream-dim);
}

.task-count {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--cream-mid);
  white-space: nowrap;
}

/* ============================================================
   BOTTOM GRID
   ============================================================ */
.bottom-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.8fr 0.9fr;
  gap: 14px;
}

/* ============================================================
   TIMELINE
   ============================================================ */
.timeline {
  list-style: none;
  margin: 0;
  padding: 8px 18px 14px;
  display: flex;
  flex-direction: column;
}

.timeline li {
  display: grid;
  grid-template-columns: 50px 14px 1fr;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(200, 149, 108, 0.04);
  animation: fadeUp 0.3s ease both;
  animation-delay: calc(0.25s + var(--m, 0) * 0.04s);
}

.timeline li:last-child {
  border-bottom: none;
}

.tl-time {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--cream-mid);
  padding-top: 2px;
}

.tl-dot {
  position: relative;
  width: 8px;
  height: 8px;
  margin-top: 5px;
  border-radius: 50%;
  background: var(--copper);
  flex-shrink: 0;
}

.tl-dot::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 3.5px;
  width: 1px;
  height: 44px;
  background: rgba(200, 149, 108, 0.1);
}

.timeline li:last-child .tl-dot::after {
  display: none;
}

.tl-body {
  min-width: 0;
}

.tl-title {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--cream);
  margin-bottom: 2px;
}

.tl-desc {
  margin: 0;
  font-size: 11px;
  color: var(--cream-dim);
  line-height: 1.5;
}

/* ============================================================
   HEALTH
   ============================================================ */
.health-list {
  padding: 10px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.health-item {
  animation: fadeUp 0.3s ease both;
  animation-delay: calc(0.3s + var(--n, 0) * 0.04s);
}

.health-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-bottom: 6px;
}

.health-label {
  color: var(--cream-mid);
}

.health-value {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--cream);
}

.health-track {
  height: 6px;
  border-radius: 999px;
  background: rgba(200, 149, 108, 0.06);
  overflow: hidden;
}

.health-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.fill-ok   { background: linear-gradient(90deg, var(--green-ok), var(--sage)); }
.fill-warn { background: linear-gradient(90deg, var(--gold), var(--copper)); }
.fill-alert { background: linear-gradient(90deg, var(--red-err), #b86b4a); }

/* ============================================================
   ALERTS
   ============================================================ */
.alert-list {
  padding: 8px 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-item {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(200, 149, 108, 0.06);
  background: rgba(10, 14, 10, 0.25);
  animation: fadeUp 0.3s ease both;
  animation-delay: calc(0.35s + var(--p, 0) * 0.04s);
}

.alert-badge {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  color: var(--copper);
  background: rgba(200, 149, 108, 0.12);
}

.alert-item.level-high .alert-badge {
  background: rgba(196, 122, 108, 0.15);
  color: var(--red-err);
}

.alert-item.level-medium .alert-badge {
  background: rgba(200, 149, 108, 0.12);
  color: var(--copper);
}

.alert-item.level-low .alert-badge {
  background: rgba(143, 184, 154, 0.12);
  color: var(--sage);
}

.alert-body {
  min-width: 0;
}

.alert-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--cream);
  margin-bottom: 2px;
}

.alert-desc {
  margin: 0;
  font-size: 11px;
  color: var(--cream-dim);
  line-height: 1.5;
}

/* ============================================================
   KEYBOARD FOCUS
   ============================================================ */
.entry-btn:focus-visible,
.ledger-card:focus-visible {
  outline: 2px solid var(--copper);
  outline-offset: 2px;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 1200px) {
  .specimen-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .wms-observatory {
    padding: 14px 16px;
  }

  .hero-band {
    flex-direction: column;
    align-items: flex-start;
    padding: 20px;
  }

  .hero-badge {
    width: 100%;
  }

  .specimen-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .entry-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .specimen-value {
    font-size: 20px;
  }
}

@media (max-width: 600px) {
  .specimen-grid {
    grid-template-columns: 1fr;
  }

  .entry-grid {
    grid-template-columns: 1fr;
  }

  .ledger-head {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* ============================================================
   REDUCED MOTION
   ============================================================ */
@media (prefers-reduced-motion: reduce) {
  .hero-band,
  .specimen-card,
  .ledger-card,
  .task-item,
  .timeline li,
  .health-item,
  .alert-item {
    animation: none !important;
    opacity: 1 !important;
  }

  .live-dot,
  .live-pulse {
    animation: none !important;
  }

  .health-fill {
    transition: none !important;
  }

  .flourish::before,
  .flourish::after {
    transition: none !important;
  }
}
</style>
