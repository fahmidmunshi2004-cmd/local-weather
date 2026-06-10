<template>
  <main
    class="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.7),transparent_30%),linear-gradient(180deg,#dff4ff_0%,#c9e8ff_42%,#b1d9f8_100%)] px-4 py-8 text-slate-800 sm:px-6 lg:px-8"
  >
    <div class="sky-orb sky-orb-one"></div>
    <div class="sky-orb sky-orb-two"></div>
    <div class="sky-orb sky-orb-three"></div>

    <section
      class="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col rounded-[32px] border border-white/55 bg-white/40 p-5 shadow-[0_30px_80px_rgba(73,119,165,0.22)] backdrop-blur-xl xl:p-8"
    >
      <Sidenavigation />
      <RouterView />
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";

import Sidenavigation from "./components/Sidenavigation.vue";
</script>

<style scoped>
.sky-orb {
  position: absolute;
  border-radius: 9999px;
  pointer-events: none;
  filter: blur(18px);
  opacity: 0.55;
  will-change: transform, opacity;
  animation: floatSky 24s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.sky-orb-one {
  top: 72px;
  left: 5%;
  height: 180px;
  width: 180px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.85) 0%, rgba(186, 230, 253, 0.18) 72%, transparent 100%);
}

.sky-orb-two {
  top: 20%;
  right: 4%;
  height: 220px;
  width: 220px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.68) 0%, rgba(125, 211, 252, 0.2) 72%, transparent 100%);
  animation-delay: -7s;
}

.sky-orb-three {
  bottom: 10%;
  left: 34%;
  height: 140px;
  width: 140px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.78) 0%, rgba(191, 219, 254, 0.16) 68%, transparent 100%);
  animation-delay: -11s;
}

@keyframes floatSky {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(0, -10px, 0) scale(1.04);
  }
}
</style>
