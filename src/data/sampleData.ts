import { OrganizationSetup, Scope1Inputs, Scope2Inputs, Scope3CategoryInput, ComplianceProject } from '../types/ghg';
import { DEFAULT_SCOPE3_CATEGORIES } from './emissionFactors';

export const SAMPLE_ORG_SETUP: OrganizationSetup = {
  orgName: '44 EMB Studios',
  legalName: '44 EMB Studio Pvt. Ltd.',
  clientCode: 'CL001',
  industry: 'Hand Embroidery',
  country: 'IN',
  city: 'Mumbai',
  state: 'Maharashtra',
  region: 'Mumbai, Maharashtra',
  taxId: '27AABCZ0681L1ZY',
  address: 'Plot No 367, Dadaji Dhakjee Compound Sane Guruji Marg, GhasGali, Agripada, Jacob Circle Mumbai, Maharashtra 400011 India',
  website: 'https://www.44embstudio.com/',
  driveFolder: '01: 44 EMB Studios',
  selectedEntity: '44 EMB Studios - Mumbai',
  entities: ['44 EMB Studios - Mumbai', '44 EMB Studios - Surat Facility', '44 EMB Studios - London Showroom'],
  primaryContact: {
    name: 'Ms. Sufera Adenwala',
    email: 'primary.contact@example.com',
    role: 'Primary Contact & ESG Account Lead',
  },
  secondaryContact: {
    name: 'Ms. Misbah Kapadia',
    email: 'audit.coordinator@example.com',
    role: 'Lead Verification Coordinator',
  },
  portalSeats: {
    supervisor: '1 of 1',
    member: '2 of 2',
    special: '1 of 1',
  },
  clientPortalVisible: true,
  reportingYear: '2026',
  currency: 'INR',
  accountingStandard: 'GHG Protocol Corporate Standard',
  boundary: 'Operational Control',
  gwpBasis: 'AR5',
  frameworks: ['CSRD / ESRS', 'ISO 14064-1', 'EcoVadis'],
  revenue: 25000000,
  fte: 180,
  floorArea: 9200,
};

export const SAMPLE_COMPLIANCE_PROJECTS: ComplianceProject[] = [
  {
    id: 'proj-1',
    code: 'PR040',
    title: 'ISO 14001 Consultation',
    category: 'consultation',
    targetDate: '2026-09-05',
    status: 'overdue',
    phaseCurrent: 2,
    phaseTotal: 2,
    phaseName: 'Certify',
    progressPct: 100,
    nextMilestone: 'Certificate issued and handed over • project due 5 Sept 2026',
    gateText: 'Account Manager sign-off',
    cardFooterStatus: 'CLEAR',
    driveFolder: '01: 44 EMB Studios / ISO-14001',
  },
  {
    id: 'proj-2',
    code: 'PR041',
    title: 'ISO 45001 Consultation',
    category: 'consultation',
    targetDate: '2026-09-05',
    status: 'overdue',
    phaseCurrent: 2,
    phaseTotal: 2,
    phaseName: 'Certify',
    progressPct: 95,
    nextMilestone: 'Final audit report uploaded • project due 5 Sept 2026',
    gateText: 'Auditor verification handoff',
    cardFooterStatus: 'CLEAR',
    driveFolder: '01: 44 EMB Studios / ISO-45001',
  },
  {
    id: 'proj-3',
    code: 'PR033',
    title: 'Sustainability Report (CSRD)',
    category: 'reporting',
    targetDate: '2026-09-28',
    status: 'running',
    phaseCurrent: 1,
    phaseTotal: 7,
    phaseName: 'Onboarding',
    progressPct: 22,
    nextMilestone: 'Double materiality assessment & stakeholder intake',
    gateText: 'Account Manager sign-in',
    cardFooterStatus: 'WITH CLIENT',
    driveFolder: '01: 44 EMB Studios / CSRD-Report',
  },
  {
    id: 'proj-4',
    code: 'PR039',
    title: 'Scope 1-3 Data Dashboarding',
    category: 'dashboarding',
    targetDate: '2026-09-30',
    status: 'running',
    phaseCurrent: 1,
    phaseTotal: 5,
    phaseName: 'Onboarding & Data Ingestion',
    progressPct: 35,
    nextMilestone: 'Automated utility data pipeline setup & QA test',
    gateText: 'Account Manager sign-in',
    cardFooterStatus: 'CLEAR',
    driveFolder: '01: 44 EMB Studios / GHG-Dashboard',
  },
  {
    id: 'proj-5',
    code: 'PR034',
    title: 'EcoVadis Assessment',
    category: 'assessment',
    targetDate: '2026-10-08',
    status: 'running',
    phaseCurrent: 1,
    phaseTotal: 6,
    phaseName: 'Evidence Gathering & Scoring',
    progressPct: 18,
    nextMilestone: 'Supply chain policy documentation & CSR questionnaire',
    gateText: 'Client Review Gate',
    cardFooterStatus: 'WITH CLIENT',
    driveFolder: '01: 44 EMB Studios / EcoVadis-2026',
  },
];

export const SAMPLE_SCOPE1: Scope1Inputs = {
  naturalGasKwh: 120000,
  naturalGasUnit: 'kWh',
  mobileDieselL: 4500,
  mobileUnit: 'L',
  refrigerantKg: 45,
  refrigerantType: 'HFC-134a',
  refrigerantGwp: 1300,
  processEmissionsKg: '',
  processEf: '',
  otherAct: '',
  otherEf: '',
  otherName: '',
};

export const SAMPLE_SCOPE2: Scope2Inputs = {
  electricityLocKwh: 450000,
  electricityMktKwh: 450000,
  electricityMktEf: 0, // Green tariff / REGO certified zero carbon
  steamKwh: '',
  heatKwh: '',
  coolKwh: '',
};

export const getSampleScope3 = (): Scope3CategoryInput[] => {
  return DEFAULT_SCOPE3_CATEGORIES.map(cat => {
    if (cat.id === 1) return { ...cat, activity: 250000 };
    if (cat.id === 2) return { ...cat, activity: 180000 };
    return { ...cat, activity: '' };
  });
};

