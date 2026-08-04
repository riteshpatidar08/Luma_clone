import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignIn } from './components/SignIn';
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import EventDetailsPage from './pages/EventDetailsPage';
import CreateEventPage from './pages/CreateEventPage';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ProtectedRoutes from './components/ProtectedRoutes';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import Navbar from './components/Navbar';
import { ChatWidget } from './components/ChatWidget';
import DashboardLayout from './components/dashboard/DashboardLayout';

import MyTicketsPage from './pages/attendee/MyTicketsPage';
import SavedEventsPage from './pages/attendee/SavedEventsPage';
import ProfileSettingsPage from './pages/attendee/ProfileSettingsPage';

import OrganizerOverviewPage from './pages/organizer/OrganizerOverviewPage';
import OrganizerEventsPage from './pages/organizer/OrganizerEventsPage';
import EditEventPage from './pages/organizer/EditEventPage';
import EventAttendeesPage from './pages/organizer/EventAttendeesPage';
import CheckInPage from './pages/organizer/CheckInPage';

import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminModerationPage from './pages/admin/AdminModerationPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/eventdetails/:id" element={<EventDetailsPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Any authenticated user */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/register/event" element={<CreateEventPage />} />

          <Route path="/dashboard" element={<DashboardLayout section="attendee" />}>
            <Route index element={<MyTicketsPage />} />
            <Route path="saved" element={<SavedEventsPage />} />
            <Route path="settings" element={<ProfileSettingsPage />} />
          </Route>
        </Route>

        {/* Organizer + Admin */}
        <Route element={<RoleProtectedRoute roles={['organizer', 'admin']} />}>
          <Route path="/organizer" element={<DashboardLayout section="organizer" />}>
            <Route index element={<OrganizerOverviewPage />} />
            <Route path="events" element={<OrganizerEventsPage />} />
            <Route path="events/:id/edit" element={<EditEventPage />} />
            <Route path="events/:eventId/attendees" element={<EventAttendeesPage />} />
            <Route path="events/:eventId/checkin" element={<CheckInPage />} />
          </Route>
        </Route>

        {/* Admin only */}
        <Route element={<RoleProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<DashboardLayout section="admin" />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="moderation" element={<AdminModerationPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ChatWidget />
    </BrowserRouter>
  );
}

export default App;
