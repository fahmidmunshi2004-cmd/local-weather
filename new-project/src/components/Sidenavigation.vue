<template>
  <header class="relative mb-6">
    <nav
      class="flex flex-col gap-4 rounded-[28px] border border-white/65 bg-white/55 px-5 py-4 shadow-[0_18px_50px_rgba(88,137,179,0.16)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center justify-between gap-4">
        <RouterLink to="/" class="inline-flex items-center gap-3">
          <span
            class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-lg shadow-sky-400/30"
          >
            <i class="fa-solid fa-cloud-sun text-lg leading-none"></i>
          </span>
          <span>
            <span
              class="block text-lg font-semibold tracking-tight text-slate-800"
            >
              The Local Weather
            </span>
            <span class="block text-sm text-sky-700/80">
              Smart forecast dashboard
            </span>
          </span>
        </RouterLink>

        <button
          @click="toggleModal"
          type="button"
          class="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-sky-200 bg-white/80 text-slate-700 transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 sm:hidden"
        >
          <i class="fa-solid fa-gear text-base leading-none"></i>
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-3 text-sm text-slate-700">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/75 px-3 py-2 transition hover:border-sky-300 hover:bg-sky-50"
        >
          <i class="fa-solid fa-house text-sky-500"></i>
          Home
        </RouterLink>
        <RouterLink
          to="/about"
          class="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/75 px-3 py-2 transition hover:border-sky-300 hover:bg-sky-50"
        >
          <i class="fa-solid fa-circle-info text-sky-500"></i>
          About
        </RouterLink>
        <span
          class="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/75 px-3 py-2"
        >
          <i class="fa-solid fa-location-dot text-sky-500"></i>
          {{ locationLabel }}
        </span>
        <span
          class="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/75 px-3 py-2"
        >
          <i class="fa-solid fa-temperature-three-quarters text-sky-500"></i>
          {{ temperatureLabel }}
        </span>
        <span
          class="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/75 px-3 py-2"
        >
          <i class="fa-regular fa-clock text-sky-500"></i>
          {{ clockLabel }}
        </span>
      </div>

      <button
        @click="toggleModal"
        type="button"
        class="hidden h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-sky-200 bg-white/80 text-slate-700 transition hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700 sm:inline-flex"
      >
        <i class="fa-solid fa-gear text-base leading-none"></i>
      </button>

      <BaseModal
        class="text-slate-800"
        :modal-active="modalActive"
        @close="modalActive = false"
      >
        <div
          class="space-y-4 rounded-[22px] border border-white/60 bg-white/35 p-5 shadow-inner shadow-white/30"
        >
          <span
            class="inline-flex items-center rounded-full border border-sky-200 bg-sky-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700"
          >
            App Details
          </span>
          <h2 class="text-2xl font-bold text-slate-800">Weather App</h2>
          <p class="text-slate-600">
            Search any city worldwide and get live weather, temperature,
            humidity, wind speed, visibility, and multi-day forecasts.
          </p>

          <div>
            <h3 class="font-semibold text-slate-800">Features</h3>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-slate-600">
              <li>Worldwide city search</li>
              <li>Live temperature and feels-like data</li>
              <li>Hourly forecast snapshots</li>
              <li>3-day outlook with real weather icons</li>
              <li>Dynamic air condition metrics</li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold text-slate-800">Technologies</h3>
            <p class="text-slate-600">
              Vue 3, TypeScript, Tailwind CSS, Vite, Font Awesome, Open-Meteo
              APIs
            </p>
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
