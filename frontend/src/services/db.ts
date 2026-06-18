import {
  Project,
  Room,
  Material,
  Vendor,
  MaterialSelection,
  MaterialHistory,
  Expense,
  Task,
  SiteVisit,
  DesignConcept
} from '../types';

const API_BASE = 'http://localhost:5000/api';

export interface IDatabaseService {
  // Dashboard & Stats
  getDashboardStats(): Promise<any>;

  // Projects
  getProjects(filters?: string): Promise<Project[]>;
  getProjectDetails(id: number): Promise<any>;
  createProject(projectData: Partial<Project>): Promise<Project>;
  updateProject(id: number, projectData: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  // Rooms
  createRoom(projectId: number, roomData: Partial<Room>): Promise<Room>;

  // Materials & Catalogue
  getMaterials(): Promise<Material[]>;

  // Vendors
  getVendors(): Promise<Vendor[]>;

  // Selections
  createSelection(selectionData: Partial<MaterialSelection> & { userName: string }): Promise<MaterialSelection>;
  updateSelection(id: number, updateData: Partial<MaterialSelection> & { userName: string }): Promise<MaterialSelection>;
  deleteSelection(id: number): Promise<void>;
  getSelectionHistory(selectionId: number): Promise<MaterialHistory[]>;

  // Expenses
  createExpense(projectId: number, expenseData: Partial<Expense>): Promise<Expense>;

  // Concepts
  updateConceptStatus(projectId: number, conceptId: number, status: 'Approved' | 'Revised', userName: string): Promise<any>;

  // Site Visits
  createSiteVisit(projectId: number, visitData: Partial<SiteVisit>): Promise<SiteVisit>;

  // Snag Tasks
  createTask(projectId: number, taskData: Partial<Task>): Promise<Task>;
  updateTaskStatus(taskId: number, status: 'To Do' | 'In Progress' | 'Completed'): Promise<Task>;
  deleteTask(taskId: number): Promise<void>;

  // Reports
  getMaterialReport(query?: string): Promise<any[]>;
  getVendorReport(): Promise<any[]>;
  getBudgetReport(): Promise<any[]>;
}

// ----------------------------------------------------
// 1. APIDatabaseService (Active Production Implementation)
// ----------------------------------------------------
export class APIDatabaseService implements IDatabaseService {
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  }

  async getProjects(filters = '') {
    const res = await fetch(`${API_BASE}/projects${filters}`);
    if (!res.ok) throw new Error('Failed to fetch projects list');
    return res.json();
  }

  async getProjectDetails(id: number) {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch project details');
    return res.json();
  }

