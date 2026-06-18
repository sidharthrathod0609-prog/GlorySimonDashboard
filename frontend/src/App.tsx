import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Palette,
  Users,
  TrendingUp,
  FileText,
  Settings,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Home,
  Check,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  ChevronRight,
  Clock,
  Printer,
  Download,
  AlertTriangle,
  Star,
  Phone,
  Mail,
  MapPin,
  X,
  FileSpreadsheet,
  Shield,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate, useNavigate, Outlet, useLocation } from 'react-router-dom';

// Types
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
  User
} from './types';

import { useAppStore } from './store/useAppStore';
import { db } from './services/db';

// Auth pages & guard
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import UsersView from './pages/Users';
import ClientsView from './pages/Clients';
import ProtectedRoute from './components/ProtectedRoute';
import MaterialApproval from './pages/MaterialApproval';
import QuotationBuilder from './pages/QuotationBuilder';
import SiteVisits from './pages/SiteVisits';
import Procurement from './pages/Procurement';
import Installation from './pages/Installation';
import Notifications from './pages/Notifications';
import Vendors from './pages/Vendors';
import Budget from './pages/Budget';
import Reports from './pages/Reports';

// Helper for permissions description inside profile card modal
function getRolePermissionsDesc(role: string) {
  switch (role) {
    case 'Admin':
      return 'Administrator: Full access to manage users, projects, budgets, materials, and settings.';
    case 'Interior Designer':
      return 'Designer: Edit rooms, manage selections, approve materials, and view budget guidelines.';
    case 'Project Manager':
      return 'PM: Create projects, manage timeline/tasks, edit budgets, and view summaries.';
    case 'Vendor Coordinator':
      return 'Vendor Coordinator: View and edit suppliers information and logistics settings.';
    default:
      return 'Client Account: Read-only access to view selections, concepts, and project updates.';
  }
}

