import {
  DisasterEvent,
  RiskAssessment,
  SkepticVerification,
  ImpactAssessment,
  Resource,
  Shipment,
  Shelter,
  EvacuationRoute,
  IncidentTimelineEvent,
  ResponsePerformanceKPI,
  ResourceDemandEstimate,
  AllocationRecommendation
} from '../../../shared';

import {
  initialDisaster,
  initialRiskAssessment,
  initialSkepticVerification,
  initialImpactAssessment,
  sheltersData,
  resourcesData,
  shipmentsData,
  evacuationRoutesData,
  incidentTimelineData,
  initialPerformanceKPI
} from '../data/seedData';

export class SimulationStateStore {
  public currentStep: number = 1;
  public totalSteps: number = 20;
  public autoPlay: boolean = false;
  public activeDisaster: DisasterEvent;
  public riskAssessment: RiskAssessment;
  public skepticVerification: SkepticVerification;
  public impactAssessment: ImpactAssessment;
  public shelters: Shelter[];
  public resources: Resource[];
  public shipments: Shipment[];
  public evacuationRoutes: EvacuationRoute[];
  public timeline: IncidentTimelineEvent[];
  public performance: ResponsePerformanceKPI;
  public demandEstimates: ResourceDemandEstimate[];
  public allocations: AllocationRecommendation[];

  constructor() {
    this.activeDisaster = JSON.parse(JSON.stringify(initialDisaster));
    this.riskAssessment = JSON.parse(JSON.stringify(initialRiskAssessment));
    this.skepticVerification = JSON.parse(JSON.stringify(initialSkepticVerification));
    this.impactAssessment = JSON.parse(JSON.stringify(initialImpactAssessment));
    this.shelters = JSON.parse(JSON.stringify(sheltersData));
    this.resources = JSON.parse(JSON.stringify(resourcesData));
    this.shipments = JSON.parse(JSON.stringify(shipmentsData));
    this.evacuationRoutes = JSON.parse(JSON.stringify(evacuationRoutesData));
    this.timeline = JSON.parse(JSON.stringify(incidentTimelineData));
    this.performance = JSON.parse(JSON.stringify(initialPerformanceKPI));
    this.demandEstimates = this.computeDemandEstimates();
    this.allocations = this.computeAllocations();
    this.applyStep(1);
  }

  public computeDemandEstimates(): ResourceDemandEstimate[] {
    const pop = this.activeDisaster.affectedPopulation;
    return [
      {
        category: 'Food packets',
        required: 10000,
        available: 6200,
        allocated: 2800,
        delivered: 1000,
        shortage: 0,
        unit: 'packets',
        rationale: 'Sphere standard: 2 MRE meals per person/day for 5,000 high-vulnerability evacuees'
      },
      {
        category: 'Drinking water (L)',
        required: 25000,
        available: 16500,
        allocated: 6000,
        delivered: 2500,
        shortage: 0,
        unit: 'Liters',
        rationale: 'Minimum 4.5L/day potable water per evacuee for hydration and infant hygiene'
      },
      {
        category: 'First-aid kits',
        required: 150,
        available: 95,
        allocated: 35,
        delivered: 20,
        shortage: 0,
        unit: 'kits',
        rationale: '1 trauma first-aid kit per 100 individuals in emergency shelters'
      },
      {
        category: 'Boats',
        required: 12,
        available: 4,
        allocated: 4,
        delivered: 4,
        shortage: 0,
        unit: 'units',
        rationale: 'Swift-water Zodiac rescue boats for low-lying riverbank evacuations'
      },
      {
        category: 'Ambulances',
        required: 16,
        available: 8,
        allocated: 5,
        delivered: 3,
        shortage: 0,
        unit: 'vehicles',
        rationale: 'Advanced life support vehicles stationed at primary triage waypoints'
      },
      {
        category: 'Tents',
        required: 600,
        available: 420,
        allocated: 120,
        delivered: 60,
        shortage: 0,
        unit: 'tents',
        rationale: 'All-weather 6-person temporary family shelters'
      }
    ];
  }

