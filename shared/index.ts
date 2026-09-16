export type DisasterType =
  | 'Flash Flood'
  | 'Flood'
  | 'Landslide'
  | 'GLOF'
  | 'Earthquake'
  | 'Cyclone'
  | 'Wildfire';

export type DisasterSeverity =
  | 'NORMAL'
  | 'WATCH'
  | 'ELEVATED'
  | 'HIGH_RISK'
  | 'CRITICAL'
  | 'WARNING'
  | 'DISASTER_CONFIRMED';

export type UserRole =
  | 'ADMIN'
  | 'DISASTER_MANAGER'
  | 'FIELD_COORDINATOR'
  | 'RESOURCE_MANAGER'
  | 'MEDICAL_COORDINATOR'
  | 'LOGISTICS_COORDINATOR'
  | 'ANALYST'
  | 'VIEWER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agency: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
  elevation?: number;
}

export interface RiskFeature {
  name: string;
  key: string;
  value: number;
  unit: string;
  weight: number;
  contribution: number; // 0 - 100 scaled
  description: string;
  dataSource: string;
  status: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
}

export interface RiskAssessment {
  score: number; // 0 - 100 deterministic
  riskLevel: DisasterSeverity;
  confidence: number; // 0.0 - 1.0
  features: RiskFeature[];
  contributingFactors: string[];
  missingData: string[];
  dataSources: string[];
  timestamp: string;
  explanation: string;
  targetLeadTimeHours: number; // Stamped as TARGET / ESTIMATED lead time
  leadTimeLabel: string;
}

export interface SkepticVerification {
  isVerified: boolean;
  confidenceScore: number;
  falseAlarmProbability: number;
  anomaliesDetected: string[];
  crossSensorConsistency: 'HIGH' | 'MODERATE' | 'LOW' | 'DISCREPANCY_DETECTED';
  challengeNotes: string;
  recommendation: 'PROCEED_WITH_WARNING' | 'HOLD_FOR_CORROBORATION' | 'SUPPRESS_FALSE_ALARM';
  timestamp: string;
}

