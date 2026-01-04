import { Users, IndianRupee, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Employee, Project } from '@/types';

import { AnnouncementsWidget } from '@/components/dashboard/AnnouncementsWidget';
import { Announcement } from '@/types';

interface DashboardViewProps {
    employees: Employee[];
    projects: Project[];
    totalPayroll: number;
    announcements: Announcement[];
    isAdmin: boolean;
    onPostAnnouncement: (title: string, content: string) => void;
}

export const DashboardView = ({
    employees,
    projects,
    totalPayroll,
    announcements,
    isAdmin,
    onPostAnnouncement
}: DashboardViewProps) => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'Completed' || p.status === 'Done').length;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>

            <AnnouncementsWidget
                announcements={announcements}
                isAdmin={isAdmin}
                onPostAnnouncement={onPostAnnouncement}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total Employees</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{employees.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <Users size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Monthly Payroll</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">
                                ₹{totalPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </h3>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                            <IndianRupee size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Active Projects</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{totalProjects - completedProjects}</h3>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                            <Briefcase size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Projects</h3>
                    <div className="space-y-3">
                        {projects.slice(0, 3).map(proj => (
                            <div key={proj.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                <span className="font-medium text-slate-700">{proj.title}</span>
                                <Badge status={proj.status} />
                            </div>
                        ))}
                        {projects.length === 0 && <p className="text-slate-400 italic">No projects yet.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};