  async createProject(projectData: Partial<Project>) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  }

  async updateProject(id: number, projectData: Partial<Project>) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
  }

  async deleteProject(id: number) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete project');
  }

  async createRoom(projectId: number, roomData: Partial<Room>) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData)
    });
    if (!res.ok) throw new Error('Failed to create room');
    return res.json();
  }

  async getMaterials() {
    const res = await fetch(`${API_BASE}/materials`);
    if (!res.ok) throw new Error('Failed to fetch materials catalogue');
    return res.json();
  }

  async getVendors() {
    const res = await fetch(`${API_BASE}/vendors`);
    if (!res.ok) throw new Error('Failed to fetch vendors list');
    return res.json();
  }

  async createSelection(selectionData: Partial<MaterialSelection> & { userName: string }) {
    const res = await fetch(`${API_BASE}/selections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectionData)
    });
    if (!res.ok) throw new Error('Failed to create selection');
    return res.json();
  }

  async updateSelection(id: number, updateData: Partial<MaterialSelection> & { userName: string }) {
    const res = await fetch(`${API_BASE}/selections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!res.ok) throw new Error('Failed to update selection');
    return res.json();
  }

  async deleteSelection(id: number) {
    const res = await fetch(`${API_BASE}/selections/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete selection');
  }

  async getSelectionHistory(selectionId: number) {
    const res = await fetch(`${API_BASE}/selections/${selectionId}/history`);
    if (!res.ok) throw new Error('Failed to fetch selection audit history');
    return res.json();
  }

  async createExpense(projectId: number, expenseData: Partial<Expense>) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData)
    });
    if (!res.ok) throw new Error('Failed to create expense');
    return res.json();
  }

  async updateConceptStatus(projectId: number, conceptId: number, status: 'Approved' | 'Revised', userName: string) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/concepts/${conceptId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, userName })
    });
    if (!res.ok) throw new Error('Failed to update design concept status');
    return res.json();
  }

  async createSiteVisit(projectId: number, visitData: Partial<SiteVisit>) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/site-visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData)
    });
    if (!res.ok) throw new Error('Failed to create site visit');
    return res.json();
  }

  async createTask(projectId: number, taskData: Partial<Task>) {
    const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  }

  async updateTaskStatus(taskId: number, status: 'To Do' | 'In Progress' | 'Completed') {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update task status');
    return res.json();
  }

  async deleteTask(taskId: number) {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete task');
  }

  async getMaterialReport(query = '') {
    const res = await fetch(`${API_BASE}/reports/materials${query}`);
    if (!res.ok) throw new Error('Failed to load materials report');
    return res.json();
  }

  async getVendorReport() {
    const res = await fetch(`${API_BASE}/reports/vendors`);
    if (!res.ok) throw new Error('Failed to load vendors report');
    return res.json();
  }

  async getBudgetReport() {
    const res = await fetch(`${API_BASE}/reports/budget`);
    if (!res.ok) throw new Error('Failed to load budget report');
    return res.json();
  }
}

// ----------------------------------------------------
// 2. MockDatabaseService (Client-Side LocalStorage Mock)
// ----------------------------------------------------
export class MockDatabaseService implements IDatabaseService {
  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 200));
  }

  private getLocalStorage<T>(key: string, defaultValue: T): T {
    const stored = localStorage.getItem(key);
    if (!stored) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(stored);
  }

  private setLocalStorage<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private seedData() {
    // Basic local seed fallback
    this.getLocalStorage('mock_projects', [
      { id: 1, name: 'Golden Crest Mansion', client_name: 'Amit Sharma', client_email: 'amit@gmail.com', status: 'Material Selection', budget: 1500000, address: 'Delhi', notes: 'Premium residency development.', created_at: new Date().toISOString() }
    ]);
    this.getLocalStorage('mock_rooms', [
      { id: 1, project_id: 1, name: 'Master Bedroom', length: 15, width: 12, height: 10, notes: 'Bronze accents.' }
    ]);
    this.getLocalStorage('mock_materials', [
      { id: 1, category: 'Tiles', name: 'Statutuario Marble Tile', brand: 'Kajaria', sku: 'KAJ-MAR-01', unit_price: 150, image_url: '', vendor_id: 1, vendor_name: 'Marble Craft Sourcing' },
      { id: 2, category: 'Laminates', name: 'Matte Oak Finish 1.2mm', brand: 'CenturyPly', sku: 'CP-OAK-88', unit_price: 1200, image_url: '', vendor_id: 2, vendor_name: 'Premium Woods Sourcing' }
    ]);
    this.getLocalStorage('mock_vendors', [
      { id: 1, name: 'Marble Craft Sourcing', contact_name: 'Rohan Lal', phone: '9988112233', email: 'rohan@marblecraft.in', category: 'Tiles', address: 'Plot 43, Sector 8, Noida', rating: 4.8 },
      { id: 2, name: 'Premium Woods Sourcing', contact_name: 'Ajay Dev', phone: '8877665544', email: 'ajay@premiumwoods.in', category: 'Laminates', address: 'Ind. Area Phase 2, Delhi', rating: 4.5 }
    ]);
    this.getLocalStorage('mock_selections', [
      { id: 1, project_id: 1, room_id: 1, material_id: 1, vendor_id: 1, quantity: 120, status: 'Selected', notes: 'Initial placement.', updated_at: new Date().toISOString(), material_name: 'Statutuario Marble Tile', brand: 'Kajaria', sku: 'KAJ-MAR-01', unit_price: 150, category: 'Tiles', vendor_name: 'Marble Craft Sourcing' }
    ]);
    this.getLocalStorage('mock_expenses', []);
    this.getLocalStorage('mock_concepts', [
      { id: 1, room_id: 1, title: 'Concept Moodboard A', description: 'Obsidian & Gold themes', image_url: '', status: 'Pending', created_at: new Date().toISOString() }
    ]);
    this.getLocalStorage('mock_site_visits', []);
    this.getLocalStorage('mock_tasks', [
      { id: 1, project_id: 1, title: 'Check marble layout alignment', assigned_to: 'Site Engineer', status: 'To Do', due_date: new Date().toISOString() }
    ]);
    this.getLocalStorage('mock_history', []);
  }

  constructor() {
    this.seedData();
  }

  async getDashboardStats() {
    await this.simulateDelay();
    const projects = this.getLocalStorage<Project[]>('mock_projects', []);
    const selections = this.getLocalStorage<MaterialSelection[]>('mock_selections', []);
    const vendors = this.getLocalStorage<Vendor[]>('mock_vendors', []);
    const expenses = this.getLocalStorage<Expense[]>('mock_expenses', []);

    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const approvedSourced = selections.filter(s => s.status === 'Approved').reduce((sum, s) => sum + (s.quantity * (s.unit_price || 0)), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      total_projects: projects.length,
      active_projects: projects.filter(p => p.status !== 'Completed').length,
      approved_selections: selections.filter(s => s.status === 'Approved').length,
      pending_selections: selections.filter(s => s.status === 'Pending' || s.status === 'Selected').length,
      active_vendors: vendors.length,
      budget_utilization: totalBudget > 0 ? Math.round(((approvedSourced + totalExpenses) / totalBudget) * 100) : 0
    };
  }

  async getProjects(filters = '') {
    await this.simulateDelay();
    const projects = this.getLocalStorage<Project[]>('mock_projects', []);
    // Simple search emulation
    if (filters.includes('search=')) {
      const match = filters.match(/search=([^&]*)/);
      if (match) {
        const query = decodeURIComponent(match[1]).toLowerCase();
        return projects.filter(p => p.name.toLowerCase().includes(query) || (p.client_name || '').toLowerCase().includes(query));
      }
    }
    return projects;
  }

  async getProjectDetails(id: number) {
    await this.simulateDelay();
    const projects = this.getLocalStorage<Project[]>('mock_projects', []);
    const rooms = this.getLocalStorage<Room[]>('mock_rooms', []);
    const selections = this.getLocalStorage<MaterialSelection[]>('mock_selections', []);
    const expenses = this.getLocalStorage<Expense[]>('mock_expenses', []);
    const tasks = this.getLocalStorage<Task[]>('mock_tasks', []);
    const siteVisits = this.getLocalStorage<SiteVisit[]>('mock_site_visits', []);
    const concepts = this.getLocalStorage<DesignConcept[]>('mock_concepts', []);

    const project = projects.find(p => p.id === id);
    if (!project) throw new Error('Project not found');

    const projectRooms = rooms.filter(r => r.project_id === id).map(r => ({
      ...r,
      concepts: concepts.filter(c => c.room_id === r.id)
    }));

    return {
      project,
      rooms: projectRooms,
      selections: selections.filter(s => s.project_id === id),
      expenses: expenses.filter(e => e.project_id === id),
      tasks: tasks.filter(t => t.project_id === id),
      siteVisits: siteVisits.filter(s => s.project_id === id)
    };
  }

  async createProject(projectData: Partial<Project>) {
    await this.simulateDelay();
    const projects = this.getLocalStorage<Project[]>('mock_projects', []);
    const newProject: Project = {
      id: Date.now(),
      client_id: 1,
      name: projectData.name || 'Untitled Project',
      status: projectData.status || 'Enquiry',
      budget: projectData.budget || 0,
      address: projectData.address || '',
      notes: projectData.notes || '',
      created_at: new Date().toISOString(),
      client_name: projectData.client_name || 'Mock Client',
      client_email: projectData.client_email || '',
      client_phone: projectData.client_phone || '',
      client_type: projectData.client_type || 'Residential',
      total_selections: 0,
      approved_selections: 0
    };
    projects.push(newProject);
    this.setLocalStorage('mock_projects', projects);
    return newProject;
  }

  async updateProject(id: number, projectData: Partial<Project>) {
    await this.simulateDelay();
    const projects = this.getLocalStorage<Project[]>('mock_projects', []);
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    projects[idx] = { ...projects[idx], ...projectData };
    this.setLocalStorage('mock_projects', projects);
    return projects[idx];
  }

  async deleteProject(id: number) {
    await this.simulateDelay();
    let projects = this.getLocalStorage<Project[]>('mock_projects', []);
    projects = projects.filter(p => p.id !== id);
    this.setLocalStorage('mock_projects', projects);
  }

  async createRoom(projectId: number, roomData: Partial<Room>) {
    await this.simulateDelay();
    const rooms = this.getLocalStorage<Room[]>('mock_rooms', []);
    const newRoom: Room = {
      id: Date.now(),
      project_id: projectId,
      name: roomData.name || 'New Room Space',
      length: roomData.length || 0,
      width: roomData.width || 0,
      height: roomData.height || 0,
      notes: roomData.notes || ''
    };
    rooms.push(newRoom);
    this.setLocalStorage('mock_rooms', rooms);
    return newRoom;
  }

  async getMaterials() {
    await this.simulateDelay();
    return this.getLocalStorage<Material[]>('mock_materials', []);
  }

  async getVendors() {
    await this.simulateDelay();
    return this.getLocalStorage<Vendor[]>('mock_vendors', []);
  }

  async createSelection(selectionData: Partial<MaterialSelection> & { userName: string }) {
    await this.simulateDelay();
    const selections = this.getLocalStorage<MaterialSelection[]>('mock_selections', []);
    const materials = this.getLocalStorage<Material[]>('mock_materials', []);
    const material = materials.find(m => m.id === selectionData.material_id);

    const newSelection: MaterialSelection = {
      id: Date.now(),
      project_id: selectionData.project_id!,
      room_id: selectionData.room_id!,
      material_id: selectionData.material_id!,
      vendor_id: selectionData.vendor_id,
      quantity: selectionData.quantity || 1,
      status: 'Selected',
      notes: selectionData.notes || '',
      updated_at: new Date().toISOString(),
      material_name: material?.name || 'Selected Item',
      brand: material?.brand || '',
      sku: material?.sku || '',
      unit_price: material?.unit_price || 0,
      category: material?.category || 'Tiles',
      vendor_name: material?.vendor_name || 'Direct'
    };

    selections.push(newSelection);
    this.setLocalStorage('mock_selections', selections);

    // Auto write Selection History Log
    const history = this.getLocalStorage<MaterialHistory[]>('mock_history', []);
    history.push({
      id: Date.now() + 1,
      project_id: newSelection.project_id,
      room_id: newSelection.room_id,
      material_selection_id: newSelection.id,
      user_name: selectionData.userName,
      previous_status: 'None',
      new_status: 'Selected',
      notes: `Mapped to space: ${newSelection.notes}`,
      created_at: new Date().toISOString(),
      material_name: newSelection.material_name
    });
    this.setLocalStorage('mock_history', history);

    return newSelection;
  }

  async updateSelection(id: number, updateData: Partial<MaterialSelection> & { userName: string }) {
    await this.simulateDelay();
    const selections = this.getLocalStorage<MaterialSelection[]>('mock_selections', []);
    const idx = selections.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Selection not found');

    const previousStatus = selections[idx].status;
    selections[idx] = { ...selections[idx], ...updateData, updated_at: new Date().toISOString() };
    this.setLocalStorage('mock_selections', selections);

    if (updateData.status && updateData.status !== previousStatus) {
      const history = this.getLocalStorage<MaterialHistory[]>('mock_history', []);
      history.push({
        id: Date.now(),
        project_id: selections[idx].project_id,
        room_id: selections[idx].room_id,
        material_selection_id: selections[idx].id,
        user_name: updateData.userName || 'System',
        previous_status: previousStatus,
        new_status: updateData.status,
        notes: `Selection updated from ${previousStatus} to ${updateData.status}`,
        created_at: new Date().toISOString(),
        material_name: selections[idx].material_name
      });
      this.setLocalStorage('mock_history', history);
    }

    return selections[idx];
  }

  async deleteSelection(id: number) {
    await this.simulateDelay();
    let selections = this.getLocalStorage<MaterialSelection[]>('mock_selections', []);
    selections = selections.filter(s => s.id !== id);
    this.setLocalStorage('mock_selections', selections);
  }

  async getSelectionHistory(selectionId: number) {
    await this.simulateDelay();
    const history = this.getLocalStorage<MaterialHistory[]>('mock_history', []);
    return history.filter(h => h.material_selection_id === selectionId);
  }

  async createExpense(projectId: number, expenseData: Partial<Expense>) {
    await this.simulateDelay();
    const expenses = this.getLocalStorage<Expense[]>('mock_expenses', []);
    const newExpense: Expense = {
      id: Date.now(),
      project_id: projectId,
      category: expenseData.category || 'Direct Expense',
      amount: expenseData.amount || 0,
      notes: expenseData.notes || '',
      date: new Date().toISOString()
    };
    expenses.push(newExpense);
    this.setLocalStorage('mock_expenses', expenses);
    return newExpense;
  }

  async updateConceptStatus(projectId: number, conceptId: number, status: 'Approved' | 'Revised', userName: string) {
    await this.simulateDelay();
    const concepts = this.getLocalStorage<DesignConcept[]>('mock_concepts', []);
    const idx = concepts.findIndex(c => c.id === conceptId);
    if (idx !== -1) {
      concepts[idx].status = status;
      this.setLocalStorage('mock_concepts', concepts);
    }
    return { success: true };
  }

  async createSiteVisit(projectId: number, visitData: Partial<SiteVisit>) {
    await this.simulateDelay();
    const visits = this.getLocalStorage<SiteVisit[]>('mock_site_visits', []);
    const newVisit: SiteVisit = {
      id: Date.now(),
      project_id: projectId,
      visit_date: visitData.visit_date || new Date().toISOString(),
      visitor_name: visitData.visitor_name || 'Inspector',
      notes: visitData.notes || '',
      photos: visitData.photos || ''
    };
    visits.push(newVisit);
    this.setLocalStorage('mock_site_visits', visits);
    return newVisit;
  }

  async createTask(projectId: number, taskData: Partial<Task>) {
    await this.simulateDelay();
    const tasks = this.getLocalStorage<Task[]>('mock_tasks', []);
    const newTask: Task = {
      id: Date.now(),
      project_id: projectId,
      title: taskData.title || 'Check snag list item',
      assigned_to: taskData.assigned_to || 'Site Engineer',
      status: 'To Do',
      due_date: taskData.due_date || new Date().toISOString()
    };
    tasks.push(newTask);
    this.setLocalStorage('mock_tasks', tasks);
    return newTask;
  }

  async updateTaskStatus(taskId: number, status: 'To Do' | 'In Progress' | 'Completed') {
    await this.simulateDelay();
    const tasks = this.getLocalStorage<Task[]>('mock_tasks', []);
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) throw new Error('Task not found');
    tasks[idx].status = status;
    this.setLocalStorage('mock_tasks', tasks);
    return tasks[idx];
  }

  async deleteTask(taskId: number) {
    await this.simulateDelay();
    let tasks = this.getLocalStorage<Task[]>('mock_tasks', []);
    tasks = tasks.filter(t => t.id !== taskId);
    this.setLocalStorage('mock_tasks', tasks);
  }

  async getMaterialReport(query = '') {
    await this.simulateDelay();
    const selections = this.getLocalStorage<MaterialSelection[]>('mock_selections', []);
    return selections.map(s => ({
      material_name: s.material_name,
      room_name: 'Mock Room Space',
      quantity: s.quantity,
      unit_price: s.unit_price,
      total_cost: s.quantity * (s.unit_price || 0),
      status: s.status,
      vendor_name: s.vendor_name || 'Direct'
    }));
  }

  async getVendorReport() {
    await this.simulateDelay();
    const selections = this.getLocalStorage<MaterialSelection[]>('mock_selections', []);
    const summary: Record<string, any> = {};
    selections.forEach(s => {
      const v = s.vendor_name || 'Direct';
      if (!summary[v]) {
        summary[v] = { vendor_name: v, selection_count: 0, total_spend: 0 };
      }
      summary[v].selection_count += 1;
      summary[v].total_spend += s.quantity * (s.unit_price || 0);
    });
    return Object.values(summary);
  }

  async getBudgetReport() {
    await this.simulateDelay();
    const projects = this.getLocalStorage<Project[]>('mock_projects', []);
    const selections = this.getLocalStorage<MaterialSelection[]>('mock_selections', []);
    const expenses = this.getLocalStorage<Expense[]>('mock_expenses', []);

    return projects.map(p => {
      const pSelections = selections.filter(s => s.project_id === p.id && s.status === 'Approved');
      const pExpenses = expenses.filter(e => e.project_id === p.id);
      const approvedSelectionsCost = pSelections.reduce((sum, s) => sum + (s.quantity * (s.unit_price || 0)), 0);
      const expensesCost = pExpenses.reduce((sum, e) => sum + e.amount, 0);
      const spent = approvedSelectionsCost + expensesCost;

      return {
        project_name: p.name,
        total_budget: p.budget,
        selections_cost: approvedSelectionsCost,
        direct_expenses: expensesCost,
        total_spent: spent,
        remaining_balance: p.budget - spent,
        utilization_pct: p.budget > 0 ? Math.round((spent / p.budget) * 100) : 0
      };
    });
  }
}

// ----------------------------------------------------
// 3. SupabaseDatabaseService (Supabase API Blueprint Integration Draft)
// ----------------------------------------------------
/**
 * EXAMPLE DRAFT: Un-comment and configure when ready to map to a live Supabase project.
 * 
 * import { createClient } from '@supabase/supabase-js';
 * const supabase = createClient('SUPABASE_URL', 'SUPABASE_ANON_KEY');
 */
export class SupabaseDatabaseService implements IDatabaseService {
  async getDashboardStats(): Promise<any> {
    throw new Error('SupabaseDatabaseService not fully initialized.');
  }

  async getProjects(filters = ''): Promise<Project[]> {
    throw new Error('Supabase integration draft only.');
  }

  async getProjectDetails(id: number): Promise<any> {
    throw new Error('Supabase integration draft only.');
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    throw new Error('Supabase integration draft only.');
  }

  async updateProject(id: number, projectData: Partial<Project>): Promise<Project> {
    throw new Error('Supabase integration draft only.');
  }

  async deleteProject(id: number): Promise<void> {
    throw new Error('Supabase integration draft only.');
  }

  async createRoom(projectId: number, roomData: Partial<Room>): Promise<Room> {
    throw new Error('Supabase integration draft only.');
  }

  async getMaterials(): Promise<Material[]> {
    throw new Error('Supabase integration draft only.');
  }

  async getVendors(): Promise<Vendor[]> {
    throw new Error('Supabase integration draft only.');
  }

  async createSelection(selectionData: Partial<MaterialSelection> & { userName: string }): Promise<MaterialSelection> {
    throw new Error('Supabase integration draft only.');
  }

  async updateSelection(id: number, updateData: Partial<MaterialSelection> & { userName: string }): Promise<MaterialSelection> {
    throw new Error('Supabase integration draft only.');
  }

  async deleteSelection(id: number): Promise<void> {
    throw new Error('Supabase integration draft only.');
  }

  async getSelectionHistory(selectionId: number): Promise<MaterialHistory[]> {
    throw new Error('Supabase integration draft only.');
  }

  async createExpense(projectId: number, expenseData: Partial<Expense>): Promise<Expense> {
    throw new Error('Supabase integration draft only.');
  }

  async updateConceptStatus(projectId: number, conceptId: number, status: 'Approved' | 'Revised', userName: string): Promise<any> {
    throw new Error('Supabase integration draft only.');
  }

  async createSiteVisit(projectId: number, visitData: Partial<SiteVisit>): Promise<SiteVisit> {
    throw new Error('Supabase integration draft only.');
  }

  async createTask(projectId: number, taskData: Partial<Task>): Promise<Task> {
    throw new Error('Supabase integration draft only.');
  }

  async updateTaskStatus(taskId: number, status: 'To Do' | 'In Progress' | 'Completed'): Promise<Task> {
    throw new Error('Supabase integration draft only.');
  }

  async deleteTask(taskId: number): Promise<void> {
    throw new Error('Supabase integration draft only.');
  }

  async getMaterialReport(query = ''): Promise<any[]> {
    throw new Error('Supabase integration draft only.');
  }

  async getVendorReport(): Promise<any[]> {
    throw new Error('Supabase integration draft only.');
  }

  async getBudgetReport(): Promise<any[]> {
    throw new Error('Supabase integration draft only.');
  }
}

// ----------------------------------------------------
// DEFAULT CLIENT INSTANCE DISPATCHER
// ----------------------------------------------------
// Simply swap this instance switcher target to toggle between SupabaseDatabaseService / MockDatabaseService
export const db: IDatabaseService = new APIDatabaseService();
