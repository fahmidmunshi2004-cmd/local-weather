import { computed, ref, watch } from "vue";

type GeocodingResult = {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

type ForecastDay = {
  label: string;
  range: string;
  icon: string;
  iconColor: string;
};

type ForecastHour = {
  time: string;
  temp: string;
  icon: string;
  iconColor: string;
};

type AirCondition = {
  label: string;
  value: string;
};

type WeatherState = {
  city: string;
  country: string;
  timezone: string;
  temperature: string;
  feelsLike: string;
  summary: string;
  humidity: string;
  wind: string;
  pressure: string;
  visibility: string;
  uvIndex: string;
  rainChance: string;
  sunrise: string;
  comfortLabel: string;
  comfortText: string;
  heroTitle: string;
  hourlyForecast: ForecastHour[];
  dailyForecast: ForecastDay[];
  airConditions: AirCondition[];
  todayIcon: string;
  todayIconColor: string;
};

type WeatherProvider = "open-meteo" | "wttr";

const GEO_URL = "/api/geocoding";
const FORECAST_URL = "/api/forecast";
const GEO_FALLBACK_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_FALLBACK_URL = "https://api.open-meteo.com/v1/forecast";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const WTTR_URL = "https://wttr.in";

const searchQuery = ref("");
const suggestions = ref<GeocodingResult[]>([]);
const selectedLocation = ref<GeocodingResult | null>(null);
const weather = ref<WeatherState | null>(null);
const isSearching = ref(false);
const isLoadingWeather = ref(false);
const errorMessage = ref("");
const now = ref(Date.now());
const lastUpdated = ref("");

let searchDebounce: ReturnType<typeof setTimeout> | null = null;
let weatherRefreshInterval: ReturnType<typeof setInterval> | null = null;

const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const formatTemp = (value: number) => `${Math.round(value)}\u00B0`;
const formatPercent = (value: number) => `${Math.round(value)}%`;
const formatSpeed = (value: number) => `${Math.round(value)} km/h`;
const formatPressure = (value: number) => `${Math.round(value)} hPa`;
const formatDistance = (value: number) => `${(value / 1000).toFixed(1)} km`;
const parseNumber = (value: unknown, fallback = 0) => {
  const parsed =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;

  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseWeatherDate = (value: string) => {
  const [datePart = "", timePart = "00:00"] = value.split("T");
  const [yearRaw, monthRaw, dayRaw] = datePart.split("-").map(Number);
  const [hourRaw = 0, minuteRaw = 0, secondRaw = 0] = timePart.split(":").map(Number);
  const safeYear = typeof yearRaw === "number" && Number.isFinite(yearRaw) ? yearRaw : 1970;
  const safeMonth = typeof monthRaw === "number" && Number.isFinite(monthRaw) ? monthRaw : 1;
  const safeDay = typeof dayRaw === "number" && Number.isFinite(dayRaw) ? dayRaw : 1;
  const safeHour = typeof hourRaw === "number" && Number.isFinite(hourRaw) ? hourRaw : 0;
  const safeMinute =
    typeof minuteRaw === "number" && Number.isFinite(minuteRaw) ? minuteRaw : 0;
  const safeSecond =
    typeof secondRaw === "number" && Number.isFinite(secondRaw) ? secondRaw : 0;

  return new Date(
    Date.UTC(safeYear, safeMonth - 1, safeDay, safeHour, safeMinute, safeSecond),
  );
};

const formatHour = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    timeZone: "UTC",
  }).format(parseWeatherDate(value));

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(parseWeatherDate(value));

const formatWeekday = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "UTC",
  }).format(parseWeatherDate(value));

const formatLiveDate = (value: number, timezone?: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: timezone,
  }).format(new Date(value));

const formatLiveClock = (value: number, timezone?: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(new Date(value));

const formatUpdatedAt = (value: number, timezone?: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
  }).format(new Date(value));

const getHourlyKeyForTimezone = (value: number, timezone?: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).formatToParts(new Date(value));

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";

  return `${year}-${month}-${day}T${hour}:00`;
};

