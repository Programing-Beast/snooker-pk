import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleRoute, GuestRoute } from './router';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Public pages
import HomePage from './pages/public/HomePage';
import TournamentsPage from './pages/public/TournamentsPage';
import TournamentDetailPage from './pages/public/TournamentDetailPage';
import PlayerProfilePage from './pages/public/PlayerProfilePageV2';
import RankingsPage from './pages/public/RankingsPage';
import StorePage from './pages/public/StorePage';
import MatchDetailPage from './pages/public/MatchDetailPage';

// Player pages
import DashboardPage from './pages/player/DashboardPage';
import EditProfilePage from './pages/player/EditProfilePage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import TournamentFormPage from './pages/admin/TournamentFormPage';
import ManageEntriesPage from './pages/admin/ManageEntriesPage';
import ManagePlayersPage from './pages/admin/ManagePlayersPage';
import PlayerFormPage from './pages/admin/PlayerFormPage';
import DrawGeneratePage from './pages/admin/DrawGeneratePage';
import DrawRevealPage from './pages/admin/DrawRevealPage';
import ManageMatchesPage from './pages/admin/ManageMatchesPage';
import AdminTournamentPage from './pages/admin/AdminTournamentPage';
import AwardPrizesPage from './pages/admin/AwardPrizesPage';
import ManageRankingsPage from './pages/admin/ManageRankingsPage';

// Umpire
import UmpireBoardPage from './pages/umpire/UmpireBoardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Guest-only (redirect if logged in) */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Public pages with TopNav layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/tournaments/:slug" element={<TournamentDetailPage />} />
            <Route path="/players/:id" element={<PlayerProfilePage />} />
            <Route path="/rankings" element={<RankingsPage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/matches/:id" element={<MatchDetailPage />} />
          </Route>

          {/* Player pages (authenticated) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<PublicLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
            </Route>
          </Route>

          {/* Admin pages */}
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute role="admin" />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/tournaments/new" element={<TournamentFormPage />} />
                <Route path="/admin/tournaments/:id/edit" element={<TournamentFormPage />} />
                <Route path="/admin/tournaments/:id" element={<AdminTournamentPage />} />
                <Route path="/admin/tournaments/:id/entries" element={<ManageEntriesPage />} />
                <Route path="/admin/tournaments/:id/draw" element={<DrawGeneratePage />} />
                <Route path="/admin/tournaments/:id/reveal" element={<DrawRevealPage />} />
                <Route path="/admin/tournaments/:id/matches" element={<ManageMatchesPage />} />
                <Route path="/admin/tournaments/:id/awards" element={<AwardPrizesPage />} />
                <Route path="/admin/rankings" element={<ManageRankingsPage />} />
                <Route path="/admin/players" element={<ManagePlayersPage />} />
                <Route path="/admin/players/new" element={<PlayerFormPage />} />
                <Route path="/admin/players/:id/edit" element={<PlayerFormPage />} />
              </Route>
            </Route>
          </Route>

          {/* Umpire board (full screen, no layout chrome) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/umpire/:matchId" element={<UmpireBoardPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
