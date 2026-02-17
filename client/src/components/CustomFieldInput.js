export default function CustomFieldInput({ field, value, onChange }) {
  const { slug, field_name, field_type } = field;
  const inputProps = {
    placeholder: field_name,
    value: value || '',
    onChange: (e) => onChange(slug, e.target.value),
  };

  switch (field_type) {
    case 'email':
      return <input type="email" {...inputProps} />;
    case 'phone':
      return <input type="tel" {...inputProps} />;
    case 'number':
      return <input type="number" {...inputProps} />;
    case 'date':
      return <input type="date" {...inputProps} />;
    case 'url':
      return <input type="url" {...inputProps} />;
    default:
      return <input type="text" {...inputProps} />;
  }
}
