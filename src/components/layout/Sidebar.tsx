import React from 'react';
import { LayoutDashboard, Users, Briefcase, DollarSign, Calendar, Monitor, UserCog, User } from 'lucide-react';
import { Tab, Role } from '@/types';

interface SidebarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    role: Role;
    currentUser: string;
    onLogout: () => void;
}

export const Sidebar = ({ activeTab, setActiveTab, role, currentUser, onLogout }: SidebarProps) => {
    const NavItem = ({ id, icon: Icon, label }: { id: Tab; icon: React.ElementType; label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
        >
            <Icon size={20} />
            {label}
        </button>
    );

    return (
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-6 fixed h-full overflow-y-auto">
            <div className="flex items-center gap-3 mb-10 px-2 flex-shrink-0">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <LayoutDashboard className="text-white" size={24} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Office<span className="text-blue-600">Flow</span></h1>
            </div>

            <nav className="space-y-2 flex-1">
                <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />

                {role === 'admin' && (
                    <>
                        <NavItem id="users" icon={UserCog} label="User Management" />
                        <NavItem id="employees" icon={Users} label="Employees" />
                        <NavItem id="payroll" icon={DollarSign} label="Payroll" />
                    </>
                )}

                {(role === 'admin' || role === 'manager') && (
                    <>
                        <NavItem id="teams" icon={Users} label="Teams" />
                        <NavItem id="projects" icon={Briefcase} label="Projects" />
                    </>
                )}

                {(role === 'admin' || role === 'manager' || role === 'it_support') && (
                    <NavItem id="assets" icon={Monitor} label="Assets" />
                )}

                <NavItem id="leave" icon={Calendar} label="Time Off" />
            </nav>

            <div className="pt-6 border-t border-slate-100 mt-auto flex-shrink-0">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-2 mb-4 hover:bg-slate-50 p-2 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-slate-50' : ''}`}
                >
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {currentUser.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden text-left">
                        <p className="text-sm font-bold text-slate-800 truncate">{currentUser.split('@')[0]}</p>
                        <p className="text-xs text-slate-500 truncate capitalize">{role.replace('_', ' ')}</p>
                    </div>
                </button>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-2 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                >
                    Sign Out
                </button>
            </div>
        </aside>
    );
};
