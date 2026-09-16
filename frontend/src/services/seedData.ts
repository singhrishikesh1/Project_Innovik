import {
  DisasterEvent,
  RiskAssessment,
  SkepticVerification,
  ImpactAssessment,
  Resource,
  Shipment,
  Shelter,
  Hospital,
  RescueTeam,
  EmergencyTask,
  DamageRecord,
  EvacuationRoute,
  IncidentTimelineEvent,
  DataSourceStatus,
  ResponsePerformanceKPI
} from '../types';

export const initialDisaster: DisasterEvent = {
  id: 'DIS-2026-UK-082',
  name: 'Chamoli Cloudburst & Alaknanda Flash Flood Emergency',
  type: 'Flash Flood',
  location: 'Chamoli District, Uttarakhand, India',
  coordinates: { lat: 30.4128, lng: 79.3242, elevation: 1350 },
  affectedRegion: 'Alaknanda River Catchment Basin (Joshimath - Chamoli - Karnaprayag Corridor)',
  startTime: '2026-09-15T06:00:00Z',
  detectedTime: '2026-09-15T06:20:00Z',
  currentStatus: 'ELEVATED',
  riskScore: 58.4,
  confidence: 0.88,
  affectedPopulation: 14200,
  responseStatus: 'MONITORING',
  severityClassification: 'LEVEL 2',
  dataSources: [
    'IMD Mussoorie Doppler Weather Radar',
    'CWC Gauge 08-ALAK (Chamoli)',
    'Copernicus Sentinel-1 SAR',
    'Sentinel-2 MSI'
  ],
  historicalContext: 'High hydrological vulnerability similar to the 2013 Kedarnath and 2021 Rishi Ganga flash flood corridors.'
};

export const initialRiskAssessment: RiskAssessment = {
  score: 58.4,
  riskLevel: 'ELEVATED',
  confidence: 0.88,
  features: [
    {
      name: 'Precipitation Intensity & 48h Accumulation',
      key: 'precip',
      value: 124.0,
      unit: 'mm',
      weight: 0.25,
      contribution: 15.5,
      description: 'Localized precipitation intensity 38 mm/hr with 124 mm 48-hour accumulation',
      dataSource: 'IMD Automatic Weather Station - Pipalkoti',
      status: 'HIGH'
    },
    {
      name: 'River Gauge Level vs Danger Threshold',
      key: 'hydro',
      value: 3.9,
      unit: 'm',
      weight: 0.20,
      contribution: 12.0,
      description: 'Stage height 3.9m approaching designated danger mark of 4.2m',
      dataSource: 'Central Water Commission Telemetry Station 08-ALAK',
      status: 'HIGH'
    },
    {
      name: 'Slope Angle & Soil Moisture Saturation',
      key: 'terrain',
      value: 78.0,
      unit: '%',
      weight: 0.15,
      contribution: 9.8,
      description: 'Catchment slope 34° with volumetric soil saturation at 78%',
      dataSource: 'NASA SRTM DEM + SMAP Surface Soil Moisture',
      status: 'HIGH'
    },
    {
      name: 'Sentinel-2 NDWI Anomaly',
      key: 'ndwi',
      value: 0.24,
      unit: 'Δ NDWI',
      weight: 0.10,
      contribution: 5.4,
      description: 'Positive surface water spectral anomaly detected in upstream floodplains',
      dataSource: 'Copernicus Sentinel-2 MSI Multi-Spectral',
      status: 'NORMAL'
    },
    {
      name: 'Sentinel-1 SAR Backscatter Coherence Shift',
      key: 'sar',
      value: -2.8,
      unit: 'dB',
      weight: 0.10,
      contribution: 5.6,
      description: 'Backscatter attenuation of -2.8 dB indicative of expanding waterlogged terrain',
      dataSource: 'Copernicus Sentinel-1 C-band Synthetic Aperture Radar',
      status: 'NORMAL'
    },
    {
      name: 'Glacial Lake Extent Expansion Rate',
      key: 'lake',
      value: 14.2,
      unit: '%',
      weight: 0.08,
      contribution: 4.1,
      description: 'Proglacial waterbody area increased by 14.2% over previous 7-day observation',
      dataSource: 'VajraWatch Cryosphere Satellite Monitoring Suite',
      status: 'NORMAL'
    },
    {
      name: 'Seismic Ground Acceleration',
      key: 'seismic',
      value: 0.02,
      unit: 'g',
      weight: 0.07,
      contribution: 3.2,
      description: 'Low-amplitude micro-tremors (PGA 0.02g) detected upstream of Vishnuprayag',
      dataSource: 'National Center for Seismology Broadband Network',
      status: 'NORMAL'
    },
    {
      name: 'Temperature Anomaly & Snowmelt Rate',
      key: 'temp',
      value: 2.1,
      unit: '°C',
      weight: 0.05,
      contribution: 2.8,
      description: '+2.1°C above seasonal isotherm promoting accelerated diurnal snowmelt',
      dataSource: 'ECMWF ERA5 Atmospheric Reanalysis',
      status: 'NORMAL'
    }
  ],
  contributingFactors: [
    'Intense localized rainfall bands along the Alaknanda gorge',
    'Rapid river stage rise of +0.7m over the past 3 hours',
    'High antecedent soil moisture saturation in steep valley walls'
  ],
  missingData: ['High-resolution airborne LiDAR (scheduled for post-event assessment)'],
  dataSources: [
    'IMD Mussoorie Doppler Weather Radar',
    'Central Water Commission Hydrological Network',
    'Copernicus Sentinel Constellation (ESA)',
    'National Center for Seismology (NCS)'
  ],
  timestamp: '2026-09-15T06:30:00Z',
  explanation: 'VajraWatch deterministic engine computed elevated risk index of 58.4/100. Catchment saturation is high and water levels are accelerating toward warning levels.',
  targetLeadTimeHours: 5.5,
  leadTimeLabel: 'Target Warning Lead Time: ~5.5 Hours (Planning Target)'
};

