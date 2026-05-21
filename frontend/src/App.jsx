import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Homestays from './pages/Homestays';
import HomestayDetail from './pages/HomestayDetail';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/homestays"     element={<Homestays />} />
          <Route path="/homestays/:id" element={<HomestayDetail />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;