import React, { useState } from 'react';
// Force rebuild

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar, Check, X, Clock } from 'lucide-react';
import { LeaveRequest, Employee, Team } from '@/types';

interface LeaveViewProps {
    requests: LeaveRequest[];
    currentUser: Employee;
    teams?: Team[];
    isAdmin: boolean; // Keep for backward compat, but rely on userRole
    userRole?: 'admin' | 'manager' | 'employee' | 'it_support';
    onRequestLeave: (request: Omit<LeaveRequest, 'id' | 'status'>) => void;
    onUpdateStatus: (id: string, status: 'Approved' | 'Rejected') => void;
}

export const LeaveView: React.FC<LeaveViewProps> = ({
    requests,
    currentUser,
    teams = [],
    isAdmin, // Fallback
    userRole = 'employee',
    onRequestLeave,
    onUpdateStatus
}) => {
    const [isRequesting, setIsRequesting] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        type: 'Vacation' as const,
        reason: ''
    });

    const isManager = userRole === 'manager';
    const canApprove = isAdmin || isManager;

    const myRequests = requests.filter(r => r.employeeId === String(currentUser.id));

    // Determine which pending requests to show for approval
    let pendingRequests: LeaveRequest[] = [];
    if (isAdmin) {
        pendingRequests = requests.filter(r => r.status === 'Pending');
    } else if (isManager) {
        // Find manager's team
        const myTeam = teams.find(t => t.teamLead === currentUser.name);
        if (myTeam) {
            pendingRequests = requests.filter(r =>
                r.status === 'Pending' &&
                myTeam.members.includes(r.employeeName)
            );
        }
    }

    const getAllRequestHistory = () => {
        if (isAdmin) return requests;
        if (isManager) {
            const myTeam = teams.find(t => t.teamLead === currentUser.name);
            if (myTeam) {
                return requests.filter(r => myTeam.members.includes(r.employeeName) || r.employeeId === String(currentUser.id));
            }
        }
        return myRequests;
    }

    const historyRequests = getAllRequestHistory();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRequestLeave({
            employeeId: String(currentUser.id),
            employeeName: currentUser.name,
            ...formData
        });
        setIsRequesting(false);
        setFormData({ startDate: '', endDate: '', type: 'Vacation', reason: '' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-100 text-emerald-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-blue-600" />
                    Leave Management
                </h2>
                {!isAdmin && (
                    <Button onClick={() => setIsRequesting(!isRequesting)}>
                        {isRequesting ? 'Cancel' : 'Request Time Off'}
                    </Button>
                )}
            </div>

            {isRequesting && !isAdmin && (
                <Card className="bg-white border-blue-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>New Leave Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full p-2 border border-slate-200 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full p-2 border border-slate-200 rounded-md"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full p-2 border border-slate-200 rounded-md"
                                >
                                    <option value="Vacation">Vacation</option>
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Personal">Personal</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                                <textarea
                                    required
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full p-2 border border-slate-200 rounded-md"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit">Submit Request</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {canApprove && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700">Pending Requests {isManager && "(My Team)"}</h3>
                    {pendingRequests.length === 0 ? (
                        <p className="text-slate-500 italic">No pending requests.</p>
                    ) : (
                        <div className="grid gap-4">
                            {pendingRequests.map(req => (
                                <Card key={req.id}>
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div>
                                            <div className="font-semibold text-lg">{req.employeeName}</div>
                                            <div className="text-sm text-slate-500">
                                                {req.type} • {req.startDate} to {req.endDate}
                                            </div>
                                            <div className="text-sm text-slate-600 mt-1">"{req.reason}"</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="success" onClick={() => onUpdateStatus(req.id, 'Approved')}>
                                                <Check size={16} className="mr-1" /> Approve
                                            </Button>
                                            <Button variant="danger" onClick={() => onUpdateStatus(req.id, 'Rejected')}>
                                                <X size={16} className="mr-1" /> Reject
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-700">{isAdmin ? 'All History' : 'My History'}</h3>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-3 font-medium text-slate-600">Date</th>
                                {isAdmin && <th className="p-3 font-medium text-slate-600">Employee</th>}
                                <th className="p-3 font-medium text-slate-600">Type</th>
                                <th className="p-3 font-medium text-slate-600">Duration</th>
                                <th className="p-3 font-medium text-slate-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {historyRequests.map(req => (
                                <tr key={req.id} className="hover:bg-slate-50">
                                    <td className="p-3 text-slate-500">{req.startDate}</td>
                                    {canApprove && <td className="p-3 font-medium">{req.employeeName}</td>}
                                    <td className="p-3">{req.type}</td>
                                    <td className="p-3 text-slate-500">{req.startDate} - {req.endDate}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {historyRequests.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-slate-400">No records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
