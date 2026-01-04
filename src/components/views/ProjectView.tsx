import React from 'react';
import { Users, Clock, Trash2, Briefcase } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Project, Employee, Team } from '@/types';

interface ProjectViewProps {
    projects: Project[];
    employees: Employee[];
    teams: Team[];
    onAdd: (e: React.FormEvent<HTMLFormElement>) => void;
    onEdit: (project: Project) => void;
    onRemove: (id: number | string) => void;
    onUpdateStatus: (id: number | string, newStatus: string) => void;
    userRole?: 'admin' | 'manager' | 'employee' | 'it_support';
    currentUser?: Employee;
}

export const ProjectView = ({
    projects,
    employees,
    teams,
    onAdd,
    onEdit,
    onRemove,
    onUpdateStatus,
    userRole = 'admin',
    currentUser
}: ProjectViewProps) => {
    const [editingProject, setEditingProject] = React.useState<Project | null>(null);

    const isAdmin = userRole === 'admin';

    // Filter projects: Admin sees all. Manager sees assigned to them or their team.
    const visibleProjects = isAdmin
        ? projects
        : projects.filter(p =>
            p.assignees?.includes(currentUser?.name || '') ||
            (currentUser?.name && teams.find(t => t.name === p.assignedTeam)?.teamLead === currentUser.name)
        );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (editingProject) {
            const form = e.currentTarget;
            const formData = new FormData(form);
            const assignees = formData.getAll('assignees') as string[];

            const updatedProject: Project = {
                ...editingProject,
                title: formData.get('title') as string,
                assignees: assignees,
                assignedTeam: formData.get('assignedTeam') as string,
                deadline: formData.get('deadline') as string,
            };

            onEdit(updatedProject);
            setEditingProject(null);
            form.reset();
        } else {
            onAdd(e);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Project Management</h2>
                <div className="flex gap-2 text-sm text-slate-500 bg-slate-100 p-1 rounded-lg">
                    <span className="px-3 py-1 bg-white shadow-sm rounded-md text-slate-800 font-medium">All</span>
                    <span className="px-3 py-1">Active</span>
                    <span className="px-3 py-1">Completed</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Project List */}
                <div className="lg:col-span-8 space-y-4">
                    {visibleProjects.map(proj => {
                        const assignedTeamName = teams.find(t => t.id === proj.assignedTeam)?.name;
                        const assigneeDisplay = proj.assignees?.join(', ') || proj.assignee || 'Unassigned';

                        return (
                            <Card key={proj.id} className="p-4">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-slate-800 text-lg">{proj.title}</h3>
                                            <Badge status={proj.status} />
                                        </div>
                                        <div className="text-sm text-slate-500 space-y-1">
                                            <p className="flex items-center gap-2">
                                                <Users size={14} />
                                                <span className="font-medium">Assignees:</span> {assigneeDisplay}
                                            </p>
                                            {assignedTeamName && (
                                                <p className="flex items-center gap-2">
                                                    <Users size={14} className="text-blue-500" />
                                                    <span className="font-medium">Team:</span> {assignedTeamName}
                                                </p>
                                            )}
                                            <p className="flex items-center gap-2">
                                                <Clock size={14} />
                                                <span className="font-medium">Due:</span> {proj.deadline}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <select
                                            value={proj.status}
                                            onChange={(e) => onUpdateStatus(proj.id, e.target.value)}
                                            className="text-sm border-slate-300 border rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Done">Done</option>
                                        </select>
                                        <button
                                            onClick={() => setEditingProject(proj)}
                                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Briefcase size={18} />
                                        </button>
                                        {isAdmin && (
                                            <button
                                                onClick={() => onRemove(proj.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                    {projects.length === 0 && (
                        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                            No active projects. Start a new one!
                        </div>
                    )}
                </div>

                {/* Add/Edit Project Form */}
                <div className="lg:col-span-4">
                    <Card className="p-6 sticky top-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Briefcase size={18} /> {editingProject ? 'Edit Project' : 'Create Project'}
                            </h3>
                            {editingProject && (
                                <button
                                    onClick={() => setEditingProject(null)}
                                    className="text-xs text-red-500 hover:underline"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4" key={editingProject ? editingProject.id : 'new'}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
                                <input
                                    required
                                    name="title"
                                    type="text"
                                    defaultValue={editingProject?.title}
                                    className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="e.g. Mobile App MVP"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Assign Team</label>
                                <select
                                    name="assignedTeam"
                                    defaultValue={editingProject?.assignedTeam || ""}
                                    className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Team</option>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Assignees</label>
                                <select
                                    name="assignees"
                                    multiple
                                    defaultValue={editingProject?.assignees || (editingProject?.assignee ? [editingProject.assignee] : [])}
                                    className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none h-24"
                                >
                                    {employees.map(e => (
                                        <option key={e.id} value={e.name}>{e.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                                <input
                                    required
                                    name="deadline"
                                    type="date"
                                    defaultValue={editingProject?.deadline}
                                    className="w-full rounded-lg border-slate-300 border p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <Button type="submit" className="w-full justify-center">
                                {editingProject ? 'Update Project' : 'Create Project'}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};
