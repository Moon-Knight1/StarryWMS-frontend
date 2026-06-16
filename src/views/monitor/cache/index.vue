<template>
  <div class="cache-observatory">
    <!-- Decorative corner flourishes -->
    <div class="flourish tl"></div>
    <div class="flourish tr"></div>
    <div class="flourish bl"></div>
    <div class="flourish br"></div>

    <!-- Header -->
    <header class="obs-header">
      <div class="header-left">
        <div class="redis-badge">
          <span class="badge-ver" v-if="cache.info">v{{ cache.info.redis_version }}</span>
          <span class="badge-mode" v-if="cache.info">{{ cache.info.redis_mode === 'standalone' ? 'STANDALONE' : 'CLUSTER' }}</span>
        </div>
        <h1 class="obs-title">Redis Observatory</h1>
      </div>
      <div class="header-right" v-if="cache.info">
        <div class="live-dot"></div>
        <span class="uptime-text">UPTIME {{ cache.info.uptime_in_days }} DAYS</span>
      </div>
    </header>

    <!-- Specimen Info Grid -->
    <section class="specimen-grid">
      <div class="specimen-card" style="--i: 0">
        <span class="specimen-label">PORT</span>
        <span class="specimen-value mono" v-if="cache.info">{{ cache.info.tcp_port }}</span>
      </div>
      <div class="specimen-card" style="--i: 1">
        <span class="specimen-label">CLIENTS</span>
        <span class="specimen-value" v-if="cache.info">{{ cache.info.connected_clients }}</span>
      </div>
      <div class="specimen-card" style="--i: 2">
        <span class="specimen-label">MEMORY</span>
        <span class="specimen-value" v-if="cache.info">{{ cache.info.used_memory_human }}</span>
      </div>
      <div class="specimen-card" style="--i: 3">
        <span class="specimen-label">CPU USAGE</span>
        <span class="specimen-value" v-if="cache.info">{{ parseFloat(cache.info.used_cpu_user_children).toFixed(2) }}%</span>
      </div>
      <div class="specimen-card" style="--i: 4">
        <span class="specimen-label">MAX MEMORY</span>
        <span class="specimen-value" v-if="cache.info">{{ cache.info.maxmemory_human }}</span>
      </div>
      <div class="specimen-card" style="--i: 5">
        <span class="specimen-label">AOF</span>
        <span class="specimen-value" v-if="cache.info" :class="cache.info.aof_enabled !== '0' ? 'val-ok' : 'val-off'">
          {{ cache.info.aof_enabled === '0' ? 'DISABLED' : 'ENABLED' }}
        </span>
      </div>
      <div class="specimen-card" style="--i: 6">
        <span class="specimen-label">RDB STATUS</span>
        <span class="specimen-value" v-if="cache.info" :class="cache.info.rdb_last_bgsave_status === 'ok' ? 'val-ok' : 'val-err'">
          {{ cache.info.rdb_last_bgsave_status?.toUpperCase() }}
        </span>
      </div>
      <div class="specimen-card" style="--i: 7">
        <span class="specimen-label">KEYS</span>
        <span class="specimen-value" v-if="cache.dbSize">{{ cache.dbSize }}</span>
      </div>
      <div class="specimen-card" style="--i: 8">
        <span class="specimen-label">NETWORK I/O</span>
        <span class="specimen-value mono" v-if="cache.info">{{ cache.info.instantaneous_input_kbps }}k / {{ cache.info.instantaneous_output_kbps }}k</span>
      </div>
    </section>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- Command Statistics -->
      <section class="chart-card" style="--i: 9">
        <div class="chart-header">
          <div class="chart-icon cmd-icon">
            <el-icon :size="14"><PieChart /></el-icon>
          </div>
          <h2 class="chart-title">Command Census</h2>
          <span class="chart-sub">Distribution by frequency</span>
        </div>
        <div class="chart-body">
          <div ref="commandstats" class="chart-canvas"></div>
        </div>
      </section>

      <!-- Memory Gauge -->
      <section class="chart-card" style="--i: 10">
        <div class="chart-header">
          <div class="chart-icon mem-icon">
            <el-icon :size="14"><Odometer /></el-icon>
          </div>
          <h2 class="chart-title">Memory Pressure</h2>
          <span class="chart-sub">Heap utilisation gauge</span>
        </div>
        <div class="chart-body">
          <div ref="usedmemory" class="chart-canvas"></div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup name="Cache">
import { getCache } from '@/api/monitor/cache'
import * as echarts from 'echarts'
import { PieChart, Odometer } from '@element-plus/icons-vue'
import { onBeforeUnmount } from 'vue'

