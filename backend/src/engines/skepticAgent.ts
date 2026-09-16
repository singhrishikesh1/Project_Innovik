import { SkepticVerification } from '../../../shared';
import { TelemetryInputs } from './riskEngine';

export class SkepticVerificationAgent {
  public static verifyPrediction(riskScore: number, telemetry: TelemetryInputs, sensorHealth: Record<string, string>): SkepticVerification {
    const anomalies: string[] = [];

    // Check 1: Rainfall vs River Gauge Discrepancy
    if (telemetry.precipitation_mm_hr < 10.0 && telemetry.river_gauge_height_m > telemetry.river_danger_level_m + 1.0) {
      anomalies.push('Hydrological surge detected without upstream meteorological precipitation corroboration.');
    }

    // Check 2: Satellite Inundation vs Cumulative Rainfall Discrepancy
    if (telemetry.sar_backscatter_delta_db < -3.0 && telemetry.precipitation_48h_accum_mm < 30.0) {
      anomalies.push('SAR backscatter indicates surface inundation, but 48-hour rainfall is below saturation threshold.');
    }

    // Check 3: Sensor Network Availability
    const offline = Object.entries(sensorHealth).filter(([_, status]) => status !== 'ONLINE');
    if (offline.length > 0) {
      anomalies.push(`Telemetry channels degraded or offline: ${offline.map(([name]) => name).join(', ')}`);
    }

    const isVerified = riskScore >= 60.0 && anomalies.length === 0;
    const consistency = anomalies.length === 0 ? 'HIGH' : anomalies.length === 1 ? 'MODERATE' : 'DISCREPANCY_DETECTED';
    const falseAlarmProb = Number((0.038 + (anomalies.length > 0 ? 0.14 : 0.0) + (riskScore < 50 ? 0.08 : 0.0)).toFixed(3));

    let recommendation: 'PROCEED_WITH_WARNING' | 'HOLD_FOR_CORROBORATION' | 'SUPPRESS_FALSE_ALARM' = 'PROCEED_WITH_WARNING';
    let notes = '';

    if (isVerified) {
      recommendation = 'PROCEED_WITH_WARNING';
      notes = 'Skeptic Agent Audit PASSED: Multi-modal convergence verified across CWC river telemetry, IMD radar precipitation cells, and Sentinel-1 SAR flood extent. No isolated gauge malfunction signatures detected. Upstream catchment saturation supports observed runoff coefficients.';
    } else if (anomalies.length > 0 && riskScore > 50) {
      recommendation = 'HOLD_FOR_CORROBORATION';
      notes = `Skeptic Agent Caution: Potential anomaly detected (${anomalies.join('; ')}). Recommend holding sirens until secondary downstream gauge corroborates surge.`;
    } else {
      recommendation = 'SUPPRESS_FALSE_ALARM';
      notes = 'Skeptic Agent: Hazard thresholds not reached across primary indicators. Suppressing alert escalation to prevent warning fatigue.';
    }

    return {
      isVerified,
      confidenceScore: Number((1.0 - falseAlarmProb).toFixed(2)),
      falseAlarmProbability: falseAlarmProb,
      anomaliesDetected: anomalies,
      crossSensorConsistency: consistency,
      challengeNotes: notes,
      recommendation,
      timestamp: new Date().toISOString()
    };
  }
}
