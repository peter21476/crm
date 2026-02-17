import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="dashboard-welcome">
        Welcome to your CRM. This is your home base. From here you'll build contacts, deals, and pipelines.
      </p>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Contacts</h3>
          <p>Manage your contacts and leads</p>
          <Link to="/contacts" className="dashboard-card-link">View contacts →</Link>
        </div>
        <div className="dashboard-card">
          <h3>Deals</h3>
          <p>Track your sales pipeline</p>
          <Link to="/deals" className="dashboard-card-link">View deals →</Link>
        </div>
        <div className="dashboard-card">
          <h3>Companies</h3>
          <p>Organize accounts and organizations</p>
          <Link to="/companies" className="dashboard-card-link">View companies →</Link>
        </div>
      </div>
    </div>
  );
}
