<template>
  <section class="grid flex-1 gap-6 lg:grid-cols-[1.35fr_0.9fr]">
    <div
      class="overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950/70 p-8 shadow-2xl shadow-black/30"
    >
      <div class="flex h-full flex-col justify-between gap-10">
        <div class="space-y-5">
          <span
            class="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300"
          >
            Live Forecast
          </span>

          <div class="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <i class="fa-regular fa-clock text-cyan-300"></i>
              {{ liveClock || "Loading time..." }}
            </span>
            <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <i class="fa-regular fa-calendar text-cyan-300"></i>
              {{ liveDate || "Loading date..." }}
            </span>
            <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <i class="fa-solid fa-rotate text-cyan-300"></i>
              Updated {{ lastUpdated || "now" }}
            </span>
          </div>

          <div class="space-y-4">
            <h1 class="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {{ weather?.heroTitle ?? "Loading live weather..." }}
            </h1>
            <p class="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Search any city worldwide for live conditions, local time,
              hourly updates, and a cleaner multi-day forecast.
            </p>
          </div>
        </div>

        <div class="space-y-5">
          <div class="flex flex-col gap-4 sm:flex-row">
            <div class="relative flex-1">
              <label class="relative block">
                <span
                  class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <i class="fa-solid fa-magnifying-glass"></i>
                </span>
                <input
                  :value="searchQuery"
                  type="text"
                  placeholder="Search for any city in the world"
                  class="w-full rounded-2xl border border-white/10 bg-black/20 py-4 pl-12 pr-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-black/30"
                  @input="handleSearchInput"
                  @keydown.enter.prevent="searchFirstResult"
                />
              </label>

              <div
                v-if="suggestions.length"
                class="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur"
              >
                <button
                  v-for="city in suggestions"
                  :key="city.id"
                  type="button"
                  class="flex w-full items-center justify-between border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 hover:bg-white/5"
                  @click="selectLocation(city)"
                >
                  <span>
                    <span class="block font-medium text-white">
                      {{ city.name }}
                    </span>
                    <span class="block text-sm text-slate-400">
                      {{ city.admin1 ? `${city.admin1}, ` : "" }}{{ city.country }}
                    </span>
                  </span>
                </button>
              </div>
            </div>

            <button
              type="button"
              class="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              @click="searchFirstResult"
            >
              <span v-if="isSearching || isLoadingWeather">Loading...</span>
              <span v-else>Search Weather</span>
            </button>
          </div>

          <p v-if="errorMessage" class="text-sm text-rose-300">
            {{ errorMessage }}
          </p>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-sm text-slate-400">Sunrise</p>
              <p class="mt-2 text-xl font-semibold text-white">
                {{ weather?.sunrise ?? "--" }}
              </p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-sm text-slate-400">UV Index</p>
              <p class="mt-2 text-xl font-semibold text-white">
                {{ weather?.uvIndex ?? "--" }}
              </p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="text-sm text-slate-400">Rain Chance</p>
              <p class="mt-2 text-xl font-semibold text-white">
                {{ weather?.rainChance ?? "--" }}
              </p>
            </div>
          </div>

          <div class="rounded-[26px] border border-white/10 bg-slate-950/40 p-5">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-white">Hourly Weather</h2>
              <span class="text-sm text-slate-400">Next 6 hours</span>
            </div>

            <div class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              <div
                v-for="slot in weather?.hourlyForecast ?? []"
                :key="slot.time"
                class="rounded-2xl border border-cyan-200/10 bg-[#0c6b8b] px-3 py-4 text-center shadow-lg shadow-cyan-950/20"
              >
                <p class="text-sm font-semibold text-cyan-50">{{ slot.time }}</p>
                <i :class="`${slot.icon} mt-4 text-lg ${slot.iconColor}`"></i>
                <p class="mt-4 text-lg font-semibold text-white">{{ slot.temp }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <aside class="grid gap-6">
      <div
        class="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.2em] text-slate-400">
              Current Weather
            </p>
            <h2 class="mt-2 text-5xl font-bold text-white">
              {{ weather?.temperature ?? "--" }}
            </h2>
            <p class="mt-2 text-slate-300">
              {{ weather?.summary ?? "Fetching live conditions..." }}
            </p>
            <div class="mt-3 flex flex-wrap items-center gap-2 text-sm text-cyan-200">
              <span>{{ liveClock || "--" }}</span>
              <span>&middot;</span>
              <span>{{ liveDate || "--" }}</span>
            </div>
          </div>
          <span
            class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15"
          >
            <i :class="`${weather?.todayIcon ?? 'fa-solid fa-cloud'} text-2xl ${weather?.todayIconColor ?? 'text-cyan-300'}`"></i>
          </span>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-300">
          <div class="rounded-2xl bg-slate-900/70 p-4">
            <p class="text-slate-400">Humidity</p>
            <p class="mt-1 text-xl font-semibold text-white">
              {{ weather?.humidity ?? "--" }}
            </p>
          </div>
          <div class="rounded-2xl bg-slate-900/70 p-4">
            <p class="text-slate-400">Wind</p>
            <p class="mt-1 text-xl font-semibold text-white">
              {{ weather?.wind ?? "--" }}
            </p>
          </div>
        </div>

        <div class="mt-4 rounded-2xl border border-cyan-400/10 bg-cyan-400/10 p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-cyan-200">Comfort Index</span>
            <span class="rounded-full bg-cyan-300/20 px-2 py-1 text-xs text-cyan-100">
              {{ weather?.comfortLabel ?? "Loading" }}
            </span>
          </div>
          <p class="mt-3 text-sm leading-6 text-slate-200">
            {{ weather?.comfortText ?? "Calculating comfort conditions..." }}
          </p>
        </div>
      </div>

      <div
        class="rounded-[30px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">3-Day Outlook</h3>
          <span class="text-sm text-slate-400">Live daily forecast</span>
        </div>

        <div class="mt-5 space-y-3">
          <div
            v-for="day in weather?.dailyForecast ?? []"
            :key="day.label"
            class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <div class="flex items-center gap-3">
              <i :class="`${day.icon} ${day.iconColor}`"></i>
              <span class="text-slate-200">{{ day.label }}</span>
            </div>
            <span class="font-semibold text-white">{{ day.range }}</span>
          </div>
        </div>
      </div>

      <div
        class="rounded-[30px] border border-white/10 bg-gradient-to-br from-cyan-500/15 to-transparent p-6"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-white">Air Conditions</h3>
          <i class="fa-solid fa-wind text-cyan-300"></i>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <div
            v-for="condition in weather?.airConditions ?? []"
            :key="condition.label"
            class="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <p class="text-sm text-slate-400">{{ condition.label }}</p>
            <p class="mt-2 text-xl font-semibold text-white">
              {{ condition.value }}
            </p>
          </div>
        </div>
      </div>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { useWeather } from "@/composables/useWeather";

const {
  searchQuery,
  suggestions,
  weather,
  isSearching,
  isLoadingWeather,
  errorMessage,
  liveDate,
  liveClock,
  lastUpdated,
  searchLocations,
  selectLocation,
  searchFirstResult,
} = useWeather();

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  searchLocations(target.value);
};
</script>

<style scoped>
</style>
