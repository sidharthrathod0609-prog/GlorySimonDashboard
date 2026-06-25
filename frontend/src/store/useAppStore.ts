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
  User,
  Client
} from '../types';

interface AppState {
  // Global States
  currentTab: string;
  projects: Project[];
  materials: Material[];
  vendors: Vendor[];
  stats: any;
  brandTheme: string;
  themeMode: 'light' | 'dark' | 'system';
  backgroundStyle: 'villa' | 'living-room' | 'office' | 'architectural';
  activeProjectId: number | null;
  projectDetails: any;
  detailsLoading: boolean;
  
  // Auth States
  isAuthenticated: boolean;
  currentUser: User;
  usersList: User[];
  clients: Client[];
  
  // Tracking & Workflow States
  procurements: any[];
  installations: any[];
  quotations: any[];
  notifications: any[];

  // Actions
  setCurrentTab: (tab: string) => void;
  setBrandTheme: (theme: string) => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setBackgroundStyle: (style: 'villa' | 'living-room' | 'office' | 'architectural') => void;
  setCurrentUser: (user: User) => void;
  setActiveProjectId: (id: number | null) => void;
  
  // Auth Actions
  fetchUsers: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  sendPasswordReset: (email: string) => Promise<boolean>;
  updateUserProfile: (name: string, email: string) => void;
  addUser: (user: User) => Promise<void>;
  requestAccess: (name: string, email: string, role: 'Interior Designer' | 'Project Manager' | 'Vendor Coordinator', password: string) => Promise<void>;
  handleAccessRequest: (email: string, status: 'Approved' | 'Declined') => Promise<void>;
  cancelAccess: (email: string) => Promise<void>;
  deleteUserAccess: (email: string) => Promise<void>;
  
  // Client Actions
  fetchClients: () => Promise<void>;
  createClient: (clientData: Partial<Client>) => Promise<void>;
  updateClient: (id: number, clientData: Partial<Client>) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;

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

  // Vendor & Tracker Actions
  createVendor: (vendorData: Partial<Vendor>) => Promise<void>;
  updateVendor: (id: number, vendorData: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: number) => Promise<void>;
  createProcurement: (data: any) => Promise<void>;
  updateProcurementStatus: (id: number, status: string) => Promise<void>;
  updateInstallationStatus: (taskId: number, status: string) => Promise<void>;
  createQuotation: (data: any) => Promise<void>;
  deleteQuotation: (id: number) => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Defaults
  currentTab: 'dashboard',
  projects: [],
  materials: [],
  vendors: [],
  stats: null,
  brandTheme: 'gold',
  themeMode: (localStorage.getItem('gs_theme_mode') as any) || 'light',
  backgroundStyle: (localStorage.getItem('gs_background_style') as any) || 'villa',
  activeProjectId: null,
  projectDetails: null,
  detailsLoading: false,

