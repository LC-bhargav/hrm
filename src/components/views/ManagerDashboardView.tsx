import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Users, Briefcase, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Employee, Project, Team, LeaveRequest } from '@/types';

interface ManagerDashboardViewProps {
    currentUser: Employee;
    employees: Employee[];
    teams: Team[];
    projects: Project[];
    leaveRequests: LeaveRequest[];
    onUpdateLeaveStatus: (id: string, status: 'Approved' | 'Rejected') => void;
}

export const ManagerDashboardView: React.FC<ManagerDashboardViewProps> = ({
    currentUser,
    employees,
    teams,
    projects,
    leaveRequests,
    onUpdateLeaveStatus
}) => {
    // 1. Identify Manager's Team
    // Assuming currentUser.name matches Team.teamLead
    const myTeam = teams.find(t => t.teamLead === currentUser.name);

    // 2. Filter Team Members
    // If no team assigned, empty list
    const teamMembers = myTeam
        ? employees.filter(e => myTeam.members.includes(e.name))
        : [];

    // 3. Filter Projects
    // Projects assigned to the team OR to the manager
    const teamProjects = projects.filter(p =>
        p.assignedTeam === myTeam?.name ||
        p.assignees?.includes(currentUser.name)
    );

    // 4. Filter Leave Requests
    // Requests from team members
    const teamLeaveRequests = leaveRequests.filter(req =>
        teamMembers.some(member => member.name === req.employeeName) &&
        req.status === 'Pending'
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">
                Manager Dashboard <span className="text-slate-500 text-lg font-normal">| {myTeam?.name || 'No Team Assigned'}</span>
            </h2>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Team Members</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{teamMembers.length}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <Users size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-purple-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Active Projects</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{teamProjects.length}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                            <Briefcase size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-amber-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Pending Leaves</p>
                            <h3 className="text-3xl font-bold text-slate-800 mt-2">{teamLeaveRequests.length}</h3>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                            <Clock size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Leave Requests Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-amber-500" />
                            Pending Leave Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {teamLeaveRequests.length > 0 ? (
                                teamLeaveRequests.map(req => (
                                    <div key={req.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 rounded-lg border border-slate-100 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-slate-800">{req.employeeName}</span>
                                                <Badge status={req.type} />
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                {req.startDate} - {req.endDate}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1 italic">"{req.reason}"</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                className="bg-green-600 hover:bg-green-700 h-8 px-3 text-xs"
                                                onClick={() => onUpdateLeaveStatus(req.id, 'Approved')}
                                            >
                                                <CheckCircle size={14} className="mr-1" /> Approve
                                            </Button>
                                            <Button
                                                variant="danger"
                                                className="h-8 px-3 text-xs"
                                                onClick={() => onUpdateLeaveStatus(req.id, 'Rejected')}
                                            >
                                                <XCircle size={14} className="mr-1" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-center py-4 italic">No pending leave requests.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Team Members List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            My Team ({teamMembers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {teamMembers.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{member.name}</p>
                                            <p className="text-xs text-slate-500">{member.role}</p>
                                        </div>
                                    </div>
                                    {/* Could add 'View Profile' or 'Message' buttons here later */}
                                </div>
                            ))}
                            {teamMembers.length === 0 && (
                                <p className="text-slate-400 text-center py-4 italic">No team members found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Projects */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-purple-500" />
                        Team Projects
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {teamProjects.map(proj => (
                            <div key={proj.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-800">{proj.title}</h4>
                                        <Badge status={proj.status} />
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><Clock size={14} /> Due: {proj.deadline}</span>
                                        {proj.assignees && proj.assignees.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Users size={14} /> {proj.assignees.length} Assignees
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                                    <div className={`h-full w-2/3 ${proj.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                </div>
                            </div>
                        ))}
                        {teamProjects.length === 0 && (
                            <p className="text-slate-400 text-center py-4 italic">No active projects.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};
