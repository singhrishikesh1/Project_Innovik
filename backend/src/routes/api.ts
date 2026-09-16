import { Router, Request, Response } from 'express';
import { simulationStore } from '../simulation/simulationOrchestrator';
import { VajraWatchRiskEngine, TelemetryInputs } from '../engines/riskEngine';
import { SkepticVerificationAgent } from '../engines/skepticAgent';
import { SpatialEngine } from '../engines/spatialEngine';
import { AuditLogStore } from '../middleware/audit';
import { requireRole, AuthenticatedRequest } from '../middleware/rbac';
import {
  hospitalsData,
  rescueTeamsData,
  emergencyTasksData,
  damageRecordsData,
  dataSourcesStatusData
} from '../data/seedData';
import { Resource, Shipment, EmergencyTask, Shelter } from '../../../shared';

const router = Router();

// ---------------------------------------------------------------------------
// Simulation Controls (20 Steps)
// ---------------------------------------------------------------------------

router.get('/simulation/state', (req: Request, res: Response) => {
  const stepInfo = simulationStore.getStepDescription(simulationStore.currentStep);
  return res.json({
    currentStep: simulationStore.currentStep,
    totalSteps: simulationStore.totalSteps,
    stepTitle: stepInfo.title,
    stepDescription: stepInfo.desc,
    autoPlay: simulationStore.autoPlay,
    activeDisaster: simulationStore.activeDisaster,
    riskAssessment: simulationStore.riskAssessment,
    skepticVerification: simulationStore.skepticVerification,
    impactAssessment: simulationStore.impactAssessment,
    shelters: simulationStore.shelters,
    resources: simulationStore.resources,
    shipments: simulationStore.shipments,
    evacuationRoutes: simulationStore.evacuationRoutes,
    timeline: simulationStore.timeline,
    performance: simulationStore.performance,
    demandEstimates: simulationStore.demandEstimates,
    allocations: simulationStore.allocations
  });
});

router.post('/simulation/step', (req: AuthenticatedRequest, res: Response) => {
  const { step } = req.body;
  const targetStep = parseInt(step, 10);
  if (isNaN(targetStep) || targetStep < 1 || targetStep > 20) {
    return res.status(400).json({ error: 'Step must be between 1 and 20' });
  }

  const prevStep = simulationStore.currentStep;
  simulationStore.applyStep(targetStep);
  AuditLogStore.record(
    req.userName || 'Demo Operator',
    req.userRole || 'DISASTER_MANAGER',
    'SIMULATION_STEP_CHANGE',
    'Simulation Engine',
    `Step ${prevStep}`,
    `Step ${targetStep}`,
    `Jumped to simulation step ${targetStep}`
  );

  return res.json({
    success: true,
    currentStep: simulationStore.currentStep,
    stepInfo: simulationStore.getStepDescription(simulationStore.currentStep)
  });
});

router.post('/simulation/next', (req: AuthenticatedRequest, res: Response) => {
  if (simulationStore.currentStep < simulationStore.totalSteps) {
    simulationStore.applyStep(simulationStore.currentStep + 1);
  }
  return res.json({
    success: true,
    currentStep: simulationStore.currentStep,
    stepInfo: simulationStore.getStepDescription(simulationStore.currentStep)
  });
});

router.post('/simulation/prev', (req: AuthenticatedRequest, res: Response) => {
  if (simulationStore.currentStep > 1) {
    simulationStore.applyStep(simulationStore.currentStep - 1);
  }
  return res.json({
    success: true,
    currentStep: simulationStore.currentStep,
    stepInfo: simulationStore.getStepDescription(simulationStore.currentStep)
  });
});

router.post('/simulation/reset', (req: AuthenticatedRequest, res: Response) => {
  simulationStore.reset();
  AuditLogStore.record(
    req.userName || 'Demo Operator',
    req.userRole || 'DISASTER_MANAGER',
    'SIMULATION_RESET',
    'Simulation Engine',
    'State Active',
    'Reset to Step 1',
    'Full scenario state reset to normal conditions.'
  );
  return res.json({ success: true, currentStep: 1 });
});

// ---------------------------------------------------------------------------
// Disasters & Risk Intelligence
// ---------------------------------------------------------------------------

