import { User, UserRole } from '../types/auth';
import { SEEDED_USERS } from './authService';

let usersStore: User[] = [...SEEDED_USERS];

export const userService = {
  getUsers: async (): Promise<User[]> => {
    return [...usersStore];
  },

  createUser: async (user: Omit<User, 'id'>): Promise<User> => {
    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}`
    };
    usersStore.push(newUser);
    return newUser;
  },

  updateUserRole: async (userId: string, newRole: UserRole): Promise<User> => {
    const idx = usersStore.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    usersStore[idx] = { ...usersStore[idx], role: newRole };
    return usersStore[idx];
  },

  toggleUserStatus: async (userId: string): Promise<User> => {
    const idx = usersStore.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    const current = usersStore[idx].status;
    usersStore[idx] = {
      ...usersStore[idx],
      status: current === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
    };
    return usersStore[idx];
  }
};