  public computeAllocations(): AllocationRecommendation[] {
    return [
      {
        id: 'ALLOC-01',
        targetArea: 'Chamoli Sports Stadium Emergency Camp (SHELTER-02)',
        priorityScore: 94,
        priorityRationale: 'High human life concentration (920 evacuees present, 1,580 capacity) & main triage center',
        targetPopulation: 2500,
        category: 'Drinking water (L)',
        recommendedQuantity: 6000,
        sourceWarehouseId: 'Jal Sansthan Pipalkoti Depot',
        approved: true
      },
      {
        id: 'ALLOC-02',
        targetArea: 'Alaknanda Higher Secondary School Shelter (SHELTER-01)',
        priorityScore: 88,
        priorityRationale: 'High-density riverbank evacuee influx from inundated Ward 2 & Ward 4',
        targetPopulation: 1200,
        category: 'Food packets',
        recommendedQuantity: 2800,
        sourceWarehouseId: 'Chamoli Central Relief Warehouse',
        approved: true
      },
      {
        id: 'ALLOC-03',
        targetArea: 'Pipalkoti Community Hall Shelter (SHELTER-03)',
        priorityScore: 82,
        priorityRationale: 'Isolated terrain near highway choke point with medical supplies deficit',
        targetPopulation: 800,
        category: 'First-aid kits',
        recommendedQuantity: 35,
        sourceWarehouseId: 'Gopeshwar CMO Central Store',
        approved: true
      }
    ];
  }

  public reset(): void {
    this.currentStep = 1;
    this.autoPlay = false;
    this.activeDisaster = JSON.parse(JSON.stringify(initialDisaster));
    this.riskAssessment = JSON.parse(JSON.stringify(initialRiskAssessment));
    this.skepticVerification = JSON.parse(JSON.stringify(initialSkepticVerification));
    this.impactAssessment = JSON.parse(JSON.stringify(initialImpactAssessment));
    this.shelters = JSON.parse(JSON.stringify(sheltersData));
    this.resources = JSON.parse(JSON.stringify(resourcesData));
    this.shipments = JSON.parse(JSON.stringify(shipmentsData));
    this.evacuationRoutes = JSON.parse(JSON.stringify(evacuationRoutesData));
    this.timeline = JSON.parse(JSON.stringify(incidentTimelineData));
    this.performance = JSON.parse(JSON.stringify(initialPerformanceKPI));
    this.demandEstimates = this.computeDemandEstimates();
    this.allocations = this.computeAllocations();
    this.applyStep(1);
  }