export default function App() {
  const { brandTheme, themeMode, backgroundStyle } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', brandTheme);
  }, [brandTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-background-style', backgroundStyle);
  }, [backgroundStyle]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardViewRoute />} />
        <Route path="projects" element={<ProjectsViewRoute />} />
        <Route
          path="clients"
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Interior Designer', 'Project Manager']}>
              <ClientsView />
            </ProtectedRoute>
          }
        />
        <Route path="selections" element={<SelectionsViewRoute />} />
        <Route path="vendors" element={<VendorsViewRoute />} />
        <Route path="budget" element={<BudgetViewRoute />} />
        <Route path="reports" element={<ReportsViewRoute />} />
        <Route path="approval" element={<MaterialApproval />} />
        <Route path="quotes" element={<QuotationBuilder />} />
        <Route path="site-visits" element={<SiteVisits />} />
        <Route path="procurement" element={<Procurement />} />
        <Route path="installation" element={<Installation />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<SettingsViewRoute />} />
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <UsersView />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function DashboardLayout() {
  const {
    currentTab,
    projects,
    activeProjectId,
    setActiveProjectId,
    currentUser,
    setCurrentTab,
    fetchStats,
    fetchProjects,
    fetchMaterials,
    fetchVendors,
    fetchClients,
    backgroundStyle
  } = useAppStore();

  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync currentTab state with URL pathname for styling and backward compatibility
  useEffect(() => {
    const pathName = location.pathname.split('/')[1] || 'dashboard';
    setCurrentTab(pathName);
    setMobileMenuOpen(false); // Auto close mobile drawer on navigate
  }, [location.pathname]);

  // Load baseline statistics and list of projects
  useEffect(() => {
    fetchStats();
    fetchProjects();
    fetchMaterials();
    fetchVendors();
    fetchClients();
  }, []);

  // Map route pathname to human-readable page titles for sticky top navigation bar
  const allMenuItemsList = [
    { id: 'dashboard', label: 'Workspace Overview' },
    { id: 'projects', label: 'Projects Registry' },
    { id: 'clients', label: 'Client Profiles' },
    { id: 'selections', label: 'Material Finishes' },
    { id: 'approval', label: 'Material Approval' },
    { id: 'vendors', label: 'Suppliers Matrix' },
    { id: 'quotes', label: 'Estimate Builder' },
    { id: 'budget', label: 'Budget Ledger' },
    { id: 'site-visits', label: 'Site Consultations' },
    { id: 'procurement', label: 'Procurement Pipeline' },
    { id: 'installation', label: 'Installation Tracker' },
    { id: 'reports', label: 'Executive Reports' },
    { id: 'notifications', label: 'System Alerts' },
    { id: 'settings', label: 'Settings Panel' },
    { id: 'users', label: 'Access Directory' }
  ];
  const activePath = location.pathname.split('/')[1] || 'dashboard';
  const matchedItem = allMenuItemsList.find(item => item.id === activePath);
  const pageTitle = matchedItem ? matchedItem.label : 'Glory Simon';

  const bgImages = {
    'villa': '/assets/backgrounds/luxury_villa.png',
    'living-room': '/assets/backgrounds/modern_living_room.png',
    'office': '/assets/backgrounds/premium_office.png',
    'architectural': '/assets/backgrounds/minimal_architectural.png'
  };

  const currentBgImage = bgImages[backgroundStyle] || bgImages['villa'];

  return (
    <div className="flex min-h-screen bg-slate-950 text-gray-100 font-sans selection:bg-gold/30 selection:text-white relative">
      {/* Premium Background Layer */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none transition-all duration-700 ease-in-out lg:bg-fixed opacity-[0.15]"
        style={{ 
          backgroundImage: `url(${currentBgImage})`,
        }}
      />
      {/* Blur and Theme Opacity Overlay */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none transition-all duration-700 ease-in-out"
        style={{
          backgroundColor: 'rgb(var(--slate-950-rgb) / 0.90)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      />

      {/* Navigation Sidebar (Desktop + Mobile slide-out drawer) */}
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Sticky Header Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 bg-slate-900/40 border-b border-white/5 flex items-center justify-between px-4 md:px-6 lg:px-8 z-40 backdrop-blur-md transition-all duration-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition duration-150 focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none"
            title="Open Menu"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          
          <h2 className="text-sm md:text-base font-bold text-white font-display tracking-wide truncate max-w-[240px] md:max-w-md">
            {pageTitle}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center font-bold text-slate-950 text-xs shadow-md shadow-gold/15">
            {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 min-h-screen ml-0 lg:ml-64 p-4 md:p-6 lg:p-8 pt-24 lg:pt-24 overflow-y-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-6xl mx-auto pb-12"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Route wrappers that inject store states and handlers directly to subcomponents
function DashboardViewRoute() {
  const store = useAppStore();
  return (
    <DashboardView
      stats={store.stats}
      projects={store.projects}
      setCurrentTab={store.setCurrentTab}
      setActiveProjectId={store.setActiveProjectId}
      handleCreateProject={store.createProject}
      materials={store.materials}
      currentUser={store.currentUser}
    />
  );
}

function ProjectsViewRoute() {
  const store = useAppStore();
  
  // Guard access to project manager/admin/designer/client
  if (['Vendor Coordinator'].includes(store.currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ProjectsView
      projects={store.projects}
      fetchProjects={store.fetchProjects}
      handleCreateProject={store.createProject}
      handleUpdateProject={store.updateProject}
      handleDeleteProject={store.deleteProject}
      activeProjectId={store.activeProjectId}
      setActiveProjectId={store.setActiveProjectId}
      projectDetails={store.projectDetails}
      detailsLoading={store.detailsLoading}
      materials={store.materials}
      vendors={store.vendors}
      handleAddRoom={store.addRoom}
      handleAddSelection={store.addSelection}
      handleUpdateSelection={store.updateSelection}
      handleDeleteSelection={store.deleteSelection}
      handleAddExpense={store.addExpense}
      handleUpdateConceptStatus={store.updateConceptStatus}
      handleCreateSiteVisit={store.createSiteVisit}
      handleCreateTask={store.createTask}
      handleUpdateTaskStatus={store.updateTaskStatus}
      handleDeleteTask={store.deleteTask}
      currentUser={store.currentUser}
    />
  );
}

function SelectionsViewRoute() {
  const store = useAppStore();

  // Guard access to admin/designer/client
  if (['Vendor Coordinator', 'Project Manager'].includes(store.currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SelectionsView
      projectDetails={store.projectDetails}
      materials={store.materials}
      vendors={store.vendors}
      loading={store.detailsLoading}
      handleAddSelection={store.addSelection}
      handleUpdateSelection={store.updateSelection}
      handleDeleteSelection={store.deleteSelection}
      handleAddRoom={store.addRoom}
      activeProjectId={store.activeProjectId}
      projects={store.projects}
      setActiveProjectId={store.setActiveProjectId}
      currentUser={store.currentUser}
    />
  );
}

function VendorsViewRoute() {
  const store = useAppStore();

  // Guard access (Clients and PMs cannot view vendors according to specifications)
  if (['Client', 'Project Manager'].includes(store.currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Vendors />
  );
}

function BudgetViewRoute() {
  const store = useAppStore();

  // Guard access (Vendor coordinator cannot view budgets)
  if (['Vendor Coordinator'].includes(store.currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Budget />
  );
}

function ReportsViewRoute() {
  const store = useAppStore();

  // Guard access (Only Admins and Project Managers can view reports)
  if (!['Admin', 'Project Manager'].includes(store.currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Reports />
  );
}

function SettingsViewRoute() {
  const store = useAppStore();
  return (
    <SettingsView
      currentUser={store.currentUser}
      updateUserProfile={store.updateUserProfile}
      brandTheme={store.brandTheme}
      setBrandTheme={store.setBrandTheme}
    />
  );
}

// ==========================================
// 1. SIDEBAR COMPONENT
// ==========================================
interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    currentUser,
    logout
  } = useAppStore();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const currentPath = location.pathname.split('/')[1] || 'dashboard';

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'clients', label: 'Client Management', icon: Users },
    { id: 'selections', label: 'Material Selection', icon: Palette },
    { id: 'approval', label: 'Material Approval', icon: Check },
    { id: 'vendors', label: 'Vendors', icon: FileSpreadsheet },
    { id: 'quotes', label: 'Quotation Builder', icon: Printer },
    { id: 'budget', label: 'Budget Tracking', icon: TrendingUp },
    { id: 'site-visits', label: 'Site Visits', icon: Clock },
    { id: 'procurement', label: 'Procurement', icon: RefreshCw },
    { id: 'installation', label: 'Installation', icon: Settings },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'users', label: 'User Directory', icon: Shield }
  ];

  // Role-based menu item filtering
  const getFilteredMenuItems = () => {
    switch (currentUser.role) {
      case 'Admin':
        return allMenuItems;
      case 'Interior Designer':
        return allMenuItems.filter(item => ['dashboard', 'projects', 'clients', 'selections', 'approval', 'vendors', 'quotes', 'budget', 'site-visits', 'procurement', 'installation', 'notifications', 'settings'].includes(item.id));
      case 'Project Manager':
        return allMenuItems.filter(item => ['dashboard', 'projects', 'clients', 'approval', 'quotes', 'budget', 'site-visits', 'procurement', 'installation', 'reports', 'notifications', 'settings'].includes(item.id));
      case 'Vendor Coordinator':
        return allMenuItems.filter(item => ['dashboard', 'vendors', 'procurement', 'notifications', 'settings'].includes(item.id));
      default: // Client or other
        return allMenuItems.filter(item => ['dashboard', 'approval', 'quotes', 'notifications', 'settings'].includes(item.id));
    }
  };

  const menuItems = getFilteredMenuItems();

  const renderInnerContent = (isDrawer = false) => (
    <>
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-gold-dark to-gold rounded-lg flex items-center justify-center font-bold text-slate-950 text-lg">
              GS
            </div>
            <div>
              <h1 className="text-md font-bold tracking-wide text-white font-display">Glory Simon</h1>
              <p className="text-xs text-gold font-semibold tracking-wider uppercase">Interiors</p>
            </div>
          </div>
          {isDrawer && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition"
              title="Close Menu"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Compact User Profile Menu Card */}
        <div className="mb-6 px-1 relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-3 bg-slate-950/80 border border-white/5 p-3 rounded-xl hover:bg-slate-900/80 cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none"
            title="Account Menu"
            aria-haspopup="true"
            aria-expanded={showProfileMenu}
            aria-label="Account Menu"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-dark to-gold text-slate-950 flex items-center justify-center font-bold text-xs shadow-lg shadow-gold/15 shrink-0">
              {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-bold text-gray-200 truncate leading-tight">{currentUser.name}</p>
              <p className="text-[9px] text-gold font-semibold uppercase tracking-wider leading-tight mt-0.5">{currentUser.role}</p>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 bottom-full mb-2 bg-slate-900 border border-white/10 p-2 rounded-xl shadow-2xl z-50 backdrop-blur-xl text-left"
                >
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] text-gray-300 hover:bg-white/5 hover:text-white text-left font-semibold"
                  >
                    <Users size={12} className="text-gold" />
                    View Profile Info
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] text-gray-300 hover:bg-white/5 hover:text-white text-left font-semibold"
                  >
                    <Settings size={12} className="text-gold" />
                    Profile Settings
                  </button>
                  <div className="border-t border-white/5 my-1.5" />
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] text-red-400 hover:bg-red-500/10 text-left font-semibold"
                  >
                    <Trash2 size={12} className="text-red-400" />
                    Logout Session
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Project Switcher (Hidden for Vendor Coordinator) */}
        {currentUser.role !== 'Vendor Coordinator' && (
          <div className="mb-6 px-1">
            <label htmlFor="sidebar-workspace-select" className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-2 px-1">
              Active Workspace
            </label>
            <div className="flex items-center gap-2 bg-slate-950/80 border border-white/5 px-3 py-2 rounded-xl focus-within:ring-2 focus-within:ring-gold/50">
              <FolderOpen size={14} className="text-gold" />
              <select
                id="sidebar-workspace-select"
                value={activeProjectId || ''}
                onChange={(e) => setActiveProjectId(Number(e.target.value))}
                className="flex-1 bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer focus-visible:ring-1 focus-visible:ring-gold"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-gray-200">
                    {p.name.length > 20 ? p.name.substring(0, 18) + '...' : p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPath === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate('/' + item.id);
                  if (isDrawer) setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-gold-dark/20 to-gold/10 text-gold border-l-2 border-gold shadow-[0_0_15px_rgba(197,168,128,0.08)] pl-[14px]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-gold' : 'text-gray-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-3 pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
          <span className="text-[10px] font-medium text-gray-400 tracking-wider">WORKSPACE ACTIVE</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (visible on lg screens) */}
      <aside className="hidden lg:flex w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 h-screen fixed top-0 left-0 flex-col p-6 z-30 overflow-y-auto justify-between">
        {renderInnerContent(false)}
      </aside>

      {/* Mobile Drawer Slide-out (visible on small/medium screens) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Slide drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="lg:hidden w-64 bg-slate-900 border-r border-white/10 h-screen fixed top-0 left-0 flex flex-col p-6 z-50 overflow-y-auto justify-between shadow-2xl"
            >
              {renderInnerContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Profile Detail Modal Overlay */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel border border-white/10 p-6 bg-slate-900 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition"
              >
                <X size={18} />
              </button>
              
              <div className="flex flex-col items-center text-center space-y-3 mt-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-dark to-gold text-slate-950 flex items-center justify-center font-bold text-lg shadow-xl shadow-gold/20">
                  {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-display">{currentUser.name}</h2>
                  <p className="text-xs text-gold font-semibold uppercase tracking-wider mt-0.5">{currentUser.role}</p>
                </div>
              </div>

              <div className="border-t border-white/5 my-4 pt-4 space-y-3 text-xs">
                <div>
                  <span className="block text-gray-500 uppercase tracking-widest font-bold text-[9px] mb-1">Email Address</span>
                  <span className="text-gray-200 font-semibold">{currentUser.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-gray-500 uppercase tracking-widest font-bold text-[9px] mb-1">Permissions Profile</span>
                  <span className="text-gray-300">{getRolePermissionsDesc(currentUser.role)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowProfileModal(false);
                  navigate('/settings');
                }}
                className="w-full py-2.5 bg-gradient-to-br from-gold-dark to-gold text-slate-950 text-xs font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all text-center block"
              >
                Edit Profile Settings
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ==========================================
// 2. DASHBOARD VIEW
// ==========================================
interface DashboardViewProps {
  stats: any;
  projects: Project[];
  setCurrentTab: (tab: string) => void;
  setActiveProjectId: (id: number) => void;
  handleCreateProject: (data: any) => Promise<void>;
  materials: Material[];
  currentUser: User;
}

function DashboardView({ stats, projects, setCurrentTab, setActiveProjectId, handleCreateProject, materials, currentUser }: DashboardViewProps) {
  const [showAddProject, setShowAddProject] = useState(false);
  const [formData, setFormData] = useState({
    name: '', clientName: '', phone: '', email: '', location: '', type: 'Residential', budget: '', notes: '', startDate: '', assignedDesigner: ''
  });

  if (!stats) return <div className="text-center py-20 text-gray-400">Loading dashboard data...</div>;

  const triggerCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateProject({
      ...formData,
      budget: parseFloat(formData.budget) || 0,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      assignedDesigner: formData.assignedDesigner || 'Nisha Sen'
    });
    setShowAddProject(false);
    setFormData({ name: '', clientName: '', phone: '', email: '', location: '', type: 'Residential', budget: '', notes: '', startDate: '', assignedDesigner: '' });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">Workspace Overview</h2>
          <p className="text-sm text-gray-400">Glory Simon Interiors Material Selection Registry</p>
        </div>
        {(currentUser.role === 'Admin' || currentUser.role === 'Project Manager') && (
          <button
            onClick={() => setShowAddProject(true)}
            className="px-4 py-2 bg-gradient-to-r from-gold-dark to-gold text-slate-950 rounded-xl font-semibold text-sm hover:brightness-110 shadow-lg hover:shadow-gold/10 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', val: stats.totalProjects, sub: 'All pipeline logs', icon: FolderOpen, color: 'text-gold' },
          { label: 'Active Projects', val: stats.activeProjects, sub: 'Ongoing jobs', icon: FolderOpen, color: 'text-sky-400' },
          { label: 'Pending Material Approvals', val: stats.pendingMaterials, sub: 'Awaiting client approval', icon: Palette, color: 'text-amber-400' },
          { label: 'Approved Materials', val: stats.approvedMaterials, sub: 'Sign-off complete', icon: Check, color: 'text-emerald-400' },
          { label: 'Vendors', val: stats.activeVendors, sub: 'Sourced suppliers', icon: Users, color: 'text-purple-400' },
          { label: 'Site Visits Scheduled', val: stats.siteVisitsScheduled || 0, sub: 'Visits logged', icon: Clock, color: 'text-rose-400' }
        ].map((c, i) => (
          <div key={i} className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex flex-col justify-between min-h-[100px]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{c.label}</span>
              <c.icon size={16} className={c.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-white mb-1 font-display">{c.val}</p>
              <p className="text-[10px] text-gray-400">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Status Chart */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Project Status Distribution</h3>
          <div className="space-y-3 pt-2">
            {(() => {
              const statusCounts = projects.reduce((acc: Record<string, number>, p) => {
                acc[p.status] = (acc[p.status] || 0) + 1;
                return acc;
              }, {});
              const total = projects.length || 1;
              const stages = ['Enquiry', 'Material Selection', 'Design Approval', 'Execution', 'Completed'];
              return stages.map(stage => {
                const count = statusCounts[stage] || 0;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={stage} className="space-y-1 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span>{stage}</span>
                      <span className="font-semibold text-gold">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-gold" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Material Categories Chart */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-4">
          <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Selections by Category</h3>
          <div className="space-y-3 pt-2">
            {(() => {
              const categories = ['Tiles', 'Laminates', 'Paints', 'Furniture', 'Lighting', 'Hardware', 'Fabric'];
              const categoryCounts: Record<string, number> = {
                'Tiles': 4,
                'Laminates': 3,
                'Paints': 2,
                'Lighting': 2,
                'Furniture': 2,
                'Hardware': 1,
                'Fabric': 1
              };
              const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;
              return categories.map(cat => {
                const count = categoryCounts[cat] || 0;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span>{cat}</span>
                      <span className="font-semibold text-sky-400">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Budget Usage Chart */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-4">Budget Usage Tracker</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Total Allocated Budget</span>
                  <span className="text-xl font-bold text-white">INR {(stats.budgetUsage?.totalBudget || 0).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider">Total Spent Cost</span>
                  <span className="text-md font-bold text-rose-400">INR {(stats.budgetUsage?.totalSpent || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Utilization Status</span>
                  <span className="font-bold text-white">{stats.budgetUsage?.utilizationPct}% Utilized</span>
                </div>
                <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-gold to-rose-500 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(stats.budgetUsage?.utilizationPct || 0, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-[11px] p-3 bg-slate-950/40 border border-white/5 rounded-xl text-gray-400 leading-relaxed">
            Overall budget utilization across active workspaces. Spent vs budget is updated automatically as material selections are approved.
          </div>
        </div>
      </div>

      {/* Split Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Directory List */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl lg:col-span-2 space-y-4">
          <h3 className="text-md font-semibold text-white">Active Projects Directory</h3>
          
          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-medium">
                  <th className="pb-3 pr-4">Project Name</th>
                  <th className="pb-3 pr-4">Client Type</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Approvals</th>
                  <th className="pb-3">Budget</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 5).map(p => {
                  const pct = p.total_selections && p.total_selections > 0 
                    ? Math.round((p.approved_selections! / p.total_selections) * 100) 
                    : 0;
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition duration-150">
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => { setActiveProjectId(p.id); setCurrentTab('projects'); }}
                          className="font-bold text-gold hover:underline text-left"
                        >
                          {p.name}
                        </button>
                        <p className="text-[10px] text-gray-400 mt-1">{p.client_name}</p>
                      </td>
                      <td className="py-3 pr-4 text-gray-300">{p.client_type}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeStyles(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="text-gray-400">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-gray-300">INR {p.budget.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="space-y-3 sm:hidden">
            {projects.slice(0, 5).map(p => {
              const pct = p.total_selections && p.total_selections > 0 
                ? Math.round((p.approved_selections! / p.total_selections) * 100) 
                : 0;
              return (
                <div key={p.id} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <button
                      onClick={() => { setActiveProjectId(p.id); setCurrentTab('projects'); }}
                      className="font-bold text-gold hover:underline text-left text-xs"
                    >
                      {p.name}
                    </button>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeStyles(p.status)}`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
                    <div>
                      <span className="text-gray-500 block uppercase font-bold tracking-wider text-[8px]">Client</span>
                      <span className="text-white font-medium">{p.client_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block uppercase font-bold tracking-wider text-[8px]">Budget</span>
                      <span className="text-white font-semibold">INR {p.budget.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-gray-400 text-[10px]">Approvals:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                        <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-gray-400 text-[10px]">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Activity Logs */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-white">Audited Selections Log</h3>
            <Clock size={16} className="text-gold" />
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((act: any) => (
                <div key={act.id} className="p-3 bg-slate-950/60 border border-white/5 rounded-xl text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gold">{act.user_name}</span>
                    <span className="text-[10px] text-gray-400">{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-gray-300">{act.notes}</p>
                  <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[10px]">
                    <span className="text-gray-500">Project: {act.project_name}</span>
                    <div className="flex items-center gap-1 font-bold">
                      <span className="text-rose-400">{act.previous_status}</span>
                      <ChevronRight size={10} className="text-gray-500" />
                      <span className="text-emerald-400">{act.new_status}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-10">No status audit entries logged yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant & Notifications Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIDesignAssistant materials={materials} />
        <CommunicationsFeed stats={stats} />
      </div>

      {/* Create Modal Popup */}
      {showAddProject && (
        <ProjectModal
          title="Register Sourcing Contract"
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowAddProject(false)}
          onSubmit={triggerCreateProject}
        />
      )}
    </div>
  );
}

function AIDesignAssistant({ materials }: { materials: Material[] }) {
  const [selectedStyle, setSelectedStyle] = useState('luxury');
  const [recommendation, setRecommendation] = useState<any>(null);

  const presets: any = {
    luxury: {
      name: 'Modern Luxury',
      description: 'High-gloss marble textures, rich gold finishes, and deep velvet tones for an upscale aesthetic.',
      tags: ['Tiles', 'Furniture', 'Hardware']
    },
    minimalist: {
      name: 'Warm Minimalist',
      description: 'Matte neutral tones, natural teak wood, beige fabrics, and subtle black accents for a calm atmosphere.',
      tags: ['Laminates', 'Paints', 'Fabric']
    },
    industrial: {
      name: 'Bold Industrial',
      description: 'Dark slate slabs, matte charcoal laminates, heavy hardware, and functional track lighting.',
      tags: ['Tiles', 'Laminates', 'Lighting', 'Hardware']
    }
  };

  const generateGuide = () => {
    const preset = presets[selectedStyle];
    const matches = materials.filter(m => preset.tags.includes(m.category)).slice(0, 3);
    setRecommendation({
      styleName: preset.name,
      description: preset.description,
      items: matches
    });
  };

  return (
    <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold text-white">Smart AI Design Matcher</h3>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border border-gold/30 text-gold bg-gold/10 uppercase tracking-wider">AI Layer</span>
      </div>
      <div className="text-xs space-y-3">
        <p className="text-gray-400">Suggest catalog material combinations matching style guidelines.</p>
        <div className="flex gap-2">
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="flex-1 bg-slate-950 border border-white/5 p-3 rounded-xl text-white outline-none cursor-pointer focus:border-gold"
          >
            <option value="luxury">Modern Luxury Palette</option>
            <option value="minimalist">Warm Minimalist Palette</option>
            <option value="industrial">Bold Industrial Palette</option>
          </select>
          <button
            onClick={generateGuide}
            className="px-4 py-2 bg-gradient-to-r from-gold-dark to-gold text-slate-950 rounded-xl font-bold transition hover:brightness-110"
          >
            Match Materials
          </button>
        </div>

        {recommendation ? (
          <div className="p-4 bg-slate-950/60 border border-gold/10 rounded-xl space-y-3 fade-in">
            <div>
              <h4 className="font-bold text-gold">{recommendation.styleName} combination</h4>
              <p className="text-gray-400 mt-1 leading-relaxed text-[11px]">{recommendation.description}</p>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block">Recommended items:</span>
              {recommendation.items.map((m: any) => (
                <div key={m.id} className="flex justify-between items-center bg-white/5 p-2 rounded-lg text-[11px]">
                  <div>
                    <span className="font-semibold text-gray-200">{m.name}</span>
                    <span className="text-gray-500 text-[10px] block">{m.brand} • {m.category}</span>
                  </div>
                  <span className="text-gold font-semibold">INR {m.unit_price}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500 italic bg-slate-950/20 border border-dashed border-white/5 rounded-xl">
            Choose a palette preset to query styling recommendations.
          </div>
        )}
      </div>
    </div>
  );
}

function CommunicationsFeed({ stats }: { stats: any }) {
  const communications = [
    {
      id: 1,
      type: 'whatsapp',
      to: 'Sidharth Rathod (Client)',
      msg: '⚠️ Sourcing Approval Pending: Deep Teal Matte Accent backdrop wall design requires client validation signature.',
      time: 'Just now'
    },
    {
      id: 2,
      type: 'email',
      to: 'Apex Marble & Tiles (Supplier)',
      msg: '✅ Purchase Order Confirmed: PO #AP-928 dispatched for 432 units of Italian Carrara Vitrified Tile.',
      time: '12 mins ago'
    },
    {
      id: 3,
      type: 'whatsapp',
      to: 'Rahul Dev (PM)',
      msg: '🚨 Budget Cap Notice: Rathod Penthouse Villa budget reaches 92.5% utilization cap threshold.',
      time: '1 hour ago'
    },
    {
      id: 4,
      type: 'email',
      to: 'Suman Sharma (Client)',
      msg: '📅 Site Visit Confirmed: Schedule booked for Rahul Dev layout measurements verification on 2026-06-20.',
      time: '2 hours ago'
    }
  ];

  return (
    <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold text-white">Automated Communications log</h3>
        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border border-sky-500/30 text-sky-400 bg-sky-950/10 uppercase tracking-wider animate-pulse">Live API Feed</span>
      </div>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {communications.map(c => (
          <div key={c.id} className="p-3 bg-slate-950/60 border border-white/5 rounded-xl text-[11px] space-y-1.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                  c.type === 'whatsapp' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                }`}>
                  {c.type === 'whatsapp' ? 'WhatsApp PO' : 'SMTP Email'}
                </span>
                <span className="text-gray-400 font-semibold">To: {c.to}</span>
              </div>
              <span className="text-gray-500 text-[9px]">{c.time}</span>
            </div>
            <p className="text-gray-300 leading-relaxed">{c.msg}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 3. PROJECTS VIEW
// ==========================================
interface ProjectsViewProps {
  projects: Project[];
  fetchProjects: (filters: string) => Promise<void>;
  handleCreateProject: (data: any) => Promise<void>;
  handleUpdateProject: (id: number, data: any) => Promise<void>;
  handleDeleteProject: (id: number) => Promise<void>;
  activeProjectId: number | null;
  setActiveProjectId: (id: number) => void;
  projectDetails: any;
  detailsLoading: boolean;
  materials: Material[];
  vendors: Vendor[];
  handleAddRoom: (data: any) => Promise<void>;
  handleAddSelection: (data: any) => Promise<void>;
  handleUpdateSelection: (id: number, data: any) => Promise<void>;
  handleDeleteSelection: (id: number) => Promise<void>;
  handleAddExpense: (data: any) => Promise<void>;
  handleUpdateConceptStatus: (conceptId: number, status: string) => Promise<void>;
  handleCreateSiteVisit: (data: any) => Promise<void>;
  handleCreateTask: (data: any) => Promise<void>;
  handleUpdateTaskStatus: (taskId: number, status: string) => Promise<void>;
  handleDeleteTask: (taskId: number) => Promise<void>;
  currentUser: User;
}

function ProjectsView({
  projects, fetchProjects, handleCreateProject, handleUpdateProject, handleDeleteProject,
  activeProjectId, setActiveProjectId, projectDetails, detailsLoading, materials, vendors,
  handleAddRoom, handleAddSelection, handleUpdateSelection, handleDeleteSelection, handleAddExpense,
  handleUpdateConceptStatus, handleCreateSiteVisit, handleCreateTask, handleUpdateTaskStatus, handleDeleteTask,
  currentUser
}: ProjectsViewProps) {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modals state
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<Project | null>(null);
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Site visits and tasks form state
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({ visitDate: '', visitorName: '', notes: '' });
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', assignedTo: 'Designer', dueDate: '' });

  const [formData, setFormData] = useState({
    name: '', clientName: '', phone: '', email: '', location: '', type: 'Residential', budget: '', notes: '', startDate: '', assignedDesigner: ''
  });

  const filterStages = [
    'Enquiry', 'Site Visit', 'Space Planning', 'Quotation', 'Design Approval', 'Material Selection', 'Execution', 'Quality Inspection', 'Completed'
  ];

  // Refresh query parameters
  useEffect(() => {
    let params = `?search=${search}&type=${type}&status=${status}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
    fetchProjects(params);
  }, [search, type, status, sortBy, sortOrder]);

  const triggerCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateProject({
      ...formData,
      budget: parseFloat(formData.budget) || 0,
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      assignedDesigner: formData.assignedDesigner || 'Nisha Sen'
    });
    setShowAdd(false);
    resetForm();
  };

  const triggerEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showEdit) {
      await handleUpdateProject(showEdit.id, {
        name: formData.name,
        budget: parseFloat(formData.budget) || 0,
        address: formData.location,
        notes: formData.notes,
        clientName: formData.clientName,
        clientEmail: formData.email,
        clientPhone: formData.phone,
        clientType: formData.type,
        status: showEdit.status,
        startDate: formData.startDate,
        assignedDesigner: formData.assignedDesigner
      });
      setShowEdit(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', clientName: '', phone: '', email: '', location: '', type: 'Residential', budget: '', notes: '', startDate: '', assignedDesigner: '' });
  };

  const loadEditData = (p: Project) => {
    setFormData({
      name: p.name,
      clientName: p.client_name || '',
      phone: p.client_phone || '',
      email: p.client_email || '',
      location: p.address || '',
      type: p.client_type || 'Residential',
      budget: p.budget.toString(),
      notes: p.notes || '',
      startDate: p.start_date || '',
      assignedDesigner: p.assigned_designer || ''
    });
    setShowEdit(p);
  };

  const activeDetails = projectDetails && activeProjectId === projectDetails.project.id ? projectDetails : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">Client Projects Directory</h2>
          <p className="text-sm text-gray-400">Add, track stages, and audit material files.</p>
        </div>
        {(currentUser.role === 'Admin' || currentUser.role === 'Project Manager') && (
          <button
            onClick={() => { resetForm(); setShowAdd(true); }}
            className="px-4 py-2 bg-gradient-to-r from-gold-dark to-gold text-slate-950 rounded-xl font-semibold text-sm hover:brightness-110 shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Add Project</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
        <div className="relative md:col-span-2">
          <Search size={14} className="absolute left-3 top-3.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by client or project name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-white/5 pl-9 pr-3 py-3 rounded-xl text-white outline-none focus:border-gold"
          />
        </div>
        <div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-slate-950 border border-white/5 p-3 rounded-xl text-gray-300 outline-none cursor-pointer focus:border-gold"
          >
            <option value="">All Project Types</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>
        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-950 border border-white/5 p-3 rounded-xl text-gray-300 outline-none cursor-pointer focus:border-gold"
          >
            <option value="">All Pipeline Stages</option>
            {filterStages.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 bg-slate-950 border border-white/5 p-3 rounded-xl text-gray-300 outline-none cursor-pointer focus:border-gold"
          >
            <option value="created_at">Date Created</option>
            <option value="name">Project Name</option>
            <option value="budget">Budget Cap</option>
            <option value="status">Journey Stage</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="bg-slate-950 border border-white/5 p-3 rounded-xl text-gray-300 hover:text-gold transition"
          >
            <ArrowUpDown size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Project Directory Table */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl lg:col-span-2 space-y-4">
          <h3 className="text-md font-semibold text-white">Project Files</h3>
          
          {/* Desktop/Tablet Table View */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-medium">
                  <th className="pb-3 pr-4">Project Name</th>
                  <th className="pb-3 pr-4">Client Name</th>
                  <th className="pb-3 pr-4">Project Type</th>
                  <th className="pb-3 pr-4">Budget</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Start Date</th>
                  <th className="pb-3 pr-4">Assigned Designer</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr
                    key={p.id}
                    className={`border-b border-white/5 hover:bg-white/5 transition duration-150 cursor-pointer ${
                      activeProjectId === p.id ? 'bg-white/5 border-l-2 border-gold pl-2' : ''
                    }`}
                    onClick={() => setActiveProjectId(p.id)}
                  >
                    <td className="py-3 pr-4 font-bold text-gray-200">
                      {p.name}
                      <p className="text-[9px] text-gray-500 font-normal mt-0.5">{p.address}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-300">{p.client_name}</td>
                    <td className="py-3 pr-4 text-gray-400">{p.client_type}</td>
                    <td className="py-3 pr-4 text-gold font-semibold">INR {p.budget.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeStyles(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-400">{p.start_date || 'N/A'}</td>
                    <td className="py-3 pr-4 text-gray-400">{p.assigned_designer || 'N/A'}</td>
                    <td className="py-3 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveProjectId(p.id)}
                        className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-sky-400 transition"
                        title="View Details"
                      >
                        <Eye size={12} />
                      </button>
                      {(currentUser.role === 'Admin' || currentUser.role === 'Project Manager') ? (
                        <>
                          <button
                            onClick={() => loadEditData(p)}
                            className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-gold transition"
                            title="Edit Project"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(p.id)}
                            className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-rose-400 transition"
                            title="Delete Project"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="space-y-3 sm:hidden">
            {projects.map(p => (
              <div
                key={p.id}
                className={`p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-3 cursor-pointer transition-all ${
                  activeProjectId === p.id ? 'bg-white/5 border-l-2 border-gold pl-3' : ''
                }`}
                onClick={() => setActiveProjectId(p.id)}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-gray-200 text-xs">{p.name}</h4>
                    <p className="text-[10px] text-gray-500 font-normal mt-0.5">{p.address}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeStyles(p.status)}`}>
                    {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
                  <div>
                    <span className="text-gray-500 block uppercase font-bold tracking-wider text-[8px]">Client</span>
                    <span className="text-white font-medium">{p.client_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase font-bold tracking-wider text-[8px]">Type</span>
                    <span className="text-white font-medium">{p.client_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase font-bold tracking-wider text-[8px]">Budget</span>
                    <span className="text-gold font-semibold">INR {p.budget.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block uppercase font-bold tracking-wider text-[8px]">Designer</span>
                    <span className="text-white font-medium">{p.assigned_designer || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                  <span className="text-gray-400 text-[10px]">Start: {p.start_date || 'N/A'}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveProjectId(p.id)}
                      className="p-2 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-sky-400 transition min-h-[36px] flex items-center justify-center"
                      title="View Details"
                    >
                      <Eye size={12} />
                    </button>
                    {(currentUser.role === 'Admin' || currentUser.role === 'Project Manager') ? (
                      <>
                        <button
                          onClick={() => loadEditData(p)}
                          className="p-2 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-gold transition min-h-[36px] flex items-center justify-center"
                          title="Edit Project"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="p-2 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-rose-400 transition min-h-[36px] flex items-center justify-center"
                          title="Delete Project"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Side Panel Portal */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl">
          {detailsLoading ? (
            <div className="text-center py-20 text-gray-400 text-xs">Syncing project details...</div>
          ) : activeDetails ? (
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-white font-display">{activeDetails.project.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeStyles(activeDetails.project.status)}`}>
                    {activeDetails.project.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400">Client: <strong>{activeDetails.project.client_name}</strong></p>
                <div className="flex flex-col gap-1 text-[10px] text-gray-500 pt-1">
                  <span className="flex items-center gap-1"><Phone size={10} /> {activeDetails.project.client_phone}</span>
                  <span className="flex items-center gap-1"><Mail size={10} /> {activeDetails.project.client_email}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} /> {activeDetails.project.address}</span>
                </div>
              </div>

              {/* Internal Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2 text-[10px] uppercase font-bold text-gray-400">
                {['overview', 'spaces', 'concepts', 'site-visits', 'tasks', 'vendors', 'budget'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`pb-1 px-1 border-b-2 transition ${
                      activeSubTab === tab ? 'border-gold text-gold font-bold' : 'border-transparent hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Subtab Contents */}
              <div className="text-xs space-y-4">
                {activeSubTab === 'overview' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">Design Notes</h4>
                      <p className="p-3 bg-slate-950/60 border border-white/5 rounded-xl text-gray-300 leading-relaxed">
                        {activeDetails.project.notes || 'No design notes mapped.'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl">
                        <span className="text-[9px] text-gray-500 block mb-0.5 uppercase tracking-wider font-bold">Budget Limit</span>
                        <p className="font-bold text-white text-sm">INR {activeDetails.project.budget.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl">
                        <span className="text-[9px] text-gray-500 block mb-0.5 uppercase tracking-wider font-bold">Spaces Configured</span>
                        <p className="font-bold text-white text-sm">{activeDetails.rooms.length} Rooms</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubTab === 'spaces' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Rooms Mapping</h4>
                    </div>
                    {activeDetails.rooms.map((r: Room) => (
                      <div key={r.id} className="p-3 bg-slate-950/60 border border-white/5 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-200">{r.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Dims: {r.length}'x{r.width}'x{r.height}'</p>
                        </div>
                        <span className="text-[10px] text-gray-500 italic">{r.notes ? r.notes.substring(0, 25) + '...' : ''}</span>
                      </div>
                    ))}
                    {activeDetails.rooms.length === 0 && (
                      <p className="text-gray-500 italic py-6 text-center">No rooms configured.</p>
                    )}
                  </div>
                )}

                {activeSubTab === 'concepts' && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Design Concepts (Approvals Portal)</h4>
                    {activeDetails.rooms.flatMap((r: Room) => (r.concepts || []).map((c: any) => (
                      <div key={c.id} className="p-3 bg-slate-950/60 border border-white/5 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-200">{c.title} ({r.name})</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border ${
                            c.status === 'Approved' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20' :
                            c.status === 'Revised' ? 'border-rose-500 text-rose-400 bg-rose-950/20' :
                            'border-amber-500 text-amber-400 bg-amber-950/20'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-[11px]">{c.description}</p>
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={() => handleUpdateConceptStatus(c.id, 'Approved')}
                            className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded text-emerald-400 hover:bg-emerald-500/30 font-semibold text-[10px] transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateConceptStatus(c.id, 'Revised')}
                            className="px-2 py-1 bg-rose-500/20 border border-rose-500/30 rounded text-rose-400 hover:bg-rose-500/30 font-semibold text-[10px] transition"
                          >
                            Request Revision
                          </button>
                        </div>
                      </div>
                    )))}
                    {activeDetails.rooms.flatMap((r: Room) => r.concepts || []).length === 0 && (
                      <p className="text-gray-500 italic py-6 text-center">No design concepts uploaded.</p>
                    )}
                  </div>
                )}

                {activeSubTab === 'site-visits' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Site Visits Log</h4>
                      {['Admin', 'Interior Designer', 'Project Manager'].includes(currentUser.role) && (
                        <button
                          onClick={() => setShowAddVisit(!showAddVisit)}
                          className="text-[10px] font-bold text-gold hover:underline"
                        >
                          {showAddVisit ? 'Cancel' : '+ Book Site Visit'}
                        </button>
                      )}
                    </div>

                    {showAddVisit && (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        await handleCreateSiteVisit(visitForm);
                        setShowAddVisit(false);
                        setVisitForm({ visitDate: '', visitorName: '', notes: '' });
                      }} className="p-3 bg-slate-950 border border-white/5 rounded-xl space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <label className="block text-gray-400 mb-1">Date</label>
                            <input
                              type="date" required
                              value={visitForm.visitDate} onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                              className="w-full bg-slate-900 border border-white/5 p-2 rounded text-white outline-none focus:border-gold"
                            />
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-1">Visitor Name</label>
                            <input
                              type="text" required placeholder="e.g. Rahul Dev (PM)"
                              value={visitForm.visitorName} onChange={(e) => setVisitForm({ ...visitForm, visitorName: e.target.value })}
                              className="w-full bg-slate-900 border border-white/5 p-2 rounded text-white outline-none focus:border-gold"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-400 mb-1 text-[10px]">Site Notes</label>
                          <textarea
                            rows={2} placeholder="Slab dimensions, measurements..."
                            value={visitForm.notes} onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                            className="w-full bg-slate-900 border border-white/5 p-2 rounded text-white outline-none focus:border-gold text-[10px]"
                          />
                        </div>
                        <button type="submit" className="w-full bg-gold text-slate-950 p-2 rounded font-bold text-[10px]">
                          SCHEDULE VISIT
                        </button>
                      </form>
                    )}

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {activeDetails.siteVisits.map((v: SiteVisit) => (
                        <div key={v.id} className="p-3 bg-slate-950/60 border border-white/5 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-[10px] text-gray-400">
                            <span className="font-bold text-gray-200">{v.visitor_name}</span>
                            <span>{v.visit_date}</span>
                          </div>
                          <p className="text-gray-300 leading-relaxed">{v.notes}</p>
                          <div className="flex gap-2 items-center text-[9px] text-gold font-bold">
                            <MapPin size={10} />
                            <span>Site measurements logged</span>
                          </div>
                        </div>
                      ))}
                      {activeDetails.siteVisits.length === 0 && (
                        <p className="text-gray-500 italic py-6 text-center">No site visits recorded yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeSubTab === 'tasks' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Snag Lists & Tasks</h4>
                      {['Admin', 'Interior Designer', 'Project Manager'].includes(currentUser.role) && (
                        <button
                          onClick={() => setShowAddTask(!showAddTask)}
                          className="text-[10px] font-bold text-gold hover:underline"
                        >
                          {showAddTask ? 'Cancel' : '+ Add Snag Item'}
                        </button>
                      )}
                    </div>

                    {showAddTask && (
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        await handleCreateTask(taskForm);
                        setShowAddTask(false);
                        setTaskForm({ title: '', assignedTo: 'Designer', dueDate: '' });
                      }} className="p-3 bg-slate-950 border border-white/5 rounded-xl space-y-3">
                        <div>
                          <label className="block text-gray-400 mb-1 text-[10px]">Task Title</label>
                          <input
                            type="text" required placeholder="e.g. Check tile grout leveling"
                            value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                            className="w-full bg-slate-900 border border-white/5 p-2 rounded text-white outline-none focus:border-gold text-[10px]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <label className="block text-gray-400 mb-1">Assigned Role</label>
                            <select
                              value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                              className="w-full bg-slate-900 border border-white/5 p-2 rounded text-white outline-none focus:border-gold cursor-pointer"
                            >
                              <option value="Designer">Interior Designer</option>
                              <option value="Project Manager">Project Manager</option>
                              <option value="Site Engineer">Site Engineer</option>
                              <option value="Vendor Coordinator">Vendor Coordinator</option>
                              <option value="Admin">Administrator</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-400 mb-1">Due Date</label>
                            <input
                              type="date"
                              value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                              className="w-full bg-slate-900 border border-white/5 p-2 rounded text-white outline-none focus:border-gold"
                            />
                          </div>
                        </div>
                        <button type="submit" className="w-full bg-gold text-slate-950 p-2 rounded font-bold text-[10px]">
                          ADD SNAG TASK
                        </button>
                      </form>
                    )}

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {activeDetails.tasks.map((t: Task) => (
                        <div key={t.id} className="p-3 bg-slate-950/60 border border-white/5 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={t.status === 'Completed'}
                              disabled={currentUser.role === 'Client'}
                              onChange={(e) => handleUpdateTaskStatus(t.id, e.target.checked ? 'Completed' : 'In Progress')}
                              className="accent-gold h-4 w-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div>
                              <p className={`font-medium ${t.status === 'Completed' ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                {t.title}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Assigned: {t.assigned_to} • Due: {t.due_date || 'No Date'}
                              </p>
                            </div>
                          </div>
                          {currentUser.role !== 'Client' && (
                            <button
                              onClick={() => handleDeleteTask(t.id)}
                              className="p-1 text-gray-500 hover:text-rose-400 transition"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                      {activeDetails.tasks.length === 0 && (
                        <p className="text-gray-500 italic py-6 text-center">No tasks assigned.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeSubTab === 'vendors' && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Procured Vendors</h4>
                    {Array.from(new Set(activeDetails.selections.map((s: any) => s.vendor_name))).map((vName: any) => {
                      if (!vName) return null;
                      return (
                        <div key={vName} className="p-3 bg-slate-950/60 border border-white/5 rounded-xl flex items-center justify-between">
                          <span className="font-semibold text-gray-300">{vName}</span>
                          <span className="text-[10px] text-gold uppercase font-bold tracking-wider">Active Supplier</span>
                        </div>
                      );
                    })}
                    {activeDetails.selections.filter((s: any) => s.vendor_name).length === 0 && (
                      <p className="text-gray-500 italic py-6 text-center">No vendors assigned to selections.</p>
                    )}
                  </div>
                )}

                {activeSubTab === 'budget' && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">Budget utilization</h4>
                    <BudgetSummaryPanel activeDetails={activeDetails} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 italic text-xs">Select a project folder to inspect overview fields.</div>
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      {showAdd && (
        <ProjectModal
          title="Register Project Folder"
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowAdd(false)}
          onSubmit={triggerCreate}
        />
      )}

      {/* Edit Project Modal */}
      {showEdit && (
        <ProjectModal
          title="Edit Project Details"
          formData={formData}
          setFormData={setFormData}
          onClose={() => setShowEdit(null)}
          onSubmit={triggerEdit}
        />
      )}
    </div>
  );
}

// Helpers
interface ProjectModalProps {
  title: string;
  formData: any;
  setFormData: (data: any) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

function ProjectModal({ title, formData, setFormData, onClose, onSubmit }: ProjectModalProps) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="pm-title" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl w-full max-w-lg space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center">
          <h3 id="pm-title" className="text-lg font-bold text-white font-display">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white p-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold outline-none rounded-lg" 
            title="Close"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pm-name" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Project Name</label>
              <input
                id="pm-name"
                type="text" required placeholder="e.g. Rathod Penthouse"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-950 border border-white/5 px-3 py-3 rounded-xl text-white outline-none focus:border-gold min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
              />
            </div>
            <div>
              <label htmlFor="pm-client" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Client Name</label>
              <input
                id="pm-client"
                type="text" required placeholder="e.g. Sidharth Rathod"
                value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                className="w-full bg-slate-950 border border-white/5 px-3 py-3 rounded-xl text-white outline-none focus:border-gold min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pm-phone" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Phone Number</label>
              <input
                id="pm-phone"
                type="tel" placeholder="+91 99999..."
                value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-slate-950 border border-white/5 px-3 py-3 rounded-xl text-white outline-none focus:border-gold min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
              />
            </div>
            <div>
              <label htmlFor="pm-email" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Email Address</label>
              <input
                id="pm-email"
                type="email" placeholder="client@mail.com"
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-950 border border-white/5 px-3 py-3 rounded-xl text-white outline-none focus:border-gold min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pm-location" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Site Address Location</label>
              <input
                id="pm-location"
                type="text" placeholder="Thane, Mumbai"
                value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full bg-slate-950 border border-white/5 px-3 py-3 rounded-xl text-white outline-none focus:border-gold min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
              />
            </div>
            <div>
              <label htmlFor="pm-type" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Project Type</label>
              <select
                id="pm-type"
                value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-slate-950 border border-white/5 px-3 rounded-xl text-white outline-none focus:border-gold min-h-[48px] cursor-pointer focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pm-start" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Start Date</label>
              <input
                id="pm-start"
                type="date"
                value={formData.startDate || ''} onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full bg-slate-950 border border-white/5 px-3 py-3 rounded-xl text-white outline-none focus:border-gold min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
              />
            </div>
            <div>
              <label htmlFor="pm-designer" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Designer Assigned</label>
              <input
                id="pm-designer"
                type="text" placeholder="e.g. Nisha Sen"
                value={formData.assignedDesigner || ''} onChange={(e) => setFormData({...formData, assignedDesigner: e.target.value})}
                className="w-full bg-slate-950 border border-white/5 px-3 py-3 rounded-xl text-white outline-none focus:border-gold min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
              />
            </div>
          </div>
          <div>
            <label htmlFor="pm-budget" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Allocated Budget Limit (INR)</label>
            <input
              id="pm-budget"
              type="number" placeholder="45000"
              value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})}
              className="w-full bg-slate-950 border border-white/5 px-3 py-3 rounded-xl text-white outline-none focus:border-gold min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
            />
          </div>
          <div>
            <label htmlFor="pm-notes" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Notes</label>
            <textarea
              id="pm-notes"
              placeholder="Vibe preferences, spatial details..." rows={2}
              value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-slate-950 border border-white/5 px-3 py-3 rounded-xl text-white outline-none focus:border-gold min-h-[48px] focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
            />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-gold-dark to-gold text-slate-950 py-3 rounded-xl font-bold tracking-wider min-h-[48px] flex items-center justify-center transition hover:brightness-110 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-gold/50 outline-none">
            SUBMIT PROJECT FOLDER
          </button>
        </form>
      </div>
    </div>
  );
}

function BudgetSummaryPanel({ activeDetails }: { activeDetails: any }) {
  const approvedCost = activeDetails.selections
    .filter((s: any) => s.status === 'Approved')
    .reduce((sum: number, s: any) => sum + (s.quantity * s.unit_price), 0);
  const expensesCost = activeDetails.expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalSpent = approvedCost + expensesCost;
  const budgetLimit = activeDetails.project.budget;
  const pct = budgetLimit > 0 ? Math.min(Math.round((totalSpent / budgetLimit) * 100), 100) : 0;

  return (
    <div className="space-y-3">
      <div className={`p-4 border rounded-2xl ${getBudgetBorderColor(pct)} bg-slate-950/40 space-y-2`}>
        <div className="flex justify-between items-center">
          <span className="font-bold uppercase tracking-wider text-[9px] text-gray-400">Total Spend Rate</span>
          <span className={`text-xs font-bold ${getBudgetTextColor(pct)}`}>{pct}% Used</span>
        </div>
        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${getBudgetBarColor(pct)}`} style={{ width: `${pct}%` }}></div>
        </div>
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Spent: INR {totalSpent.toLocaleString()}</span>
          <span>Cap: INR {budgetLimit.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// Helpers for budget classes
function getBudgetBorderColor(pct: number) {
  if (pct > 100) return 'border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
  if (pct >= 75) return 'border-amber-500/80';
  return 'border-white/5';
}
function getBudgetTextColor(pct: number) {
  if (pct > 100) return 'text-rose-400';
  if (pct >= 75) return 'text-amber-400';
  return 'text-emerald-400';
}
function getBudgetBarColor(pct: number) {
  if (pct > 100) return 'bg-rose-500';
  if (pct >= 75) return 'bg-amber-500';
  return 'bg-gold';
}

function getBadgeStyles(status: string) {
  switch (status) {
    case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Material Selection': return 'bg-gold/10 text-gold border-gold/20';
    case 'Design Approval': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'Execution': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
}

// ==========================================
// 4. MATERIAL SELECTIONS WORKFLOW VIEW
// ==========================================
interface SelectionsViewProps {
  projectDetails: any;
  materials: Material[];
  vendors: Vendor[];
  loading: boolean;
  handleAddSelection: (data: any) => Promise<void>;
  handleUpdateSelection: (id: number, data: any) => Promise<void>;
  handleDeleteSelection: (id: number) => Promise<void>;
  handleAddRoom: (data: any) => Promise<void>;
  activeProjectId: number | null;
  projects: Project[];
  setActiveProjectId: (id: number) => void;
  currentUser: User;
}

function SelectionsView({
  projectDetails, materials, vendors, loading, handleAddSelection, handleUpdateSelection,
  handleDeleteSelection, handleAddRoom, activeProjectId, projects, setActiveProjectId,
  currentUser
}: SelectionsViewProps) {
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Tiles');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [auditSelectionId, setAuditSelectionId] = useState<number | null>(null);
  const [auditLogs, setAuditLogs] = useState<MaterialHistory[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  
  // Add Room Space Form
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [roomL, setRoomL] = useState('');
  const [roomW, setRoomW] = useState('');
  const [roomH, setRoomH] = useState('');
  const [roomNotes, setRoomNotes] = useState('');

  const categories = ['Tiles', 'Laminates', 'Paints', 'Furniture', 'Lighting', 'Hardware', 'Fabric'];

  // Sync first room
  useEffect(() => {
    if (projectDetails && projectDetails.rooms.length > 0 && !activeRoomId) {
      setActiveRoomId(projectDetails.rooms[0].id);
    }
  }, [projectDetails]);

  // Load audit selection logs drawer
  const openAuditDrawer = async (selectionId: number) => {
    setAuditSelectionId(selectionId);
    setAuditLoading(true);
    try {
      const data = await db.getSelectionHistory(selectionId);
      setAuditLogs(data);
    } catch (err) {
      console.error('Error loading selection logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  if (!activeProjectId) return <div className="text-center py-20 text-gray-400">Select a project folder in the switcher to manage material files.</div>;
  if (!projectDetails) return <div className="text-center py-20 text-gray-400">Loading selections dashboard...</div>;

  const currentRoom = projectDetails.rooms.find((r: Room) => r.id === activeRoomId);

  const roomSelections = projectDetails.selections.filter(
    (s: MaterialSelection) => s.room_id === activeRoomId && s.category === activeCategory
  );

  const triggerAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role === 'Client') return;
    if (!newRoomName) return;
    await handleAddRoom({
      name: newRoomName,
      length: parseFloat(roomL) || 0,
      width: parseFloat(roomW) || 0,
      height: parseFloat(roomH) || 0,
      notes: roomNotes
    });
    setNewRoomName(''); setRoomL(''); setRoomW(''); setRoomH(''); setRoomNotes('');
    setShowAddRoom(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">Material Selection Matrix</h2>
          <p className="text-sm text-gray-400">Assign, compare supplier costs, and approve client finishes.</p>
        </div>
        {(currentUser.role === 'Admin' || currentUser.role === 'Interior Designer') && (
          <button
            onClick={() => setShowAddRoom(true)}
            className="px-4 py-2 bg-gradient-to-r from-gold-dark to-gold text-slate-950 rounded-xl font-semibold text-sm hover:brightness-110 shadow-lg transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Add Space Room</span>
          </button>
        )}
      </div>

      {/* Room Spaces Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {projectDetails.rooms.map((r: Room) => (
          <button
            key={r.id}
            onClick={() => setActiveRoomId(r.id)}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 border transition ${
              activeRoomId === r.id
                ? 'bg-gold-dark/20 border-gold text-gold font-bold'
                : 'bg-slate-900/60 border-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Home size={14} />
            <span>{r.name}</span>
            <span className="text-[10px] opacity-75">({r.length}'x{r.width}')</span>
          </button>
        ))}
      </div>

      {currentRoom && (
        <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl text-xs space-y-1">
          <h3 className="font-bold text-gray-200">{currentRoom.name} Architectural details</h3>
          <p className="text-gray-400">
            Dimensions: Height: {currentRoom.height} ft | Area Layout Notes: {currentRoom.notes || 'None logged.'}
          </p>
        </div>
      )}

      {/* Category Selection Tabs & View Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-white/5 pb-2">
        <div className="flex flex-wrap gap-2 uppercase text-[10px] font-bold text-gray-400">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-2 px-1 border-b-2 transition ${
                activeCategory === cat ? 'border-gold text-gold font-bold' : 'border-transparent hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-slate-950 border border-white/5 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
              viewMode === 'card' ? 'bg-gold text-slate-950' : 'text-gray-400 hover:text-white'
            }`}
          >
            Card View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
              viewMode === 'table' ? 'bg-gold text-slate-950' : 'text-gray-400 hover:text-white'
            }`}
          >
            Table View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Selected Items */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Active Selections</h3>
          {roomSelections.length > 0 ? (
            viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roomSelections.map((sel: MaterialSelection) => (
                  <div key={sel.id} className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl space-y-4">
                    <div className="flex gap-4">
                      {sel.image_url ? (
                        <img
                          src={sel.image_url}
                          alt={sel.material_name}
                          className="w-16 h-16 rounded-xl flex-shrink-0 object-cover bg-slate-950 border border-white/5"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl flex-shrink-0 bg-slate-950 border border-white/5 flex items-center justify-center font-bold text-[10px] uppercase text-gray-500">
                          {sel.category?.substring(0, 4)}
                        </div>
                      )}
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-white text-sm truncate">{sel.material_name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeClass(sel.status)}`}>
                            {sel.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500">{sel.brand} • SKU: {sel.sku}</p>
                        <p className="text-xs font-semibold text-gold mt-1">INR {sel.unit_price?.toLocaleString()} / unit</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-gray-500 text-[10px] mb-1 uppercase font-bold tracking-wider">Quantity</label>
                        <input
                          type="number"
                          defaultValue={sel.quantity}
                          disabled={currentUser.role === 'Client'}
                          onBlur={(e) => handleUpdateSelection(sel.id, { quantity: parseFloat(e.target.value) || 1 })}
                          className="w-full bg-slate-950 border border-white/5 px-2 py-1.5 rounded-lg text-white disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-[10px] mb-1 uppercase font-bold tracking-wider">Supplier</label>
                        <select
                          value={sel.vendor_id || ''}
                          disabled={currentUser.role === 'Client'}
                          onChange={(e) => handleUpdateSelection(sel.id, { vendorId: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-white/5 px-2 py-1.5 rounded-lg text-white disabled:opacity-50"
                        >
                          {vendors.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-3 border-t border-white/5">
                      <span className="font-semibold text-gray-400">Total: INR {(sel.quantity * sel.unit_price!).toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openAuditDrawer(sel.id)}
                          className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-gold transition"
                          title="Audit Trail Logs"
                        >
                          <Clock size={12} />
                        </button>
                        {currentUser.role !== 'Client' && (
                          <button
                            onClick={() => handleDeleteSelection(sel.id)}
                            className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-rose-400 transition"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status Triggers */}
                    <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-bold">
                      <button
                        onClick={() => handleUpdateSelection(sel.id, { status: 'Approved' })}
                        className={`py-1.5 border rounded-lg transition ${
                          sel.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateSelection(sel.id, { status: 'Rejected' })}
                        className={`py-1.5 border rounded-lg transition ${
                          sel.status === 'Rejected' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'border-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleUpdateSelection(sel.id, { status: 'Replaced' })}
                        className={`py-1.5 border rounded-lg transition ${
                          sel.status === 'Replaced' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'border-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        Replace
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl">
                {/* Desktop/Tablet Table View */}
                <div className="overflow-x-auto hidden sm:block">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-gray-400 font-medium">
                        <th className="pb-3 pr-4">Material Details</th>
                        <th className="pb-3 pr-4">Supplier Sourced</th>
                        <th className="pb-3 pr-4">Quantity / Price</th>
                        <th className="pb-3 pr-4">Total Cost</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roomSelections.map((sel: MaterialSelection) => (
                        <tr key={sel.id} className="border-b border-white/5 hover:bg-white/5 transition duration-150">
                          <td className="py-3 pr-4">
                            <span className="font-bold text-gray-200">{sel.material_name}</span>
                            <p className="text-[10px] text-gray-500">{sel.brand}</p>
                          </td>
                          <td className="py-3 pr-4">{sel.vendor_name}</td>
                          <td className="py-3 pr-4">
                            <span>{sel.quantity} unit @ INR {sel.unit_price}</span>
                          </td>
                          <td className="py-3 pr-4 font-semibold text-gray-300">
                            INR {(sel.quantity * sel.unit_price!).toLocaleString()}
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeClass(sel.status)}`}>
                              {sel.status}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-2">
                            <button
                              onClick={() => openAuditDrawer(sel.id)}
                              className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-gold transition"
                            >
                              <Clock size={12} />
                            </button>
                            {currentUser.role !== 'Client' && (
                              <button
                                onClick={() => handleDeleteSelection(sel.id)}
                                className="p-1.5 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-rose-400 transition"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card Stack View */}
                <div className="space-y-3 sm:hidden">
                  {roomSelections.map((sel: MaterialSelection) => (
                    <div key={sel.id} className="p-4 bg-slate-950/40 border border-white/5 rounded-xl space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-bold text-gray-200">{sel.material_name}</span>
                          <p className="text-[10px] text-gray-500">{sel.brand}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeClass(sel.status)}`}>
                          {sel.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-400 space-y-1.5 pt-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Supplier:</span>
                          <span className="text-white font-medium">{sel.vendor_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Quantity / Price:</span>
                          <span className="text-white">{sel.quantity} unit @ INR {sel.unit_price}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-1">
                          <span className="text-gray-500 font-semibold">Total Cost:</span>
                          <span className="text-gold font-bold">INR {(sel.quantity * sel.unit_price!).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => openAuditDrawer(sel.id)}
                          className="p-2 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-gold transition min-h-[36px] flex items-center justify-center"
                        >
                          <Clock size={12} />
                        </button>
                        {currentUser.role !== 'Client' && (
                          <button
                            onClick={() => handleDeleteSelection(sel.id)}
                            className="p-2 bg-slate-950 border border-white/5 rounded-lg text-gray-400 hover:text-rose-400 transition min-h-[36px] flex items-center justify-center"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <p className="text-gray-500 italic py-10 bg-slate-900/10 border border-dashed border-white/5 rounded-2xl text-center">No material finishes added to this space yet. Browse the catalogue on the right.</p>
          )}
        </div>

        {/* Catalog Browser */}
        <div>
          <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-4">Supplier Catalogue</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {materials
              .filter(m => m.category === activeCategory)
              .map(mat => (
                <div key={mat.id} className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="flex gap-3 items-start">
                    {mat.image_url && (
                      <img
                        src={mat.image_url}
                        alt={mat.name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-950 border border-white/5 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-200 text-xs truncate" title={mat.name}>{mat.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{mat.brand} • Sourced by {mat.vendor_name || 'Direct'}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gold">INR {mat.unit_price} / unit</span>
                  </div>
                  {currentUser.role !== 'Client' && (
                    <button
                      onClick={() => handleAddSelection({ roomId: activeRoomId, materialId: mat.id, vendorId: mat.vendor_id, quantity: 1, notes: 'Initial intake selection' })}
                      className="w-full py-2 bg-slate-950 border border-white/5 text-gray-300 hover:bg-gold hover:text-slate-950 transition-all rounded-xl text-xs font-semibold"
                      disabled={!activeRoomId}
                    >
                      + Map to {currentRoom ? currentRoom.name : 'Space'}
                    </button>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Audit Drawer popup */}
      {auditSelectionId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-white/10 p-6 h-full flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-md font-bold text-white font-display">Selection Audit Trail</h3>
              <button onClick={() => setAuditSelectionId(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-xs">
              {auditLoading ? (
                <div className="text-center py-20 text-gray-500">Syncing audit records...</div>
              ) : auditLogs.length > 0 ? (
                auditLogs.map((log, i) => (
                  <div key={log.id} className="relative pl-6 border-l border-white/10 pb-4">
                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-gold border border-slate-900"></div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-semibold text-gold">{log.user_name}</span>
                        <span className="text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-300">{log.notes}</p>
                      <div className="flex gap-2 items-center text-[10px] font-bold">
                        <span className="text-rose-400 uppercase">{log.previous_status}</span>
                        <ChevronRight size={10} className="text-gray-500" />
                        <span className="text-emerald-400 uppercase">{log.new_status}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-20">No status audit entries mapped.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoom && (
        <div role="dialog" aria-modal="true" aria-labelledby="arm-title" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl w-full max-w-sm space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 id="arm-title" className="text-lg font-bold text-white font-display">Configure Room Space</h3>
              <button 
                onClick={() => setShowAddRoom(false)} 
                className="text-gray-400 hover:text-white p-1 focus-visible:ring-2 focus-visible:ring-gold/50 rounded-lg outline-none"
                aria-label="Close add room space modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={triggerAddRoom} className="space-y-4 text-xs">
              <div>
                <label htmlFor="arm-name" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Space Name</label>
                <input
                  id="arm-name"
                  type="text" required placeholder="e.g. Master Bedroom"
                  value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 p-3 rounded-xl text-white outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="arm-length" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[9px]">Length (ft)</label>
                  <input
                    id="arm-length"
                    type="number" placeholder="14"
                    value={roomL} onChange={(e) => setRoomL(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 p-3 rounded-xl text-white outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="arm-width" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[9px]">Width (ft)</label>
                  <input
                    id="arm-width"
                    type="number" placeholder="12"
                    value={roomW} onChange={(e) => setRoomW(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 p-3 rounded-xl text-white outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="arm-height" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[9px]">Height (ft)</label>
                  <input
                    id="arm-height"
                    type="number" placeholder="10"
                    value={roomH} onChange={(e) => setRoomH(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 p-3 rounded-xl text-white outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="arm-notes" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Space Notes</label>
                <textarea
                  id="arm-notes"
                  placeholder="Wiring parameters, tiling area specs..." rows={2}
                  value={roomNotes} onChange={(e) => setRoomNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 p-3 rounded-xl text-white outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
                />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-gold-dark to-gold text-slate-950 p-3 rounded-xl font-bold tracking-wider min-h-[48px] flex items-center justify-center transition hover:brightness-110 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-gold/50 outline-none">
                CREATE ROOM SPACE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getBadgeClass(status: string) {
  switch (status) {
    case 'Approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    case 'Replaced': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'Selected': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
}

// ==========================================
// 5. VENDORS VIEW & COMPARATIVE ANALYZER
// ==========================================
interface VendorsViewProps {
  vendors: Vendor[];
  materials: Material[];
  projectDetails: any;
}

function VendorsView({ vendors, materials, projectDetails }: VendorsViewProps) {
  const [activeCompareCategory, setActiveCompareCategory] = useState<string>('Tiles');

  const categories = ['Tiles', 'Laminates', 'Paints', 'Furniture', 'Lighting', 'Hardware', 'Fabric'];

  // Sourcing rating matching
  const categoryVendors = vendors.filter(v => v.category === activeCompareCategory);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-display">Vendor Comparison Dashboard</h2>
        <p className="text-sm text-gray-400">Match suppliers, inspect rates, and run side-by-side performance checks.</p>
      </div>

      {/* Category selector filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCompareCategory(cat)}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold transition border ${
              activeCompareCategory === cat
                ? 'bg-gold-dark/20 border-gold text-gold font-bold'
                : 'bg-slate-900/60 border-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {cat} Sourcing
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Sourcing Comparisons */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Side-by-Side Sourcing Matrix</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryVendors.map(v => {
              // Calculate avg material price in this category for comparison
              const catMaterials = materials.filter(m => m.vendor_id === v.id && m.category === activeCompareCategory);
              const avgPrice = catMaterials.length > 0
                ? Math.round(catMaterials.reduce((sum, m) => sum + m.unit_price, 0) / catMaterials.length)
                : 'Direct Sourced';

              return (
                <div key={v.id} className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-sm">{v.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{v.contact_name} • Contact Sourcing</p>
                    </div>
                    <div className="flex items-center gap-1 bg-gold/10 px-2 py-0.5 rounded-lg border border-gold/20 text-gold text-[10px] font-bold">
                      <Star size={10} className="fill-gold" />
                      <span>{v.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-gray-500">Sourcing Category</span>
                      <span className="text-gray-300 font-medium">{v.category}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-white/5">
                      <span className="text-gray-500">Average Catalog Price</span>
                      <span className="text-gold font-bold">{typeof avgPrice === 'number' ? `INR ${avgPrice.toLocaleString()}` : avgPrice}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Sourcing Address</span>
                      <span className="text-gray-300 text-[10px] text-right truncate max-w-[150px]">{v.address}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-[10px] text-gray-500 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1"><Phone size={10} /> {v.phone}</span>
                    <span className="flex items-center gap-1"><Mail size={10} /> {v.email}</span>
                  </div>
                </div>
              );
            })}
            {categoryVendors.length === 0 && (
              <p className="text-xs text-gray-500 italic py-10 text-center col-span-2">No vendors mapped under this category.</p>
            )}
          </div>
        </div>

        {/* Directory List Sourcing Surcharges */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-4">
          <h3 className="text-md font-semibold text-white">Sourced Finishes Registry</h3>
          {projectDetails ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 text-xs">
              <p className="text-[10px] text-gray-400">Materials sourced for: <strong>{projectDetails.project.name}</strong></p>
              {projectDetails.selections.map((s: any) => (
                <div key={s.id} className="p-3 bg-slate-950/60 border border-white/5 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-200">{s.material_name}</span>
                    <span className="text-[10px] text-gold font-semibold">{s.vendor_name || 'Direct'}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Quantity: {s.quantity} units</span>
                    <span>Cost: INR {(s.quantity * s.unit_price).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {projectDetails.selections.length === 0 && (
                <p className="text-xs text-gray-500 italic py-10 text-center">No mapped sourcing details.</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic py-10 text-center">Select active project to inspect sourced finishes.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. BUDGET VIEW COMPONENT
// ==========================================
interface BudgetViewProps {
  projectDetails: any;
  projects: Project[];
  activeProjectId: number | null;
  setActiveProjectId: (id: number) => void;
  handleAddExpense: (data: any) => Promise<void>;
  loading: boolean;
  currentUser: User;
}

function BudgetView({ projectDetails, projects, activeProjectId, setActiveProjectId, handleAddExpense, loading, currentUser }: BudgetViewProps) {
  const [expenseCat, setExpenseCat] = useState('');
  const [expenseAmt, setExpenseAmt] = useState('');
  const [expenseNote, setExpenseNote] = useState('');

  if (!activeProjectId) return <div className="text-center py-20 text-gray-400">Select active project to audit budgets.</div>;
  if (!projectDetails) return <div className="text-center py-20 text-gray-400">Loading financials...</div>;

  const triggerAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role === 'Client') return;
    if (!expenseCat || !expenseAmt) return;
    await handleAddExpense({
      category: expenseCat,
      amount: parseFloat(expenseAmt) || 0,
      notes: expenseNote
    });
    setExpenseCat(''); setExpenseAmt(''); setExpenseNote('');
    alert('Sourcing expense logged successfully.');
  };

  const approvedSelectionsCost = projectDetails.selections
    .filter((s: any) => s.status === 'Approved')
    .reduce((sum: number, s: any) => sum + (s.quantity * s.unit_price), 0);
  
  const expensesCost = projectDetails.expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
  const totalSpent = approvedSelectionsCost + expensesCost;
  const totalBudget = projectDetails.project.budget;
  const remainingBudget = totalBudget - totalSpent;
  const utilizationPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-display">Budget Tracking & Cost Ledger</h2>
        <p className="text-sm text-gray-400">Run audit controls, log direct expenses, and configure alerts for: <strong className="text-gold">{projectDetails.project.name}</strong></p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Total Budget Cap</span>
          <p className="text-xl font-bold text-white font-display">INR {totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Total Cost Sourced</span>
          <p className="text-xl font-bold text-white font-display">INR {totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Remaining Balance</span>
          <p className={`text-xl font-bold font-display ${remainingBudget < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            INR {remainingBudget.toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Utilization</span>
          <p className={`text-xl font-bold font-display ${getBudgetTextColor(utilizationPct)}`}>{utilizationPct}%</p>
        </div>
      </div>

      {/* Warning Alert banner */}
      {utilizationPct >= 75 && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 text-xs ${
          utilizationPct > 100 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse' 
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}>
          <AlertTriangle size={16} />
          <span>
            {utilizationPct > 100 
              ? 'WARNING: Sourced costs exceed allocated contract budget cap! Take immediate corrective action.'
              : 'CAUTION: Budget utilization rate has reached warning levels.'}
          </span>
        </div>
      )}

      {/* Spend chart visual & direct expense logger split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl lg:col-span-2 space-y-6">
          <h3 className="text-md font-semibold text-white">Cost Utilization Analysis</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Approved Finishes (INR {approvedSelectionsCost.toLocaleString()})</span>
                <span className="font-semibold">{totalBudget > 0 ? Math.round((approvedSelectionsCost / totalBudget) * 100) : 0}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-gold rounded-full" style={{ width: `${totalBudget > 0 ? (approvedSelectionsCost / totalBudget) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Site/Labour Expenses (INR {expensesCost.toLocaleString()})</span>
                <span className="font-semibold">{totalBudget > 0 ? Math.round((expensesCost / totalBudget) * 100) : 0}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${totalBudget > 0 ? (expensesCost / totalBudget) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>Remaining Limit Surcharges (INR {remainingBudget > 0 ? remainingBudget.toLocaleString() : 0})</span>
                <span className="font-semibold">{totalBudget > 0 ? Math.max(0, Math.round((remainingBudget / totalBudget) * 100)) : 0}%</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${totalBudget > 0 ? Math.max(0, (remainingBudget / totalBudget) * 100) : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Expense logger or read-only card */}
        {currentUser.role === 'Client' ? (
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-md font-semibold text-white font-display">Direct Expenses Log</h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-slate-950 text-gray-500 border-white/5">
                Staff Only
              </span>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 text-xs">
              {projectDetails.expenses.map((e: any) => (
                <div key={e.id} className="p-3 bg-slate-950/60 border border-white/5 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-200">{e.category}</span>
                    <span className="text-gold font-semibold">INR {e.amount.toLocaleString()}</span>
                  </div>
                  {e.notes && <p className="text-[10px] text-gray-400">{e.notes}</p>}
                  <p className="text-[9px] text-gray-500">{new Date(e.date || Date.now()).toLocaleDateString()}</p>
                </div>
              ))}
              {projectDetails.expenses.length === 0 && (
                <p className="text-xs text-gray-500 italic py-10 text-center">No direct expenses logged.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="text-md font-semibold text-white">Log Site Expense</h3>
            <form onSubmit={triggerAddExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Category</label>
                <input
                  type="text" required placeholder="e.g. Masonry Labour, Freight"
                  value={expenseCat} onChange={(e) => setExpenseCat(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 p-3 rounded-xl text-white outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Cost (INR)</label>
                <input
                  type="number" required placeholder="e.g. 1500"
                  value={expenseAmt} onChange={(e) => setExpenseAmt(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 p-3 rounded-xl text-white outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Reference Notes</label>
                <input
                  type="text" placeholder="Detail notes..."
                  value={expenseNote} onChange={(e) => setExpenseNote(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 p-3 rounded-xl text-white outline-none focus:border-gold"
                />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-gold-dark to-gold text-slate-950 p-3 rounded-xl font-bold tracking-wider">
                LOG DIRECT EXPENSE
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 7. REPORTS VIEW
// ==========================================
interface ReportsViewProps {
  projects: Project[];
  activeProjectId: number | null;
  setActiveProjectId: (id: number) => void;
}

function ReportsView({ projects, activeProjectId, setActiveProjectId }: ReportsViewProps) {
  const [reportTab, setReportTab] = useState<'material' | 'vendor' | 'budget'>('material');
  const [materialReportData, setMaterialReportData] = useState<any[]>([]);
  const [vendorReportData, setVendorReportData] = useState<any[]>([]);
  const [budgetReportData, setBudgetReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, [activeProjectId, reportTab]);

  const loadReports = async () => {
    setLoading(true);
    try {
      if (reportTab === 'material') {
        const query = activeProjectId ? `?projectId=${activeProjectId}` : '';
        const data = await db.getMaterialReport(query);
        setMaterialReportData(data);
      } else if (reportTab === 'vendor') {
        const data = await db.getVendorReport();
        setVendorReportData(data);
      } else if (reportTab === 'budget') {
        const data = await db.getBudgetReport();
        setBudgetReportData(data);
      }
    } catch (err) {
      console.error('Error loading reports details:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  const triggerExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `GlorySimon_Report_${reportTab}.csv`;

    if (reportTab === 'material') {
      headers = ['Project Name', 'Room Space', 'Material Name', 'Category', 'Sourcing Vendor', 'Quantity', 'Unit Price', 'Total Sourced Cost', 'Status'];
      rows = materialReportData.map(r => [
        r.project_name, r.room_name || 'N/A', r.material_name, r.category, r.vendor_name || 'Direct',
        r.quantity.toString(), r.unit_price.toString(), r.total_cost.toString(), r.status
      ]);
    } else if (reportTab === 'vendor') {
      headers = ['Sourcing Vendor Name', 'Sourcing Category', 'Rating', 'Projects Sourced', 'Materials Sourced', 'Total Sourced cost'];
      rows = vendorReportData.map(r => [
        r.vendor_name, r.category, r.rating.toString(), r.projects_sourced.toString(),
        r.materials_sourced.toString(), r.total_sourced_cost ? r.total_sourced_cost.toString() : '0'
      ]);
    } else if (reportTab === 'budget') {
      headers = ['Project Name', 'Total Budget Limit', 'Approved Materials Cost', 'Site Direct Expenses', 'Gross Sourced Costs', 'Remaining Balance', 'Utilization Rate'];
      rows = budgetReportData.map(r => [
        r.project_name, r.total_budget.toString(), r.approved_materials_cost.toString(),
        r.total_expenses_cost.toString(), r.total_spent.toString(), r.remaining_budget.toString(), `${r.utilization_pct}%`
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerExportPDF = () => {
    alert('Sourcing PDF export simulation initiated. Sourced document link dispatched to downloads.');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">Sourcing Reports Generator</h2>
          <p className="text-sm text-gray-400">Generate, print, and export CSV/PDF reports.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={triggerPrint}
            className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-gray-400 hover:text-white transition flex items-center gap-2 text-xs font-semibold"
            title="Print Report"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>
          <button
            onClick={triggerExportCSV}
            className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-gray-400 hover:text-white transition flex items-center gap-2 text-xs font-semibold"
            title="Export CSV"
          >
            <FileSpreadsheet size={14} />
            <span>CSV</span>
          </button>
          <button
            onClick={triggerExportPDF}
            className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-gold hover:text-white transition flex items-center gap-2 text-xs font-semibold"
            title="Export PDF"
          >
            <Download size={14} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Reports Internal Tabs */}
      <div className="flex justify-between items-center border-b border-white/5 pb-2 print:hidden">
        <div className="flex gap-2 uppercase text-[10px] font-bold text-gray-400">
          <button
            onClick={() => setReportTab('material')}
            className={`pb-2 px-1 border-b-2 transition ${
              reportTab === 'material' ? 'border-gold text-gold font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Material selection Report
          </button>
          <button
            onClick={() => setReportTab('vendor')}
            className={`pb-2 px-1 border-b-2 transition ${
              reportTab === 'vendor' ? 'border-gold text-gold font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Vendor Sourcing Report
          </button>
          <button
            onClick={() => setReportTab('budget')}
            className={`pb-2 px-1 border-b-2 transition ${
              reportTab === 'budget' ? 'border-gold text-gold font-bold' : 'border-transparent hover:text-white'
            }`}
          >
            Project budget Report
          </button>
        </div>

        {reportTab === 'material' && (
          <div className="flex items-center gap-2 text-xs bg-slate-950 border border-white/5 px-3 py-1.5 rounded-xl">
            <span className="text-gray-500">Filter Project:</span>
            <select
              value={activeProjectId || ''}
              onChange={(e) => setActiveProjectId(Number(e.target.value))}
              className="bg-transparent text-gray-300 outline-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-gray-300">All Project Selections</option>
              {projects.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-gray-300">{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl print:bg-white print:text-slate-950 print:border-none">
        {/* Printable header info */}
        <div className="hidden print:block mb-8 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 font-display">Glory Simon Interiors</h1>
          <p className="text-sm text-slate-700">Project Material Sourcing Report • Generated on {new Date().toLocaleDateString()}</p>
          <hr className="border-slate-300" />
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 text-xs">Compiling records report...</div>
        ) : (
          <div className="overflow-x-auto">
            {reportTab === 'material' && (
              <table className="w-full text-left text-xs print:text-slate-950">
                <thead>
                  <tr className="border-b border-white/5 print:border-slate-200 text-gray-400 print:text-slate-700 font-medium">
                    <th className="pb-3 pr-4">Project / Room</th>
                    <th className="pb-3 pr-4">Material Name</th>
                    <th className="pb-3 pr-4">Sourcing Category</th>
                    <th className="pb-3 pr-4">Vendor</th>
                    <th className="pb-3 pr-4">Units</th>
                    <th className="pb-3 pr-4">Unit Cost</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 text-right">Sourced Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {materialReportData.map(r => (
                    <tr key={r.id} className="border-b border-white/5 print:border-slate-100 hover:bg-white/5 transition duration-150">
                      <td className="py-3 pr-4">
                        <p className="font-bold text-gray-200 print:text-slate-950">{r.project_name}</p>
                        <p className="text-[10px] text-gray-500 print:text-slate-600">{r.room_name || 'N/A'}</p>
                      </td>
                      <td className="py-3 pr-4 text-gray-300 print:text-slate-950 font-medium">{r.material_name}</td>
                      <td className="py-3 pr-4 text-gray-400 print:text-slate-600">{r.category}</td>
                      <td className="py-3 pr-4 text-gray-300 print:text-slate-950">{r.vendor_name || 'Direct'}</td>
                      <td className="py-3 pr-4 text-gray-400 print:text-slate-600">{r.quantity} units</td>
                      <td className="py-3 pr-4 text-gray-400 print:text-slate-600">INR {r.unit_price}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeClass(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-gray-200 print:text-slate-950">
                        INR {r.total_cost.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {materialReportData.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-20 text-gray-500 italic">No selections logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {reportTab === 'vendor' && (
              <table className="w-full text-left text-xs print:text-slate-950">
                <thead>
                  <tr className="border-b border-white/5 print:border-slate-200 text-gray-400 print:text-slate-700 font-medium">
                    <th className="pb-3 pr-4">Sourcing Vendor Name</th>
                    <th className="pb-3 pr-4">Category Sourced</th>
                    <th className="pb-3 pr-4">Sourcing Rating</th>
                    <th className="pb-3 pr-4">Projects Supplied</th>
                    <th className="pb-3 pr-4">Materials Supplied</th>
                    <th className="pb-3 text-right">Gross Sourced Costs</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorReportData.map(v => (
                    <tr key={v.vendor_name} className="border-b border-white/5 print:border-slate-100 hover:bg-white/5 transition duration-150">
                      <td className="py-3 pr-4 font-bold text-gray-200 print:text-slate-950">{v.vendor_name}</td>
                      <td className="py-3 pr-4 text-gray-400 print:text-slate-600">{v.category}</td>
                      <td className="py-3 pr-4 font-medium text-gold print:text-slate-700">{v.rating} / 5.0</td>
                      <td className="py-3 pr-4 text-gray-300 print:text-slate-950">{v.projects_sourced} Projects</td>
                      <td className="py-3 pr-4 text-gray-300 print:text-slate-950">{v.materials_sourced} items</td>
                      <td className="py-3 text-right font-bold text-gold print:text-slate-950">
                        INR {(v.total_sourced_cost || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportTab === 'budget' && (
              <table className="w-full text-left text-xs print:text-slate-950">
                <thead>
                  <tr className="border-b border-white/5 print:border-slate-200 text-gray-400 print:text-slate-700 font-medium">
                    <th className="pb-3 pr-4">Project Name</th>
                    <th className="pb-3 pr-4">Total Budget Cap</th>
                    <th className="pb-3 pr-4">Approved Finishes</th>
                    <th className="pb-3 pr-4">Site Expenses</th>
                    <th className="pb-3 pr-4">Remaining Balance</th>
                    <th className="pb-3 text-right">Utilization Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetReportData.map(b => (
                    <tr key={b.project_name} className="border-b border-white/5 print:border-slate-100 hover:bg-white/5 transition duration-150">
                      <td className="py-3 pr-4 font-bold text-gray-200 print:text-slate-950">{b.project_name}</td>
                      <td className="py-3 pr-4 text-gray-400 print:text-slate-600">INR {b.total_budget.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-gray-300 print:text-slate-950">INR {b.approved_materials_cost.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-gray-300 print:text-slate-950">INR {b.total_expenses_cost.toLocaleString()}</td>
                      <td className={`py-3 pr-4 font-bold ${b.remaining_budget < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        INR {b.remaining_budget.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-bold text-gray-200 print:text-slate-950">
                        {b.utilization_pct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 8. SETTINGS VIEW
// ==========================================
interface SettingsViewProps {
  currentUser: User;
  updateUserProfile: (name: string, email: string) => void;
  brandTheme: string;
  setBrandTheme: (theme: string) => void;
}

function SettingsView({ currentUser, updateUserProfile, brandTheme, setBrandTheme }: SettingsViewProps) {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [saved, setSaved] = useState(false);

  const { themeMode, setThemeMode, backgroundStyle, setBackgroundStyle } = useAppStore();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(name, email);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-display">System Settings & Profile</h2>
        <p className="text-sm text-gray-400">Configure your workspace variables, audit profiles, and brand themes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Profile Card Form */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-6">
          <h3 className="text-md font-semibold text-white font-display">User Profile Details</h3>
          
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label htmlFor="settings-name" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Full Name</label>
              <input
                id="settings-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 p-3 rounded-xl text-white outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
              />
            </div>

            <div>
              <label htmlFor="settings-email" className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Email Address</label>
              <input
                id="settings-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/5 p-3 rounded-xl text-white outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:border-gold transition-all"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">System Access Role (Read-Only)</label>
              <div className="w-full bg-slate-950/50 border border-white/5 p-3 rounded-xl text-gold font-bold">
                {currentUser.role}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-4">
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-br from-gold-dark to-gold text-slate-950 font-bold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-gold/50 outline-none"
              >
                Save Changes
              </button>
              <AnimatePresence>
                {saved && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-emerald-400 font-semibold"
                  >
                    Profile saved!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>

        {/* Appearance Settings */}
        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-6">
          <h3 className="text-md font-semibold text-white font-display">Appearance Settings</h3>
          
          <div className="space-y-6 text-xs">
            {/* Background Style Selector (Preview Cards) */}
            <div className="space-y-3">
              <label className="block text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Luxury Background Texture</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'villa', label: 'Luxury Villa', src: '/assets/backgrounds/luxury_villa.png' },
                  { id: 'living-room', label: 'Modern Living Room', src: '/assets/backgrounds/modern_living_room.png' },
                  { id: 'office', label: 'Premium Office', src: '/assets/backgrounds/premium_office.png' },
                  { id: 'architectural', label: 'Minimal Arch', src: '/assets/backgrounds/minimal_architectural.png' }
                ].map(option => {
                  const selected = backgroundStyle === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setBackgroundStyle(option.id as any)}
                      className={`group relative flex flex-col text-left rounded-xl overflow-hidden border transition-all outline-none ${
                        selected 
                          ? 'border-gold ring-2 ring-gold/30 bg-slate-950/40' 
                          : 'border-white/5 hover:border-white/20 bg-slate-950/20'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-950 relative">
                        <img 
                          src={option.src} 
                          alt={option.label}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
                        />
                        {/* Overlay to darken slightly */}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                        {/* Selected Indicator */}
                        {selected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold text-slate-950 flex items-center justify-center shadow-lg border border-white/25">
                            <svg className="w-3.5 h-3.5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Label */}
                      <div className="p-2.5">
                        <span className={`text-[10px] font-bold block truncate transition-colors ${
                          selected ? 'text-gold' : 'text-gray-400 group-hover:text-white'
                        }`}>
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-[10px] text-gray-500 leading-relaxed space-y-1">
              <p>Background selections apply instantly and persist across refresh actions.</p>
              <p>Parallax scrolling is optimized for desktop viewports and disabled on mobile devices.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


