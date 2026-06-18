import { create } from 'zustand';
import { db } from '../services/db';
import {
  Project,
  Room,
  Material,
  Vendor,
  MaterialSelection,
  Expense,
  Task,
  SiteVisit,
  User
} from '../types';

interface AppState {
  // Global States
  currentTab: string;
  projects: Project[];
  materials: Material[];
  vendors: Vendor[];
  stats: any;
  brandTheme: string;
  activeProjectId: number | null;
  projectDetails: any;
  detailsLoading: boolean;
  
  // Auth States
  isAuthenticated: boolean;
  currentUser: User;
  usersList: User[];

  // Actions
  setCurrentTab: (tab: string) => void;
  setBrandTheme: (theme: string) => void;
  setCurrentUser: (user: User) => void;
  setActiveProjectId: (id: number | null) => void;
  
  // Auth Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  sendPasswordReset: (email: string) => Promise<boolean>;
  updateUserProfile: (name: string, email: string) => void;
  addUser: (user: User) => void;

  // Sourcing Actions
  fetchStats: () => Promise<void>;
  fetchProjects: (filters?: string) => Promise<void>;
  fetchMaterials: () => Promise<void>;
  fetchVendors: () => Promise<void>;
  fetchProjectDetails: (id: number) => Promise<void>;

  // Project CRUD Actions
  createProject: (projectData: Partial<Project>) => Promise<void>;
  updateProject: (id: number, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;

  // Room Actions
  addRoom: (roomData: Partial<Room>) => Promise<void>;

  // Selection Actions
  addSelection: (selectionData: Partial<MaterialSelection>) => Promise<void>;
  updateSelection: (selectionId: number, updateData: Partial<MaterialSelection>) => Promise<void>;
  deleteSelection: (selectionId: number) => Promise<void>;

  // Financial Actions
  addExpense: (expenseData: Partial<Expense>) => Promise<void>;

  // Design approvals
  updateConceptStatus: (conceptId: number, status: 'Approved' | 'Revised') => Promise<void>;

  // Operational Actions
  createSiteVisit: (visitData: Partial<SiteVisit>) => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<void>;
  updateTaskStatus: (taskId: number, status: 'To Do' | 'In Progress' | 'Completed') => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Defaults
  currentTab: 'dashboard',
  projects: [],
  materials: [],
  vendors: [],
  stats: null,
  brandTheme: 'gold',
  activeProjectId: null,
  projectDetails: null,
  detailsLoading: false,

  // Auth defaults with localStorage persistence
  isAuthenticated: localStorage.getItem('gs_isAuthenticated') === 'true',
  currentUser: JSON.parse(localStorage.getItem('gs_currentUser') || 'null') || {
    name: 'Glory Simon Admin',
    email: 'admin@glorysimon.com',
    role: 'Admin',
    avatar: 'GA'
  },
  usersList: JSON.parse(localStorage.getItem('gs_usersList') || 'null') || [
    { name: 'Glory Simon Admin', email: 'admin@glorysimon.com', role: 'Admin', avatar: 'GA', password: 'Admin123' },
    { name: 'Nisha Sen', email: 'designer@glorysimon.com', role: 'Interior Designer', avatar: 'NS', password: 'Design123' },
    { name: 'Rahul Dev', email: 'pm@glorysimon.com', role: 'Project Manager', avatar: 'RD', password: 'PM123' },
    { name: 'Meera Nair', email: 'vendor@glorysimon.com', role: 'Vendor Coordinator', avatar: 'MN', password: 'Vendor123' }
  ],

  // State Switchers
  setCurrentTab: (tab) => set({ currentTab: tab }),
  setBrandTheme: (theme) => set({ brandTheme: theme }),
  setCurrentUser: (user) => {
    localStorage.setItem('gs_currentUser', JSON.stringify(user));
    set({ currentUser: user });
  },

  // Auth Actions
  login: async (email, password) => {
    // Simulate minor network validation delay
    await new Promise(resolve => setTimeout(resolve, 400));
    const { usersList } = get();
    const trimmedEmail = email.trim().toLowerCase();
    const user = usersList.find(u => u.email.toLowerCase() === trimmedEmail);

    if (user && user.password === password) {
      localStorage.setItem('gs_isAuthenticated', 'true');
      localStorage.setItem('gs_currentUser', JSON.stringify(user));
      set({ isAuthenticated: true, currentUser: user });
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem('gs_isAuthenticated');
    localStorage.removeItem('gs_currentUser');
    set({ isAuthenticated: false, currentUser: { name: '', email: '', role: 'Admin', avatar: '' } });
  },

  sendPasswordReset: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const { usersList } = get();
    const trimmedEmail = email.trim().toLowerCase();
    return usersList.some(u => u.email.toLowerCase() === trimmedEmail);
  },

  updateUserProfile: (name, email) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const updated: User = { ...currentUser, name, email, avatar: initials || 'GS' };
    localStorage.setItem('gs_currentUser', JSON.stringify(updated));
    set({ currentUser: updated });
  },

  addUser: (user) => {
    const { usersList } = get();
    const updated = [...usersList, user];
    localStorage.setItem('gs_usersList', JSON.stringify(updated));
    set({ usersList: updated });
  },
  setActiveProjectId: (id) => {
    set({ activeProjectId: id });
    if (id === null) {
      set({ projectDetails: null });
    } else {
      get().fetchProjectDetails(id);
    }
  },