export const initialSkepticVerification: SkepticVerification = {
  isVerified: true,
  confidenceScore: 0.91,
  falseAlarmProbability: 0.065,
  anomaliesDetected: [],
  crossSensorConsistency: 'HIGH',
  challengeNotes: 'Skeptic Agent Cross-Verification: IMD Doppler precipitation echoes correspond with river gauge rising rate at Station 08-ALAK. Satellite SAR backscatter changes align with ground hydro telemetry. No isolated sensor artifact detected.',
  recommendation: 'PROCEED_WITH_WARNING',
  timestamp: '2026-09-15T06:35:00Z'
};

export const initialImpactAssessment: ImpactAssessment = {
  disasterId: 'DIS-2026-UK-082',
  affectedAreaSqKm: 46.8,
  estimatedPopulation: 14200,
  affectedVillages: [
    'Joshimath Foothills Hamlet',
    'Helang Riverside Basti',
    'Pipalkoti Lower Market',
    'Birahi Confluence Settlement',
    'Chamoli Bazaar Low-Lying Sector',
    'Nandaprayag Ghat Colony'
  ],
  infrastructureAtRisk: [
    { name: 'Roads (National Highway NH-58)', totalAtRisk: 18, category: 'roads', criticalLevel: 'CRITICAL' },
    { name: 'Bridges (Alaknanda Crossings)', totalAtRisk: 4, category: 'bridges', criticalLevel: 'CRITICAL' },
    { name: 'Hospitals & Primary Health Centers', totalAtRisk: 2, category: 'hospitals', criticalLevel: 'HIGH' },
    { name: 'Government Primary Schools', totalAtRisk: 6, category: 'schools', criticalLevel: 'MEDIUM' },
    { name: 'Power Substations (33kV)', totalAtRisk: 1, category: 'power', criticalLevel: 'CRITICAL' },
    { name: 'Potable Water Pumping Stations', totalAtRisk: 3, category: 'water', criticalLevel: 'HIGH' },
    { name: 'Cellular Towers (VHF & 4G)', totalAtRisk: 4, category: 'comms', criticalLevel: 'MEDIUM' },
    { name: 'Terraced Agricultural Land (Hectares)', totalAtRisk: 320, category: 'agriculture', criticalLevel: 'HIGH' }
  ],
  agriculturalLandHectares: 320,
  nearestSheltersDistanceKm: [
    { shelterId: 'SHELTER-01', distanceKm: 2.8 },
    { shelterId: 'SHELTER-02', distanceKm: 4.5 },
    { shelterId: 'SHELTER-03', distanceKm: 8.2 }
  ],
  nearestHospitalsDistanceKm: [
    { hospitalId: 'HOSP-01', distanceKm: 3.2 },
    { hospitalId: 'HOSP-02', distanceKm: 14.6 }
  ],
  polygonCoordinates: [
    { lat: 30.5500, lng: 79.4800 },
    { lat: 30.5100, lng: 79.4200 },
    { lat: 30.4300, lng: 79.3400 },
    { lat: 30.3800, lng: 79.3100 },
    { lat: 30.3400, lng: 79.3300 },
    { lat: 30.3600, lng: 79.3700 },
    { lat: 30.4500, lng: 79.4100 },
    { lat: 30.5400, lng: 79.5200 }
  ],
  computedTimestamp: '2026-09-15T06:40:00Z',
  calculationMethod: 'PostGIS Inundation Corridor Boundary & Cadastral Layer Intersection'
};

