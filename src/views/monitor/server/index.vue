<template>
  <div class="engine-room">
    <!-- Decorative corner flourishes -->
    <div class="flourish tl"></div>
    <div class="flourish tr"></div>
    <div class="flourish bl"></div>
    <div class="flourish br"></div>

    <!-- Header -->
    <header class="eng-header">
      <div class="header-left">
        <div class="server-badge" v-if="server.sys">
          <span class="badge-hostname">{{ server.sys.computerName }}</span>
          <span class="badge-ip">{{ server.sys.computerIp }}</span>
        </div>
        <h1 class="eng-title">Engine Room</h1>
      </div>
      <div class="header-right">
        <div class="live-dot"></div>
        <span class="live-text">LIVE</span>
        <span class="header-sep">|</span>
        <span class="os-label" v-if="server.sys">{{ server.sys.osName }}</span>
      </div>
    </header>

    <!-- Gauge Row: CPU + Memory + JVM -->
    <section class="gauge-row">
      <!-- CPU Pressure Gauge -->
      <div class="gauge-card" v-if="server.cpu" style="--i: 0">
        <div class="gauge-head">
          <span class="gauge-icon">⚙</span>
          <span class="gauge-label">CPU PRESSURE</span>
        </div>
        <div class="gauge-body">
          <div class="dial-container">
            <svg viewBox="0 0 240 200" class="dial-svg">
              <!-- Track arc: 220° to -40° (260° visible, 100° gap at bottom) -->
              <!-- pathLength="260" + rotation makes 260° visible -->
              <circle cx="120" cy="120" r="80" fill="none"
                stroke="var(--bg-card-alt)" stroke-width="18"
                pathLength="360" stroke-dasharray="260 100"
                transform="rotate(140 120 120)" />
              <!-- CPU Value arc -->
              <circle cx="120" cy="120" r="80" fill="none"
                :stroke="cpuColor" stroke-width="18"
                pathLength="360" stroke-dasharray="260 100"
                :stroke-dashoffset="260 - (cpuUsedPct / 100 * 260)"
                stroke-linecap="round"
                transform="rotate(140 120 120)"
                class="value-arc" />
              <!-- Decorative tick marks -->
              <g v-for="t in ticks" :key="t.id"
                :transform="`rotate(${t.angle}, 120, 120)`">
                <line x1="120" y1="32" x2="120" y2="38"
                  :stroke="t.major ? 'var(--brass)' : 'var(--brass-dim)'"
                  :stroke-width="t.major ? 1.5 : 0.8"
                  :opacity="t.major ? 0.5 : 0.25" />
              </g>
              <!-- Center hub -->
              <circle cx="120" cy="120" r="14" fill="var(--bg-deep)"
                stroke="var(--brass)" stroke-width="2" />
              <circle cx="120" cy="120" r="4" fill="var(--brass)" />
              <!-- Needle -->
              <line x1="120" y1="120" x2="120" y2="52"
                stroke="var(--brass)" stroke-width="2.5"
                stroke-linecap="round"
                :transform="`rotate(${needleAngle}, 120, 120)`"
                class="needle" />
            </svg>
            <div class="dial-value">
              <span class="dial-num">{{ cpuUsedPct.toFixed(1) }}</span>
              <span class="dial-unit">%</span>
            </div>
          </div>
          <div class="gauge-stats">
            <div class="stat-item">
              <span class="stat-dot" style="background: var(--sage)"></span>
              <span class="stat-label">CORES</span>
              <span class="stat-val">{{ server.cpu.cpuNum }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-dot" style="background: var(--gold)"></span>
              <span class="stat-label">USER</span>
              <span class="stat-val">{{ server.cpu.used }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-dot" style="background: var(--rust)"></span>
              <span class="stat-label">SYS</span>
              <span class="stat-val">{{ server.cpu.sys }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-dot" style="background: var(--green-ok)"></span>
              <span class="stat-label">FREE</span>
              <span class="stat-val">{{ server.cpu.free }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Memory Steam Cylinder -->
      <div class="gauge-card" v-if="server.mem" style="--i: 1">
        <div class="gauge-head">
          <span class="gauge-icon">⏢</span>
          <span class="gauge-label">MEMORY CYLINDER</span>
        </div>
        <div class="gauge-body">
          <!-- Total bar -->
          <div class="cylinder-section">
            <div class="cylinder-label">
              <span>PHYSICAL</span>
              <span class="cylinder-val">{{ server.mem.used }}G / {{ server.mem.total }}G</span>
            </div>
            <div class="cylinder-track">
              <div class="cylinder-fill mem-fill" :style="{ width: memPct + '%' }"></div>
            </div>
            <div class="cylinder-markers">
              <span>0</span>
              <span>{{ server.mem.total }}G</span>
            </div>
          </div>

          <!-- JVM bar -->
          <div class="cylinder-section" v-if="server.jvm">
            <div class="cylinder-label">
              <span>JVM HEAP</span>
              <span class="cylinder-val">{{ server.jvm.used }}M / {{ server.jvm.total }}M</span>
            </div>
            <div class="cylinder-track">
              <div class="cylinder-fill jvm-fill" :style="{ width: jvmPct + '%' }"></div>
            </div>
            <div class="cylinder-markers">
              <span>0</span>
              <span>{{ server.jvm.total }}M</span>
            </div>
          </div>

          <!-- Usage ring -->
          <div class="cylinder-summary">
            <div class="summary-ring-wrap">
              <svg viewBox="0 0 80 80" class="summary-ring">
                <circle cx="40" cy="40" r="32" fill="none"
                  stroke="var(--bg-card-alt)" stroke-width="6" />
                <circle cx="40" cy="40" r="32" fill="none"
                  :stroke="memColor" stroke-width="6"
                  stroke-dasharray="201"
                  :stroke-dashoffset="201 * (1 - memPct / 100)"
                  stroke-linecap="round"
                  transform="rotate(-90 40 40)"
                  class="value-arc" />
              </svg>
              <div class="summary-ring-text">
                <span class="summary-pct">{{ memPct.toFixed(0) }}%</span>
                <span class="summary-sub">USAGE</span>
              </div>
            </div>
            <div class="summary-detail">
              <div class="summary-row">
                <span class="summary-key">TOTAL</span>
                <span class="summary-val">{{ server.mem.total }} GB</span>
              </div>
              <div class="summary-row">
                <span class="summary-key">USED</span>
                <span class="summary-val">{{ server.mem.used }} GB</span>
              </div>
              <div class="summary-row">
                <span class="summary-key">FREE</span>
                <span class="summary-val">{{ server.mem.free }} GB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- JVM Specimen Card -->
      <div class="gauge-card jvm-card" v-if="server.jvm" style="--i: 2">
        <div class="gauge-head">
          <span class="gauge-icon">☕</span>
          <span class="gauge-label">JVM SPECIMEN</span>
        </div>
        <div class="gauge-body">
          <div class="jvm-ring-wrap">
            <svg viewBox="0 0 120 120" class="jvm-ring">
              <circle cx="60" cy="60" r="50" fill="none"
                stroke="var(--bg-card-alt)" stroke-width="10" />
              <circle cx="60" cy="60" r="50" fill="none"
                :stroke="jvmColor" stroke-width="10"
                stroke-dasharray="314.16"
                :stroke-dashoffset="314.16 * (1 - jvmPct / 100)"
                stroke-linecap="round"
                transform="rotate(-90 60 60)"
                class="value-arc" />
              <text x="60" y="54" text-anchor="middle"
                fill="var(--cream)" font-size="22" font-weight="700"
                font-family="'JetBrains Mono', monospace">{{ jvmPct.toFixed(0) }}%</text>
              <text x="60" y="72" text-anchor="middle"
                fill="var(--cream-mid)" font-size="9"
                font-family="'DM Sans', sans-serif"
                letter-spacing="2">USAGE</text>
            </svg>
          </div>
          <div class="jvm-specimens">
            <div class="specimen-line">
              <span class="spec-key">Version</span>
              <span class="spec-val mono">{{ server.jvm.version }}</span>
            </div>
            <div class="specimen-line">
              <span class="spec-key">Name</span>
              <span class="spec-val small">{{ server.jvm.name }}</span>
            </div>
            <div class="specimen-line">
              <span class="spec-key">Started</span>
              <span class="spec-val small">{{ server.jvm.startTime }}</span>
            </div>
            <div class="specimen-line">
              <span class="spec-key">Runtime</span>
              <span class="spec-val">{{ server.jvm.runTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- System Registry — Museum Specimen Labels -->
    <section class="registry-section" v-if="server.sys">
      <div class="registry-head">
        <span class="registry-icon">◈</span>
        <h2 class="registry-title">System Registry</h2>
        <span class="registry-sub">Hardware &amp; Environment</span>
      </div>
      <div class="registry-grid">
        <div class="registry-item" style="--j: 0">
          <span class="reg-label">Computer Name</span>
          <span class="reg-value mono">{{ server.sys.computerName }}</span>
        </div>
        <div class="registry-item" style="--j: 1">
          <span class="reg-label">OS Name</span>
          <span class="reg-value">{{ server.sys.osName }}</span>
        </div>
        <div class="registry-item" style="--j: 2">
          <span class="reg-label">OS Architecture</span>
          <span class="reg-value mono">{{ server.sys.osArch }}</span>
        </div>
        <div class="registry-item" style="--j: 3">
          <span class="reg-label">IP Address</span>
          <span class="reg-value mono">{{ server.sys.computerIp }}</span>
        </div>
        <div class="registry-item" style="--j: 4" v-if="server.jvm">
          <span class="reg-label">Java Name</span>
          <span class="reg-value small">{{ server.jvm.name }}</span>
        </div>
        <div class="registry-item" style="--j: 5" v-if="server.jvm">
          <span class="reg-label">Java Version</span>
          <span class="reg-value mono">{{ server.jvm.version }}</span>
        </div>
        <div class="registry-item" style="--j: 6" v-if="server.jvm">
          <span class="reg-label">Installed At</span>
          <span class="reg-value small">{{ server.jvm.home }}</span>
        </div>
        <div class="registry-item" style="--j: 7" v-if="server.sys">
          <span class="reg-label">Project Path</span>
          <span class="reg-value small">{{ server.sys.userDir }}</span>
        </div>
        <div class="registry-item full-width" style="--j: 8" v-if="server.jvm">
          <span class="reg-label">Runtime Arguments</span>
          <span class="reg-value small mono">{{ server.jvm.inputArgs }}</span>
        </div>
      </div>
    </section>

    <!-- Disk Ledger -->
    <section class="ledger-section" v-if="server.sysFiles && server.sysFiles.length">
      <div class="ledger-head">
        <span class="ledger-icon">≡</span>
        <h2 class="ledger-title">Disk Volume Ledger</h2>
        <span class="ledger-sub">{{ server.sysFiles.length }} volumes</span>
      </div>
      <div class="ledger-table-wrap">
        <table class="ledger-table">
          <thead>
            <tr>
              <th><span>Volume</span></th>
              <th><span>Filesystem</span></th>
              <th><span>Type</span></th>
              <th><span>Total</span></th>
              <th><span>Used</span></th>
              <th><span>Free</span></th>
              <th><span>Usage</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(disk, i) in server.sysFiles" :key="i"
              :style="{ '--k': i }" class="ledger-row">
              <td class="vol-name">
                <span class="vol-icon">💿</span>
                <span>{{ disk.dirName }}</span>
              </td>
              <td class="mono">{{ disk.sysTypeName }}</td>
              <td>{{ disk.typeName }}</td>
              <td class="mono">{{ disk.total }}</td>
              <td class="mono">{{ disk.used }}</td>
              <td class="mono">{{ disk.free }}</td>
              <td class="usage-cell">
                <div class="usage-bar-track">
                  <div class="usage-bar-fill" :style="{
                    width: disk.usage + '%',
                    background: disk.usage > 80
                      ? 'linear-gradient(90deg, var(--rust), var(--red-err))'
                      : disk.usage > 60
                        ? 'linear-gradient(90deg, var(--gold), var(--brass))'
                        : 'linear-gradient(90deg, var(--green-ok), var(--sage))'
                  }"></div>
                </div>
                <span class="usage-pct" :class="{ 'high': disk.usage > 80 }">{{ disk.usage }}%</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Loading / Error State -->
    <div v-if="!server.cpu && !server.mem" class="loading-state">
      <div class="loading-gauge">
        <svg viewBox="0 0 120 120" class="loading-svg">
          <circle cx="60" cy="60" r="48" fill="none"
            stroke="var(--brass-light)" stroke-width="6"
            stroke-dasharray="301" stroke-dashoffset="0"
            class="loading-spin" />
        </svg>
      </div>
      <span class="loading-text">INITIALISING INSTRUMENTS…</span>
    </div>
  </div>
</template>

<script setup name="Server">
import { getServer } from '@/api/monitor/server'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const server = ref({})
const { proxy } = getCurrentInstance()

// Computed percentages
const cpuUsedPct = computed(() => {
  if (!server.value.cpu) return 0
  return parseFloat((server.value.cpu.used + server.value.cpu.sys).toFixed(1))
})

const memPct = computed(() => {
  if (!server.value.mem) return 0
  return parseFloat(server.value.mem.usage) || 0
})

const jvmPct = computed(() => {
  if (!server.value.jvm) return 0
  return parseFloat(server.value.jvm.usage) || 0
})

// Color thresholds
const cpuColor = computed(() => {
  const v = cpuUsedPct.value
  if (v > 80) return 'var(--red-err)'
  if (v > 60) return 'var(--gold)'
  return 'var(--green-ok)'
})

const memColor = computed(() => {
  const v = memPct.value
  if (v > 80) return 'var(--red-err)'
  if (v > 60) return 'var(--gold)'
  return 'var(--green-ok)'
})

const jvmColor = computed(() => {
  const v = jvmPct.value
  if (v > 80) return 'var(--red-err)'
  if (v > 60) return 'var(--gold)'
  return 'var(--green-ok)'
})

// SVG gauge needle angle: map 0-100% to -110° to +110° range (within the 260° arc)
const needleAngle = computed(() => {
  const pct = Math.min(100, Math.max(0, cpuUsedPct.value))
  return -110 + (pct / 100) * 220
})

// Tick marks for dial
const ticks = computed(() => {
  const result = []
  // 260° arc starting at 140° rotation, so visible from 140° to 400° (≡40°)
  for (let i = 0; i <= 10; i++) {
    const angle = 140 + (i / 10) * 260
    result.push({
      id: i,
      angle: angle,
      major: i % 2 === 0
    })
  }
  return result
})

// Whether user prefers reduced motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

function getList() {
  proxy.$modal.loading('正在加载服务监控数据…')
  getServer().then(response => {
    proxy.$modal.closeLoading()
    server.value = response.data
  }).catch(() => {
    proxy.$modal.closeLoading()
    proxy.$modal.msgError('服务监控加载失败，请检查服务状态')
  })
}

getList()
</script>

<style scoped>
/* ============================================================
   STEAMPUNK ENGINE ROOM — Design Tokens
   Inspired by Victorian conservatory aesthetic, evolved toward
   industrial brass-and-mahogany instrument panels.
   ============================================================ */
.engine-room {
  --bg-deep: #111c15;
  --bg-card: #17231b;
  --bg-card-alt: #1c2a22;

  --brass: #c8956c;
  --brass-light: rgba(200, 149, 108, 0.15);
  --brass-dim: rgba(200, 149, 108, 0.35);
  --brass-glow: rgba(200, 149, 108, 0.25);
  --gold: #d4a857;
  --sage: #8fb89a;
  --sage-dim: #4a6b52;
  --cream: #e8dfd0;
  --cream-mid: #b8ae98;
  --cream-dim: #8a7e6a;
  --green-ok: #6b9e82;
  --rust: #b86b4a;
  --red-err: #c47a6c;

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

/* Background floral pattern */
.engine-room::before {
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
  background: var(--brass);
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
.eng-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(200, 149, 108, 0.12);
  position: relative;
  z-index: 1;
}

.header-left {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.server-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 14px;
  border: 1px solid var(--brass-light);
  background: rgba(200, 149, 108, 0.04);
}

.badge-hostname {
  font-family: var(--font-mono);
  font-size: 16px;
  color: var(--brass);
  font-weight: 600;
  line-height: 1;
}

.badge-ip {
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--cream-dim);
}

.eng-title {
  font-family: var(--font-display);
  font-size: 26px;
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
  gap: 10px;
  font-size: 11px;
  color: var(--cream-mid);
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

.header-sep {
  opacity: 0.3;
}

.os-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.05em;
  color: var(--cream-dim);
}

/* ============================================================
   GAUGE CARDS
   ============================================================ */
.gauge-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.gauge-card {
  background: var(--bg-card);
  border: 1px solid rgba(200, 149, 108, 0.08);
  animation: fadeUp 0.4s ease both;
  animation-delay: calc(var(--i, 0) * 0.06s);
  transition: border-color 0.3s, background 0.3s;
  display: flex;
  flex-direction: column;
}

.gauge-card:hover {
  border-color: rgba(200, 149, 108, 0.2);
  background: var(--bg-card-alt);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.gauge-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(200, 149, 108, 0.06);
}

.gauge-icon {
  font-size: 14px;
  opacity: 0.6;
}

.gauge-label {
  font-size: 11px;
  letter-spacing: 0.15em;
  color: var(--cream-mid);
  font-weight: 600;
}

.gauge-body {
  padding: 16px 18px 18px;
  flex: 1;
}

/* ============================================================
   CPU DIAL GAUGE
   ============================================================ */
.dial-container {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 14px;
}

.dial-svg {
  width: 100%;
  max-width: 220px;
  height: 190px;
}

.value-arc {
  transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.needle {
  transform-origin: 120px 120px;
  transition: transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dial-value {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.dial-num {
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 700;
  color: var(--cream);
  line-height: 1;
}

.dial-unit {
  font-size: 13px;
  color: var(--cream-mid);
  font-weight: 600;
}

.gauge-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(200, 149, 108, 0.06);
}

.stat-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-label {
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--cream-dim);
  font-weight: 600;
  flex: 1;
}

.stat-val {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--cream);
  font-weight: 600;
}

/* ============================================================
   MEMORY CYLINDER
   ============================================================ */
.cylinder-section {
  margin-bottom: 18px;
}

.cylinder-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--cream-mid);
}

.cylinder-val {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--cream);
  font-weight: 600;
}

.cylinder-track {
  height: 20px;
  background: var(--bg-card-alt);
  border: 1px solid rgba(200, 149, 108, 0.1);
  position: relative;
  overflow: hidden;
}

.cylinder-fill {
  height: 100%;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.cylinder-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.06) 30%,
    transparent 60%
  );
}

