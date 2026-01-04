
export type Role = 'admin' | 'manager' | 'employee' | 'it_support';

export interface Employee {
    id: number | string;
    employeeId?: string;
    name: string;
    role: Role;
    email: string;
    salary: number;
    department?: string;
    contactInfo?: {
        phone?: string;
        address?: string;
        emergencyContact?: {
            name: string;
            phone: string;
            relation: string;
        };
    };
    joinedDate?: string;
    // Performance Metrics
    monthlyTarget?: number;
    efficiencyScore?: number;
    tasksCompleted?: number;
    onTimeScore?: number;
    reviews?: Review[];
}

export interface Asset {
    id: string;
    name: string;
    type: 'Hardware' | 'Software';
    category: 'Laptop' | 'Desktop' | 'Monitor' | 'Peripheral' | 'License' | 'Subscription';
    serialNumber?: string;
    status: 'Available' | 'Assigned' | 'Maintenance' | 'Retired';
    purchaseDate: string;
    purchasePrice: number;
    warrantyExpiry?: string;
    depreciationRate?: number; // Annual percentage
    assignedTo?: string; // Employee ID
    specifications?: Record<string, string>;
}

export interface AssetAssignment {
    id: string;
    assetId: string;
    employeeId: string;
    assignedDate: string;
    returnDate?: string;
    notes?: string;
}

export interface MaintenanceRecord {
    id: string;
    assetId: string;
    date: string;
    type: 'Repair' | 'Upgrade' | 'Routine';
    cost: number;
    description: string;
    technician?: string;
}


export interface Review {
    id: string;
    title: string;
    comment: string;
    date: string;
    reviewer: string;
}

export interface Project {
    id: number | string;
    title: string;
    assignee?: string; // Keep for backward compatibility if needed, or remove if fully migrating
    assignees?: string[];
    assignedTeam?: string;
    status: string;
    deadline: string;
}

export interface Team {
    id: string;
    name: string;
    members: string[];
    teamLead?: string;
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    startDate: string;
    endDate: string;
    type: 'Vacation' | 'Sick' | 'Personal';
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    date: string;
    author: string;
}

export type Tab = 'dashboard' | 'employees' | 'projects' | 'payroll' | 'teams' | 'leave' | 'users' | 'profile' | 'assets';