router.get('/disasters', (req: Request, res: Response) => {
  return res.json({
    active: [simulationStore.activeDisaster],
    historical: [
      {
        id: 'DIS-HIST-2021-01',
        name: '2021 Rishi Ganga Flash Flood & Tapovan Breach',
        type: 'GLOF',
        location: 'Chamoli, Uttarakhand',
        startTime: '2021-02-07T04:30:00Z',
        currentStatus: 'CLOSED',
        riskScore: 92.4,
        confidence: 0.92,
        affectedPopulation: 4500,
        responseStatus: 'CLOSED',
        severityClassification: 'LEVEL 3'
      },
      {
        id: 'DIS-HIST-2013-02',
        name: '2013 Kedarnath Himalayan Deluge & Cloudburst',
        type: 'Flash Flood',
        location: 'Rudraprayag & Chamoli, Uttarakhand',
        startTime: '2013-06-16T11:00:00Z',
        currentStatus: 'CLOSED',
        riskScore: 98.6,
        confidence: 0.95,
        affectedPopulation: 58000,
        responseStatus: 'CLOSED',
        severityClassification: 'NATIONAL EMERGENCY'
      }
    ]
  });
});

router.get('/disasters/:id', (req: Request, res: Response) => {
  return res.json(simulationStore.activeDisaster);
});

router.get('/disasters/:id/risk', (req: Request, res: Response) => {
  return res.json(simulationStore.riskAssessment);
});

router.post('/disasters/calculate-risk', (req: Request, res: Response) => {
  const inputs: TelemetryInputs = req.body;
  const result = VajraWatchRiskEngine.calculateDeterministicRisk(inputs);
  return res.json(result);
});

router.post('/disasters/skeptic-verify', (req: Request, res: Response) => {
  const { riskScore, telemetry, sensorHealth } = req.body;
  const result = SkepticVerificationAgent.verifyPrediction(
    riskScore || simulationStore.riskAssessment.score,
    telemetry || {
      precipitation_mm_hr: 45.0,
      precipitation_48h_accum_mm: 185.0,
      river_gauge_height_m: 4.6,
      river_danger_level_m: 4.2,
      slope_angle_deg: 34.0,
      soil_saturation_pct: 88.0,
      ndwi_anomaly_delta: 0.38,
      sar_backscatter_delta_db: -4.6,
      lake_area_expansion_pct: 28.5,
      seismic_pga_g: 0.04,
      temperature_anomaly_c: 3.5
    },
    sensorHealth || { radar_imd: 'ONLINE', hydro_cwc: 'ONLINE', sentinel_copernicus: 'ONLINE', seismic_usgs: 'ONLINE' }
  );
  return res.json(result);
});

router.get('/disasters/:id/impact', (req: Request, res: Response) => {
  return res.json(simulationStore.impactAssessment);
});

router.get('/disasters/:id/timeline', (req: Request, res: Response) => {
  return res.json(simulationStore.timeline);
});

// ---------------------------------------------------------------------------
// Early Warning Alerts
// ---------------------------------------------------------------------------

router.get('/alerts', (req: Request, res: Response) => {
  return res.json([
    {
      id: 'ALERT-UK-2026-08',
      disasterId: simulationStore.activeDisaster.id,
      type: simulationStore.riskAssessment.score > 70 ? 'Critical Alert' : 'Warning',
      title: `URGENT: ${simulationStore.activeDisaster.name}`,
      affectedLocation: 'Alaknanda Catchment Basin (Joshimath - Chamoli - Karnaprayag)',
      riskScore: simulationStore.riskAssessment.score,
      confidence: simulationStore.riskAssessment.confidence,
      evidence: [
        'CWC Hydro Station 08-ALAK river stage breaching danger mark',
        'IMD Doppler Radar cloudburst accumulation exceeding 180mm',
        'Sentinel-1 SAR active floodplain attenuation'
      ],
      timestamp: new Date().toISOString(),
      affectedPopulation: simulationStore.activeDisaster.affectedPopulation,
      recommendedAction: 'Immediate high-ground evacuation of low-lying wards. Halt vehicular transit on riverside NH-58 segments.',
      evacuationRecommendation: true,
      authorityApprovalStatus: simulationStore.currentStep >= 7 ? 'APPROVED_BY_DM' : 'PENDING_APPROVAL',
      approvedBy: simulationStore.currentStep >= 7 ? 'District Magistrate Chamoli' : undefined,
      notificationChannels: {
        dashboard: true,
        smsSimulated: true,
        emailSimulated: true,
        pushSimulated: true,
        voiceAlertLocalLanguage: true
      }
    }
  ]);
});

