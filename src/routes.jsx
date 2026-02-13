import HomePage from '../components/HomePage';
import Admin from '../components/Admin';
import CotisationsTracker from '../components/TresorierDashboard'
import CommunityManagerDashboard from '../components/CommunityManagerDashboard';

const AdminDashboardRoute = () => <Admin initialSectionId="dashboard" />;

export const routes = [
    {
        id: 'home',
        path: '/',
        element: HomePage,
        name: 'Accueil',
    },
    {
        id: 'admin',
        path: '/admin',
        element: Admin,
        name: 'Administration',
    },
    {
        id: 'dashboard',
        path: '/dashboard',
        element: AdminDashboardRoute,
        name: 'Tableau de Bord',
    },
    {
        id: 'tresorier',
        path: '/tresorier',
        element: CotisationsTracker,
        name: 'Suivi des Cotisations',
    },
    {
        id: 'community-manager',
        path: '/community-manager',
        element: CommunityManagerDashboard,
        name: 'Community Manager',
    }

    // Ajoute tes autres routes ici
];

export default routes;