export interface InfrastructureCount {
  name: string;
  totalAtRisk: number;
  category: 'roads' | 'bridges' | 'hospitals' | 'schools' | 'power' | 'water' | 'comms' | 'agriculture';
  criticalLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface ImpactAssessment {
  disasterId: string;
  affectedAreaSqKm: number;
  estimatedPopulation: number;
  affectedVillages: string[];
  infrastructureAtRisk: InfrastructureCount[];
  agriculturalLandHectares: number;
  nearestSheltersDistanceKm: { shelterId: string; distanceKm: number }[];
  nearestHospitalsDistanceKm: { hospitalId: string; distanceKm: number }[];
  polygonCoordinates: Coordinates[];
  computedTimestamp: string;
  calculationMethod: string;
}

export type ResourceCategory =
  | 'Rescue teams'
  | 'Medical teams'
  | 'Ambulances'
  | 'Fire vehicles'
  | 'Police units'
  | 'Boats'
  | 'Drones'
  | 'Helicopters'
  | 'Trucks'
  | 'Food packets'
  | 'Drinking water (L)'
  | 'Medicines'
  | 'First-aid kits'
  | 'Blankets'
  | 'Tents'
  | 'Fuel (L)'
  | 'Emergency equipment'
  | 'Communication equipment'
  | 'Power generators';

export type ResourceStatus =
  | 'AVAILABLE'
  | 'ALLOCATED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'DEPLOYED'
  | 'CONSUMED'
  | 'DAMAGED'
  | 'RETURNED';

export interface Resource {
  id: string;
  category: ResourceCategory;
  name: string;
  quantity: number;
  availableQuantity: number;
  allocatedQuantity: number;
  inTransitQuantity: number;
  deliveredQuantity: number;
  consumedQuantity: number;
  damagedQuantity: number;
  unit: string;
  currentLocationName: string;
  currentCoords: Coordinates;
  destinationLocationName?: string;
  status: ResourceStatus;
  responsibleOrg: string;
  assignedIncidentId?: string;
  lastUpdated: string;
}

export interface ResourceDemandEstimate {
  category: ResourceCategory;
  required: number;
  available: number;
  allocated: number;
  delivered: number;
  shortage: number;
  unit: string;
  rationale: string;
  isOperatorOverridden?: boolean;
}

export interface AllocationRecommendation {
  id: string;
  targetArea: string;
  priorityScore: number; // Higher is more urgent
  priorityRationale: string;
  targetPopulation: number;
  category: ResourceCategory;
  recommendedQuantity: number;
  sourceWarehouseId: string;
  approved: boolean;
}

export type ShipmentStatus =
  | 'PLANNED'
  | 'ASSIGNED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'DELAYED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Shipment {
  id: string;
  resourceCategory: ResourceCategory;
  resourceName: string;
  quantity: number;
  unit: string;
  originName: string;
  originCoords: Coordinates;
  destinationName: string;
  destinationCoords: Coordinates;
  vehicleId: string;
  driverName: string;
  driverContact: string;
  assignedTeam: string;
  departureTime: string;
  estimatedArrival: string;
  actualArrival?: string;
  status: ShipmentStatus;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  routeProgressPct: number;
  currentCoords: Coordinates;
  isSimulated: boolean;
}

export type RoadStatus = 'CLEAR' | 'CAUTION' | 'BLOCKED';

export interface EvacuationRoute {
  id: string;
  name: string;
  originName: string;
  originCoords: Coordinates;
  destinationShelterId: string;
  destinationShelterName: string;
  destinationCoords: Coordinates;
  waypoints: Coordinates[];
  distanceKm: number;
  estimatedTravelTimeMin: number;
  status: 'SAFE' | 'CONGESTED' | 'BLOCKED';
  roadSegmentId: string;
  blockageReason?: string;
  isAlternativeRoute?: boolean;
}

export type ShelterStatus = 'OPEN' | 'NEAR_CAPACITY' | 'FULL' | 'DAMAGED' | 'CLOSED';

export interface Shelter {
  id: string;
  name: string;
  locationName: string;
  coords: Coordinates;
  totalCapacity: number;
  currentOccupancy: number;
  availableCapacity: number;
  waterSupplyDays: number;
  foodSupplyDays: number;
  medicalFacilityOnsite: boolean;
  electricityOperational: boolean;
  accessibilityStatus: 'EASY' | 'DIFFICULT' | 'AIR_ONLY';
  status: ShelterStatus;
  shortages: string[];
}

export interface Hospital {
  id: string;
  name: string;
  locationName: string;
  coords: Coordinates;
  totalBeds: number;
  availableBeds: number;
  icuTotal: number;
  icuAvailable: number;
  medicalTeamsOnDuty: number;
  ambulancesAvailable: number;
  bloodUnitsAvailable: number;
  incomingCasualties: number;
  status: 'OPERATIONAL' | 'STRETCHED' | 'CRITICAL_CAPACITY';
}

export interface RescueTeam {
  id: string;
  name: string;
  organization: 'NDRF' | 'SDRF' | 'Indian Army' | 'ITBP' | 'State Police' | 'Fire & Emergency';
  teamType: 'Swift Water Rescue' | 'Mountain Search & Rescue' | 'Medical First Responder' | 'Drone Recon';
  personnelCount: number;
  currentLocationName: string;
  coords: Coordinates;
  status: 'STANDBY' | 'MOBILIZING' | 'DEPLOYED' | 'ACTIVE_RESCUE' | 'RETURNING';
  assignedIncidentId?: string;
  boatsAvailable: number;
  specialEquipment: string[];
  contactRadio: string;
}

export interface EmergencyTask {
  id: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  locationName: string;
  coords: Coordinates;
  assignedTeam: string;
  requiredResources: string;
  deadlineMinutes: number;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED';
  createdTime: string;
  completedTime?: string;
}

export interface DamageRecord {
  id: string;
  assetName: string;
  category:
    | 'BUILDINGS'
    | 'ROADS'
    | 'BRIDGES'
    | 'SCHOOLS'
    | 'HOSPITALS'
    | 'POWER'
    | 'WATER'
    | 'COMMUNICATION'
    | 'AGRICULTURE'
    | 'PUBLIC FACILITIES';
  locationName: string;
  coords: Coordinates;
  damageLevel: 'UNDAMAGED' | 'MINOR' | 'MODERATE' | 'SEVERE' | 'DESTROYED';
  evidenceSource: string;
  inspectionStatus: 'PENDING' | 'GROUND_INSPECTED' | 'SATELLITE_VERIFIED';
  estimatedRepairCostInr: number;
  verificationStatus: 'VERIFIED' | 'PRELIMINARY';
  isSimulatedScenario: boolean;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  actionTaken?: string;
  actor: string;
}

export interface DisasterEvent {
  id: string;
  name: string;
  type: DisasterType;
  location: string;
  coordinates: Coordinates;
  affectedRegion: string;
  startTime: string;
  detectedTime: string;
  currentStatus: DisasterSeverity;
  riskScore: number; // 0 - 100
  confidence: number;
  affectedPopulation: number;
  responseStatus: 'MONITORING' | 'RESCUE_ACTIVE' | 'EVACUATING' | 'RELIEF_DELIVERY' | 'CLOSED';
  severityClassification: 'LEVEL 1' | 'LEVEL 2' | 'LEVEL 3' | 'NATIONAL EMERGENCY';
  dataSources: string[];
  historicalContext: string;
}

export interface AlertNotification {
  id: string;
  disasterId: string;
  type: 'Advisory' | 'Watch' | 'Warning' | 'Critical Alert';
  title: string;
  affectedLocation: string;
  riskScore: number;
  confidence: number;
  evidence: string[];
  timestamp: string;
  affectedPopulation: number;
  recommendedAction: string;
  evacuationRecommendation: boolean;
  authorityApprovalStatus: 'PENDING_APPROVAL' | 'APPROVED_BY_DM' | 'REJECTED';
  approvedBy?: string;
  notificationChannels: {
    dashboard: boolean;
    smsSimulated: boolean;
    emailSimulated: boolean;
    pushSimulated: boolean;
    voiceAlertLocalLanguage: boolean;
  };
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  entity: string;
  oldValue: string;
  newValue: string;
  notes?: string;
}

export interface DataSourceStatus {
  id: string;
  name: string;
  type: 'SATELLITE' | 'WEATHER_API' | 'RAINFALL_RADAR' | 'SEISMIC' | 'IOT_HYDRO' | 'GIS_CADASTRAL';
  status: 'ONLINE' | 'DEGRADED' | 'FALLBACK_ACTIVE';
  lastUpdated: string;
  dataQuality: '99.4%' | '97.8%' | '100% (LOCAL CACHE)' | 'SYNTHETIC_FALLBACK';
  coverage: string;
  isSimulated: boolean;
}

export interface ResponsePerformanceKPI {
  detectionTimeMin: number;
  warningLeadTimeMin: number;
  responseDeploymentTimeMin: number;
  evacuationCompletionPct: number;
  avgLogisticsDelayMin: number;
  shelterCapacityUtilizationPct: number;
  unresolvedIncidentsCount: number;
  platformResponsePerformanceScore: number; // 0 - 100
  scoreLabel: string;
}

export interface SimulationStepState {
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
  timestamp: string;
  autoPlay: boolean;
  activeDisaster: DisasterEvent;
  riskAssessment: RiskAssessment;
  skepticVerification: SkepticVerification;
  impactAssessment: ImpactAssessment;
  demandEstimates: ResourceDemandEstimate[];
  allocations: AllocationRecommendation[];
  shipments: Shipment[];
  evacuationRoutes: EvacuationRoute[];
  shelters: Shelter[];
  timeline: IncidentTimelineEvent[];
  performance: ResponsePerformanceKPI;
}
