-- ==============================================================================
-- VAJRASHIELD ENTERPRISE DISASTER COMMAND PLATFORM
-- PostgreSQL + PostGIS Relational & Spatial Database Schema
-- ==============================================================================

-- Enable PostGIS Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations & Roles
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'GOVERNMENT', 'NDRF', 'SDRF', 'ARMY', 'NGO', 'HEALTH'
    contact_phone VARCHAR(50),
    contact_email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'ADMIN', 'DISASTER_MANAGER', 'FIELD_COORDINATOR', etc.
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Multi-Hazard Disasters & Events
CREATE TABLE IF NOT EXISTS disaster_types (
    id VARCHAR(50) PRIMARY KEY, -- 'FLASH_FLOOD', 'GLOF', 'LANDSLIDE', 'EARTHQUAKE', etc.
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS disaster_events (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'DIS-2026-UK-082'
    name VARCHAR(255) NOT NULL,
    disaster_type VARCHAR(50) REFERENCES disaster_types(id),
    location_name VARCHAR(255) NOT NULL,
    centroid GEOMETRY(Point, 4326) NOT NULL,
    affected_region VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    detected_time TIMESTAMP WITH TIME ZONE NOT NULL,
    current_status VARCHAR(50) NOT NULL, -- 'NORMAL', 'WATCH', 'ELEVATED', 'HIGH_RISK', 'CRITICAL', 'WARNING', 'DISASTER_CONFIRMED'
    risk_score NUMERIC(5,2) NOT NULL,
    confidence NUMERIC(3,2) NOT NULL,
    affected_population INTEGER NOT NULL,
    response_status VARCHAR(50) NOT NULL, -- 'MONITORING', 'RESCUE_ACTIVE', 'EVACUATING', 'CLOSED'
    severity_classification VARCHAR(50) NOT NULL,
    historical_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial Index
CREATE INDEX IF NOT EXISTS idx_disaster_events_centroid ON disaster_events USING GIST (centroid);

-- 3. Risk Assessments & 8-Feature Engine
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disaster_id VARCHAR(50) REFERENCES disaster_events(id),
    score NUMERIC(5,2) NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    confidence NUMERIC(3,2) NOT NULL,
    target_lead_time_hours NUMERIC(4,1),
    explanation TEXT,
    computed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS risk_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES risk_assessments(id),
    feature_key VARCHAR(50) NOT NULL, -- 'precip', 'hydro', 'terrain', 'ndwi', 'sar', 'lake', 'seismic', 'temp'
    feature_name VARCHAR(100) NOT NULL,
    value NUMERIC(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    weight NUMERIC(3,2) NOT NULL,
    contribution NUMERIC(5,2) NOT NULL,
    data_source VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL
);

-- 4. Alerts & Notifications
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(50) PRIMARY KEY,
    disaster_id VARCHAR(50) REFERENCES disaster_events(id),
    alert_type VARCHAR(50) NOT NULL, -- 'Advisory', 'Watch', 'Warning', 'Critical Alert'
    title VARCHAR(255) NOT NULL,
    recommended_action TEXT NOT NULL,
    evacuation_recommendation BOOLEAN DEFAULT FALSE,
    authority_approval_status VARCHAR(50) NOT NULL,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Impact Zones & Critical Infrastructure
CREATE TABLE IF NOT EXISTS affected_zones (
    id VARCHAR(50) PRIMARY KEY,
    disaster_id VARCHAR(50) REFERENCES disaster_events(id),
    name VARCHAR(255) NOT NULL,
    area_sq_km NUMERIC(8,2) NOT NULL,
    boundary GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_affected_zones_geom ON affected_zones USING GIST (boundary);

CREATE TABLE IF NOT EXISTS infrastructure_assets (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'ROADS', 'BRIDGES', 'HOSPITALS', 'SCHOOLS', 'POWER', 'WATER', 'COMMS', 'AGRICULTURE'
    location GEOMETRY(Point, 4326) NOT NULL,
    critical_level VARCHAR(20) NOT NULL,
    operational_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_infra_location ON infrastructure_assets USING GIST (location);

CREATE TABLE IF NOT EXISTS damage_assessments (
    id VARCHAR(50) PRIMARY KEY,
    asset_id VARCHAR(50) REFERENCES infrastructure_assets(id),
    damage_level VARCHAR(50) NOT NULL, -- 'UNDAMAGED', 'MINOR', 'MODERATE', 'SEVERE', 'DESTROYED'
    evidence_source VARCHAR(255) NOT NULL,
    inspection_status VARCHAR(50) NOT NULL,
    estimated_repair_cost_inr NUMERIC(15,2) NOT NULL,
    verification_status VARCHAR(50) NOT NULL,
    inspected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Resources & Strict Conservation Ledger
CREATE TABLE IF NOT EXISTS resources (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    total_quantity INTEGER NOT NULL,
    available_quantity INTEGER NOT NULL,
    allocated_quantity INTEGER NOT NULL DEFAULT 0,
    in_transit_quantity INTEGER NOT NULL DEFAULT 0,
    delivered_quantity INTEGER NOT NULL DEFAULT 0,
    consumed_quantity INTEGER NOT NULL DEFAULT 0,
    damaged_quantity INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    current_location_name VARCHAR(255) NOT NULL,
    current_coords GEOMETRY(Point, 4326) NOT NULL,
    responsible_org VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_inventory_conservation CHECK (
        total_quantity = (available_quantity + allocated_quantity + in_transit_quantity + delivered_quantity + consumed_quantity + damaged_quantity)
    )
);

-- 7. Logistics & Shipments
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(50) PRIMARY KEY,
    resource_id VARCHAR(50) REFERENCES resources(id),
    quantity INTEGER NOT NULL,
    origin_name VARCHAR(255) NOT NULL,
    origin_coords GEOMETRY(Point, 4326) NOT NULL,
    destination_name VARCHAR(255) NOT NULL,
    destination_coords GEOMETRY(Point, 4326) NOT NULL,
    vehicle_id VARCHAR(100) NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'PLANNED', 'DISPATCHED', 'IN_TRANSIT', 'DELAYED', 'DELIVERED'
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_arrival TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    current_coords GEOMETRY(Point, 4326),
    progress_pct INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Shelters & Occupancy
CREATE TABLE IF NOT EXISTS shelters (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    coords GEOMETRY(Point, 4326) NOT NULL,
    total_capacity INTEGER NOT NULL,
    current_occupancy INTEGER NOT NULL DEFAULT 0,
    available_capacity INTEGER NOT NULL,
    water_supply_days INTEGER DEFAULT 3,
    food_supply_days INTEGER DEFAULT 3,
    medical_onsite BOOLEAN DEFAULT FALSE,
    electricity_operational BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Hospitals & Medical Facilities
CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location_name VARCHAR(255) NOT NULL,
    coords GEOMETRY(Point, 4326) NOT NULL,
    total_beds INTEGER NOT NULL,
    available_beds INTEGER NOT NULL,
    icu_total INTEGER NOT NULL,
    icu_available INTEGER NOT NULL,
    ambulances_available INTEGER NOT NULL,
    blood_units_available INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Evacuation Routes
CREATE TABLE IF NOT EXISTS evacuation_routes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    origin_name VARCHAR(255) NOT NULL,
    destination_shelter_id VARCHAR(50) REFERENCES shelters(id),
    path_geometry GEOMETRY(LineString, 4326) NOT NULL,
    distance_km NUMERIC(5,2) NOT NULL,
    estimated_travel_time_min INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'SAFE', 'CONGESTED', 'BLOCKED'
    blockage_reason TEXT,
    is_alternative_route BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_routes_geom ON evacuation_routes USING GIST (path_geometry);

-- 11. Audit Logs (Immutable)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    operator_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(255) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs (timestamp DESC);
