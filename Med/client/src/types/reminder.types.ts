export interface Reminder {
  id: string;
  medicationId: string;
  userId: string;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  takenAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  medication?: {
    id: string;
    name: string;
    dosage: string;
    instructions?: string;
  };
}

export interface AdherenceStats {
  adherenceRate: number;
  total: number;
  taken: number;
  missed: number;
  skipped: number;
  days: number;
  dailyStats: Array<{
    date: string;
    taken: number;
    missed: number;
    skipped: number;
    total: number;
  }>;
}
