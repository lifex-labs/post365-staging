import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, useAuth } from '@clerk/react';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!CLERK_KEY) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env');

const AuthPage             = lazy(() => import('./pages/AuthPage'));
const BrandPostsPage       = lazy(() => import('./pages/BrandPostsPage'));
const XeoBlogsPage         = lazy(() => import('./pages/XeoBlogsPage'));
const BrandProfilesPage    = lazy(() => import('./pages/BrandProfilesPage'));
const SettingsPage         = lazy(() => import('./pages/SettingsPage'));
const PersonalPostsPage    = lazy(() => import('./pages/PersonalPostsPage'));
const PersonalProfilesPage = lazy(() => import('./pages/PersonalProfilesPage'));
const PersonalCalendarPage = lazy(() => import('./pages/PersonalCalendarPage'));
const BrandCalendarPage    = lazy(() => import('./pages/BrandCalendarPage'));
const NewBrandProfilePage          = lazy(() => import('./pages/NewBrandProfilePage'));
const EditBrandProfilePage         = lazy(() => import('./pages/EditBrandProfilePage'));
const BrandProfileBlogThemesPage   = lazy(() => import('./pages/BrandProfileBlogThemesPage'));

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <LoadingSpinner />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <LoadingSpinner />;
  if (isSignedIn) return <Navigate to="/brand-posts" replace />;
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
        <Route index element={<Navigate to="/brand-posts" replace />} />
        <Route path="brand-posts"        element={<Suspense fallback={<LoadingSpinner />}><BrandPostsPage /></Suspense>} />
        <Route path="xeo-blogs"         element={<Suspense fallback={<LoadingSpinner />}><XeoBlogsPage /></Suspense>} />
        <Route path="brand-profiles"    element={<Suspense fallback={<LoadingSpinner />}><BrandProfilesPage /></Suspense>} />
        <Route path="brand-profiles/new"                element={<Suspense fallback={<LoadingSpinner />}><NewBrandProfilePage /></Suspense>} />
        <Route path="brand-profiles/edit/:profileSlug"  element={<Suspense fallback={<LoadingSpinner />}><EditBrandProfilePage /></Suspense>} />
        <Route path="brand-profiles/view/:profileSlug"  element={<Suspense fallback={<LoadingSpinner />}><BrandProfileBlogThemesPage /></Suspense>} />
        <Route path="settings"          element={<Suspense fallback={<LoadingSpinner />}><SettingsPage /></Suspense>} />
        <Route path="personal-calendar" element={<Suspense fallback={<LoadingSpinner />}><PersonalCalendarPage /></Suspense>} />
        <Route path="personal-posts"    element={<Suspense fallback={<LoadingSpinner />}><PersonalPostsPage /></Suspense>} />
        <Route path="personal-profiles" element={<Suspense fallback={<LoadingSpinner />}><PersonalProfilesPage /></Suspense>} />
        <Route path="brand-calendar"    element={<Suspense fallback={<LoadingSpinner />}><BrandCalendarPage /></Suspense>} />
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
