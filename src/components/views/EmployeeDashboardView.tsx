import React, { useState } from 'react';
import { Briefcase, Clock, Edit2, Save, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Project, Employee } from '@/types';

interface EmployeeDashboardViewProps {
    currentUser: Employee;
    projects: Project[];
    isAdmin?: boolean;
    onUpdateMetrics?: (metrics: Partial<Employee>) => void;
}

export const EmployeeDashboardView = ({ currentUser, projects, isAdmin, onUpdateMetrics }: EmployeeDashboardViewProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedMetrics, setEditedMetrics] = useState({
        monthlyTarget: currentUser.monthlyTarget || 0,
        tasksCompleted: currentUser.tasksCompleted || 0,
    });

    const myProjects = projects.filter(p => p.assignee === currentUser.name);
    const completedProjects = myProjects.filter(p => p.status === 'Completed' || p.status === 'Done').length;

    const handleSaveMetrics = () => {
        if (onUpdateMetrics) {
            onUpdateMetrics(editedMetrics);
        }
        setIsEditing(false);
    };



    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Welcome back, {currentUser.name}</h2>
                    <p className="text-slate-500">Here's your personal overview for today.</p>
                </div>
                <div className="text-right flex items-center gap-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500">Monthly Target</p>
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    className="w-16 p-1 border rounded"
                                    value={editedMetrics.tasksCompleted}
                                    onChange={e => setEditedMetrics({ ...editedMetrics, tasksCompleted: Number(e.target.value) })}
                                />
                                <span>/</span>
                                <input
                                    type="number"
                                    className="w-16 p-1 border rounded"
                                    value={editedMetrics.monthlyTarget}
                                    onChange={e => setEditedMetrics({ ...editedMetrics, monthlyTarget: Number(e.target.value) })}
                                />
                            </div>
                        ) : (
                            <p className="text-xl font-bold text-blue-600">
                                {currentUser.tasksCompleted || 0} / {currentUser.monthlyTarget || 0} Tasks
                            </p>
                        )}
                    </div>
                    {isAdmin && !isEditing && (
                        <Button variant="secondary" onClick={() => setIsEditing(true)}>
                            <Edit2 size={16} /> Edit Metrics
                        </Button>
                    )}
                    {isEditing && (
                        <div className="flex gap-2">
                            <Button onClick={handleSaveMetrics} className="bg-green-600 hover:bg-green-700">
                                <Save size={16} /> Save
                            </Button>
                            <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                <X size={16} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">My Active Projects</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{myProjects.length - completedProjects}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <Briefcase size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">My Assigned Projects</h3>
                    <div className="space-y-4">
                        {myProjects.map(proj => (
                            <div key={proj.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-800">{proj.title}</h4>
                                        <Badge status={proj.status} />
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><Clock size={14} /> Due: {proj.deadline}</span>
                                    </div>
                                </div>
                                {proj.status !== 'Completed' && proj.status !== 'Done' && (
                                    <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-2/3"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {myProjects.length === 0 && (
                            <p className="text-slate-400 italic text-center py-4">No projects assigned to you.</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};
