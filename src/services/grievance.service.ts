import { Grievance, SustatioToken } from '../types';
import { generateSecureId } from '../utils/security';

class GrievanceService {
  private readonly GRIEVANCES_KEY = 'sustatio_grievances';
  private readonly TOKENS_KEY = 'sustatio_tokens';

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const existing = localStorage.getItem(this.GRIEVANCES_KEY);
    if (!existing) {
      const mockGrievances = this.generateMockGrievances(50);
      localStorage.setItem(this.GRIEVANCES_KEY, JSON.stringify(mockGrievances));
    }

    const existingTokens = localStorage.getItem(this.TOKENS_KEY);
    if (!existingTokens) {
      localStorage.setItem(this.TOKENS_KEY, JSON.stringify([]));
    }
  }

  private generateMockGrievances(count: number): Grievance[] {
    const titles = [
      'Waste collection delayed in Zone A',
      'Improper segregation at pickup point',
      'Missing waste bins in commercial area',
      'Overflow at disposal center',
      'Request for additional recycling bins'
    ];

    const categories: Grievance['category'][] = ['collection', 'disposal', 'sanitation', 'other'];
    const priorities: Grievance['priority'][] = ['low', 'medium', 'high', 'urgent'];
    const statuses: Grievance['status'][] = ['open', 'in_progress', 'resolved', 'closed'];

    const grievances: Grievance[] = [];

    for (let i = 0; i < count; i++) {
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
      
      grievances.push({
        id: generateSecureId(10),
        title: titles[Math.floor(Math.random() * titles.length)],
        description: `Detailed description of the grievance issue #${i + 1}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        submittedBy: 'user_001',
        createdAt,
        updatedAt: createdAt,
        tokenReward: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 10 : undefined
      });
    }

    return grievances;
  }

  getAllGrievances(): Grievance[] {
    return JSON.parse(localStorage.getItem(this.GRIEVANCES_KEY) || '[]');
  }

  getGrievanceById(id: string): Grievance | null {
    const grievances = this.getAllGrievances();
    return grievances.find(g => g.id === id) || null;
  }

  createGrievance(grievance: Omit<Grievance, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Grievance {
    const newGrievance: Grievance = {
      ...grievance,
      id: generateSecureId(10),
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const grievances = this.getAllGrievances();
    grievances.push(newGrievance);
    localStorage.setItem(this.GRIEVANCES_KEY, JSON.stringify(grievances));

    return newGrievance;
  }

  updateGrievance(id: string, updates: Partial<Grievance>): boolean {
    const grievances = this.getAllGrievances();
    const index = grievances.findIndex(g => g.id === id);
    
    if (index === -1) return false;

    grievances[index] = {
      ...grievances[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(this.GRIEVANCES_KEY, JSON.stringify(grievances));
    return true;
  }

  getUserTokenBalance(userId: string): number {
    const tokens = this.getUserTokens(userId);
    return tokens.reduce((sum, token) => {
      return sum + (token.type === 'earned' || token.type === 'purchased' ? token.amount : -token.amount);
    }, 0);
  }

  getUserTokens(userId: string): SustatioToken[] {
    const allTokens = JSON.parse(localStorage.getItem(this.TOKENS_KEY) || '[]');
    return allTokens.filter((token: SustatioToken) => token.userId === userId);
  }

  awardTokens(userId: string, amount: number, description: string, grievanceId?: string): SustatioToken {
    const token: SustatioToken = {
      id: generateSecureId(12),
      userId,
      amount,
      type: 'earned',
      description,
      timestamp: new Date().toISOString(),
      relatedGrievance: grievanceId
    };

    const tokens = JSON.parse(localStorage.getItem(this.TOKENS_KEY) || '[]');
    tokens.push(token);
    localStorage.setItem(this.TOKENS_KEY, JSON.stringify(tokens));

    return token;
  }

  purchaseTokens(userId: string, amount: number, description: string): SustatioToken {
    const token: SustatioToken = {
      id: generateSecureId(12),
      userId,
      amount,
      type: 'purchased',
      description,
      timestamp: new Date().toISOString()
    };

    const tokens = JSON.parse(localStorage.getItem(this.TOKENS_KEY) || '[]');
    tokens.push(token);
    localStorage.setItem(this.TOKENS_KEY, JSON.stringify(tokens));

    return token;
  }

  getGrievancesByUser(userId: string): Grievance[] {
    const grievances = this.getAllGrievances();
    return grievances.filter(g => g.submittedBy === userId);
  }

  getGrievanceStats() {
    const grievances = this.getAllGrievances();
    
    return {
      total: grievances.length,
      open: grievances.filter(g => g.status === 'open').length,
      inProgress: grievances.filter(g => g.status === 'in_progress').length,
      resolved: grievances.filter(g => g.status === 'resolved').length,
      byCategory: grievances.reduce((acc, g) => {
        acc[g.category] = (acc[g.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPriority: grievances.reduce((acc, g) => {
        acc[g.priority] = (acc[g.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

export const grievanceService = new GrievanceService();