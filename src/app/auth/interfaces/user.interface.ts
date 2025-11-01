export interface User {
  id: string; 
  email: string;
  fullName?: string;
  businessId: string; 
  role: 'admin' | 'employee' | string; 
  positionId: string | null; 
  positionName: string | null; 
  moduleAccessId?: string[];
}