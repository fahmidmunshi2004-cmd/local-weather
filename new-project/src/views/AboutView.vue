<template>
  <section
    class="grid flex-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]"
  >
    <div
      class="rounded-[30px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950/60 p-8 shadow-2xl shadow-black/30"
    >
      <span
        class="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300"
      >
        About This App
      </span>

      <h1 class="mt-5 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
        Live global weather with a clean dashboard experience
      </h1>

      <p class="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
        This app lets you search cities around the world and view live current
        weather, short-term hourly outlooks, and multi-day forecasts in one
        place.
      </p>

      <div class="mt-8 grid gap-4 sm:grid-cols-2">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 class="text-lg font-semibold text-white">What it shows</h2>
          <ul class="mt-3 space-y-2 text-sm text-slate-300">
            <li>Live current temperature and feels-like data</li>
            <li>Humidity, wind, pressure, visibility, and UV index</li>
            <li>Hourly forecast snapshots</li>
            <li>3-day weather outlook</li>
          </ul>
        </div>

        <div class="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 class="text-lg font-semibold text-white">Routing</h2>
          <p class="mt-3 text-sm leading-6 text-slate-300">
            The app now uses real `vue-router` routes, so navigating between
            pages updates the browser URL properly.
          </p>
        </div>
      </div>
    </div>

    <aside class="grid gap-6">
      <div class="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
        <h2 class="text-xl font-semibold text-white">Data Source</h2>
        <p class="mt-3 text-sm leading-6 text-slate-300">
          Live weather and city search are powered by Open-Meteo APIs.
        </p>
      </div>

      <div class="rounded-[30px] border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-black/20">
        <h2 class="text-xl font-semibold text-white">How to use</h2>
        <ol class="mt-3 space-y-2 text-sm text-slate-300">
          <li>1. Go to the Home route.</li>
          <li>2. Search for any city worldwide.</li>
          <li>3. Click a result to load live weather instantly.</li>
        </ol>
      </div>
    </aside>
  </section>
</template>
