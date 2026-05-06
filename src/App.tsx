/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RoomProvider } from './context/RoomContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import RoomList from './pages/RoomList';
import RoomDetail from './pages/RoomDetail';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Favorites from './pages/Favorites';
import { Toaster } from '@/components/ui/sonner';
import FloatingContact from './components/FloatingContact';

export default function App() {
  return (
    <RoomProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-paper font-sans text-primary">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rooms" element={<RoomList />} />
              <Route path="/rooms/:id" element={<RoomDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/duy-quan-ly" element={<Admin />} />
              <Route path="/duy-dang-nhap" element={<Login />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <FloatingContact />
        <Toaster position="top-right" />
      </Router>
    </RoomProvider>
  );
}





