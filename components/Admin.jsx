import React, { useEffect, useState } from 'react';

const MembersManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Toutes');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
    const [isBooting, setIsBooting] = useState(true);

    // Données des membres
    const members = [
        {
            id: 1,
            name: 'Sarah Kone',
            title: 'Développeuse Fullstack',
            phone: '+225 0102030405',
            email: 's.kone@email.com',
            status: 'Actif',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
        },
        {
            id: 2,
            name: 'Alice Dubois',
            title: 'Product Designer',
            phone: '+33 6 12 34 56 78',
            email: 'alice.d@email.com',
            status: 'Actif',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
        },
        {
            id: 3,
            name: 'Aminata Traoré',
            title: 'Data Scientist',
            phone: '+223 70 80 90 00',
            email: 'aminata.t@email.com',
            status: 'Inactif',
            avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop'
        },
        {
            id: 4,
            name: 'Fatou Diop',
            title: 'Consultante IT',
            phone: '+221 77 123 45 67',
            email: 'fatou.diop@email.com',
            status: 'Actif',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
        }
    ];

    const totalMembers = 24;
    const itemsPerPage = 4;

    const filteredMembers = members.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'Toutes' ||
            (activeFilter === 'Actives' && member.status === 'Actif') ||
            (activeFilter === 'Inactives' && member.status === 'Inactif');
        return matchesSearch && matchesFilter;
    });

    useEffect(() => {
        const timer = setTimeout(() => setIsBooting(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const handleLogout = () => {
        // Placeholder logout handler to be wired later
        console.log('Logout');
    };

    return (
        <div className="min-h-screen bg-[#F7F4F8]">
            <div className="flex">
                {/* Mobile Overlay */}
                <button
                    type="button"
                    aria-label="Fermer la sidebar"
                    onClick={() => setIsSidebarMobileOpen(false)}
                    className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden ${isSidebarMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                />

                {/* Sidebar */}
                <aside
                    className={`fixed lg:sticky lg:top-0 top-0 left-0 z-50 h-screen bg-white border-r border-purple-100 transition-all duration-200 ${isSidebarOpen ? 'w-64' : 'w-20'
                        } ${isSidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                        }`}
                >
                    <div className="h-full flex flex-col">
                        <div className="flex items-center justify-between px-4 py-4 border-b border-purple-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                    </svg>
                                </div>
                                <span className={`text-lg font-bold text-gray-900 ${isSidebarOpen ? 'block' : 'hidden'}`}>
                                    AFPD Admin
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSidebarMobileOpen(false)}
                                className="lg:hidden p-2 rounded-lg hover:bg-purple-50 text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <nav className="flex-1 px-3 py-4 space-y-2">
                            {[
                                {
                                    label: 'Tableau de bord',
                                    active: false,
                                    icon: (
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 13h6V4H4v9zm10 7h6V11h-6v9zM4 20h6v-5H4v5zm10-9h6V4h-6v7z" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: 'Adhérentes',
                                    active: true,
                                    icon: (
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20a4 4 0 00-4-4H7a4 4 0 00-4 4m10-10a4 4 0 11-8 0 4 4 0 018 0m10 10v-1a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: 'Événements',
                                    active: false,
                                    icon: (
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M4 11h16M5 7h14a1 1 0 011 1v11a2 2 0 01-2 2H6a2 2 0 01-2-2V8a1 1 0 011-1z" />
                                        </svg>
                                    ),
                                },
                                {
                                    label: 'Cotisations',
                                    active: false,
                                    icon: (
                                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a5 5 0 00-10 0v2M5 9h14l-1 11H6L5 9z" />
                                        </svg>
                                    ),
                                },
                            ].map((item) => (
                                <a
                                    key={item.label}
                                    href="#"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.active
                                            ? 'bg-purple-50 text-purple-700'
                                            : 'text-gray-600 hover:bg-purple-50/70 hover:text-gray-900'
                                        }`}
                                >
                                    <span className="text-purple-500">{item.icon}</span>
                                    <span className={`${isSidebarOpen ? 'block' : 'hidden'}`}>{item.label}</span>
                                </a>
                            ))}
                        </nav>

                        <div className="px-3 py-4 border-t border-purple-100 space-y-3">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50/60 text-sm text-gray-700 ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                </span>
                                <span className={`${isSidebarOpen ? 'block' : 'hidden'}`}>Connectée</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-purple-600 bg-red-100 hover:bg-purple-50 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                                </svg>
                                <span className={`${isSidebarOpen ? 'block' : 'hidden'}`}>Déconnexion</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Column */}
                <div className="flex-1 w-full flex flex-col">
                    {/* Header Navigation */}
                    <header className="bg-white border-b border-purple-100 sticky top-0 z-30">
                        <div className="w-full px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsSidebarOpen(true);
                                            setIsSidebarMobileOpen(true);
                                        }}
                                        className="lg:hidden p-2 rounded-lg hover:bg-purple-50 text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                        className="hidden lg:inline-flex p-2 rounded-lg hover:bg-purple-50 text-gray-600"
                                    >
                                        <svg className={`w-5 h-5 transition-transform ${isSidebarOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Gestion des Adhérentes</h2>
                                        <p className="text-sm text-purple-500">Vue administratrice</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-sm">
                                        Mon Profil
                                    </button>
                                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-purple-200">
                                        <img
                                            src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop"
                                            alt="User"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="w-full px-6 py-8 flex-1">
                        {/* Page Title Section */}
                        <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm border border-purple-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        Gestion des Adhérentes
                                    </h1>
                                    <p className="text-purple-600/80">
                                        Gérez les membres de l'Association des Femmes à la Pointe du Digital.
                                    </p>
                                </div>
                                <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Ajouter une adhérente
                                </button>
                            </div>
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-purple-100">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                {/* Search Input */}
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Rechercher par nom, email..."
                                        className="w-full pl-12 pr-4 py-3.5 bg-purple-50/70 border border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all text-gray-900 placeholder-purple-400"
                                    />
                                </div>

                                {/* Filter Buttons */}
                                <div className="flex items-center gap-2 bg-purple-50/80 border border-purple-100 rounded-xl p-1">
                                    {['Toutes', 'Actives', 'Inactives'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setActiveFilter(filter)}
                                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === filter
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>

                                {/* Advanced Filters Toggle */}
                                <button
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                    className="flex items-center gap-2 px-4 py-3 border border-purple-100 rounded-xl hover:bg-purple-50 transition-all text-gray-700 font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                    Filtres avancés
                                    <svg className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Members Table */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-purple-100">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white border-b border-purple-100">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                Photo
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                Nom Complet
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                Téléphone
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                Email
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                Statut
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-purple-100/60">
                                        {filteredMembers.map((member, index) => (
                                            <tr
                                                key={member.id}
                                                className="hover:bg-purple-50/40 transition-colors"
                                                style={{
                                                    animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`
                                                }}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-purple-200">
                                                        <img
                                                            src={member.avatar}
                                                            alt={member.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{member.name}</div>
                                                        <div className="text-sm text-gray-500">{member.title}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {member.phone}
                                                </td>
                                                <td className="px-6 py-4 text-purple-600">
                                                    {member.email}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${member.status === 'Actif'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {member.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="px-6 py-4 bg-white border-t border-purple-100 flex items-center justify-between">
                                <div className="text-sm text-slate-500">
                                    Affichage de <span className="font-semibold">1</span> à <span className="font-semibold">4</span> sur <span className="font-semibold">24</span> adhérentes
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-purple-50 rounded-lg transition-all border border-purple-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    {[1, 2, 3].map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-lg font-medium transition-all border border-purple-100 ${currentPage === page
                                                ? 'bg-purple-600 text-white shadow-lg'
                                                : 'text-gray-700 hover:bg-purple-50'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-purple-50 rounded-lg transition-all border border-purple-100">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Footer */}
                    <footer className="bg-white border-t border-purple-100 mt-12">
                        <div className="w-full px-6 py-6 text-center text-sm text-gray-600">
                            © 2024 Association des Femmes à la Pointe du Digital (AFPD). Tous droits réservés.
                        </div>
                    </footer>
                </div>
            </div>

            {/* Animations CSS */}
            <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

            {isBooting && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/40 backdrop-blur-md px-6">
                    <div className="w-full max-w-md bg-white/90 rounded-3xl shadow-2xl shadow-purple-500/10 border border-purple-100 px-8 py-10 text-center">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </div>
                        {/* <h2 className="mt-5 text-xl font-semibold text-gray-900">AFPD Admin</h2>
                        <p className="mt-2 text-sm text-gray-500">Chargement de votre espace sécurisé…</p> */}
                        <div className="mt-6 h-2 w-full rounded-full bg-purple-100 overflow-hidden">
                            <div className="h-full w-2/3 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembersManagement;
