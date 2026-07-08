import { User, AuthSession } from '../types';
import { generateSecureId } from '../utils/security';

class AuthService {
  private readonly STORAGE_KEY = 'sustatio_session';
  private readonly USERS_KEY = 'sustatio_users';
  
  constructor() {
    this.initializeDefaultUsers();
  }

  private initializeDefaultUsers() {
    const existingUsers = localStorage.getItem(this.USERS_KEY);
    if (!existingUsers) {
      const defaultUsers: User[] = [
        {
          id: 'admin_001',
          username: 'admin',
          email: 'admin@sustatio.com',
          role: 'admin',
          createdAt: new Date().toISOString(),
          profile: {
            name: 'System Administrator',
            organization: 'Sustatio Corp'
          }
        },
        {
          id: 'microhub_001',
          username: 'microhub1',
          email: 'microhub@sustatio.com',
          role: 'microhub',
          createdAt: new Date().toISOString(),
          profile: {
            name: 'MicroHub Operator',
            location: 'Zone A'
          }
        },
        {
          id: 'factory_001',
          username: 'factory1',
          email: 'factory@sustatio.com',
          role: 'factory_admin',
          createdAt: new Date().toISOString(),
          profile: {
            name: 'Factory Administrator',
            organization: 'Green Industries Ltd'
          }
        },
        {
          id: 'user_001',
          username: 'user',
          email: 'user@sustatio.com',
          role: 'user',
          createdAt: new Date().toISOString(),
          profile: {
            name: 'Regular User'
          }
        }
      ];
      
      // Hash passwords (simple demo - in production use proper bcrypt)
      const hashedUsers = defaultUsers.map(user => ({
        ...user,
        passwordHash: this.hashPassword('password123') // Default password for demo
      }));
      
      localStorage.setItem(this.USERS_KEY, JSON.stringify(hashedUsers));
    }
  }

  private hashPassword(password: string): string {
    // Simple hash for demo - replace with proper Web Crypto API implementation
    return btoa(password + 'sustatio_salt');
  }

  private verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  async login(username: string, password: string): Promise<AuthSession | null> {
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    const user = users.find((u: any) => u.username === username);
    
    if (!user || !this.verifyPassword(password, user.passwordHash)) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    const updatedUsers = users.map((u: any) => u.id === user.id ? user : u);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(updatedUsers));

    // Create session
    const session: AuthSession = {
      token: generateSecureId(32),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        profile: user.profile
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  getCurrentSession(): AuthSession | null {
    const sessionData = localStorage.getItem(this.STORAGE_KEY);
    if (!sessionData) return null;

    const session: AuthSession = JSON.parse(sessionData);
    
    // Check if session is expired
    if (new Date() > new Date(session.expiresAt)) {
      this.logout();
      return null;
    }

    return session;
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  hasPermission(requiredRole: string, userRole: string): boolean {
    const roleHierarchy = {
      'admin': 4,
      'factory_admin': 3,
      'microhub': 2,
      'user': 1
    };

    return (roleHierarchy as any)[userRole] >= (roleHierarchy as any)[requiredRole];
  }

  canAccessWasteRecord(userRole: string, wasteCategory: string): boolean {
    if (userRole === 'admin') return true;
    if (userRole === 'microhub') return wasteCategory === 'Disposable';
    if (userRole === 'factory_admin') return wasteCategory !== 'Disposable';
    return true; // Regular users can view all
  }
}

export const authService = new AuthService();