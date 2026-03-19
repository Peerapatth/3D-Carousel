<template>
  <div id="app" class="relative min-h-screen overflow-hidden bg-black text-white">
    <RouterView v-slot="{ Component, route }">
      <Transition name="route-soft" appear>
        <div :key="route.fullPath" class="route-page">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </div>
</template>

<script setup></script>

<style>
.route-page {
  min-height: 100vh;
}

.route-soft-enter-active,
.route-soft-leave-active {
  transition: opacity 220ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.route-soft-leave-active {
  position: absolute;
  inset: 0;
  width: 100%;
}

.route-soft-enter-from {
  opacity: 0;
  transform: scale(0.985);
}

.route-soft-leave-to {
  opacity: 0;
  transform: scale(1.01);
}

.route-soft-enter-to,
.route-soft-leave-from {
  opacity: 1;
  transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .route-soft-enter-active,
  .route-soft-leave-active {
    transition: opacity 120ms linear;
  }

  .route-soft-enter-from,
  .route-soft-leave-to,
  .route-soft-enter-to,
  .route-soft-leave-from {
    transform: none;
  }
}
</style>