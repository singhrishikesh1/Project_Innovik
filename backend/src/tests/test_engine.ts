import { VajraWatchRiskEngine } from '../engines/riskEngine';
import { SkepticVerificationAgent } from '../engines/skepticAgent';
import { SpatialEngine } from '../engines/spatialEngine';
import { simulationStore } from '../simulation/simulationOrchestrator';
import { sheltersData } from '../data/seedData';

console.log('----------------------------------------------------');
console.log('RUNNING VAJRASHIELD AUTOMATED VERIFICATION SUITE');
console.log('----------------------------------------------------');

// Test 1: Deterministic Risk Engine
console.log('\n[TEST 1] VajraWatch Deterministic 8-Feature Engine:');
const baselineRisk = VajraWatchRiskEngine.calculateDeterministicRisk({
  precipitation_mm_hr: 5.0,
  precipitation_48h_accum_mm: 15.0,
  river_gauge_height_m: 2.1,
  river_danger_level_m: 4.2,
  slope_angle_deg: 25.0,
  soil_saturation_pct: 35.0,
  ndwi_anomaly_delta: 0.05,
  sar_backscatter_delta_db: -0.5,
  lake_area_expansion_pct: 2.0,
  seismic_pga_g: 0.01,
  temperature_anomaly_c: 0.5
});
console.log(`Baseline Score: ${baselineRisk.score} (${baselineRisk.riskLevel})`);
if (baselineRisk.score >= 20 || baselineRisk.riskLevel !== 'NORMAL') {
  throw new Error('Baseline risk score should be NORMAL < 20');
}

const extremeRisk = VajraWatchRiskEngine.calculateDeterministicRisk({
  precipitation_mm_hr: 65.0,
  precipitation_48h_accum_mm: 220.0,
  river_gauge_height_m: 4.8,
  river_danger_level_m: 4.2,
  slope_angle_deg: 38.0,
  soil_saturation_pct: 92.0,
  ndwi_anomaly_delta: 0.45,
  sar_backscatter_delta_db: -5.2,
  lake_area_expansion_pct: 32.0,
  seismic_pga_g: 0.06,
  temperature_anomaly_c: 4.2
});
console.log(`Extreme Score: ${extremeRisk.score} (${extremeRisk.riskLevel})`);
if (extremeRisk.score < 75 || extremeRisk.riskLevel !== 'HIGH_RISK' && extremeRisk.riskLevel !== 'CRITICAL') {
  throw new Error('Extreme risk score should be HIGH_RISK or CRITICAL >= 75');
}
console.log('✓ Risk Engine Determinism & Range verified.');

// Test 2: Skeptic Verification Agent
console.log('\n[TEST 2] Skeptic Verification Agent Cross-Sensor Audit:');
const skepticPassed = SkepticVerificationAgent.verifyPrediction(
  extremeRisk.score,
  {
    precipitation_mm_hr: 65.0,
    precipitation_48h_accum_mm: 220.0,
    river_gauge_height_m: 4.8,
    river_danger_level_m: 4.2,
    slope_angle_deg: 38.0,
    soil_saturation_pct: 92.0,
    ndwi_anomaly_delta: 0.45,
    sar_backscatter_delta_db: -5.2,
    lake_area_expansion_pct: 32.0,
    seismic_pga_g: 0.06,
    temperature_anomaly_c: 4.2
  },
  { radar: 'ONLINE', hydro: 'ONLINE', satellite: 'ONLINE' }
);
console.log(`Skeptic Validated: ${skepticPassed.isVerified}, Rec: ${skepticPassed.recommendation}, False Alarm: ${(skepticPassed.falseAlarmProbability * 100).toFixed(1)}%`);
if (!skepticPassed.isVerified || skepticPassed.recommendation !== 'PROCEED_WITH_WARNING') {
  throw new Error('Skeptic Agent should verify corroborated multi-modal telemetry');
}

// Anomaly check: Sensor contradiction
const skepticAnomaly = SkepticVerificationAgent.verifyPrediction(
  78.0,
  {
    precipitation_mm_hr: 2.0, // Low rainfall
    precipitation_48h_accum_mm: 5.0,
    river_gauge_height_m: 5.5, // Huge surge without rain
    river_danger_level_m: 4.2,
    slope_angle_deg: 30.0,
    soil_saturation_pct: 40.0,
    ndwi_anomaly_delta: 0.0,
    sar_backscatter_delta_db: -4.0, // Satellite shows water but no rain
    lake_area_expansion_pct: 0.0,
    seismic_pga_g: 0.01,
    temperature_anomaly_c: 0.0
  },
  { radar: 'ONLINE', hydro: 'ONLINE', satellite: 'ONLINE' }
);
console.log(`Contradiction Check - Anomalies: ${skepticAnomaly.anomaliesDetected.length}, Rec: ${skepticAnomaly.recommendation}`);
if (skepticAnomaly.isVerified) {
  throw new Error('Skeptic Agent should challenge uncorroborated anomaly');
}
console.log('✓ Skeptic Agent anomaly detection and verification passed.');

// Test 3: Spatial Engine
console.log('\n[TEST 3] Spatial Engine GIS Analysis:');
const chamoliCenter = { lat: 30.4128, lng: 79.3242 };
const nearestShelters = SpatialEngine.findNearestShelters(chamoliCenter, sheltersData, 2);
console.log(`Nearest Shelter: ${nearestShelters[0].shelter.name} (${nearestShelters[0].distanceKm} km)`);
if (nearestShelters[0].distanceKm > 5.0) {
  throw new Error('Nearest shelter distance calculation error');
}
console.log('✓ Spatial Engine distance and ranking verified.');

// Test 4: Simulation Orchestrator 20-step Trajectory
console.log('\n[TEST 4] 20-Step Simulation Trajectory & Inventory Conservation:');
simulationStore.reset();
for (let step = 1; step <= 20; step++) {
  simulationStore.applyStep(step);
  const info = simulationStore.getStepDescription(step);

  // Check inventory conservation: Available + Allocated + InTransit + Delivered = Total
  for (const res of simulationStore.resources) {
    const sum = res.availableQuantity + res.allocatedQuantity + res.inTransitQuantity + res.deliveredQuantity + res.consumedQuantity + res.damagedQuantity;
    if (sum !== res.quantity) {
      throw new Error(`Inventory Conservation Violated in Step ${step} for ${res.name}: Sum ${sum} !== Total ${res.quantity}`);
    }
  }

  // Check Step 13 blockage behavior
  if (step === 13) {
    if (simulationStore.evacuationRoutes[0].status !== 'BLOCKED') {
      throw new Error('Step 13 must trigger road blockage on NH-58');
    }
  }
}
console.log('✓ All 20 Simulation steps executed with strict inventory conservation!');

console.log('\n====================================================');
console.log('ALL VERIFICATION SUITE TESTS PASSED (100% SUCCESS)');
console.log('====================================================');
