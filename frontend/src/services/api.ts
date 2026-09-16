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
  ResponsePerformanceKPI,
  ResourceDemandEstimate,
  AllocationRecommendation,
  AuditLog,
  UserRole
} from '../types';

const API_BASE = '/api';

// Current active role for RBAC
let activeRole: UserRole = 'DISASTER_MANAGER';
let activeUser: string = 'Command Controller (EOC Duty Officer)';

export function setOperatorIdentity(role: UserRole, user: string) {
  activeRole = role;
  activeUser = user;
}

export function getOperatorIdentity(): { role: UserRole; user: string } {
  return { role: activeRole, user: activeUser };
}

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-user-role': activeRole,
    'x-user-name': activeUser
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {})
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn(`[API] Fallback / Offline handler triggered for ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Simulation Controls
  getSimulationState: () => request<any>('/simulation/state'),
  setSimulationStep: (step: number) => request<any>('/simulation/step', { method: 'POST', body: JSON.stringify({ step }) }),
  nextSimulationStep: () => request<any>('/simulation/next', { method: 'POST' }),
  prevSimulationStep: () => request<any>('/simulation/prev', { method: 'POST' }),
  resetSimulation: () => request<any>('/simulation/reset', { method: 'POST' }),

  // Disasters & Risk
  getDisasters: () => request<{ active: DisasterEvent[]; historical: any[] }>('/disasters'),
  getDisaster: (id: string) => request<DisasterEvent>(`/disasters/${id}`),
  getRiskAssessment: (id: string) => request<RiskAssessment>(`/disasters/${id}/risk`),
  calculateRisk: (telemetry: any) => request<RiskAssessment>('/disasters/calculate-risk', { method: 'POST', body: JSON.stringify(telemetry) }),
  verifySkeptic: (data: any) => request<SkepticVerification>('/disasters/skeptic-verify', { method: 'POST', body: JSON.stringify(data) }),
  getImpactAssessment: (id: string) => request<ImpactAssessment>(`/disasters/${id}/impact`),
  getTimeline: (id: string) => request<IncidentTimelineEvent[]>(`/disasters/${id}/timeline`),

  // Alerts
  getAlerts: () => request<any[]>('/alerts'),
  approveAlert: () => request<any>('/alerts/approve', { method: 'POST' }),

  // Map & GIS
  getMapLayers: () => request<any>('/map/layers'),
  updateRoadStatus: (routeId: string, status: string, blockageReason?: string) =>
    request<any>('/map/road-status', { method: 'POST', body: JSON.stringify({ routeId, status, blockageReason }) }),

  // Resources
  getResources: () => request<Resource[]>('/resources'),
  allocateResource: (resourceId: string, quantity: number, destinationShelterId?: string, destinationName?: string) =>
    request<any>('/resources/allocate', { method: 'POST', body: JSON.stringify({ resourceId, quantity, destinationShelterId, destinationName }) }),
  getDemandEstimates: () => request<ResourceDemandEstimate[]>('/resources/demand-estimates'),
  getAllocations: () => request<AllocationRecommendation[]>('/resources/allocations'),

  // Logistics
  getShipments: () => request<Shipment[]>('/logistics/shipments'),
  createShipment: (data: Partial<Shipment>) => request<Shipment>('/logistics/shipments', { method: 'POST', body: JSON.stringify(data) }),
  updateShipment: (id: string, data: Partial<Shipment>) => request<Shipment>(`/logistics/shipments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Shelters & Hospitals
  getShelters: () => request<Shelter[]>('/shelters'),
  updateShelter: (id: string, data: Partial<Shelter>) => request<Shelter>(`/shelters/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getHospitals: () => request<Hospital[]>('/hospitals'),
  getRescueTeams: () => request<RescueTeam[]>('/rescue-teams'),
  getEvacuationRoutes: () => request<EvacuationRoute[]>('/evacuation/routes'),

  // Tasks & Damage
  getTasks: () => request<EmergencyTask[]>('/tasks'),
  createTask: (data: Partial<EmergencyTask>) => request<EmergencyTask>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  getDamageAssessments: () => request<DamageRecord[]>('/damage-assessments'),

  // Post Disaster & Reports
  getResponsePerformance: () => request<ResponsePerformanceKPI>('/post-disaster/performance'),
  getPostDisasterAnalysis: () => request<any>('/post-disaster/analysis'),
  getReports: () => request<any[]>('/reports'),

  // System & Audit
  getDataSources: () => request<DataSourceStatus[]>('/data-sources'),
  getAuditLogs: () => request<AuditLog[]>('/audit-logs'),

  // Satellite Earth Observation & Live Feeds
  getSatelliteConfig: () => request<any>('/satellite/config'),
  updateSatelliteConfig: (data: any) => request<any>('/satellite/config', { method: 'POST', body: JSON.stringify(data) }),
  testSatelliteConnection: (data: any) => request<any>('/satellite/test-connection', { method: 'POST', body: JSON.stringify(data) }),
  getSatelliteLive: () => request<any>('/satellite/live')
};
