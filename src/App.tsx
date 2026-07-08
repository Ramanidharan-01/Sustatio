import React, { useState, useEffect } from 'react';
import { authService } from './services/auth.service';
import LoginForm from './components/Auth/LoginForm';
import Navbar from './components/Layout/Navbar';
import Dashboard from './pages/Dashboard';
import Segregation from './pages/Segregation';
import Disposal from './pages/Disposal';
import Sanitization from './pages/Sanitization';
import AdminPanel from './pages/AdminPanel';

function App() {
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const session = authService.getCurrentSession();
    if (session) {
      setUser(session.user);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'segregation':
        return <Segregation user={user} />;
      case 'disposal':
        return <Disposal user={user} />;
      case 'sanitization':
        return <Sanitization user={user} />;
      case 'admin':
        return <AdminPanel user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        user={user} 
        onLogout={handleLogout}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  );
}

export default App;