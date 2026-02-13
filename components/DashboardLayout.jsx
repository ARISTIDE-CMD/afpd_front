import React, { useState } from 'react';
import { LogOut, Menu, X, Home, Users, FileText, Settings } from 'lucide-react';
import AdminDashboard from './dashboard';
import MembersManagement from './Admin';
import AFPDLogo from './AFPDLogo';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('dashboard');

    // Éléments de navigation
    const navItems = [
        { id: 'dashboard', label: 'Tableau de Bord', icon: Home },
        { id: 'members', label: 'Adhérentes', icon: Users },
        { id: 'invoices', label: 'Factures', icon: FileText },
        { id: 'settings', label: 'Paramètres', icon: Settings },
    ];

    // Déterminer le contenu à afficher
    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return <AdminDashboard />;
            case 'members':
                return <MembersManagement />;
            case 'invoices':
                return (
                    <div className="flex-1 bg-gray-50 p-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Factures</h1>
                        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                            <p className="text-gray-500">Module Factures en développement</p>
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div className="flex-1 bg-gray-50 p-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-6">Paramètres</h1>
                        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                            <p className="text-gray-500">Module Paramètres en développement</p>
                        </div>
                    </div>
                );
            default:
                return <AdminDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
                    className="p-2 bg-white rounded-lg shadow-md border border-fuchsia-100"
                >
                    {isSidebarMobileOpen ? (
                        <X className="w-6 h-6 text-gray-600" />
                    ) : (
                        <Menu className="w-6 h-6 text-gray-600" />
                    )}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isSidebarMobileOpen && (
                <button
                    onClick={() => setIsSidebarMobileOpen(false)}
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-fuchsia-100 transition-all duration-200 ${isSidebarOpen ? 'w-64' : 'w-20'
                    } ${isSidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-6 border-b border-fuchsia-100">
                        <div className="flex items-center gap-3">
                            <AFPDLogo compact showTitle={isSidebarOpen} />
                            {isSidebarOpen && (
                                <span className="text-sm font-medium text-fuchsia-700/80">Admin</span>
                            )}
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="hidden lg:block p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Navigation Items */}
                    <nav className="flex-1 px-3 py-6 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveSection(item.id);
                                        setIsSidebarMobileOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-fuchsia-100 text-fuchsia-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {isSidebarOpen && <span>{item.label}</span>}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="px-3 py-4 border-t border-fuchsia-100">
                        <button
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5 flex-shrink-0" />
                            {isSidebarOpen && <span>Déconnexion</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex items-start">
                {renderContent()}
            </main>
        </div>
    );
};

export default DashboardLayout;
