import React from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface BadgeProps {
    status: string;
}

export const Badge = ({ status }: BadgeProps) => {
    const styles: Record<string, string> = {
        Pending: "bg-amber-100 text-amber-700 border-amber-200",
        "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
        Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
        Done: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };

    const icons: Record<string, React.ReactNode> = {
        Pending: <Clock size={14} />,
        "In Progress": <AlertCircle size={14} />,
        Completed: <CheckCircle size={14} />,
        Done: <CheckCircle size={14} />,
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 w-fit ${styles[status] || styles.Pending}`}>
            {icons[status]}
            {status}
        </span>
    );
};
