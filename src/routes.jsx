import HomePage from '../components/HomePage';
import Admin from '../components/Admin';
import AdminDashboard from '../components/dashboard'

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
        element: AdminDashboard,
        name: 'Tableau de Bord',
    }

    // Ajoute tes autres routes ici
];

export default routes;
