<template>
  <main
    class="min-h-screen bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.7),transparent_30%),linear-gradient(180deg,#dff4ff_0%,#c9e8ff_42%,#b1d9f8_100%)] px-4 py-8 text-slate-800 sm:px-6 lg:px-8"
  >
    <section
      class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col rounded-[32px] border border-white/55 bg-white/40 p-5 shadow-[0_30px_80px_rgba(73,119,165,0.22)] backdrop-blur-xl xl:p-8"
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
</style>
