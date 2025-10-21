export interface UserDTO {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'manager' | 'resident' | 'staff' | 'user';
}

export interface CollectionRecordDTO {
  staffId: string;
  residentId?: string;
  category: string;
  weightKg: number;
  timestamp: string;
}
