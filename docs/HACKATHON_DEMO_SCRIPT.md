# International Hackathon Demonstration Script (20-Step Walkthrough)

## The Core Product Story:
> **"From Early Warning to Last-Mile Response to Post-Disaster Intelligence."**

---

### Step-by-Step Jury Demonstration Sequence:

#### 1. Command Center Baseline (Step 1)
- **Action**: Open `Command Center`. Point out the dark tactical EOC design.
- **Narrative**: *"We begin with normal baseline conditions in the Chamoli Alaknanda basin. River stage is 2.1m, weather radar is clear, and the VajraWatch deterministic risk score is 18.2/100 (NORMAL)."*

#### 2. Cloudburst Ingest (Steps 2 & 3)
- **Action**: Click `Next Step` in the top simulation controller.
- **Narrative**: *"Doppler radar flags convective cloudburst cells forming upstream. Within 20 minutes, CWC telemetry gauge 08-ALAK records a rapid surge to 3.9m, climbing towards the danger mark."*

#### 3. VajraWatch 8-Feature Risk Engine & Skeptic Verification (Steps 4, 5 & 6)
- **Action**: Navigate to `VajraWatch Risk Engine`. Show the 78.6/100 score jump and feature contribution breakdown.
- **Narrative**: *"The deterministic engine computes an elevated hazard score of 78.6/100. Crucially, the LLM does not hallucinate numbers—it provides explainability. Then, our Skeptic Verification Agent independently audits the telemetry across radar, river stage, and Sentinel-1 SAR coherence. It confirms no isolated sensor malfunction exists (False Alarm Probability = 3.8%)."*

#### 4. Critical Early Warning & Local Voice Alert (Step 7)
- **Action**: Switch to `Early Warning Center`. Click `Play Hindi Siren Alert` or `English Audio Alert`.
- **Narrative**: *"With high confidence verified, the District Magistrate authorizes a Critical Warning bulletin. Sirens sound across riverside wards, and synthesized local-language audio alerts transmit directly to mobile networks."*

#### 5. PostGIS Impact & Resource Demand Estimation (Steps 8, 9 & 10)
- **Action**: Switch to `PostGIS Impact Assessment` and `Priority Allocation Engine`.
- **Narrative**: *"PostGIS spatial intersection immediately identifies 14,200 residents, 6 villages, 4 bridges, and 18km of highway in the flood zone. The AI demand estimator applies SPHERE humanitarian standards, and the allocation engine ranks shelters by human-life vulnerability."*

#### 6. Live Fleet Logistics & Tactical Map (Steps 11 & 12)
- **Action**: Open `Live GIS Map (24 Layers)`. Toggle layers and show moving convoy trucks TR-04 and TR-07.
- **Narrative**: *"Convoys are dispatched under police escort. The 24-layer tactical GIS map tracks relief trucks, ambulances, and NDRF swift-water rescue teams in real time."*

#### 7. Obstacle on NH-58 & Dynamic Evacuation Rerouting (Steps 13 & 14)
- **Action**: Advance to Step 13 or click `Simulate Landslide on NH-58` in `Evacuation Planner`.
- **Narrative**: *"Emergency! A sudden 400m³ landslide blocks NH-58 at Km 42 near Birahi. The primary evacuation route is severed. Instantly, our dynamic routing engine recalculates safe transit via the High-Ground Ridge Bypass Road, updating ETAs and diverting evacuees away from the debris choke point."*

#### 8. Shelter Influx & Relief Delivery (Steps 15 & 16)
- **Action**: Check `Shelter Management`. Show occupancy rising to 85% and supply reserves updating.
- **Narrative**: *"Evacuees arrive safely at Shelter Alaknanda-1. Convoys deliver food and water, updating inventory with strict mathematical conservation."*

#### 9. Flood Crest Recedes & Incident Closed (Step 17)
- **Action**: Advance to Step 17.
- **Narrative**: *"River levels crest at 4.8m and recede below danger threshold. The Incident Commander closes the emergency response phase."*

#### 10. Post-Disaster Analysis & 1-Click PDF Report (Steps 18, 19 & 20)
- **Action**: Open `Post-Disaster Analysis`, view the 15 evaluation sections, and click `Generate Full Official PDF Report`.
- **Narrative**: *"The platform automatically transitions to post-disaster forensics. It tallies asset damage (INR 1.81 Cr), evaluates response KPIs (91.8/100), and outputs AI lessons learned. Finally, with one click, we export an official, cryptographically sealed 20-section PDF Disaster Report ready for executive leadership."*
