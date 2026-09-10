import { getCollection } from 'astro:content';

/**
 * Where the talks happened. Conferences reuse a small set of cities, so a lookup
 * table beats a geocoding dependency — and it keeps the map buildable offline.
 *
 * Keys are matched case-insensitively against the `location` field in
 * `src/data/talks.yml`. Add a row here when you speak somewhere new; a talk with
 * an unknown location still shows in the list, it just won't get a map pin.
 */
const PLACES: Record<string, { city: string; country: string; lat: number; lon: number }> = {
  'seattle, wa': { city: 'Seattle', country: 'United States', lat: 47.61, lon: -122.33 },
  'san francisco, ca': {
    city: 'San Francisco',
    country: 'United States',
    lat: 37.77,
    lon: -122.42,
  },
  'san francisco, california': {
    city: 'San Francisco',
    country: 'United States',
    lat: 37.77,
    lon: -122.42,
  },
  'san jose, california': { city: 'San Jose', country: 'United States', lat: 37.34, lon: -121.89 },
  'los angeles, california': {
    city: 'Los Angeles',
    country: 'United States',
    lat: 34.05,
    lon: -118.24,
  },
  'las vegas, nv': { city: 'Las Vegas', country: 'United States', lat: 36.17, lon: -115.14 },
  'chicago, il': { city: 'Chicago', country: 'United States', lat: 41.88, lon: -87.63 },
  'orlando, fl': { city: 'Orlando', country: 'United States', lat: 28.54, lon: -81.38 },
  'toronto, canada': { city: 'Toronto', country: 'Canada', lat: 43.65, lon: -79.38 },
  'london, england': { city: 'London', country: 'United Kingdom', lat: 51.51, lon: -0.13 },
  'prague, czech republic': { city: 'Prague', country: 'Czech Republic', lat: 50.08, lon: 14.44 },
  'riga, latvia': { city: 'Riga', country: 'Latvia', lat: 56.95, lon: 24.11 },
  'seoul, south korea': { city: 'Seoul', country: 'South Korea', lat: 37.57, lon: 126.98 },
};

export interface SpeakingCity {
  city: string;
  country: string;
  lat: number;
  lon: number;
  /** Talks given here, newest first. */
  talks: { title: string; conference?: string; year: number; url?: string }[];
}

export interface SpeakingStats {
  talks: number;
  cities: number;
  countries: number;
  conferences: number;
  firstYear: number;
  /** Talks with no venue we can place, e.g. the online-only ones. */
  online: number;
}

export interface Speaking {
  cities: SpeakingCity[];
  stats: SpeakingStats;
}

/** Talk locations and counts, aggregated by city for the speaking map. */
export async function getSpeaking(): Promise<Speaking> {
  const talks = await getCollection('talks');
  const byCity = new Map<string, SpeakingCity>();
  let online = 0;

  for (const talk of talks) {
    const key = talk.data.location?.trim().toLowerCase() ?? '';
    const place = PLACES[key];
    if (!place) {
      online++;
      continue;
    }

    const existing = byCity.get(place.city) ?? { ...place, talks: [] };
    existing.talks.push({
      title: talk.data.title,
      conference: talk.data.conference,
      year: talk.data.date.getUTCFullYear(),
      url: talk.data.url,
    });
    byCity.set(place.city, existing);
  }

  const cities = [...byCity.values()]
    .map((c) => ({ ...c, talks: c.talks.sort((a, b) => b.year - a.year) }))
    // Biggest pins drawn first so the small ones stay clickable on top of them.
    .sort((a, b) => b.talks.length - a.talks.length);

  const conferences = new Set(talks.map((t) => t.data.conference).filter(Boolean));
  const years = talks.map((t) => t.data.date.getUTCFullYear());

  return {
    cities,
    stats: {
      talks: talks.length,
      cities: cities.length,
      countries: new Set(cities.map((c) => c.country)).size,
      conferences: conferences.size,
      firstYear: Math.min(...years),
      online,
    },
  };
}
