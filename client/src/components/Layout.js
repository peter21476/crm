import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="layout">
      <header className="layout-header">
        <Link to="/dashboard" className="layout-logo">
          CRM
        </Link>
        <nav className="layout-nav">
          <Link to="/contacts" className={location.pathname === '/contacts' ? 'active' : ''}>Contacts</Link>
          <Link to="/companies" className={location.pathname === '/companies' ? 'active' : ''}>Companies</Link>
          <Link to="/deals" className={location.pathname === '/deals' ? 'active' : ''}>Deals</Link>
          <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>Settings</Link>
        </nav>
        <div className="layout-user">
          <span className="layout-email">{user?.email}</span>
          <button onClick={logout} className="layout-logout">
            Sign out
          </button>
        </div>
      </header>
      <main className="layout-main">{children}</main>
    </div>
  );
}
