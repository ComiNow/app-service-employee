export interface User {
  id: string;
  email: string;
  fullName?: string;
  businessId: string;
  role: 'admin' | 'employee' | string;
  roleId?: string;
  roleName?: string;
  moduleAccessId?: string;
}
