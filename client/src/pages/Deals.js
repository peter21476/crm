import { useState, useEffect } from 'react';
import { api } from '../api';
import './EntityList.css';

const STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('lead');
  const [contactId, setContactId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/deals'), api.get('/contacts'), api.get('/companies')])
      .then(([dealsData, contactsData, companiesData]) => {
        setDeals(dealsData);
        setContacts(contactsData);
        setCompanies(companiesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const deal = await api.post('/deals', {
        title,
        value: value ? parseFloat(value) : 0,
        stage,
        contact_id: contactId || null,
        company_id: companyId || null,
      });
      setDeals((prev) => [deal, ...prev]);
      setTitle('');
      setValue('');
      setStage('lead');
      setContactId('');
      setCompanyId('');
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this deal?')) return;
    try {
      await api.delete(`/deals/${id}`);
      setDeals((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="entity-loading">Loading...</div>;

  return (
    <div className="entity-page">
      <div className="entity-header">
        <h1>Deals</h1>
        <button className="entity-btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add deal'}
        </button>
      </div>

      {showForm && (
        <form className="entity-form" onSubmit={handleSubmit}>
          {error && <div className="entity-error">{error}</div>}
          <input
            placeholder="Deal title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <select value={contactId} onChange={(e) => setContactId(e.target.value)}>
            <option value="">No contact</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
            <option value="">No company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="submit">Add deal</button>
        </form>
      )}

      <div className="entity-list">
        {deals.length === 0 ? (
          <p className="entity-empty">No deals yet. Add your first deal above.</p>
        ) : (
          deals.map((d) => (
            <div key={d.id} className="entity-item">
              <div className="entity-item-main">
                <strong>{d.title}</strong>
                <span className="entity-item-value">${Number(d.value).toLocaleString()}</span>
                <span className="entity-item-stage">{d.stage}</span>
                {(d.contact_name || d.company_name) && (
                  <span className="entity-item-meta">
                    {[d.contact_name, d.company_name].filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
              <button className="entity-btn-delete" onClick={() => handleDelete(d.id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
