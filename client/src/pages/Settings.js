import { useState, useEffect } from 'react';
import { api } from '../api';
import './Settings.css';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL' },
];

export default function Settings() {
  const [contactFields, setContactFields] = useState([]);
  const [companyFields, setCompanyFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contact');
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [error, setError] = useState('');

  useEffect(() => {
    loadFields();
  }, []);

  async function loadFields() {
    try {
      const [contactData, companyData] = await Promise.all([
        api.get('/settings/custom-fields?entity_type=contact'),
        api.get('/settings/custom-fields?entity_type=company'),
      ]);
      setContactFields(contactData);
      setCompanyFields(companyData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddField(e) {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    setError('');
    try {
      const entityType = activeTab === 'contact' ? 'contact' : 'company';
      const field = await api.post('/settings/custom-fields', {
        entity_type: entityType,
        field_name: newFieldName.trim(),
        field_type: newFieldType,
      });
      if (entityType === 'contact') {
        setContactFields((prev) => [...prev, field]);
      } else {
        setCompanyFields((prev) => [...prev, field]);
      }
      setNewFieldName('');
      setNewFieldType('text');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteField(id, entityType) {
    if (!window.confirm('Delete this field? Existing data will be lost.')) return;
    try {
      await api.delete(`/settings/custom-fields/${id}`);
      if (entityType === 'contact') {
        setContactFields((prev) => prev.filter((f) => f.id !== id));
      } else {
        setCompanyFields((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="settings-loading">Loading...</div>;

  const fields = activeTab === 'contact' ? contactFields : companyFields;
  const builtInFields = activeTab === 'contact'
    ? ['Name', 'Email', 'Phone', 'Company']
    : ['Name', 'Website'];

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <p className="settings-desc">Manage custom fields for contacts and companies.</p>

      <div className="settings-tabs">
        <button
          className={activeTab === 'contact' ? 'active' : ''}
          onClick={() => setActiveTab('contact')}
        >
          Contact fields
        </button>
        <button
          className={activeTab === 'company' ? 'active' : ''}
          onClick={() => setActiveTab('company')}
        >
          Company fields
        </button>
      </div>

      <div className="settings-section">
        <h2>{activeTab === 'contact' ? 'Contact' : 'Company'} custom fields</h2>
        <p className="settings-hint">
          Built-in fields: {builtInFields.join(', ')}. Add more below.
        </p>

        {error && <div className="settings-error">{error}</div>}

        <form className="settings-add-form" onSubmit={handleAddField}>
          <input
            placeholder="Field name (e.g. Job Title, LinkedIn)"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
          />
          <select value={newFieldType} onChange={(e) => setNewFieldType(e.target.value)}>
            {FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <button type="submit">Add field</button>
        </form>

        <div className="settings-fields-list">
          {fields.length === 0 ? (
            <p className="settings-empty">No custom fields yet.</p>
          ) : (
            fields.map((f) => (
              <div key={f.id} className="settings-field-item">
                <span className="settings-field-name">{f.field_name}</span>
                <span className="settings-field-type">{f.field_type}</span>
                <button
                  className="settings-field-delete"
                  onClick={() => handleDeleteField(f.id, activeTab)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
