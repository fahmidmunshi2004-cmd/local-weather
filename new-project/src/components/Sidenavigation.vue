<template>
  <header class="relative mb-6">
    <nav
      class="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center justify-between gap-4">
        <RouterLink to="/" class="inline-flex items-center gap-3">
          <span
            class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20"
          >
            <i class="fa-solid fa-cloud-sun text-lg leading-none"></i>
          </span>
          <span>
            <span class="block text-lg font-semibold tracking-tight">
              The Local Weather
            </span>
            <span class="block text-sm text-slate-400">
              Smart forecast dashboard
            </span>
          </span>
        </RouterLink>

        <button
          @click="toggleModal"
          type="button"
          class="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-300 sm:hidden"
        >
          <i class="fa-solid fa-gear text-base leading-none"></i>
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:border-cyan-400/30 hover:text-white"
        >
          <i class="fa-solid fa-house text-cyan-300"></i>
          Home
        </RouterLink>
        <RouterLink
          to="/about"
          class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:border-cyan-400/30 hover:text-white"
        >
          <i class="fa-solid fa-circle-info text-cyan-300"></i>
          About
        </RouterLink>
        <span
          class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"
        >
          <i class="fa-solid fa-location-dot text-cyan-300"></i>
          {{ locationLabel }}
        </span>
        <span
          class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"
        >
          <i class="fa-solid fa-temperature-three-quarters text-cyan-300"></i>
          {{ temperatureLabel }}
        </span>
        <span
          class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"
        >
          <i class="fa-regular fa-clock text-cyan-300"></i>
          {{ clockLabel }}
        </span>
      </div>

      <button
        @click="toggleModal"
        type="button"
        class="hidden h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-300 sm:inline-flex"
      >
        <i class="fa-solid fa-gear text-base leading-none"></i>
      </button>

      <BaseModal
        class="text-black"
        :modal-active="modalActive"
        @close="modalActive = false"
      >
        <div class="space-y-4">
          <h2 class="text-2xl font-bold">Weather App</h2>
          <p>
            Search any city worldwide and get live weather, temperature,
            humidity, wind speed, visibility, and multi-day forecasts.
          </p>

          <div>
            <h3 class="font-semibold">Features</h3>
            <ul class="mt-2 list-disc space-y-1 pl-5">
              <li>Worldwide city search</li>
              <li>Live temperature and feels-like data</li>
              <li>Hourly forecast snapshots</li>
              <li>3-day outlook with real weather icons</li>
              <li>Dynamic air condition metrics</li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold">Technologies</h3>
            <p>Vue 3, TypeScript, Tailwind CSS, Vite, Font Awesome, Open-Meteo APIs</p>
          </div>
        </div>
      </BaseModal>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";

import BaseModal from "./BaseModal.vue";
import { useWeather } from "@/composables/useWeather";

const modalActive = ref(false);
const { selectedLocation, weather, liveClock } = useWeather();

const locationLabel = computed(() => {
  if (!selectedLocation.value) {
    return "Loading location...";
  }

  return `${selectedLocation.value.name}, ${selectedLocation.value.country}`;
});

const temperatureLabel = computed(() => {
  if (!weather.value) {
    return "Loading live weather...";
  }

  return `${weather.value.temperature} Feels like ${weather.value.feelsLike}`;
});

const clockLabel = computed(() => {
  if (!liveClock.value) {
    return "Loading time...";
  }

  return liveClock.value;
});

const toggleModal = () => {
  modalActive.value = !modalActive.value;
};
</script>
