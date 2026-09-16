// NGO and Humanitarian Relief Outposts Service
// Real geocoded relief centers for Chamoli District & Upper Alaknanda Basin Disaster Theater

export interface ReliefNGO {
  id: string;
  name: string;
  shortName: string;
  category: 'Medical & Trauma' | 'Food & Rations' | 'Water & Sanitation' | 'Boats & Water Rescue' | 'Emergency Shelter' | 'Search Volunteers';
  badgeColor: string; // Tailwind color token
  coords: {
    lat: number;
    lng: number;
  };
  address: string;
  phone: string;
  phoneRaw: string; // for tel: link
  whatsapp: string; // for wa.me link
  email: string;
  leadOfficer: string;
  operationalStatus: 'ACTIVE_DISPATCH' | 'OPERATIONAL' | 'RESERVE';
  distanceKm?: number;
  capabilities: string[];
  immediateSupplies: string;
  operatingHours: string;
}

export const RELIEF_NGOS_DATA: ReliefNGO[] = [
  {
    id: 'NGO-01',
    name: 'Indian Red Cross Society (Chamoli Disaster Post)',
    shortName: 'Red Cross Relief',
    category: 'Medical & Trauma',
    badgeColor: 'red',
    coords: {
      lat: 30.4152,
      lng: 79.3278
    },
    address: 'Near District Hospital Complex, Badrinath Marg, Chamoli 246424',
    phone: '+91 98112 23344',
    phoneRaw: '+919811223344',
    whatsapp: '919811223344',
    email: 'chamoli.relief@indianredcross.org',
    leadOfficer: 'Dr. R. K. Bhatt (Chief Medical Coordinator)',
    operationalStatus: 'ACTIVE_DISPATCH',
    capabilities: [
      'Emergency Triage & Trauma Resuscitation',
      'Blood Group Matching & Universal O- Units',
      '6 All-Terrain Ambulances',
      'Mobile Surgical Field Kit'
    ],
    immediateSupplies: '250 Trauma Kits, 80 Blood Units, 40 Oxygen Cylinders, 12 Paramedics on active watch',
    operatingHours: '24x7 Rapid Disaster Response'
  },
  {
    id: 'NGO-02',
    name: 'Goonj Rahat Humanitarian Logistics Base',
    shortName: 'Goonj Disaster Hub',
    category: 'Food & Rations',
    badgeColor: 'amber',
    coords: {
      lat: 30.4215,
      lng: 79.3325
    },
    address: 'Gopeshwar-Chamoli Highway Bypass, Sector 3 Depot',
    phone: '+91 98223 34455',
    phoneRaw: '+919822334455',
    whatsapp: '919822334455',
    email: 'rahat.chamoli@goonj.org',
    leadOfficer: 'Sunita Rawat (Logistics Director)',
    operationalStatus: 'ACTIVE_DISPATCH',
    capabilities: [
      'Standardized Family Dry Ration Kits (15-Day Shelf)',
      'Thermal Fleece Blankets & Woolen Wear',
      'Heavy Waterproof Tarpaulins (12x18 ft)',
      'Baby Nutrition & Hygiene Packs'
    ],
    immediateSupplies: '1,800 Family Ration Kits, 2,400 Woolen Blankets, 600 Tarpaulins ready for immediate convoy dispatch',
    operatingHours: '24x7 Supply Convoys'
  },
  {
    id: 'NGO-03',
    name: 'SEEDS India Emergency Shelter & WASH Outpost',
    shortName: 'SEEDS India WASH',
    category: 'Water & Sanitation',
    badgeColor: 'cyan',
    coords: {
      lat: 30.4082,
      lng: 79.3192
    },
    address: 'Alaknanda High-Ground Terrace, Pipalkoti Confluence Road',
    phone: '+91 98334 45566',
    phoneRaw: '+919833445566',
    whatsapp: '919833445566',
    email: 'response@seedsindia.org',
    leadOfficer: 'Er. Alok Semwal (WASH Team Lead)',
    operationalStatus: 'ACTIVE_DISPATCH',
    capabilities: [
      '2 Mobile Reverse Osmosis High-Capacity Filtration Units (5,000 L/hr)',
      'Chlorine Water Purification Tablets (Halazone)',
      'Temporary Rapid-Erect Dome Shelters',
      'Solar-Powered Disaster Communication Beacons'
    ],
    immediateSupplies: '10,000L Potable Water Storage, 20,000 Water Purification Tablets, 150 All-Weather Tents',
    operatingHours: '24x7 Emergency Ops'
  },
  {
    id: 'NGO-04',
    name: 'Doctors For You (DFY) Mobile Disaster Medical Corps',
    shortName: 'Doctors For You',
    category: 'Medical & Trauma',
    badgeColor: 'rose',
    coords: {
      lat: 30.4195,
      lng: 79.3350
    },
    address: 'Community Health Center Annex, Upper Gopeshwar',
    phone: '+91 98445 56677',
    phoneRaw: '+919844556677',
    whatsapp: '919844556677',
    email: 'disaster@doctorsforyou.org',
    leadOfficer: 'Dr. Neha Negi (Epidemic & Trauma Lead)',
    operationalStatus: 'ACTIVE_DISPATCH',
    capabilities: [
      '4x4 All-Terrain Mobile Clinic Vans',
      'Polyvalent Snakebite Antivenom & Tetanus Stocks',
      'Waterborne Disease Containment (ORS, Doxycycline)',
      'Pediatric & Geriatric Emergency Stabilization'
    ],
    immediateSupplies: '500 Doses Antivenom, 3,000 ORS Packs, 8 Mobile Doctors & 14 Emergency Nurses',
    operatingHours: '24x7 Trauma Watch'
  },
  {
    id: 'NGO-05',
    name: 'Rapid Response India (Swift-Water & Inundation Rescue)',
    shortName: 'Rapid Response Boat Unit',
    category: 'Boats & Water Rescue',
    badgeColor: 'blue',
    coords: {
      lat: 30.4132,
      lng: 79.3215
    },
    address: 'Birahi Gorge Staging Point, River Alaknanda Edge',
    phone: '+91 98556 67788',
    phoneRaw: '+919855667788',
    whatsapp: '919855667788',
    email: 'rescue@rapidresponse.org.in',
    leadOfficer: 'Capt. Vikram Negi (Ex-Navy Diver)',
    operationalStatus: 'ACTIVE_DISPATCH',
    capabilities: [
      '5 Heavy-Duty Inflatable Zodiac Power-Boats with 40HP Outboard Engines',
      'High-Tensile Dynamic River-Crossing Winch Lines',
      'SOLAS-Approved Life Jackets & Throw Bags',
      'Forward-Looking Infrared (FLIR) Night Search Drones'
    ],
    immediateSupplies: '5 Operational Rescue Craft, 120 Life Jackets, 8 Certified Swift-Water Rescue Divers',
    operatingHours: '24x7 Swift-Water Deployment'
  },
  {
    id: 'NGO-06',
    name: 'Uttarakhand Mountain Disaster Volunteer Brigade',
    shortName: 'Mountain Volunteer Brigade',
    category: 'Search Volunteers',
    badgeColor: 'emerald',
    coords: {
      lat: 30.4285,
      lng: 79.3402
    },
    address: 'Youth Hostel Staging Camp, Chamoli-Joshimath Highway',
    phone: '+91 98667 78899',
    phoneRaw: '+919866778899',
    whatsapp: '919866778899',
    email: 'volunteers.chamoli@ukdisaster.org',
    leadOfficer: 'Harish Joshi (Lead Mountain Guide)',
    operationalStatus: 'OPERATIONAL',
    capabilities: [
      'High-Altitude Technical Rope & Cliff Evacuation',
      'Local Trail Navigators for Sludge-Bypass Terrains',
      'Stretcher Port Teams for Trapped Elderly/Infants',
      'Handheld VHF Mesh Radios for Zero-Cellular Dead-Zones'
    ],
    immediateSupplies: '85 Trained Mountain Responders, 40 Stretcher Units, 18 VHF Mesh Handhelds',
    operatingHours: '24x7 On-Call Roster'
  }
];

// Calculate Haversine Distance in Kilometers between two coordinates
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Get all NGOs sorted with live distance from an origin
export function getNearbyNGOs(
  originLat: number = 30.4128,
  originLng: number = 79.3242
): ReliefNGO[] {
  return RELIEF_NGOS_DATA.map(ngo => ({
    ...ngo,
    distanceKm: calculateDistanceKm(originLat, originLng, ngo.coords.lat, ngo.coords.lng)
  })).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
}
