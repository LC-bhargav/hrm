"use client";

import React, { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardView } from '@/components/views/DashboardView';
import { EmployeeView } from '@/components/views/EmployeeView';
import { ProjectView } from '@/components/views/ProjectView';
import { PayrollView } from '@/components/views/PayrollView';
import { LeaveView } from '../components/views/LeaveView';
import { Employee, Project, Tab, Team, LeaveRequest, Announcement, Role } from '@/types';

import { LoginView } from '@/components/views/LoginView';
import { EmployeeDashboardView } from '@/components/views/EmployeeDashboardView';
import { ManagerDashboardView } from '@/components/views/ManagerDashboardView';
import { TeamsView } from '@/components/views/TeamsView';
import { UserProfileView } from '@/components/views/UserProfileView';
import { UserManagementView } from '@/components/views/UserManagementView';
import { AssetManagementView } from '@/components/views/AssetManagementView';
import { HeroView } from '@/components/views/HeroView';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function OfficeManager() {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [showHero, setShowHero] = useState(true);

    // --- Auth State ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<Role | null>(null);
    const [userEmail, setUserEmail] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    // --- Data Layer ---
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // --- Delete Confirmation State ---
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        type: 'employee' | 'team' | 'project';
        id: string | number;
        title: string;
    } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // --- Persistence Layer ---
    // Load data from Firestore
    useEffect(() => {
        if (!db) {
            console.error("Firestore 'db' is not initialized. Check firebase.ts and .env.local");
            return;
        }

        if (!isAuthenticated) {
            return;
        }

        // Listen to Employees
        const unsubEmployees = onSnapshot(
            collection(db, "employees"),
            (snapshot) => {
                const mappedEmployees = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                })) as unknown as Employee[];
                setEmployees(mappedEmployees);
            },
            (error) => {
                console.error("Error fetching employees:", error);
                if (error.code === 'permission-denied') {
                    console.warn("Permission denied - user might have logged out or rules changed.");
                }
            }
        );

        // Listen to Projects
        const unsubProjects = onSnapshot(
            collection(db, "projects"),
            (snapshot) => {
                const mappedProjects = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                })) as unknown as Project[];
                setProjects(mappedProjects);
            },
            (error) => {
                console.error("Error fetching projects:", error);
            }
        );

        // Listen to Teams
        const unsubTeams = onSnapshot(
            collection(db, "teams"),
            (snapshot) => {
                const mappedTeams = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                })) as unknown as Team[];
                setTeams(mappedTeams);
            },
            (error) => {
                console.error("Error fetching teams:", error);
            }
        );

        // Listen to Leave Requests
        const unsubLeave = onSnapshot(collection(db, "leave_requests"), (snapshot) => {
            setLeaveRequests(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LeaveRequest)));
        });

        // Listen to Announcements
        const unsubAnnouncements = onSnapshot(query(collection(db, "announcements"), orderBy("date", "desc")), (snapshot) => {
            setAnnouncements(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Announcement)));
        });

        setIsLoaded(true);

        return () => {
            unsubEmployees();
            unsubProjects();
            unsubTeams();
            unsubLeave();
            unsubAnnouncements();
        };
    }, [isAuthenticated]);

    // Auth Listener
    useEffect(() => {
        if (!auth) {
            console.warn("Auth not initialized - skipping listener");
            setIsAuthChecking(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                setUserEmail(user.email!);
                // Simple role mapping
                // Simple role mapping or use what we derived if needed. 
                // In a real app with custom claims or strict security, we'd wait for claims.
                // For this app, we trust the LoginView to have ensured the record exists, 
                // but we also re-derive it here from the employees collection snapshot if possible 
                // or just rely on what the user session implies.
                // However, we need to wait for the employees snapshot to really know the role 
                // unless we fetch it here again.
                // For simplicity, let's look it up in the employees array if loaded, 
                // but initial load might race.
                const role = user.email!.includes('admin') ? 'admin' : 'employee';
                // ideally we would set this after fetching the employee record
                setUserRole(role);
            } else {
                setIsAuthenticated(false);
                setUserRole(null);
                setUserEmail('');
            }
            setIsAuthChecking(false);
        });

        return () => unsubscribe();
    }, []);

    // --- Logic / Controller Layer ---

    const handleLogin = (_role: Role, _email: string) => {
        // Handled by onAuthStateChanged
    };

    const handleLogout = async () => {
        try {
            if (auth) {
                await signOut(auth);
            }
            setSelectedEmployee(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!db) return;
        const form = e.currentTarget; // Capture form reference
        const formData = new FormData(form);
        const newEmp = {
            name: formData.get('name') as string,
            employeeId: formData.get('employeeId') as string,
            role: formData.get('role') as string,
            email: formData.get('email') as string,
            salary: Number(formData.get('salary')),
        };

        try {
            await addDoc(collection(db, "employees"), newEmp);
            form.reset(); // Use captured reference
        } catch (err) {
            console.error("Error adding employee:", err);
            alert("Failed to add employee");
        }
    };

    const handleRemoveEmployee = (id: number | string) => {
        setDeleteConfirmation({
            type: 'employee',
            id,
            title: 'Delete Employee'
        });
    };

    const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!db) return;
        const form = e.currentTarget;
        const formData = new FormData(form);

        // Handle multiple assignees
        const assignees = formData.getAll('assignees') as string[];

        const newProj = {
            title: formData.get('title') as string,
            assignees: assignees,
            assignedTeam: formData.get('assignedTeam') as string,
            status: "Pending",
            deadline: formData.get('deadline') as string,
        };

        try {
            await addDoc(collection(db, "projects"), newProj);
            form.reset();
        } catch (err) {
            console.error("Error adding project:", err);
            alert("Failed to add project");
        }
    };

    const handleEditProject = async (project: Project) => {
        if (!db) return;
        try {
            const { id, ...data } = project;
            await updateDoc(doc(db, "projects", String(id)), data);
        } catch (err) {
            console.error("Error updating project:", err);
            alert("Failed to update project");
        }
    };

    // --- Teams Handlers ---

    const handleCreateTeam = async (name: string, members: string[], teamLead: string) => {
        if (!db) return;
        try {
            await addDoc(collection(db, "teams"), { name, members, teamLead });
        } catch (err) {
            console.error("Error creating team:", err);
            alert("Failed to create team");
        }
    };

    const handleDeleteTeam = (id: string) => {
        setDeleteConfirmation({
            type: 'team',
            id,
            title: 'Delete Team'
        });
    };

    const handleAddMemberToTeam = async (teamId: string, memberName: string) => {
        if (!db) return;
        const team = teams.find(t => t.id === teamId);
        if (!team) return;

        const updatedMembers = [...team.members, memberName];
        try {
            await updateDoc(doc(db, "teams", teamId), { members: updatedMembers });
        } catch (err) {
            console.error("Error adding member:", err);
        }
    };

    const handleRemoveMemberFromTeam = async (teamId: string, memberName: string) => {
        if (!db) return;
        const team = teams.find(t => t.id === teamId);
        if (!team) return;

        const updatedMembers = team.members.filter(m => m !== memberName);
        try {
            await updateDoc(doc(db, "teams", teamId), { members: updatedMembers });
        } catch (err) {
            console.error("Error removing member:", err);
        }
    };

    const handleRemoveProject = (id: number | string) => {
        setDeleteConfirmation({
            type: 'project',
            id,
            title: 'Delete Project'
        });
    };

    const handleUpdateProjectStatus = async (id: number | string, newStatus: string) => {
        if (!db) return;
        try {
            await updateDoc(doc(db, "projects", String(id)), { status: newStatus });
        } catch (err) {
            console.error("Error updating project:", err);
        }
    };

    const handleUpdateEmployeeMetrics = async (metrics: Partial<Employee>) => {
        if (!db || !selectedEmployee) return;
        try {
            await updateDoc(doc(db, "employees", String(selectedEmployee.id)), metrics);
            // Update local state immediately for better UX
            setSelectedEmployee({ ...selectedEmployee, ...metrics });
        } catch (err) {
            console.error("Error updating employee metrics:", err);
            alert("Failed to update metrics");
        }
    };

    // --- Leave Handlers ---
    const handleRequestLeave = async (request: Omit<LeaveRequest, 'id' | 'status'>) => {
        if (!db) return;
        try {
            await addDoc(collection(db, "leave_requests"), { ...request, status: 'Pending' });
        } catch (err) {
            console.error("Error requesting leave:", err);
            alert("Failed to submit leave request");
        }
    };

    const handleUpdateLeaveStatus = async (id: string, status: 'Approved' | 'Rejected') => {
        if (!db) return;
        try {
            await updateDoc(doc(db, "leave_requests", id), { status });
        } catch (err) {
            console.error("Error updating leave status:", err);
        }
    };

    // --- Announcement Handlers ---
    const handlePostAnnouncement = async (title: string, content: string) => {
        if (!db) return;
        try {
            await addDoc(collection(db, "announcements"), {
                title,
                content,
                date: new Date().toLocaleDateString(),
                author: currentUser.name
            });
        } catch (err) {
            console.error("Error posting announcement:", err);
            alert("Failed to post announcement");
        }
    };

    const executeDelete = async () => {
        if (!db || !deleteConfirmation) return;
        setIsDeleting(true);
        try {
            const { type, id } = deleteConfirmation;
            if (type === 'employee') {
                await deleteDoc(doc(db, "employees", String(id)));
            } else if (type === 'team') {
                await deleteDoc(doc(db, "teams", String(id)));
            } else if (type === 'project') {
                await deleteDoc(doc(db, "projects", String(id)));
            }
            setDeleteConfirmation(null);
        } catch (err) {
            console.error("Error deleting item:", err);
            alert("Failed to delete item");
        } finally {
            setIsDeleting(false);
        }
    };

    // Derived State
    const totalPayroll = employees.reduce((sum, emp) => sum + (emp.salary / 12), 0);

    // Get current user details for employee view
    const currentUser = employees.find(e => e.email === userEmail) || {
        id: 0,
        name: userEmail.split('@')[0],
        role: 'employee',
        email: userEmail,
        salary: 0
    };

    // --- Render ---

    if (isAuthChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        if (showHero) {
            return <HeroView onStart={() => setShowHero(false)} />;
        }
        return <LoginView onLogin={handleLogin} />;
    }

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setSelectedEmployee(null); // Reset selection on tab change
                }}
                role={userRole!}
                currentUser={userEmail}
                onLogout={handleLogout}
            />

            {/* Mobile Header */}
            <div className="md:hidden fixed w-full bg-white border-b border-slate-200 z-10 p-4 flex justify-between items-center">
                <h1 className="font-bold text-lg">OfficeFlow</h1>
                <button className="p-2 bg-slate-100 rounded-md">
                    <LayoutDashboard size={20} />
                </button>
            </div>

            {/* Router / Content Switcher */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
                <div className="max-w-6xl mx-auto">
                    {activeTab === 'dashboard' && (
                        userRole === 'admin' ? (
                            <DashboardView
                                employees={employees}
                                projects={projects}
                                totalPayroll={totalPayroll}
                                announcements={announcements}
                                isAdmin={true}
                                onPostAnnouncement={handlePostAnnouncement}
                            />
                        ) : userRole === 'manager' && currentUser ? (
                            <ManagerDashboardView
                                currentUser={currentUser}
                                employees={employees}
                                teams={teams}
                                projects={projects}
                                leaveRequests={leaveRequests}
                                onUpdateLeaveStatus={handleUpdateLeaveStatus}
                            />
                        ) : (
                            <EmployeeDashboardView
                                currentUser={currentUser}
                                projects={projects}
                            />
                        )
                    )}
                    {activeTab === 'employees' && (userRole === 'admin' || userRole === 'manager') && (
                        selectedEmployee ? (
                            <div className="space-y-6">
                                <button
                                    onClick={() => setSelectedEmployee(null)}
                                    className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1"
                                >
                                    ← Back to Employee List
                                </button>
                                <EmployeeDashboardView
                                    currentUser={selectedEmployee}
                                    projects={projects}
                                    isAdmin={true}
                                    onUpdateMetrics={handleUpdateEmployeeMetrics}
                                />
                            </div>
                        ) : (
                            <EmployeeView
                                employees={employees}
                                onAdd={handleAddEmployee}
                                onRemove={handleRemoveEmployee}
                                onViewDetails={setSelectedEmployee}
                            />
                        )
                    )}
                    {activeTab === 'teams' && (userRole === 'admin' || userRole === 'manager') && (
                        <TeamsView
                            teams={teams}
                            employees={employees}
                            onCreateTeam={handleCreateTeam}
                            onDeleteTeam={handleDeleteTeam}
                            onAddMember={handleAddMemberToTeam}
                            onRemoveMember={handleRemoveMemberFromTeam}
                            userRole={userRole || 'employee'}
                            currentUser={currentUser}
                        />
                    )}
                    {activeTab === 'projects' && (userRole === 'admin' || userRole === 'manager') && (
                        <ProjectView
                            projects={projects}
                            employees={employees}
                            teams={teams}
                            onAdd={handleAddProject}
                            onEdit={handleEditProject}
                            onRemove={handleRemoveProject}
                            onUpdateStatus={handleUpdateProjectStatus}
                            userRole={userRole || 'employee'}
                            currentUser={currentUser}
                        />
                    )}
                    {activeTab === 'payroll' && userRole === 'admin' && (
                        <PayrollView
                            employees={employees}
                            totalPayroll={totalPayroll}
                        />
                    )}
                    {activeTab === 'leave' && (
                        <LeaveView
                            requests={leaveRequests}
                            currentUser={currentUser}
                            teams={teams}
                            isAdmin={userRole === 'admin'}
                            userRole={userRole || 'employee'}
                            onRequestLeave={handleRequestLeave}
                            onUpdateStatus={handleUpdateLeaveStatus}
                        />
                    )}
                    {activeTab === 'users' && userRole === 'admin' && (
                        <UserManagementView />
                    )}
                    {activeTab === 'profile' && (
                        <UserProfileView userEmail={userEmail} />
                    )}
                    {activeTab === 'assets' && (
                        <AssetManagementView />
                    )}
                </div>
            </main>

            <ConfirmDialog
                isOpen={!!deleteConfirmation}
                title={deleteConfirmation?.title || 'Confirm Delete'}
                message="Are you sure you want to delete this item? This action cannot be undone."
                onConfirm={executeDelete}
                onCancel={() => setDeleteConfirmation(null)}
                isLoading={isDeleting}
            />
        </div>
    );
}
