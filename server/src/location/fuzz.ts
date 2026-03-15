// Privacy guarantee: all coordinates are fuzzed ±50 m before being stored or broadcast.
// The client sends exact GPS; this module is the only place coordinates are transformed.

const FUZZ_METRES = 50;
const METRES_PER_DEGREE = 111_320; // approximate at equator; good enough for ±50 m

/**
 * Apply a random ±50 m offset to a coordinate pair.
 * Longitude scaling accounts for meridian convergence at higher latitudes.
 */
export function fuzzCoords(
  lat: number,
  lng: number,
): { latitude: number; longitude: number } {
  const latDelta =
    (Math.random() * 2 - 1) * (FUZZ_METRES / METRES_PER_DEGREE);

  const lngDelta =
    (Math.random() * 2 - 1) *
    (FUZZ_METRES / (METRES_PER_DEGREE * Math.cos((lat * Math.PI) / 180)));

  return { latitude: lat + latDelta, longitude: lng + lngDelta };
}
