import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Homestays from './pages/Homestays';
import HomestayDetail from './pages/HomestayDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminHomestays from './pages/admin/AdminHomestays';
import { AdminUsers, AdminReports } from './pages/admin/AdminPages';
import AdminRating from './pages/admin/AdminRating';
import Profile from './pages/Profile';
import About   from './pages/About';
import Contact from './pages/Contact';
import Reviews from './pages/Reviews';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';
import { AdminRefunds } from './pages/admin/AdminRefunds';


function App() {
  return (
    <Router>
      <Routes>
        {/* ADMIN ROUTES — tanpa Navbar & Footer */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index            element={<AdminDashboard />} />
          <Route path="bookings"  element={<AdminBookings />} />
          <Route path="homestays" element={<AdminHomestays />} />
          <Route path="users"     element={<AdminUsers />} />
          <Route path="reviews"   element={<AdminRating />} />
          <Route path="reports"   element={<AdminReports />} />
          <Route path="refunds" element={<AdminRefunds />} />
        </Route>

        {/* PUBLIC ROUTES — ada Navbar & Footer */}
        <Route path="/*" element={
          <>
            <Navbar />
            <main>
              <Routes>
                <Route path="/"              element={<Home />} />
                <Route path="/homestays"     element={<Homestays />} />
                <Route path="/homestays/:id" element={<HomestayDetail />} />
                <Route path="/login"         element={<Login />} />
                <Route path="/register"      element={<Register />} />
                <Route path="/booking"       element={<Booking />} />
                <Route path="/my-bookings"   element={<MyBookings />} />
                <Route path="/profile"       element={<Profile />} />
                <Route path="/about"   element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password"  element={<ResetPassword />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;