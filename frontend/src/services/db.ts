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
  createVendor(vendorData: Partial<Vendor>): Promise<Vendor>;
  updateVendor(id: number, vendorData: Partial<Vendor>): Promise<Vendor>;
  deleteVendor(id: number): Promise<void>;

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

  // Clients
  getClients(): Promise<Client[]>;
  createClient(clientData: Partial<Client>): Promise<Client>;
  updateClient(id: number, clientData: Partial<Client>): Promise<Client>;
  deleteClient(id: number): Promise<void>;

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

  async createVendor(vendorData: Partial<Vendor>) {
    const res = await fetch(`${API_BASE}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendorData)
    });
    if (!res.ok) throw new Error('Failed to create vendor');
    return res.json();
  }

  async updateVendor(id: number, vendorData: Partial<Vendor>) {
    const res = await fetch(`${API_BASE}/vendors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendorData)
    });
    if (!res.ok) throw new Error('Failed to update vendor');
    return res.json();
  }

  async deleteVendor(id: number) {
    const res = await fetch(`${API_BASE}/vendors/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete vendor');
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

  async getClients() {
    const res = await fetch(`${API_BASE}/clients`);
    if (!res.ok) throw new Error('Failed to fetch clients');
    return res.json();
  }

  async createClient(clientData: Partial<Client>) {
    const res = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData)
    });
    if (!res.ok) throw new Error('Failed to create client');
    return res.json();
  }

  async updateClient(id: number, clientData: Partial<Client>) {
    const res = await fetch(`${API_BASE}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData)
    });
    if (!res.ok) throw new Error('Failed to update client');
    return res.json();
  }

  async deleteClient(id: number) {
    const res = await fetch(`${API_BASE}/clients/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete client');
  }
}

// ----------------------------------------------------
// 2. MockDatabaseService (Client-Side LocalStorage Mock)
// ----------------------------------------------------
export class MockDatabaseService implements IDatabaseService {
  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 200));
  }

  private memoryCache: Record<string, string> = {};

  private getLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return JSON.parse(stored);
    } catch (e) {
      if (!this.memoryCache[key]) {
        this.memoryCache[key] = JSON.stringify(defaultValue);
      }
      return JSON.parse(this.memoryCache[key]);
    }
  }

  private setLocalStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      this.memoryCache[key] = JSON.stringify(value);
    }
  }

  private seedData() {
    // Check if localStorage has old minimal mock data or old project names and reset to full seeds if so
    try {
      const stored = localStorage.getItem('mock_projects');
      if (stored) {
        const parsed = JSON.parse(stored);
        const containsOldName = Array.isArray(parsed) && parsed.some((p: any) => p.name === 'Rathod Penthouse Villa' || !p.image_url);
        if (containsOldName || (Array.isArray(parsed) && parsed.length <= 4)) {
          localStorage.removeItem('mock_projects');
          localStorage.removeItem('mock_rooms');
          localStorage.removeItem('mock_materials');
          localStorage.removeItem('mock_vendors');
          localStorage.removeItem('mock_selections');
          localStorage.removeItem('mock_expenses');
          localStorage.removeItem('mock_concepts');
          localStorage.removeItem('mock_site_visits');
          localStorage.removeItem('mock_tasks');
          localStorage.removeItem('mock_history');
        }
      }
    } catch (e) {
      // Ignore storage exception
    }

    // Clients seed matching the backend database
    this.getLocalStorage('mock_clients', [
      { id: 1, name: 'Sidharth Rathod', email: 'sidharth@example.com', phone: '+91 99999 88888', company: 'Self-Employed', type: 'Residential', status: 'Active', created_at: new Date().toISOString() },
      { id: 2, name: 'Suman Sharma', email: 'suman@nexustech.com', phone: '+91 88888 77777', company: 'Nexus Tech Solutions', type: 'Commercial', status: 'Active', created_at: new Date().toISOString() },
      { id: 3, name: 'Priya Patel', email: 'priya@example.com', phone: '+91 77777 66666', company: 'N/A', type: 'Residential', status: 'Active', created_at: new Date().toISOString() },
      { id: 4, name: 'Zotha', email: 'zotha@glorysimon.com', phone: '+91 11111 22222', company: 'Glory Simon Interiors', type: 'Commercial', status: 'Active', created_at: new Date().toISOString() }
    ]);

    // Projects seed matching the backend database
    this.getLocalStorage('mock_projects', [
      { id: 1, name: "Rathod's Villa", client_name: 'Sidharth Rathod', client_email: 'sidharth@example.com', client_phone: '+91 99999 88888', client_type: 'Residential', status: 'Material Selection', budget: 45000, address: 'Flat 1402, Highrise Heights, Bandra West, Mumbai', notes: 'Luxury residential design with high-end fixtures.', start_date: '2026-06-01', assigned_designer: 'Nisha Sen', created_at: new Date().toISOString(), image_url: '/assets/projects/rathods_villa.png' },
      { id: 2, name: 'Nexus Tech Corporate HQ', client_name: 'Suman Sharma', client_email: 'suman@nexustech.com', client_phone: '+91 88888 77777', client_type: 'Commercial', status: 'Design Approval', budget: 85000, address: 'Block B, Tech Park, Outer Ring Road, Mumbai', notes: 'Commercial executive space with acoustic configurations.', start_date: '2026-06-05', assigned_designer: 'Rahul Dev', created_at: new Date().toISOString(), image_url: '/assets/projects/nexus_hq.png' },
      { id: 3, name: 'Priya Cozy 2BHK Apartment', client_name: 'Priya Patel', client_email: 'priya@example.com', client_phone: '+91 77777 66666', client_type: 'Residential', status: 'Site Visit', budget: 18000, address: 'C-302, Green Avenue, Thane, Mumbai', notes: 'Budget-friendly space improvements.', start_date: '2026-06-10', assigned_designer: 'Nisha Sen', created_at: new Date().toISOString(), image_url: '/assets/projects/priya_apartment.png' },
      { id: 4, name: 'Glory Simon Experience Studio', client_name: 'Zotha', client_email: 'zotha@glorysimon.com', client_phone: '+91 11111 22222', client_type: 'Commercial', status: 'Execution', budget: 35000, address: 'Showroom 3, Galleria Mall, Lower Parel, Mumbai', notes: 'Brand concept showcase development.', start_date: '2026-06-12', assigned_designer: 'Rahul Dev', created_at: new Date().toISOString(), image_url: '/assets/projects/experience_studio.png' },
      { id: 5, name: 'Golden Crest Mansion', client_name: 'Amit Sharma', client_email: 'amit@gmail.com', client_phone: '+91 99881 12233', client_type: 'Residential', status: 'Material Selection', budget: 120000, address: 'Plot 43, Sector 8, Noida', notes: 'Premium residency development.', start_date: '2026-06-14', assigned_designer: 'Nisha Sen', created_at: new Date().toISOString(), image_url: '/assets/projects/golden_crest.png' },
      { id: 6, name: 'Azure Bay Villa', client_name: 'Priya Patel', client_email: 'priya@example.com', client_phone: '+91 77777 66666', client_type: 'Residential', status: 'Space Planning', budget: 75000, address: 'Coastal Road, Alibaug, Maharashtra', notes: 'Beachfront luxury villa design with modern minimalist style.', start_date: '2026-06-15', assigned_designer: 'Nisha Sen', created_at: new Date().toISOString(), image_url: '/assets/projects/azure_bay.png' }
    ]);

    // Rooms seed matching the backend database
    this.getLocalStorage('mock_rooms', [
      { id: 1, project_id: 1, name: 'Grand Living Room', length: 24, width: 18, height: 10.5, notes: 'Needs marble flooring, glass panel walls, and warm lighting' },
      { id: 2, project_id: 1, name: 'Master Suite', length: 18, width: 14, height: 10, notes: 'Needs dark wooden flooring and custom paneling' },
      { id: 3, project_id: 1, name: 'Modular Kitchen', length: 14, width: 10, height: 10, notes: 'Requires scratch-resistant acrylic laminates and gold hardware' },
      { id: 4, project_id: 2, name: 'Executive Boardroom', length: 30, width: 20, height: 11, notes: 'Needs soundproofing, massive boardroom table and track lighting' },
      { id: 5, project_id: 2, name: 'Reception Area', length: 20, width: 15, height: 11, notes: 'Double height ceiling, feature wall with green accent' },
      { id: 6, project_id: 3, name: 'Master Bedroom', length: 12, width: 11, height: 9.5, notes: 'Compact storage solutions required' },
      { id: 7, project_id: 4, name: 'Main Display Floor', length: 40, width: 25, height: 12, notes: 'Multi-material displays for laminates, tiles, and fittings' },
      { id: 8, project_id: 5, name: 'Master Suite Bedroom', length: 15, width: 12, height: 10, notes: 'Bronze accents.' },
      { id: 9, project_id: 5, name: 'Grand Lobby Entrance', length: 20, width: 16, height: 12, notes: 'Classic luxury entrance.' },
      { id: 10, project_id: 6, name: 'Beachfront Deck', length: 25, width: 20, height: 10, notes: 'Infinity pool adjacency.' },
      { id: 11, project_id: 6, name: 'Main Lounge Area', length: 22, width: 18, height: 11, notes: 'Minimalist wood paneling.' }
    ]);

    // Materials seed matching the backend database
    this.getLocalStorage('mock_materials', [
      { id: 1, category: 'Tiles', name: 'Italian Carrara Vitrified Tile', brand: 'Kajaria', sku: 'KAJ-CAR-01', unit_price: 120, image_url: '/assets/materials/carrara_tile.png', vendor_id: 1, vendor_name: 'Apex Marble & Tiles' },
      { id: 2, category: 'Tiles', name: 'Chevron Dark Slate Tile', brand: 'Somany', sku: 'SOM-CHV-02', unit_price: 95, image_url: '/assets/materials/chevron_tile.png', vendor_id: 1, vendor_name: 'Apex Marble & Tiles' },
      { id: 3, category: 'Laminates', name: 'Teak Wood Matte Laminate', brand: 'Greenlam', sku: 'GRN-TEAK-05', unit_price: 45, image_url: '/assets/materials/teak_laminate.png', vendor_id: 2, vendor_name: 'DecoWood Laminates' },
      { id: 4, category: 'Laminates', name: 'Glossy Charcoal Laminate', brand: 'CenturyPly', sku: 'CEN-CHAR-12', unit_price: 55, image_url: '/assets/materials/charcoal_laminate.png', vendor_id: 2, vendor_name: 'DecoWood Laminates' },
      { id: 5, category: 'Paints', name: 'Royale Silk Warm Alabaster', brand: 'Asian Paints', sku: 'AP-ROY-ALB', unit_price: 15, image_url: '/assets/materials/warm_alabaster.png', vendor_id: 3, vendor_name: 'Asian Paints Exclusive' },
      { id: 6, category: 'Paints', name: 'Deep Teal Matte Accent', brand: 'Asian Paints', sku: 'AP-ROY-TEA', unit_price: 18, image_url: '/assets/materials/deep_teal.png', vendor_id: 3, vendor_name: 'Asian Paints Exclusive' },
      { id: 7, category: 'Lighting', name: 'Magnetic Track Profile Light', brand: 'Philips', sku: 'PH-MAG-TRK', unit_price: 250, image_url: '/assets/materials/track_light.png', vendor_id: 4, vendor_name: 'Lumina Lighting Solutions' },
      { id: 8, category: 'Lighting', name: 'Warm Recessed COB Light 6W', brand: 'Havells', sku: 'HV-COB-06', unit_price: 15, image_url: '/assets/materials/cob_light.png', vendor_id: 4, vendor_name: 'Lumina Lighting Solutions' },
      { id: 9, category: 'Furniture', name: 'Chesterfield Emerald Velvet Sofa', brand: 'Royal Oak', sku: 'RO-CHS-VEL', unit_price: 1200, image_url: '/assets/materials/velvet_sofa.png', vendor_id: 5, vendor_name: 'Royal Oak Furniture' },
      { id: 10, category: 'Furniture', name: 'Ergonomic Mesh Task Chair', brand: 'Featherlite', sku: 'FL-ERG-MSH', unit_price: 180, image_url: '/assets/materials/office_chair.png', vendor_id: 5, vendor_name: 'Royal Oak Furniture' },
      { id: 11, category: 'Hardware', name: 'Brushed Brass Knurled Handles', brand: 'Hettich', sku: 'HET-BB-KN', unit_price: 12, image_url: '/assets/materials/brass_handle.png', vendor_id: 6, vendor_name: 'Hettich Hardware' },
      { id: 12, category: 'Hardware', name: 'Soft-Close Drawer Runners', brand: 'Ebco', sku: 'EB-SCDR-45', unit_price: 25, image_url: '/assets/materials/drawer_slides.png', vendor_id: 6, vendor_name: 'Hettich Hardware' },
      { id: 13, category: 'Fabric', name: 'Linen Beige Blackout Curtain', brand: 'Ddecor', sku: 'DD-LIN-BGE', unit_price: 35, image_url: '/assets/materials/beige_curtain.png', vendor_id: 7, vendor_name: 'Ddecor Fabrics' },
      { id: 14, category: 'Fabric', name: 'Textured Rust Boucle Cushion', brand: 'Ddecor', sku: 'DD-TEX-RST', unit_price: 15, image_url: '/assets/materials/rust_boucle.png', vendor_id: 7, vendor_name: 'Ddecor Fabrics' }
    ]);

    // Vendors seed matching the backend database
    this.getLocalStorage('mock_vendors', [
      { id: 1, name: 'Apex Marble & Tiles', contact_name: 'Ramesh Kumar', phone: '+91 98765 43210', email: 'info@apexmarble.com', category: 'Tiles', address: 'Sector 15, Industrial Area, Mumbai', rating: 4.8 },
      { id: 2, name: 'DecoWood Laminates', contact_name: 'Sarah Dsouza', phone: '+91 87654 32109', email: 'sales@decowood.com', category: 'Laminates', address: 'Ghatkopar West, Mumbai', rating: 4.5 },
      { id: 3, name: 'Asian Paints Exclusive', contact_name: 'Amit Patel', phone: '+91 76543 21098', email: 'dealer@asianpaints.com', category: 'Paints', address: 'Andheri East, Mumbai', rating: 4.7 },
      { id: 4, name: 'Lumina Lighting Solutions', contact_name: 'Vikram Singh', phone: '+91 65432 10987', email: 'contact@luminalights.com', category: 'Lighting', address: 'Lower Parel, Mumbai', rating: 4.2 },
      { id: 5, name: 'Royal Oak Furniture', contact_name: 'Neha Sharma', phone: '+91 54321 09876', email: 'b2b@royaloak.com', category: 'Furniture', address: 'Thane West, Mumbai', rating: 4.6 },
      { id: 6, name: 'Hettich Hardware', contact_name: 'Rajesh Mehta', phone: '+91 43210 98765', email: 'support@hettich.in', category: 'Hardware', address: 'Kalyan, Mumbai', rating: 4.9 },
      { id: 7, name: 'Ddecor Fabrics', contact_name: 'Simran Kaur', phone: '+91 32109 87654', email: 'orders@ddecor.com', category: 'Fabric', address: 'Bandra West, Mumbai', rating: 4.4 }
    ]);

    // Selections seed matching the backend database
    this.getLocalStorage('mock_selections', [
      { id: 1, project_id: 1, room_id: 1, material_id: 1, vendor_id: 1, quantity: 432, status: 'Approved', notes: 'Selected Kajaria Carrara tiles for the full living room floor area', updated_at: new Date().toISOString(), material_name: 'Italian Carrara Vitrified Tile', brand: 'Kajaria', sku: 'KAJ-CAR-01', unit_price: 120.00, category: 'Tiles', vendor_name: 'Apex Marble & Tiles', image_url: '/assets/materials/carrara_tile.png' },
      { id: 2, project_id: 1, room_id: 1, material_id: 9, vendor_id: 5, quantity: 1, status: 'Approved', notes: 'Royal Oak Chesterfield Emerald Sofa as the centerpiece', updated_at: new Date().toISOString(), material_name: 'Chesterfield Emerald Velvet Sofa', brand: 'Royal Oak', sku: 'RO-CHS-VEL', unit_price: 1200.00, category: 'Furniture', vendor_name: 'Royal Oak Furniture', image_url: '/assets/materials/velvet_sofa.png' },
      { id: 3, project_id: 1, room_id: 1, material_id: 5, vendor_id: 3, quantity: 4, status: 'Approved', notes: 'Warm Alabaster walls paint (4 tins)', updated_at: new Date().toISOString(), material_name: 'Royale Silk Warm Alabaster', brand: 'Asian Paints', sku: 'AP-ROY-ALB', unit_price: 15.00, category: 'Paints', vendor_name: 'Asian Paints Exclusive', image_url: '/assets/materials/warm_alabaster.png' },
      { id: 4, project_id: 1, room_id: 1, material_id: 6, vendor_id: 3, quantity: 1, status: 'Pending', notes: 'Deep Teal Accent on the TV backdrop wall (1 tin)', updated_at: new Date().toISOString(), material_name: 'Deep Teal Matte Accent', brand: 'Asian Paints', sku: 'AP-ROY-TEA', unit_price: 18.00, category: 'Paints', vendor_name: 'Asian Paints Exclusive', image_url: '/assets/materials/deep_teal.png' },
      { id: 5, project_id: 1, room_id: 1, material_id: 7, vendor_id: 4, quantity: 6, status: 'Selected', notes: 'Magnetic track profile lights around the false ceiling border', updated_at: new Date().toISOString(), material_name: 'Magnetic Track Profile Light', brand: 'Philips', sku: 'PH-MAG-TRK', unit_price: 250.00, category: 'Lighting', vendor_name: 'Lumina Lighting Solutions', image_url: '/assets/materials/track_light.png' },
      { id: 6, project_id: 1, room_id: 2, material_id: 3, vendor_id: 2, quantity: 252, status: 'Approved', notes: 'Greenlam Teak laminate for the wall headboard paneling', updated_at: new Date().toISOString(), material_name: 'Teak Wood Matte Laminate', brand: 'Greenlam', sku: 'GRN-TEAK-05', unit_price: 45.00, category: 'Laminates', vendor_name: 'DecoWood Laminates', image_url: '/assets/materials/teak_laminate.png' },
      { id: 7, project_id: 1, room_id: 2, material_id: 13, vendor_id: 7, quantity: 6, status: 'Replaced', notes: 'Replaced with neutral grey fabric later due to light reflections', updated_at: new Date().toISOString(), material_name: 'Linen Beige Blackout Curtain', brand: 'Ddecor', sku: 'DD-LIN-BGE', unit_price: 35.00, category: 'Fabric', vendor_name: 'Ddecor Fabrics', image_url: '/assets/materials/beige_curtain.png' },
      { id: 8, project_id: 1, room_id: 3, material_id: 4, vendor_id: 2, quantity: 120, status: 'Selected', notes: 'CenturyPly Glossy Charcoal for base cabinets', updated_at: new Date().toISOString(), material_name: 'Glossy Charcoal Laminate', brand: 'CenturyPly', sku: 'CEN-CHAR-12', unit_price: 55.00, category: 'Laminates', vendor_name: 'DecoWood Laminates', image_url: '/assets/materials/charcoal_laminate.png' },
      { id: 9, project_id: 1, room_id: 3, material_id: 11, vendor_id: 6, quantity: 18, status: 'Approved', notes: 'Hettich Knurled handles for all cupboards', updated_at: new Date().toISOString(), material_name: 'Brushed Brass Knurled Handles', brand: 'Hettich', sku: 'HET-BB-KN', unit_price: 12.00, category: 'Hardware', vendor_name: 'Hettich Hardware', image_url: '/assets/materials/brass_handle.png' },
      { id: 10, project_id: 2, room_id: 4, material_id: 2, vendor_id: 1, quantity: 600, status: 'Approved', notes: 'Chevron Dark Slate Tile for the high traffic boardroom floor', updated_at: new Date().toISOString(), material_name: 'Chevron Dark Slate Tile', brand: 'Somany', sku: 'SOM-CHV-02', unit_price: 95.00, category: 'Tiles', vendor_name: 'Apex Marble & Tiles', image_url: '/assets/materials/chevron_tile.png' },
      { id: 11, project_id: 2, room_id: 4, material_id: 10, vendor_id: 5, quantity: 12, status: 'Approved', notes: 'Featherlite Ergonomic mesh chairs for board members', updated_at: new Date().toISOString(), material_name: 'Ergonomic Mesh Task Chair', brand: 'Featherlite', sku: 'FL-ERG-MSH', unit_price: 180.00, category: 'Furniture', vendor_name: 'Royal Oak Furniture', image_url: '/assets/materials/office_chair.png' },
      { id: 12, project_id: 2, room_id: 4, material_id: 7, vendor_id: 4, quantity: 12, status: 'Approved', notes: 'Philips Track Lights for presentation boards', updated_at: new Date().toISOString(), material_name: 'Magnetic Track Profile Light', brand: 'Philips', sku: 'PH-MAG-TRK', unit_price: 250.00, category: 'Lighting', vendor_name: 'Lumina Lighting Solutions', image_url: '/assets/materials/track_light.png' },
      { id: 13, project_id: 3, room_id: 6, material_id: 3, vendor_id: 2, quantity: 132, status: 'Selected', notes: 'Greenlam Teak laminate for wardrobe shutters', updated_at: new Date().toISOString(), material_name: 'Teak Wood Matte Laminate', brand: 'Greenlam', sku: 'GRN-TEAK-05', unit_price: 45.00, category: 'Laminates', vendor_name: 'DecoWood Laminates', image_url: '/assets/materials/teak_laminate.png' },
      { id: 14, project_id: 4, room_id: 7, material_id: 1, vendor_id: 1, quantity: 1000, status: 'Approved', notes: 'Showroom flooring samples setup', updated_at: new Date().toISOString(), material_name: 'Italian Carrara Vitrified Tile', brand: 'Kajaria', sku: 'KAJ-CAR-01', unit_price: 120.00, category: 'Tiles', vendor_name: 'Apex Marble & Tiles', image_url: '/assets/materials/carrara_tile.png' }
    ]);

    // Expenses seed matching the backend database
    this.getLocalStorage('mock_expenses', [
      { id: 1, project_id: 1, category: 'Site Civil Masonry Labour', amount: 1200.00, notes: 'Plaster leveling for living room wall', date: '2026-06-12' },
      { id: 2, project_id: 1, category: 'Local Transport of samples', amount: 80.00, notes: 'Carried wood and slate samples to client penthouse', date: '2026-06-14' },
      { id: 3, project_id: 2, category: 'CAD Drafting Freelancer fee', amount: 500.00, notes: 'Paid for detailed acoustic grid detailing', date: '2026-06-13' }
    ]);

    // Design concepts seed matching the backend database
    this.getLocalStorage('mock_concepts', [
      { id: 1, room_id: 1, title: 'Classic Luxury Concept', description: 'High-gloss Carrara floors, emerald green velvet accents, and brushed brass details.', image_url: '/assets/concepts/luxury_living.svg', status: 'Approved' },
      { id: 2, room_id: 1, title: 'Warm Modernist Concept', description: 'Matte slate tiles, warm teak laminate wall claddings, and indirect linear lighting.', image_url: '/assets/concepts/modern_living.svg', status: 'Pending' },
      { id: 3, room_id: 3, title: 'Minimalist Culinary Space', description: 'White glossy panels, integrated appliances, and clean seamless handles.', image_url: '/assets/concepts/kitchen_minimalist.svg', status: 'Approved' },
      { id: 4, room_id: 4, title: 'Boardroom Executive Style', description: 'Acoustic oak felt panels, dark grey carpeting, and black metal profile lights.', image_url: '/assets/concepts/boardroom.svg', status: 'Approved' }
    ]);

    // Site visits seed matching the backend database
    this.getLocalStorage('mock_site_visits', [
      { id: 1, project_id: 1, visit_date: '2026-06-10T11:00:00', visitor_name: 'Rahul Dev (Site Engineer)', notes: 'Verified core dimensions. Ceiling slab heights are exactly 10.5 ft. Dampness checked, walls are dry.', photos: '/assets/photos/visit_rathod_1.svg' },
      { id: 2, project_id: 2, visit_date: '2026-06-11T10:00:00', visitor_name: 'Rahul Dev (Site Engineer)', notes: 'Acoustic insulation properties in Boardroom checked. Floor leveling required before tiling.', photos: '/assets/photos/visit_nexus_1.svg' },
      { id: 3, project_id: 3, visit_date: '2026-06-14T15:30:00', visitor_name: 'Nisha Sen (Designer)', notes: 'Took space snapshots for aesthetic concept discussions with Priya. Client prefers beige-brown warmth.', photos: '/assets/photos/visit_priya_1.svg' },
      { id: 4, project_id: 1, visit_date: '2026-06-02T10:00:00', visitor_name: 'Nisha Sen (Designer)', notes: 'Initial site measurements, space blueprint analysis, window dimension check.', photos: '/assets/photos/visit_rathod_1.svg' },
      { id: 5, project_id: 1, visit_date: '2026-06-05T14:30:00', visitor_name: 'Rahul Dev (Project Manager)', notes: 'Structural load walkthrough, electrical layout validation.', photos: '/assets/photos/visit_rathod_1.svg' },
      { id: 6, project_id: 1, visit_date: '2026-06-15T15:00:00', visitor_name: 'Nisha Sen (Designer)', notes: 'Sourced material finish matching on-site under direct sunlight.', photos: '/assets/photos/visit_rathod_1.svg' },
      { id: 7, project_id: 1, visit_date: '2026-06-18T10:30:00', visitor_name: 'Sidharth Rathod (Client)', notes: 'Walkthrough of false ceiling framework, walkthrough preview checkpoints and design signature.', photos: '/assets/photos/visit_rathod_1.svg' }
    ]);

    // Tasks seed matching the backend database
    this.getLocalStorage('mock_tasks', [
      { id: 1, project_id: 1, title: 'Confirm tile delivery date with Apex Marble', assigned_to: 'Vendor Coordinator', status: 'In Progress', due_date: '2026-06-20' },
      { id: 2, project_id: 1, title: 'Get final signature on TV wall accent paint approval', assigned_to: 'Designer', status: 'To Do', due_date: '2026-06-19' },
      { id: 3, project_id: 1, title: 'Create space layouts for electrical points', assigned_to: 'Designer', status: 'Completed', due_date: '2026-06-15' },
      { id: 4, project_id: 2, title: 'Submit board table quotation adjustments', assigned_to: 'Project Manager', status: 'In Progress', due_date: '2026-06-22' },
      { id: 5, project_id: 2, title: 'Book site engineer layout validation visit', assigned_to: 'Project Manager', status: 'Completed', due_date: '2026-06-12' },
      { id: 6, project_id: 3, title: 'First measurements validation visit', assigned_to: 'Site Engineer', status: 'To Do', due_date: '2026-06-24' },
      { id: 7, project_id: 4, title: 'Supervise drywall installation for display panels', assigned_to: 'Site Engineer', status: 'In Progress', due_date: '2026-06-21' },
      { id: 8, project_id: 4, title: 'Process advance billing for vendor contract', assigned_to: 'Admin', status: 'To Do', due_date: '2026-06-25' }
    ]);

    // History logs seed matching the backend database
    this.getLocalStorage('mock_history', [
      { id: 1, project_id: 1, room_id: 1, material_selection_id: 1, user_name: 'Nisha Sen (Designer)', previous_status: 'Pending', new_status: 'Selected', notes: 'Assigned initial Kajaria vitrified Carrara tile layout', created_at: new Date().toISOString(), material_name: 'Italian Carrara Vitrified Tile' },
      { id: 2, project_id: 1, room_id: 1, material_selection_id: 1, user_name: 'Sidharth Rathod (Client)', previous_status: 'Selected', new_status: 'Approved', notes: 'Customer approved Carrara tile pattern during layout design review', created_at: new Date().toISOString(), material_name: 'Italian Carrara Vitrified Tile' },
      { id: 3, project_id: 1, room_id: 1, material_selection_id: 2, user_name: 'Nisha Sen (Designer)', previous_status: 'Pending', new_status: 'Selected', notes: 'Sourced Royal Oak Sofa option', created_at: new Date().toISOString(), material_name: 'Chesterfield Emerald Velvet Sofa' },
      { id: 4, project_id: 1, room_id: 1, material_selection_id: 2, user_name: 'Sidharth Rathod (Client)', previous_status: 'Selected', new_status: 'Approved', notes: 'Approved accent seating selection', created_at: new Date().toISOString(), material_name: 'Chesterfield Emerald Velvet Sofa' }
    ]);
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
    const history = this.getLocalStorage<MaterialHistory[]>('mock_history', []);
    const visits = this.getLocalStorage<SiteVisit[]>('mock_site_visits', []);

    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const approvedSourced = selections.filter(s => s.status === 'Approved').reduce((sum, s) => sum + (s.quantity * (s.unit_price || 0)), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSpent = approvedSourced + totalExpenses;

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status !== 'Completed').length,
      approvedMaterials: selections.filter(s => s.status === 'Approved').length,
      pendingMaterials: selections.filter(s => s.status === 'Pending' || s.status === 'Selected').length,
      activeVendors: vendors.length,
      siteVisitsScheduled: visits.length,
      budgetUsage: {
        totalBudget: totalBudget,
        totalSpent: totalSpent,
        utilizationPct: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0
      },
      recentActivity: history.slice(0, 8)
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
      start_date: projectData.start_date || new Date().toISOString().split('T')[0],
      assigned_designer: projectData.assigned_designer || 'Nisha Sen',
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

  async createVendor(vendorData: Partial<Vendor>) {
    await this.simulateDelay();
    const vendors = this.getLocalStorage<Vendor[]>('mock_vendors', []);
    const newVendor: Vendor = {
      id: Date.now(),
      name: vendorData.name || 'New Sourced Supplier',
      contact_name: vendorData.contact_name || '',
      phone: vendorData.phone || '',
      email: vendorData.email || '',
      category: vendorData.category || 'Tiles',
      address: vendorData.address || '',
      rating: vendorData.rating || 5.0
    };
    vendors.push(newVendor);
    this.setLocalStorage('mock_vendors', vendors);
    return newVendor;
  }

  async updateVendor(id: number, vendorData: Partial<Vendor>) {
    await this.simulateDelay();
    const vendors = this.getLocalStorage<Vendor[]>('mock_vendors', []);
    const idx = vendors.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Vendor not found');
    vendors[idx] = { ...vendors[idx], ...vendorData };
    this.setLocalStorage('mock_vendors', vendors);
    return vendors[idx];
  }

  async deleteVendor(id: number) {
    await this.simulateDelay();
    let vendors = this.getLocalStorage<Vendor[]>('mock_vendors', []);
    vendors = vendors.filter(v => v.id !== id);
    this.setLocalStorage('mock_vendors', vendors);
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

  async getClients() {
    await this.simulateDelay();
    return this.getLocalStorage<Client[]>('mock_clients', []);
  }

  async createClient(clientData: Partial<Client>) {
    await this.simulateDelay();
    const clients = this.getLocalStorage<Client[]>('mock_clients', []);
    const newClient: Client = {
      id: Date.now(),
      name: clientData.name || 'New Client',
      email: clientData.email || '',
      phone: clientData.phone || '',
      company: clientData.company || '',
      type: clientData.type || 'Residential',
      status: clientData.status || 'Active',
      created_at: new Date().toISOString()
    };
    clients.push(newClient);
    this.setLocalStorage('mock_clients', clients);
    return newClient;
  }

  async updateClient(id: number, clientData: Partial<Client>) {
    await this.simulateDelay();
    const clients = this.getLocalStorage<Client[]>('mock_clients', []);
    const idx = clients.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Client not found');
    clients[idx] = { ...clients[idx], ...clientData };
    this.setLocalStorage('mock_clients', clients);
    return clients[idx];
  }

  async deleteClient(id: number) {
    await this.simulateDelay();
    let clients = this.getLocalStorage<Client[]>('mock_clients', []);
    clients = clients.filter(c => c.id !== id);
    this.setLocalStorage('mock_clients', clients);
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

  async getClients(): Promise<Client[]> {
    throw new Error('Supabase integration draft only.');
  }

  async createClient(clientData: Partial<Client>): Promise<Client> {
    throw new Error('Supabase integration draft only.');
  }

  async updateClient(id: number, clientData: Partial<Client>): Promise<Client> {
    throw new Error('Supabase integration draft only.');
  }

  async deleteClient(id: number): Promise<void> {
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
// Auto-detect environment: if running on local dev server, connect to Express + SQLite backend.
// Otherwise, fall back to the offline MockDatabaseService for seamless cloud hosting (Vercel).
export const db: IDatabaseService =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? new APIDatabaseService()
    : new MockDatabaseService();
