<script setup lang="ts">
import AppContent from './AppContent.vue';
import ThemeConfig from './states/ThemeConfig';

const themeConfig = ThemeConfig();

</script>

<template>
  <n-config-provider :theme-overrides="themeConfig.themeOverrides.value">
    <n-notification-provider>
      <n-message-provider>
        <n-dialog-provider>
          <n-loading-bar-provider>
            <AppContent />
          </n-loading-bar-provider>
        </n-dialog-provider>
      </n-message-provider>
    </n-notification-provider>
  </n-config-provider>
</template>