.mem-fill {
  background: linear-gradient(90deg, var(--green-ok), var(--gold), var(--rust));
}

.jvm-fill {
  background: linear-gradient(90deg, var(--sage), var(--gold));
}

.cylinder-markers {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: var(--cream-dim);
  margin-top: 4px;
  font-family: var(--font-mono);
}

.cylinder-summary {
  display: flex;
  gap: 16px;
  align-items: center;
  padding-top: 4px;
  border-top: 1px solid rgba(200, 149, 108, 0.06);
}

.summary-ring-wrap {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.summary-ring {
  width: 100%;
  height: 100%;
}

.summary-ring-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.summary-pct {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
  color: var(--cream);
  line-height: 1.1;
}

.summary-sub {
  font-size: 7px;
  letter-spacing: 0.15em;
  color: var(--cream-dim);
}

.summary-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 0;
  border-bottom: 1px solid rgba(200, 149, 108, 0.04);
}

.summary-key {
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--cream-dim);
}

.summary-val {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--cream);
}

/* ============================================================
   JVM SPECIMEN CARD
   ============================================================ */
.jvm-card .gauge-body {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.jvm-ring-wrap {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.jvm-ring {
  width: 100%;
  height: 100%;
}

.jvm-specimens {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.specimen-line {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(200, 149, 108, 0.04);
}

.spec-key {
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--cream-dim);
  text-transform: uppercase;
}

.spec-val {
  font-size: 12px;
  color: var(--cream);
  font-weight: 500;
}

.spec-val.mono {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
}

.spec-val.small {
  font-size: 11px;
  word-break: break-all;
  line-height: 1.4;
}

/* ============================================================
   SYSTEM REGISTRY
   ============================================================ */
.registry-section {
  background: var(--bg-card);
  border: 1px solid rgba(200, 149, 108, 0.08);
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  animation: fadeUp 0.4s ease 0.2s both;
}

.registry-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(200, 149, 108, 0.06);
}

.registry-icon {
  font-size: 14px;
  color: var(--brass);
  opacity: 0.6;
}

.registry-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  font-style: italic;
  margin: 0;
  color: var(--cream);
}

