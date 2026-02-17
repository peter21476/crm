import { useState, useEffect } from 'react';
import { api } from '../api';
import CustomFieldInput from '../components/CustomFieldInput';
import './EntityList.css';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/companies'),
      api.get('/settings/custom-fields?entity_type=company'),
    ])
      .then(([companiesData, fieldsData]) => {
        setCompanies(companiesData);
        setCustomFields(fieldsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const company = await api.post('/companies', { name, website, custom_fields: customFieldValues });
      setCompanies((prev) => [company, ...prev]);
      setName('');
      setWebsite('');
      setCustomFieldValues({});
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this company?')) return;
    try {
      await api.delete(`/companies/${id}`);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="entity-loading">Loading...</div>;

  return (
    <div className="entity-page">
      <div className="entity-header">
        <h1>Companies</h1>
        <button className="entity-btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add company'}
        </button>
      </div>

      {showForm && (
        <form className="entity-form" onSubmit={handleSubmit}>
          {error && <div className="entity-error">{error}</div>}
          <input
            placeholder="Company name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          {customFields.map((f) => (
            <CustomFieldInput
              key={f.id}
              field={f}
              value={customFieldValues[f.slug]}
              onChange={(slug, val) => setCustomFieldValues((prev) => ({ ...prev, [slug]: val }))}
            />
          ))}
          <button type="submit">Add company</button>
        </form>
      )}

      <div className="entity-list">
        {companies.length === 0 ? (
          <p className="entity-empty">No companies yet. Add your first company above.</p>
        ) : (
          companies.map((c) => (
            <div key={c.id} className="entity-item">
              <div className="entity-item-main">
                <strong>{c.name}</strong>
                {c.website && <span>{c.website}</span>}
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
              <button className="entity-btn-delete" onClick={() => handleDelete(c.id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
