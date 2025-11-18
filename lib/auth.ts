export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'donor' | 'accepter' | 'admin';
  isVerified?: boolean;
  isActive?: boolean;
  [key: string]: any; // Allow additional properties
}

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    // Ensure id is set from _id if needed
    if (user._id && !user.id) {
      user.id = user._id;
    }
    return user;
  } catch {
    return null;
  }
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setAuthData = (token: string, user: User) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  // Check if user exists in localStorage (since we're not using tokens)
  return !!getStoredUser();
};

export const hasRole = (role: 'donor' | 'accepter' | 'admin'): boolean => {
  const user = getStoredUser();
  return user?.role === role;
};

export const isAdmin = (): boolean => {
  const user = getStoredUser();
  return user?.role === 'admin';
};

