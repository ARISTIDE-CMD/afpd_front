import HomePage from '../components/HomePage';
import Admin from '../components/Admin';
import CotisationsTracker from '../components/TresorierDashboard'

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
    }

    // Ajoute tes autres routes ici
];

export default routes;
