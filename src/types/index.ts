export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'microhub' | 'factory_admin' | 'user';
  createdAt: string;
  lastLogin?: string;
  profile?: {
    name: string;
    organization?: string;
    location?: string;
  };
}

export interface WasteRecord {
  id: string;
  tag: string;
  category: WasteCategory;
  subcategory?: string;
  weight: number;
  location: string;
  status: WasteStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
  metadata: {
    source: string;
    description?: string;
    hazardLevel: 'low' | 'medium' | 'high';
    recyclable: boolean;
  };
}

export interface TimelineEvent {
  id: string;
  status: WasteStatus;
  timestamp: string;
  location: string;
  updatedBy: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface Grievance {
  id: string;
  title: string;
  description: string;
  category: 'collection' | 'disposal' | 'sanitation' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolution?: string;
  tokenReward?: number;
}

export interface SustatioToken {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'purchased' | 'spent';
  description: string;
  timestamp: string;
  relatedGrievance?: string;
}

export type WasteCategory = 'Disposable' | 'Non-disposable' | 'PET Bottle' | 'Metals & Glasses';

export type WasteStatus = 
  | 'collected' 
  | 'in_transit' 
  | 'segregated' 
  | 'processed' 
  | 'disposed' 
  | 'recycled' 
  | 'pending';

export interface AIsuggestion {
  category: WasteCategory;
  confidence: number;
  reasoning: string;
  alternativeCategories?: {
    category: WasteCategory;
    confidence: number;
  }[];
}

export interface DashboardStats {
  totalWaste: number;
  processingRate: number;
  recyclingRate: number;
  wasteByCategory: Record<WasteCategory, number>;
  recentActivity: TimelineEvent[];
  pendingGrievances: number;
  tokenBalance?: number;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
}