import { User, Resume } from '../types';

// Mock Database using LocalStorage
const USERS_KEY = 'srb_users';
const RESUMES_KEY = 'srb_resumes';
const SESSION_KEY = 'srb_session';

export const storage = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUser: (user: User) => {
    const users = storage.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  findUserByEmail: (email: string) => {
    const users = storage.getUsers();
    return users.find(u => u.email === email);
  },

  login: (user: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  getResumes: (userId: string): Resume[] => {
    const data = localStorage.getItem(RESUMES_KEY);
    const allResumes: Resume[] = data ? JSON.parse(data) : [];
    return allResumes.filter(r => r.userId === userId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  getResume: (id: string): Resume | undefined => {
    const data = localStorage.getItem(RESUMES_KEY);
    const allResumes: Resume[] = data ? JSON.parse(data) : [];
    return allResumes.find(r => r.id === id);
  },

  saveResume: (resume: Resume) => {
    const data = localStorage.getItem(RESUMES_KEY);
    let allResumes: Resume[] = data ? JSON.parse(data) : [];
    
    const index = allResumes.findIndex(r => r.id === resume.id);
    if (index >= 0) {
      allResumes[index] = { ...resume, updatedAt: new Date().toISOString() };
    } else {
      allResumes.push({ ...resume, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    
    localStorage.setItem(RESUMES_KEY, JSON.stringify(allResumes));
  },

  deleteResume: (id: string) => {
    const data = localStorage.getItem(RESUMES_KEY);
    let allResumes: Resume[] = data ? JSON.parse(data) : [];
    allResumes = allResumes.filter(r => r.id !== id);
    localStorage.setItem(RESUMES_KEY, JSON.stringify(allResumes));
  }
};
