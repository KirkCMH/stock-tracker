<script setup lang="ts">
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-background">
    <AppSidebar />
    <div class="flex flex-1 flex-col overflow-hidden">
      <AppHeader />
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