  // Auth defaults with localStorage persistence
  isAuthenticated: localStorage.getItem('gs_isAuthenticated') === 'true',
  currentUser: JSON.parse(localStorage.getItem('gs_currentUser') || 'null') || {
    name: 'Zotha',
    email: 'zotha@glorysimon.com',
    role: 'Admin',
    avatar: 'Z'
  },
  usersList: [],
  clients: [],
  procurements: JSON.parse(localStorage.getItem('gs_procurements') || 'null') || [
    { id: 1, material: 'Italian Carrara Vitrified Tile', vendor: 'Apex Marble & Tiles', quantity: 432, orderedDate: '2026-06-10', deliveryDate: '2026-06-20', status: 'Shipped' },
    { id: 2, material: 'Teak Wood Matte Laminate', vendor: 'DecoWood Laminates', quantity: 252, orderedDate: '2026-06-12', deliveryDate: '2026-06-18', status: 'Delivered' },
    { id: 3, material: 'Chesterfield Emerald Velvet Sofa', vendor: 'Royal Oak Furniture', quantity: 1, orderedDate: '2026-06-14', deliveryDate: '2026-06-25', status: 'Ordered' }
  ],
  installations: JSON.parse(localStorage.getItem('gs_installations') || 'null') || [
    { id: 'Flooring', task: 'Flooring', status: 'In Progress', progress: 60, notes: 'Living room marble installation in progress' },
    { id: 'Painting', task: 'Painting', status: 'Not Started', progress: 0, notes: 'Sanding completed. Wall priming pending' },
    { id: 'Lighting', task: 'Lighting', status: 'Not Started', progress: 0, notes: 'False ceiling wiring check completed' },
    { id: 'Furniture', task: 'Furniture', status: 'Not Started', progress: 0, notes: 'Sofa sourcing completed. Site delivery pending' }
  ],
  quotations: JSON.parse(localStorage.getItem('gs_quotations') || 'null') || [
    { id: 1, date: '2026-06-18', clientName: 'Sidharth Rathod', projectName: "Rathod's Villa", items: [
      { material: 'Italian Carrara Vitrified Tile', quantity: 400, unitCost: 120, gst: 18, total: 56640 }
    ], total: 56640 }
  ],
  notifications: [
    { id: 1, type: 'approval', title: 'Material Approval Pending', message: 'Chevron Dark Slate Tile for Executive Boardroom requires client approval', date: '10 mins ago', read: false },
    { id: 2, type: 'visit', title: 'Site Visit Reminder', message: 'Drywall check booked for Priya Cozy 2BHK Apartment at 10:00 AM tomorrow', date: '2 hours ago', read: false },
    { id: 3, type: 'vendor', title: 'Vendor Follow-up', message: 'Linen Beige Blackout Curtain PO requires coordinator dispatch signature', date: '5 hours ago', read: true },
    { id: 4, type: 'budget', title: 'Budget Exceeded Alert', message: "Rathod's Villa has exceeded its allocated budget cap limit!", date: '1 day ago', read: false }
  ],

  // State Switchers
  setCurrentTab: (tab) => set({ currentTab: tab }),
  setBrandTheme: (theme) => set({ brandTheme: theme }),
  setThemeMode: (mode) => {
    localStorage.setItem('gs_theme_mode', mode);
    set({ themeMode: mode });
  },
  setBackgroundStyle: (style) => {
    localStorage.setItem('gs_background_style', style);
    set({ backgroundStyle: style });
  },
  setCurrentUser: (user) => {
    localStorage.setItem('gs_currentUser', JSON.stringify(user));
    set({ currentUser: user });
  },

