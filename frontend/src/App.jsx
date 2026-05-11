import { lazy, Suspense } from 'react';
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
const ProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <DonationProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />

            <Route path="/admin/dashboard" element={
              <ProtectedRoute><AdminDashboard /></ProtectedRoute>
            } />

            <Route path="/admin/projects" element={
              <ProtectedRoute><AdminProjects /></ProtectedRoute>
            } />

            <Route path="/admin/gallery" element={
              <ProtectedRoute><GalleryManager /></ProtectedRoute>
            } />

            <Route path="/admin/contacts" element={
              <ProtectedRoute><AdminContacts /></ProtectedRoute>
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