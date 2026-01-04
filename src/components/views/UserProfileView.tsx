import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Briefcase, Mail, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Employee, Role } from '@/types';

interface UserProfileViewProps {
    userEmail: string;
}

export const UserProfileView = ({ userEmail }: UserProfileViewProps) => {
    const [profile, setProfile] = useState<Employee | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Form state
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');
    const [emergencyRelation, setEmergencyRelation] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!db) return;
            try {
                const q = query(collection(db, "employees"), where("email", "==", userEmail));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0].data() as Employee;
                    // Provide the Firestore ID for updates
                    const employeeData = { ...docData, id: querySnapshot.docs[0].id };
                    setProfile(employeeData);

                    // Initialize form
                    setPhone(employeeData.contactInfo?.phone || '');
                    setAddress(employeeData.contactInfo?.address || '');
                    setEmergencyName(employeeData.contactInfo?.emergencyContact?.name || '');
                    setEmergencyPhone(employeeData.contactInfo?.emergencyContact?.phone || '');
                    setEmergencyRelation(employeeData.contactInfo?.emergencyContact?.relation || '');
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [userEmail]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !db) return;

        setIsSaving(true);
        setError('');
        setSuccessMessage('');

        try {
            const employeeRef = doc(db, "employees", profile.id as string);

            const updatedContactInfo = {
                phone,
                address,
                emergencyContact: {
                    name: emergencyName,
                    phone: emergencyPhone,
                    relation: emergencyRelation,
                }
            };

            await updateDoc(employeeRef, {
                contactInfo: updatedContactInfo
            });

            // Update local state
            setProfile({ ...profile, contactInfo: updatedContactInfo });
            setSuccessMessage("Profile updated successfully!");
        } catch (err: any) {
            console.error("Error updating profile:", err);
            setError("Failed to update profile: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
    }

    if (!profile) {
        return <div className="p-8 text-center text-red-500">User profile not found.</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
                    <p className="text-slate-500 flex items-center gap-2">
                        <Mail size={14} /> {profile.email}
                    </p>
                </div>
                <div className="ml-auto px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 capitalize">
                    {profile.role}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Briefcase size={20} className="text-slate-400" />
                        Employment Details
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="text-slate-500 block mb-1">Department</label>
                                <div className="font-medium">{profile.department || 'Not Assigned'}</div>
                            </div>
                            <div>
                                <label className="text-slate-500 block mb-1">Joined Date</label>
                                <div className="font-medium">{profile.joinedDate ? new Date(profile.joinedDate).toLocaleDateString() : 'N/A'}</div>
                            </div>
                            {/* Salary is usually confidential or visible to managers/admin only 
                            <div>
                                <label className="text-slate-500 block mb-1">Salary</label>
                                <div className="font-medium">${profile.salary?.toLocaleString()}</div>
                            </div>
                            */}
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <User size={20} className="text-slate-400" />
                        Contact Information
                    </h2>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="123 Main St, City, Country"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-900 mb-3">Emergency Contact</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={emergencyName}
                                    onChange={(e) => setEmergencyName(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
                                    placeholder="Contact Name"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="tel"
                                        value={emergencyPhone}
                                        onChange={(e) => setEmergencyPhone(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
                                        placeholder="Phone Number"
                                    />
                                    <input
                                        type="text"
                                        value={emergencyRelation}
                                        onChange={(e) => setEmergencyRelation(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500"
                                        placeholder="Relation"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="text-xs text-red-600 flex items-center gap-1">
                                <AlertCircle size={12} /> {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle size={12} /> {successMessage}
                            </div>
                        )}

                        <div className="pt-2">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                                <Save size={16} className="ml-2" />
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};
