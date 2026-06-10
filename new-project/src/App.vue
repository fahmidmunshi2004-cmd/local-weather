<template>
  <main
    class="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_32%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#111827_100%)] px-4 py-8 text-white sm:px-6 lg:px-8"
  >
    <section
      class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col rounded-[32px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_30px_80px_rgba(2,6,23,0.65)] backdrop-blur xl:p-8"
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
