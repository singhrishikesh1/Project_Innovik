# SAHAYAK: AI-Powered Disaster Intelligence & Emergency Command Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20TailwindCSS-sky.svg)](frontend)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20Turf.js-emerald.svg)](backend)
[![AI Engine](https://img.shields.io/badge/AI%20Microservice-Python%20FastAPI%20%7C%20VajraWatch-purple.svg)](ai-service)
[![GIS Engine](https://img.shields.io/badge/GIS-PostGIS%20%2B%20Leaflet%2024%20Layers-blue.svg)](database)

> **"From Early Warning to Last-Mile Response to Post-Disaster Intelligence."**

SAHAYAK is a full-lifecycle emergency management command-and-control platform designed for disaster management authorities (NDMA, SDMAs, FEMA, UN OCHA), humanitarian agencies, and first responders. It integrates **VajraWatch** as its specialized prediction and early warning engine, delivering deterministic hazard scoring, adversarial skeptical verification, real-time 24-layer GIS mapping, dynamic evacuation routing around active road hazards, mathematical inventory conservation, and automated post-disaster PDF report generation.

---

## Key Pillars & 

1. **SAHAYAK Deterministic 8-Feature Prediction Engine**:
   - Model-driven numerical hazard scoring (0–100) based on precipitation intensity/accumulation, river stage gauge height, terrain slope and soil saturation, Sentinel-2 NDWI anomalies, Sentinel-1 SAR backscatter shift, glacial lake extent expansion, seismic PGA, and temperature isotherms.
   - Numerical scores are 100% computed via calibrated physical algorithms—AI agents provide explainability and decision support without hallucinating statistics.
2. **Skeptic Verification Agent**:
   - Cross-audits sensor telemetry across Doppler radar, hydrological stream gauges, and synthetic aperture radar (SAR) passes to detect isolated gauge anomalies and calculate formal false-alarm probabilities before alert escalation.
3. **Real-Time 24-Layer GIS Command Map**:
   - Interactive cartographic mapping centered on the high-vulnerability Chamoli / Alaknanda River Basin.
   - Toggleable layers: disaster zones, risk buffers, flooded areas, landslide zones, affected villages, population density, shelters, hospitals, rescue teams, ambulances, police, warehouses, moving logistics trucks, road networks, blocked roads, safe roads, evacuation vectors, infrastructure assets, and IoT hydrological sensors.
4. **Dynamic Graph Evacuation Routing**:
   - Continuous path optimization calculating safe corridors from inundated settlements to designated shelters.
   - Instantaneous rerouting: when an arterial highway (e.g. NH-58) is blocked by a landslide or debris flow, the routing engine automatically recalculates transit via the High-Ground Ridge Bypass Road.
5. **Strict Mathematical Inventory Conservation**:
   - Depot inventory ledger enforces zero phantom stock:
     $$\text{Total} = \text{Available} + \text{Allocated} + \text{In Transit} + \text{Delivered} + \text{Consumed} + \text{Damaged}$$
6. **20-Step Interactive Demo Orchestrator**:
   - Embedded top-bar player supporting step-by-step navigation, variable auto-play speeds, and direct jump to any of the 20 hackathon demonstration milestones.
7. **Post-Disaster Forensics & 1-Click PDF Incident Report**:
   - 15-section structured post-disaster workspace analyzing infrastructure losses, response performance indicators (89.4/100), logistics delays, and AI lessons learned.
   - Generates a cryptographically sealed, multi-page official PDF Disaster Report with cover page, damage catalogs, and administrative signatures.
8. **Fault-Tolerant Zero-Crash Architecture**:
   - Self-contained offline fallback cache and transactional memory store ensures the entire prototype never crashes or shows a blank screen even when external APIs or databases are unavailable.

---

## Monorepo Architecture

```
/
├── frontend/          # React 18, TypeScript, Tailwind CSS, Leaflet, Recharts, jsPDF
├── backend/           # Node.js, Express, TypeScript, Turf.js spatial calculation engine
├── ai-service/        # Python FastAPI microservice with 8-feature engine & Skeptic agent
├── shared/            # Common TypeScript models, schemas, and enums
├── database/          # PostgreSQL + PostGIS schema with foreign keys and spatial indexes
├── docs/              # Architectural specification & Hackathon Jury Demo Script
├── docker-compose.yml # Multi-container production deployment manifest
└── README.md          # Project documentation
```

---

## Quickstart Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.9+) [Optional for microservice; backend includes zero-dependency fallback]
- Docker & Docker Compose [Optional for containerized run]

### 1. Local Development Setup

#### Start Backend Service
```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:5001
```

#### Start Frontend Application
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

#### Start Python AI Service (Optional)
```bash
cd ai-service
pip install -r requirements.txt
python main.py
# AI Microservice runs on http://localhost:8001
```

### 2. Docker Multi-Container Deployment
```bash
docker-compose up --build
```
Access the application at `http://localhost:3000`.

---

## 20-Step Hackathon Demonstration 

Use the embedded **Simulation Control Bar** at the top of the interface to step through the complete scenario:
| Step | Milestone Title | Key System Action |
| :--- | :--- | :--- |
| **01** | **Normal Baseline** | Monitoring baseline hydrology (River stage 2.1m, Risk 18.2/100 NORMAL). |
| **02** | **Cloudburst Pre-Alert** | IMD Doppler radar flags convective cloudburst cell (48 mm/hr). |
| **03** | **Hydro Telemetry Surge** | River gauge 08-ALAK records rapid surge to 3.9m (approaching danger mark). |
| **04** | **VajraWatch High Risk** | 8-feature deterministic risk score jumps to 78.6/100 (HIGH RISK). |
| **05** | **AI Risk Explanation** | AI engine synthesizes contributing environmental drivers and SAR saturation. |
| **06** | **Skeptic Verification** | Skeptic Agent audits multi-sensor convergence; confirms false-alarm probability = 3.8%. |
| **07** | **Verified Public Warning** | District Magistrate authorizes Critical Warning; sirens & local-language audio alerts trigger. |
| **08** | **PostGIS Impact Analysis** | Spatial polygon identifies 14,200 population, 6 villages, 4 bridges in flood zone. |
| **09** | **Resource Demand Prediction**| AI-assisted estimator applies SPHERE standards to predict food, water, and boat needs. |
| **10** | **Priority Allocation Engine** | Allocation engine ranks vulnerable shelters by human life and trauma priority. |
| **11** | **Logistics Fleet Dispatch** | Trucks TR-04 and TR-07 dispatched with emergency rations under police escort. |
| **12** | **Tactical GIS Tracking** | Live map tracks moving convoy, emergency ambulances, and NDRF rescue boats. |
| **13** | **Emergency on NH-58** | Landslide debris blocks NH-58 at Km 42 near Birahi choke point! |
| **14** | **Dynamic Route Recalculation**| Routing engine immediately diverts evacuation via High-Ground Ridge Bypass (+8 min ETA). |
| **15** | **Shelter Influx Recorded** | Evacuation progress reaches 85%; Shelter Alaknanda-1 houses 1,020 displaced citizens. |
| **16** | **Relief Shipments Delivered** | Convoys complete delivery; shelter reserves and inventory update with strict conservation. |
| **17** | **Flood Crest Passed** | River levels recede below danger threshold; Incident Commander officially closes incident. |
| **18** | **Post-Disaster Workspace** | Post-disaster analysis workspace generates 15 evaluation sections from structured logs. |
| **19** | **Damage Audit & KPIs** | Damage catalog finalized (INR 1.81 Cr loss); Response efficiency rated 89.4/100. |
| **20** | **1-Click PDF Report Export**| User clicks "Download Official PDF Report" to export a 20-section printable document. |

---

## Automated Verification 

Run the complete backend automated test suite verifying risk calculation, skeptic validation, spatial queries, and inventory conservation:
```bash

npm run build && node dist/backend/src/tests
