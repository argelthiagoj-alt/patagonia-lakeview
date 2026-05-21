import { SEASON_CONFIG, type Season } from "./config";

/**
 * Devuelve la temporada (hemisferio sur) para una fecha dada. Patagonia
 * vive abajo del ecuador así que diciembre-febrero = verano.
 *
 * Cuando estés en demo mode podés pasar la fecha resuelta por
 * `getAppDateServer()` / `getAppDateClient()` para que el theme refleje
 * la fecha demo.
 */
export function currentSeason(date: Date = new Date()): Season {
  const month = date.getMonth(); // 0-indexed
  // Dec, Jan, Feb → summer
  if (month === 11 || month <= 1) return "summer";
  // Mar, Apr, May → autumn
  if (month <= 4) return "autumn";
  // Jun, Jul, Aug → winter
  if (month <= 7) return "winter";
  // Sep, Oct, Nov → spring
  return "spring";
}

export function seasonLabel(season: Season): string {
  return SEASON_CONFIG[season].label;
}

export function seasonTagline(season: Season): string {
  return SEASON_CONFIG[season].tagline;
}