.registry-sub {
  margin-left: auto;
  font-size: 11px;
  color: var(--cream-mid);
  letter-spacing: 0.05em;
}

.registry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.registry-item {
  padding: 12px 20px;
  border-bottom: 1px solid rgba(200, 149, 108, 0.04);
  border-right: 1px solid rgba(200, 149, 108, 0.04);
  display: flex;
  flex-direction: column;
  gap: 3px;
  animation: fadeUp 0.3s ease both;
  animation-delay: calc(0.25s + var(--j, 0) * 0.03s);
}

.registry-item:nth-child(even) {
  border-right: none;
}

.registry-item.full-width {
  grid-column: 1 / -1;
  border-right: none;
}

.reg-label {
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cream-mid);
  font-weight: 600;
}

.reg-value {
  font-size: 14px;
  color: var(--cream);
  font-weight: 500;
}

.reg-value.mono {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 400;
}

.reg-value.small {
  font-size: 12px;
  word-break: break-all;
  line-height: 1.4;
}

/* ============================================================
   DISK LEDGER
   ============================================================ */
.ledger-section {
  background: var(--bg-card);
  border: 1px solid rgba(200, 149, 108, 0.08);
  position: relative;
  z-index: 1;
  animation: fadeUp 0.4s ease 0.3s both;
}