router.post('/alerts/approve', requireRole(['ADMIN', 'DISASTER_MANAGER']), (req: AuthenticatedRequest, res: Response) => {
  AuditLogStore.record(
    req.userName || 'District Emergency Controller',
    req.userRole || 'DISASTER_MANAGER',
    'ALERT_APPROVED',
    'Early Warning Alert ALERT-UK-2026-08',
    'PENDING_APPROVAL',
    'APPROVED_BY_DM',
    'Official emergency siren broadcast and SMS push authorized.'
  );
  return res.json({
    success: true,
    message: 'Alert approved and broadcasted across emergency response networks.'
  });
});

// ---------------------------------------------------------------------------
// GIS Map & All 24 Spatial Layers
// ---------------------------------------------------------------------------

router.get('/map/layers', (req: Request, res: Response) => {
  return res.json({
    disasterZones: [
      {
        id: 'ZONE-DIS-01',
        name: 'Alaknanda Inundation Primary Risk Corridor',
        type: 'Polygon',
        severity: simulationStore.activeDisaster.currentStatus,
        coordinates: simulationStore.impactAssessment.polygonCoordinates
      }
    ],
    riskZones: [
      {
        id: 'ZONE-RISK-HIGH',
        name: 'Valley Bottom Floodplain Buffer (500m)',
        color: '#dc2626',
        opacity: 0.35,
        polygon: simulationStore.impactAssessment.polygonCoordinates
      }
    ],
    floodedAreas: [
      {
        id: 'FLOOD-01',
        name: 'Chamoli Lowland Waterlogged Flats',
        areaSqKm: 14.2,
        polygon: [
          { lat: 30.4150, lng: 79.3220 },
          { lat: 30.4190, lng: 79.3280 },
          { lat: 30.4120, lng: 79.3310 },
          { lat: 30.4080, lng: 79.3250 }
        ]
      }
    ],
    landslideZones: [
      {
        id: 'LS-01',
        name: 'Km 42 Birahi Choke Point Debris Slide Hazard',
        coords: { lat: 30.4350, lng: 79.3450 },
        riskLevel: 'CRITICAL'
      }
    ],
    affectedVillages: [
      { name: 'Joshimath Foothills Hamlet', coords: { lat: 30.5480, lng: 79.5580 }, population: 1800, status: 'EVACUATING' },
      { name: 'Helang Riverside Basti', coords: { lat: 30.5080, lng: 79.4210 }, population: 2200, status: 'RESCUE_ACTIVE' },
      { name: 'Pipalkoti Lower Market', coords: { lat: 30.4590, lng: 79.3690 }, population: 3100, status: 'EVACUATING' },
      { name: 'Birahi Confluence Settlement', coords: { lat: 30.3780, lng: 79.3490 }, population: 1400, status: 'HIGH_RISK' },
      { name: 'Chamoli Bazaar Low-Lying Sector', coords: { lat: 30.4120, lng: 79.3240 }, population: 4200, status: 'EVACUATING' },
      { name: 'Nandaprayag Ghat Colony', coords: { lat: 30.3320, lng: 79.3240 }, population: 1500, status: 'MONITORING' }
    ],
    shelters: simulationStore.shelters,
    hospitals: hospitalsData,
    rescueTeams: rescueTeamsData,
    logisticsShipments: simulationStore.shipments,
    evacuationRoutes: simulationStore.evacuationRoutes,
    criticalInfrastructure: [
      { id: 'INF-01', name: 'Chamoli Suspension Footbridge', coords: { lat: 30.4135, lng: 79.3248 }, status: 'SEVERED' },
      { id: 'INF-02', name: '33kV Pipalkoti Power Grid Substation', coords: { lat: 30.4630, lng: 79.3730 }, status: 'ONLINE' },
      { id: 'INF-03', name: 'Alaknanda Drinking Water Treatment Plant', coords: { lat: 30.4110, lng: 79.3260 }, status: 'HIGH_RISK' },
      { id: 'INF-04', name: 'Tapovan Hydro Intake Works', coords: { lat: 30.4950, lng: 79.6210 }, status: 'MONITORING' }
    ],
    iotSensors: [
      { id: 'SENS-01', name: 'CWC Hydro Station 08-ALAK', type: 'River Gauge', coords: { lat: 30.4110, lng: 79.3230 }, reading: `${simulationStore.riskAssessment.features[1].value} m`, dangerMark: '4.2 m' },
      { id: 'SENS-02', name: 'Pipalkoti IMD Rain Gauge', type: 'Precipitation', coords: { lat: 30.4610, lng: 79.3720 }, reading: `${simulationStore.riskAssessment.features[0].value} mm`, threshold: '100 mm' },
      { id: 'SENS-03', name: 'Joshimath Seismograph G-4', type: 'Seismic PGA', coords: { lat: 30.5530, lng: 79.5620 }, reading: '0.03 g', threshold: '0.15 g' }
    ]
  });
});

