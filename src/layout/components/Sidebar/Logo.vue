<template>
  <div class="sidebar-logo-container" :class="{ collapse }">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <img :src="logo" class="sidebar-logo" alt="StarryWMS" />
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <img :src="logo" class="sidebar-logo" alt="StarryWMS" />
        <span class="brand-copy">
          <strong class="sidebar-title">{{ title }}</strong>
          <em class="sidebar-subtitle">Warehouse Control</em>
        </span>
      </router-link>
    </transition>
  </div>
</template>

<script setup lang="ts">
import logo from '@/assets/logo/star-wms-logo.svg'
import useSettingsStore from '@/store/modules/settings'
import variables from '@/assets/styles/variables.module.scss'

defineProps({
  collapse: {
    type: Boolean,
    required: true
  }
})

const title = import.meta.env.VITE_APP_TITLE || 'StarryWMS'
const settingsStore = useSettingsStore()
const sideTheme = computed(() => settingsStore.sideTheme)

const getLogoBackground = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-bg)'
  }
  if (settingsStore.navType == 3) {
    return variables.menuLightBg
  }
  return sideTheme.value === 'theme-dark' ? variables.menuBg : variables.menuLightBg
})

const getLogoTextColor = computed(() => {
  if (settingsStore.isDark) {
    return 'var(--sidebar-logo-text)'
  }
  if (settingsStore.navType == 3) {
    return variables.menuLightText
  }
  return sideTheme.value === 'theme-dark' ? '#dce4ec' : variables.menuLightText
})
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 0.8s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  height: 56px;
  line-height: 56px;
  background: v-bind(getLogoBackground);
  overflow: hidden;
  border-bottom: 1px solid rgba(200, 149, 108, 0.09);

  .sidebar-logo-link {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: 100%;
    width: 100%;
    padding: 0 12px;
  }

  .sidebar-logo {
    width: 30px;
    height: 30px;
    flex: 0 0 auto;
    border-radius: 6px;
    box-shadow: 0 0 0 1px rgba(200, 149, 108, 0.12), 0 8px 18px rgba(0, 0, 0, 0.24);
  }

  .brand-copy {
    display: flex;
    min-width: 0;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    line-height: 1.1;
  }

  .sidebar-title {
    display: block;
    max-width: 138px;
    overflow: hidden;
    color: v-bind(getLogoTextColor);
    font-family: Georgia, "Noto Serif SC", serif;
    font-size: 14px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sidebar-subtitle {
    display: block;
    margin-top: 4px;
    color: rgba(138, 154, 170, 0.82);
    font-size: 10px;
    font-style: normal;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  &.collapse {
    .sidebar-logo-link {
      padding: 0;
    }

    .sidebar-logo {
      margin: 0;
    }
  }
}
</style>
