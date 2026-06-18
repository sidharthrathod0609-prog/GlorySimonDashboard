export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: 'Residential' | 'Commercial';
  status: string;
  created_at: string;
}

export interface Project {
  id: number;
  client_id: number;
  name: string;
  status: 'Enquiry' | 'Site Visit' | 'Space Planning' | 'Quotation' | 'Design Approval' | 'Material Selection' | 'Execution' | 'Quality Inspection' | 'Completed';
  budget: number;
  address: string;
  notes: string;
  created_at: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  client_type?: 'Residential' | 'Commercial';
  total_selections?: number;
  approved_selections?: number;
}

export interface Room {
  id: number;
  project_id: number;
  name: string;
  length: number;
  width: number;
  height: number;
  notes: string;
  concepts?: DesignConcept[];
}

export interface DesignConcept {
  id: number;
  room_id: number;
  title: string;
  description: string;
  image_url: string;
  status: 'Pending' | 'Approved' | 'Revised';
  created_at: string;
}

export interface Vendor {
  id: number;
  name: string;
  contact_name: string;
  phone: string;
  email: string;
  category: string;
  address: string;
  rating: number;
}

export interface Material {
  id: number;
  category: 'Tiles' | 'Laminates' | 'Paints' | 'Furniture' | 'Lighting' | 'Hardware' | 'Fabric';
  name: string;
  brand: string;
  sku: string;
  unit_price: number;
  image_url: string;
  vendor_id?: number;
  vendor_name?: string;
}

export interface MaterialSelection {
  id: number;
  project_id: number;
  room_id: number;
  material_id: number;
  vendor_id?: number;
  quantity: number;
  status: 'Pending' | 'Selected' | 'Approved' | 'Replaced';
  notes: string;
  updated_at: string;
  material_name?: string;
  brand?: string;
  sku?: string;
  unit_price?: number;
  category?: 'Tiles' | 'Laminates' | 'Paints' | 'Furniture' | 'Lighting' | 'Hardware' | 'Fabric';
  image_url?: string;
  vendor_name?: string;
}

export interface MaterialHistory {
  id: number;
  project_id: number;
  room_id?: number;
  material_selection_id?: number;
  user_name: string;
  previous_status: string;
  new_status: string;
  notes: string;
  created_at: string;
  material_name?: string;
  room_name?: string;
}

export interface Expense {
  id: number;
  project_id: number;
  category: string;
  amount: number;
  notes: string;
  date: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  assigned_to: 'Designer' | 'Project Manager' | 'Site Engineer' | 'Vendor Coordinator' | 'Admin';
  status: 'To Do' | 'In Progress' | 'Completed';
  due_date: string;
}

export interface SiteVisit {
  id: number;
  project_id: number;
  visit_date: string;
  visitor_name: string;
  notes: string;
  photos: string;
}

export interface User {
  name: string;
  role: 'Designer' | 'Project Manager' | 'Site Engineer' | 'Vendor Coordinator' | 'Admin' | 'Client';
}
