import { useState, useEffect } from 'react';
import { api } from '../api';
import CustomFieldInput from '../components/CustomFieldInput';
import './EntityList.css';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyWebsite, setNewCompanyWebsite] = useState('');
  const [editingContact, setEditingContact] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/contacts'),
      api.get('/companies'),
      api.get('/settings/custom-fields?entity_type=contact'),
    ])
      .then(([contactsData, companiesData, fieldsData]) => {
        setContacts(contactsData);
        setCompanies(companiesData);
        setCustomFields(fieldsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showForm && !editingContact) return;
    const handleEscape = (e) => e.key === 'Escape' && cancelEdit();
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showForm, editingContact]);

  function startEdit(contact) {
    setEditingContact(contact);
    setName(contact.name);
    setEmail(contact.email || '');
    setPhone(contact.phone || '');
    setCompanyId(contact.company_id ? String(contact.company_id) : '');
    setCustomFieldValues(contact.custom_fields || {});
  }

  function cancelEdit() {
    setEditingContact(null);
    setName('');
    setEmail('');
    setPhone('');
    setCompanyId('');
    setCustomFieldValues({});
    setShowForm(false);
    setShowAddCompany(false);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingContact) {
        const updated = await api.put(`/contacts/${editingContact.id}`, {
          name,
          email,
          phone,
          company_id: companyId || null,
          custom_fields: customFieldValues,
        });
        const company = companies.find((c) => c.id === parseInt(companyId, 10));
        setContacts((prev) =>
          prev.map((c) => (c.id === editingContact.id ? { ...updated, company_name: company?.name } : c))
        );
        cancelEdit();
      } else {
        const contact = await api.post('/contacts', {
          name,
          email,
          phone,
          company_id: companyId || null,
          custom_fields: customFieldValues,
        });
        const company = companies.find((c) => c.id === parseInt(companyId, 10));
        setContacts((prev) => [{ ...contact, company_name: company?.name }, ...prev]);
        setName('');
        setEmail('');
        setPhone('');
        setCompanyId('');
        setCustomFieldValues({});
        setShowForm(false);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddCompany(e) {
    e?.preventDefault();
    if (!newCompanyName.trim()) return;
    setError('');
    try {
      const company = await api.post('/companies', { name: newCompanyName.trim(), website: newCompanyWebsite || null });
      setCompanies((prev) => [company, ...prev]);
      setCompanyId(String(company.id));
      setNewCompanyName('');
      setNewCompanyWebsite('');
      setShowAddCompany(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this contact?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="entity-loading">Loading...</div>;

  return (
    <div className="entity-page">
      <div className="entity-header">
        <h1>Contacts</h1>
        <button
          className="entity-btn-add"
          onClick={() => {
            setEditingContact(null);
            setName('');
            setEmail('');
            setPhone('');
            setCompanyId('');
            setCustomFieldValues({});
            setShowAddCompany(false);
            setError('');
            setShowForm(true);
          }}
        >
          + Add contact
        </button>
      </div>

      {(showForm || editingContact) && (
        <div className="entity-modal-overlay" onClick={cancelEdit}>
          <div className="entity-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="entity-modal-header">
              <h2>{editingContact ? 'Edit contact' : 'Add contact'}</h2>
              <button className="entity-modal-close" onClick={cancelEdit} aria-label="Close">
                ×
              </button>
            </div>
            <form className="entity-form entity-form-modal" onSubmit={handleSubmit}>
              {error && <div className="entity-error">{error}</div>}
              <input
                placeholder="Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="entity-form-field-group">
                <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                  <option value="">No company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="entity-btn-inline"
                  onClick={() => setShowAddCompany(!showAddCompany)}
                >
                  {showAddCompany ? 'Cancel' : '+ Add company'}
                </button>
              </div>
              {showAddCompany && (
                <div className="entity-inline-form">
                  <input
                    placeholder="Company name *"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCompany(e)}
                  />
                  <input
                    placeholder="Website"
                    value={newCompanyWebsite}
                    onChange={(e) => setNewCompanyWebsite(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCompany(e)}
                  />
                  <button type="button" onClick={handleAddCompany} disabled={!newCompanyName.trim()}>
                    Add company
                  </button>
                </div>
              )}
              {customFields.map((f) => (
                <CustomFieldInput
                  key={f.id}
                  field={f}
                  value={customFieldValues[f.slug]}
                  onChange={(slug, val) => setCustomFieldValues((prev) => ({ ...prev, [slug]: val }))}
                />
              ))}
              <div className="entity-modal-actions">
                <button type="button" className="entity-btn-cancel" onClick={cancelEdit}>
                  Cancel
                </button>
                <button type="submit">{editingContact ? 'Save changes' : 'Add contact'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="entity-list">
        {contacts.length === 0 ? (
          <p className="entity-empty">No contacts yet. Add your first contact above.</p>
        ) : (
          contacts.map((c) => (
            <div key={c.id} className="entity-item">
              <div className="entity-item-main">
                <strong>{c.name}</strong>
                {c.email && <span>{c.email}</span>}
                {c.company_name && <span className="entity-item-meta">{c.company_name}</span>}
                {c.custom_fields &&
                  Object.entries(c.custom_fields).map(([slug, val]) => {
                    if (!val) return null;
                    const field = customFields.find((f) => f.slug === slug);
                    const label = field ? field.field_name : slug.replace(/_/g, ' ');
                    return (
                      <span key={slug} className="entity-item-meta">
                        {label}: {String(val)}
                      </span>
                    );
                  })}
              </div>
              <div className="entity-item-actions">
                <button className="entity-btn-edit" onClick={() => startEdit(c)}>
                  Edit
                </button>
                <button className="entity-btn-delete" onClick={() => handleDelete(c.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