  // Sourcing Data Layer
  fetchStats: async () => {
    try {
      const stats = await db.getDashboardStats();
      set({ stats });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  },

  fetchProjects: async (filters = '') => {
    try {
      const projects = await db.getProjects(filters);
      set({ projects });
      
      // Select first project default
      const { activeProjectId } = get();
      if (projects.length > 0 && !activeProjectId) {
        get().setActiveProjectId(projects[0].id);
      }
    } catch (err) {
      console.error('Error fetching projects list:', err);
    }
  },

  fetchMaterials: async () => {
    try {
      const materials = await db.getMaterials();
      set({ materials });
    } catch (err) {
      console.error('Error fetching materials catalogue:', err);
    }
  },

  fetchVendors: async () => {
    try {
      const vendors = await db.getVendors();
      set({ vendors });
    } catch (err) {
      console.error('Error fetching vendors list:', err);
    }
  },

  fetchProjectDetails: async (id: number) => {
    set({ detailsLoading: true });
    try {
      const details = await db.getProjectDetails(id);
      set({ projectDetails: details });
    } catch (err) {
      console.error('Error loading project details:', err);
    } finally {
      set({ detailsLoading: false });
    }
  },

  // Project Mutations
  createProject: async (projectData) => {
    try {
      const newProject = await db.createProject(projectData);
      await get().fetchProjects();
      get().setActiveProjectId(newProject.id);
      await get().fetchStats();
    } catch (err) {
      console.error('Error creating project:', err);
    }
  },

  updateProject: async (id, projectData) => {
    try {
      await db.updateProject(id, projectData);
      await get().fetchProjects();
      await get().fetchStats();
      if (get().activeProjectId === id) {
        await get().fetchProjectDetails(id);
      }
    } catch (err) {
      console.error('Error updating project:', err);
    }
  },

  deleteProject: async (id) => {
    if (!confirm('Are you sure you want to delete this project? All associated rooms, selections and logs will be permanently deleted.')) return;
    try {
      await db.deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        projectDetails: state.activeProjectId === id ? null : state.projectDetails
      }));
      await get().fetchStats();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  },

  // Rooms
  addRoom: async (roomData) => {
    const { activeProjectId } = get();
    if (!activeProjectId) return;
    try {
      await db.createRoom(activeProjectId, roomData);
      await get().fetchProjectDetails(activeProjectId);
    } catch (err) {
      console.error('Error adding room space:', err);
    }
  },

  // Selections
  addSelection: async (selectionData) => {
    const { activeProjectId, currentUser } = get();
    if (!activeProjectId) return;
    try {
      await db.createSelection({
        ...selectionData,
        project_id: activeProjectId,
        userName: currentUser.name
      });
      await get().fetchProjectDetails(activeProjectId);
      await get().fetchStats();
    } catch (err) {
      console.error('Error adding selection:', err);
    }
  },

  updateSelection: async (selectionId, updateData) => {
    const { activeProjectId, currentUser } = get();
    try {
      await db.updateSelection(selectionId, {
        ...updateData,
        userName: currentUser.name
      });
      if (activeProjectId) {
        await get().fetchProjectDetails(activeProjectId);
      }
      await get().fetchStats();
    } catch (err) {
      console.error('Error updating selection:', err);
    }
  },

  deleteSelection: async (selectionId) => {
    if (!confirm('Remove this material selection?')) return;
    const { activeProjectId } = get();
    try {
      await db.deleteSelection(selectionId);
      if (activeProjectId) {
        await get().fetchProjectDetails(activeProjectId);
      }
      await get().fetchStats();
    } catch (err) {
      console.error('Error deleting selection:', err);
    }
  },

  // Expenses
  addExpense: async (expenseData) => {
    const { activeProjectId } = get();
    if (!activeProjectId) return;
    try {
      await db.createExpense(activeProjectId, expenseData);
      await get().fetchProjectDetails(activeProjectId);
      await get().fetchStats();
    } catch (err) {
      console.error('Error logging expense:', err);
    }
  },

  // Concept status
  updateConceptStatus: async (conceptId, status) => {
    const { activeProjectId, currentUser } = get();
    if (!activeProjectId) return;
    try {
      await db.updateConceptStatus(activeProjectId, conceptId, status, currentUser.name);
      await get().fetchProjectDetails(activeProjectId);
      await get().fetchStats();
    } catch (err) {
      console.error('Error updating concept approval:', err);
    }
  },

  // Operations CRUD
  createSiteVisit: async (visitData) => {
    const { activeProjectId } = get();
    if (!activeProjectId) return;
    try {
      await db.createSiteVisit(activeProjectId, visitData);
      await get().fetchProjectDetails(activeProjectId);
      await get().fetchStats();
    } catch (err) {
      console.error('Error logging site visit:', err);
    }
  },

  createTask: async (taskData) => {
    const { activeProjectId } = get();
    if (!activeProjectId) return;
    try {
      await db.createTask(activeProjectId, taskData);
      await get().fetchProjectDetails(activeProjectId);
    } catch (err) {
      console.error('Error adding task:', err);
    }
  },

  updateTaskStatus: async (taskId, status) => {
    const { activeProjectId } = get();
    if (!activeProjectId) return;
    try {
      await db.updateTaskStatus(taskId, status);
      await get().fetchProjectDetails(activeProjectId);
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  },

  deleteTask: async (taskId) => {
    const { activeProjectId } = get();
    if (!activeProjectId) return;
    try {
      await db.deleteTask(taskId);
      await get().fetchProjectDetails(activeProjectId);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  }
}));
