import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import LandingPage from './pages/LandingPage';
import AppShell from './components/AppShell';
import BoardPage from './pages/BoardPage';
import DashboardPage from './pages/DashboardPage';
import FilesPage from './pages/FilesPage';
import MembersPage from './pages/MembersPage';

function AuthenticatedApp({ signOut, user }) {
  return (
    <Routes>
      <Route path="/" element={<AppShell signOut={signOut} user={user} />}>
        <Route index element={<Navigate to="board" replace />} />
        <Route path="board" element={<BoardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="files" element={<FilesPage />} />
        <Route path="members" element={<MembersPage />} />
      </Route>
    </Routes>
  );
}

const AuthenticatedAppWithLogin = withAuthenticator(AuthenticatedApp, {
  formFields: {
    signUp: {
      name: { order: 1, placeholder: 'Enter your full name', label: 'Full Name', isRequired: true },
      email: { order: 2 },
      password: { order: 3 },
      confirm_password: { order: 4 }
    }
  }
});

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app/*" element={<AuthenticatedAppWithLogin />} />
      </Routes>
    </BrowserRouter>
  );
}