export const sheltersData: Shelter[] = [
  {
    id: 'SHELTER-01',
    name: 'Alaknanda Higher Secondary School Shelter',
    locationName: 'Chamoli Upper Ridge, Ward 3',
    coords: { lat: 30.4210, lng: 79.3295 },
    totalCapacity: 1200,
    currentOccupancy: 450,
    availableCapacity: 750,
    waterSupplyDays: 4,
    foodSupplyDays: 3,
    medicalFacilityOnsite: true,
    electricityOperational: true,
    accessibilityStatus: 'EASY',
    status: 'OPEN',
    shortages: []
  },
  {
    id: 'SHELTER-02',
    name: 'Chamoli Sports Stadium Emergency Camp',
    locationName: 'District Sports Complex, High Ground',
    coords: { lat: 30.4085, lng: 79.3380 },
    totalCapacity: 2500,
    currentOccupancy: 920,
    availableCapacity: 1580,
    waterSupplyDays: 6,
    foodSupplyDays: 5,
    medicalFacilityOnsite: true,
    electricityOperational: true,
    accessibilityStatus: 'EASY',
    status: 'OPEN',
    shortages: []
  },
  {
    id: 'SHELTER-03',
    name: 'Pipalkoti Community Hall & Transit Shelter',
    locationName: 'Pipalkoti Hill Station, Sector 2',
    coords: { lat: 30.4620, lng: 79.3710 },
    totalCapacity: 800,
    currentOccupancy: 380,
    availableCapacity: 420,
    waterSupplyDays: 2,
    foodSupplyDays: 2,
    medicalFacilityOnsite: false,
    electricityOperational: true,
    accessibilityStatus: 'EASY',
    status: 'OPEN',
    shortages: ['Potable Water Reserve', 'Trauma First-Aid Kits']
  },
  {
    id: 'SHELTER-04',
    name: 'Joshimath Municipal Disaster Relief Complex',
    locationName: 'Upper Joshimath Heights',
    coords: { lat: 30.5560, lng: 79.5680 },
    totalCapacity: 1500,
    currentOccupancy: 610,
    availableCapacity: 890,
    waterSupplyDays: 5,
    foodSupplyDays: 4,
    medicalFacilityOnsite: true,
    electricityOperational: true,
    accessibilityStatus: 'EASY',
    status: 'OPEN',
    shortages: []
  },
  {
    id: 'SHELTER-05',
    name: 'Birahi Government Inter-College Camp',
    locationName: 'Birahi High Terrace',
    coords: { lat: 30.3780, lng: 79.3490 },
    totalCapacity: 900,
    currentOccupancy: 410,
    availableCapacity: 490,
    waterSupplyDays: 3,
    foodSupplyDays: 3,
    medicalFacilityOnsite: false,
    electricityOperational: false,
    accessibilityStatus: 'DIFFICULT',
    status: 'OPEN',
    shortages: ['Emergency Power Generator', 'Potable Water Tanks']
  },
  {
    id: 'SHELTER-06',
    name: 'Nandaprayag Pilgrim Relief Hall',
    locationName: 'Nandaprayag Plateau',
    coords: { lat: 30.3320, lng: 79.3240 },
    totalCapacity: 1000,
    currentOccupancy: 280,
    availableCapacity: 720,
    waterSupplyDays: 4,
    foodSupplyDays: 4,
    medicalFacilityOnsite: true,
    electricityOperational: true,
    accessibilityStatus: 'EASY',
    status: 'OPEN',
    shortages: []
  }
];

export const hospitalsData: Hospital[] = [
  {
    id: 'HOSP-01',
    name: 'Chamoli District Hospital (District HQ)',
    locationName: 'Gopeshwar-Chamoli Road',
    coords: { lat: 30.4190, lng: 79.3320 },
    totalBeds: 200,
    availableBeds: 68,
    icuTotal: 24,
    icuAvailable: 8,
    medicalTeamsOnDuty: 6,
    ambulancesAvailable: 5,
    bloodUnitsAvailable: 84,
    incomingCasualties: 4,
    status: 'OPERATIONAL'
  },
  {
    id: 'HOSP-02',
    name: 'Karnaprayag Sub-Divisional Base Hospital',
    locationName: 'Karnaprayag Confluence Road',
    coords: { lat: 30.2600, lng: 79.2210 },
    totalBeds: 120,
    availableBeds: 45,
    icuTotal: 12,
    icuAvailable: 5,
    medicalTeamsOnDuty: 4,
    ambulancesAvailable: 4,
    bloodUnitsAvailable: 52,
    incomingCasualties: 2,
    status: 'OPERATIONAL'
  },
  {
    id: 'HOSP-03',
    name: 'Joshimath Army & Civil Emergency Hospital',
    locationName: 'Joshimath Cantonment Road',
    coords: { lat: 30.5510, lng: 79.5610 },
    totalBeds: 150,
    availableBeds: 58,
    icuTotal: 18,
    icuAvailable: 7,
    medicalTeamsOnDuty: 5,
    ambulancesAvailable: 3,
    bloodUnitsAvailable: 65,
    incomingCasualties: 0,
    status: 'OPERATIONAL'
  },
  {
    id: 'HOSP-04',
    name: 'AIIMS Rishikesh (Tertiary Emergency Hub)',
    locationName: 'Virbhadra Road, Rishikesh',
    coords: { lat: 30.0760, lng: 78.2910 },
    totalBeds: 800,
    availableBeds: 185,
    icuTotal: 120,
    icuAvailable: 34,
    medicalTeamsOnDuty: 22,
    ambulancesAvailable: 16,
    bloodUnitsAvailable: 420,
    incomingCasualties: 0,
    status: 'OPERATIONAL'
  }
];