  public applyStep(step: number): void {
    this.currentStep = Math.max(1, Math.min(step, 20));

    switch (this.currentStep) {
      case 1: // Normal baseline conditions
        this.activeDisaster.currentStatus = 'NORMAL';
        this.activeDisaster.riskScore = 18.2;
        this.riskAssessment.score = 18.2;
        this.riskAssessment.riskLevel = 'NORMAL';
        this.riskAssessment.targetLeadTimeHours = 12.0;
        this.riskAssessment.leadTimeLabel = 'Target Warning Lead Time: ~12.0 Hours (Planning Target)';
        this.riskAssessment.features[0].value = 14.0; // rain
        this.riskAssessment.features[1].value = 2.1; // river gauge
        this.activeDisaster.responseStatus = 'MONITORING';
        this.evacuationRoutes[0].status = 'SAFE';
        this.evacuationRoutes[0].blockageReason = undefined;
        this.shelters[0].currentOccupancy = 120;
        this.shelters[0].availableCapacity = 1080;
        break;

      case 2: // Severe cloudburst alert triggers
        this.activeDisaster.currentStatus = 'WATCH';
        this.activeDisaster.riskScore = 38.5;
        this.riskAssessment.score = 38.5;
        this.riskAssessment.riskLevel = 'WATCH';
        this.riskAssessment.features[0].value = 65.0;
        this.riskAssessment.features[0].status = 'ELEVATED';
        this.riskAssessment.features[1].value = 3.2;
        this.addTimelineEvent('Cloudburst Pre-Alert', 'IMD Doppler radar detected heavy precipitation cell forming over upper catchment basin.', 'INFO', 'IMD Radar Ingest');
        break;

      case 3: // Upstream telemetry surges
        this.activeDisaster.currentStatus = 'ELEVATED';
        this.activeDisaster.riskScore = 58.4;
        this.riskAssessment.score = 58.4;
        this.riskAssessment.riskLevel = 'ELEVATED';
        this.riskAssessment.features[0].value = 124.0;
        this.riskAssessment.features[1].value = 3.9;
        this.addTimelineEvent('Hydro Telemetry Surge', 'River stage gauge 08-ALAK climbed to 3.9m (approaching 4.2m danger mark).', 'WARNING', 'CWC Gauge Station 08-ALAK');
        break;

      case 4: // VajraWatch Risk Engine jumps to High Risk (78.6)
        this.activeDisaster.currentStatus = 'HIGH_RISK';
        this.activeDisaster.riskScore = 78.6;
        this.riskAssessment.score = 78.6;
        this.riskAssessment.riskLevel = 'HIGH_RISK';
        this.riskAssessment.targetLeadTimeHours = 4.2;
        this.riskAssessment.leadTimeLabel = 'Target Warning Lead Time: ~4.2 Hours (Planning Target)';
        this.riskAssessment.features[0].value = 185.0; // 185mm rain
        this.riskAssessment.features[0].status = 'CRITICAL';
        this.riskAssessment.features[1].value = 4.6; // above danger mark
        this.riskAssessment.features[1].status = 'CRITICAL';
        this.riskAssessment.features[2].value = 88.0; // soil sat
        this.riskAssessment.features[4].value = -4.6; // SAR delta
        this.addTimelineEvent('VajraWatch High Risk Computed', 'Deterministic 8-feature score calculated at 78.6/100. Critical threshold reached.', 'CRITICAL', 'VajraWatch Prediction Engine');
        break;

      case 5: // AI explains why risk increased
        this.riskAssessment.explanation = 'VajraWatch Risk Explanation: Risk spiked from 58.4 to 78.6 driven by extreme cloudburst accumulation (185mm in 48h), river gauge breaching high flood mark by +0.4m, and steep catchment pore-pressure saturation reaching 88%. Sentinel-1 SAR confirms floodplain inundation.';
        this.addTimelineEvent('AI Prediction Explanation Generated', 'AI decision engine synthesized contributing environmental drivers and historical risk profile.', 'INFO', 'VajraWatch Decision AI');
        break;

      case 6: // Skeptic Agent verifies
        this.skepticVerification.isVerified = true;
        this.skepticVerification.confidenceScore = 0.94;
        this.skepticVerification.falseAlarmProbability = 0.038;
        this.skepticVerification.crossSensorConsistency = 'HIGH';
        this.skepticVerification.challengeNotes = 'Skeptic Audit PASSED: Multi-modal convergence confirmed between IMD radar, CWC river stage, and Sentinel-1 SAR coherence shift. No isolated gauge malfunction detected.';
        this.skepticVerification.recommendation = 'PROCEED_WITH_WARNING';
        this.addTimelineEvent('Skeptic Agent Verification Passed', 'Independent cross-sensor validation completed. False alarm probability: 3.8%. Alert escalated.', 'SUCCESS', 'Skeptic Verification Agent');
        break;

      case 7: // High Confidence / Verified Warning issued
        this.activeDisaster.currentStatus = 'WARNING';
        this.activeDisaster.severityClassification = 'LEVEL 2';
        this.activeDisaster.responseStatus = 'EVACUATING';
        this.addTimelineEvent('Critical Public Warning Issued', 'District Magistrate approved multi-channel emergency alert broadcast: Sirens, SMS, and local language voice advisories.', 'CRITICAL', 'District Emergency Controller');
        break;

      case 8: // Impact assessment identifies affected assets
        this.impactAssessment.affectedAreaSqKm = 52.4;
        this.impactAssessment.estimatedPopulation = 14200;
        this.addTimelineEvent('PostGIS Impact Assessment Completed', 'Identified 14,200 population, 6 villages, 18km NH-58, 4 bridges, and 2 hospitals in direct flood path.', 'INFO', 'PostGIS Spatial Engine');
        break;

      case 9: // Resource demand prediction
        this.demandEstimates = this.computeDemandEstimates();
        this.addTimelineEvent('Resource Demand Estimated', 'AI-assisted planning estimate calculated requirements: 10,000 food packets, 25,000L water, 150 trauma kits, 12 rescue boats.', 'INFO', 'Resource Demand Estimator');
        break;

      case 10: // Resource allocation recommended & prioritized
        this.allocations = this.computeAllocations();
        this.addTimelineEvent('Resource Allocation Plan Approved', 'Priority 1 assigned to high-density Shelter-02 and riverside settlements. Human life & medical triage prioritized.', 'SUCCESS', 'Resource Allocation Engine');
        break;

      case 11: // Logistics Coordinator dispatches relief shipments
        this.shipments[0].status = 'DISPATCHED';
        this.shipments[0].routeProgressPct = 20;
        this.shipments[1].status = 'DISPATCHED';
        this.shipments[1].routeProgressPct = 15;
        this.resources[0].availableQuantity -= 1000;
        this.resources[0].inTransitQuantity += 1000;
        this.resources[1].availableQuantity -= 2500;
        this.resources[1].inTransitQuantity += 2500;
        this.addTimelineEvent('Relief Convoys Dispatched', 'Trucks TR-04 (1,000 food packets) and TR-07 (2,500L water) departed regional depots under police escort.', 'INFO', 'Logistics Command Hub');
        break;

      case 12: // Live map shows moving convoy and NDRF deployment
        this.shipments[0].status = 'IN_TRANSIT';
        this.shipments[0].routeProgressPct = 55;
        this.shipments[0].currentCoords = { lat: 30.4180, lng: 79.3288 };
        this.shipments[1].status = 'IN_TRANSIT';
        this.shipments[1].routeProgressPct = 48;
        this.shipments[1].currentCoords = { lat: 30.4480, lng: 79.3560 };
        this.activeDisaster.responseStatus = 'RESCUE_ACTIVE';
        this.addTimelineEvent('Tactical Deployment Active', 'NDRF 8th Battalion Units Alpha & Bravo deployed 8 swift water rescue boats along Alaknanda ghats.', 'SUCCESS', 'NDRF Tactical Ops');
        break;

      case 13: // CRITICAL INCIDENT: NH-58 blocked at km 42!
        this.evacuationRoutes[0].status = 'BLOCKED';
        this.evacuationRoutes[0].blockageReason = 'Landslide & flash flood debris overflow on NH-58 at Km 42 near Birahi choke point.';
        this.shipments[1].status = 'DELAYED';
        this.addTimelineEvent('ALERT: NH-58 Arterial Blocked', 'Sudden debris flow deposited 400 cubic meters of mud on NH-58 at Km 42. Primary evacuation route severed!', 'CRITICAL', 'SDRF Highway Patrol');
        break;

      case 14: // Dynamic router recalculates evacuation route via Ridge Bypass
        this.evacuationRoutes[1].status = 'SAFE';
        this.shipments[1].destinationName = 'Alaknanda High School Shelter via Ridge Bypass';
        this.shipments[1].status = 'IN_TRANSIT';
        this.shipments[1].routeProgressPct = 65;
        this.addTimelineEvent('Dynamic Evacuation Route Recalculated', 'Graph routing engine rerouted traffic to High-Ground Ridge Bypass Corridor. Safe transit restored (+8 min ETA).', 'SUCCESS', 'Dynamic Evacuation Router');
        break;

      case 15: // Shelter occupancy surges
        this.shelters[0].currentOccupancy = 1020;
        this.shelters[0].availableCapacity = 180;
        this.shelters[0].status = 'NEAR_CAPACITY';
        this.shelters[1].currentOccupancy = 1850;
        this.shelters[1].availableCapacity = 650;
        this.addTimelineEvent('Shelter Influx Recorded', 'Evacuation progress reached 84%. Shelter Alaknanda-1 reached 85% capacity with 1,020 displaced residents safe.', 'INFO', 'Shelter Management Desk');
        break;

      case 16: // Relief shipments arrive and deliver supplies
        this.shipments[0].status = 'DELIVERED';
        this.shipments[0].routeProgressPct = 100;
        this.shipments[1].status = 'DELIVERED';
        this.shipments[1].routeProgressPct = 100;
        this.resources[0].inTransitQuantity -= 1000;
        this.resources[0].deliveredQuantity += 1000;
        this.resources[1].inTransitQuantity -= 2500;
        this.resources[1].deliveredQuantity += 2500;
        this.shelters[0].foodSupplyDays = 5;
        this.shelters[1].waterSupplyDays = 8;
        this.addTimelineEvent('Relief Shipments Delivered', 'Trucks TR-04 and TR-07 completed delivery. Shelter shortages fully mitigated.', 'SUCCESS', 'Logistics Command Hub');
        break;

      case 17: // Flood crest passes, disaster ends & incident closed
        this.activeDisaster.currentStatus = 'DISASTER_CONFIRMED';
        this.activeDisaster.responseStatus = 'RELIEF_DELIVERY';
        this.riskAssessment.score = 32.0;
        this.riskAssessment.riskLevel = 'WATCH';
        this.riskAssessment.features[1].value = 3.6; // river falling below danger level
        this.addTimelineEvent('Flood Crest Passed - Incident Closed', 'River levels receded below danger mark (3.6m). Evacuation operations complete. Transitioning to Recovery Phase.', 'SUCCESS', 'Incident Commander');
        break;

      case 18: // Post-disaster analysis generated
        this.activeDisaster.responseStatus = 'CLOSED';
        this.performance.evacuationCompletionPct = 96.4;
        this.performance.platformResponsePerformanceScore = 91.8;
        this.addTimelineEvent('Post-Disaster Analysis Workspace Generated', 'AI post-disaster analyst synthesized 15 core evaluation sections from structured telemetry and logs.', 'INFO', 'AI Post-Disaster Analyst');
        break;

      case 19: // Damage assessment & performance charts verified
        this.addTimelineEvent('Damage Assessment & Response Metrics Finalized', 'Total estimated repair cost: INR 1.81 Crores. Zero fatalities. Response efficiency rated 91.8/100.', 'SUCCESS', 'Post-Disaster Evaluation Board');
        break;

      case 20: // PDF report ready to generate
        this.addTimelineEvent('Official Post-Disaster Report Ready', 'Comprehensive 20-section incident report compiled with executive summary, maps, logs, and lessons learned.', 'SUCCESS', 'Disaster Reporting Subsystem');
        break;
    }
  }

