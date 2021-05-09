import { createContext } from 'react';

interface User {
  id: number;
  is_active: boolean;
  is_staff: boolean;
}

interface Employee {
  id: number;
  user: User;
  first_name: string;
  last_name: string;
  avatar: string; // Base 64
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  marital_status: 'Single' | 'Married' | 'Divorced' | 'Seperated' | 'Widowed' | 'Other';
  date_of_birth: Date;
  personal_tax_id: string;
  nationality: string;
  phone: string;
  social_insurance: string;
  health_insurance: string;
  role: string;
  permissions: string[];
}

type ContextType = {
  user: Employee;
  setUser: React.Dispatch<React.SetStateAction<Employee>>;
};

export const AuthContext = createContext<ContextType | null>(null);
