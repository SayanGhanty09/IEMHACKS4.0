// Phase 3: Haversine great-circle distance formula
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}

export interface PHC { name: string; lat: number; lon: number; phone: string; email: string; }

// Stub PHC list (replace with real data)
export const PHC_LIST: PHC[] = [
  { name: "PHC Kolkata Central",   lat: 22.5726, lon: 88.3639, phone: "+91-33-0001", email: "phc-kol@gov.in" },
  { name: "PHC Mumbai West",       lat: 19.0760, lon: 72.8777, phone: "+91-22-0002", email: "phc-mum@gov.in" },
  { name: "PHC Chennai South",     lat: 13.0827, lon: 80.2707, phone: "+91-44-0003", email: "phc-chn@gov.in" },
  { name: "PHC Delhi North",       lat: 28.7041, lon: 77.1025, phone: "+91-11-0004", email: "phc-del@gov.in" },
  { name: "PHC Hyderabad Central", lat: 17.3850, lon: 78.4867, phone: "+91-40-0005", email: "phc-hyd@gov.in" },
];

export function nearestPHC(lat: number, lon: number): (PHC & { distanceKm: number })[] {
  return PHC_LIST
    .map(p => ({ ...p, distanceKm: haversine(lat, lon, p.lat, p.lon) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
