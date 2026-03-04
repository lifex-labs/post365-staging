import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, useAuth } from '@clerk/react';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!CLERK_KEY) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env');

const AuthPage             = lazy(() => import('./pages/AuthPage'));
const PostsPage            = lazy(() => import('./pages/PostsPage'));
const XeoBlogsPage         = lazy(() => import('./pages/XeoBlogsPage'));
const ProfilesPage         = lazy(() => import('./pages/ProfilesPage'));
const SettingsPage         = lazy(() => import('./pages/SettingsPage'));
const PersonalPostsPage    = lazy(() => import('./pages/PersonalPostsPage'));
const PersonalProfilesPage = lazy(() => import('./pages/PersonalProfilesPage'));
const CompanyCalendarPage  = lazy(() => import('./pages/CompanyCalendarPage'));
const ArjunCalendarPage    = lazy(() => import('./pages/ArjunCalendarPage'));
const NaveenCalendarPage   = lazy(() => import('./pages/NaveenCalendarPage'));

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <LoadingSpinner />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <LoadingSpinner />;
  if (isSignedIn) return <Navigate to="/posts" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/sign-in/*"
        element={
          <AuthRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AuthPage mode="sign-in" />
            </Suspense>
          </AuthRoute>
        }
      />
      <Route
        path="/sign-up/*"
        element={
          <AuthRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <AuthPage mode="sign-up" />
            </Suspense>
          </AuthRoute>
        }
      />
      <Route
        path="/"
        element={<ProtectedRoute><Layout /></ProtectedRoute>}
      >
        <Route index element={<Navigate to="/posts" replace />} />
        <Route path="posts"             element={<Suspense fallback={<LoadingSpinner />}><PostsPage /></Suspense>} />
        <Route path="xeo-blogs"         element={<Suspense fallback={<LoadingSpinner />}><XeoBlogsPage /></Suspense>} />
        <Route path="profiles"          element={<Suspense fallback={<LoadingSpinner />}><ProfilesPage /></Suspense>} />
        <Route path="settings"          element={<Suspense fallback={<LoadingSpinner />}><SettingsPage /></Suspense>} />
        <Route path="personal-posts"    element={<Suspense fallback={<LoadingSpinner />}><PersonalPostsPage /></Suspense>} />
        <Route path="personal-profiles" element={<Suspense fallback={<LoadingSpinner />}><PersonalProfilesPage /></Suspense>} />
        <Route path="company-calendar"  element={<Suspense fallback={<LoadingSpinner />}><CompanyCalendarPage /></Suspense>} />
        <Route path="arjun-calendar"    element={<Suspense fallback={<LoadingSpinner />}><ArjunCalendarPage /></Suspense>} />
        <Route path="naveen-calendar"   element={<Suspense fallback={<LoadingSpinner />}><NaveenCalendarPage /></Suspense>} />
      </Route>
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ClerkProvider publishableKey={CLERK_KEY}>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </ClerkProvider>
    </BrowserRouter>
  );
}
