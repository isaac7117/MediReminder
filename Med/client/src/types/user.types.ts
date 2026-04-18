export interface User {
  id: string;
  email: string;
  fullName: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  profileImage?: string;
  onboardingCompleted?: boolean;
  gender?: string;
  role?: string;
}

export interface CareProfile {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  isDefault: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  updateUser: (user: User) => void;
}