.ledger-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(200, 149, 108, 0.06);
}

.ledger-icon {
  font-size: 16px;
  color: var(--brass);
  opacity: 0.6;
}

.ledger-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  font-style: italic;
  margin: 0;
  color: var(--cream);
}

.ledger-sub {
  margin-left: auto;
  font-size: 11px;
  color: var(--cream-mid);
  letter-spacing: 0.05em;
}

.ledger-table-wrap {
  overflow-x: auto;
}

.ledger-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.ledger-table thead th {
  text-align: left;
  padding: 10px 16px;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--cream-dim);
  font-weight: 600;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(200, 149, 108, 0.06);
  background: rgba(255, 255, 255, 0.01);
}

.ledger-table thead th span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ledger-row {
  animation: fadeUp 0.3s ease both;
  animation-delay: calc(0.4s + var(--k, 0) * 0.04s);
  transition: background 0.2s;
}

.ledger-row:hover {
  background: rgba(200, 149, 108, 0.04);
}

.ledger-row td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(200, 149, 108, 0.04);
  color: var(--cream);
}

.ledger-row td.mono {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--cream-mid);
}

.vol-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.vol-icon {
  font-size: 14px;
  opacity: 0.6;
}

.usage-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 150px;
}

.usage-bar-track {
  flex: 1;
  height: 10px;
  background: var(--bg-card-alt);
  border: 1px solid rgba(200, 149, 108, 0.08);
  overflow: hidden;
}

