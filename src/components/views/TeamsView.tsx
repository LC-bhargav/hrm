import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Users, Plus, Trash2, UserPlus, X, Crown } from 'lucide-react';
import { Team, Employee } from '@/types';

interface TeamsViewProps {
    teams: Team[];
    employees: Employee[];
    onCreateTeam: (name: string, members: string[], teamLead: string) => void;
    onDeleteTeam: (id: string) => void;
    onAddMember: (teamId: string, memberName: string) => void;
    onRemoveMember: (teamId: string, memberName: string) => void;
    userRole?: 'admin' | 'manager' | 'employee' | 'it_support';
    currentUser?: Employee;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
    teams,
    employees,
    onCreateTeam,
    onDeleteTeam,
    onAddMember,
    onRemoveMember,
    userRole = 'admin',
    currentUser
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [selectedTeamLead, setSelectedTeamLead] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    const isAdmin = userRole === 'admin';

    // Filter teams for manager
    const distinctTeams = isAdmin
        ? teams
        : teams.filter(t => t.teamLead === currentUser?.name || t.members.includes(currentUser?.name || ''));

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTeamName.trim() && selectedTeamLead) {
            onCreateTeam(newTeamName, selectedMembers, selectedTeamLead);
            setNewTeamName('');
            setSelectedTeamLead('');
            setSelectedMembers([]);
            setIsCreating(false);
        }
    };

    const toggleMemberSelection = (name: string) => {
        if (selectedMembers.includes(name)) {
            setSelectedMembers(selectedMembers.filter(m => m !== name));
        } else {
            setSelectedMembers([...selectedMembers, name]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="text-blue-600" />
                    Teams
                </h2>
                {isAdmin && (
                    <Button onClick={() => setIsCreating(!isCreating)}>
                        <Plus size={16} className="mr-2" />
                        Create Team
                    </Button>
                )}
            </div>

            {isCreating && (
                <Card className="bg-white border-blue-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>Create New Team</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
                                    <input
                                        type="text"
                                        value={newTeamName}
                                        onChange={(e) => setNewTeamName(e.target.value)}
                                        className="w-full p-2 border border-slate-200 rounded-md"
                                        placeholder="e.g. Engineering, Marketing"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Team Lead</label>
                                    <select
                                        value={selectedTeamLead}
                                        onChange={(e) => setSelectedTeamLead(e.target.value)}
                                        className="w-full p-2 border border-slate-200 rounded-md"
                                        required
                                    >
                                        <option value="" disabled>Select Team Lead</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.name}>{emp.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Select Members</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                                    {employees
                                        .filter(emp => emp.name !== selectedTeamLead)
                                        .map(emp => (
                                            <label key={emp.id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMembers.includes(emp.name)}
                                                    onChange={() => toggleMemberSelection(emp.name)}
                                                    className="rounded text-blue-600"
                                                />
                                                <span className="text-sm">{emp.name}</span>
                                            </label>
                                        ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button type="submit">Create Team</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {distinctTeams.map(team => (
                    <Card key={team.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-semibold">{team.name}</CardTitle>
                            {isAdmin && (
                                <button
                                    onClick={() => onDeleteTeam(team.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {team.teamLead && (
                                    <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-md mb-2">
                                        <Crown size={16} className="text-amber-500" />
                                        <div className="flex flex-col">
                                            <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Team Lead</span>
                                            <span className="text-sm font-medium text-slate-800">{team.teamLead}</span>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Members</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {team.members.map((member, idx) => {
                                            const memberName = typeof member === 'object' && member !== null
                                                ? (member as any).name || 'Unknown'
                                                : member;

                                            return (
                                                <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {memberName}
                                                    <button
                                                        onClick={() => onRemoveMember(team.id, member)}
                                                        className="ml-1.5 text-blue-600 hover:text-blue-800"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            );
                                        })}
                                        {team.members.length === 0 && (
                                            <span className="text-sm text-slate-400 italic">No members</span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <select
                                            className="flex-1 text-sm p-1.5 border border-slate-200 rounded"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    onAddMember(team.id, e.target.value);
                                                    e.target.value = '';
                                                }
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Add member...</option>
                                            {employees
                                                .filter(e => !team.members.includes(e.name))
                                                .map(e => (
                                                    <option key={e.id} value={e.name}>{e.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
