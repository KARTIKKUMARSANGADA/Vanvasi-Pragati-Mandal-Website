import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";

import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/common/WhatsAppButton';
import { DonationProvider } from './context/DonationContext';

// Lazy Load Public Pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Projects = lazy(() => import('./pages/Projects'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Impact = lazy(() => import('./pages/Impact'));
const Contact = lazy(() => import('./pages/Contact'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails'));

// Lazy Load Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const GalleryManager = lazy(() => import('./pages/admin/GalleryManager'));
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'));
const AdminLocations = lazy(() => import('./pages/admin/AdminLocations'));
const AdminAbout = lazy(() => import('./pages/admin/AdminAbout'));
const AdminSubscribers = lazy(() => import('./pages/admin/AdminSubscribers'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  useEffect(() => {
    const handleChunkError = (error) => {
      const errorMsg = error?.message || error?.reason?.message || '';
      if (
        errorMsg.includes('Failed to fetch dynamically imported module') ||
        errorMsg.includes('ChunkLoadError') ||
        errorMsg.includes('loading chunk')
      ) {
        console.warn('Dynamic chunk load failure detected. Forcing page refresh to load latest deployment...', error);
        window.location.reload();
      }
    };

    window.addEventListener('error', handleChunkError, true);
    window.addEventListener('unhandledrejection', handleChunkError);

    return () => {
      window.removeEventListener('error', handleChunkError, true);
      window.removeEventListener('unhandledrejection', handleChunkError);
    };
  }, []);

  return (
    <DonationProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin-vpm-portal" element={<AdminLogin />} />

            <Route path="/admin-vpm-portal/dashboard" element={
              <ProtectedRoute><AdminDashboard /></ProtectedRoute>
            } />

            <Route path="/admin-vpm-portal/projects" element={
              <ProtectedRoute><AdminProjects /></ProtectedRoute>
            } />

            <Route path="/admin-vpm-portal/gallery" element={
              <ProtectedRoute><GalleryManager /></ProtectedRoute>
            } />

            <Route path="/admin-vpm-portal/contacts" element={
              <ProtectedRoute><AdminContacts /></ProtectedRoute>
            } />

            <Route path="/admin-vpm-portal/locations" element={
              <ProtectedRoute><AdminLocations /></ProtectedRoute>
            } />

            <Route path="/admin-vpm-portal/about" element={
              <ProtectedRoute><AdminAbout /></ProtectedRoute>
            } />

            <Route path="/admin-vpm-portal/subscribers" element={
              <ProtectedRoute><AdminSubscribers /></ProtectedRoute>
            } />

            <Route path="/admin-vpm-portal/testimonials" element={
              <ProtectedRoute><AdminTestimonials /></ProtectedRoute>
            } />

            {/* Public Layout */}
            <Route path="/" element={
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <Home />
                </main>
                <WhatsAppButton />
                <Footer />
              </div>
            } />

            <Route path="/about" element={
              <Layout><About /></Layout>
            } />

            <Route path="/projects" element={
              <Layout><Projects /></Layout>
            } />

            <Route path="/projects/:uuid" element={
              <Layout><ProjectDetails /></Layout>
            } />

            <Route path="/gallery" element={
              <Layout><Gallery /></Layout>
            } />

            <Route path="/impact" element={
              <Layout><Impact /></Layout>
            } />

            <Route path="/contact" element={
              <Layout><Contact /></Layout>
            } />

            {/* Wildcard 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Analytics />
      </Router>
    </DonationProvider>
  );
}

/* Layout Wrapper */
function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <WhatsAppButton />
      <Footer />
    </div>
  );
}

export default App;