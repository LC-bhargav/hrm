import React, { useState } from 'react';
import { Trash2, UserPlus, Mail, IndianRupee } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Employee } from '@/types';

interface EmployeeViewProps {
    employees: Employee[];
    onAdd: (e: React.FormEvent<HTMLFormElement>) => void;
    onRemove: (id: number | string) => void;
    onViewDetails: (employee: Employee) => void;
}

export const EmployeeView = ({ employees, onAdd, onRemove, onViewDetails }: EmployeeViewProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Employees</h2>
                    <p className="text-slate-500">Manage your team members</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
                        />
                        <svg className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <Button onClick={() => setIsAdding(!isAdding)}>
                        <UserPlus size={20} className="mr-2" />
                        Add Employee
                    </Button>
                </div>
            </div>

            {isAdding && (
                <Card className="p-6 animate-in fade-in slide-in-from-top-4 border-blue-100 shadow-md">
                    <form onSubmit={onAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Employee ID</label>
                            <input name="employeeId" placeholder="EMP-001" required className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Full Name</label>
                            <input name="name" placeholder="John Doe" required className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Role</label>
                            <input name="role" placeholder="Software Engineer" required className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email Address</label>
                            <input name="email" type="email" placeholder="john@example.com" required className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Annual Salary</label>
                            <input name="salary" type="number" placeholder="50000" required className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                            <Button variant="secondary" onClick={() => setIsAdding(false)} type="button">Cancel</Button>
                            <Button type="submit">Save Employee</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                                <th className="p-4">ID</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Salary</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 text-sm font-medium text-slate-600">
                                            {emp.employeeId || '-'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs ring-2 ring-white">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{emp.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                                {emp.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                <Mail size={14} />
                                                {emp.email}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-1">
                                                <IndianRupee size={14} className="text-slate-400" />
                                                {emp.salary.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end items-center gap-2">
                                                <Button
                                                    variant="secondary"
                                                    className="h-8 px-3 text-xs"
                                                    onClick={() => onViewDetails(emp)}
                                                >
                                                    View
                                                </Button>
                                                <button
                                                    onClick={() => onRemove(emp.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                                    title="Delete Employee"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                                            <UserPlus size={24} className="text-slate-400" />
                                        </div>
                                        <p>No employees found matching "{searchTerm}"</p>
                                        <Button variant="ghost" onClick={() => setSearchTerm('')} className="mt-2 text-blue-600">
                                            Clear Search
                                        </Button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
