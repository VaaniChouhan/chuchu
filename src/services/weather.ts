/**
 * Unified Weather Service
 * Fetches real-time local weather forecasts from Open-Meteo API with fallback.
 */

export interface WeatherContext {
  tempC: number;
  condition: "cold" | "mild" | "warm" | "hot" | "rainy";
  description: string;
}

export interface WeatherData {
  tempC: number;
  condition: string;
  humidity: number;
  outfitTag: string;
  isRainy: boolean;
  isCold: boolean;
}

const DEFAULT_WEATHER: WeatherContext = {
  tempC: 22,
  condition: "mild",
  description: "22°C • Mild & pleasant",
};

export function mapWeatherCodeToOutfitTag(code: number, tempC: number): { tag: string; isRainy: boolean; isCold: boolean } {
  const isRainy = (code >= 50 && code <= 67) || (code >= 80 && code <= 82);
  const isCold = tempC <= 18;

  if (isRainy) {
    return { tag: "🌧️ Rainproof layer", isRainy: true, isCold };
  }
  if (tempC <= 12) {
    return { tag: "🧥 Heavy winter warmth", isRainy, isCold: true };
  }
  if (tempC <= 18) {
    return { tag: "🍂 Light sweater weather", isRainy, isCold: true };
  }
  if (tempC >= 32) {
    return { tag: "☀️ Airy linen weather", isRainy, isCold: false };
  }
  return { tag: "🌦️ Weather-right", isRainy, isCold };
}

export async function fetchCurrentWeather(lat = 28.6139, lon = 77.209): Promise<WeatherContext> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(url);
    if (!response.ok) return DEFAULT_WEATHER;

    const data = await response.json();
    const current = data.current_weather;
    if (!current) return DEFAULT_WEATHER;

    const temp = Math.round(current.temperature);
    let condition: WeatherContext["condition"] = "mild";
    let desc = `${temp}°C • Mild`;

    if (temp >= 28) {
      condition = "hot";
      desc = `${temp}°C • Warm & sunny`;
    } else if (temp >= 20) {
      condition = "warm";
      desc = `${temp}°C • Pleasant & clear`;
    } else if (temp >= 12) {
      condition = "mild";
      desc = `${temp}°C • Crisp breeze`;
    } else {
      condition = "cold";
      desc = `${temp}°C • Chilly`;
    }

    if ([61, 63, 65, 80, 81, 82].includes(current.weathercode)) {
      condition = "rainy";
      desc = `${temp}°C • Light rain`;
    }

    return { tempC: temp, condition, description: desc };
  } catch (e) {
    console.warn("[Weather] API fetch failed, using fallback:", e);
    return DEFAULT_WEATHER;
  }
}

export async function fetchWeatherData(lat = 28.6139, lon = 77.209): Promise<WeatherData> {
  const ctx = await fetchCurrentWeather(lat, lon);
  const mapped = mapWeatherCodeToOutfitTag(ctx.tempC >= 25 ? 0 : 61, ctx.tempC);

  return {
    tempC: ctx.tempC,
    condition: ctx.condition,
    humidity: 55,
    outfitTag: mapped.tag,
    isRainy: ctx.condition === "rainy",
    isCold: ctx.condition === "cold",
  };
}
