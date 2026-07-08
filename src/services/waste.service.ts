import { WasteRecord, WasteCategory, WasteStatus, TimelineEvent, AISuggestion } from '../types';
import { generateWasteTag, generateSecureId } from '../utils/security';

class WasteService {
  private readonly STORAGE_KEY = 'sustatio_waste_records';
  private readonly TIMELINE_KEY = 'sustatio_timeline';

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (!existing || JSON.parse(existing).length < 5000) {
      console.log('Generating 5200+ waste records...');
      const mockRecords = this.generateMockWasteRecords(5200);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockRecords));
    }
  }

  private generateMockWasteRecords(count: number): WasteRecord[] {
    const categories: WasteCategory[] = ['Disposable', 'Non-disposable', 'PET Bottle', 'Metals & Glasses'];
    const statuses: WasteStatus[] = ['collected', 'in_transit', 'segregated', 'processed', 'disposed', 'recycled'];
    const locations = ['Zone A', 'Zone B', 'Zone C', 'Industrial Area', 'Residential Complex', 'Commercial District'];
    const sources = ['Household', 'Office', 'Factory', 'Restaurant', 'Hospital', 'School'];

    const records: WasteRecord[] = [];

    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();
      
      const record: WasteRecord = {
        id: generateSecureId(12),
        tag: generateWasteTag(),
        category,
        weight: Math.round((Math.random() * 50 + 0.5) * 100) / 100,
        location: locations[Math.floor(Math.random() * locations.length)],
        status,
        createdBy: 'system',
        createdAt,
        updatedAt: createdAt,
        timeline: this.generateTimelineEvents(status, createdAt),
        metadata: {
          source: sources[Math.floor(Math.random() * sources.length)],
          hazardLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          recyclable: Math.random() > 0.3,
          description: this.generateWasteDescription(category)
        }
      };

      records.push(record);
    }

    return records;
  }

  private generateTimelineEvents(finalStatus: WasteStatus, startDate: string): TimelineEvent[] {
    const statusFlow: WasteStatus[] = ['collected', 'in_transit', 'segregated', 'processed'];
    const finalIndex = statusFlow.indexOf(finalStatus);
    const events: TimelineEvent[] = [];

    let currentDate = new Date(startDate);
    
    for (let i = 0; i <= Math.max(0, finalIndex); i++) {
      events.push({
        id: generateSecureId(8),
        status: statusFlow[i],
        timestamp: currentDate.toISOString(),
        location: 'Processing Center',
        updatedBy: 'system',
        notes: `Status updated to ${statusFlow[i]}`
      });

      // Add random delay between events
      currentDate = new Date(currentDate.getTime() + Math.random() * 24 * 60 * 60 * 1000);
    }

    return events;
  }

  private generateWasteDescription(category: WasteCategory): string {
    const descriptions = {
      'Disposable': ['Food waste', 'Paper napkins', 'Organic matter', 'Biodegradable materials'],
      'Non-disposable': ['Electronic components', 'Plastic containers', 'Synthetic materials', 'Mixed waste'],
      'PET Bottle': ['Beverage bottles', 'Water bottles', 'Sauce containers', 'Clear plastic bottles'],
      'Metals & Glasses': ['Aluminum cans', 'Glass bottles', 'Metal scraps', 'Wire materials']
    };

    const options = descriptions[category];
    return options[Math.floor(Math.random() * options.length)];
  }

  getAllWasteRecords(userRole?: string): WasteRecord[] {
    const records = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    
    if (!userRole || userRole === 'admin') return records;
    
    // Filter based on role permissions
    if (userRole === 'microhub') {
      return records.filter((r: WasteRecord) => r.category === 'Disposable');
    }
    
    if (userRole === 'factory_admin') {
      return records.filter((r: WasteRecord) => r.category !== 'Disposable');
    }
    
    return records;
  }

  getWasteRecordByTag(tag: string): WasteRecord | null {
    const records = this.getAllWasteRecords();
    return records.find((r: WasteRecord) => r.tag === tag) || null;
  }

  createWasteRecord(record: Omit<WasteRecord, 'id' | 'tag' | 'createdAt' | 'updatedAt' | 'timeline'>): WasteRecord {
    const newRecord: WasteRecord = {
      ...record,
      id: generateSecureId(12),
      tag: generateWasteTag(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [{
        id: generateSecureId(8),
        status: record.status,
        timestamp: new Date().toISOString(),
        location: record.location,
        updatedBy: record.createdBy,
        notes: 'Waste record created'
      }]
    };

    const records = this.getAllWasteRecords();
    records.push(newRecord);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    
    return newRecord;
  }

  updateWasteStatus(tag: string, status: WasteStatus, updatedBy: string, notes?: string): boolean {
    const records = this.getAllWasteRecords();
    const recordIndex = records.findIndex((r: WasteRecord) => r.tag === tag);
    
    if (recordIndex === -1) return false;

    const record = records[recordIndex];
    record.status = status;
    record.updatedAt = new Date().toISOString();
    
    // Add timeline event
    record.timeline.push({
      id: generateSecureId(8),
      status,
      timestamp: new Date().toISOString(),
      location: record.location,
      updatedBy,
      notes: notes || `Status updated to ${status}`
    });

    records[recordIndex] = record;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    
    return true;
  }

  getAISuggestion(wasteDescription: string, context?: any): AISuggestion {
    // Rule-based AI suggestion engine (replaceable with TensorFlow.js)
    const description = wasteDescription.toLowerCase();
    
    // Festival/event signals
    const festivalKeywords = ['diwali', 'christmas', 'new year', 'festival', 'celebration'];
    const isFestivalSeason = festivalKeywords.some(keyword => description.includes(keyword));
    
    // Material detection
    let primaryCategory: WasteCategory = 'Non-disposable';
    let confidence = 0.6;
    let reasoning = 'Default classification based on general waste category';
    
    if (description.includes('food') || description.includes('organic') || description.includes('kitchen')) {
      primaryCategory = 'Disposable';
      confidence = 0.85;
      reasoning = 'Detected organic/food waste indicators';
    } else if (description.includes('bottle') || description.includes('pet') || description.includes('beverage')) {
      primaryCategory = 'PET Bottle';
      confidence = 0.90;
      reasoning = 'Detected bottle-related keywords';
    } else if (description.includes('metal') || description.includes('glass') || description.includes('aluminum') || description.includes('steel')) {
      primaryCategory = 'Metals & Glasses';
      confidence = 0.88;
      reasoning = 'Detected metal/glass material indicators';
    }

    // Adjust confidence based on festival season
    if (isFestivalSeason) {
      confidence = Math.min(0.95, confidence + 0.1);
      reasoning += ' (adjusted for festival season patterns)';
    }

    return {
      category: primaryCategory,
      confidence,
      reasoning,
      alternativeCategories: [
        { category: 'Non-disposable', confidence: 1 - confidence },
        { category: 'Disposable', confidence: Math.max(0, confidence - 0.3) }
      ].filter(alt => alt.category !== primaryCategory)
    };
  }

  getWasteStatsByCategory(): Record<WasteCategory, number> {
    const records = this.getAllWasteRecords();
    const stats: Record<WasteCategory, number> = {
      'Disposable': 0,
      'Non-disposable': 0,
      'PET Bottle': 0,
      'Metals & Glasses': 0
    };

    records.forEach((record: WasteRecord) => {
      stats[record.category]++;
    });

    return stats;
  }

  searchWasteRecords(query: string, filters?: {
    category?: WasteCategory;
    status?: WasteStatus;
    location?: string;
  }): WasteRecord[] {
    let records = this.getAllWasteRecords();
    
    // Apply text search
    if (query.trim()) {
      records = records.filter((record: WasteRecord) => 
        record.tag.includes(query) ||
        record.category.toLowerCase().includes(query.toLowerCase()) ||
        record.location.toLowerCase().includes(query.toLowerCase()) ||
        record.metadata.description?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply filters
    if (filters) {
      if (filters.category) {
        records = records.filter((r: WasteRecord) => r.category === filters.category);
      }
      if (filters.status) {
        records = records.filter((r: WasteRecord) => r.status === filters.status);
      }
      if (filters.location) {
        records = records.filter((r: WasteRecord) => r.location === filters.location);
      }
    }
    
    return records;
  }
}

export const wasteService = new WasteService();