export const rescueTeamsData: RescueTeam[] = [
  {
    id: 'TEAM-NDRF-01',
    name: 'NDRF 8th Battalion Unit Alpha',
    organization: 'NDRF',
    teamType: 'Swift Water Rescue',
    personnelCount: 45,
    currentLocationName: 'Pipalkoti Forward Base',
    coords: { lat: 30.4580, lng: 79.3690 },
    status: 'ACTIVE_RESCUE',
    assignedIncidentId: 'DIS-2026-UK-082',
    boatsAvailable: 6,
    specialEquipment: ['Inflatable Zodiac Boats', 'Outboard Motors', 'High-Angle Rope Gear', 'Sonar Sonobuoy'],
    contactRadio: 'NDRF-CH-12 (154.250 MHz)'
  },
  {
    id: 'TEAM-NDRF-02',
    name: 'NDRF 8th Battalion Unit Bravo',
    organization: 'NDRF',
    teamType: 'Mountain Search & Rescue',
    personnelCount: 40,
    currentLocationName: 'Chamoli Police Lines Hub',
    coords: { lat: 30.4140, lng: 79.3280 },
    status: 'DEPLOYED',
    assignedIncidentId: 'DIS-2026-UK-082',
    boatsAvailable: 4,
    specialEquipment: ['Victim Locating Acoustic Cameras', 'Lifting Bags', 'Hydraulic Cutters'],
    contactRadio: 'NDRF-CH-14 (154.300 MHz)'
  },
  {
    id: 'TEAM-SDRF-01',
    name: 'SDRF Uttarakhand Rapid Action Unit',
    organization: 'SDRF',
    teamType: 'Swift Water Rescue',
    personnelCount: 30,
    currentLocationName: 'Helang Outpost',
    coords: { lat: 30.5080, lng: 79.4210 },
    status: 'ACTIVE_RESCUE',
    assignedIncidentId: 'DIS-2026-UK-082',
    boatsAvailable: 4,
    specialEquipment: ['Lifebuoys', 'Diver Scuba Sets', 'Rafts'],
    contactRadio: 'SDRF-TAC-1 (148.100 MHz)'
  },
  {
    id: 'TEAM-ARMY-01',
    name: 'Indian Army 14 Garhwal Rifles Disaster Detachment',
    organization: 'Indian Army',
    teamType: 'Mountain Search & Rescue',
    personnelCount: 60,
    currentLocationName: 'Joshimath Garrison Station',
    coords: { lat: 30.5520, lng: 79.5640 },
    status: 'MOBILIZING',
    assignedIncidentId: 'DIS-2026-UK-082',
    boatsAvailable: 2,
    specialEquipment: ['Bailey Bridge Heavy Launchers', 'Tracked Excavator', 'ALH Dhruv Support'],
    contactRadio: 'ARMY-SEC-OPS (HF-8100)'
  },
  {
    id: 'TEAM-ITBP-01',
    name: 'ITBP 1st Battalion High-Altitude Rescue Group',
    organization: 'ITBP',
    teamType: 'Mountain Search & Rescue',
    personnelCount: 35,
    currentLocationName: 'Birahi Gorge Post',
    coords: { lat: 30.3810, lng: 79.3510 },
    status: 'DEPLOYED',
    assignedIncidentId: 'DIS-2026-UK-082',
    boatsAvailable: 2,
    specialEquipment: ['Crevasse Rescue Rigs', 'Extreme Weather Shelters', 'Satellite Comms BGAN'],
    contactRadio: 'ITBP-NET-4'
  },
  {
    id: 'TEAM-FIRE-01',
    name: 'Chamoli District Fire & Emergency Services',
    organization: 'Fire & Emergency',
    teamType: 'Medical First Responder',
    personnelCount: 25,
    currentLocationName: 'Chamoli HQ Station',
    coords: { lat: 30.4100, lng: 79.3260 },
    status: 'DEPLOYED',
    assignedIncidentId: 'DIS-2026-UK-082',
    boatsAvailable: 1,
    specialEquipment: ['Heavy Dewatering High-Discharge Pumps', 'Emergency Foggers', 'Cutting Torches'],
    contactRadio: 'FIRE-VHF-101'
  }
];

