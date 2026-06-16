<template>
  <div class="victorian-page">
    <!-- Decorative corner flourishes -->
    <div class="flourish tl"></div>
    <div class="flourish tr"></div>
    <div class="flourish bl"></div>
    <div class="flourish br"></div>
    <div class="app-container druid-frame">
      <i-frame v-model:src="url"></i-frame>
    </div>
  </div>
</template>

<script setup lang="ts">
import iFrame from '@/components/iFrame/index.vue'

const url = ref<string>(import.meta.env.VITE_APP_BASE_API + '/druid/login.html')
</script>

<style scoped>
.druid-frame {
  padding: 0 !important;
  background: transparent !important;
  min-height: calc(100vh - 84px);
}

.druid-frame :deep(iframe) {
  border: 1px solid rgba(200, 149, 108, 0.08);
  border-radius: 0;
}

.victorian-page {
  position: relative;
  min-height: calc(100vh - 84px);
  background: var(--bg-deep, #111c15);
  font-family: 'DM Sans', 'Noto Sans SC', -apple-system, sans-serif;
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
  background: #c8956c;
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
</style>