  // Auth Actions
  fetchUsers: async () => {
    try {
      const users = await db.getUsers();
      set({ usersList: users });
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  },

  login: async (email, password) => {
    try {
      const user = await db.loginUser(email, password);
      localStorage.setItem('gs_isAuthenticated', 'true');
      localStorage.setItem('gs_currentUser', JSON.stringify(user));
      set({ isAuthenticated: true, currentUser: user });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  logout: () => {
    localStorage.removeItem('gs_isAuthenticated');
    localStorage.removeItem('gs_currentUser');
    set({ isAuthenticated: false, currentUser: { name: '', email: '', role: 'Admin', avatar: '' } });
  },

  sendPasswordReset: async (email) => {
    try {
      const users = await db.getUsers();
      const trimmedEmail = email.trim().toLowerCase();
      return users.some(u => u.email.toLowerCase() === trimmedEmail);
    } catch (err) {
      console.error('Error in sendPasswordReset:', err);
      return false;
    }
  },

  updateUserProfile: (name, email) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const updated: User = { ...currentUser, name, email, avatar: initials || 'GS' };
    localStorage.setItem('gs_currentUser', JSON.stringify(updated));
    set({ currentUser: updated });
  },

  addUser: async (user) => {
    try {
      await db.createUser(user);
      await get().fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
    }
  },

  requestAccess: async (name, email, role, password) => {
    try {
      await db.registerUser({ name, email, role, password });
      await get().fetchUsers();
      await get().fetchNotifications();
    } catch (err) {
      console.error('Error requesting access:', err);
      throw err;
    }
  },

  handleAccessRequest: async (email, status) => {
    try {
      await db.updateUserStatus(email, status);
      await get().fetchUsers();
      await get().fetchNotifications();
    } catch (err) {
      console.error('Error handling access request:', err);
    }
  },

  cancelAccess: async (email) => {
    try {
      await db.updateUserStatus(email, 'Declined');
      await get().fetchUsers();
    } catch (err) {
      console.error('Error canceling user access:', err);
    }
  },

  deleteUserAccess: async (email) => {
    try {
      await db.deleteUser(email);
      await get().fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  },
  fetchClients: async () => {
    try {
      const clients = await db.getClients();
      set({ clients });
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  },
  createClient: async (clientData) => {
    try {
      await db.createClient(clientData);
      await get().fetchClients();
    } catch (err) {
      console.error('Error creating client:', err);
    }
  },
  updateClient: async (id, clientData) => {
    try {
      await db.updateClient(id, clientData);
      await get().fetchClients();
      await get().fetchProjects();
    } catch (err) {
      console.error('Error updating client:', err);
    }
  },
  deleteClient: async (id) => {
    try {
      await db.deleteClient(id);
      await get().fetchClients();
      await get().fetchProjects();
    } catch (err) {
      console.error('Error deleting client:', err);
    }
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
    const { activeProjectId, currentUser, procurements, projectDetails } = get();
    try {
      await db.updateSelection(selectionId, {
        ...updateData,
        userName: currentUser.name
      });
      
      // Seed procurement tracking entry automatically if approved
      if (updateData.status === 'Approved') {
        const selectionItem = projectDetails?.selections?.find((s: any) => s.id === selectionId);
        if (selectionItem) {
          const alreadyExists = procurements.some((p: any) => p.selectionId === selectionId);
          if (!alreadyExists) {
            const delivery = new Date();
            delivery.setDate(delivery.getDate() + 10);
            
            const newProc = {
              id: Date.now(),
              selectionId,
              material: selectionItem.material_name || 'Italian Tile finish',
              vendor: selectionItem.vendor_name || 'Apex Marble & Tiles',
              quantity: selectionItem.quantity || 1,
              orderedDate: new Date().toISOString().split('T')[0],
              deliveryDate: delivery.toISOString().split('T')[0],
              status: 'Ordered'
            };
            
            const updatedProcurements = [...procurements, newProc];
            localStorage.setItem('gs_procurements', JSON.stringify(updatedProcurements));
            set({ procurements: updatedProcurements });
          }
        }
      }

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
  },

  // Vendor CRUD implementations
  createVendor: async (vendorData) => {
    try {
      await db.createVendor(vendorData);
      await get().fetchVendors();
    } catch (err) {
      console.error('Error creating vendor:', err);
    }
  },

  updateVendor: async (id, vendorData) => {
    try {
      await db.updateVendor(id, vendorData);
      await get().fetchVendors();
    } catch (err) {
      console.error('Error updating vendor:', err);
    }
  },

  deleteVendor: async (id) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await db.deleteVendor(id);
      await get().fetchVendors();
    } catch (err) {
      console.error('Error deleting vendor:', err);
    }
  },

  // Procurement Trackers
  createProcurement: async (data) => {
    const { procurements } = get();
    const newItem = { id: Date.now(), ...data };
    const updated = [...procurements, newItem];
    localStorage.setItem('gs_procurements', JSON.stringify(updated));
    set({ procurements: updated });
  },

  updateProcurementStatus: async (id, status) => {
    const { procurements } = get();
    const updated = procurements.map(item => item.id === id ? { ...item, status } : item);
    localStorage.setItem('gs_procurements', JSON.stringify(updated));
    set({ procurements: updated });
  },

  // Installation Tracker Progress
  updateInstallationStatus: async (id, status) => {
    const { installations } = get();
    const updated = installations.map(item => {
      if (item.id === id) {
        let progress = 0;
        if (status === 'Completed') progress = 100;
        else if (status === 'In Progress') progress = 50;
        return { ...item, status, progress };
      }
      return item;
    });
    localStorage.setItem('gs_installations', JSON.stringify(updated));
    set({ installations: updated });
  },

  // Quotation Builder Actions
  createQuotation: async (data) => {
    const { quotations } = get();
    const newItem = { id: Date.now(), ...data };
    const updated = [...quotations, newItem];
    localStorage.setItem('gs_quotations', JSON.stringify(updated));
    set({ quotations: updated });
  },

  deleteQuotation: async (id) => {
    if (!confirm('Are you sure you want to delete this quote record?')) return;
    const { quotations } = get();
    const updated = quotations.filter(q => q.id !== id);
    localStorage.setItem('gs_quotations', JSON.stringify(updated));
    set({ quotations: updated });
  },

  // Live Alerts & Notifications Feed
  fetchNotifications: async () => {
    const { projects, stats } = get();
    const list: any[] = [];

    // Fetch users first to see if any are pending
    let fetchedUsersList: User[] = [];
    try {
      fetchedUsersList = await db.getUsers();
    } catch (e) {
      console.error('Error getting users for notifications:', e);
      fetchedUsersList = get().usersList;
    }

    // 0. Access requests (highest priority - insert first)
    const pendingUsers = fetchedUsersList.filter(u => u.status === 'Pending');
    pendingUsers.forEach((u, index) => {
      list.push({
        id: Date.now() + 100 + index,
        type: 'access',
        title: 'New Access Request',
        message: `${u.name} has requested access as ${u.role}.`,
        date: 'Just now',
        read: false,
        requestEmail: u.email
      });
    });
    
    // 1. Budget Alerts
    if (stats?.budgetUsage && stats.budgetUsage.utilizationPct > 100) {
      list.push({
        id: Date.now() + 1,
        type: 'budget',
        title: 'Budget Exceeded Alert',
        message: `Sourced costs exceed budget cap by INR ${(stats.budgetUsage.totalSpent - stats.budgetUsage.totalBudget).toLocaleString()}!`,
        date: 'Just now',
        read: false
      });
    } else if (stats?.budgetUsage && stats.budgetUsage.utilizationPct >= 75) {
      list.push({
        id: Date.now() + 1,
        type: 'budget',
        title: 'Budget Utilization Warning',
        message: `Sourced costs have reached ${stats.budgetUsage.utilizationPct}% of the allocated budget.`,
        date: '10 mins ago',
        read: false
      });
    }

    // 2. Material Approvals Pending
    const pendingCount = stats?.pendingMaterials || 0;
    if (pendingCount > 0) {
      list.push({
        id: Date.now() + 2,
        type: 'approval',
        title: 'Material Approval Pending',
        message: `You have ${pendingCount} material selections awaiting client sign-off validation.`,
        date: '15 mins ago',
        read: false
      });
    }

    // 3. Site Visits
    const visitsCount = stats?.siteVisitsScheduled || 0;
    if (visitsCount > 0) {
      list.push({
        id: Date.now() + 3,
        type: 'visit',
        title: 'Site Visit Scheduled',
        message: `Site visit scheduled for measurements check of active project.`,
        date: '2 hours ago',
        read: true
      });
    }

    // 4. Default coordinator checks
    list.push({
      id: Date.now() + 4,
      type: 'vendor',
      title: 'Vendor Follow-up',
      message: 'Apex Marble PO invoice verification is pending vendor dispatcher.',
      date: '4 hours ago',
      read: false
    });

    set({ notifications: list });
  }
}));