export const resourcesData: Resource[] = [
  {
    id: 'RES-FOOD-01',
    category: 'Food packets',
    name: 'MRE Emergency Ready-to-Eat Ration Packs',
    quantity: 10000,
    availableQuantity: 6200,
    allocatedQuantity: 2800,
    inTransitQuantity: 1000,
    deliveredQuantity: 0,
    consumedQuantity: 0,
    damagedQuantity: 0,
    unit: 'packets',
    currentLocationName: 'Central Relief Warehouse, Chamoli District HQ',
    currentCoords: { lat: 30.4090, lng: 79.3270 },
    status: 'AVAILABLE',
    responsibleOrg: 'District Supply Office & Red Cross Society',
    assignedIncidentId: 'DIS-2026-UK-082',
    lastUpdated: '2026-09-15T06:45:00Z'
  },
  {
    id: 'RES-WATER-01',
    category: 'Drinking water (L)',
    name: '20L Sealed Potable Water Cans & Sachets',
    quantity: 25000,
    availableQuantity: 16500,
    allocatedQuantity: 6000,
    inTransitQuantity: 2500,
    deliveredQuantity: 0,
    consumedQuantity: 0,
    damagedQuantity: 0,
    unit: 'Liters',
    currentLocationName: 'Jal Sansthan Regional Depot, Pipalkoti',
    currentCoords: { lat: 30.4600, lng: 79.3700 },
    status: 'AVAILABLE',
    responsibleOrg: 'Uttarakhand Jal Sansthan',
    assignedIncidentId: 'DIS-2026-UK-082',
    lastUpdated: '2026-09-15T06:45:00Z'
  },
  {
    id: 'RES-MED-01',
    category: 'First-aid kits',
    name: 'Community Disaster Trauma First-Aid Kits',
    quantity: 150,
    availableQuantity: 95,
    allocatedQuantity: 35,
    inTransitQuantity: 20,
    deliveredQuantity: 0,
    consumedQuantity: 0,
    damagedQuantity: 0,
    unit: 'kits',
    currentLocationName: 'Chief Medical Officer Central Store, Gopeshwar',
    currentCoords: { lat: 30.4200, lng: 79.3310 },
    status: 'AVAILABLE',
    responsibleOrg: 'Department of Health & Family Welfare',
    assignedIncidentId: 'DIS-2026-UK-082',
    lastUpdated: '2026-09-15T06:45:00Z'
  },
  {
    id: 'RES-BOAT-01',
    category: 'Boats',
    name: 'Inflatable Zodiac Swift-Water Rescue Boats with 40HP OBM',
    quantity: 12,
    availableQuantity: 4,
    allocatedQuantity: 4,
    inTransitQuantity: 4,
    deliveredQuantity: 0,
    consumedQuantity: 0,
    damagedQuantity: 0,
    unit: 'units',
    currentLocationName: 'NDRF Regional Response Center, Pipalkoti',
    currentCoords: { lat: 30.4570, lng: 79.3680 },
    status: 'ALLOCATED',
    responsibleOrg: 'NDRF 8th Battalion',
    assignedIncidentId: 'DIS-2026-UK-082',
    lastUpdated: '2026-09-15T06:45:00Z'
  },
  {
    id: 'RES-AMB-01',
    category: 'Ambulances',
    name: '108 Advanced Life Support (ALS) 4x4 Emergency Ambulances',
    quantity: 16,
    availableQuantity: 8,
    allocatedQuantity: 5,
    inTransitQuantity: 3,
    deliveredQuantity: 0,
    consumedQuantity: 0,
    damagedQuantity: 0,
    unit: 'vehicles',
    currentLocationName: '108 Emergency Ambulance Staging Ground, Chamoli',
    currentCoords: { lat: 30.4130, lng: 79.3250 },
    status: 'AVAILABLE',
    responsibleOrg: 'GVK EMRI 108 Emergency Services',
    assignedIncidentId: 'DIS-2026-UK-082',
    lastUpdated: '2026-09-15T06:45:00Z'
  },
  {
    id: 'RES-TENT-01',
    category: 'Tents',
    name: 'All-Weather Thermal Family Relief Tents (6-Person)',
    quantity: 600,
    availableQuantity: 420,
    allocatedQuantity: 120,
    inTransitQuantity: 60,
    deliveredQuantity: 0,
    consumedQuantity: 0,
    damagedQuantity: 0,
    unit: 'tents',
    currentLocationName: 'Central Relief Warehouse, Chamoli District HQ',
    currentCoords: { lat: 30.4090, lng: 79.3270 },
    status: 'AVAILABLE',
    responsibleOrg: 'State Disaster Management Authority (USDMA)',
    assignedIncidentId: 'DIS-2026-UK-082',
    lastUpdated: '2026-09-15T06:45:00Z'
  },
  {
    id: 'RES-GEN-01',
    category: 'Power generators',
    name: 'Heavy Duty 15kVA Diesel Silent Generators',
    quantity: 14,
    availableQuantity: 8,
    allocatedQuantity: 4,
    inTransitQuantity: 2,
    deliveredQuantity: 0,
    consumedQuantity: 0,
    damagedQuantity: 0,
    unit: 'units',
    currentLocationName: 'UPCL Power Grid Substation Yard, Pipalkoti',
    currentCoords: { lat: 30.4630, lng: 79.3730 },
    status: 'AVAILABLE',
    responsibleOrg: 'Uttarakhand Power Corporation Limited',
    assignedIncidentId: 'DIS-2026-UK-082',
    lastUpdated: '2026-09-15T06:45:00Z'
  },
  {
    id: 'RES-DRONE-01',
    category: 'Drones',
    name: 'Thermal Imaging Long-Range Recon Drones (DJI Matrice 350 RTK)',
    quantity: 6,
    availableQuantity: 3,
    allocatedQuantity: 2,
    inTransitQuantity: 1,
    deliveredQuantity: 0,
    consumedQuantity: 0,
    damagedQuantity: 0,
    unit: 'units',
    currentLocationName: 'Disaster Control Room, Chamoli Collectorate',
    currentCoords: { lat: 30.4150, lng: 79.3290 },
    status: 'AVAILABLE',
    responsibleOrg: 'State Disaster Response Force Drone Cell',
    assignedIncidentId: 'DIS-2026-UK-082',
    lastUpdated: '2026-09-15T06:45:00Z'
  }
];