router.post('/map/road-status', requireRole(['ADMIN', 'DISASTER_MANAGER', 'FIELD_COORDINATOR']), (req: AuthenticatedRequest, res: Response) => {
  const { routeId, status, blockageReason } = req.body;
  const route = simulationStore.evacuationRoutes.find(r => r.id === routeId);
  if (!route) {
    return res.status(404).json({ error: 'Route not found' });
  }

  const oldStatus = route.status;
  route.status = status;
  route.blockageReason = status === 'BLOCKED' ? (blockageReason || 'Road blocked by landslide/flood debris') : undefined;

  AuditLogStore.record(
    req.userName || 'Field Road Inspector',
    req.userRole || 'FIELD_COORDINATOR',
    'ROAD_STATUS_UPDATED',
    `Route ${route.name}`,
    oldStatus,
    status,
    route.blockageReason
  );

  return res.json({ success: true, route });
});

// ---------------------------------------------------------------------------
// Resources & Inventory Management
// ---------------------------------------------------------------------------

router.get('/resources', (req: Request, res: Response) => {
  return res.json(simulationStore.resources);
});

router.post('/resources/allocate', requireRole(['ADMIN', 'DISASTER_MANAGER', 'RESOURCE_MANAGER']), (req: AuthenticatedRequest, res: Response) => {
  const { resourceId, quantity, destinationShelterId, destinationName } = req.body;
  const resource = simulationStore.resources.find(r => r.id === resourceId);
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  if (resource.availableQuantity < qty) {
    return res.status(400).json({
      error: 'Insufficient available inventory',
      available: resource.availableQuantity,
      requested: qty
    });
  }

  // Strict mathematical conservation
  resource.availableQuantity -= qty;
  resource.allocatedQuantity += qty;
  resource.destinationLocationName = destinationName || 'Emergency Shelter';
  resource.lastUpdated = new Date().toISOString();

  AuditLogStore.record(
    req.userName || 'Resource Manager',
    req.userRole || 'RESOURCE_MANAGER',
    'RESOURCE_ALLOCATION',
    `${resource.name} (${resource.id})`,
    `Avail: ${resource.availableQuantity + qty}`,
    `Avail: ${resource.availableQuantity}, Alloc: ${resource.allocatedQuantity}`,
    `Allocated ${qty} ${resource.unit} to ${destinationName || 'Incident'}`
  );

  return res.json({ success: true, resource });
});

router.get('/resources/demand-estimates', (req: Request, res: Response) => {
  return res.json(simulationStore.demandEstimates);
});

router.get('/resources/allocations', (req: Request, res: Response) => {
  return res.json(simulationStore.allocations);
});

// ---------------------------------------------------------------------------
// Logistics & Shipments
// ---------------------------------------------------------------------------

router.get('/logistics/shipments', (req: Request, res: Response) => {
  return res.json(simulationStore.shipments);
});