const cache = ref([])
const commandstats = ref(null)
const usedmemory = ref(null)
const { proxy } = getCurrentInstance()

// Chart instances for cleanup
let commandstatsInstance = null
let usedmemoryInstance = null
let resizeHandler = null

// Custom color palette — copper & forest
const palette = [
  '#c8956c', '#8fb89a', '#d4a857', '#7ca8c4',
  '#c47a6c', '#6b9e82', '#b8a060', '#9b7cb4',
  '#a0b878', '#c89080', '#7098a8', '#b89858'
]

// Whether user prefers reduced motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function getList() {
  proxy.$modal.loading("正在加载缓存监控数据，请稍候！")
  getCache().then(response => {
    proxy.$modal.closeLoading()
    cache.value = response.data

    // Command Statistics — Nightingale Rose
    commandstatsInstance = echarts.init(commandstats.value, null, { renderer: 'canvas' })
    commandstatsInstance.setOption({
      color: palette,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(18, 28, 22, 0.92)',
        borderColor: 'rgba(200, 149, 108, 0.3)',
        textStyle: { color: '#e8dfd0', fontFamily: '"DM Sans", sans-serif', fontSize: 12 },
        formatter: '{b}: {c} ({d}%)'
      },
      series: [{
        name: 'Commands',
        type: 'pie',
        roseType: 'area',
        radius: ['12%', '88%'],
        center: ['50%', '52%'],
        itemStyle: {
          borderRadius: 4,
          borderColor: '#1a2a20',
          borderWidth: 2
        },
        label: {
          color: '#a09880',
          fontSize: 11,
          fontFamily: '"DM Sans", sans-serif'
        },
        labelLine: {
          lineStyle: { color: 'rgba(200, 149, 108, 0.3)' }
        },
        data: response.data.commandStats,
        animation: !prefersReduced,
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDuration: 1200
      }]
    })

    // Memory Gauge — Analog Instrument
    usedmemoryInstance = echarts.init(usedmemory.value, null, { renderer: 'canvas' })
    const memVal = parseFloat(cache.value.info.used_memory_human)
    usedmemoryInstance.setOption({
      series: [{
        name: 'Memory',
        type: 'gauge',
        min: 0,
        max: 1000,
        startAngle: 220,
        endAngle: -40,
        radius: '85%',
        center: ['50%', '58%'],
        axisLine: {
          lineStyle: {
            width: 18,
            color: [
              [0.5, '#6b9e82'],
              [0.8, '#d4a857'],
              [1, '#c47a6c']
            ]
          }
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '55%',
          width: 8,
          offsetCenter: [0, '-10%'],
          itemStyle: { color: '#c8956c' }
        },
        axisTick: {
          length: 6,
          lineStyle: { color: 'auto', width: 1 }
        },
        splitLine: {
          length: 12,
          lineStyle: { color: 'auto', width: 2 }
        },
        axisLabel: {
          color: '#8a7e6a',
          fontSize: 11,
          distance: 24,
          fontFamily: '"JetBrains Mono", monospace'
        },
        title: {
          offsetCenter: [0, '30%'],
          fontSize: 13,
          color: '#a09880',
          fontFamily: '"DM Sans", sans-serif'
        },
        detail: {
          fontSize: 28,
          offsetCenter: [0, '58%'],
          valueAnimation: !prefersReduced,
          color: '#e8dfd0',
          fontFamily: '"JetBrains Mono", monospace',
          formatter: function(value) {
            return cache.value.info.used_memory_human
          }
        },
        data: [{ value: memVal, name: 'MEMORY CONSUMED' }],
        animation: !prefersReduced,
        animationDuration: prefersReduced ? 0 : 1500,
        animationEasing: 'cubicOut'
      }]
    })

    resizeHandler = () => {
      commandstatsInstance?.resize()
      usedmemoryInstance?.resize()
    }
    window.addEventListener('resize', resizeHandler)
  }).catch(() => {
    proxy.$modal.closeLoading()
    proxy.$modal.msgError('缓存监控数据加载失败，请检查 Redis 连接状态')
  })
}

onBeforeUnmount(() => {
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
  }
  commandstatsInstance?.dispose()
  usedmemoryInstance?.dispose()
})

getList()
</script>

<style scoped>
/* ============================================================
   VICTORIAN CONSERVATORY — Design Tokens
   ============================================================ */
