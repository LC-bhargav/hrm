import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Employee } from '@/types';
import { useState } from 'react';
import { PayslipModal } from '@/components/dashboard/PayslipModal';

interface PayrollViewProps {
    employees: Employee[];
    totalPayroll: number;
}

export const PayrollView = ({ employees, totalPayroll }: PayrollViewProps) => {
    const [selectedPayslipEmployee, setSelectedPayslipEmployee] = useState<Employee | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800">Payroll Management</h2>
                <Button variant="success">
                    <CheckCircle size={18} /> Run Payroll for {new Date().toLocaleString('default', { month: 'long' })}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-800 font-bold uppercase text-xs">
                                <tr>
                                    <th className="p-4">Employee</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4 text-right">Annual Salary</th>
                                    <th className="p-4 text-right">Monthly Gross</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {employees.map(emp => (
                                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-800">{emp.name}</td>
                                        <td className="p-4">{emp.role}</td>
                                        <td className="p-4 text-right">₹{emp.salary.toLocaleString()}</td>
                                        <td className="p-4 text-right font-bold text-slate-800">
                                            ₹{(emp.salary / 12).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                Active
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedPayslipEmployee(emp)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                                            >
                                                View Slip
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50 font-bold text-slate-800">
                                <tr>
                                    <td colSpan={3} className="p-4 text-right">Total Monthly Output:</td>
                                    <td className="p-4 text-right text-lg text-emerald-600">
                                        ₹{totalPayroll.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </td>
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </Card>
            </div>

            <PayslipModal
                isOpen={!!selectedPayslipEmployee}
                onClose={() => setSelectedPayslipEmployee(null)}
                employee={selectedPayslipEmployee}
            />
        </div >
    );
};
