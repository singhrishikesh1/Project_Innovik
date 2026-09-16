import { RiskAssessment, RiskFeature, DisasterSeverity } from '../../../shared';

export interface TelemetryInputs {
  precipitation_mm_hr: number;
  precipitation_48h_accum_mm: number;
  river_gauge_height_m: number;
  river_danger_level_m: number;
  slope_angle_deg: number;
  soil_saturation_pct: number;
  ndwi_anomaly_delta: number;
  sar_backscatter_delta_db: number;
  lake_area_expansion_pct: number;
  seismic_pga_g: number;
  temperature_anomaly_c: number;
}

export class VajraWatchRiskEngine {
  public static calculateDeterministicRisk(inputs: TelemetryInputs): RiskAssessment {
    // 1. Precipitation (25% weight)
    const precipRatio = Math.min(inputs.precipitation_mm_hr / 70.0, 1.0) * 0.5 + Math.min(inputs.precipitation_48h_accum_mm / 250.0, 1.0) * 0.5;
    const precipScore = precipRatio * 100.0;

    // 2. Hydrological Stage (20% weight)
    const gaugeDiff = inputs.river_gauge_height_m - inputs.river_danger_level_m;
    let hydroScore = 10.0;
    if (gaugeDiff <= -1.0) {
      hydroScore = 10.0;
    } else if (gaugeDiff <= 0) {
      hydroScore = 30.0 + ((gaugeDiff + 1.0) * 30.0);
    } else {
      hydroScore = Math.min(60.0 + (gaugeDiff * 40.0), 100.0);
    }

    // 3. Terrain Slope & Pore Saturation (15% weight)
    const slopeFactor = Math.min(inputs.slope_angle_deg / 45.0, 1.0);
    const satFactor = Math.min(inputs.soil_saturation_pct / 100.0, 1.0);
    const terrainScore = (0.4 * slopeFactor + 0.6 * satFactor) * 100.0;

    // 4. NDWI Anomaly (10% weight)
    const ndwiScore = Math.min(Math.max(inputs.ndwi_anomaly_delta / 0.5, 0.0), 1.0) * 100.0;

    // 5. SAR Backscatter Inundation Shift (10% weight)
    const sarScore = Math.min(Math.abs(Math.min(inputs.sar_backscatter_delta_db, 0.0)) / 6.0, 1.0) * 100.0;

    // 6. Glacial Lake Expansion (8% weight)
    const lakeScore = Math.min(inputs.lake_area_expansion_pct / 40.0, 1.0) * 100.0;

    // 7. Seismic Acceleration (7% weight)
    const seismicScore = Math.min(inputs.seismic_pga_g / 0.15, 1.0) * 100.0;

    // 8. Thermal Snowmelt Anomaly (5% weight)
    const tempScore = Math.min(Math.max(inputs.temperature_anomaly_c / 6.0, 0.0), 1.0) * 100.0;

    const weights = {
      precip: 0.25,
      hydro: 0.20,
      terrain: 0.15,
      ndwi: 0.10,
      sar: 0.10,
      lake: 0.08,
      seismic: 0.07,
      temp: 0.05
    };

    const rawScore = (
      precipScore * weights.precip +
      hydroScore * weights.hydro +
      terrainScore * weights.terrain +
      ndwiScore * weights.ndwi +
      sarScore * weights.sar +
      lakeScore * weights.lake +
      seismicScore * weights.seismic +
      tempScore * weights.temp
    );

    const finalScore = Number(Math.min(Math.max(rawScore, 0.0), 100.0).toFixed(1));

    let severity: DisasterSeverity = 'NORMAL';
    if (finalScore < 20) severity = 'NORMAL';
    else if (finalScore < 40) severity = 'WATCH';
    else if (finalScore < 60) severity = 'ELEVATED';
    else if (finalScore < 80) severity = 'HIGH_RISK';
    else if (finalScore < 95) severity = 'CRITICAL';
    else severity = 'DISASTER_CONFIRMED';

    const features: RiskFeature[] = [
      {
        name: 'Precipitation Accumulation & Rate',
        key: 'precip',
        value: inputs.precipitation_48h_accum_mm,
        unit: 'mm',
        weight: weights.precip,
        contribution: Number((precipScore * weights.precip).toFixed(1)),
        description: `Intensity: ${inputs.precipitation_mm_hr} mm/hr, 48h Total: ${inputs.precipitation_48h_accum_mm} mm`,
        dataSource: 'IMD Doppler Weather Radar & AWS Network',
        status: precipScore > 75 ? 'CRITICAL' : precipScore > 50 ? 'HIGH' : 'NORMAL'
      },
      {
        name: 'River Gauge vs Danger Level',
        key: 'hydro',
        value: inputs.river_gauge_height_m,
        unit: 'm',
        weight: weights.hydro,
        contribution: Number((hydroScore * weights.hydro).toFixed(1)),
        description: `Stage: ${inputs.river_gauge_height_m}m against warning baseline ${inputs.river_danger_level_m}m`,
        dataSource: 'Central Water Commission Telemetry Gauge Station 08-ALAK',
        status: hydroScore > 75 ? 'CRITICAL' : hydroScore > 50 ? 'HIGH' : 'NORMAL'
      },
      {
        name: 'Slope Angle & Soil Moisture Saturation',
        key: 'terrain',
        value: inputs.soil_saturation_pct,
        unit: '%',
        weight: weights.terrain,
        contribution: Number((terrainScore * weights.terrain).toFixed(1)),
        description: `Catchment slope ${inputs.slope_angle_deg}° with ${inputs.soil_saturation_pct}% pore saturation`,
        dataSource: 'NASA SRTM 30m DEM + SMAP Surface Soil Moisture',
        status: terrainScore > 60 ? 'HIGH' : 'NORMAL'
      },
      {
        name: 'Sentinel-2 NDWI Spectral Anomaly',
        key: 'ndwi',
        value: inputs.ndwi_anomaly_delta,
        unit: 'Δ NDWI',
        weight: weights.ndwi,
        contribution: Number((ndwiScore * weights.ndwi).toFixed(1)),
        description: `Positive surface water reflection shift of +${inputs.ndwi_anomaly_delta}`,
        dataSource: 'Copernicus Sentinel-2 MSI Multi-Spectral',
        status: ndwiScore > 60 ? 'HIGH' : 'NORMAL'
      },
      {
        name: 'Sentinel-1 SAR Backscatter Shift',
        key: 'sar',
        value: inputs.sar_backscatter_delta_db,
        unit: 'dB',
        weight: weights.sar,
        contribution: Number((sarScore * weights.sar).toFixed(1)),
        description: `Specular reflection attenuation: ${inputs.sar_backscatter_delta_db} dB`,
        dataSource: 'Copernicus Sentinel-1 C-band Synthetic Aperture Radar',
        status: sarScore > 70 ? 'CRITICAL' : 'NORMAL'
      },
      {
        name: 'Glacial Lake Extent Expansion',
        key: 'lake',
        value: inputs.lake_area_expansion_pct,
        unit: '%',
        weight: weights.lake,
        contribution: Number((lakeScore * weights.lake).toFixed(1)),
        description: `Proglacial waterbody area expanded by ${inputs.lake_area_expansion_pct}%`,
        dataSource: 'VajraWatch Cryosphere Satellite Suite',
        status: lakeScore > 60 ? 'HIGH' : 'NORMAL'
      },
      {
        name: 'Seismic Ground Acceleration',
        key: 'seismic',
        value: inputs.seismic_pga_g,
        unit: 'g',
        weight: weights.seismic,
        contribution: Number((seismicScore * weights.seismic).toFixed(1)),
        description: `Micro-tremor ground acceleration detected: ${inputs.seismic_pga_g}g`,
        dataSource: 'National Center for Seismology Broadband Network',
        status: 'NORMAL'
      },
      {
        name: 'Temperature Anomaly & Snowmelt',
        key: 'temp',
        value: inputs.temperature_anomaly_c,
        unit: '°C',
        weight: weights.temp,
        contribution: Number((tempScore * weights.temp).toFixed(1)),
        description: `+${inputs.temperature_anomaly_c}°C above seasonal isotherm promoting snowmelt`,
        dataSource: 'ECMWF ERA5 Reanalysis',
        status: 'NORMAL'
      }
    ];

    const contributingFactors: string[] = [];
    if (precipScore > 60) {
      contributingFactors.push(`Excessive rainfall accumulation (${inputs.precipitation_48h_accum_mm} mm in 48h) exceeding soil drainage`);
    }
    if (hydroScore > 60) {
      contributingFactors.push(`River stage (${inputs.river_gauge_height_m}m) cresting above danger baseline`);
    }
    if (terrainScore > 60) {
      contributingFactors.push(`Steep catchment slope (${inputs.slope_angle_deg}°) with high pore water saturation (${inputs.soil_saturation_pct}%)`);
    }
    if (sarScore > 60 || ndwiScore > 60) {
      contributingFactors.push('Radar SAR and optical satellite imagery confirming extensive surface water inundation');
    }

    const confidence = Number(Math.min(0.85 + (inputs.precipitation_48h_accum_mm > 100 ? 0.05 : 0) + (gaugeDiff > 0 ? 0.04 : 0), 0.94).toFixed(2));
    const targetLeadTimeHours = Number(Math.max(2.0, 18.0 - (finalScore * 0.14)).toFixed(1));

    return {
      score: finalScore,
      riskLevel: severity,
      confidence,
      features,
      contributingFactors,
      missingData: ['Snowpack water equivalent LiDAR (next scheduled satellite pass in 14 hours)'],
      dataSources: [
        'IMD Mussoorie Doppler Weather Radar',
        'Central Water Commission Telemetry Station 08-ALAK',
        'Copernicus Sentinel-1 SAR & Sentinel-2 MSI',
        'ISRO Bhuvan Geological Hazard Layer'
      ],
      timestamp: new Date().toISOString(),
      explanation: `VajraWatch deterministic hazard index computed at ${finalScore}/100 (${severity}). Primary drivers are heavy localized cloudburst precipitation (${inputs.precipitation_48h_accum_mm}mm) and river stage surge to ${inputs.river_gauge_height_m}m. SAR coherence confirms active valley floodplain saturation.`,
      targetLeadTimeHours,
      leadTimeLabel: `Estimated Warning Lead Time: ~${targetLeadTimeHours} Hours (Planning Target)`
    };
  }
}