.cache-observatory {
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

  /* Star chart colours (shared with login.vue convention) */
  --轨道色: rgba(100, 140, 180, 0.12);
  --刻度色: rgba(160, 190, 220, 0.25);
  --星座色: rgba(200, 170, 110, 0.35);
  --星点色: rgba(200, 180, 140, 0.7);
  --高亮星色: #e8c87a;

  --font-display: 'Libre Baskerville', 'Noto Serif SC', 'Georgia', serif;
  --font-body: 'DM Sans', 'Noto Sans SC', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  padding: 28px 32px;
  min-height: calc(100vh - 84px);
  background: var(--bg-deep);
  color: var(--cream);
  font-family: var(--font-body);
  position: relative;
  overflow: hidden;
}

/* Background botanical pattern */
.cache-observatory::before {
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
   HEADER
   ============================================================ */
.obs-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(200, 149, 108, 0.12);
}

.header-left {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.redis-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  border: 1px solid var(--copper-light);
  background: rgba(200, 149, 108, 0.04);
}

.badge-ver {
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--copper);
  font-weight: 600;
  line-height: 1;
}

.badge-mode {
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--cream-dim);
}

.obs-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  font-style: italic;
  letter-spacing: 0.02em;
  color: var(--cream);
  margin: 0;
  line-height: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green-ok);
  box-shadow: 0 0 8px rgba(107, 158, 130, 0.5);
  animation: livePulse 2.5s ease-in-out infinite;
}

@keyframes livePulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(107, 158, 130, 0.5); }
  50%      { opacity: 0.4; box-shadow: 0 0 3px rgba(107, 158, 130, 0.2); }
}

.uptime-text {
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--cream-dim);
  font-family: var(--font-mono);
}

/* ============================================================
   SPECIMEN INFO GRID
   ============================================================ */
.specimen-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.specimen-card {
  background: var(--bg-card);
  border: 1px solid rgba(200, 149, 108, 0.08);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.3s, background 0.3s;
  animation: fadeUp 0.4s ease both;
  animation-delay: calc(var(--i, 0) * 0.04s);
}

.specimen-card:hover {
  border-color: rgba(200, 149, 108, 0.2);
  background: var(--bg-card-alt);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ============================================================
   REDUCED MOTION — Respect user accessibility preference
   ============================================================ */
@media (prefers-reduced-motion: reduce) {
  .specimen-card,
  .chart-card {
    animation: none !important;
    opacity: 1 !important;
  }

  .orbit-ring {
    animation: none !important;
  }

  .live-dot {
    animation: none !important;
  }

  .pulse-star {
    animation: none !important;
    filter: none !important;
  }

  .flourish::before,
  .flourish::after {
    transition: none !important;
  }
}

.specimen-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cream-mid);
  font-weight: 600;
}

.specimen-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--cream);
  font-family: var(--font-display);
}

.specimen-value.mono {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 400;
}

.val-ok  { color: var(--green-ok); }
.val-err { color: var(--red-err); }
.val-off { color: var(--cream-dim); }

/* ============================================================
   CHARTS ROW
   ============================================================ */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.chart-card {
  background: var(--bg-card);
  border: 1px solid rgba(200, 149, 108, 0.08);
  overflow: hidden;
  animation: fadeUp 0.4s ease both;
  animation-delay: calc(var(--i, 0) * 0.04s);
  transition: border-color 0.3s;
}

.chart-card:hover {
  border-color: rgba(200, 149, 108, 0.18);
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(200, 149, 108, 0.06);
}

.chart-icon {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 1px solid var(--copper-light);
  color: var(--copper);
  flex-shrink: 0;
}

.cmd-icon { color: var(--sage); border-color: rgba(143, 184, 154, 0.2); }
.mem-icon { color: var(--gold); border-color: rgba(212, 168, 87, 0.2); }

.chart-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  font-style: italic;
  margin: 0;
  color: var(--cream);
}

.chart-sub {
  margin-left: auto;
  font-size: 11px;
  color: var(--cream-mid);
  letter-spacing: 0.05em;
}

.chart-body {
  padding: 12px;
}

.chart-canvas {
  min-height: 260px;
  height: 380px;
  width: 100%;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
/* ============================================================
   KEYBOARD FOCUS — Visible focus ring for keyboard nav
   ============================================================ */
.specimen-card:focus-visible,
.chart-card:focus-visible {
  outline: 2px solid var(--copper);
  outline-offset: 2px;
}

@media (max-width: 1100px) {
  .specimen-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .charts-row {
    grid-template-columns: 1fr;
  }
}

/* Tablet portrait */
@media (max-width: 768px) {
  .specimen-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .cache-observatory {
    padding: 16px;
  }

  .specimen-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .obs-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .chart-canvas {
    height: 260px;
  }
}
</style>