export const shipmentsData: Shipment[] = [
  {
    id: 'SHIP-UK-104',
    resourceCategory: 'Food packets',
    resourceName: 'Ready-to-Eat Ration Packs (1,000 units)',
    quantity: 1000,
    unit: 'packets',
    originName: 'Central Relief Warehouse, Chamoli',
    originCoords: { lat: 30.4090, lng: 79.3270 },
    destinationName: 'Alaknanda High School Shelter (SHELTER-01)',
    destinationCoords: { lat: 30.4210, lng: 79.3295 },
    vehicleId: 'TRUCK-UK-07-GA-4102',
    driverName: 'Surinder Singh Rawat',
    driverContact: '+91 94120-XXXXX',
    assignedTeam: 'Logistics Convoy Unit Delta',
    departureTime: '2026-09-15T07:15:00Z',
    estimatedArrival: '2026-09-15T07:45:00Z',
    status: 'IN_TRANSIT',
    priority: 'HIGH',
    routeProgressPct: 45,
    currentCoords: { lat: 30.4150, lng: 79.3282 },
    isSimulated: true
  },
  {
    id: 'SHIP-UK-105',
    resourceCategory: 'Drinking water (L)',
    resourceName: '20L Sealed Drinking Water Cans (2,500 L)',
    quantity: 2500,
    unit: 'Liters',
    originName: 'Jal Sansthan Regional Depot, Pipalkoti',
    originCoords: { lat: 30.4600, lng: 79.3700 },
    destinationName: 'Chamoli Sports Stadium Camp (SHELTER-02)',
    destinationCoords: { lat: 30.4085, lng: 79.3380 },
    vehicleId: 'TRUCK-UK-07-CA-8831',
    driverName: 'Mohan Lal Negi',
    driverContact: '+91 98371-XXXXX',
    assignedTeam: 'Water Relief Taskforce',
    departureTime: '2026-09-15T07:20:00Z',
    estimatedArrival: '2026-09-15T07:55:00Z',
    status: 'IN_TRANSIT',
    priority: 'CRITICAL',
    routeProgressPct: 35,
    currentCoords: { lat: 30.4420, lng: 79.3510 },
    isSimulated: true
  },
  {
    id: 'SHIP-UK-106',
    resourceCategory: 'First-aid kits',
    resourceName: 'Community Trauma First-Aid Kits (20 Kits)',
    quantity: 20,
    unit: 'kits',
    originName: 'Chief Medical Officer Central Store',
    originCoords: { lat: 30.4200, lng: 79.3310 },
    destinationName: 'Pipalkoti Community Hall Shelter (SHELTER-03)',
    destinationCoords: { lat: 30.4620, lng: 79.3710 },
    vehicleId: 'AMB-UK-07-G-1108',
    driverName: 'Dr. R. K. Bhatt (Convoy Lead)',
    driverContact: '+91 94111-XXXXX',
    assignedTeam: 'Mobile Emergency Medical Corps',
    departureTime: '2026-09-15T07:30:00Z',
    estimatedArrival: '2026-09-15T08:10:00Z',
    status: 'PLANNED',
    priority: 'HIGH',
    routeProgressPct: 0,
    currentCoords: { lat: 30.4200, lng: 79.3310 },
    isSimulated: true
  }
];

