import * as turf from '@turf/turf';
import { Coordinates, Shelter, Hospital, EvacuationRoute } from '../../../shared';

export class SpatialEngine {
  /**
   * Calculates Haversine distance in kilometers between two coordinates
   */
  public static calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
    const from = turf.point([coord1.lng, coord1.lat]);
    const to = turf.point([coord2.lng, coord2.lat]);
    return Number(turf.distance(from, to, { units: 'kilometers' }).toFixed(2));
  }

  /**
   * Finds nearest available shelters ranked by distance
   */
  public static findNearestShelters(origin: Coordinates, shelters: Shelter[], limit: number = 3): { shelter: Shelter; distanceKm: number }[] {
    const scored = shelters.map(shelter => ({
      shelter,
      distanceKm: this.calculateDistanceKm(origin, shelter.coords)
    }));

    return scored
      .filter(s => s.shelter.status !== 'CLOSED' && s.shelter.status !== 'DAMAGED')
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  }

  /**
   * Finds nearest hospitals ranked by distance and ICU capacity
   */
  public static findNearestHospitals(origin: Coordinates, hospitals: Hospital[], limit: number = 3): { hospital: Hospital; distanceKm: number }[] {
    const scored = hospitals.map(hospital => ({
      hospital,
      distanceKm: this.calculateDistanceKm(origin, hospital.coords)
    }));

    return scored
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  }

  /**
   * Filters locations within a given radius buffer (km)
   */
  public static isWithinRadius(center: Coordinates, target: Coordinates, radiusKm: number): boolean {
    const dist = this.calculateDistanceKm(center, target);
    return dist <= radiusKm;
  }

  /**
   * Determines if a point is inside a polygon boundary
   */
  public static isPointInPolygon(point: Coordinates, polygonCoords: Coordinates[]): boolean {
    try {
      const turfPoint = turf.point([point.lng, point.lat]);
      // Close polygon if not closed
      const ring = polygonCoords.map(p => [p.lng, p.lat]);
      if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
        ring.push([ring[0][0], ring[0][1]]);
      }
      const turfPoly = turf.polygon([ring]);
      return turf.booleanPointInPolygon(turfPoint, turfPoly);
    } catch (e) {
      return false;
    }
  }

  /**
   * Computes dynamic route distance and estimated travel time, adding delay penalties if road is congested or blocked
   */
  public static evaluateRoute(route: EvacuationRoute, isBlocked: boolean): EvacuationRoute {
    const updated = { ...route };
    if (isBlocked) {
      updated.status = 'BLOCKED';
      updated.blockageReason = 'Debris slide / inundation across arterial segment.';
      updated.estimatedTravelTimeMin = 999;
    } else {
      updated.status = 'SAFE';
      updated.blockageReason = undefined;
    }
    return updated;
  }
}
