import React from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, isLoading = false }: ConfirmDialogProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-3 text-amber-600 mb-4">
                    <div className="p-2 bg-amber-50 rounded-lg">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                </div>

                <p className="text-slate-600 mb-8">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
