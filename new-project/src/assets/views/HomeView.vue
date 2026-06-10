<template>
  <section class="grid flex-1 gap-6 lg:grid-cols-[1.35fr_0.9fr]">
    <div
      class="overflow-hidden rounded-[30px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(240,249,255,0.94)_100%)] p-8 shadow-[0_30px_70px_rgba(69,130,177,0.16)] backdrop-blur-xl"
    >
      <div class="flex h-full flex-col justify-between gap-10">
        <div class="space-y-5">
          <span
            class="inline-flex items-center rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700"
          >
            Live Forecast
          </span>

          <div class="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span
              class="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-3 py-2"
            >
              <i class="fa-regular fa-clock text-amber-500"></i>
              {{ liveClock || "Loading time..." }}
            </span>
            <span
              class="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-3 py-2"
            >
              <i class="fa-regular fa-calendar text-sky-500"></i>
              {{ liveDate || "Loading date..." }}
            </span>
            <span
              class="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-3 py-2"
            >
              <i class="fa-solid fa-rotate text-emerald-500"></i>
              Updated {{ lastUpdated || "now" }}
            </span>
          </div>

          <div v-if="showSkeleton" class="space-y-4">
            <div class="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              <span class="loader-dot"></span>
              Loading live weather
            </div>
            <div class="skeleton h-12 w-full max-w-2xl rounded-2xl"></div>
            <div class="skeleton h-5 w-full max-w-xl rounded-xl"></div>
            <div class="skeleton h-5 w-4/5 max-w-lg rounded-xl"></div>
          </div>

          <div v-else class="space-y-4">
            <h1
              class="max-w-2xl text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl"
            >
              {{ weather?.heroTitle ?? "Loading live weather..." }}
            </h1>
            <p class="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Search any city worldwide for live conditions, local time, hourly
              updates, and a cleaner multi-day forecast.
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
                  class="w-full rounded-2xl border border-white/35 bg-white/92 py-4 pl-12 pr-4 text-base text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white"
                  @input="handleSearchInput"
                  @keydown.enter.prevent="searchFirstResult"
                />
              </label>

              <div
                v-if="suggestions.length"
                class="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 overflow-hidden rounded-2xl border border-sky-100 bg-white/96 shadow-2xl shadow-sky-900/10 backdrop-blur"
              >
                <button
                  v-for="city in suggestions"
                  :key="city.id"
                  type="button"
                  class="flex w-full items-center justify-between border-b border-sky-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-sky-50"
                  @click="selectLocation(city)"
                >
                  <span>
                    <span class="block font-medium text-slate-800">
                      {{ city.name }}
                    </span>
                    <span class="block text-sm text-slate-500">
                      {{ city.admin1 ? `${city.admin1}, ` : ""
                      }}{{ city.country }}
                    </span>
                  </span>
                </button>
              </div>
            </div>

            <button
              type="button"
              class="inline-flex items-center justify-center rounded-2xl bg-amber-300 px-6 py-4 text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
              @click="searchFirstResult"
            >
              <span v-if="isSearching || isLoadingWeather">Loading...</span>
              <span v-else>Search Weather</span>
            </button>
          </div>

          <p v-if="errorMessage" class="text-sm text-rose-500">
            {{ errorMessage }}
          </p>

          <div v-if="showSkeleton" class="grid gap-3 sm:grid-cols-3">
            <div
              v-for="item in 3"
              :key="`stat-${item}`"
              class="rounded-2xl border border-white/20 bg-white/12 p-4"
            >
              <div class="skeleton h-4 w-20 rounded-lg"></div>
              <div class="skeleton mt-3 h-7 w-24 rounded-xl"></div>
            </div>
          </div>

          <div v-else class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-white/20 bg-white/12 p-4">
              <p class="text-sm text-slate-500">Sunrise</p>
              <p class="mt-2 text-xl font-semibold text-slate-800">
                {{ weather?.sunrise ?? "--" }}
              </p>
            </div>
            <div class="rounded-2xl border border-white/20 bg-white/12 p-4">
              <p class="text-sm text-slate-500">UV Index</p>
              <p class="mt-2 text-xl font-semibold text-slate-800">
                {{ weather?.uvIndex ?? "--" }}
              </p>
            </div>
            <div class="rounded-2xl border border-white/20 bg-white/12 p-4">
              <p class="text-sm text-slate-500">Rain Chance</p>
              <p class="mt-2 text-xl font-semibold text-slate-800">
                {{ weather?.rainChance ?? "--" }}
              </p>
            </div>
          </div>

          <div
            class="rounded-[26px] border border-white/20 bg-white/12 p-5 backdrop-blur-sm"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-slate-800">
                Hourly Weather
              </h2>
              <span class="text-sm text-slate-500">Next 6 hours</span>
            </div>

            <div
              v-if="showSkeleton"
              class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6"
            >
              <div
                v-for="item in 6"
                :key="`hour-${item}`"
                class="rounded-2xl border border-sky-100 bg-white px-3 py-4 text-center shadow-lg shadow-sky-200/40"
              >
                <div
                  class="skeleton mx-auto h-4 w-10 rounded-lg bg-sky-100"
                ></div>
                <div
                  class="skeleton mx-auto mt-4 h-5 w-5 rounded-full bg-sky-100"
                ></div>
                <div
                  class="skeleton mx-auto mt-4 h-6 w-12 rounded-lg bg-sky-100"
                ></div>
              </div>
            </div>

            <div
              v-else
              class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6"
            >
              <div
                v-for="slot in weather?.hourlyForecast ?? []"
                :key="slot.time"
                class="rounded-2xl border border-sky-100 bg-white px-3 py-4 text-center shadow-lg shadow-sky-200/40"
              >
                <p class="text-sm font-semibold text-slate-500">
                  {{ slot.time }}
                </p>
                <i :class="`${slot.icon} mt-4 text-xl ${slot.iconColor}`"></i>
                <p class="mt-4 text-lg font-semibold text-slate-800">
                  {{ slot.temp }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <aside class="grid gap-6">
      <div
        class="rounded-[30px] border border-white/70 bg-white/72 p-6 shadow-[0_20px_50px_rgba(90,134,173,0.18)] backdrop-blur-xl"
      >
        <div v-if="showSkeleton" class="space-y-4">
          <div class="flex items-start justify-between">
            <div class="space-y-3">
              <div class="skeleton h-4 w-28 rounded-lg"></div>
              <div class="skeleton h-12 w-32 rounded-2xl"></div>
              <div class="skeleton h-5 w-40 rounded-lg"></div>
              <div class="skeleton h-4 w-48 rounded-lg"></div>
            </div>
            <div class="skeleton h-14 w-14 rounded-2xl"></div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="item in 2"
              :key="`current-${item}`"
              class="rounded-2xl bg-sky-50/85 p-4"
            >
              <div class="skeleton h-4 w-16 rounded-lg"></div>
              <div class="skeleton mt-3 h-7 w-20 rounded-xl"></div>
            </div>
          </div>

          <div class="rounded-2xl border border-sky-200 bg-sky-100/80 p-4">
            <div class="flex items-center justify-between">
              <div class="skeleton h-4 w-24 rounded-lg"></div>
              <div class="skeleton h-6 w-14 rounded-full"></div>
            </div>
            <div class="skeleton mt-3 h-4 w-full rounded-lg"></div>
            <div class="skeleton mt-2 h-4 w-5/6 rounded-lg"></div>
          </div>
        </div>

        <template v-else>
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm uppercase tracking-[0.2em] text-sky-700/75">
                Current Weather
              </p>
              <h2 class="mt-2 text-5xl font-bold text-slate-800">
                {{ weather?.temperature ?? "--" }}
              </h2>
              <p class="mt-2 text-slate-600">
                {{ weather?.summary ?? "Fetching live conditions..." }}
              </p>
              <div
                class="mt-3 flex flex-wrap items-center gap-2 text-sm text-sky-700"
              >
                <span>{{ liveClock || "--" }}</span>
                <span>&middot;</span>
                <span>{{ liveDate || "--" }}</span>
              </div>
            </div>
            <span
              class="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-sky-100"
            >
              <i
                :class="`${
                  weather?.todayIcon ?? 'fa-solid fa-cloud'
                } text-2xl ${weather?.todayIconColor ?? 'text-sky-500'}`"
              ></i>
            </span>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-600">
            <div class="rounded-2xl bg-sky-50 p-4">
              <p class="text-slate-500">Humidity</p>
              <p class="mt-1 text-xl font-semibold text-slate-800">
                {{ weather?.humidity ?? "--" }}
              </p>
            </div>
            <div class="rounded-2xl bg-sky-50 p-4">
              <p class="text-slate-500">Wind</p>
              <p class="mt-1 text-xl font-semibold text-slate-800">
                {{ weather?.wind ?? "--" }}
              </p>
            </div>
          </div>

          <div class="mt-4 rounded-2xl border border-sky-200 bg-sky-100/85 p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-sky-700">Comfort Index</span>
              <span
                class="rounded-full bg-white/70 px-2 py-1 text-xs text-sky-700"
              >
                {{ weather?.comfortLabel ?? "Loading" }}
              </span>
            </div>
            <p class="mt-3 text-sm leading-6 text-slate-600">
              {{ weather?.comfortText ?? "Calculating comfort conditions..." }}
            </p>
          </div>
        </template>
      </div>

      <div
        class="rounded-[30px] border border-white/70 bg-white/72 p-6 shadow-[0_20px_50px_rgba(90,134,173,0.18)] backdrop-blur-xl"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-800">3-Day Outlook</h3>
          <span class="text-sm text-slate-500">Live daily forecast</span>
        </div>

        <div v-if="showSkeleton" class="mt-5 space-y-3">
          <div
            v-for="item in 3"
            :key="`day-${item}`"
            class="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="skeleton h-4 w-4 rounded-full"></div>
                <div class="skeleton h-4 w-20 rounded-lg"></div>
              </div>
              <div class="skeleton h-4 w-24 rounded-lg"></div>
            </div>
          </div>
        </div>

        <div v-else class="mt-5 space-y-3">
          <div
            v-for="day in weather?.dailyForecast ?? []"
            :key="day.label"
            class="flex items-center justify-between rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3"
          >
            <div class="flex items-center gap-3">
              <i :class="`${day.icon} ${day.iconColor}`"></i>
              <span class="text-slate-700">{{ day.label }}</span>
            </div>
            <span class="font-semibold text-slate-800">{{ day.range }}</span>
          </div>
        </div>
      </div>

      <div
        class="rounded-[30px] border border-white/70 bg-gradient-to-br from-sky-100/90 via-white/80 to-cyan-100/75 p-6 shadow-[0_20px_50px_rgba(90,134,173,0.16)] backdrop-blur-xl"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-800">Air Conditions</h3>
          <i class="fa-solid fa-wind text-sky-600"></i>
        </div>

        <div v-if="showSkeleton" class="mt-5 grid grid-cols-2 gap-3">
          <div
            v-for="item in 4"
            :key="`air-${item}`"
            class="rounded-2xl border border-sky-100 bg-white/70 p-4"
          >
            <div class="skeleton h-4 w-20 rounded-lg"></div>
            <div class="skeleton mt-3 h-7 w-24 rounded-xl"></div>
          </div>
        </div>

        <div v-else class="mt-5 grid grid-cols-2 gap-3">
          <div
            v-for="condition in weather?.airConditions ?? []"
            :key="condition.label"
            class="rounded-2xl border border-sky-100 bg-white/70 p-4"
          >
            <p class="text-sm text-slate-500">{{ condition.label }}</p>
            <p class="mt-2 text-xl font-semibold text-slate-800">
              {{ condition.value }}
            </p>
          </div>
        </div>
      </div>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";

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

const showSkeleton = computed(() => isLoadingWeather.value);

const handleSearchInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  searchLocations(target.value);
};
</script>

<style scoped>
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(219, 234, 254, 0.65) 0%,
    rgba(255, 255, 255, 0.94) 35%,
    rgba(125, 211, 252, 0.52) 50%,
    rgba(255, 255, 255, 0.94) 65%,
    rgba(219, 234, 254, 0.65) 100%
  );
  background-size: 240% 100%;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.65);
  will-change: background-position, opacity, transform;
  animation: shimmer 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite,
    skeletonPulse 2.8s ease-in-out infinite;
}

.loader-dot {
  height: 0.65rem;
  width: 0.65rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #38bdf8, #fbbf24);
  box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.25);
  animation: loaderBlink 1.6s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 220% 0;
  }

  100% {
    background-position: -180% 0;
  }
}

@keyframes skeletonPulse {
  0%,
  100% {
    opacity: 0.82;
    transform: scale(1);
  }

  50% {
    opacity: 0.98;
    transform: scale(1.006);
  }
}

@keyframes loaderBlink {
  0% {
    opacity: 0.55;
    transform: scale(0.92);
    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.16);
  }

  50% {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(56, 189, 248, 0.08);
  }

  100% {
    opacity: 0.7;
    transform: scale(0.95);
    box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.04);
  }
}
</style>