.usage-bar-fill {
  height: 100%;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.usage-pct {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--cream-mid);
  min-width: 40px;
  text-align: right;
}

.usage-pct.high {
  color: var(--red-err);
}

/* ============================================================
   LOADING STATE
   ============================================================ */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.loading-gauge {
  width: 80px;
  height: 80px;
}

.loading-svg {
  width: 100%;
  height: 100%;
}

.loading-spin {
  animation: gaugeSpin 1.2s linear infinite;
  transform-origin: 60px 60px;
}

@keyframes gaugeSpin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 12px;
  letter-spacing: 0.2em;
  color: var(--cream-dim);
  font-weight: 600;
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 1200px) {
  .gauge-row {
    grid-template-columns: 1fr 1fr;
  }
  .jvm-card {
    grid-column: 1 / -1;
  }
  .jvm-card .gauge-body {
    flex-direction: row;
  }
}

@media (max-width: 900px) {
  .gauge-row {
    grid-template-columns: 1fr;
  }
  .jvm-card {
    grid-column: auto;
  }
  .registry-grid {
    grid-template-columns: 1fr;
  }
  .registry-item:nth-child(even) {
    border-right: 1px solid rgba(200, 149, 108, 0.04);
  }
  .registry-item.full-width {
    border-right: 1px solid rgba(200, 149, 108, 0.04);
  }
}

