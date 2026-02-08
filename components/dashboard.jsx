import React from 'react';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, Users, Euro, CalendarDays } from 'lucide-react';

const AdminDashboard = () => {
    // Données pour le graphique d'évolution des revenus
    const revenueData = [
        { month: 'JAN', value: 35 },
        { month: 'FÉV', value: 45 },
        { month: 'MAR', value: 42 },
        { month: 'AVR', value: 62 },
        { month: 'MAI', value: 58 },
        { month: 'JUIN', value: 75 }
    ];

    const maxValue = Math.max(...revenueData.map(d => d.value));

    return (
        <div className="flex-1 bg-gray-50 p-8">
            {/* Header */}
            {/* <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Tableau de Bord Administratif</h1>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher une adhérente, une facture..."
                            className="w-80 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2">
                        + Nouvelle Adhérente
                    </button>
                </div>
            </div> */}

            {/* Cards statistiques */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                {/* Adhérentes Actives */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            +12%
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Adhérentes Actives</p>
                    <p className="text-3xl font-bold text-gray-800">1,240</p>
                </div>

                {/* Cotisations Total */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <Euro className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            +5.2%
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Cotisations Total</p>
                    <p className="text-3xl font-bold text-gray-800">45,600 €</p>
                </div>

                {/* Cotisations Impayées */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-red-100 p-3 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <span className="text-red-500 text-sm font-medium flex items-center gap-1">
                            <TrendingDown className="w-4 h-4" />
                            -2%
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Cotisations Impayées</p>
                    <p className="text-3xl font-bold text-gray-800">120 €</p>
                </div>

                {/* Événements (Mois) */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <CalendarDays className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-gray-400 text-sm font-medium">Stagnant</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">Événements (Mois)</p>
                    <p className="text-3xl font-bold text-gray-800">8</p>
                </div>
            </div>

            {/* Section graphiques */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Évolution des Revenus */}
                <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Évolution des Revenus</h2>
                            <p className="text-sm text-gray-500">Total cumulé Janv - Juin 2024</p>
                        </div>
                        <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                            <option>Derniers 6 mois</option>
                        </select>
                    </div>

                    {/* Graphique en barres */}
                    <div className="flex items-end justify-between h-64 gap-4">
                        {revenueData.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex items-end justify-center" style={{ height: '200px' }}>
                                    <div
                                        className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                                        style={{
                                            height: `${(data.value / maxValue) * 100}%`,
                                            background: `linear-gradient(to top, rgb(147, 51, 234), rgb(192, 132, 252))`
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500 font-medium">{data.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Taux de Participation */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Taux de Participation</h2>
                    <p className="text-sm text-gray-500 mb-8">Efficacité des événements</p>

                    {/* Graphique circulaire */}
                    <div className="flex justify-center mb-8">
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    fill="none"
                                    stroke="#f3f4f6"
                                    strokeWidth="16"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="80"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="16"
                                    strokeDasharray={`${2 * Math.PI * 80 * 0.85} ${2 * Math.PI * 80}`}
                                    strokeLinecap="round"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#a855f7" />
                                        <stop offset="100%" stopColor="#7c3aed" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-gray-800">85%</span>
                                <span className="text-sm text-gray-500">GLOBAL</span>
                            </div>
                        </div>
                    </div>

                    {/* Légende */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                                <span className="text-sm text-gray-600">Présents</span>
                            </div>
                            <span className="text-sm font-medium text-gray-800">850</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                <span className="text-sm text-gray-600">Inscrits absents</span>
                            </div>
                            <span className="text-sm font-medium text-gray-800">150</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section notifications et événements */}
            <div className="grid grid-cols-3 gap-6">
                {/* Notifications Récentes */}
                <div className="col-span-2 bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Notifications Récentes</h2>
                        <button className="text-purple-600 text-sm font-medium hover:underline">
                            Tout marquer comme lu
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Notification 1 */}
                        <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <Users className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-800">
                                    <span className="font-medium">Sophie Martin</span> vient de finaliser son adhésion annuelle.
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500">Il y a 10 minutes</span>
                                    <span className="text-xs text-purple-600 font-medium">• Profil Adhérente</span>
                                </div>
                            </div>
                        </div>

                        {/* Notification 2 */}
                        <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <Euro className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-800">
                                    <span className="font-medium">Cotisation Reçue :</span> Sarah K. a payé via Stripe (Formation IA).
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500">Il y a 45 minutes</span>
                                    <span className="text-xs text-purple-600 font-medium">• Détails Facture</span>
                                </div>
                            </div>
                        </div>

                        {/* Notification 3 */}
                        <div className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="bg-orange-100 p-2 rounded-lg">
                                <Calendar className="w-5 h-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-800">
                                    <span className="font-medium">Nouvel Événement :</span> L'atelier "Networking Digital" est complet.
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500">Il y a 2 heures</span>
                                    <span className="text-xs text-purple-600 font-medium">• Gérer l'Event</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Événements à Venir */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">Événements à Venir</h2>

                    {/* Calendrier mini */}
                    <div className="mb-6">
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                                <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {[28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((day, i) => (
                                <div
                                    key={i}
                                    className={`text-center text-sm py-2 rounded-lg transition-colors ${day < 28 ? 'text-gray-300' : day === 6 ? 'bg-purple-600 text-white font-medium' : day === 10 ? 'bg-purple-100 text-purple-600 font-medium' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Prochain événement */}
                    <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-600">
                        <div className="flex items-start gap-3">
                            <div className="bg-purple-600 text-white rounded-lg px-3 py-2 text-center">
                                <div className="text-xs font-medium">JUIN</div>
                                <div className="text-2xl font-bold">10</div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-800 mb-1">Atelier Tech & Women</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <span>🕐 18:30</span>
                                    <span>•</span>
                                    <span>Distanciel</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
