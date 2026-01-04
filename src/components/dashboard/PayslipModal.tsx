import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Employee } from '@/types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PayslipModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ isOpen, onClose, employee }) => {
    if (!isOpen || !employee) return null;

    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    // Simulated Calculations
    const monthlyGross = employee.salary / 12;
    const basicSalary = monthlyGross * 0.5;
    const hra = monthlyGross * 0.2;
    const allowances = monthlyGross * 0.3;

    const pfDeduction = basicSalary * 0.12;
    const taxDeduction = monthlyGross * 0.1; // Simplified 10% tax
    const totalDeductions = pfDeduction + taxDeduction;

    const netPay = monthlyGross - totalDeductions;
    const handleDownloadPDF = async () => {
        const element = document.getElementById('payslip-content');
        if (!element) return;

        try {
            // Clone the element to manipulate it without affecting the UI
            const clone = element.cloneNode(true) as HTMLElement;

            // Create a container for the clone
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '0';
            container.appendChild(clone);
            document.body.appendChild(container);

            // Recursively process all elements in the clone
            const processElement = (el: HTMLElement) => {
                // Remove all classes to prevent Tailwind inheritance
                el.removeAttribute('class');

                // Ensure text colors are hex
                const style = window.getComputedStyle(el);
                if (style.color && (style.color.startsWith('lab') || style.color.startsWith('oklch'))) {
                    // Fallback to safe hex if computed style is modern
                    // This is a simplification; ideally we'd map specific elements
                    // But since we inline styles in the component, we should trust those
                }

                // Force specific styles if missing (safety net)
                if (!el.style.color) el.style.color = '#1e293b'; // Slate 800
                if (!el.style.fontFamily) el.style.fontFamily = 'Arial, sans-serif';

                Array.from(el.children).forEach(child => processElement(child as HTMLElement));
            };

            // We rely on the inline styles we added previously. 
            // The key is removing the classes so Tailwind v4 variables don't interfere.
            // However, cloneNode copies inline styles, so our previous work is preserved.
            // We just need to make sure we strip the classes.
            const stripClasses = (el: Element) => {
                el.removeAttribute('class');
                Array.from(el.children).forEach(child => stripClasses(child));
            };
            stripClasses(clone);

            const canvas = await html2canvas(clone, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            // Clean up
            document.body.removeChild(container);

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`payslip-${employee.name.replace(/\s+/g, '_')}-${month}-${year}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div id="payslip-content">
                    <div className="p-6 flex justify-between items-start" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                        <div>
                            <h2 className="text-2xl font-bold">Payslip</h2>
                            <p style={{ color: '#94a3b8' }}>{month} {year}</p>
                        </div>
                        {/* Hide close button in PDF */}
                        <div data-html2canvas-ignore>
                            <button onClick={onClose} className="hover:text-white transition-colors" style={{ color: '#94a3b8' }}>
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Employee Info */}
                        <div className="grid grid-cols-2 gap-8 pb-8" style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <div>
                                <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: '#64748b' }}>Employee Name</p>
                                <p className="font-bold text-lg" style={{ color: '#1e293b' }}>{employee.name}</p>
                                <p className="text-sm" style={{ color: '#64748b' }}>{employee.email}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: '#64748b' }}>Designation</p>
                                <p className="font-bold text-lg" style={{ color: '#1e293b' }}>{employee.role}</p>
                                <p className="text-sm" style={{ color: '#64748b' }}>ID: #{String(employee.id).padStart(4, '0')}</p>
                            </div>
                        </div>

                        {/* Salary Details */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '2rem' }}>
                            {/* Earnings */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h3 style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', paddingBottom: '0.5rem', color: '#059669', borderBottom: '1px solid #d1fae5' }}>Earnings</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#475569' }}>Basic Salary</span>
                                        <span className="font-medium">₹{basicSalary.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: '#475569' }}>HRA</span>
                                        <span className="font-medium">₹{hra.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: '#475569' }}>Special Allowances</span>
                                        <span className="font-medium">₹{allowances.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 font-bold" style={{ borderTop: '1px dashed #e2e8f0', color: '#1e293b' }}>
                                        <span>Gross Earnings</span>
                                        <span>₹{monthlyGross.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Deductions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h3 style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', paddingBottom: '0.5rem', color: '#dc2626', borderBottom: '1px solid #fee2e2' }}>Deductions</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#475569' }}>Provident Fund</span>
                                        <span className="font-medium">₹{pfDeduction.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span style={{ color: '#475569' }}>Income Tax</span>
                                        <span className="font-medium">₹{taxDeduction.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 font-bold" style={{ borderTop: '1px dashed #e2e8f0', color: '#1e293b' }}>
                                        <span>Total Deductions</span>
                                        <span>₹{totalDeductions.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Net Pay */}
                        <div className="rounded-lg p-6 flex justify-between items-center" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <div>
                                <p className="text-sm font-medium" style={{ color: '#64748b' }}>Net Payable Amount</p>
                                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Paid via Bank Transfer</p>
                            </div>
                            <div className="text-2xl font-bold" style={{ color: '#0f172a' }}>
                                ₹{netPay.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-200" data-html2canvas-ignore>
                        <Button variant="secondary" onClick={() => window.print()}>
                            <Printer size={16} className="mr-2" /> Print
                        </Button>
                        <Button onClick={handleDownloadPDF}>
                            <Download size={16} className="mr-2" /> Download PDF
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
