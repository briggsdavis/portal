import { ServiceCategory, Step, Client, Project, ProjectStep, VaultItem, Notification } from './types';

export const CLIENTS: Client[] = [
  { id: 'ADMIN', name: 'Administrator', role: 'ADMIN' },
  { id: 'CLIENT_1', name: 'Aurora Ventures', role: 'CLIENT_1' },
  { id: 'CLIENT_2', name: 'Nexus Digital', role: 'CLIENT_2' },
  { id: 'CLIENT_3', name: 'Horizon Logistics', role: 'CLIENT_3' },
  { id: 'CLIENT_4', name: 'Prism Creative', role: 'CLIENT_4' },
  { id: 'CLIENT_5', name: 'Stellar Goods', role: 'CLIENT_5' },
];

export const SERVICE_COLORS: Record<ServiceCategory, string> = {
  'Web Development': '#3B82F6', // Blue
  'Photography': '#EF4444', // Red
  'Branding': '#10B981', // Emerald
  'Social Media': '#F59E0B', // Amber
  'Email Marketing': '#8B5CF6', // Violet
  'SEO': '#06B6D4', // Cyan
  'Graphic Design': '#EC4899', // Pink
  'Video Production': '#6366F1', // Indigo
  'Content Strategy': '#F43F5E', // Rose
  'Copywriting': '#84CC16', // Lime
  'UI/UX Design': '#F97316', // Orange
  'Paid Ads': '#14B8A6', // Teal
  'Influencer Marketing': '#D946EF', // Fuchsia
  'Public Relations': '#64748B', // Slate
};

export const WEB_DEV_STEPS: Step[] = [
  { name: 'Initial Development', weight: 0.5 },
  { name: 'Revision 1', weight: 0.2 },
  { name: 'Revision 2', weight: 0.2 },
  { name: 'Launch', weight: 0.1 },
];

export const STANDARD_STEPS: Step[] = [
  { name: 'Discovery', weight: 0.1 },
  { name: 'Ideation', weight: 0.15 },
  { name: 'Development', weight: 0.4 },
  { name: 'Prototype Finalization', weight: 0.15 },
  { name: 'Test/Refinement', weight: 0.1 },
  { name: 'Handoff', weight: 0.1 },
];

const generateSteps = (category: ServiceCategory): ProjectStep[] => {
  const template = category === 'Web Development' ? WEB_DEV_STEPS : STANDARD_STEPS;
  return template.map((s, i) => ({
    ...s,
    progress: i === 0 ? 100 : 0,
    isCompleted: i === 0,
    dueDate: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));
};

export const INITIAL_PROJECTS: Project[] = [
  // Client 1: 1 Active Web Dev
  {
    id: 'p1',
    clientId: 'CLIENT_1',
    title: 'Enterprise Portal Redesign',
    serviceType: 'Web Development',
    status: 'Active',
    currentStepIndex: 1,
    updatedAt: new Date().toISOString(),
    steps: generateSteps('Web Development'),
  },
  // Client 2: 3 Active (Photography, Branding, Social Media), 1 Finished (Email Marketing)
  {
    id: 'p2',
    clientId: 'CLIENT_2',
    title: 'Spring Collection Shoot',
    serviceType: 'Photography',
    status: 'Active',
    currentStepIndex: 2,
    updatedAt: new Date().toISOString(),
    steps: generateSteps('Photography'),
  },
  {
    id: 'p3',
    clientId: 'CLIENT_2',
    title: 'Brand Refresh 2024',
    serviceType: 'Branding',
    status: 'Active',
    currentStepIndex: 0,
    updatedAt: new Date().toISOString(),
    steps: generateSteps('Branding'),
  },
  {
    id: 'p4',
    clientId: 'CLIENT_2',
    title: 'Instagram Growth Strategy',
    serviceType: 'Social Media',
    status: 'Active',
    currentStepIndex: 1,
    updatedAt: new Date().toISOString(),
    steps: generateSteps('Social Media'),
  },
  {
    id: 'p5',
    clientId: 'CLIENT_2',
    title: 'Holiday Newsletter Campaign',
    serviceType: 'Email Marketing',
    status: 'Finished',
    currentStepIndex: 5,
    updatedAt: new Date().toISOString(),
    steps: generateSteps('Email Marketing').map(s => ({ ...s, isCompleted: true, progress: 100 })),
  },
  // Client 3: SEO, Graphic Design
  {
    id: 'p6',
    clientId: 'CLIENT_3',
    title: 'Organic Search Optimization',
    serviceType: 'SEO',
    status: 'Active',
    currentStepIndex: 2,
    updatedAt: new Date().toISOString(),
    steps: generateSteps('SEO'),
  },
  {
    id: 'p7',
    clientId: 'CLIENT_3',
    title: 'Annual Report Design',
    serviceType: 'Graphic Design',
    status: 'Active',
    currentStepIndex: 0,
    updatedAt: new Date().toISOString(),
    steps: generateSteps('Graphic Design'),
  },
  // Client 4: Video, Content
  {
    id: 'p8',
    clientId: 'CLIENT_4',
    title: 'Explainer Video Series',
    serviceType: 'Video Production',
    status: 'Active',
    currentStepIndex: 1,
    updatedAt: new Date().toISOString(),
    steps: generateSteps('Video Production'),
  },
  {
    id: 'p9',
    clientId: 'CLIENT_4',
    title: 'Q3 Content Calendar',
    serviceType: 'Content Strategy',
    status: 'Active',
    currentStepIndex: 3,
    updatedAt: new Date().toISOString(),
    steps: generateSteps('Content Strategy'),
  },
  // Client 5: UI/UX, Paid Ads
  {
    id: 'p10',
    clientId: 'CLIENT_5',
    title: 'Mobile App Refresh',
    serviceType: 'UI/UX Design',
    status: 'Active',
    currentStepIndex: 2,
    updatedAt: new Date().toISOString(),
    steps: generateSteps('UI/UX Design'),
  },
  {
    id: 'p11',
    clientId: 'CLIENT_5',
    title: 'Facebook Ads Scale',
    serviceType: 'Paid Ads',
    status: 'Active',
    currentStepIndex: 0,
    updatedAt: new Date().toISOString(),
    steps: generateSteps('Paid Ads'),
  },
];

export const INITIAL_VAULT: VaultItem[] = [
  { id: 'v1', projectId: 'p1', name: 'SOW_Web_Portal.pdf', type: 'SOW', date: 'May 1, 2024', size: '2.4 MB' },
  { id: 'v2', projectId: 'p1', name: 'Contract_Aurora.pdf', type: 'Contract', date: 'May 2, 2024', size: '1.1 MB' },
  { id: 'v3', projectId: 'p3', name: 'Brand_Guidelines_V1.pdf', type: 'Asset', date: 'May 5, 2024', size: '15.8 MB' },
  { id: 'v4', projectId: 'p5', name: 'Final_Report_Email.pdf', type: 'Asset', date: 'May 8, 2024', size: '4.2 MB' },
];

export const NOTIFICATION_TYPES = [
  'Feedback Needed',
  'Approval Required',
  'Missing Assets',
  'Signed Contract Needed',
  'Final Review',
];
