import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { generateDisasterPDFReport } from './services/pdfReport';

// Main Presentation Views matching Screenshots
import { LandingPage } from './components/LandingPage';
import { UnifiedDashboard } from './components/UnifiedDashboard';
import { SystemDirectoryView } from './components/SystemDirectoryView';
import { CitizenPortal } from './components/CitizenPortal';
import { VolunteerPortal } from './components/VolunteerPortal';

// Modals & Drawers
import { SimulationStudioDrawer } from './components/SimulationStudioDrawer';
import { SatelliteKeyModal } from './components/SatelliteKeyModal';

// Specialized Deep Disaster Management Modules
import { CommandCenter } from './pages/CommandCenter';
import { PredictionDashboard } from './pages/PredictionDashboard';
import { EarlyWarningCenter } from './pages/EarlyWarningCenter';
import { LiveDisasterMap } from './pages/LiveDisasterMap';
import { IncidentDetails } from './pages/IncidentDetails';
import { ImpactAssessmentPage } from './pages/ImpactAssessment';
import { ResourceManagement } from './pages/ResourceManagement';
import { ResourceAllocation } from './pages/ResourceAllocation';
import { LogisticsTracking } from './pages/LogisticsTracking';
import { EvacuationPlanner } from './pages/EvacuationPlanner';
import { ShelterManagement } from './pages/ShelterManagement';
import { HospitalManagement } from './pages/HospitalManagement';
import { RescueTeamManagement } from './pages/RescueTeamManagement';
import { TaskManagement } from './pages/TaskManagement';
import { SatelliteAnalysis } from './pages/SatelliteAnalysis';
import { SensorMonitoring } from './pages/SensorMonitoring';
import { HistoricalIntelligence } from './pages/HistoricalIntelligence';
import { PostDisasterAnalysis } from './pages/PostDisasterAnalysis';
import { DamageAssessment } from './pages/DamageAssessment';
import { ResourcePerformance } from './pages/ResourcePerformance';
import { ReportsList } from './pages/ReportsList';
import { DisasterReportViewer } from './pages/DisasterReportViewer';
import { DataSources } from './pages/DataSources';
import { AuditLogViewer } from './pages/AuditLogViewer';
import { SettingsPage } from './pages/Settings';
import { LoginPage } from './pages/Login';

// Seed data fallback for instant zero-crash UI boot
import {
  initialDisaster,
  initialRiskAssessment,
  initialSkepticVerification,
  initialImpactAssessment,
  sheltersData,
  hospitalsData,
  rescueTeamsData,
  resourcesData,
  shipmentsData,
  evacuationRoutesData,
  emergencyTasksData,
  damageRecordsData,
  incidentTimelineData,
  initialPerformanceKPI
} from './services/seedData';

import { ArrowLeft, Satellite, Zap, FileDown, Shield } from 'lucide-react';