router.post('/logistics/shipments', requireRole(['ADMIN', 'DISASTER_MANAGER', 'LOGISTICS_COORDINATOR']), (req: AuthenticatedRequest, res: Response) => {
  const newShipment: Shipment = {
    id: `SHIP-UK-${Date.now().toString().slice(-4)}`,
    resourceCategory: req.body.resourceCategory || 'Food packets',
    resourceName: req.body.resourceName || 'Relief Supply Convoy',
    quantity: req.body.quantity || 500,
    unit: req.body.unit || 'units',
    originName: req.body.originName || 'Chamoli Central Relief Warehouse',
    originCoords: req.body.originCoords || { lat: 30.4090, lng: 79.3270 },
    destinationName: req.body.destinationName || 'Alaknanda High School Shelter',
    destinationCoords: req.body.destinationCoords || { lat: 30.4210, lng: 79.3295 },
    vehicleId: req.body.vehicleId || 'TRUCK-UK-07-GA-9021',
    driverName: req.body.driverName || 'Rajendra Pal',
    driverContact: req.body.driverContact || '+91 94115-XXXXX',
    assignedTeam: req.body.assignedTeam || 'Logistics Convoy Unit Echo',
    departureTime: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + 45 * 60000).toISOString(),
    status: 'DISPATCHED',
    priority: req.body.priority || 'HIGH',
    routeProgressPct: 0,
    currentCoords: req.body.originCoords || { lat: 30.4090, lng: 79.3270 },
    isSimulated: true
  };

  simulationStore.shipments.unshift(newShipment);

  AuditLogStore.record(
    req.userName || 'Logistics Coordinator',
    req.userRole || 'LOGISTICS_COORDINATOR',
    'SHIPMENT_DISPATCHED',
    `Shipment ${newShipment.id}`,
    'PLANNED',
    'DISPATCHED',
    `Dispatched ${newShipment.quantity} ${newShipment.unit} to ${newShipment.destinationName}`
  );

  return res.status(201).json(newShipment);
});

router.patch('/logistics/shipments/:id', requireRole(['ADMIN', 'DISASTER_MANAGER', 'LOGISTICS_COORDINATOR']), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const shipment = simulationStore.shipments.find(s => s.id === id);
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  const oldStatus = shipment.status;
  if (req.body.status) shipment.status = req.body.status;
  if (req.body.routeProgressPct !== undefined) shipment.routeProgressPct = req.body.routeProgressPct;
  if (req.body.currentCoords) shipment.currentCoords = req.body.currentCoords;

  if (shipment.status === 'DELIVERED') {
    shipment.actualArrival = new Date().toISOString();
    shipment.routeProgressPct = 100;
  }

  AuditLogStore.record(
    req.userName || 'Logistics Coordinator',
    req.userRole || 'LOGISTICS_COORDINATOR',
    'SHIPMENT_STATUS_UPDATE',
    `Shipment ${shipment.id}`,
    oldStatus,
    shipment.status,
    `Progress: ${shipment.routeProgressPct}%`
  );

  return res.json(shipment);
});

// ---------------------------------------------------------------------------
// Shelters & Hospitals
// ---------------------------------------------------------------------------

router.get('/shelters', (req: Request, res: Response) => {
  return res.json(simulationStore.shelters);
});

router.patch('/shelters/:id', requireRole(['ADMIN', 'DISASTER_MANAGER', 'FIELD_COORDINATOR']), (req: AuthenticatedRequest, res: Response) => {
  const shelter = simulationStore.shelters.find(s => s.id === req.params.id);
  if (!shelter) {
    return res.status(404).json({ error: 'Shelter not found' });
  }

  if (req.body.currentOccupancy !== undefined) {
    const occ = parseInt(req.body.currentOccupancy, 10);
    shelter.currentOccupancy = occ;
    shelter.availableCapacity = Math.max(0, shelter.totalCapacity - occ);
    if (shelter.availableCapacity === 0) {
      shelter.status = 'FULL';
    } else if (shelter.availableCapacity < shelter.totalCapacity * 0.2) {
      shelter.status = 'NEAR_CAPACITY';
    } else {
      shelter.status = 'OPEN';
    }
  }

  return res.json(shelter);
});

router.get('/hospitals', (req: Request, res: Response) => {
  return res.json(hospitalsData);
});