export const evacuationRoutesData: EvacuationRoute[] = [
  {
    id: 'ROUTE-PRIM-01',
    name: 'Primary Arterial Corridor: Pipalkoti Lowland to Shelter-02 (Via NH-58)',
    originName: 'Pipalkoti Lower Market Settlement',
    originCoords: { lat: 30.4590, lng: 79.3690 },
    destinationShelterId: 'SHELTER-02',
    destinationShelterName: 'Chamoli Sports Stadium Emergency Camp',
    destinationCoords: { lat: 30.4085, lng: 79.3380 },
    waypoints: [
      { lat: 30.4590, lng: 79.3690 },
      { lat: 30.4480, lng: 79.3580 },
      { lat: 30.4350, lng: 79.3450 },
      { lat: 30.4220, lng: 79.3340 },
      { lat: 30.4085, lng: 79.3380 }
    ],
    distanceKm: 8.4,
    estimatedTravelTimeMin: 18,
    status: 'SAFE',
    roadSegmentId: 'NH58-SEC-CHAMOLI'
  },
  {
    id: 'ROUTE-ALT-02',
    name: 'High-Ground Ridge Bypass Corridor (Pipalkoti to Shelter-01 via Upper Terrace)',
    originName: 'Pipalkoti Lower Market Settlement',
    originCoords: { lat: 30.4590, lng: 79.3690 },
    destinationShelterId: 'SHELTER-01',
    destinationShelterName: 'Alaknanda Higher Secondary School Shelter',
    destinationCoords: { lat: 30.4210, lng: 79.3295 },
    waypoints: [
      { lat: 30.4590, lng: 79.3690 },
      { lat: 30.4610, lng: 79.3520 },
      { lat: 30.4450, lng: 79.3380 },
      { lat: 30.4310, lng: 79.3310 },
      { lat: 30.4210, lng: 79.3295 }
    ],
    distanceKm: 11.2,
    estimatedTravelTimeMin: 26,
    status: 'SAFE',
    roadSegmentId: 'RIDGE-BYPASS-01',
    isAlternativeRoute: true
  },
  {
    id: 'ROUTE-RIV-03',
    name: 'Joshimath Foothills to Joshimath Municipal Shelter',
    originName: 'Joshimath Foothills Hamlet',
    originCoords: { lat: 30.5480, lng: 79.5580 },
    destinationShelterId: 'SHELTER-04',
    destinationShelterName: 'Joshimath Municipal Disaster Relief Complex',
    destinationCoords: { lat: 30.5560, lng: 79.5640 },
    waypoints: [
      { lat: 30.5480, lng: 79.5580 },
      { lat: 30.5520, lng: 79.5610 },
      { lat: 30.5560, lng: 79.5640 }
    ],
    distanceKm: 2.1,
    estimatedTravelTimeMin: 12,
    status: 'SAFE',
    roadSegmentId: 'JM-UPPER-RD'
  }
];

export const emergencyTasksData: EmergencyTask[] = [
  {
    id: 'TASK-001',
    title: 'Sound Public Air Raid Siren & Broadcast Evacuation Advisory in Ward 2 & 4',
    priority: 'CRITICAL',
    locationName: 'Chamoli Low-Lying Riverfront',
    coords: { lat: 30.4120, lng: 79.3240 },
    assignedTeam: 'Chamoli Police Lines & Civil Defense',
    requiredResources: 'VHF Megaphones, Mobile Public Address Vans',
    deadlineMinutes: 30,
    status: 'IN_PROGRESS',
    createdTime: '2026-09-15T06:45:00Z'
  },
  {
    id: 'TASK-002',
    title: 'Pre-position 2 Inflatable Swift-Water Rescue Boats at Helang Confluence',
    priority: 'HIGH',
    locationName: 'Helang Outpost Ghat',
    coords: { lat: 30.5080, lng: 79.4210 },
    assignedTeam: 'SDRF Uttarakhand Rapid Action Unit',
    requiredResources: '2 Inflatable Boats, Life Jackets, Throwlines',
    deadlineMinutes: 45,
    status: 'IN_PROGRESS',
    createdTime: '2026-09-15T07:00:00Z'
  },
  {
    id: 'TASK-003',
    title: 'Setup Emergency Mobile Medical Triaging Station at Shelter-02',
    priority: 'HIGH',
    locationName: 'Chamoli Sports Stadium Emergency Camp',
    coords: { lat: 30.4085, lng: 79.3380 },
    assignedTeam: 'Chief Medical Officer Mobile Corps',
    requiredResources: 'Trauma Kits, Portable Oxygen Concentrators',
    deadlineMinutes: 60,
    status: 'OPEN',
    createdTime: '2026-09-15T07:15:00Z'
  }
];

