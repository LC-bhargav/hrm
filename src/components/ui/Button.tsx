import React from 'react';
import { THEME } from '@/constants/theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: keyof typeof THEME.colors;
}

export const Button = ({ children, onClick, variant = "primary", className = "", ...props }: ButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 ${THEME.colors[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
