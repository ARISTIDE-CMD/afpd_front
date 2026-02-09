import React from 'react';

const AdminNavbar = ({
    isSidebarOpen,
    isSidebarMobileOpen,
    setIsSidebarMobileOpen,
    sections,
    activeSectionId,
    onSelectSection,
    onLogout,
}) => {
    return (
        <>
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
                            <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
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
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex-1 px-3 py-4 space-y-2">
                        {sections.map((item) => {
                            const isActive = activeSectionId === item.id;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                        onSelectSection(item.id);
                                        setIsSidebarMobileOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-purple-50 text-purple-700'
                                            : 'text-gray-600 hover:bg-purple-50/70 hover:text-gray-900'
                                        }`}
                                >
                                    <span className="text-purple-500">{item.icon}</span>
                                    <span className={`${isSidebarOpen ? 'block' : 'hidden'}`}>{item.label}</span>
                                </button>
                            );
                        })}
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
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl text-sm font-medium text-purple-600 bg-red-100 hover:bg-purple-50 transition-all duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                            </svg>
                            <span className={`${isSidebarOpen ? 'block' : 'hidden'}`}>Déconnexion</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminNavbar;