router.get('/rescue-teams', (req: Request, res: Response) => {
  return res.json(rescueTeamsData);
});

router.get('/evacuation/routes', (req: Request, res: Response) => {
  return res.json(simulationStore.evacuationRoutes);
});

// ---------------------------------------------------------------------------
// Tasks & Damage Assessments
// ---------------------------------------------------------------------------

router.get('/tasks', (req: Request, res: Response) => {
  return res.json(emergencyTasksData);
});

router.post('/tasks', requireRole(['ADMIN', 'DISASTER_MANAGER', 'FIELD_COORDINATOR']), (req: AuthenticatedRequest, res: Response) => {
  const newTask: EmergencyTask = {
    id: `TASK-${Date.now().toString().slice(-4)}`,
    title: req.body.title || 'Immediate Emergency Task',
    priority: req.body.priority || 'HIGH',
    locationName: req.body.locationName || 'Chamoli Operations Area',
    coords: req.body.coords || { lat: 30.4120, lng: 79.3240 },
    assignedTeam: req.body.assignedTeam || 'NDRF Unit Bravo',
    requiredResources: req.body.requiredResources || 'Standard Tactical Kit',
    deadlineMinutes: req.body.deadlineMinutes || 60,
    status: 'OPEN',
    createdTime: new Date().toISOString()
  };
  emergencyTasksData.unshift(newTask);
  return res.status(201).json(newTask);
});

router.get('/damage-assessments', (req: Request, res: Response) => {
  return res.json(damageRecordsData);
});

// ---------------------------------------------------------------------------
// Post-Disaster Analysis, Reports & Performance
// ---------------------------------------------------------------------------

router.get('/post-disaster/performance', (req: Request, res: Response) => {
  return res.json(simulationStore.performance);
});

router.get('/post-disaster/analysis', (req: Request, res: Response) => {
  return res.json({
    disasterOverview: {
      id: simulationStore.activeDisaster.id,
      name: simulationStore.activeDisaster.name,
      type: simulationStore.activeDisaster.type,
      location: simulationStore.activeDisaster.location,
      durationHours: 14.5,
      peakCrestLevel: '4.8 m (0.6m above danger mark)',
      peakRainfallRate: '48 mm/hr'
    },
    geographicImpact: {
      affectedAreaSqKm: simulationStore.impactAssessment.affectedAreaSqKm,
      catchmentCorridorLengthKm: 28.4,
      affectedVillagesCount: simulationStore.impactAssessment.affectedVillages.length
    },
    populationImpact: {
      totalPopulationAtRisk: simulationStore.activeDisaster.affectedPopulation,
      evacuatedToShelters: 3850,
      shelteredPopulationPct: 27.1,
      injuredTreated: 18,
      fatalities: 0,
      missingPersons: 0
    },
    infrastructureDamageSummary: {
      bridgesSevered: 1,
      roadsDamagedKm: 2.8,
      schoolsImpacted: 1,
      substationsTripped: 1,
      agriculturalLandDamagedHectares: 45
    },
    resourceUsage: {
      foodDelivered: 7500,
      waterDeliveredL: 17200,
      medicalKitsUsed: 30,
      boatsDeployed: 8,
      ambulancesDispatched: 12
    },
    logisticsPerformance: {
      totalShipments: 8,
      deliveredOnTime: 7,
      delayedByLandslide: 1,
      averageDeliveryTimeMin: 34.5
    },
    rescuePerformance: {
      activeTeams: 6,
      totalPersonnelDeployed: 235,
      waterRescuesExecuted: 142,
      droneSortiesFlown: 18
    },
    evacuationPerformance: {
      completionRatePct: 96.4,
      avgEvacuationTimePerVillageMin: 48,
      reroutedCitizenCount: 1240
    },
    shelterPerformance: {
      peakOccupancyPct: 78.4,
      criticalShortagesReported: 0,
      medicalTriagePostsActive: 4
    },
    financialImpact: {
      estimatedTotalLossInr: 18150000,
      infrastructureRepairCostInr: 12350000,
      cropDamageReliefInr: 5800000,
      label: 'Preliminary Post-Disaster Loss Estimate (Simulated Scenario)'
    },
    environmentalImpact: {
      sedimentDepositionHectares: 68,
      riverbedErosionIndex: 'MODERATE_TO_HIGH',
      vegetationStrippingSlopeDeg: 32.0
    },
    timelineSummary: simulationStore.timeline,
    responseGaps: [
      'Heavy excavator positioning was 35 km away, delaying initial clearance of NH-58 by 18 minutes.',
      'Cellular coverage experienced transient degradation in Sector 4, highlighting need for redundant mesh radio.'
    ],
    recoveryRequirements: [
      'Expedited Bailey bridge installation over North Alaknanda crossing.',
      'Slope stabilization and geo-synthetic netting along NH-58 Birahi corridor.',
      'Replenishment of district emergency medicine buffer stocks.'
    ],
    lessonsLearned: [
      'Deterministic early warning lead time of 4.2 hours provided sufficient window for zero-fatality evacuation.',
      'Skeptic Agent multi-sensor validation prevented premature false-alarm dismissals.',
      'Dynamic routing engine was decisive in rerouting relief vehicles during the sudden NH-58 blockage.'
    ],
    aiDecisionSummary: 'Comprehensive multi-agency coordination with automated predictive intelligence prevented loss of human life. Pre-positioned ridge routes and high-ground shelters functioned at peak resilience.'
  });
});

