/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  LayoutDashboard, 
  Library, 
  Settings, 
  ChevronRight, 
  MoreVertical, 
  Plus, 
  Search,
  Bell,
  Archive,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileDown,
  ChevronDown,
  Filter,
  User,
  ArrowLeft,
  Briefcase,
  Layers,
  Zap,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Role, 
  Project, 
  Client, 
  ServiceCategory, 
  ProjectStatus, 
  Notification, 
  VaultItem 
} from './types';
import { 
  CLIENTS, 
  SERVICE_COLORS, 
  INITIAL_PROJECTS, 
  INITIAL_VAULT, 
  NOTIFICATION_TYPES 
} from './constants';

// --- UTILS ---

const calculateTotalProgress = (project: Project): number => {
  let total = 0;
  project.steps.forEach((step, index) => {
    if (index < project.currentStepIndex) {
      total += 100 * step.weight;
    } else if (index === project.currentStepIndex) {
      total += step.progress * step.weight;
    }
  });
  return Math.round(total);
};

const getServiceColor = (service: ServiceCategory) => SERVICE_COLORS[service] || '#FFFFFF';

// --- COMPONENTS ---

export default function App() {
  const [activeRole, setActiveRole] = useState<Role>('ADMIN');
  const [viewAsClient, setViewAsClient] = useState(false);
  const [currentPath, setCurrentPath] = useState<'dashboard' | 'library' | 'detail'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // App State (Zero-Backend)
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>(INITIAL_VAULT);
  
  // Admin Filters
  const [filters, setFilters] = useState({
    services: [] as ServiceCategory[],
    clients: [] as string[],
    status: [] as ProjectStatus[],
  });

  const currentUser = useMemo(() => CLIENTS.find(c => c.role === activeRole)!, [activeRole]);
  const isAdmin = activeRole === 'ADMIN';
  const effectiveIsClientView = !isAdmin || viewAsClient;

  // Derive filtered projects
  const filteredProjects = useMemo(() => {
    if (!isAdmin) {
      return projects.filter(p => p.clientId === activeRole);
    }
    
    return projects.filter(p => {
      const matchService = filters.services.length === 0 || filters.services.includes(p.serviceType);
      const matchClient = filters.clients.length === 0 || filters.clients.includes(p.clientId);
      const matchStatus = filters.status.length === 0 || filters.status.includes(p.status);
      return matchService && matchClient && matchStatus;
    });
  }, [projects, activeRole, isAdmin, filters]);

  // Actions
  const handleUpdateStepProgress = (projectId: string, progress: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newSteps = [...p.steps];
      newSteps[p.currentStepIndex].progress = progress;
      if (progress === 100) {
        newSteps[p.currentStepIndex].isCompleted = true;
      }
      return { ...p, steps: newSteps, updatedAt: new Date().toISOString() };
    }));
  };

  const handleNextStep = (projectId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId || p.currentStepIndex >= p.steps.length - 1) return p;
      const newSteps = [...p.steps];
      newSteps[p.currentStepIndex].isCompleted = true;
      newSteps[p.currentStepIndex].progress = 100;
      return { ...p, currentStepIndex: p.currentStepIndex + 1, steps: newSteps, updatedAt: new Date().toISOString() };
    }));
  };

  const handleFinalizeProject = (projectId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return { ...p, status: 'Finished', updatedAt: new Date().toISOString() };
    }));
  };

  const sendNotification = (clientId: string, type: any, message: string) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      clientId,
      type,
      message,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const navigateToDetail = (id: string) => {
    setSelectedProjectId(id);
    setCurrentPath('detail');
  };

  // --- RENDER HELPERS ---

  return (
    <div className="flex h-screen bg-brand-black text-brand-white overflow-hidden font-sans">
      {/* SIDEBAR */}
      {!effectiveIsClientView && (
        <aside className="w-64 border-r border-zinc-900 flex flex-col pt-6">
          <div className="px-6 mb-10 flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold tracking-tighter text-xl">S</div>
            <span className="font-bold tracking-tight text-sm uppercase">Content Manager</span>
          </div>
          
          <nav className="flex-1 px-3 space-y-1">
            <NavButton 
              active={currentPath === 'dashboard'} 
              onClick={() => setCurrentPath('dashboard')} 
              icon={<LayoutDashboard size={18} />} 
              label="Dashboard" 
            />
            <NavButton 
              active={currentPath === 'library'} 
              onClick={() => setCurrentPath('library')} 
              icon={<Archive size={18} />} 
              label="Project Library" 
            />
            <div className="pt-6 pb-2 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Filters</div>
            
            <FilterSection 
              label="Services" 
              options={Object.keys(SERVICE_COLORS) as ServiceCategory[]}
              selected={filters.services}
              onToggle={(val) => setFilters(f => ({
                ...f, 
                services: f.services.includes(val) ? f.services.filter(s => s !== val) : [...f.services, val]
              }))}
            />
            <FilterSection 
              label="Clients" 
              options={CLIENTS.filter(c => c.id !== 'ADMIN').map(c => c.id)}
              displayMap={(id) => CLIENTS.find(c => c.id === id)?.name || id}
              selected={filters.clients}
              onToggle={(val) => setFilters(f => ({
                ...f, 
                clients: f.clients.includes(val) ? f.clients.filter(s => s !== val) : [...f.clients, val]
              }))}
            />
          </nav>
        </aside>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* COMMAND BAR */}
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-brand-black/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            {currentPath === 'detail' && (
              <button 
                onClick={() => setCurrentPath('dashboard')} 
                className="flex items-center gap-2 px-2 py-1 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white"
              >
                <ArrowLeft size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Back to Overview</span>
              </button>
            )}
            <h1 className="text-sm font-bold tracking-tight uppercase">
              {currentPath === 'dashboard' ? (effectiveIsClientView ? 'Client Portal' : 'Active Projects Overview') : 
               currentPath === 'library' ? 'Project Library' : 'Project Details'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {effectiveIsClientView && (
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/50 rounded-full border border-zinc-800">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-mono uppercase text-zinc-400">Live Sync Active</span>
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <button className="text-zinc-400 hover:text-white transition-colors">
                <Search size={18} />
              </button>
              <div className="relative">
                <Bell size={18} className="text-zinc-400" />
                {notifications.filter(n => n.clientId === activeRole && !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>

              {/* PROFILE DROPDOWN */}
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 pl-3 pr-1 py-1 hover:bg-zinc-900 rounded-full border border-transparent hover:border-zinc-800 transition-all"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-bold tracking-tight">{currentUser.name}</div>
                    <div className="text-[9px] text-zinc-500 uppercase tracking-widest leading-none mt-0.5">{isAdmin ? 'Agency Admin' : 'Client Access'}</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold border border-zinc-700">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-zinc-800">
                          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Switch Perspective</div>
                        </div>
                        <div className="p-1">
                          {CLIENTS.map((client) => (
                            <button
                              key={client.role}
                              onClick={() => {
                                setActiveRole(client.role);
                                setViewAsClient(false);
                                setCurrentPath('dashboard');
                                setProfileOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] transition-all ${
                                activeRole === client.role 
                                  ? 'bg-white text-black font-bold' 
                                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${activeRole === client.role ? 'bg-black' : 'bg-zinc-600'}`}></div>
                              {client.name}
                            </button>
                          ))}
                        </div>
                        <div className="p-1 border-t border-zinc-800 mt-1">
                          <button 
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] text-zinc-500 hover:text-white"
                            onClick={() => setProfileOpen(false)}
                          >
                            <Settings size={14} />
                            Account Settings
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <AnimatePresence mode="wait">
            {currentPath === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 max-w-7xl mx-auto w-full"
              >
                {effectiveIsClientView ? (
                  <ClientDashboardView 
                    client={currentUser} 
                    projects={filteredProjects} 
                    onProjectClick={navigateToDetail}
                    notifications={notifications.filter(n => n.clientId === activeRole)}
                  />
                ) : (
                  <AdminDashboardView 
                    projects={projects} 
                    filteredProjects={filteredProjects}
                    onProjectClick={navigateToDetail}
                    onFinalize={handleFinalizeProject}
                  />
                )}
              </motion.div>
            )}

            {currentPath === 'library' && (
              <motion.div 
                key="library"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 max-w-7xl mx-auto w-full"
              >
                <LibraryView vaultItems={vaultItems} />
              </motion.div>
            )}

            {currentPath === 'detail' && selectedProjectId && (
              <motion.div 
                key="detail"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="p-8 max-w-7xl mx-auto w-full"
              >
                <ProjectDetailView 
                  project={projects.find(p => p.id === selectedProjectId)!}
                  isAdmin={isAdmin && !viewAsClient}
                  onUpdateProgress={handleUpdateStepProgress}
                  onNextStep={handleNextStep}
                  onSendNotification={sendNotification}
                  viewAsClient={viewAsClient}
                  setViewAsClient={setViewAsClient}
                  notifications={notifications}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
}

// --- SUB-COMPONENTS ---

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
        active ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/2'
      }`}
    >
      <span className={`${active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{icon}</span>
      <span className="font-medium tracking-tight">{label}</span>
      {active && <motion.div layoutId="nav-active" className="ml-auto w-1 h-4 bg-white rounded-full" />}
    </button>
  );
}

function FilterSection({ label, options, selected, onToggle, displayMap }: { 
  label: string; 
  options: any[]; 
  selected: any[]; 
  onToggle: (val: any) => void;
  displayMap?: (val: any) => string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="py-2">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-300 transition-colors"
      >
        {label}
        <ChevronRight size={10} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="px-4 space-y-0.5 mt-1">
          {options.map(opt => {
            const isSel = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => onToggle(opt)}
                className={`w-full text-left px-3 py-1.5 rounded-md text-[11px] transition-colors flex items-center gap-2 ${
                  isSel ? 'text-white bg-zinc-800/50' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                <div className={`w-2 h-2 rounded-sm border ${isSel ? 'bg-white border-white' : 'border-zinc-700'}`} />
                <span className="truncate">{displayMap ? displayMap(opt) : opt}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdminDashboardView({ projects, filteredProjects, onProjectClick, onFinalize }: any) {
  const stats = [
    { label: 'Active Streams', value: projects.filter(p => p.status === 'Active').length, icon: <Briefcase size={20} /> },
    { label: 'Pending Revs', value: 12, icon: <Clock size={20} /> },
    { label: 'Finished', value: projects.filter(p => p.status === 'Finished').length, icon: <CheckCircle2 size={20} /> },
    { label: 'Avg Progress', value: '64%', icon: <LayoutDashboard size={20} /> },
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl group hover:border-zinc-700 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-zinc-800 rounded-xl group-hover:bg-zinc-700 transition-colors">{s.icon}</div>
              <MoreHorizontal size={16} className="text-zinc-600" />
            </div>
            <div className="text-2xl font-bold tracking-tighter mb-1">{s.value}</div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight">Active Project List</h2>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <Filter size={14} />
            Viewing {filteredProjects.length} Projects
          </div>
        </div>
        
        <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-900/50 border-b border-zinc-900">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Project</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Service</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Progress</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredProjects.map((p: Project) => {
                const progress = calculateTotalProgress(p);
                return (
                  <tr 
                    key={p.id} 
                    onClick={() => onProjectClick(p.id)}
                    className="group hover:bg-zinc-800/30 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold tracking-tight group-hover:text-white transition-colors">{p.title}</div>
                      <div className="text-[10px] text-zinc-500 mt-1 uppercase font-mono">ID: {p.id}</div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-zinc-300">
                      {CLIENTS.find(c => c.id === p.clientId)?.name}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getServiceColor(p.serviceType) }}></div>
                        <span className="text-xs font-medium">{p.serviceType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden w-24">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-white" 
                          />
                        </div>
                        <span className="text-[10px] font-mono font-bold">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase border ${
                        p.status === 'Active' ? 'text-green-400 border-green-400/20 bg-green-400/5' : 'text-zinc-500 border-zinc-700 bg-zinc-900'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ClientDashboardView({ client, projects, onProjectClick, notifications }: any) {
  const pendingActions = notifications.filter((n: any) => !n.read);
  
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <div className="flex flex-col items-center text-center mb-16 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[12px] font-bold text-zinc-500 uppercase tracking-widest mb-4"
        >
          Welcome Back, {client.name}
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Operations Center</h1>
        <p className="text-zinc-500 text-sm max-w-lg leading-relaxed">
          Manage your active creative streams, review pending assets, and track progress milestones in real-time.
        </p>
      </div>

      {/* ACTION CENTER */}
      {pendingActions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 pl-2">
            <AlertCircle size={14} className="text-red-500" />
            Actions Required
          </div>
          <div className="grid grid-cols-1 gap-3">
            {pendingActions.map((notif: any) => (
              <motion.div 
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between group hover:border-red-500/30 transition-all border-l-4 border-l-red-500"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">{notif.type}</div>
                    <div className="text-sm font-medium tracking-tight text-white">{notif.message}</div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-zinc-200 transition-colors">
                  Resolve
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* PROJECT CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 pl-2">
          <span>Active Streams</span>
          <span>{projects.filter((p: any) => p.status === 'Active').length} Running</span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {projects.filter((p: any) => p.status === 'Active').map((p: Project) => {
            const progress = calculateTotalProgress(p);
            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -4 }}
                onClick={() => onProjectClick(p.id)}
                className="bg-zinc-900/50 border border-zinc-900 p-8 rounded-3xl cursor-pointer hover:bg-zinc-900 hover:border-zinc-800 transition-all group"
              >
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getServiceColor(p.serviceType) }}></div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{p.serviceType}</span>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">{p.title}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold tracking-tighter">{progress}%</div>
                    <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Complete</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <span>Next Milestone: {p.steps[p.currentStepIndex].name}</span>
                    <span>Due {p.steps[p.currentStepIndex].dueDate}</span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-white" 
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* FINISHED PROJECTS */}
      {projects.filter((p: any) => p.status === 'Finished').length > 0 && (
        <div className="space-y-4 pt-8">
           <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em] mb-4 pl-2">Legacy Archive</div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.filter((p: any) => p.status === 'Finished').map((p: Project) => (
                <div key={p.id} className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl flex items-center justify-between opacity-60">
                   <div>
                    <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">{p.serviceType}</div>
                    <div className="text-sm font-bold text-zinc-400">{p.title}</div>
                   </div>
                   <CheckCircle2 size={18} className="text-zinc-700" />
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}

function LibraryView({ vaultItems }: { vaultItems: VaultItem[] }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Library</h2>
          <p className="text-zinc-500 text-sm mt-1">Access all official documents and visual assets for your projects.</p>
        </div>
        <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors">
          <Plus size={16} />
          Add Document
        </button>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-900/50 border-b border-zinc-900">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Document</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Type</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Size</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {vaultItems.map(item => (
              <tr key={item.id} className="group hover:bg-zinc-900/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-zinc-700 transition-colors text-zinc-400 group-hover:text-white">
                      <FileText size={18} />
                    </div>
                    <span className="text-sm font-medium tracking-tight">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase border border-zinc-800 bg-zinc-900 text-zinc-400`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-zinc-500">{item.date}</td>
                <td className="px-6 py-4 text-xs font-mono text-zinc-500">{item.size}</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                    <FileDown size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectDetailView({ 
  project, 
  isAdmin, 
  onUpdateProgress, 
  onNextStep, 
  onSendNotification,
  viewAsClient,
  setViewAsClient,
  notifications
}: any) {
  const currentStep = project.steps[project.currentStepIndex];
  const totalProgress = calculateTotalProgress(project);
  
  const [notifType, setNotifType] = useState(NOTIFICATION_TYPES[0]);
  const [notifMsg, setNotifMsg] = useState('');

  const sendAction = () => {
    onSendNotification(project.clientId, notifType, notifMsg || `Update for: ${project.title}`);
    setNotifMsg('');
  };

  const projectRequests = notifications?.filter((n: any) => n.clientId === project.clientId) || [];

  return (
    <div className="space-y-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getServiceColor(project.serviceType) }}></div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{project.serviceType}</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter">{project.title}</h2>
          
          {!viewAsClient && isAdmin && (
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Account:</span>
                <span className="text-xs font-bold">{CLIENTS.find(c => c.id === project.clientId)?.name}</span>
              </div>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl">
            <button 
              onClick={() => setViewAsClient(false)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${!viewAsClient ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              Admin View
            </button>
            <button 
              onClick={() => setViewAsClient(true)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${viewAsClient ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              View as Client
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* TRACKER */}
          <div className="bg-zinc-900/50 border border-zinc-900 p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Project Health</div>
                <div className="text-xl font-bold">{totalProgress}% Synchronized</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Target Delivery</div>
                <div className="text-xl font-bold">{project.steps[project.steps.length-1].dueDate}</div>
              </div>
            </div>

            <div className="relative h-20 mb-8">
               <div className="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-800 -translate-y-1/2"></div>
               <div className="relative flex justify-between">
                {project.steps.map((step: any, i: number) => {
                  const isActive = i === project.currentStepIndex;
                  const isDone = i < project.currentStepIndex || (i === project.currentStepIndex && step.progress === 100);
                  
                  return (
                    <div key={step.name} className="flex flex-col items-center gap-4 relative z-10">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        isDone ? 'bg-white border-white text-black' : 
                        isActive ? 'bg-brand-black border-white text-white' : 
                        'bg-brand-black border-zinc-800 text-zinc-600'
                      }`}>
                        {isDone ? <CheckCircle2 size={18} /> : <span className="text-[10px] font-bold">{i+1}</span>}
                      </div>
                      <div className="absolute top-14 text-center w-32">
                        <div className={`text-[9px] font-bold uppercase tracking-widest ${isActive || isDone ? 'text-white' : 'text-zinc-600'}`}>
                          {step.name}
                        </div>
                        <div className="text-[8px] font-mono text-zinc-700 mt-0.5">{step.dueDate}</div>
                      </div>
                    </div>
                  );
                })}
               </div>
            </div>
            
            <div className="pt-16">
              {!viewAsClient && isAdmin ? (
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Step Intensity: {currentStep.name}</span>
                    <span className="font-mono text-white font-bold">{currentStep.progress}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="5"
                    value={currentStep.progress}
                    onChange={(e) => onUpdateProgress(project.id, parseInt(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                  <div className="flex justify-between mt-8">
                    <div className="text-[9px] font-mono text-zinc-600 uppercase">Weighting Component: {(currentStep.weight * 100).toFixed(0)}%</div>
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Live Adjustment Mode</div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-2xl">
                   <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Phase</div>
                    <div className="text-[10px] font-mono text-white tracking-widest uppercase">{currentStep.name}</div>
                   </div>
                   <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${currentStep.progress}%` }}
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
                    />
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* PROJECT TIMELINE */}
          <div className="space-y-4">
             <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 pl-4">Project Timeline</h3>
             <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`bg-zinc-900/30 border p-4 rounded-xl flex items-center justify-between ${i === 1 ? 'border-zinc-700 bg-zinc-900/50' : 'border-zinc-900'}`}>
                    <div className="flex items-center gap-4">
                      <Clock size={16} className={i === 1 ? "text-white" : "text-zinc-700"} />
                      <div>
                        <div className={`text-xs font-medium ${i === 1 ? 'text-white' : 'text-zinc-400'}`}>
                          Progress Update: {project.steps[project.currentStepIndex > 0 ? project.currentStepIndex - 1 : 0].name}
                          {i === 1 && <span className="ml-3 px-1.5 py-0.5 bg-white text-black text-[8px] font-bold uppercase rounded">New</span>}
                        </div>
                        <div className="text-[10px] text-zinc-600">Core Ops Admin • May {10-i}, 2024</div>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* ACTION CENTER - ADMIN ONLY */}
          {!viewAsClient && isAdmin && (
            <div className="bg-zinc-900 border border-white/5 p-6 rounded-3xl space-y-6">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} className="text-white" />
                <h3 className="text-sm font-bold uppercase tracking-tighter">Agency Request</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Action Required</label>
                  <select 
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs outline-none focus:border-white transition-colors"
                  >
                    {NOTIFICATION_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Request Details</label>
                  <textarea 
                    value={notifMsg}
                    onChange={(e) => setNotifMsg(e.target.value)}
                    placeholder="Describe what is needed from the client..."
                    className="w-full h-24 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-lg text-xs outline-none focus:border-white transition-colors resize-none"
                  />
                </div>
                
                <button 
                  onClick={sendAction}
                  className="w-full py-3 bg-white text-black text-[10px] font-bold uppercase rounded-xl transition-all hover:bg-zinc-200"
                >
                  Send to Client
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE REQUESTS - CLIENT VIEW */}
          {viewAsClient && (
            <div className="bg-zinc-900/50 border border-red-500/20 p-6 rounded-3xl space-y-6">
               <div className="flex items-center gap-3 text-red-400">
                <AlertCircle size={18} />
                <h3 className="text-sm font-bold uppercase tracking-tighter">Active Requests</h3>
              </div>
              <div className="space-y-4">
                {projectRequests.length > 0 ? projectRequests.map((req: any) => (
                  <div key={req.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <div className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1">{req.type}</div>
                    <div className="text-xs text-zinc-300 leading-relaxed">{req.message}</div>
                  </div>
                )) : (
                  <div className="text-center py-4">
                    <CheckCircle2 size={24} className="text-zinc-800 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No Pending Actions</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROJECT RESOURCES */}
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-600">Resources</h3>
                <Library size={16} className="text-zinc-600" />
             </div>
             <div className="space-y-4">
                <ResourceRow name="Statement of Work" type="SOW" />
                <ResourceRow name="Master Services Agreement" type="CONT" />
                <ResourceRow name="Brand Assets Pack" type="ZIP" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceRow({ name, type }: { name: string; type: string }) {
  return (
    <div className="flex items-center justify-between group p-1 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-500 group-hover:text-white group-hover:border-zinc-700">
           {type}
        </div>
        <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200">{name}</span>
      </div>
      <FileDown size={14} className="text-zinc-700 group-hover:text-zinc-300 cursor-pointer" />
    </div>
  );
}
