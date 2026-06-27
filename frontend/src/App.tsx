import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
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
  Bell,
  Sun,
  Moon,
  User as UserIcon
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
    if (themeMode === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [themeMode]);

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
  const navigate = useNavigate();
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
    backgroundStyle,
    themeMode,
    setThemeMode,
    logout,
    showDetailsPopup,
    setShowDetailsPopup,
    projectDetails
  } = useAppStore();

  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

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
  const pageTitle = matchedItem ? matchedItem.label : 'Glory Simon Interiors';

  return (
    <div className="flex min-h-screen bg-transparent text-[#4B4B4B] dark:text-[#F8FAFC] font-sans selection:bg-[#A8B89A]/20 selection:text-current relative">
      {/* Navigation Sidebar (Desktop + Mobile slide-out drawer) */}
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Sticky Header Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 bg-white/40 dark:bg-[#0B0F19]/40 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-4 md:px-6 lg:px-8 z-40 backdrop-blur-md transition-all duration-300 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-[#7D7D7D] dark:text-[#94A3B8] hover:text-[#4B4B4B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30 rounded-xl transition duration-150 focus-visible:ring-2 focus-visible:ring-[#A8B89A]/50 outline-none"
            title="Open Menu"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          
          <h2 className="text-sm md:text-base font-semibold text-[#4B4B4B] dark:text-[#F8FAFC] font-display tracking-wide truncate max-w-[240px] md:max-w-md">
            {pageTitle}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 text-[#7D7D7D] dark:text-[#94A3B8] hover:text-[#4B4B4B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30 rounded-xl transition duration-150 focus-visible:ring-2 focus-visible:ring-[#A8B89A]/50 outline-none cursor-pointer"
            title="System Alerts"
            aria-label="View notifications"
          >
            <Bell size={18} />
          </button>

          <button
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            className="p-2 text-[#7D7D7D] dark:text-[#94A3B8] hover:text-[#4B4B4B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30 rounded-xl transition duration-150 focus-visible:ring-2 focus-visible:ring-[#A8B89A]/50 outline-none"
            title={themeMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme mode"
          >
            {themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
 
          {/* Top-Right GA Avatar Dropdown Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full bg-[#A8B89A] text-white flex items-center justify-center font-bold text-xs hover:brightness-105 active:scale-[0.95] transition-all focus:outline-none cursor-pointer"
              title="Account Menu"
              aria-haspopup="true"
              aria-expanded={showProfileMenu}
            >
              {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-2 rounded-2xl shadow-xl z-50 text-left"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                    <p className="text-[11px] font-bold text-[#4B4B4B] dark:text-[#F8FAFC] truncate leading-tight">{currentUser.name}</p>
                    <p className="text-[9px] text-[#A8B89A] font-semibold uppercase tracking-wider mt-0.5 leading-tight">{currentUser.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] text-[#4B4B4B] dark:text-[#E5E7EB] hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left font-semibold transition"
                  >
                    <UserIcon size={12} className="text-[#A8B89A]" />
                    View Profile Info
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] text-[#4B4B4B] dark:text-[#E5E7EB] hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left font-semibold transition"
                  >
                    <Settings size={12} className="text-[#A8B89A]" />
                    Profile Settings
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800/80 my-1.5" />
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] text-[#C89A9A] hover:bg-rose-500/5 text-left font-semibold transition"
                  >
                    <Trash2 size={12} className="text-[#C89A9A]" />
                    Logout Session
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 min-h-screen ml-0 lg:ml-64 p-4 md:p-6 lg:p-8 pt-24 lg:pt-24 overflow-y-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            className="w-full max-w-6xl mx-auto pb-12"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Profile Detail Modal Overlay */}
      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm border border-slate-200 dark:border-slate-800/80 p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-[24px] shadow-2xl relative text-left"
            >
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
              
              <div className="flex flex-col items-center text-center space-y-3 mt-2">
                <div className="w-16 h-16 rounded-full bg-[#A8B89A] text-white flex items-center justify-center font-bold text-lg shadow-xl shadow-[#A8B89A]/20">
                  {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">{currentUser.name}</h2>
                  <p className="text-xs text-[#A8B89A] font-semibold uppercase tracking-wider mt-0.5">{currentUser.role}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/60 my-4 pt-4 space-y-3 text-xs">
                <div>
                  <span className="block text-slate-400 uppercase tracking-widest font-bold text-[9px] mb-1">Email Address</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">{currentUser.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 uppercase tracking-widest font-bold text-[9px] mb-1">Permissions Profile</span>
                  <span className="text-slate-600 dark:text-slate-350">{getRolePermissionsDesc(currentUser.role)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowProfileModal(false);
                  navigate('/settings');
                }}
                className="w-full py-2.5 bg-[#A8B89A] hover:bg-[#96A689] text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all text-center block"
              >
                Edit Profile Settings
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Project Details Modal Pop-up */}
      <AnimatePresence>
        {showDetailsPopup && projectDetails && activeProjectId === projectDetails.project.id && (
          <ProjectDetailsModal />
        )}
      </AnimatePresence>
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
      procurements={store.procurements}
      setShowDetailsPopup={store.setShowDetailsPopup}
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
      showDetailsPopup={store.showDetailsPopup}
      setShowDetailsPopup={store.setShowDetailsPopup}
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
    currentUser
  } = useAppStore();

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const projectDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setProjectDropdownOpen(false);
      }
    };
    if (projectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [projectDropdownOpen]);

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
        return allMenuItems.filter(item => ['dashboard', 'projects', 'selections', 'approval', 'site-visits', 'notifications', 'settings'].includes(item.id));
      case 'Project Manager':
        return allMenuItems.filter(item => ['dashboard', 'projects', 'clients', 'budget', 'installation', 'reports', 'notifications', 'settings'].includes(item.id));
      case 'Vendor Coordinator':
        return allMenuItems.filter(item => ['dashboard', 'vendors', 'procurement', 'notifications', 'settings'].includes(item.id));
      default: // Client or other
        return allMenuItems.filter(item => ['dashboard', 'approval', 'quotes', 'notifications', 'settings'].includes(item.id));
    }
  };

  const menuItems = getFilteredMenuItems();

  const renderInnerContent = (isDrawer = false) => (
    <>
      <div className="space-y-6 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center justify-between mb-6 px-2">
            <button
              onClick={() => {
                navigate('/dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (setMobileMenuOpen) setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 text-left focus:outline-none cursor-pointer hover:opacity-95 active:scale-[0.99] transition-all bg-transparent border-none p-0"
            >
              <div className="w-9 h-9 bg-[#A8B89A] rounded-xl flex items-center justify-center font-bold text-white text-md shadow-sm shrink-0">
                GS
              </div>
              <div>
                <h1 className="text-md font-bold tracking-wide text-[#4B4B4B] dark:text-[#F8FAFC] font-display leading-tight">Glory Simon</h1>
                <p className="text-[9px] text-[#A8B89A] font-bold tracking-widest uppercase mt-0.5">Interiors</p>
              </div>
            </button>
            {isDrawer && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg transition"
                title="Close Menu"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Compact User Profile Menu Card (Static Div) */}
          <div className="mb-6 px-1 relative">
            <div className="w-full flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 p-3 rounded-2xl select-none">
              <div className="w-8 h-8 rounded-full bg-[#A8B89A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[11px] font-bold text-[#4B4B4B] dark:text-[#F8FAFC] truncate leading-tight">{currentUser.name}</p>
                <p className="text-[9px] text-[#A8B89A] font-semibold uppercase tracking-wider leading-tight mt-0.5">{currentUser.role}</p>
              </div>
            </div>
          </div>

          {/* Quick Project Switcher (Hidden for Vendor Coordinator) */}
          {currentUser.role !== 'Vendor Coordinator' && (
            <div className="mb-6 px-1 relative" ref={projectDropdownRef}>
              <label className="text-[10px] uppercase tracking-wider text-[#7D7D7D] dark:text-[#94A3B8] font-bold block mb-2 px-1">
                Active Workspace
              </label>
              <button
                type="button"
                onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 px-3 py-2 rounded-[24px] focus:outline-none transition-all duration-200 hover:border-[#A8B89A] hover:bg-slate-100/50 dark:hover:bg-slate-950/50 shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {(() => {
                    const activeProj = projects.find(p => p.id === activeProjectId);
                    return activeProj?.image_url ? (
                      <img
                        src={activeProj.image_url}
                        alt=""
                        className="w-6 h-6 rounded-[8px] object-cover shrink-0 border border-[#A8B89A]/20"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-[8px] bg-[#A8B89A]/10 flex items-center justify-center shrink-0">
                        <FolderOpen size={12} className="text-[#A8B89A]" />
                      </div>
                    );
                  })()}
                  <span className="text-xs text-[#4B4B4B] dark:text-[#E5E7EB] font-bold truncate">
                    {projects.find(p => p.id === activeProjectId)?.name || 'Select Project'}
                  </span>
                </div>
                <ChevronDown size={12} className={`text-[#7D7D7D] dark:text-[#94A3B8] transition-transform duration-200 shrink-0 ${projectDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {projectDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1 right-1 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-[#A8B89A]/20 dark:border-[#A8B89A]/30 rounded-[20px] shadow-lg z-50 py-1.5 max-h-[260px] overflow-y-auto"
                  >
                    {projects.map(p => {
                      const isSelected = p.id === activeProjectId;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setActiveProjectId(p.id);
                            setProjectDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all duration-300 ease-in-out flex items-center gap-3 border-none ${
                            isSelected
                              ? 'bg-[#A8B89A]/10 text-[#A8B89A] font-bold'
                              : 'text-[#4B4B4B] dark:text-[#E5E7EB] hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-100 dark:border-slate-800"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#A8B89A]/10 flex items-center justify-center shrink-0">
                              <FolderOpen size={14} className="text-[#A8B89A]" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate leading-snug">{p.name}</p>
                            <p className="text-[9px] text-[#7D7D7D] dark:text-[#94A3B8] truncate leading-none mt-0.5">{p.client_name || 'No Client'} • {p.status}</p>
                          </div>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#A8B89A] shrink-0" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[#F4F2EE] dark:bg-slate-800/50 text-[#4B4B4B] dark:text-[#F8FAFC] border-l-2 border-[#A8B89A] pl-[14px]'
                      : 'text-[#7D7D7D] dark:text-[#94A3B8] hover:text-[#4B4B4B] dark:hover:text-white hover:bg-[#F8F6F3] dark:hover:bg-slate-800/30'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-[#A8B89A]' : 'text-[#7D7D7D]'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-2 rounded-full bg-[#8AA17A] animate-pulse"></div>
            <span className="text-[10px] font-medium text-[#7D7D7D] dark:text-[#94A3B8] tracking-wider">WORKSPACE ACTIVE</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (visible on lg screens) */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-[#0F172A] border-r border-slate-200/60 dark:border-slate-800/80 h-screen fixed top-0 left-0 flex-col p-6 z-30 overflow-y-auto justify-between shadow-sm">
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
              className="lg:hidden fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40"
            />

            {/* Slide drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="lg:hidden w-64 bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800/80 h-screen fixed top-0 left-0 flex flex-col p-6 z-50 overflow-y-auto justify-between shadow-2xl"
            >
              {renderInnerContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>    </>
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
  procurements: any[];
  setShowDetailsPopup: (val: boolean) => void;
}

function DashboardView({ stats, projects, setCurrentTab, setActiveProjectId, handleCreateProject, materials, currentUser, procurements, setShowDetailsPopup }: DashboardViewProps) {
  const navigate = useNavigate();
  const [showAddProject, setShowAddProject] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tiles');
  const [formData, setFormData] = useState({
    name: '', clientName: '', phone: '', email: '', location: '', type: 'Residential', budget: '', notes: '', startDate: '', assignedDesigner: ''
  });

  if (!stats) return <div className="text-center py-20 text-[#7D7D7D] text-sm">Loading dashboard data...</div>;

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

  const filteredMaterials = materials.filter(m => m.category?.toLowerCase() === (selectedCategory === 'Fabrics' ? 'fabric' : selectedCategory.toLowerCase()));

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-extralight tracking-tight text-[#4B4B4B] dark:text-[#F8FAFC] font-display mt-4 mb-2">Welcome back, {currentUser.name}</h2>
          <p className="text-sm text-[#7D7D7D] dark:text-[#94A3B8] font-light max-w-xl">
            Manage projects, materials, vendors, and approvals with clarity and confidence.
          </p>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {[
          { label: 'Active Projects', val: stats.activeProjects, sub: 'Ongoing jobs', icon: FolderOpen, color: 'text-[#A8B89A] bg-[#A8B89A]/10', path: '/projects' },
          { label: 'Pending Material Approvals', val: stats.pendingMaterials, sub: 'Awaiting sign-off', icon: Palette, color: 'text-[#D7B57D] bg-[#D7B57D]/10', path: '/approval' },
          { label: 'Vendors', val: stats.activeVendors, sub: 'Sourced suppliers', icon: Users, color: 'text-[#8AA17A] bg-[#8AA17A]/10', path: '/vendors' },
          { label: 'Site Visits', val: stats.siteVisitsScheduled || 0, sub: 'Visits logged', icon: Clock, color: 'text-[#7D7D7D] bg-slate-100', path: '/site-visits' },
          { label: 'Budget Usage', val: `${stats.budgetUsage?.utilizationPct || 0}%`, sub: 'Spent vs Allocation', icon: TrendingUp, color: 'text-[#C89A9A] bg-[#C89A9A]/10', path: '/budget' },
          { label: 'Procurement Status', val: `${procurements?.filter((p: any) => p.status === 'Ordered' || p.status === 'Shipped').length || 0} Active`, sub: 'In Transit/Ordered', icon: RefreshCw, color: 'text-[#8AA17A] bg-[#D8E2D0]', path: '/procurement' }
        ].map((c, i) => (
          <div
            key={i}
            onClick={() => navigate(c.path)}
            className="bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-[24px] flex flex-col justify-between min-h-[120px] shadow-sm hover:shadow transition-all duration-300 cursor-pointer hover:border-[#A8B89A]/50 dark:hover:border-[#A8B89A]/50 hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-bold text-[#7D7D7D] dark:text-[#94A3B8] uppercase tracking-wider">{c.label}</span>
              <div className={`p-1.5 rounded-lg ${c.color.split(' ').slice(1).join(' ')}`}>
                <c.icon size={14} className={c.color.split(' ')[0]} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-light text-[#4B4B4B] dark:text-[#F8FAFC] mb-0.5 font-display">{c.val}</p>
              <p className="text-[9px] text-[#7D7D7D] dark:text-[#94A3B8]/80 font-medium leading-none">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Project Progress Section */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-[24px] shadow-sm space-y-6">
        <div>
          <h3 className="text-xs uppercase font-bold text-[#7D7D7D] dark:text-[#94A3B8] tracking-wider">Project Progress & Vitality</h3>
          <p className="text-[11px] text-[#7D7D7D] dark:text-[#94A3B8]/80 mt-0.5">Real-time status check of active design contracts</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {projects.slice(0, 4).map((p) => {
            const pct = p.total_selections && p.total_selections > 0 
              ? Math.round((p.approved_selections! / p.total_selections) * 100) 
              : 0;
            // Circular progress SVG
            const radius = 28;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (pct / 100) * circumference;
            
            return (
              <div 
                key={p.id} 
                className="flex flex-col items-center p-5 rounded-[24px] text-center space-y-3 relative overflow-hidden h-[180px] justify-between shadow-sm hover:shadow-md transition-all group bg-cover bg-center cursor-pointer active:scale-[0.98]"
                style={{ backgroundImage: p.image_url ? `url(${p.image_url})` : 'none' }}
                onClick={() => {
                  setActiveProjectId(p.id);
                  navigate('/projects', { state: { openDetails: true, projectId: p.id } });
                }}
              >
                {/* Dark overlay for readability and premium vibe */}
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] group-hover:bg-black/55 transition-all duration-300 z-0" />
                
                {/* Circular Progress Indicator */}
                <div className="relative w-16 h-16 flex items-center justify-center z-10 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="24"
                      className="stroke-white/20"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="24"
                      className="stroke-[#A8B89A] transition-all duration-500"
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 24}
                      strokeDashoffset={2 * Math.PI * 24 - (pct / 100) * (2 * Math.PI * 24)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-white">{pct}%</span>
                </div>
                
                <div className="relative z-10 w-full">
                  <p className="text-xs font-bold text-white truncate px-1" title={p.name}>{p.name}</p>
                  <p className="text-[10px] text-[#A8B89A] font-medium">{p.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Material Showcase Overview Section */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-[24px] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xs uppercase font-bold text-[#7D7D7D] dark:text-[#94A3B8] tracking-wider">Material Showcase & Selections</h3>
            <p className="text-[11px] text-[#7D7D7D] dark:text-[#94A3B8]/80 mt-0.5">Explore catalog finishes and design approval states</p>
          </div>
          
          {/* Category selector */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
            {['Tiles', 'Laminates', 'Paints', 'Furniture', 'Lighting', 'Hardware', 'Fabrics'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#A8B89A]/15 text-[#A8B89A] border border-[#A8B89A]/30'
                    : 'bg-slate-50 dark:bg-slate-900 text-[#7D7D7D] dark:text-[#94A3B8] border border-transparent dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMaterials.slice(0, 4).map(m => (
            <div key={m.id} className="bg-[#F8F6F3]/40 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 p-5 rounded-[24px] flex flex-col justify-between text-center min-h-[260px] hover:shadow-md transition-all duration-300">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[9px] font-bold text-[#A8B89A] uppercase tracking-wider">
                  <span>{m.category}</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[8px] font-bold ${
                    m.status === 'Approved' ? 'bg-[#8AA17A]/10 border-[#8AA17A]/20 text-[#8AA17A]' : 'bg-[#D7B57D]/10 border-[#D7B57D]/20 text-[#D7B57D]'
                  }`}>
                    {m.status || 'Pending'}
                  </span>
                </div>
                
                {/* Large Circular Focus Frame for Material Image */}
                <div className="relative w-28 h-28 mx-auto rounded-full bg-[#EFEFEE] dark:bg-slate-950/50 flex items-center justify-center p-1 border border-slate-200/50 dark:border-slate-800/50 shadow-inner group overflow-hidden">
                  <img
                    src={m.image_url || '/assets/placeholder-material.png'}
                    alt={m.name}
                    className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                
                <div>
                  <p className="text-xs font-bold text-[#4B4B4B] dark:text-white line-clamp-1">{m.name}</p>
                  <p className="text-[10px] text-[#7D7D7D] dark:text-[#94A3B8] mt-0.5">{m.brand || 'Vendor N/A'}</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-[#4B4B4B] dark:text-[#F8FAFC]">
                INR {m.unit_price?.toLocaleString()} / unit
              </div>
            </div>
          ))}
          {filteredMaterials.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-[#7D7D7D] dark:text-[#94A3B8] italic">
              No materials registered in the {selectedCategory} category.
            </div>
          )}
        </div>
      </div>

      {/* Split Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Directory List */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-[24px] lg:col-span-2 space-y-4 shadow-sm">
          <h3 className="text-md font-semibold text-[#4B4B4B] dark:text-white font-display">Active Projects Directory</h3>
          
          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800/80 text-[#7D7D7D] dark:text-[#94A3B8] font-medium">
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
                    <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition duration-150">
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => { setActiveProjectId(p.id); setCurrentTab('projects'); }}
                          className="font-bold text-[#4B4B4B] dark:text-white hover:text-[#A8B89A] hover:underline text-left"
                        >
                          {p.name}
                        </button>
                        <p className="text-[10px] text-[#7D7D7D] dark:text-[#94A3B8] mt-1 font-medium">{p.client_name}</p>
                      </td>
                      <td className="py-3 pr-4 text-[#7D7D7D] dark:text-slate-300">{p.client_type}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeStyles(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-[#A8B89A] rounded-full" style={{ width: `${pct}%` }}></div>
                          </div>
                          <span className="text-[#7D7D7D] dark:text-slate-300 font-semibold">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-[#4B4B4B] dark:text-[#F8FAFC]">INR {p.budget.toLocaleString()}</td>
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
                <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <button
                      onClick={() => { setActiveProjectId(p.id); setCurrentTab('projects'); }}
                      className="font-bold text-[#4B4B4B] dark:text-white hover:text-[#A8B89A] hover:underline text-left text-xs"
                    >
                      {p.name}
                    </button>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeStyles(p.status)}`}>
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-[#7D7D7D] dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px]">Client</span>
                      <span className="text-slate-800 dark:text-white font-medium">{p.client_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px]">Budget</span>
                      <span className="text-slate-800 dark:text-white font-semibold">INR {p.budget.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[#7D7D7D] dark:text-[#94A3B8] text-[10px]">Approvals:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-[#A8B89A] rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="text-[#7D7D7D] dark:text-slate-300 text-[10px]">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Audit Activity Logs */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-[24px] space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-[#4B4B4B] dark:text-white font-display">Audited Selections Log</h3>
            <Clock size={16} className="text-[#A8B89A]" />
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2">
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((act: any) => (
                <div key={act.id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#4B4B4B] dark:text-white">{act.user_name}</span>
                    <span className="text-[10px] text-[#7D7D7D] dark:text-[#94A3B8]">{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[#4B4B4B] dark:text-slate-350 font-light leading-relaxed">{act.notes}</p>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
                    <span className="text-[#7D7D7D] dark:text-[#94A3B8]">Project: {act.project_name}</span>
                    <div className="flex items-center gap-1 font-bold">
                      <span className="text-[#C89A9A]">{act.previous_status}</span>
                      <ChevronRight size={10} className="text-slate-400" />
                      <span className="text-[#8AA17A]">{act.new_status}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#7D7D7D] dark:text-[#94A3B8] text-center py-10">No status audit entries logged yet.</p>
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const styleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

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
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-[24px] space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold text-[#4B4B4B] dark:text-white font-display">Smart AI Design Matcher</h3>
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-[#A8B89A]/30 text-[#A8B89A] bg-[#A8B89A]/10 uppercase tracking-wider">AI Layer</span>
      </div>
      <div className="text-xs space-y-3">
        <p className="text-[#7D7D7D] dark:text-[#94A3B8] font-light">Suggest catalog material combinations matching style guidelines.</p>
        <div className="flex gap-2">
          <div className="relative flex-1" ref={styleDropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-3 rounded-xl text-[#4B4B4B] dark:text-white outline-none cursor-pointer flex items-center justify-between text-left focus:border-[#A8B89A] transition-all text-xs font-normal"
            >
              <span>
                {selectedStyle === 'luxury' && 'Modern Luxury Palette'}
                {selectedStyle === 'minimalist' && 'Warm Minimalist Palette'}
                {selectedStyle === 'industrial' && 'Bold Industrial Palette'}
              </span>
              <ChevronDown size={14} className={`text-slate-400 dark:text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-1.5 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  {[
                    { val: 'luxury', label: 'Modern Luxury Palette' },
                    { val: 'minimalist', label: 'Warm Minimalist Palette' },
                    { val: 'industrial', label: 'Bold Industrial Palette' }
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => {
                        setSelectedStyle(opt.val);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-xs font-semibold ${
                        selectedStyle === opt.val
                          ? 'bg-[#A8B89A]/15 text-[#A8B89A]'
                          : 'text-[#4B4B4B] dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={generateGuide}
            className="px-4 py-2 bg-[#A8B89A] hover:bg-[#96A689] text-white rounded-xl font-bold transition shadow-sm"
          >
            Match Materials
          </button>
        </div>

        {recommendation ? (
          <div className="p-4 bg-[#F8F6F3]/50 dark:bg-slate-900/40 border border-[#A8B89A]/20 dark:border-[#A8B89A]/30 rounded-xl space-y-3 fade-in">
            <div>
              <h4 className="font-bold text-[#A8B89A]">{recommendation.styleName} combination</h4>
              <p className="text-[#7D7D7D] dark:text-[#94A3B8] mt-1 leading-relaxed text-[11px] font-light">{recommendation.description}</p>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold block">Recommended items:</span>
              {recommendation.items.map((m: any) => (
                <div key={m.id} className="flex justify-between items-center bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800/80 p-2 rounded-lg text-[11px] shadow-sm">
                  <div>
                    <span className="font-semibold text-[#4B4B4B] dark:text-white">{m.name}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] block">{m.brand} • {m.category}</span>
                  </div>
                  <span className="text-[#8AA17A] font-semibold">INR {m.unit_price}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 italic bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200/60 dark:border-slate-800/80 rounded-xl">
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
      msg: 'PO #AP-928 dispatched for 432 units of Italian Carrara Vitrified Tile.',
      time: '12 mins ago'
    },
    {
      id: 3,
      type: 'whatsapp',
      to: 'Rahul Dev (PM)',
      msg: '🚨 Budget Cap Notice: Penthouse Villa budget reaches 92.5% utilization cap threshold.',
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
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-[24px] space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold text-[#4B4B4B] dark:text-white font-display">Automated Communications log</h3>
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-sky-500/20 text-sky-600 bg-sky-50 uppercase tracking-wider">Live API Feed</span>
      </div>
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {communications.map(c => (
          <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-xl text-[11px] space-y-1.5 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                  c.type === 'whatsapp' ? 'bg-[#8AA17A]/15 text-[#8AA17A] border border-[#8AA17A]/30' : 'bg-slate-100 dark:bg-slate-800 text-[#4B4B4B] dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}>
                  {c.type === 'whatsapp' ? 'WhatsApp PO' : 'SMTP Email'}
                </span>
                <span className="text-[#7D7D7D] dark:text-[#94A3B8] font-semibold">To: {c.to}</span>
              </div>
              <span className="text-slate-400 dark:text-slate-500 text-[9px]">{c.time}</span>
            </div>
            <p className="text-[#4B4B4B] dark:text-slate-300 font-light leading-relaxed">{c.msg}</p>
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
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.openDetails && location.state.projectId) {
      setActiveProjectId(location.state.projectId);
      setShowDetailsPopup(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setActiveProjectId]);

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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">Client Projects Directory</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add, track stages, and audit material files.</p>
        </div>
        {(currentUser.role === 'Admin' || currentUser.role === 'Project Manager') && (
          <button
            onClick={() => { resetForm(); setShowAdd(true); }}
            className="px-4 py-2.5 bg-[#A8B89A] hover:bg-[#96A689] text-white rounded-xl font-normal text-sm transition-all flex items-center gap-2 min-h-[44px] shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Project</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-5 gap-3 text-xs shadow-sm">
        <div className="relative md:col-span-2">
          <Search size={14} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by client or project name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 pl-9 pr-3 py-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25 transition-all"
          />
        </div>
        <div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl text-slate-700 dark:text-gray-300 outline-none cursor-pointer focus:border-emerald-500 transition-all"
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
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl text-slate-700 dark:text-gray-300 outline-none cursor-pointer focus:border-emerald-500 transition-all"
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
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl text-slate-700 dark:text-gray-300 outline-none cursor-pointer focus:border-emerald-500 transition-all"
          >
            <option value="created_at">Date Created</option>
            <option value="name">Project Name</option>
            <option value="budget">Budget Cap</option>
            <option value="status">Journey Stage</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl text-slate-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition"
          >
            <ArrowUpDown size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Project Directory Table */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-6 rounded-[24px] space-y-4 shadow-sm w-full">
          <h3 className="text-md font-semibold text-slate-900 dark:text-white font-display">Project Files</h3>
          
          {/* Desktop/Tablet Table View */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-left text-xs border-separate border-spacing-y-2">
              <thead>
                <tr className="text-slate-400 dark:text-slate-500 font-medium">
                  <th className="pb-2 pr-4 pl-4">Project Name</th>
                  <th className="pb-2 pr-4">Client Name</th>
                  <th className="pb-2 pr-4">Project Type</th>
                  <th className="pb-2 pr-4">Budget</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Start Date</th>
                  <th className="pb-2 pr-4">Assigned Designer</th>
                  <th className="pb-2 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => {
                  const isSelected = activeProjectId === p.id && showDetailsPopup;
                  const bgClass = isSelected
                    ? 'bg-[#A8B89A]/15 dark:bg-[#A8B89A]/20'
                    : 'bg-slate-50/40 dark:bg-slate-900/20';
                  
                  return (
                    <tr
                      key={p.id}
                      className="group cursor-pointer"
                      onClick={() => {
                        setActiveProjectId(p.id);
                        setShowDetailsPopup(true);
                      }}
                    >
                      <td className={`py-4 pl-4 pr-4 font-bold text-slate-900 dark:text-white first:rounded-l-2xl border-t border-b border-l border-slate-200/50 dark:border-slate-800/40 transition-all duration-300 ease-in-out group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-[#A8B89A]/15 ${bgClass}`}>
                        {p.name}
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">{p.address}</p>
                      </td>
                      <td className={`py-4 pr-4 text-slate-700 dark:text-slate-300 border-t border-b border-slate-200/50 dark:border-slate-800/40 transition-all duration-300 ease-in-out group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-[#A8B89A]/15 ${bgClass}`}>
                        {p.client_name}
                      </td>
                      <td className={`py-4 pr-4 text-slate-500 dark:text-slate-400 border-t border-b border-slate-200/50 dark:border-slate-800/40 transition-all duration-300 ease-in-out group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-[#A8B89A]/15 ${bgClass}`}>
                        {p.client_type}
                      </td>
                      <td className={`py-4 pr-4 text-[#8AA17A] font-semibold border-t border-b border-slate-200/50 dark:border-slate-800/40 transition-all duration-300 ease-in-out group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-[#A8B89A]/15 ${bgClass}`}>
                        INR {p.budget.toLocaleString()}
                      </td>
                      <td className={`py-4 pr-4 border-t border-b border-slate-200/50 dark:border-slate-800/40 transition-all duration-300 ease-in-out group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-[#A8B89A]/15 ${bgClass}`}>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeStyles(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className={`py-4 pr-4 text-slate-500 dark:text-slate-400 border-t border-b border-slate-200/50 dark:border-slate-800/40 transition-all duration-300 ease-in-out group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-[#A8B89A]/15 ${bgClass}`}>
                        {p.start_date || 'N/A'}
                      </td>
                      <td className={`py-4 pr-4 text-slate-500 dark:text-slate-400 border-t border-b border-slate-200/50 dark:border-slate-800/40 transition-all duration-300 ease-in-out group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-[#A8B89A]/15 ${bgClass}`}>
                        {p.assigned_designer || 'N/A'}
                      </td>
                      <td className={`py-4 text-right space-x-1 last:rounded-r-2xl pr-4 border-t border-b border-r border-slate-200/50 dark:border-slate-800/40 transition-all duration-300 ease-in-out group-hover:bg-[#A8B89A]/10 dark:group-hover:bg-[#A8B89A]/15 ${bgClass}`} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setActiveProjectId(p.id);
                            setShowDetailsPopup(true);
                          }}
                          className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg text-slate-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={12} />
                        </button>
                        {(currentUser.role === 'Admin' || currentUser.role === 'Project Manager') ? (
                          <>
                            <button
                              onClick={() => loadEditData(p)}
                              className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg text-slate-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition cursor-pointer"
                              title="Edit Project"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(p.id)}
                              className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg text-slate-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition cursor-pointer"
                              title="Delete Project"
                            >
                              <Trash2 size={12} />
                            </button>
                          </>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="space-y-3 sm:hidden">
            {projects.map(p => (
              <div
                key={p.id}
                className={`p-4 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-3 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-white/5 ${
                  activeProjectId === p.id && showDetailsPopup ? 'border-[#A8B89A]' : ''
                }`}
                onClick={() => {
                  setActiveProjectId(p.id);
                  setShowDetailsPopup(true);
                }}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{p.name}</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">{p.address}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeStyles(p.status)}`}>
                    {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-gray-400">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px]">Client</span>
                    <span className="text-slate-800 dark:text-white font-medium">{p.client_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px]">Type</span>
                    <span className="text-slate-800 dark:text-white font-medium">{p.client_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px]">Budget</span>
                    <span className="text-[#8AA17A] font-semibold">INR {p.budget.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider text-[8px]">Designer</span>
                    <span className="text-slate-800 dark:text-white font-medium">{p.assigned_designer || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                  <span className="text-slate-500 dark:text-gray-400 text-[10px]">Start: {p.start_date || 'N/A'}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setActiveProjectId(p.id);
                        setShowDetailsPopup(true);
                      }}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg text-slate-500 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition min-h-[36px] flex items-center justify-center cursor-pointer"
                      title="View Details"
                    >
                      <Eye size={12} />
                    </button>
                    {(currentUser.role === 'Admin' || currentUser.role === 'Project Manager') ? (
                      <>
                        <button
                          onClick={() => loadEditData(p)}
                          className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg text-slate-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition min-h-[36px] flex items-center justify-center cursor-pointer"
                          title="Edit Project"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(p.id)}
                          className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg text-slate-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition min-h-[36px] flex items-center justify-center cursor-pointer"
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
      </div>

      {/* Project Details Modal Pop-up */}
      <AnimatePresence>
        {showDetailsPopup && activeDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setShowDetailsPopup(false)}
            />
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-[28px] w-full max-w-4xl space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] text-left relative z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                      {activeDetails.project.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeStyles(activeDetails.project.status)}`}>
                      {activeDetails.project.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                    Client: <strong className="text-slate-800 dark:text-white">{activeDetails.project.client_name}</strong>
                  </p>
                </div>
                <button 
                  onClick={() => setShowDetailsPopup(false)} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 focus-visible:ring-2 focus-visible:ring-emerald-500/50 outline-none rounded-lg cursor-pointer" 
                  title="Close Details"
                  aria-label="Close details popup"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Side: Core Metadata & Notes */}
                <div className="md:col-span-1 space-y-4 md:border-r border-slate-100 dark:border-slate-800/60 md:pr-6">
                  <div className="space-y-2 text-xs">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase tracking-wider font-bold">Contact Information</span>
                    <div className="flex flex-col gap-1.5 text-[10px] text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5"><Phone size={10} className="text-[#A8B89A]" /> {activeDetails.project.client_phone}</span>
                      <span className="flex items-center gap-1.5"><Mail size={10} className="text-[#A8B89A]" /> {activeDetails.project.client_email}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={10} className="text-[#A8B89A]" /> {activeDetails.project.address}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 space-y-2 text-xs">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase tracking-wider font-bold">Project Metadata</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block font-light">Type</span>
                        <span className="text-slate-800 dark:text-white font-medium">{activeDetails.project.client_type}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block font-light">Start Date</span>
                        <span className="text-slate-800 dark:text-white font-medium">{activeDetails.project.start_date || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 block font-light">Designer</span>
                        <span className="text-slate-800 dark:text-white font-medium">{activeDetails.project.assigned_designer || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    <h4 className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1.5">Design Notes</h4>
                    <p className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                      {activeDetails.project.notes || 'No design notes mapped.'}
                    </p>
                  </div>
                </div>

                {/* Right Side: Tabbed Dynamic Content */}
                <div className="md:col-span-2 space-y-4">
                  {/* Tab Selector */}
                  <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                    {['overview', 'spaces', 'concepts', 'site-visits', 'tasks', 'vendors', 'budget', 'photos'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveSubTab(tab)}
                        className={`pb-1 px-1 border-b-2 transition cursor-pointer ${
                          activeSubTab === tab ? 'border-[#A8B89A] text-[#8AA17A] font-bold' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="text-xs space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                    {activeSubTab === 'overview' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block mb-0.5 uppercase tracking-wider font-bold">Budget Limit</span>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">INR {activeDetails.project.budget.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block mb-0.5 uppercase tracking-wider font-bold">Spaces Configured</span>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{activeDetails.rooms.length} Rooms</p>
                        </div>
                      </div>
                    )}

                    {activeSubTab === 'spaces' && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Rooms Mapping</h4>
                        </div>
                        {activeDetails.rooms.map((r: Room) => (
                          <div key={r.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-200">{r.name}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Dims: {r.length}'x{r.width}'x{r.height}'</p>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 italic">{r.notes ? r.notes.substring(0, 25) + '...' : ''}</span>
                          </div>
                        ))}
                        {activeDetails.rooms.length === 0 && (
                          <p className="text-slate-400 dark:text-slate-500 italic py-6 text-center">No rooms configured.</p>
                        )}
                      </div>
                    )}

                    {activeSubTab === 'concepts' && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">Design Concepts (Approvals Portal)</h4>
                        {activeDetails.rooms.flatMap((r: Room) => (r.concepts || []).map((c: any) => (
                          <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-900 dark:text-slate-200">{c.title} ({r.name})</span>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border ${
                                c.status === 'Approved' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' :
                                c.status === 'Revised' ? 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20' :
                                'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20'
                              }`}>
                                {c.status}
                              </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px]">{c.description}</p>
                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                onClick={() => handleUpdateConceptStatus(c.id, 'Approved')}
                                className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-semibold text-[10px] transition cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateConceptStatus(c.id, 'Revised')}
                                className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-semibold text-[10px] transition cursor-pointer"
                              >
                                Request Revision
                              </button>
                            </div>
                          </div>
                        )))}
                        {activeDetails.rooms.flatMap((r: Room) => r.concepts || []).length === 0 && (
                          <p className="text-slate-400 dark:text-slate-500 italic py-6 text-center">No design concepts uploaded.</p>
                        )}
                      </div>
                    )}

                    {activeSubTab === 'site-visits' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Site Visits Log</h4>
                          {['Admin', 'Interior Designer', 'Project Manager'].includes(currentUser.role) && (
                            <button
                              onClick={() => setShowAddVisit(!showAddVisit)}
                              className="text-[10px] font-bold text-[#8AA17A] hover:underline cursor-pointer"
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
                          }} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <label className="block text-slate-500 dark:text-slate-400 mb-1">Date</label>
                                <input
                                  type="date" required
                                  value={visitForm.visitDate} onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-2 rounded text-slate-900 dark:text-white outline-none focus:border-[#A8B89A]"
                                />
                              </div>
                              <div>
                                <label className="block text-slate-500 dark:text-slate-400 mb-1">Visitor Name</label>
                                <input
                                  type="text" required placeholder="e.g. Rahul Dev (PM)"
                                  value={visitForm.visitorName} onChange={(e) => setVisitForm({ ...visitForm, visitorName: e.target.value })}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-2 rounded text-slate-900 dark:text-white outline-none focus:border-[#A8B89A]"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[10px]">Site Notes</label>
                              <textarea
                                rows={2} placeholder="Slab dimensions, measurements..."
                                value={visitForm.notes} onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-2 rounded text-slate-900 dark:text-white outline-none focus:border-[#A8B89A] text-[10px]"
                              />
                            </div>
                            <button type="submit" className="w-full bg-[#A8B89A] hover:bg-[#96A689] text-white p-2 rounded font-bold text-[10px] cursor-pointer">
                              SCHEDULE VISIT
                            </button>
                          </form>
                        )}

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {activeDetails.siteVisits.map((v: SiteVisit) => (
                            <div key={v.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-2">
                              <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
                                <span className="font-bold text-slate-900 dark:text-slate-200">{v.visitor_name}</span>
                                <span>{v.visit_date}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{v.notes}</p>
                              <div className="flex gap-2 items-center text-[9px] text-[#8AA17A] font-bold">
                                <MapPin size={10} />
                                <span>Site measurements logged</span>
                              </div>
                            </div>
                          ))}
                          {activeDetails.siteVisits.length === 0 && (
                            <p className="text-slate-400 dark:text-slate-500 italic py-6 text-center">No site visits recorded yet.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {activeSubTab === 'tasks' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Snag Lists & Tasks</h4>
                          {['Admin', 'Interior Designer', 'Project Manager'].includes(currentUser.role) && (
                            <button
                              onClick={() => setShowAddTask(!showAddTask)}
                              className="text-[10px] font-bold text-[#8AA17A] hover:underline cursor-pointer"
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
                          }} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-3">
                            <div>
                              <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[10px]">Task Title</label>
                              <input
                                type="text" required placeholder="e.g. Check tile grout leveling"
                                value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-2 rounded text-slate-900 dark:text-white outline-none focus:border-[#A8B89A] text-[10px]"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <div>
                                <label className="block text-slate-500 dark:text-slate-400 mb-1">Assigned Role</label>
                                <select
                                  value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-2 rounded text-slate-900 dark:text-white outline-none focus:border-[#A8B89A] cursor-pointer"
                                >
                                  <option value="Designer">Interior Designer</option>
                                  <option value="Project Manager">Project Manager</option>
                                  <option value="Site Engineer">Site Engineer</option>
                                  <option value="Vendor Coordinator">Vendor Coordinator</option>
                                  <option value="Admin">Administrator</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-slate-500 dark:text-slate-400 mb-1">Due Date</label>
                                <input
                                  type="date"
                                  value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-2 rounded text-slate-900 dark:text-white outline-none focus:border-[#A8B89A]"
                                />
                              </div>
                            </div>
                            <button type="submit" className="w-full bg-[#A8B89A] hover:bg-[#96A689] text-white p-2 rounded font-bold text-[10px] cursor-pointer">
                              ADD SNAG TASK
                            </button>
                          </form>
                        )}

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {activeDetails.tasks.map((t: Task) => (
                            <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={t.status === 'Completed'}
                                  disabled={currentUser.role === 'Client'}
                                  onChange={(e) => handleUpdateTaskStatus(t.id, e.target.checked ? 'Completed' : 'In Progress')}
                                  className="accent-emerald-500 h-4 w-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <div>
                                  <p className={`font-medium ${t.status === 'Completed' ? 'line-through text-slate-400 dark:text-gray-500' : 'text-slate-900 dark:text-slate-200'}`}>
                                    {t.title}
                                  </p>
                                  <p className="text-[10px] text-slate-400 dark:text-gray-400 mt-0.5">
                                    Assigned: {t.assigned_to} • Due: {t.due_date || 'No Date'}
                                  </p>
                                </div>
                              </div>
                              {currentUser.role !== 'Client' && (
                                <button
                                  onClick={() => handleDeleteTask(t.id)}
                                  className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                          {activeDetails.tasks.length === 0 && (
                            <p className="text-slate-400 dark:text-slate-500 italic py-6 text-center">No tasks assigned.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {activeSubTab === 'vendors' && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">Procured Vendors</h4>
                        {Array.from(new Set(activeDetails.selections.map((s: any) => s.vendor_name))).map((vName: any) => {
                          if (!vName) return null;
                          return (
                            <div key={vName} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between">
                              <span className="font-semibold text-slate-800 dark:text-slate-300">{vName}</span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider">Active Supplier</span>
                            </div>
                          );
                        })}
                        {activeDetails.selections.filter((s: any) => s.vendor_name).length === 0 && (
                          <p className="text-slate-400 dark:text-slate-500 italic py-6 text-center">No vendors assigned to selections.</p>
                        )}
                      </div>
                    )}

                    {activeSubTab === 'budget' && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">Budget utilization</h4>
                        <BudgetSummaryPanel activeDetails={activeDetails} />
                      </div>
                    )}

                    {activeSubTab === 'photos' && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] uppercase tracking-wider text-[#A8B89A] font-bold mb-1.5">Project Photos Gallery</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* Photo 1 */}
                          <div className="space-y-1.5 group/photo cursor-pointer relative overflow-hidden rounded-xl border border-slate-100 dark:border-slate-850">
                            <img
                              src={activeDetails.project.image_url || '/assets/projects/rathods_villa.png'}
                              alt="Main Exterior View"
                              className="w-full h-32 object-cover transition-all duration-300 group-hover/photo:scale-105"
                            />
                            <div className="p-2 bg-slate-50 dark:bg-slate-950/60 text-[10px] text-[#4B4B4B] dark:text-gray-300 font-medium">Main Exterior View</div>
                          </div>

                          {/* Photo 2 */}
                          <div className="space-y-1.5 group/photo cursor-pointer relative overflow-hidden rounded-xl border border-slate-100 dark:border-slate-850">
                            <img
                              src={`/assets/projects/project_${activeDetails.project.id}_2.png`}
                              alt="Interior View 1"
                              className="w-full h-32 object-cover transition-all duration-300 group-hover/photo:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/backgrounds/luxury_villa.png';
                              }}
                            />
                            <div className="p-2 bg-slate-50 dark:bg-slate-950/60 text-[10px] text-[#4B4B4B] dark:text-gray-300 font-medium">Interior Perspective A</div>
                          </div>

                          {/* Photo 3 */}
                          <div className="space-y-1.5 group/photo cursor-pointer relative overflow-hidden rounded-xl border border-slate-100 dark:border-slate-850">
                            <img
                              src={`/assets/projects/project_${activeDetails.project.id}_3.png`}
                              alt="Interior View 2"
                              className="w-full h-32 object-cover transition-all duration-300 group-hover/photo:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/backgrounds/modern_living_room.png';
                              }}
                            />
                            <div className="p-2 bg-slate-50 dark:bg-slate-950/60 text-[10px] text-[#4B4B4B] dark:text-gray-300 font-medium">Interior Perspective B</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
    <div role="dialog" aria-modal="true" aria-labelledby="pm-title" className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-3xl w-full max-w-lg space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center">
          <h3 id="pm-title" className="text-lg font-bold text-slate-900 dark:text-white font-display">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 outline-none rounded-lg" 
            title="Close"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pm-name" className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Project Name</label>
              <input
                id="pm-name"
                type="text" required placeholder="e.g. Rathod Penthouse"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-3 py-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label htmlFor="pm-client" className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Client Name</label>
              <input
                id="pm-client"
                type="text" required placeholder="e.g. Sidharth Rathod"
                value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-3 py-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pm-phone" className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Phone Number</label>
              <input
                id="pm-phone"
                type="tel" placeholder="+91 99999..."
                value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-3 py-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label htmlFor="pm-email" className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Email Address</label>
              <input
                id="pm-email"
                type="email" placeholder="client@mail.com"
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-3 py-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pm-location" className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Site Address Location</label>
              <input
                id="pm-location"
                type="text" placeholder="Thane, Mumbai"
                value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-3 py-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label htmlFor="pm-type" className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Project Type</label>
              <select
                id="pm-type"
                value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 min-h-[48px] cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="pm-start" className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Start Date</label>
              <input
                id="pm-start"
                type="date"
                value={formData.startDate || ''} onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-3 py-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
            </div>
            <div>
              <label htmlFor="pm-designer" className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Designer Assigned</label>
              <input
                id="pm-designer"
                type="text" placeholder="e.g. Nisha Sen"
                value={formData.assignedDesigner || ''} onChange={(e) => setFormData({...formData, assignedDesigner: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-3 py-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label htmlFor="pm-budget" className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Allocated Budget Limit (INR)</label>
            <input
              id="pm-budget"
              type="number" placeholder="45000"
              value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-3 py-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
            />
          </div>
          <div>
            <label htmlFor="pm-notes" className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Notes</label>
            <textarea
              id="pm-notes"
              placeholder="Vibe preferences, spatial details..." rows={2}
              value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 px-3 py-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
            />
          </div>
          <button type="submit" className="w-full bg-[#A8B89A] hover:bg-[#96A689] text-white py-3 rounded-xl font-bold tracking-wider min-h-[48px] flex items-center justify-center transition active:scale-[0.99] outline-none cursor-pointer shadow-sm">
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
      <div className={`p-4 border rounded-2xl ${getBudgetBorderColor(pct)} bg-white dark:bg-slate-950/40 space-y-2`}>
        <div className="flex justify-between items-center">
          <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400 dark:text-slate-500">Total Spend Rate</span>
          <span className={`text-xs font-bold ${getBudgetTextColor(pct)}`}>{pct}% Used</span>
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${getBudgetBarColor(pct)}`} style={{ width: `${pct}%` }}></div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-500">
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
  return 'border-slate-200 dark:border-slate-800/80';
}
function getBudgetTextColor(pct: number) {
  if (pct > 100) return 'text-rose-500 dark:text-rose-400';
  if (pct >= 75) return 'text-amber-500 dark:text-amber-400';
  return 'text-emerald-500 dark:text-emerald-400';
}
function getBudgetBarColor(pct: number) {
  if (pct > 100) return 'bg-rose-500';
  if (pct >= 75) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function getBadgeStyles(status: string) {
  switch (status) {
    case 'Completed': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'Material Selection': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    case 'Design Approval': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    case 'Execution': return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
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
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">Material Selection Matrix</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Assign, compare supplier costs, and approve client finishes.</p>
        </div>
        {(currentUser.role === 'Admin' || currentUser.role === 'Interior Designer') && (
          <button
            onClick={() => setShowAddRoom(true)}
            className="px-4 py-2.5 bg-[#A8B89A] hover:bg-[#96A689] text-white rounded-xl font-normal text-sm transition-all flex items-center gap-2 min-h-[44px] shadow-sm cursor-pointer"
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
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <Home size={14} />
            <span>{r.name}</span>
            <span className="text-[10px] opacity-75">({r.length}'x{r.width}')</span>
          </button>
        ))}
      </div>

      {currentRoom && (
        <div className="p-4 bg-white/95 dark:bg-slate-900/40 border border-[#A8B89A]/15 dark:border-slate-800/80 rounded-[20px] text-xs space-y-1 shadow-sm">
          <h3 className="font-bold text-[#4B4B4B] dark:text-[#E5E7EB]">{currentRoom.name} Architectural details</h3>
          <p className="text-[#7D7D7D] dark:text-[#94A3B8]">
            Dimensions: Height: {currentRoom.height} ft | Area Layout Notes: {currentRoom.notes || 'None logged.'}
          </p>
        </div>
      )}

      {/* Category Selection Tabs & View Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-2">
        <div className="flex flex-wrap gap-2 uppercase text-[10px] font-bold text-slate-400 dark:text-slate-500">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-2 px-1 border-b-2 transition ${
                activeCategory === cat ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-1 rounded-xl self-start sm:self-auto shadow-inner">
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 ${
              viewMode === 'card' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Card View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 ${
              viewMode === 'table' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Table View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Selected Items */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs uppercase font-bold text-slate-400 dark:text-gray-500 tracking-wider">Active Selections</h3>
          {roomSelections.length > 0 ? (
            viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roomSelections.map((sel: MaterialSelection) => (
                  <div key={sel.id} className="glass-panel p-5 bg-white/95 dark:bg-slate-900/40 border border-[#A8B89A]/15 dark:border-slate-800/80 space-y-4 shadow-sm">
                    <div className="flex gap-4">
                      {sel.image_url ? (
                        <img
                          src={sel.image_url}
                          alt={sel.material_name}
                          className="w-16 h-16 rounded-[16px] flex-shrink-0 object-cover bg-[#F8F6F3] dark:bg-slate-950 border border-[#A8B89A]/15"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-[16px] flex-shrink-0 bg-[#F8F6F3] dark:bg-slate-950 border border-[#A8B89A]/15 flex items-center justify-center font-bold text-[10px] uppercase text-slate-500">
                          {sel.category?.substring(0, 4)}
                        </div>
                      )}
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-[#4B4B4B] dark:text-[#E5E7EB] text-sm truncate">{sel.material_name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeClass(sel.status)}`}>
                            {sel.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#7D7D7D] dark:text-[#94A3B8]">{sel.brand} • SKU: {sel.sku}</p>
                        <p className="text-xs font-semibold text-[#8AA17A] mt-1">INR {sel.unit_price?.toLocaleString()} / unit</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[#7D7D7D] dark:text-[#94A3B8] text-[10px] mb-1 uppercase font-bold tracking-wider">Quantity</label>
                        <input
                          type="number"
                          defaultValue={sel.quantity}
                          disabled={currentUser.role === 'Client'}
                          onBlur={(e) => handleUpdateSelection(sel.id, { quantity: parseFloat(e.target.value) || 1 })}
                          className="w-full bg-[#F8F6F3] dark:bg-slate-950 border border-[#A8B89A]/20 dark:border-slate-800/80 px-2.5 py-1.5 rounded-xl text-[#4B4B4B] dark:text-white outline-none focus:border-[#A8B89A] transition-all disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[#7D7D7D] dark:text-[#94A3B8] text-[10px] mb-1 uppercase font-bold tracking-wider">Supplier</label>
                        <select
                          value={sel.vendor_id || ''}
                          disabled={currentUser.role === 'Client'}
                          onChange={(e) => handleUpdateSelection(sel.id, { vendorId: Number(e.target.value) })}
                          className="w-full bg-[#F8F6F3] dark:bg-slate-950 border border-[#A8B89A]/20 dark:border-slate-800/80 px-2.5 py-1.5 rounded-xl text-[#4B4B4B] dark:text-white outline-none focus:border-[#A8B89A] transition-all disabled:opacity-50"
                        >
                          {vendors.map(v => (
                            <option key={v.id} value={v.id} className="bg-white dark:bg-slate-900 text-[#4B4B4B] dark:text-white">{v.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <span className="font-semibold text-[#4B4B4B] dark:text-[#E5E7EB]">Total: INR {(sel.quantity * sel.unit_price!).toLocaleString()}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openAuditDrawer(sel.id)}
                          className="p-1.5 bg-[#F8F6F3] dark:bg-slate-950 border border-[#A8B89A]/20 dark:border-slate-800/80 rounded-lg text-[#7D7D7D] hover:text-[#A8B89A] transition"
                          title="Audit Trail Logs"
                        >
                          <Clock size={12} />
                        </button>
                        {currentUser.role !== 'Client' && (
                          <button
                            onClick={() => handleDeleteSelection(sel.id)}
                            className="p-1.5 bg-[#F8F6F3] dark:bg-slate-950 border border-[#A8B89A]/20 dark:border-slate-800/80 rounded-lg text-[#7D7D7D] hover:text-[#C89A9A] transition"
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
                          sel.status === 'Approved' ? 'bg-[#8AA17A]/15 border-[#8AA17A]/30 text-[#8AA17A]' : 'border-[#A8B89A]/25 dark:border-slate-800/80 text-[#7D7D7D] dark:text-gray-400 hover:text-[#4B4B4B] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/35'
                        }`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateSelection(sel.id, { status: 'Rejected' })}
                        className={`py-1.5 border rounded-lg transition ${
                          sel.status === 'Rejected' ? 'bg-[#C89A9A]/15 border-[#C89A9A]/30 text-[#C89A9A]' : 'border-[#A8B89A]/25 dark:border-slate-800/80 text-[#7D7D7D] dark:text-gray-400 hover:text-[#4B4B4B] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/35'
                        }`}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleUpdateSelection(sel.id, { status: 'Replaced' })}
                        className={`py-1.5 border rounded-lg transition ${
                          sel.status === 'Replaced' ? 'bg-[#D7B57D]/15 border-[#D7B57D]/30 text-[#D7B57D]' : 'border-[#A8B89A]/25 dark:border-slate-800/80 text-[#7D7D7D] dark:text-gray-400 hover:text-[#4B4B4B] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/35'
                        }`}
                      >
                        Replace
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
                {/* Desktop/Tablet Table View */}
                <div className="overflow-x-auto hidden sm:block">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800/80 text-slate-400 dark:text-gray-400 font-medium">
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
                        <tr key={sel.id} className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-white/5 transition duration-150">
                          <td className="py-3 pr-4">
                            <span className="font-bold text-slate-900 dark:text-gray-200">{sel.material_name}</span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{sel.brand}</p>
                          </td>
                          <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">{sel.vendor_name}</td>
                          <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">
                            <span>{sel.quantity} unit @ INR {sel.unit_price}</span>
                          </td>
                          <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-gray-300">
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
                              className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg text-slate-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition"
                            >
                              <Clock size={12} />
                            </button>
                            {currentUser.role !== 'Client' && (
                              <button
                                onClick={() => handleDeleteSelection(sel.id)}
                                className="p-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg text-slate-500 dark:text-gray-400 hover:text-rose-500 transition"
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
                    <div key={sel.id} className="p-4 bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-2 shadow-sm">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="font-bold text-slate-900 dark:text-gray-200">{sel.material_name}</span>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{sel.brand}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeClass(sel.status)}`}>
                          {sel.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-gray-400 space-y-1.5 pt-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400 dark:text-slate-500">Supplier:</span>
                          <span className="text-slate-800 dark:text-white font-medium">{sel.vendor_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 dark:text-slate-500">Quantity / Price:</span>
                          <span className="text-slate-800 dark:text-white">{sel.quantity} unit @ INR {sel.unit_price}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 dark:border-slate-800/80 pt-1">
                          <span className="text-slate-400 dark:text-slate-500 font-semibold">Total Cost:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">INR {(sel.quantity * sel.unit_price!).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <button
                          onClick={() => openAuditDrawer(sel.id)}
                          className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg text-slate-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition min-h-[36px] flex items-center justify-center"
                        >
                          <Clock size={12} />
                        </button>
                        {currentUser.role !== 'Client' && (
                          <button
                            onClick={() => handleDeleteSelection(sel.id)}
                            className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg text-slate-500 dark:text-gray-400 hover:text-rose-500 transition min-h-[36px] flex items-center justify-center"
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
            <p className="text-slate-400 dark:text-slate-500 italic py-10 bg-slate-100/50 dark:bg-slate-900/10 border border-dashed border-slate-200 dark:border-white/5 rounded-2xl text-center">No material finishes added to this space yet. Browse the catalogue on the right.</p>
          )}
        </div>

        {/* Catalog Browser */}
        <div>
          <h3 className="text-xs uppercase font-bold text-slate-400 dark:text-gray-500 tracking-wider mb-4">Supplier Catalogue</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {materials
              .filter(m => m.category === activeCategory)
              .map(mat => (
                <div key={mat.id} className="glass-panel p-4 bg-white/95 dark:bg-slate-900/40 border border-[#A8B89A]/15 dark:border-slate-800/80 flex flex-col justify-between space-y-3 shadow-sm">
                  <div className="flex gap-3 items-start">
                    {mat.image_url && (
                      <img
                        src={mat.image_url}
                        alt={mat.name}
                        className="w-12 h-12 rounded-[12px] object-cover bg-[#F8F6F3] dark:bg-slate-950 border border-[#A8B89A]/15 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#4B4B4B] dark:text-[#E5E7EB] text-xs truncate" title={mat.name}>{mat.name}</h4>
                      <p className="text-[10px] text-[#7D7D7D] dark:text-[#94A3B8] mt-0.5">{mat.brand} • Sourced by {mat.vendor_name || 'Direct'}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-[#8AA17A] dark:text-emerald-400">INR {mat.unit_price} / unit</span>
                  </div>
                  {currentUser.role !== 'Client' && (
                    <button
                      onClick={() => handleAddSelection({ roomId: activeRoomId, materialId: mat.id, vendorId: mat.vendor_id, quantity: 1, notes: 'Initial intake selection' })}
                      className="w-full py-2 bg-[#A8B89A] hover:bg-[#96A689] text-white transition-all rounded-xl text-xs font-semibold border-none active:scale-[0.98]"
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800/80 p-6 h-full flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-md font-bold text-slate-900 dark:text-white font-display">Selection Audit Trail</h3>
              <button onClick={() => setAuditSelectionId(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-xs">
              {auditLoading ? (
                <div className="text-center py-20 text-slate-400 dark:text-gray-500">Syncing audit records...</div>
              ) : auditLogs.length > 0 ? (
                auditLogs.map((log, i) => (
                  <div key={log.id} className="relative pl-6 border-l border-slate-200 dark:border-slate-800/80 pb-4">
                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-emerald-500 border border-white dark:border-slate-900"></div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{log.user_name}</span>
                        <span className="text-slate-400 dark:text-slate-500">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-700 dark:text-gray-300">{log.notes}</p>
                      <div className="flex gap-2 items-center text-[10px] font-bold">
                        <span className="text-rose-500 dark:text-rose-400 uppercase">{log.previous_status}</span>
                        <ChevronRight size={10} className="text-slate-400" />
                        <span className="text-emerald-500 dark:text-emerald-400 uppercase">{log.new_status}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 dark:text-gray-500 py-20">No status audit entries mapped.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddRoom && (
        <div role="dialog" aria-modal="true" aria-labelledby="arm-title" className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-3xl w-full max-w-sm space-y-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 id="arm-title" className="text-lg font-bold text-slate-900 dark:text-white font-display">Configure Room Space</h3>
              <button 
                onClick={() => setShowAddRoom(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded-lg outline-none"
                aria-label="Close add room space modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={triggerAddRoom} className="space-y-4 text-xs">
              <div>
                <label htmlFor="arm-name" className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Space Name</label>
                <input
                  id="arm-name"
                  type="text" required placeholder="e.g. Master Bedroom"
                  value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="arm-length" className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-wider text-[9px]">Length (ft)</label>
                  <input
                    id="arm-length"
                    type="number" placeholder="14"
                    value={roomL} onChange={(e) => setRoomL(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="arm-width" className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-wider text-[9px]">Width (ft)</label>
                  <input
                    id="arm-width"
                    type="number" placeholder="12"
                    value={roomW} onChange={(e) => setRoomW(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="arm-height" className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-wider text-[9px]">Height (ft)</label>
                  <input
                    id="arm-height"
                    type="number" placeholder="10"
                    value={roomH} onChange={(e) => setRoomH(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="arm-notes" className="block text-slate-500 dark:text-slate-400 mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Space Notes</label>
                <textarea
                  id="arm-notes"
                  placeholder="Wiring parameters, tiling area specs..." rows={2}
                  value={roomNotes} onChange={(e) => setRoomNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 transition-all"
                />
              </div>
              <button type="submit" className="w-full bg-[#A8B89A] hover:bg-[#96A689] text-white p-3 rounded-xl font-bold tracking-wider min-h-[48px] flex items-center justify-center transition active:scale-[0.99] outline-none cursor-pointer shadow-sm">
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
  const navigate = useNavigate();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [saved, setSaved] = useState(false);

  const { themeMode, setThemeMode, backgroundStyle, setBackgroundStyle, logout } = useAppStore();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(name, email);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">System Settings & Profile</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Configure your workspace variables, audit profiles, and brand themes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Profile Card Form & Account Session */}
        <div className="space-y-6">
          <div className="glass-panel p-6 bg-white/95 dark:bg-slate-900/40 border border-[#A8B89A]/15 dark:border-slate-800/80 space-y-6 shadow-sm">
            <h3 className="text-md font-semibold text-[#4B4B4B] dark:text-[#E5E7EB] font-display">User Profile Details</h3>
            
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label htmlFor="settings-name" className="block text-[#7D7D7D] dark:text-[#94A3B8] mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Full Name</label>
                <input
                  id="settings-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8F6F3] dark:bg-slate-950 border border-[#A8B89A]/20 dark:border-slate-800/80 p-3 rounded-xl text-[#4B4B4B] dark:text-white outline-none focus:border-[#A8B89A] transition-all"
                />
              </div>

              <div>
                <label htmlFor="settings-email" className="block text-[#7D7D7D] dark:text-[#94A3B8] mb-1.5 font-semibold uppercase tracking-wider text-[10px]">Email Address</label>
                <input
                  id="settings-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F8F6F3] dark:bg-slate-950 border border-[#A8B89A]/20 dark:border-slate-800/80 p-3 rounded-xl text-[#4B4B4B] dark:text-white outline-none focus:border-[#A8B89A] transition-all"
                />
              </div>

              <div>
                <label className="block text-[#7D7D7D] dark:text-[#94A3B8] mb-1.5 font-semibold uppercase tracking-wider text-[10px]">System Access Role (Read-Only)</label>
                <div className="w-full bg-[#F8F6F3]/50 dark:bg-slate-950/50 border border-[#A8B89A]/15 dark:border-slate-800/80 p-3 rounded-xl text-[#8AA17A] dark:text-emerald-400 font-bold">
                  {currentUser.role}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#A8B89A] hover:bg-[#96A689] text-white font-medium rounded-xl hover:brightness-105 active:scale-[0.98] transition-all outline-none shadow-sm shadow-[#A8B89A]/10 cursor-pointer"
                >
                  Save Changes
                </button>
                <AnimatePresence>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-[#8AA17A] font-semibold"
                    >
                      Profile saved!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>

          <div className="glass-panel p-6 bg-white/95 dark:bg-slate-900/40 border border-[#A8B89A]/15 dark:border-slate-800/80 space-y-4 shadow-sm">
            <h3 className="text-md font-semibold text-[#4B4B4B] dark:text-[#E5E7EB] font-display">Account Session</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Manage your active authentication session and security credentials.</p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-[#C89A9A] text-xs font-semibold rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer border border-rose-500/20 hover:border-rose-500/40 outline-none"
              >
                <Trash2 size={14} className="text-[#C89A9A]" />
                Terminate Active Session (Logout)
              </button>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="glass-panel p-6 bg-white/95 dark:bg-slate-900/40 border border-[#A8B89A]/15 dark:border-slate-800/80 space-y-6 shadow-sm">
          <h3 className="text-md font-semibold text-[#4B4B4B] dark:text-[#E5E7EB] font-display">Appearance Settings</h3>
          
          <div className="space-y-6 text-xs">
            {/* Theme Mode Toggle */}
            <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <label className="block text-[#7D7D7D] dark:text-[#94A3B8] font-semibold uppercase tracking-wider text-[10px]">Theme Mode</label>
              <div className="flex gap-2 p-1 bg-[#F8F6F3] dark:bg-slate-950 border border-[#A8B89A]/15 dark:border-slate-800/80 rounded-xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setThemeMode('light')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-250 ${
                    themeMode === 'light'
                      ? 'bg-white dark:bg-slate-900 text-[#A8B89A] shadow-sm border border-[#A8B89A]/15 dark:border-slate-800'
                      : 'text-[#7D7D7D] hover:text-[#4B4B4B] dark:hover:text-white border border-transparent'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M5.25 12H3m18 0h-2.25m-2.813-6.187l-1.59 1.59M7.05 16.95l-1.59 1.59m13.062 0l-1.59-1.59M7.05 7.05L5.46 5.46M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"></path>
                  </svg>
                  <span>Light Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-250 ${
                    themeMode === 'dark'
                      ? 'bg-white dark:bg-slate-900 text-[#A8B89A] shadow-sm border border-[#A8B89A]/15 dark:border-slate-800'
                      : 'text-[#7D7D7D] hover:text-[#4B4B4B] dark:hover:text-white border border-transparent'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"></path>
                  </svg>
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Background Style Selector (Preview Cards) */}
            <div className="space-y-3">
              <label className="block text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Luxury Background Texture</label>
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
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-slate-50 dark:bg-slate-950/40' 
                          : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-slate-950/20'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-950 relative">
                        <img 
                          src={option.src} 
                          alt={option.label}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
                        />
                        {/* Overlay to darken slightly */}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                        {/* Selected Indicator */}
                        {selected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border border-white/25">
                            <svg className="w-3.5 h-3.5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {/* Label */}
                      <div className="p-2.5">
                        <span className={`text-[10px] font-bold block truncate transition-colors ${
                          selected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                        }`}>
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed space-y-1">
              <p>Background selections apply instantly and persist across refresh actions.</p>
              <p>Parallax scrolling is optimized for desktop viewports and disabled on mobile devices.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectDetailsModal() {
  const store = useAppStore();
  const activeDetails = store.projectDetails;
  const currentUser = store.currentUser;

  const handleUpdateConceptStatus = store.updateConceptStatus;
  const handleCreateSiteVisit = store.createSiteVisit;
  const handleCreateTask = store.createTask;
  const handleUpdateTaskStatus = store.updateTaskStatus;
  const handleDeleteTask = store.deleteTask;
  const setShowDetailsPopup = store.setShowDetailsPopup;

  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [visitForm, setVisitForm] = useState({ visitDate: '', visitorName: '', notes: '' });
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', assignedTo: 'Designer', dueDate: '' });

  if (!activeDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={() => setShowDetailsPopup(false)}
      />
      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-[28px] w-full max-w-4xl space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] text-left relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                {activeDetails.project.name}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getBadgeStyles(activeDetails.project.status)}`}>
                {activeDetails.project.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
              Client: <strong className="text-slate-800 dark:text-white">{activeDetails.project.client_name}</strong>
            </p>
          </div>
          <button 
            onClick={() => setShowDetailsPopup(false)} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 focus-visible:ring-2 focus-visible:ring-emerald-500/50 outline-none rounded-lg cursor-pointer" 
            title="Close Details"
            aria-label="Close details popup"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Side: Core Metadata & Notes */}
          <div className="md:col-span-1 space-y-4 md:border-r border-slate-100 dark:border-slate-800/60 md:pr-6">
            <div className="space-y-2 text-xs">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase tracking-wider font-bold">Contact Information</span>
              <div className="flex flex-col gap-1.5 text-[10px] text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5"><Phone size={10} className="text-[#A8B89A]" /> {activeDetails.project.client_phone}</span>
                <span className="flex items-center gap-1.5"><Mail size={10} className="text-[#A8B89A]" /> {activeDetails.project.client_email}</span>
                <span className="flex items-center gap-1.5"><MapPin size={10} className="text-[#A8B89A]" /> {activeDetails.project.address}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 space-y-2 text-xs">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block uppercase tracking-wider font-bold">Project Metadata</span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block font-light">Type</span>
                  <span className="text-slate-800 dark:text-white font-medium">{activeDetails.project.client_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block font-light">Start Date</span>
                  <span className="text-slate-800 dark:text-white font-medium">{activeDetails.project.start_date || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block font-light">Designer</span>
                  <span className="text-slate-800 dark:text-white font-medium">{activeDetails.project.assigned_designer || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3">
              <h4 className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1.5">Design Notes</h4>
              <p className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                {activeDetails.project.notes || 'No design notes mapped.'}
              </p>
            </div>
          </div>

          {/* Right Side: Tabbed Dynamic Content */}
          <div className="md:col-span-2 space-y-4">
            {/* Tab Selector */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              {['overview', 'spaces', 'concepts', 'site-visits', 'tasks', 'vendors', 'budget', 'photos'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`pb-1 px-1 border-b-2 transition cursor-pointer ${
                    activeSubTab === tab ? 'border-[#A8B89A] text-[#8AA17A] font-bold' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="text-xs space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {activeSubTab === 'overview' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block mb-0.5 uppercase tracking-wider font-bold">Budget Limit</span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">INR {activeDetails.project.budget.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-xl">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block mb-0.5 uppercase tracking-wider font-bold">Spaces Configured</span>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{activeDetails.rooms.length} Rooms</p>
                  </div>
                </div>
              )}

              {activeSubTab === 'spaces' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Rooms Mapping</h4>
                  </div>
                  {activeDetails.rooms.map((r: Room) => (
                    <div key={r.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-200">{r.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Dims: {r.length}'x{r.width}'x{r.height}'</p>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 italic">{r.notes ? r.notes.substring(0, 25) + '...' : ''}</span>
                    </div>
                  ))}
                  {activeDetails.rooms.length === 0 && (
                    <p className="text-slate-400 dark:text-slate-500 italic py-6 text-center">No rooms configured.</p>
                  )}
                </div>
              )}

              {activeSubTab === 'concepts' && (
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">Design Concepts (Approvals Portal)</h4>
                  {activeDetails.rooms.flatMap((r: Room) => (r.concepts || []).map((c: any) => (
                    <div key={c.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-slate-200">{c.title} ({r.name})</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border ${
                          c.status === 'Approved' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' :
                          c.status === 'Revised' ? 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20' :
                          'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">{c.description}</p>
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          onClick={() => handleUpdateConceptStatus(c.id, 'Approved')}
                          className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-semibold text-[10px] transition cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateConceptStatus(c.id, 'Revised')}
                          className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-semibold text-[10px] transition cursor-pointer"
                        >
                          Request Revision
                        </button>
                      </div>
                    </div>
                  )))}
                  {activeDetails.rooms.flatMap((r: Room) => r.concepts || []).length === 0 && (
                    <p className="text-slate-400 dark:text-slate-500 italic py-6 text-center">No design concepts uploaded.</p>
                  )}
                </div>
              )}

              {activeSubTab === 'site-visits' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Site Visits Log</h4>
                    {['Admin', 'Interior Designer', 'Project Manager'].includes(currentUser.role) && (
                      <button
                        onClick={() => setShowAddVisit(!showAddVisit)}
                        className="text-[10px] font-bold text-[#8AA17A] hover:underline cursor-pointer"
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
                    }} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 mb-1">Date</label>
                          <input
                            type="date" required
                            value={visitForm.visitDate} onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-2 rounded text-slate-900 dark:text-white outline-none focus:border-[#A8B89A]"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 mb-1">Visitor Name</label>
                          <input
                            type="text" required placeholder="e.g. Rahul Dev (PM)"
                            value={visitForm.visitorName} onChange={(e) => setVisitForm({ ...visitForm, visitorName: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-2 rounded text-slate-900 dark:text-white outline-none focus:border-[#A8B89A]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[10px]">Site Notes</label>
                        <textarea
                          rows={2} placeholder="Slab dimensions, measurements..."
                          value={visitForm.notes} onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-2 rounded text-slate-900 dark:text-white outline-none focus:border-[#A8B89A] text-[10px]"
                        />
                      </div>
                      <button type="submit" className="w-full bg-[#A8B89A] hover:bg-[#96A689] text-white p-2 rounded font-bold text-[10px] cursor-pointer">
                        SCHEDULE VISIT
                      </button>
                    </form>
                  )}

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {activeDetails.siteVisits.map((v: SiteVisit) => (
                      <div key={v.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-slate-900 dark:text-slate-200">{v.visitor_name}</span>
                          <span>{v.visit_date}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{v.notes}</p>
                        <div className="flex gap-2 items-center text-[9px] text-[#8AA17A] font-bold">
                          <MapPin size={10} />
                          <span>Site measurements logged</span>
                        </div>
                      </div>
                    ))}
                    {activeDetails.siteVisits.length === 0 && (
                      <p className="text-slate-400 dark:text-slate-500 italic py-6 text-center">No site visits recorded yet.</p>
                    )}
                  </div>
                </div>
              )}

              {activeSubTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Snag Lists & Tasks</h4>
                    {['Admin', 'Interior Designer', 'Project Manager'].includes(currentUser.role) && (
                      <button
                        onClick={() => setShowAddTask(!showAddTask)}
                        className="text-[10px] font-bold text-[#8AA17A] hover:underline cursor-pointer"
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
                    }} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-3">
                      <div>
                        <label className="block text-slate-500 dark:text-slate-400 mb-1 text-[10px]">Task Title</label>
                        <input
                          type="text" required placeholder="e.g. Check tile grout leveling"
                          value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-2 rounded text-slate-900 dark:text-white outline-none focus:border-[#A8B89A] text-[10px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 mb-1">Assigned Role</label>
                          <select
                            value={taskForm.assignedTo} onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-2 rounded text-slate-900 dark:text-white outline-none focus:border-[#A8B89A] cursor-pointer"
                          >
                            <option value="Designer">Interior Designer</option>
                            <option value="Project Manager">Project Manager</option>
                            <option value="Site Engineer">Site Engineer</option>
                            <option value="Vendor Coordinator">Vendor Coordinator</option>
                            <option value="Admin">Administrator</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 mb-1">Due Date</label>
                          <input
                            type="date"
                            value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-2 rounded text-slate-900 dark:text-white outline-none focus:border-[#A8B89A]"
                          />
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-[#A8B89A] hover:bg-[#96A689] text-white p-2 rounded font-bold text-[10px] cursor-pointer">
                        ADD SNAG TASK
                      </button>
                    </form>
                  )}

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {activeDetails.tasks.map((t: Task) => (
                      <div key={t.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={t.status === 'Completed'}
                            disabled={currentUser.role === 'Client'}
                            onChange={(e) => handleUpdateTaskStatus(t.id, e.target.checked ? 'Completed' : 'In Progress')}
                            className="accent-emerald-500 h-4 w-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <div>
                            <p className={`font-medium ${t.status === 'Completed' ? 'line-through text-slate-400 dark:text-gray-500' : 'text-slate-900 dark:text-slate-200'}`}>
                              {t.title}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-gray-400 mt-0.5">
                              Assigned: {t.assigned_to} • Due: {t.due_date || 'No Date'}
                            </p>
                          </div>
                        </div>
                        {currentUser.role !== 'Client' && (
                          <button
                            onClick={() => handleDeleteTask(t.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    {activeDetails.tasks.length === 0 && (
                      <p className="text-slate-400 dark:text-slate-500 italic py-6 text-center">No tasks assigned.</p>
                    )}
                  </div>
                </div>
              )}

              {activeSubTab === 'vendors' && (
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">Procured Vendors</h4>
                  {Array.from(new Set(activeDetails.selections.map((s: any) => s.vendor_name))).map((vName: any) => {
                    if (!vName) return null;
                    return (
                      <div key={vName} className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-300">{vName}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider">Active Supplier</span>
                      </div>
                    );
                  })}
                  {activeDetails.selections.filter((s: any) => s.vendor_name).length === 0 && (
                    <p className="text-slate-400 dark:text-slate-500 italic py-6 text-center">No vendors assigned to selections.</p>
                  )}
                </div>
              )}

              {activeSubTab === 'budget' && (
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mb-1">Budget utilization</h4>
                  <BudgetSummaryPanel activeDetails={activeDetails} />
                </div>
              )}

              {activeSubTab === 'photos' && (
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-wider text-[#A8B89A] font-bold mb-1.5">Project Photos Gallery</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Photo 1 */}
                    <div className="space-y-1.5 group/photo cursor-pointer relative overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <img
                        src={activeDetails.project.image_url || '/assets/projects/rathods_villa.png'}
                        alt="Main Exterior View"
                        className="w-full h-32 object-cover transition-all duration-300 group-hover/photo:scale-105"
                      />
                      <div className="p-2 bg-slate-50 dark:bg-slate-950/60 text-[10px] text-[#4B4B4B] dark:text-gray-300 font-medium">Main Exterior View</div>
                    </div>

                    {/* Photo 2 */}
                    <div className="space-y-1.5 group/photo cursor-pointer relative overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <img
                        src={`/assets/projects/project_${activeDetails.project.id}_2.png`}
                        alt="Interior View 1"
                        className="w-full h-32 object-cover transition-all duration-300 group-hover/photo:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/backgrounds/luxury_villa.png';
                        }}
                      />
                      <div className="p-2 bg-slate-50 dark:bg-slate-950/60 text-[10px] text-[#4B4B4B] dark:text-gray-300 font-medium">Interior Perspective A</div>
                    </div>

                    {/* Photo 3 */}
                    <div className="space-y-1.5 group/photo cursor-pointer relative overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <img
                        src={`/assets/projects/project_${activeDetails.project.id}_3.png`}
                        alt="Interior View 2"
                        className="w-full h-32 object-cover transition-all duration-300 group-hover/photo:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/backgrounds/modern_living_room.png';
                        }}
                      />
                      <div className="p-2 bg-slate-50 dark:bg-slate-950/60 text-[10px] text-[#4B4B4B] dark:text-gray-300 font-medium">Interior Perspective B</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