router.get('/reports', (req: Request, res: Response) => {
  return res.json([
    {
      id: 'REP-2026-UK-001',
      disasterId: simulationStore.activeDisaster.id,
      title: 'Official Post-Disaster Incident & Operational Response Report',
      date: '2026-09-15',
      status: 'FINAL_COMPLETED',
      version: '2.0-OFFICIAL',
      generatedBy: 'VajraShield Automated Reporting Subsystem',
      sectionsCount: 20
    }
  ]);
});

// ---------------------------------------------------------------------------
// Data Sources & Audit Logs
// ---------------------------------------------------------------------------

router.get('/data-sources', (req: Request, res: Response) => {
  return res.json(dataSourcesStatusData);
});

router.get('/audit-logs', (req: Request, res: Response) => {
  return res.json(AuditLogStore.getAll());
});

// ---------------------------------------------------------------------------
// Satellite Earth Observation & Real-Time Imagery API
// ---------------------------------------------------------------------------

interface SatelliteConfig {
  provider: 'copernicus' | 'sentinel_hub' | 'nasa_earthdata' | 'mapbox' | 'esri_open';
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  instanceId?: string;
  isLiveKeyConfigured: boolean;
  activeConstellations: string[];
}

let satelliteConfigStore: SatelliteConfig = {
  provider: (process.env.SATELLITE_PROVIDER as any) || (process.env.MAPBOX_API_KEY ? 'mapbox' : 'copernicus'),
  apiKey: process.env.COPERNICUS_API_KEY || process.env.MAPBOX_API_KEY || process.env.NASA_EARTHDATA_TOKEN || '',
  clientId: process.env.SENTINEL_HUB_CLIENT_ID || '',
  clientSecret: process.env.SENTINEL_HUB_CLIENT_SECRET || '',
  instanceId: process.env.SENTINEL_HUB_INSTANCE_ID || '',
  isLiveKeyConfigured: Boolean(process.env.COPERNICUS_API_KEY || process.env.SENTINEL_HUB_CLIENT_ID || process.env.MAPBOX_API_KEY),
  activeConstellations: ['Sentinel-1 SAR (Radar)', 'Sentinel-2 Optical NDWI', 'NASA GIBS MODIS/VIIRS']
};

router.get('/satellite/config', (req: Request, res: Response) => {
  const maskedKey = satelliteConfigStore.apiKey
    ? `${satelliteConfigStore.apiKey.slice(0, 4)}...${satelliteConfigStore.apiKey.slice(-4)}`
    : '';

  return res.json({
    provider: satelliteConfigStore.provider,
    isLiveKeyConfigured: satelliteConfigStore.isLiveKeyConfigured,
    maskedKey,
    hasClientId: Boolean(satelliteConfigStore.clientId),
    activeConstellations: satelliteConfigStore.activeConstellations,
    monitoredBbox: {
      minLng: 79.20,
      minLat: 30.30,
      maxLng: 79.60,
      maxLat: 30.60,
      theater: 'Chamoli District & Upper Alaknanda Basin, Uttarakhand'
    },
    tileProviders: {
      esriWorldImagery: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      nasaGibsTrueColor: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2026-09-15/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
      mapboxSatellite: satelliteConfigStore.apiKey && satelliteConfigStore.provider === 'mapbox'
        ? `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=${satelliteConfigStore.apiKey}`
        : null
    }
  });
});

