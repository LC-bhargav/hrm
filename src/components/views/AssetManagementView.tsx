import React, { useState, useEffect } from 'react';
import { Monitor, Server, Smartphone, Cpu, Save, Plus, Trash2, Search, Filter, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { Asset, Employee } from '@/types';

export const AssetManagementView = () => {
    const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'assignments' | 'maintenance'>('inventory');
    const [assets, setAssets] = useState<Asset[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Asset Form State
    const [formData, setFormData] = useState<Partial<Asset>>({
        type: 'Hardware',
        status: 'Available',
        purchasePrice: 0,
        depreciationRate: 20 // Default 20%
    });

    // Assignment State
    const [selectedAssetId, setSelectedAssetId] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

    // Maintenance State
    const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
    const [maintenanceFormOpen, setMaintenanceFormOpen] = useState(false);
    const [maintenanceFormData, setMaintenanceFormData] = useState({
        assetId: '',
        type: 'Maintenance',
        description: '',
        cost: 0,
        provider: '',
        date: new Date().toISOString().split('T')[0]
    });

    const fetchAssets = async () => {
        if (!db) return;
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "assets"));
            const assetsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Asset[];
            setAssets(assetsList);
        } catch (err) {
            console.error("Error fetching assets:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmployees = async () => {
        if (!db) return;
        try {
            const querySnapshot = await getDocs(collection(db, "employees"));
            const empList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Employee[];
            setEmployees(empList);
        } catch (err) {
            console.error("Error fetching employees:", err);
        }
    };

    const fetchMaintenanceRecords = async () => {
        if (!db) return;
        try {
            const q = query(collection(db, "maintenance"));
            const querySnapshot = await getDocs(q);
            const records = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMaintenanceRecords(records);
        } catch (err) {
            console.error("Error fetching maintenance records:", err);
        }
    };

    useEffect(() => {
        fetchAssets();
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (activeSubTab === 'maintenance') {
            fetchMaintenanceRecords();
        }
    }, [activeSubTab]);

    const handleSaveAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!db) return;

        try {
            if (formData.id) {
                // Update
                const { id, ...data } = formData;
                await updateDoc(doc(db, "assets", id), {
                    ...data,
                    status: data.status || 'Available'
                } as any);
            } else {
                // Create
                await addDoc(collection(db, "assets"), {
                    ...formData,
                    status: formData.status || 'Available',
                    purchaseDate: new Date().toISOString() // simplify for now, should be input
                });
            }
            setIsFormOpen(false);
            setFormData({ type: 'Hardware', status: 'Available', purchasePrice: 0, depreciationRate: 20 });
            fetchAssets();
        } catch (err) {
            console.error("Error saving asset:", err);
            alert("Failed to save asset");
        }
    };

    const handleDeleteAsset = async (id: string) => {
        if (!confirm("Are you sure you want to delete this asset?")) return;
        if (!db) return;
        try {
            await deleteDoc(doc(db, "assets", id));
            setAssets(assets.filter(a => a.id !== id));
        } catch (err) {
            console.error("Error deleting asset:", err);
        }
    };

    const handleAssignAsset = async () => {
        if (!db || !selectedAssetId || !selectedEmployeeId) return;
        try {
            const assetRef = doc(db, "assets", selectedAssetId);
            await updateDoc(assetRef, {
                status: 'Assigned',
                assignedTo: selectedEmployeeId
            });

            // Add assignment record (optional, but good for history)
            await addDoc(collection(db, "asset_assignments"), {
                assetId: selectedAssetId,
                employeeId: selectedEmployeeId,
                assignedDate: new Date().toISOString()
            });

            setSelectedAssetId('');
            setSelectedEmployeeId('');
            fetchAssets(); // Refresh assets
            alert("Asset assigned successfully");
        } catch (err) {
            console.error("Error assigning asset:", err);
            alert("Failed to assign asset");
        }
    };

    const handleUnassignAsset = async (assetId: string) => {
        if (!db) return;
        if (!confirm("Confirm return of this asset?")) return;
        try {
            const assetRef = doc(db, "assets", assetId);
            await updateDoc(assetRef, {
                status: 'Available',
                assignedTo: null
            });
            fetchAssets();
        } catch (err) {
            console.error("Error unassigning asset:", err);
        }
    };

    const handleSaveMaintenance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!db) return;

        try {
            await addDoc(collection(db, "maintenance"), {
                ...maintenanceFormData,
                createdAt: new Date().toISOString()
            });

            // Also update asset status if needed, e.g. to Maintenance
            if (maintenanceFormData.type === 'Repair') {
                const assetRef = doc(db, "assets", maintenanceFormData.assetId);
                await updateDoc(assetRef, { status: 'Maintenance' });
            }

            setMaintenanceFormOpen(false);
            setMaintenanceFormData({
                assetId: '',
                type: 'Maintenance',
                description: '',
                cost: 0,
                provider: '',
                date: new Date().toISOString().split('T')[0]
            });
            fetchMaintenanceRecords();
            fetchAssets(); // Refresh assets to show status change
        } catch (err) {
            console.error("Error saving maintenance record:", err);
            alert("Failed to save maintenance record");
        }
    };

    const calculateCurrentValue = (asset: Asset) => {
        if (!asset.purchaseDate || !asset.purchasePrice || !asset.depreciationRate) return asset.purchasePrice;

        const purchaseDate = new Date(asset.purchaseDate);
        const now = new Date();
        const yearsDiff = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

        const depreciationAmount = asset.purchasePrice * (asset.depreciationRate / 100) * yearsDiff;
        const value = Math.max(0, asset.purchasePrice - depreciationAmount);

        return value;
    };

    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getIconForCategory = (category: string) => {
        switch (category) {
            case 'Laptop': return <Monitor size={18} />;
            case 'Desktop': return <Monitor size={18} />;
            case 'Monitor': return <Monitor size={18} />;
            case 'Peripheral': return <Cpu size={18} />;
            default: return <Server size={18} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Asset Management</h1>
                {activeSubTab === 'inventory' && (
                    <Button onClick={() => {
                        setFormData({
                            type: 'Hardware',
                            status: 'Available',
                            purchasePrice: 0,
                            depreciationRate: 20
                        });
                        setIsFormOpen(true);
                    }} className="gap-2">
                        <Plus size={18} /> Add Asset
                    </Button>
                )}
            </div>

            <div className="flex gap-4 border-b border-slate-200 pb-1">
                <button
                    onClick={() => setActiveSubTab('inventory')}
                    className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeSubTab === 'inventory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Inventory
                </button>
                <button
                    onClick={() => setActiveSubTab('assignments')}
                    className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeSubTab === 'assignments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Assignments
                </button>
                <button
                    onClick={() => setActiveSubTab('maintenance')}
                    className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeSubTab === 'maintenance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Maintenance
                </button>
            </div>

            {isFormOpen && activeSubTab === 'inventory' && (
                <Card className="p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">{formData.id ? 'Edit Asset' : 'New Asset'}</h2>
                    <form onSubmit={handleSaveAsset} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Asset Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                            <select
                                required
                                value={formData.category || ''}
                                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Category</option>
                                <option value="Laptop">Laptop</option>
                                <option value="Desktop">Desktop</option>
                                <option value="Monitor">Monitor</option>
                                <option value="Peripheral">Peripheral</option>
                                <option value="License">Software License</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
                            <input
                                type="text"
                                value={formData.serialNumber || ''}
                                onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price (₹)</label>
                            <input
                                type="number"
                                value={formData.purchasePrice || 0}
                                onChange={e => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                required
                                value={formData.status || 'Available'}
                                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Available">Available</option>
                                <option value="Assigned">Assigned</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Retired">Retired</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 md:col-span-2 mt-4">
                            <Button type="button" variant="secondary" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Asset</Button>
                        </div>
                    </form>
                </Card>
            )}

            {activeSubTab === 'inventory' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name or serial..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                    <table className="w-full">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-3 text-left">Asset</th>
                                <th className="px-6 py-3 text-left">Serial / Specs</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Value (Est.)</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No assets found. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                filteredAssets.map(asset => (
                                    <tr key={asset.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                    {getIconForCategory(asset.category)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{asset.name}</div>
                                                    <div className="text-xs text-slate-500">{asset.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-700">{asset.serialNumber || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                                                ${asset.status === 'Available' ? 'bg-green-100 text-green-700' :
                                                    asset.status === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                                                        asset.status === 'Maintenance' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                                                {asset.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">
                                                    ₹{Math.round(calculateCurrentValue(asset)).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    Orig: ₹{asset.purchasePrice.toLocaleString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setFormData({
                                                            ...asset,
                                                            status: asset.status || 'Available'
                                                        });
                                                        setIsFormOpen(true);
                                                    }}
                                                    className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-colors"
                                                >
                                                    <RefreshCw size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteAsset(asset.id)}
                                                    className="p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeSubTab === 'assignments' && (
                <div className="space-y-6">
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Assign Asset</h2>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Available Asset</label>
                                <select
                                    value={selectedAssetId}
                                    onChange={(e) => setSelectedAssetId(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Choose Asset --</option>
                                    {assets.map(asset => (
                                        <option
                                            key={asset.id}
                                            value={asset.id}
                                            disabled={asset.status !== 'Available'}
                                        >
                                            {asset.name} ({asset.serialNumber || 'No Serial'}) - {asset.status || 'Status Missing'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Employee</label>
                                <select
                                    value={selectedEmployeeId}
                                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Choose Employee --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>
                            <Button onClick={handleAssignAsset} disabled={!selectedAssetId || !selectedEmployeeId}>
                                Assign
                            </Button>
                        </div>
                    </Card>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-200 bg-slate-50">
                            <h3 className="font-semibold text-slate-900">Current Assignments</h3>
                        </div>
                        <table className="w-full">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3 text-left">Asset</th>
                                    <th className="px-6 py-3 text-left">Assigned To</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {assets.filter(a => a.status === 'Assigned').length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                            No assets currently assigned.
                                        </td>
                                    </tr>
                                ) : (
                                    assets.filter(a => a.status === 'Assigned').map(asset => {
                                        const assignedEmployee = employees.find(e => e.id === asset.assignedTo);
                                        return (
                                            <tr key={asset.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">{asset.name}</div>
                                                    <div className="text-xs text-slate-500">{asset.serialNumber}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {assignedEmployee ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                                                {assignedEmployee.name.charAt(0)}
                                                            </div>
                                                            <span className="text-sm text-slate-700">{assignedEmployee.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-red-500">Unknown User ({asset.assignedTo})</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => handleUnassignAsset(asset.id)}
                                                        className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                                    >
                                                        Return
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeSubTab === 'maintenance' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <Button onClick={() => setMaintenanceFormOpen(true)} className="gap-2">
                            <Plus size={18} /> Log Maintenance
                        </Button>
                    </div>

                    {maintenanceFormOpen && (
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4">Log Maintenance Record</h2>
                            <form onSubmit={handleSaveMaintenance} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Asset</label>
                                    <select
                                        required
                                        value={maintenanceFormData.assetId}
                                        onChange={e => setMaintenanceFormData({ ...maintenanceFormData, assetId: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Asset</option>
                                        {assets.map(asset => (
                                            <option key={asset.id} value={asset.id}>{asset.name} ({asset.serialNumber})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select
                                        required
                                        value={maintenanceFormData.type}
                                        onChange={e => setMaintenanceFormData({ ...maintenanceFormData, type: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Maintenance">Routine Maintenance</option>
                                        <option value="Repair">Repair</option>
                                        <option value="Upgrade">Upgrade</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={maintenanceFormData.date}
                                        onChange={e => setMaintenanceFormData({ ...maintenanceFormData, date: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Cost (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={maintenanceFormData.cost}
                                        onChange={e => setMaintenanceFormData({ ...maintenanceFormData, cost: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Provider</label>
                                    <input
                                        type="text"
                                        required
                                        value={maintenanceFormData.provider}
                                        onChange={e => setMaintenanceFormData({ ...maintenanceFormData, provider: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea
                                        required
                                        value={maintenanceFormData.description}
                                        onChange={e => setMaintenanceFormData({ ...maintenanceFormData, description: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 md:col-span-2 mt-4">
                                    <Button type="button" variant="secondary" onClick={() => setMaintenanceFormOpen(false)}>Cancel</Button>
                                    <Button type="submit">Log Record</Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-200 bg-slate-50">
                            <h3 className="font-semibold text-slate-900">Maintenance History</h3>
                        </div>
                        <table className="w-full">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-3 text-left">Date</th>
                                    <th className="px-6 py-3 text-left">Asset</th>
                                    <th className="px-6 py-3 text-left">Type</th>
                                    <th className="px-6 py-3 text-left">Provider</th>
                                    <th className="px-6 py-3 text-left">Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {maintenanceRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            No maintenance records found.
                                        </td>
                                    </tr>
                                ) : (
                                    maintenanceRecords.map(record => {
                                        const asset = assets.find(a => a.id === record.assetId);
                                        return (
                                            <tr key={record.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 text-sm text-slate-700">{record.date}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">{asset?.name || 'Unknown Asset'}</div>
                                                    <div className="text-xs text-slate-500">{asset?.serialNumber}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full
                                                        ${record.type === 'Repair' ? 'bg-red-100 text-red-700' :
                                                            record.type === 'Upgrade' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {record.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700">{record.provider}</td>
                                                <td className="px-6 py-4 text-sm text-slate-900">₹{record.cost}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