export function App() {
  // Start on the beautiful minimal Landing Page (Screenshot 1)
  const [activePage, setActivePage] = useState<string>('landing');
  const [loading, setLoading] = useState<boolean>(true);

  // Modals and Drawers
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);
  const [isSatelliteModalOpen, setIsSatelliteModalOpen] = useState<boolean>(false);
  const [isLiveSatelliteKeyConfigured, setIsLiveSatelliteKeyConfigured] = useState<boolean>(false);

  // Core Simulation & Scenario State
  const [simState, setSimState] = useState<any>({
    currentStep: 1,
    totalSteps: 20,
    stepTitle: 'Step 1: Baseline Meteorological Ingest',
    stepDescription: 'Normal monsoon monitoring baseline. IMD weather telemetry and river gauges indicate stable hydrological levels.',
    activeDisaster: initialDisaster,
    riskAssessment: initialRiskAssessment,
    skepticVerification: initialSkepticVerification,
    impactAssessment: initialImpactAssessment,
    shelters: sheltersData,
    resources: resourcesData,
    shipments: shipmentsData,
    evacuationRoutes: evacuationRoutesData,
    timeline: incidentTimelineData,
    performance: initialPerformanceKPI,
    demandEstimates: [],
    allocations: []
  });

  const [hospitals] = useState(hospitalsData);
  const [rescueTeams] = useState(rescueTeamsData);
  const [tasks] = useState(emergencyTasksData);
  const [damageRecords] = useState(damageRecordsData);

  // Check Satellite Key Configuration
  const checkSatelliteKey = useCallback(async () => {
    try {
      const cfg = await api.getSatelliteConfig();
      if (cfg) {
        setIsLiveSatelliteKeyConfigured(Boolean(cfg.isLiveKeyConfigured));
      }
    } catch (e) {
      // Fallback
    }
  }, []);

  // Synchronize state with backend
  const fetchFullState = useCallback(async () => {
    try {
      const state = await api.getSimulationState();
      if (state && state.currentStep) {
        setSimState((prev: any) => ({
          ...prev,
          currentStep: state.currentStep,
          totalSteps: state.totalSteps || 20,
          stepTitle: state.stepInfo?.title || prev.stepTitle,
          stepDescription: state.stepInfo?.desc || prev.stepDescription,
          activeDisaster: state.activeDisaster || prev.activeDisaster,
          riskAssessment: state.riskAssessment || prev.riskAssessment,
          skepticVerification: state.skepticVerification || prev.skepticVerification,
          impactAssessment: state.impactAssessment || prev.impactAssessment,
          shelters: state.shelters || prev.shelters,
          resources: state.resources || prev.resources,
          shipments: state.shipments || prev.shipments,
          evacuationRoutes: state.evacuationRoutes || prev.evacuationRoutes,
          timeline: state.timeline || prev.timeline,
          performance: state.performance || prev.performance,
          demandEstimates: state.demandEstimates || prev.demandEstimates,
          allocations: state.allocations || prev.allocations
        }));
      }
      checkSatelliteKey();
    } catch (err) {
      console.warn('Backend offline or initializing; using local embedded seed dataset.');
    } finally {
      setLoading(false);
    }
  }, [checkSatelliteKey]);

  useEffect(() => {
    fetchFullState();
  }, [fetchFullState]);

  // 1-Click PDF Report Download
  const handleDownloadPDF = () => {
    try {
      const doc = generateDisasterPDFReport({
        disaster: simState.activeDisaster,
        risk: simState.riskAssessment,
        skeptic: simState.skepticVerification,
        impact: simState.impactAssessment,
        performance: simState.performance,
        postDisasterAnalysis: {},
        damageRecords,
        resources: simState.resources
      });
      doc.save(`VajraWatch_Incident_Report_${simState.activeDisaster.id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF report:', err);
    }
  };

  // Header for specialized deep submodules
  const renderDeepViewHeader = (pageTitle: string) => (
    <div className="bg-[#090e1c] border-b border-white/10 px-6 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActivePage('dashboard')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-colors border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
        <span className="text-slate-600 font-mono text-xs">/</span>
        <span className="font-semibold text-xs text-white uppercase tracking-wider font-mono">
          {pageTitle}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsSatelliteModalOpen(true)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm ${
            isLiveSatelliteKeyConfigured
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
              : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10 hover:text-white'
          }`}
          title="Configure Satellite API Key"
        >
          <Satellite className="w-3.5 h-3.5 text-sky-400" />
          <span>Satellite Feed</span>
          <span className={`w-1.5 h-1.5 rounded-full ${isLiveSatelliteKeyConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
        </button>

        <button
          onClick={() => setIsStudioOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors flex items-center gap-1"
        >
          <Zap className="w-3.5 h-3.5 text-sky-400" />
          <span>Studio (Step {simState.currentStep}/20)</span>
          <span className="text-[10px] text-sky-400 font-mono">↗</span>
        </button>

        <button
          onClick={() => setActivePage('directory')}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
        >
          System Directory ↗
        </button>

        <button
          onClick={handleDownloadPDF}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>PDF Report</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* VIEW 1: Stunning Space Landing Page (Screenshot 1) */}
      {activePage === 'landing' && (
        <LandingPage
          onOpenDashboard={() => setActivePage('dashboard')}
          onOpenCitizens={() => setActivePage('citizens')}
          onOpenVolunteers={() => setActivePage('volunteers')}
          onOpenDirectory={() => setActivePage('directory')}
          onOpenEvacuation={() => setActivePage('evacuation')}
          onOpenSatelliteModal={() => setIsSatelliteModalOpen(true)}
          activeDisasterName={simState.activeDisaster?.name}
          threatLevel={simState.riskAssessment?.score > 70 ? 'CODE RED' : 'WATCH'}
        />
      )}

      {/* VIEW 2: Minimal & Simple Unified Dashboard (Screenshots 2 & 3) */}
      {activePage === 'dashboard' && (
        <UnifiedDashboard
          activeDisaster={simState.activeDisaster}
          riskAssessment={simState.riskAssessment}
          skepticVerification={simState.skepticVerification}
          shelters={simState.shelters}
          shipments={simState.shipments}
          evacuationRoutes={simState.evacuationRoutes}
          currentStep={simState.currentStep}
          totalSteps={simState.totalSteps}
          onOpenStudio={() => setIsStudioOpen(true)}
          onOpenDirectory={() => setActivePage('directory')}
          onOpenSatelliteModal={() => setIsSatelliteModalOpen(true)}
          onDownloadPDF={handleDownloadPDF}
          onBackToLanding={() => setActivePage('landing')}
        />
      )}

      {/* VIEW 3: System Directory View (Screenshot 4) */}
      {activePage === 'directory' && (
        <SystemDirectoryView
          onNavigate={(pageId) => setActivePage(pageId)}
          onBackToDashboard={() => setActivePage('dashboard')}
          onDownloadPDF={handleDownloadPDF}
        />
      )}

      {/* VIEW 4: Citizen Safety Portal */}
      {activePage === 'citizens' && (
        <CitizenPortal
          shelters={simState.shelters}
          routes={simState.evacuationRoutes}
          onBack={() => setActivePage('landing')}
          onOpenDashboard={() => setActivePage('dashboard')}
        />
      )}

      {/* VIEW 5: Volunteer & Responder Network */}
      {activePage === 'volunteers' && (
        <VolunteerPortal
          shelters={simState.shelters}
          tasks={tasks}
          onBack={() => setActivePage('landing')}
          onOpenDashboard={() => setActivePage('dashboard')}
        />
      )}

      {/* SPECIALIZED DEEP DISASTER MODULES (Opened from System Directory) */}
      {activePage === 'command-center' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Full Tactical Command Center')}
          <CommandCenter
            activeDisaster={simState.activeDisaster}
            riskAssessment={simState.riskAssessment}
            skepticVerification={simState.skepticVerification}
            impactAssessment={simState.impactAssessment}
            shelters={simState.shelters}
            hospitals={hospitals}
            rescueTeams={rescueTeams}
            shipments={simState.shipments}
            evacuationRoutes={simState.evacuationRoutes}
            tasks={tasks}
            onNavigate={setActivePage}
          />
        </div>
      )}

      {activePage === 'gis-map' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Fullscreen GIS Command Map (24 Layers)')}
          <div className="flex-1">
            <LiveDisasterMap
              disaster={simState.activeDisaster}
              shelters={simState.shelters}
              hospitals={hospitals}
              rescueTeams={rescueTeams}
              shipments={simState.shipments}
              evacuationRoutes={simState.evacuationRoutes}
              disasterPolygon={simState.impactAssessment.polygonCoordinates}
              onDataUpdated={fetchFullState}
            />
          </div>
        </div>
      )}

      {activePage === 'incident-details' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Incident Master Record')}
          <IncidentDetails
            disaster={simState.activeDisaster}
            timeline={simState.timeline}
          />
        </div>
      )}

      {(activePage === 'prediction' || activePage === 'skeptic-agent') && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('VajraWatch 8-Feature Risk Engine & Skeptic Audit')}
          <PredictionDashboard
            disaster={simState.activeDisaster}
            riskAssessment={simState.riskAssessment}
            skepticVerification={simState.skepticVerification}
            onRefresh={fetchFullState}
          />
        </div>
      )}

      {activePage === 'early-warning' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Early Warning Broadcast Center')}
          <EarlyWarningCenter
            disaster={simState.activeDisaster}
            risk={simState.riskAssessment}
            skeptic={simState.skepticVerification}
            onAlertUpdated={fetchFullState}
          />
        </div>
      )}

      {activePage === 'impact-assessment' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Spatial Impact Vulnerability Matrix')}
          <ImpactAssessmentPage
            impact={simState.impactAssessment}
            shelters={simState.shelters}
            hospitals={hospitals}
          />
        </div>
      )}

      {activePage === 'evacuation' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Dynamic Evacuation Corridor Routing')}
          <EvacuationPlanner
            routes={simState.evacuationRoutes}
            shelters={simState.shelters}
            onRoutesUpdated={fetchFullState}
          />
        </div>
      )}

      {activePage === 'resources' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Resource Inventory & Conservation')}
          <ResourceManagement
            resources={simState.resources}
            shelters={simState.shelters}
            onResourcesUpdated={fetchFullState}
          />
        </div>
      )}

      {activePage === 'allocations' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Sphere Standards Resource Demand Engine')}
          <ResourceAllocation
            demandEstimates={simState.demandEstimates}
            allocations={simState.allocations}
            onDispatchConvoy={() => {
              setActivePage('logistics');
              fetchFullState();
            }}
          />
        </div>
      )}

      {activePage === 'logistics' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Logistics Convoy & Fleet Tracking')}
          <LogisticsTracking
            shipments={simState.shipments}
            onShipmentsUpdated={fetchFullState}
          />
        </div>
      )}

      {activePage === 'shelters' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Emergency Shelter Operations')}
          <ShelterManagement
            shelters={simState.shelters}
            onSheltersUpdated={fetchFullState}
          />
        </div>
      )}

      {activePage === 'hospitals' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Hospital Trauma & ICU Bed Tracking')}
          <HospitalManagement hospitals={hospitals} />
        </div>
      )}

      {activePage === 'rescue-teams' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Tactical Search & Rescue (NDRF/SDRF)')}
          <RescueTeamManagement rescueTeams={rescueTeams} />
        </div>
      )}

      {activePage === 'tasks' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Tactical Incident Task Board')}
          <TaskManagement tasks={tasks} onTasksUpdated={fetchFullState} />
        </div>
      )}

      {activePage === 'satellite' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Satellite SAR & NDWI Inundation Analysis')}
          <SatelliteAnalysis />
        </div>
      )}

      {activePage === 'sensors' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Hydrological & Meteorological Telemetry')}
          <SensorMonitoring />
        </div>
      )}

      {activePage === 'historical' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('GraphRAG Historical Disaster Analogies')}
          <HistoricalIntelligence />
        </div>
      )}

      {activePage === 'post-disaster' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('15-Section Forensic Post-Disaster Analysis')}
          <PostDisasterAnalysis onNavigateToReport={() => setActivePage('report-viewer')} />
        </div>
      )}

      {activePage === 'damage' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Infrastructure Damage Catalog')}
          <DamageAssessment damageRecords={damageRecords} />
        </div>
      )}

      {activePage === 'resource-perf' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Supply Flow & Response Performance KPIs')}
          <ResourcePerformance performance={simState.performance} />
        </div>
      )}

      {activePage === 'reports' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Disaster Incident Reports Archive')}
          <ReportsList onOpenReport={() => setActivePage('report-viewer')} />
        </div>
      )}

      {activePage === 'report-viewer' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Official Printable Disaster Incident Report')}
          <DisasterReportViewer
            disaster={simState.activeDisaster}
            risk={simState.riskAssessment}
            skeptic={simState.skepticVerification}
            impact={simState.impactAssessment}
            performance={simState.performance}
            damageRecords={damageRecords}
            resources={simState.resources}
            onBack={() => setActivePage('dashboard')}
          />
        </div>
      )}

      {activePage === 'data-sources' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Data Ingestion & Telemetry Health')}
          <DataSources />
        </div>
      )}

      {activePage === 'audit-logs' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Immutable Compliance Audit Trail')}
          <AuditLogViewer />
        </div>
      )}

      {activePage === 'settings' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('Platform Configuration & Risk Thresholds')}
          <SettingsPage />
        </div>
      )}

      {activePage === 'login' && (
        <div className="flex flex-col min-h-screen">
          {renderDeepViewHeader('RBAC Authority Profile Switcher')}
          <LoginPage onLoginSuccess={() => setActivePage('dashboard')} />
        </div>
      )}

      {/* Slide-over 20-Step Simulation Studio Drawer */}
      <SimulationStudioDrawer
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        currentStep={simState.currentStep}
        totalSteps={simState.totalSteps}
        stepTitle={simState.stepTitle}
        stepDescription={simState.stepDescription}
        onStepChange={fetchFullState}
        onNavigateToReport={() => {
          setIsStudioOpen(false);
          setActivePage('report-viewer');
        }}
      />

      {/* Satellite Earth Observation API Key Modal */}
      <SatelliteKeyModal
        isOpen={isSatelliteModalOpen}
        onClose={() => setIsSatelliteModalOpen(false)}
        onConfigSaved={() => {
          checkSatelliteKey();
          fetchFullState();
        }}
      />
    </div>
  );
}

export default App;