@media (max-width: 768px) {
  .engine-room {
    padding: 16px;
  }
  .eng-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .jvm-card .gauge-body {
    flex-direction: column;
    align-items: center;
  }
  .ledger-table-wrap {
    font-size: 12px;
  }
  .ledger-row td {
    padding: 10px 12px;
  }
}

@media (max-width: 600px) {
  .gauge-body {
    padding: 12px;
  }
  .cylinder-summary {
    flex-direction: column;
    align-items: center;
  }
  .usage-cell {
    min-width: 110px;
  }
}

/* ============================================================
   KEYBOARD FOCUS
   ============================================================ */
.gauge-card:focus-visible,
.registry-section:focus-visible,
.ledger-section:focus-visible {
  outline: 2px solid var(--brass);
  outline-offset: 2px;
}

/* ============================================================
   REDUCED MOTION
   ============================================================ */
@media (prefers-reduced-motion: reduce) {
  .gauge-card,
  .registry-item,
  .ledger-row,
  .registry-section,
  .ledger-section {
    animation: none !important;
    opacity: 1 !important;
  }

  .value-arc {
    transition: none !important;
  }

  .needle {
    transition: none !important;
  }

  .cylinder-fill {
    transition: none !important;
  }

  .usage-bar-fill {
    transition: none !important;
  }

  .loading-spin {
    animation: none !important;
  }

  .live-dot {
    animation: none !important;
  }
}
</style>
