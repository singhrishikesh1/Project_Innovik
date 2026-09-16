# VajraShield: Architectural Specification

## System Overview
VajraShield is an enterprise-grade Emergency Operations Center (EOC) command-and-control platform designed to span the full 18-stage disaster lifecycle:
1. Pre-event observation and early prediction
2. Deterministic 8-feature hazard risk scoring
3. Independent Skeptic Verification Agent audit (false-alarm suppression)
4. PostGIS geospatial impact assessment (inundation buffers, cadastral asset overlays)
5. Disaster preparedness & early warning dissemination (sirens, push notifications, voice synthesis)
6. Dynamic evacuation route planning with real-time road blockage rerouting
7. Resource demand estimation (Sphere standards)
8. Priority allocation engine (human life & trauma medical priority)
9. Last-mile fleet tracking & logistics coordination
10. Shelter capacity & critical utility management
11. Hospital trauma readiness & ICU staging
12. Multi-agency responder task management (NDRF / SDRF / Army)
13. Incident command timeline logging
14. Post-disaster forensic damage inspection
15. Resource consumption analysis (Required vs Available vs Delivered vs Consumed)
16. Response performance KPI evaluation (Platform Response Performance Indicator)
17. Historical GraphRAG disaster comparison (Kedarnath, Chamoli, Sikkim, Wayanad)
18. Automated post-disaster PDF report generation (Cover + 20 structured sections)

---

## 1. Prediction & Skeptic Verification Architecture

### VajraWatch 8-Feature Risk Engine
The risk engine computes a deterministic score $S \in [0, 100]$ using physically calibrated non-linear response functions:
$$S = \sum_{i=1}^8 w_i \times f_i(\text{telemetry}_i)$$

| Feature | Key | Weight | Unit | Primary Data Source |
| :--- | :--- | :--- | :--- | :--- |
| **Precipitation Intensity & Accumulation** | `precip` | 25% | $mm$ | IMD Doppler Weather Radar & AWS Network |
| **River Gauge vs Danger Threshold** | `hydro` | 20% | $m$ | Central Water Commission Telemetry Station 08-ALAK |
| **Slope Angle & Soil Saturation** | `terrain` | 15% | $\% / ^\circ$ | NASA SRTM 30m DEM + SMAP Soil Moisture Probe |
| **Sentinel-2 NDWI Spectral Delta** | `ndwi` | 10% | $\Delta$ NDWI | Copernicus Sentinel-2 MSI Multi-Spectral |
| **Sentinel-1 SAR Backscatter Shift** | `sar` | 10% | $dB$ | Copernicus Sentinel-1 C-Band SAR |
| **Glacial Lake Extent Expansion** | `lake` | 8% | $\%$ | Cryosphere Satellite Image Processing Pipeline |
| **Seismic Ground Acceleration** | `seismic` | 7% | $g$ | National Center for Seismology Broadband Network |
| **Temperature Anomaly & Snowmelt** | `temp` | 5% | $^\circ C$ | ECMWF ERA5 Reanalysis + High-Altitude AWS |

### Skeptic Verification Agent
The Skeptic Agent acts as an independent adversarial auditor to prevent false alarms:
- Compares hydrological surges against upstream rain gauges (flags anomalous gauge spikes).
- Checks satellite SAR water detection against cumulative rainfall.
- Validates sensor health across the telemetry network.
- Computes formal False Alarm Probability $P(\text{False Alarm}) \in [0, 1]$ before alert escalation.

---

## 2. Geospatial & Evacuation Routing Engine

- **Spatial Calculations**: Powered by Turf.js with standard WGS84 coordinates.
- **Layers**: 24 distinct toggleable operational layers including floodplains, shelters, hospitals, vehicles, blocked roads, and rescue units.
- **Dynamic Rerouting**:
  When a road segment is blocked (e.g. NH-58 obstructed by debris flow at Km 42), the graph router penalizes the edge weight and recalculates safe evacuation routes via high-ground corridors (e.g. High-Ground Ridge Bypass Road).

---

## 3. Strict Inventory Conservation Ledger
All resources satisfy the mathematical conservation invariant:
$$\text{Total} = \text{Available} + \text{Allocated} + \text{In Transit} + \text{Delivered} + \text{Consumed} + \text{Damaged}$$
Shipment lifecycles transition deterministically:
$$\text{PLANNED} \to \text{DISPATCHED} \to \text{IN\_TRANSIT} \to \text{DELIVERED}$$
Upon delivery confirmation at a designated shelter, the shelter's supply reserves increment accordingly.

---

## 4. Security & Role-Based Access Control (RBAC)
The system enforces 8 distinct operational roles:
1. `ADMIN`: Full configuration and system overrides.
2. `DISASTER_MANAGER`: Official alert authorization and evacuation approval.
3. `FIELD_COORDINATOR`: Road status toggles and tactical rescue assignments.
4. `RESOURCE_MANAGER`: Depot inventory and supply allocation.
5. `LOGISTICS_COORDINATOR`: Fleet tracking and convoy dispatch.
6. `MEDICAL_COORDINATOR`: Trauma bed and hospital triage management.
7. `ANALYST`: Telemetry and sensor data review.
8. `VIEWER`: Read-only observation profile.

Every mutation writes an immutable audit record to the Audit Log.
