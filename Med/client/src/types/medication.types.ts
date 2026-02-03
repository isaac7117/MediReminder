export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequencyType: 'hourly' | 'daily' | 'weekly' | 'custom';
  frequencyValue: number;
  frequencyTimes: string[];
  frequencyDays: number[];
  startDate: string;
  endDate?: string;
  isContinuous: boolean;
  instructions?: string;
  imageUrl?: string;
  prescriptionImageUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicationInput {
  name: string;
  dosage: string;
  frequencyType: 'hourly' | 'daily' | 'weekly' | 'custom';
  frequencyValue: number;
  frequencyTimes: string[];
  frequencyDays?: number[];
  startDate: string;
  endDate?: string;
  isContinuous?: boolean;
  instructions?: string;
  imageUrl?: string;
  prescriptionImageUrl?: string;
}
