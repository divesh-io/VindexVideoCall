import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Authenticate from './pages/Authenticate';
import { AuthProvider } from './Contexts/AuthContext';
import VideoMeet from './pages/VideoMeet';
import Home from './pages/Home';

// This is the main app router. Every page in the project is registered here.
// The order matters: landing page for visitors, auth page for login/signup,
// home dashboard for meeting creation, and the real-time meeting page.
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Authenticate />} />
          <Route path="/home" element={<Home />} />
          <Route path="/videomeet" element={<VideoMeet />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
