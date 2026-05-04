import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";

import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Gallery from './pages/Gallery';
import Impact from './pages/Impact';
import Contact from './pages/Contact';
import ProjectDetails from './pages/ProjectDetails';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProjects from './pages/admin/AdminProjects';
import GalleryManager from './pages/admin/GalleryManager';
import AdminContacts from './pages/admin/AdminContacts';
import ProtectedRoute from './components/admin/ProtectedRoute';

function App() {
  return (
    <Router>
      <ScrollToTop />

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
            <Footer />
          </div>
        } />

        <Route path="/about" element={
          <Layout><About /></Layout>
        } />

        <Route path="/projects" element={
          <Layout><Projects /></Layout>
        } />

        <Route path="/projects/:id" element={
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

      {/* ✅ Correct placement */}
      <Analytics />
    </Router>
  );
}

/* Layout Wrapper */
function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

export default App;