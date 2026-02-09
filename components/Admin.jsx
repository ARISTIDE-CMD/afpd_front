import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminDashboard from './dashboard';
import AccessModal from './AccessModal';
import { apiDelete, apiFetch, apiGet, apiPost, apiPut } from '../src/api';

const MembersView = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('Toutes');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [members, setMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);
    const [membersError, setMembersError] = useState('');
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSavingMember, setIsSavingMember] = useState(false);
    const [isDeletingMember, setIsDeletingMember] = useState(false);
    const [editError, setEditError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [editForm, setEditForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        statut: 'actif',
    });

    const fetchMembers = useCallback(async () => {
        setIsLoadingMembers(true);
        setMembersError('');
        try {
            const data = await apiGet('/api/users');
            const nonPendingUsers = Array.isArray(data)
                ? data.filter((user) => (user?.statut ?? '').toLowerCase() !== 'pending')
                : [];
            setMembers(nonPendingUsers);
        } catch (error) {
            setMembersError("Impossible de charger les membres.");
        } finally {
            setIsLoadingMembers(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const openEditModal = (member) => {
        setSelectedMember(member);
        setEditError('');
        setEditForm({
            nom: member?.nom ?? '',
            prenom: member?.prenom ?? '',
            email: member?.email ?? '',
            telephone: member?.telephone ?? '',
            statut: member?.statut ?? 'actif',
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedMember(null);
    };

    const openDeleteModal = (member) => {
        setSelectedMember(member);
        setDeleteError('');
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedMember(null);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMember?.id || isSavingMember) return;
        setIsSavingMember(true);
        setEditError('');

        try {
            const payload = {
                nom: editForm.nom.trim(),
                prenom: editForm.prenom.trim(),
                email: editForm.email.trim(),
                telephone: editForm.telephone.trim() || null,
                statut: editForm.statut,
            };
            await apiPut(`/api/users/${selectedMember.id}`, payload);
            await fetchMembers();
            closeEditModal();
        } catch (error) {
            setEditError("La mise à jour a échoué. Merci de réessayer.");
        } finally {
            setIsSavingMember(false);
        }
    };

    const handleDeleteMember = async () => {
        if (!selectedMember?.id || isDeletingMember) return;
        setIsDeletingMember(true);
        setDeleteError('');

        try {
            await apiDelete(`/api/users/${selectedMember.id}`);
            await fetchMembers();
            closeDeleteModal();
        } catch (error) {
            setDeleteError("La suppression a échoué. Merci de réessayer.");
        } finally {
            setIsDeletingMember(false);
        }
    };

    const updateEditField = (field, value) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
    };

    const totalMembers = members.length;
    const itemsPerPage = 4;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(startItem + itemsPerPage - 1, totalMembers);

    const filteredMembers = members.filter((member) => {
        const fullName = `${member?.nom ?? ''} ${member?.prenom ?? ''}`.trim();
        const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (member?.email ?? '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'Toutes' ||
            (activeFilter === 'Actives' && member?.statut === 'actif') ||
            (activeFilter === 'Inactives' && member?.statut === 'inactif');
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="w-full px-6 py-8">
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
                    <button
                        type="button"
                        onClick={() => setIsAccessModalOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                    >
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
                                    Nom Complet
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                    Téléphone
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                                    Rôle
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
                            {isLoadingMembers && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Chargement des membres...
                                    </td>
                                </tr>
                            )}
                            {!isLoadingMembers && membersError && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-red-600">
                                        {membersError}
                                    </td>
                                </tr>
                            )}
                            {!isLoadingMembers && !membersError && filteredMembers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Aucun membre actif trouvé.
                                    </td>
                                </tr>
                            )}
                            {!isLoadingMembers && !membersError && filteredMembers.map((member, index) => {
                                const fullName = `${member?.nom ?? ''} ${member?.prenom ?? ''}`.trim();
                                const roleName = member?.role?.nom_role ?? '-';
                                return (
                                    <tr
                                        key={member.id}
                                        className="hover:bg-purple-50/40 transition-colors"
                                        style={{
                                            animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{fullName || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {member?.telephone ?? '-'}
                                        </td>
                                        <td className="px-6 py-4 text-purple-600">
                                            {member?.email ?? '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">
                                            {roleName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${member?.statut === 'actif'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {member?.statut ?? '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(member)}
                                                    className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => openDeleteModal(member)}
                                                    className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 bg-white border-t border-purple-100 flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                        Affichage de <span className="font-semibold">{totalMembers === 0 ? 0 : startItem}</span> à <span className="font-semibold">{totalMembers === 0 ? 0 : endItem}</span> sur <span className="font-semibold">{totalMembers}</span> adhérentes
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

            {isEditModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="Fermer la fenêtre"
                        onClick={closeEditModal}
                        className="absolute inset-0 z-0 bg-slate-900/50 backdrop-blur-sm"
                    />
                    <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-slate-900/20 ring-1 ring-black/10 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-900">Modifier un utilisateur</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Mettez à jour les informations du membre sélectionné.
                            </p>
                        </div>
                        <form onSubmit={handleEditSubmit} className="px-6 py-5 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="edit-nom" className="block text-sm font-semibold text-slate-900 mb-2">
                                        Nom
                                    </label>
                                    <input
                                        id="edit-nom"
                                        type="text"
                                        value={editForm.nom}
                                        onChange={(e) => updateEditField('nom', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/60 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all text-base text-slate-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-prenom" className="block text-sm font-semibold text-slate-900 mb-2">
                                        Prénom
                                    </label>
                                    <input
                                        id="edit-prenom"
                                        type="text"
                                        value={editForm.prenom}
                                        onChange={(e) => updateEditField('prenom', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/60 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all text-base text-slate-900"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="edit-email" className="block text-sm font-semibold text-slate-900 mb-2">
                                        Email
                                    </label>
                                    <input
                                        id="edit-email"
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => updateEditField('email', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/60 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all text-base text-slate-900"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-telephone" className="block text-sm font-semibold text-slate-900 mb-2">
                                        Téléphone
                                    </label>
                                    <input
                                        id="edit-telephone"
                                        type="tel"
                                        value={editForm.telephone ?? ''}
                                        onChange={(e) => updateEditField('telephone', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/60 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all text-base text-slate-900"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="edit-statut" className="block text-sm font-semibold text-slate-900 mb-2">
                                        Statut
                                    </label>
                                    <select
                                        id="edit-statut"
                                        value={editForm.statut}
                                        onChange={(e) => updateEditField('statut', e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50/60 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all text-base text-slate-900"
                                    >
                                        <option value="actif">Actif</option>
                                        <option value="inactif">Inactif</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>

                            {editError && (
                                <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm font-medium border border-red-200">
                                    {editError}
                                </div>
                            )}

                            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 transition font-medium bg-gray-200 text-base"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingMember}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-base"
                                >
                                    {isSavingMember ? 'Mise à jour...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <button
                        type="button"
                        aria-label="Fermer la fenêtre"
                        onClick={closeDeleteModal}
                        className="absolute inset-0 z-0 bg-slate-900/50 backdrop-blur-sm"
                    />
                    <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-slate-900/20 ring-1 ring-black/10 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-900">Supprimer un utilisateur</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Cette action est irréversible.
                            </p>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <p className="text-slate-700">
                                Confirmez la suppression de{' '}
                                <span className="font-semibold">
                                    {`${selectedMember?.nom ?? ''} ${selectedMember?.prenom ?? ''}`.trim() || 'cet utilisateur'}
                                </span>
                                .
                            </p>
                            {deleteError && (
                                <div className="rounded-xl bg-red-50 text-red-700 px-4 py-3 text-sm font-medium border border-red-200">
                                    {deleteError}
                                </div>
                            )}
                            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 transition font-medium bg-gray-200 text-base"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteMember}
                                    disabled={isDeletingMember}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 text-white font-semibold shadow-lg shadow-red-500/20 hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-base"
                                >
                                    {isDeletingMember ? 'Suppression...' : 'Supprimer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

            <AccessModal
                isOpen={isAccessModalOpen}
                onClose={() => setIsAccessModalOpen(false)}
            />
        </div>
    );
};

const PendingMembersView = () => {
    const [pendingMembers, setPendingMembers] = useState([]);
    const [isLoadingPending, setIsLoadingPending] = useState(true);
    const [pendingError, setPendingError] = useState('');
    const [actionError, setActionError] = useState('');
    const [processingId, setProcessingId] = useState(null);

    const fetchPendingMembers = useCallback(async () => {
        setIsLoadingPending(true);
        setPendingError('');
        try {
            const data = await apiGet('/api/admin/pending-users');
            const pendingUsers = Array.isArray(data)
                ? data.filter((user) => user?.statut === 'pending')
                : [];
            setPendingMembers(pendingUsers);
        } catch (error) {
            setPendingError("Impossible de charger les demandes en attente.");
        } finally {
            setIsLoadingPending(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingMembers();
    }, [fetchPendingMembers]);

    const handleAcceptPending = async (id) => {
        if (!id || processingId) return;
        setProcessingId(id);
        setActionError('');
        try {
            await apiPut(`/api/admin/validate-user/${id}`);
            await fetchPendingMembers();
        } catch (error) {
            setActionError("L'action a échoué. Merci de réessayer.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectPending = async (id) => {
        if (!id || processingId) return;
        setProcessingId(id);
        setActionError('');
        try {
            await apiDelete(`/api/admin/reject-user/${id}`);
            await fetchPendingMembers();
        } catch (error) {
            setActionError("L'action a échoué. Merci de réessayer.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="w-full px-6 py-8">
            <div className="bg-white rounded-2xl p-8 mb-6 shadow-sm border border-purple-100">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Demandes en attente
                        </h1>
                        <p className="text-purple-600/80">
                            Validez ou rejetez les nouvelles demandes d'accès.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-purple-100">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white border-b border-purple-100">
                            <tr>
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
                                    Rôle
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
                            {isLoadingPending && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Chargement des demandes...
                                    </td>
                                </tr>
                            )}
                            {!isLoadingPending && pendingError && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-red-600">
                                        {pendingError}
                                    </td>
                                </tr>
                            )}
                            {!isLoadingPending && !pendingError && pendingMembers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Aucune demande en attente.
                                    </td>
                                </tr>
                            )}
                            {!isLoadingPending && !pendingError && pendingMembers.map((member) => {
                                const fullName = `${member?.nom ?? ''} ${member?.prenom ?? ''}`.trim();
                                const roleName = member?.role?.nom_role ?? '-';
                                return (
                                    <tr key={member.id} className="hover:bg-purple-50/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{fullName || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {member?.telephone ?? '-'}
                                        </td>
                                        <td className="px-6 py-4 text-purple-600">
                                            {member?.email ?? '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-700">
                                            {roleName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                {member?.statut ?? 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAcceptPending(member.id)}
                                                    disabled={processingId === member.id}
                                                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    Accepter
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRejectPending(member.id)}
                                                    disabled={processingId === member.id}
                                                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                                                >
                                                    Rejeter
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {actionError && (
                    <div className="px-6 py-4 bg-red-50 text-red-700 text-sm font-medium border-t border-red-100">
                        {actionError}
                    </div>
                )}
            </div>
        </div>
    );
};

const Admin = ({ initialSectionId = 'members' }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState(initialSectionId);
    const [isBooting, setIsBooting] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setIsBooting(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await apiFetch('/api/logout', { method: 'POST', credentials: 'include' });
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        } finally {
            setIsLoggingOut(false);
            navigate('/');
        }
    };

    const sections = [
        {
            id: 'dashboard',
            label: 'Tableau de bord',
            headerTitle: 'Tableau de bord',
            headerSubtitle: 'Vue administratrice',
            component: AdminDashboard,
            icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 13h6V4H4v9zm10 7h6V11h-6v9zM4 20h6v-5H4v5zm10-9h6V4h-6v7z" />
                </svg>
            ),
        },
        {
            id: 'members',
            label: 'Adhérentes',
            headerTitle: 'Gestion des Adhérentes',
            headerSubtitle: 'Vue administratrice',
            component: MembersView,
            icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20a4 4 0 00-4-4H7a4 4 0 00-4 4m10-10a4 4 0 11-8 0 4 4 0 018 0m10 10v-1a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
            ),
        },
        {
            id: 'pending',
            label: 'En attente',
            headerTitle: 'Demandes en attente',
            headerSubtitle: 'Validation des adhérentes',
            component: PendingMembersView,
            icon: (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3M12 3a9 9 0 100 18 9 9 0 000-18z" />
                </svg>
            ),
        },
    ];

    const activeSection = sections.find((section) => section.id === activeSectionId) || sections[0];
    const ActiveComponent = activeSection.component;

    return (
        <div className="min-h-screen bg-[#F7F4F8]">
            <div className="flex">
                <AdminNavbar
                    isSidebarOpen={isSidebarOpen}
                    isSidebarMobileOpen={isSidebarMobileOpen}
                    setIsSidebarMobileOpen={setIsSidebarMobileOpen}
                    sections={sections}
                    activeSectionId={activeSection.id}
                    onSelectSection={setActiveSectionId}
                    onLogout={handleLogout}
                />

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
                                        <h2 className="text-xl font-bold text-gray-900">{activeSection.headerTitle}</h2>
                                        <p className="text-sm text-purple-500">{activeSection.headerSubtitle}</p>
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
                    <main className="w-full flex-1">
                        <ActiveComponent />
                    </main>

                    {/* Footer */}
                    <footer className="bg-white border-t border-purple-100 mt-12">
                        <div className="w-full px-6 py-6 text-center text-sm text-gray-600">
                            © 2024 Association des Femmes à la Pointe du Digital (AFPD). Tous droits réservés.
                        </div>
                    </footer>
                </div>
            </div>

            {isBooting && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white/40 backdrop-blur-md px-6">
                    <div className="w-full max-w-md bg-white/90 rounded-3xl shadow-2xl shadow-purple-500/10 border border-purple-100 px-8 py-10 text-center">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        </div>
                        <div className="mt-6 h-2 w-full rounded-full bg-purple-100 overflow-hidden">
                            <div className="h-full w-2/3 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