export const damageRecordsData: DamageRecord[] = [
  {
    id: 'DMG-ASSET-01',
    assetName: 'Alaknanda Suspension Footbridge (Connecting Ward 2 to North Bank)',
    category: 'BRIDGES',
    locationName: 'Chamoli North Ghat',
    coords: { lat: 30.4135, lng: 79.3248 },
    damageLevel: 'SEVERE',
    evidenceSource: 'Drone Thermal Recon & On-Site Police Verification',
    inspectionStatus: 'GROUND_INSPECTED',
    estimatedRepairCostInr: 4500000,
    verificationStatus: 'VERIFIED',
    isSimulatedScenario: true
  },
  {
    id: 'DMG-ASSET-02',
    assetName: 'National Highway NH-58 Roadbed (Km 42 Debris Inundation)',
    category: 'ROADS',
    locationName: 'Birahi-Chamoli Choke Point',
    coords: { lat: 30.4350, lng: 79.3450 },
    damageLevel: 'MODERATE',
    evidenceSource: 'SDRF Patrol Telemetry & Road Inspector Log',
    inspectionStatus: 'GROUND_INSPECTED',
    estimatedRepairCostInr: 2800000,
    verificationStatus: 'VERIFIED',
    isSimulatedScenario: true
  },
  {
    id: 'DMG-ASSET-03',
    assetName: 'Pipalkoti Lower Riverfront Market Stalls (14 Structures)',
    category: 'BUILDINGS',
    locationName: 'Pipalkoti Commercial Riverside',
    coords: { lat: 30.4585, lng: 79.3695 },
    damageLevel: 'MODERATE',
    evidenceSource: 'Sentinel-1 SAR Amplitude Attenuation & Drone Video',
    inspectionStatus: 'SATELLITE_VERIFIED',
    estimatedRepairCostInr: 3200000,
    verificationStatus: 'PRELIMINARY',
    isSimulatedScenario: true
  },
  {
    id: 'DMG-ASSET-04',
    assetName: 'Government Primary School Birahi Riverside Annexe',
    category: 'SCHOOLS',
    locationName: 'Birahi Confluence Lower Ward',
    coords: { lat: 30.3770, lng: 79.3480 },
    damageLevel: 'MINOR',
    evidenceSource: 'Local Gram Panchayat Village Officer Report',
    inspectionStatus: 'GROUND_INSPECTED',
    estimatedRepairCostInr: 650000,
    verificationStatus: 'VERIFIED',
    isSimulatedScenario: true
  },
  {
    id: 'DMG-ASSET-05',
    assetName: '33kV Electrical Power Transmission Substation Pipalkoti',
    category: 'POWER',
    locationName: 'Pipalkoti Industrial Yard',
    coords: { lat: 30.4630, lng: 79.3730 },
    damageLevel: 'MINOR',
    evidenceSource: 'UPCL SCADA Telemetry Trip Log',
    inspectionStatus: 'GROUND_INSPECTED',
    estimatedRepairCostInr: 1200000,
    verificationStatus: 'VERIFIED',
    isSimulatedScenario: true
  },
  {
    id: 'DMG-ASSET-06',
    assetName: 'Terraced Paddy & Apple Orchards (45 Hectares Inundated)',
    category: 'AGRICULTURE',
    locationName: 'Helang Terraced Valley Slopes',
    coords: { lat: 30.5090, lng: 79.4230 },
    damageLevel: 'SEVERE',
    evidenceSource: 'Copernicus Sentinel-2 NDWI Spectral Mapping',
    inspectionStatus: 'SATELLITE_VERIFIED',
    estimatedRepairCostInr: 5800000,
    verificationStatus: 'VERIFIED',
    isSimulatedScenario: true
  }
];

export const incidentTimelineData: IncidentTimelineEvent[] = [
  {
    id: 'EVT-001',
    timestamp: '2026-09-15T06:00:00Z',
    title: 'Intense Upper-Catchment Cloudburst Detected',
    description: 'IMD Doppler Radar detected localized convective cloudburst band exceeding 45 mm/hr over the upper Alaknanda catchment.',
    severity: 'INFO',
    actor: 'IMD Radar Automated Ingest'
  },
  {
    id: 'EVT-002',
    timestamp: '2026-09-15T06:20:00Z',
    title: 'River Water Gauge Surge at Station 08-ALAK',
    description: 'CWC Telemetry recorded river level rising +0.7m within 20 minutes, approaching danger baseline of 4.2m.',
    severity: 'WARNING',
    actor: 'CWC Hydro Telemetry Station'
  },
  {
    id: 'EVT-003',
    timestamp: '2026-09-15T06:30:00Z',
    title: 'VajraWatch 8-Feature Risk Engine Computed Score 58.4',
    description: 'Deterministic risk engine evaluated precipitation, slope saturation, SAR coherence, and river stage, triggering ELEVATED risk status.',
    severity: 'WARNING',
    actor: 'VajraWatch Prediction Engine'
  },
  {
    id: 'EVT-004',
    timestamp: '2026-09-15T06:35:00Z',
    title: 'Skeptic Verification Agent Validated Incident Telemetry',
    description: 'Skeptic Agent confirmed multi-modal convergence between ground radar and hydrological gauges. No sensor malfunction detected; false alarm probability calculated at 0.065.',
    severity: 'SUCCESS',
    actor: 'Skeptic Verification Agent'
  }
];

export const initialPerformanceKPI: ResponsePerformanceKPI = {
  detectionTimeMin: 18,
  warningLeadTimeMin: 260,
  responseDeploymentTimeMin: 22,
  evacuationCompletionPct: 82.5,
  avgLogisticsDelayMin: 14.2,
  shelterCapacityUtilizationPct: 58.0,
  unresolvedIncidentsCount: 0,
  platformResponsePerformanceScore: 89.4,
  scoreLabel: 'Platform Response Performance Indicator: HIGH EFFICIENCY (89.4/100)'
};
