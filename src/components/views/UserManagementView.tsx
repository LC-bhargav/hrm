import React, { useState, useEffect } from 'react';
import { User, Search, Filter, Shield, Briefcase, Save, X, CheckSquare } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Employee, Role } from '@/types';

export const UserManagementView = () => {
    const [users, setUsers] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);

    // Edit state
    const [editRole, setEditRole] = useState<Role>('employee');
    const [editDepartment, setEditDepartment] = useState('');

    const fetchUsers = async () => {
        if (!db) return;
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "employees"));
            const usersList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Employee[];
            setUsers(usersList);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEditClick = (user: Employee) => {
        setEditingUserId(user.id as string);
        setEditRole(user.role);
        setEditDepartment(user.department || '');
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
    };

    const handleSaveUser = async (userId: string) => {
        if (!db) return;
        try {
            const userRef = doc(db, "employees", userId);
            await updateDoc(userRef, {
                role: editRole,
                department: editDepartment
            });

            // Update local state
            setUsers(users.map(u =>
                u.id === userId ? { ...u, role: editRole, department: editDepartment } : u
            ));
            setEditingUserId(null);
        } catch (err) {
            console.error("Error updating user:", err);
            alert("Failed to update user");
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500">Manage user access and details</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                                    <div className="text-sm text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingUserId === user.id ? (
                                                <select
                                                    value={editRole}
                                                    onChange={(e) => setEditRole(e.target.value as Role)}
                                                    className="px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="employee">Employee</option>
                                                    <option value="manager">Manager</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="it_support">IT Support</option>
                                                </select>
                                            ) : (
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                        user.role === 'manager' ? 'bg-orange-100 text-orange-800' :
                                                            user.role === 'it_support' ? 'bg-cyan-100 text-cyan-800' :
                                                                'bg-green-100 text-green-800'}`}>
                                                    {user.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingUserId === user.id ? (
                                                <input
                                                    type="text"
                                                    value={editDepartment}
                                                    onChange={(e) => setEditDepartment(e.target.value)}
                                                    className="px-2 py-1 border rounded text-sm w-32 focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="Dept"
                                                />
                                            ) : (
                                                <span className="text-sm text-slate-600">{user.department || '-'}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {editingUserId === user.id ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSaveUser(user.id as string)}
                                                        className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded"
                                                    >
                                                        <Save size={18} />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleEditClick(user)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