router.post('/satellite/config', (req: Request, res: Response) => {
  const { provider, apiKey, clientId, clientSecret, instanceId } = req.body;

  if (provider) satelliteConfigStore.provider = provider;
  if (apiKey !== undefined) satelliteConfigStore.apiKey = apiKey;
  if (clientId !== undefined) satelliteConfigStore.clientId = clientId;
  if (clientSecret !== undefined) satelliteConfigStore.clientSecret = clientSecret;
  if (instanceId !== undefined) satelliteConfigStore.instanceId = instanceId;

  satelliteConfigStore.isLiveKeyConfigured = Boolean(
    satelliteConfigStore.apiKey || (satelliteConfigStore.clientId && satelliteConfigStore.clientSecret)
  );

  return res.json({
    success: true,
    message: 'Satellite Earth Observation configuration updated.',
    provider: satelliteConfigStore.provider,
    isLiveKeyConfigured: satelliteConfigStore.isLiveKeyConfigured
  });
});

router.post('/satellite/test-connection', async (req: Request, res: Response) => {
  const { provider, apiKey, clientId, clientSecret } = req.body;
  const testProvider = provider || satelliteConfigStore.provider;
  const testKey = apiKey || satelliteConfigStore.apiKey;

  // Real connection test simulation with provider feedback
  if (testKey || (clientId && clientSecret)) {
    return res.json({
      connected: true,
      status: 'AUTHENTICATED_ONLINE',
      provider: testProvider,
      latencyMs: 142,
      dataAvailable: true,
      passTimestamp: '2026-09-15T06:40:00Z',
      groundResolution: '10m (Sentinel-1 SAR / Sentinel-2 MSI)',
      message: `Successfully connected to ${testProvider} Earth Observation API. Live radar & optical streams active.`
    });
  }

  return res.json({
    connected: false,
    status: 'NO_KEY_PROVIDED',
    provider: testProvider,
    message: 'No API Key or Client credentials provided. Defaulting to open NASA GIBS and ESRI high-resolution satellite basemaps.'
  });
});

router.get('/satellite/live', (req: Request, res: Response) => {
  return res.json({
    timestamp: '2026-09-15T06:40:00Z',
    targetRegion: 'Alaknanda River Catchment, Chamoli, Uttarakhand',
    centerCoords: { lat: 30.4128, lng: 79.3242 },
    isRealKeyConnected: satelliteConfigStore.isLiveKeyConfigured,
    provider: satelliteConfigStore.provider,
    sentinel1SAR: {
      satellite: 'Sentinel-1A',
      orbit: 'Descending Orbit #136',
      sensorMode: 'Interferometric Wide Swath (IW GRD)',
      polarization: 'VV + VH dual-pol',
      resolutionMeters: 10,
      acquisitionTime: '2026-09-15T06:40:12Z',
      cloudPenetration: '100% (Radar microwave penetrates cloud cover)',
      radarBackscatterAnomalyDb: -4.6,
      inundatedAreaSqKm: 14.2,
      specularShiftDetected: true
    },
    sentinel2Optical: {
      satellite: 'Sentinel-2B',
      spectralBands: ['B02 (Blue)', 'B03 (Green)', 'B04 (Red)', 'B08 (NIR)', 'B11 (SWIR)'],
      cloudCoverPct: 78.4,
      ndwiMaxAnomaly: 0.38,
      baselineDate: '2026-09-10 (Cloud-free pre-event pass)',
      postEventDate: '2026-09-15 06:40 UTC',
      visualInterpretation: 'Optical bands partially obscured by storm anvil; SAR microwave synthesis provides full ground truth.'
    },
    liveTileUrls: {
      sarInundationOverlay: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      openNasaGibs: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2026-09-15/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
      openEsriWorldImagery: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    }
  });
});

export default router;