const getFaviconMarkup = (icon: string, iconColor: string) => {
  const bg =
    icon.includes("cloud-bolt") || icon.includes("cloud-rain")
      ? ["#0f172a", "#1d4ed8"]
      : icon.includes("moon")
        ? ["#0f172a", "#312e81"]
        : ["#0f172a", "#155e75"];

  const accent =
    iconColor.includes("amber")
      ? "#facc15"
      : iconColor.includes("yellow")
        ? "#fde047"
        : iconColor.includes("indigo")
          ? "#c7d2fe"
          : iconColor.includes("sky") || iconColor.includes("cyan")
            ? "#67e8f9"
            : "#e2e8f0";

  const symbol = icon.includes("sun")
    ? `<circle cx="24" cy="24" r="10" fill="${accent}" />`
    : icon.includes("moon")
      ? `<path d="M29 14a11 11 0 1 0 11 11c0-.4-.02-.8-.06-1.19A13 13 0 1 1 29 14Z" fill="${accent}" />`
      : `<path d="M21 42h19a9 9 0 0 0 .87-17.96A12 12 0 0 0 18.4 21.2 8.5 8.5 0 0 0 21 42Z" fill="${accent}" />`;

  const extra =
    icon.includes("cloud-bolt")
      ? `<path d="M31 30h6l-6 12h4l-10 14 3-12h-5l8-14Z" fill="#f8fafc" />`
      : icon.includes("cloud-rain")
        ? `<circle cx="25" cy="46" r="2.5" fill="#f8fafc" /><circle cx="33" cy="49" r="2.5" fill="#f8fafc" /><circle cx="41" cy="46" r="2.5" fill="#f8fafc" />`
        : "";

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${bg[0]}" />
          <stop offset="100%" stop-color="${bg[1]}" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#bg)" />
      ${symbol}
      <path d="M22 43h20a8.5 8.5 0 0 0 .82-16.96A11.5 11.5 0 0 0 21.17 23.2 8 8 0 0 0 22 43Z" fill="#e2e8f0" opacity="0.95" />
      ${extra}
    </svg>
  `.trim();
};

const syncFavicon = (icon: string, iconColor: string) => {
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!favicon) {
    return;
  }

  const svg = getFaviconMarkup(icon, iconColor);
  favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const resolveFallbackUrl = (url: string) => {
  if (url.startsWith(`${GEO_URL}?`)) {
    return url.replace(GEO_URL, GEO_FALLBACK_URL);
  }

  if (url.startsWith(`${FORECAST_URL}?`)) {
    return url.replace(FORECAST_URL, FORECAST_FALLBACK_URL);
  }

  return null;
};

const fetchJson = async (url: string, fallbackMessage: string) => {
  const fetchWithValidation = async (requestUrl: string) => {
    const response = await fetch(requestUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(fallbackMessage);
    }

    return response.json();
  };

  try {
    return await fetchWithValidation(url);
  } catch (error) {
    const fallbackUrl = resolveFallbackUrl(url);

    if (fallbackUrl) {
      try {
        return await fetchWithValidation(fallbackUrl);
      } catch (fallbackError) {
        if (
          fallbackError instanceof Error &&
          fallbackError.message !== "Failed to fetch"
        ) {
          throw fallbackError;
        }
      }
    }

    if (error instanceof Error && error.message !== "Failed to fetch") {
      throw error;
    }

    throw new Error(
      "Weather service is temporarily unreachable. Check your connection and try again.",
    );
  }
};

const getWeatherVisual = (code: number, isDay = true) => {
  if (code === 0) {
    return {
      label: "Clear sky",
      icon: isDay ? "fa-solid fa-sun" : "fa-solid fa-moon",
      iconColor: isDay ? "text-amber-300" : "text-indigo-200",
    };
  }

  if ([1, 2].includes(code)) {
    return {
      label: "Partly cloudy",
      icon: isDay ? "fa-solid fa-cloud-sun" : "fa-solid fa-cloud-moon",
      iconColor: "text-cyan-300",
    };
  }

  if (code === 3) {
    return {
      label: "Overcast",
      icon: "fa-solid fa-cloud",
      iconColor: "text-amber-400",
    };
  }

  if ([45, 48].includes(code)) {
    return {
      label: "Foggy",
      icon: "fa-solid fa-smog",
      iconColor: "text-slate-300",
    };
  }

  if ([51, 53, 55, 56, 57, 61, 63, 65, 80, 81, 82].includes(code)) {
    return {
      label: "Rain showers",
      icon: "fa-solid fa-cloud-rain",
      iconColor: "text-sky-300",
    };
  }

  if ([66, 67].includes(code)) {
    return {
      label: "Freezing rain",
      icon: "fa-solid fa-cloud-meatball",
      iconColor: "text-blue-200",
    };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      label: "Snowfall",
      icon: "fa-solid fa-snowflake",
      iconColor: "text-blue-100",
    };
  }

  if ([95, 96, 99].includes(code)) {
    return {
      label: "Thunderstorm",
      icon: "fa-solid fa-cloud-bolt",
      iconColor: "text-yellow-300",
    };
  }

  return {
    label: "Mixed weather",
    icon: "fa-solid fa-cloud",
    iconColor: "text-amber-400",
  };
};

const getComfortSummary = (apparentTemp: number, rainChance: number, windSpeed: number) => {
  if (rainChance >= 70) {
    return {
      label: "Wet",
      text: "Take an umbrella. Rain chances stay high through the day.",
    };
  }

  if (apparentTemp >= 34) {
    return {
      label: "Hot",
      text: "It will feel hot outside, so stay hydrated and avoid long direct sun exposure.",
    };
  }

  if (windSpeed >= 25) {
    return {
      label: "Breezy",
      text: "Fresh winds will keep the day cooler, but outdoor gusts may feel stronger.",
    };
  }

  return {
    label: "Great",
    text: "Pleasant outdoor conditions with low storm risk through the day.",
  };
};

const weatherCodeFromDescription = (value: string) => {
  const normalized = value.toLowerCase();

  if (normalized.includes("thunder")) {
    return 95;
  }

  if (normalized.includes("snow") || normalized.includes("blizzard")) {
    return 71;
  }

  if (
    normalized.includes("rain") ||
    normalized.includes("drizzle") ||
    normalized.includes("shower")
  ) {
    return 61;
  }

  if (normalized.includes("fog") || normalized.includes("mist") || normalized.includes("haze")) {
    return 45;
  }

  if (normalized.includes("overcast")) {
    return 3;
  }

  if (normalized.includes("cloud")) {
    return 2;
  }

  return 0;
};

const normalizeWttrTime = (value: string) => {
  const numericTime = parseNumber(value);
  const hour = Math.floor(numericTime / 100);
  const safeHour = hour.toString().padStart(2, "0");

  return `${safeHour}:00`;
};

const toUtcIsoHour = (date: string, time: string) => `${date}T${normalizeWttrTime(time)}`;

const buildWttrHourlyTimeline = (forecastDays: Array<Record<string, any>>) =>
  forecastDays.flatMap((day) =>
    (day.hourly ?? []).map((hour: Record<string, any>) => {
      const description =
        hour.weatherDesc?.[0]?.value ??
        hour.weatherDescription?.[0]?.value ??
        "Mixed weather";
      const code = weatherCodeFromDescription(description);

      return {
        time: toUtcIsoHour(day.date, String(hour.time ?? "0")),
        temperature: parseNumber(hour.tempC),
        feelsLike: parseNumber(hour.FeelsLikeC, parseNumber(hour.tempC)),
        humidity: parseNumber(hour.humidity),
        wind: parseNumber(hour.windspeedKmph),
        visibility: parseNumber(hour.visibility) * 1000,
        chanceOfRain: parseNumber(hour.chanceofrain),
        weatherCode: code,
        summary: description,
      };
    }),
  );

const buildWeatherState = (
  location: GeocodingResult,
  forecast: Record<string, any>,
): WeatherState => {
  const timezone = location.timezone;
  const current = forecast.current;
  const daily = forecast.daily;
  const hourly = forecast.hourly;
  const currentHourKey = getHourlyKeyForTimezone(Date.now(), timezone);
  const currentIndex = hourly.time.findIndex((time: string) => time >= currentHourKey);
  const fallbackCurrentIndex = hourly.time.findIndex((time: string) => time === current.time);
  const safeIndex =
    currentIndex >= 0 ? currentIndex : fallbackCurrentIndex >= 0 ? fallbackCurrentIndex : 0;
  const visual = getWeatherVisual(current.weather_code, current.is_day === 1);
  const comfort = getComfortSummary(
    current.apparent_temperature,
    daily.precipitation_probability_max[0] ?? 0,
    current.wind_speed_10m,
  );

  const hourlyForecast = hourly.time.slice(safeIndex, safeIndex + 6).map((time: string, index: number) => {
    const hourVisual = getWeatherVisual(
      hourly.weather_code[safeIndex + index],
      hourly.is_day[safeIndex + index] === 1,
    );

    return {
      time: index === 0 ? "Now" : formatHour(time),
      temp: formatTemp(hourly.temperature_2m[safeIndex + index]),
      icon: hourVisual.icon,
      iconColor: hourVisual.iconColor,
    };
  });

  const dailyForecast = daily.time.slice(0, 3).map((time: string, index: number) => {
    const dayVisual = getWeatherVisual(daily.weather_code[index], true);

    return {
      label: index === 0 ? "Today" : formatWeekday(time),
      range: `${formatTemp(daily.temperature_2m_max[index])} / ${formatTemp(daily.temperature_2m_min[index])}`,
      icon: dayVisual.icon,
      iconColor: dayVisual.iconColor,
    };
  });

  return {
    city: location.name,
    country: location.country,
    timezone: timezone ?? DEFAULT_TIMEZONE,
    temperature: formatTemp(current.temperature_2m),
    feelsLike: formatTemp(current.apparent_temperature),
    summary: visual.label,
    humidity: formatPercent(current.relative_humidity_2m),
    wind: formatSpeed(current.wind_speed_10m),
    pressure: formatPressure(current.surface_pressure),
    visibility: formatDistance(hourly.visibility[safeIndex]),
    uvIndex: `${Math.round(daily.uv_index_max[0] ?? 0)} Moderate`,
    rainChance: formatPercent(daily.precipitation_probability_max[0] ?? 0),
    sunrise: formatTime(daily.sunrise[0]),
    comfortLabel: comfort.label,
    comfortText: comfort.text,
    heroTitle: `${location.name} weather in real time`,
    hourlyForecast,
    dailyForecast,
    airConditions: [
      { label: "Real Feel", value: formatTemp(current.apparent_temperature) },
      { label: "Pressure", value: formatPressure(current.surface_pressure) },
      { label: "Visibility", value: formatDistance(hourly.visibility[safeIndex]) },
      { label: "UV Index", value: `${Math.round(daily.uv_index_max[0] ?? 0)} Moderate` },
    ],
    todayIcon: visual.icon,
    todayIconColor: visual.iconColor,
  };
};

const buildWeatherStateFromWttr = (
  location: GeocodingResult,
  forecast: Record<string, any>,
): WeatherState => {
  const current = forecast.current_condition?.[0] ?? {};
  const weatherDays = (forecast.weather ?? []) as Array<Record<string, any>>;
  const hourlyTimeline = buildWttrHourlyTimeline(weatherDays);
  const currentHourKey = getHourlyKeyForTimezone(Date.now(), location.timezone);
  const safeIndex = hourlyTimeline.findIndex((entry) => entry.time >= currentHourKey);
  const resolvedIndex = safeIndex >= 0 ? safeIndex : 0;
  const currentDescription =
    current.weatherDesc?.[0]?.value ?? current.weatherDescription?.[0]?.value ?? "Mixed weather";
  const currentCode = weatherCodeFromDescription(currentDescription);
  const visual = getWeatherVisual(currentCode, true);
  const firstDay = weatherDays[0] ?? {};
  const comfort = getComfortSummary(
    parseNumber(current.FeelsLikeC, parseNumber(current.temp_C)),
    parseNumber(firstDay.hourly?.[0]?.chanceofrain),
    parseNumber(current.windspeedKmph),
  );

  const hourlyForecast = hourlyTimeline.slice(resolvedIndex, resolvedIndex + 6).map((entry, index) => {
    const hourVisual = getWeatherVisual(entry.weatherCode, true);

    return {
      time: index === 0 ? "Now" : formatHour(entry.time),
      temp: formatTemp(entry.temperature),
      icon: hourVisual.icon,
      iconColor: hourVisual.iconColor,
    };
  });

  const dailyForecast = weatherDays.slice(0, 3).map((day, index) => {
    const midday = day.hourly?.[4] ?? day.hourly?.[0] ?? {};
    const dayDescription =
      midday.weatherDesc?.[0]?.value ?? midday.weatherDescription?.[0]?.value ?? "Mixed weather";
    const dayVisual = getWeatherVisual(weatherCodeFromDescription(dayDescription), true);

    return {
      label: index === 0 ? "Today" : formatWeekday(day.date),
      range: `${formatTemp(parseNumber(day.maxtempC))} / ${formatTemp(parseNumber(day.mintempC))}`,
      icon: dayVisual.icon,
      iconColor: dayVisual.iconColor,
    };
  });

  const sunrise = firstDay.astronomy?.[0]?.sunrise ?? "--";
  const rainChance = hourlyTimeline[resolvedIndex]?.chanceOfRain ?? 0;
  const visibility = hourlyTimeline[resolvedIndex]?.visibility ?? parseNumber(current.visibility) * 1000;
  const uvIndex = parseNumber(current.uvIndex);

  return {
    city: location.name,
    country: location.country,
    timezone: location.timezone ?? DEFAULT_TIMEZONE,
    temperature: formatTemp(parseNumber(current.temp_C)),
    feelsLike: formatTemp(parseNumber(current.FeelsLikeC, parseNumber(current.temp_C))),
    summary: currentDescription,
    humidity: formatPercent(parseNumber(current.humidity)),
    wind: formatSpeed(parseNumber(current.windspeedKmph)),
    pressure: formatPressure(parseNumber(current.pressure)),
    visibility: formatDistance(visibility),
    uvIndex: `${Math.round(uvIndex)} Moderate`,
    rainChance: formatPercent(rainChance),
    sunrise,
    comfortLabel: comfort.label,
    comfortText: comfort.text,
    heroTitle: `${location.name} weather in real time`,
    hourlyForecast,
    dailyForecast,
    airConditions: [
      {
        label: "Real Feel",
        value: formatTemp(parseNumber(current.FeelsLikeC, parseNumber(current.temp_C))),
      },
      { label: "Pressure", value: formatPressure(parseNumber(current.pressure)) },
      { label: "Visibility", value: formatDistance(visibility) },
      { label: "UV Index", value: `${Math.round(uvIndex)} Moderate` },
    ],
    todayIcon: visual.icon,
    todayIconColor: visual.iconColor,
  };
};

const buildLocationFromNominatim = (entry: Record<string, any>, fallbackId: number) => {
  const address = entry.address ?? {};
  const primaryName =
    entry.name ??
    address.city ??
    address.town ??
    address.village ??
    address.municipality ??
    entry.display_name?.split(",")?.[0] ??
    "Unknown location";

  return {
    id: parseNumber(entry.place_id, fallbackId),
    name: primaryName,
    country: address.country ?? "Unknown country",
    admin1: address.state ?? address.region ?? address.county,
    latitude: parseNumber(entry.lat),
    longitude: parseNumber(entry.lon),
    timezone: undefined,
  } satisfies GeocodingResult;
};

const fetchWttrWeather = async (location: GeocodingResult) => {
  const query = `${location.latitude},${location.longitude}`;
  const params = new URLSearchParams({
    format: "j1",
  });

  return fetchJson(
    `${WTTR_URL}/${query}?${params.toString()}`,
    "Failed to load fallback weather data.",
  );
};

const fetchNominatimLocations = async (query: string, count: number) => {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    limit: String(count),
  });

  const data = (await fetchJson(
    `${NOMINATIM_URL}?${params.toString()}`,
    "Failed to search fallback locations.",
  )) as Array<Record<string, any>>;

  return data.map((entry, index) => buildLocationFromNominatim(entry, index + 1));
};

const fetchWeather = async (location: GeocodingResult) => {
  isLoadingWeather.value = true;
  errorMessage.value = "";

  try {
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "weather_code",
        "surface_pressure",
        "wind_speed_10m",
      ].join(","),
      hourly: [
        "temperature_2m",
        "weather_code",
        "is_day",
        "visibility",
      ].join(","),
      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "sunrise",
        "uv_index_max",
        "precipitation_probability_max",
      ].join(","),
      forecast_days: "7",
      timezone: "auto",
    });

    let provider: WeatherProvider = "open-meteo";
    let data: Record<string, any>;

    try {
      data = await fetchJson(
        `${FORECAST_URL}?${params.toString()}`,
        "Failed to load live weather data.",
      );
    } catch {
      provider = "wttr";
      data = await fetchWttrWeather(location);
    }

    selectedLocation.value = location;
    weather.value =
      provider === "open-meteo"
        ? buildWeatherState(location, data)
        : buildWeatherStateFromWttr(location, data);
    lastUpdated.value = formatUpdatedAt(Date.now(), weather.value.timezone);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Unable to load weather data.";
  } finally {
    isLoadingWeather.value = false;
  }
};

const searchLocations = (query: string) => {
  searchQuery.value = query;
  errorMessage.value = "";

  if (searchDebounce) {
    clearTimeout(searchDebounce);
  }

  if (!query.trim()) {
    suggestions.value = [];
    return;
  }

  searchDebounce = setTimeout(async () => {
    isSearching.value = true;

    try {
      const params = new URLSearchParams({
        name: query,
        count: "6",
        language: "en",
        format: "json",
      });

      try {
        const data = await fetchJson(
          `${GEO_URL}?${params.toString()}`,
          "Failed to search cities.",
        );
        suggestions.value = data.results ?? [];
      } catch {
        suggestions.value = await fetchNominatimLocations(query, 6);
      }
    } catch (error) {
      suggestions.value = [];
      errorMessage.value =
        error instanceof Error ? error.message : "Unable to search locations.";
    } finally {
      isSearching.value = false;
    }
  }, 300);
};

const selectLocation = async (location: GeocodingResult) => {
  searchQuery.value = `${location.name}, ${location.country}`;
  suggestions.value = [];
  errorMessage.value = "";
  await fetchWeather(location);
};

const searchFirstResult = async () => {
  if (suggestions.value.length > 0) {
    const [firstSuggestion] = suggestions.value;
    if (firstSuggestion) {
      await selectLocation(firstSuggestion);
    }
    return;
  }

  if (!searchQuery.value.trim()) {
    return;
  }

  isSearching.value = true;

  try {
    let firstResult: GeocodingResult | undefined;

    try {
      const params = new URLSearchParams({
        name: searchQuery.value,
        count: "1",
        language: "en",
        format: "json",
      });

      const data = await fetchJson(
        `${GEO_URL}?${params.toString()}`,
        "Failed to search cities.",
      );
      firstResult = data.results?.[0] as GeocodingResult | undefined;
    } catch {
      [firstResult] = await fetchNominatimLocations(searchQuery.value, 1);
    }

    if (!firstResult) {
      throw new Error("No city found for that search.");
    }

    await selectLocation(firstResult);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Unable to search locations.";
  } finally {
    isSearching.value = false;
  }
};

if (!weather.value) {
  void fetchWeather({
    id: 1,
    name: "Dhaka",
    country: "Bangladesh",
    latitude: 23.7104,
    longitude: 90.4074,
    timezone: "Asia/Dhaka",
  });
}

setInterval(() => {
  now.value = Date.now();
}, 1000);

if (!weatherRefreshInterval) {
  weatherRefreshInterval = setInterval(() => {
    if (selectedLocation.value) {
      void fetchWeather(selectedLocation.value);
    }
  }, 300000);
}

const liveDate = computed(() => {
  if (!weather.value) {
    return "";
  }

  return formatLiveDate(now.value, weather.value.timezone);
});

const liveClock = computed(() => {
  if (!weather.value) {
    return "";
  }

  return formatLiveClock(now.value, weather.value.timezone);
});

watch(
  weather,
  (value) => {
    if (!value) {
      document.title = "The Local Weather";
      syncFavicon("fa-solid fa-cloud-sun", "text-cyan-300");
      return;
    }

    document.title = `${value.city} ${value.temperature} | The Local Weather`;
    syncFavicon(value.todayIcon, value.todayIconColor);
  },
  { immediate: true },
);

export const useWeather = () => ({
  searchQuery,
  suggestions,
  selectedLocation,
  weather,
  isSearching,
  isLoadingWeather,
  errorMessage,
  searchLocations,
  selectLocation,
  searchFirstResult,
  fetchWeather,
  liveDate,
  liveClock,
  lastUpdated,
});
