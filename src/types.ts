export type Role = 'ADMIN' | 'CLIENT_1' | 'CLIENT_2' | 'CLIENT_3' | 'CLIENT_4' | 'CLIENT_5';

export interface Client {
  id: string;
  name: string;
  role: Role;
}

export type ServiceCategory = 
  | 'Web Development' 
  | 'Photography' 
  | 'Branding' 
  | 'Social Media' 
  | 'Email Marketing' 
  | 'SEO' 
  | 'Graphic Design' 
  | 'Video Production' 
  | 'Content Strategy' 
  | 'Copywriting' 
  | 'UI/UX Design' 
  | 'Paid Ads' 
  | 'Influencer Marketing' 
  | 'Public Relations';

export interface Step {
  name: string;
  weight: number;
}

export interface ProjectStep {
  name: string;
  weight: number;
  progress: number; // 0 to 100
  isCompleted: boolean;
  dueDate: string;
}

export type ProjectStatus = 'Active' | 'Finished';

export interface Project {
  id: string;
  clientId: string;
  title: string;
  serviceType: ServiceCategory;
  status: ProjectStatus;
  currentStepIndex: number;
  steps: ProjectStep[];
  updatedAt: string;
}

export interface Notification {
  id: string;
  clientId: string;
  type: 'Feedback Needed' | 'Approval Required' | 'Missing Assets' | 'Signed Contract Needed' | 'Final Review' | 'Custom';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface VaultItem {
  id: string;
  projectId: string;
  name: string;
  type: 'SOW' | 'Contract' | 'Asset' | 'Invoice';
  date: string;
  size: string;
}