  private addTimelineEvent(title: string, description: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS', actor: string): void {
    const id = `EVT-SIM-${Date.now().toString().slice(-4)}`;
    // Avoid duplicating exact title if already latest
    if (this.timeline.length > 0 && this.timeline[this.timeline.length - 1].title === title) {
      return;
    }
    this.timeline.push({
      id,
      timestamp: new Date().toISOString(),
      title,
      description,
      severity,
      actor
    });
  }

  public getStepDescription(step: number): { title: string; desc: string } {
    const steps: Record<number, { title: string; desc: string }> = {
      1: { title: 'Step 1: Normal Baseline Conditions', desc: 'Monitoring normal baseline conditions in the Alaknanda Basin. River stage at 2.1m, risk score 18.2/100 (NORMAL).' },
      2: { title: 'Step 2: Severe Cloudburst Pre-Alert', desc: 'IMD Doppler radar detects localized storm cloudburst (48 mm/hr). Risk elevated to WATCH.' },
      3: { title: 'Step 3: Upstream Telemetry Surge', desc: 'River gauge 08-ALAK records rapid surge to 3.9m, approaching danger threshold (4.2m).' },
      4: { title: 'Step 4: VajraWatch High Risk Computed', desc: 'Deterministic 8-feature risk engine computes score 78.6/100 (HIGH RISK). Warning thresholds triggered.' },
      5: { title: 'Step 5: AI Explanation Synthesized', desc: 'AI engine explains primary risk drivers: cloudburst accumulation, pore saturation, and SAR flood expansion.' },
      6: { title: 'Step 6: Skeptic Agent Verification', desc: 'Skeptic Agent cross-validates radar and hydro sensors, rejecting false-alarm hypothesis (p = 0.038).' },
      7: { title: 'Step 7: Verified Warning & Voice Alert', desc: 'District Magistrate authorizes Critical Warning. Multi-channel sirens, SMS, and local-language audio triggered.' },
      8: { title: 'Step 8: PostGIS Impact Assessment', desc: 'Spatial polygon intersection identifies 14,200 population, 6 villages, 18km NH-58, and 4 bridges in danger zone.' },
      9: { title: 'Step 9: Resource Demand Estimation', desc: 'AI-assisted estimator computes requirements: 10,000 food rations, 25,000L water, 150 trauma kits, 12 boats.' },
      10: { title: 'Step 10: Resource Allocation Engine', desc: 'Priority engine allocates supplies to shelters and vulnerable riverside settlements based on human life protection.' },
      11: { title: 'Step 11: Logistics Convoy Dispatch', desc: 'Trucks TR-04 and TR-07 dispatched with emergency rations and water tanks under police escort.' },
      12: { title: 'Step 12: Live Tactical Tracking on GIS Map', desc: 'Real-time map visualizes moving convoy, emergency ambulances, and NDRF 8th Battalion deployments.' },
      13: { title: 'Step 13: Emergency Blockage on NH-58', desc: 'Debris slide blocks NH-58 at Km 42 near Birahi. Primary arterial evacuation corridor severed!' },
      14: { title: 'Step 14: Dynamic Evacuation Route Recalculation', desc: 'Routing engine reroutes traffic via High-Ground Ridge Bypass Road, bypassing debris choke point.' },
      15: { title: 'Step 15: Shelter Occupancy Influx', desc: 'Evacuation accelerates; Shelter Alaknanda-1 reaches 85% capacity with 1,020 citizens sheltered safely.' },
      16: { title: 'Step 16: Relief Shipments Arrive', desc: 'Convoys complete delivery; inventory and shelter supplies increment with mathematical consistency.' },
      17: { title: 'Step 17: Flood Crest Passes - Incident Closed', desc: 'River levels recede below danger threshold. Incident Commander officially closes active response phase.' },
      18: { title: 'Step 18: Post-Disaster Analysis Workspace', desc: 'Post-disaster workspace automatically populates 15 comprehensive operational evaluation sections.' },
      19: { title: 'Step 19: Damage Assessment & KPIs', desc: 'Damage catalog finalized (INR 1.81 Cr repair cost). Platform response performance rated at 91.8/100.' },
      20: { title: 'Step 20: 1-Click PDF Disaster Report Ready', desc: 'Comprehensive 20-section printable disaster report compiled and ready for international jury evaluation.' }
    };
    return steps[step] || { title: `Step ${step}`, desc: 'Simulation step active' };
  }
}

export const simulationStore = new SimulationStateStore();
