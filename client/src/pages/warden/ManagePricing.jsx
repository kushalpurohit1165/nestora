import { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../../api';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/Loader.jsx';
import ErrorState from '../../components/ErrorState.jsx';

const RENT_FIELDS = [
  ['single_ac', 'Single, AC'],
  ['single_nonac', 'Single, Non-AC'],
  ['double_ac', 'Double, AC'],
  ['double_nonac', 'Double, Non-AC'],
  ['triple_ac', 'Triple, AC'],
  ['triple_nonac', 'Triple, Non-AC'],
];

function ManagePricing() {
  const { showToast } = useToast();
  const [form, setForm] = useState(null); // values are kept as strings while typing
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const load = async () => {
    try {
      const { data } = await api.get('/pricing');
      const p = data.pricing;
      setForm({ rents: { ...p.rents }, messCharge: p.messCharge, securityDeposit: p.securityDeposit });
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => { load(); }, []);

  const setRent = (key, value) => setForm({ ...form, rents: { ...form.rents, [key]: value } });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: every amount must be a number, 0 or more
    const found = {};
    const bad = (v) => v === '' || isNaN(Number(v)) || Number(v) < 0;
    RENT_FIELDS.forEach(([key]) => { if (bad(form.rents[key])) found[key] = 'Enter a valid amount'; });
    if (bad(form.messCharge)) found.messCharge = 'Enter a valid amount';
    if (bad(form.securityDeposit)) found.securityDeposit = 'Enter a valid amount';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const toNum = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Number(v)]));
    try {
      await api.put('/pricing', {
        rents: toNum(form.rents),
        messCharge: Number(form.messCharge),
        securityDeposit: Number(form.securityDeposit),
      });
      showToast('Pricing updated');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const input = (label, value, onChange, errKey) => (
    <div className="field" key={errKey}>
      <label className="label">{label} (₹)</label>
      <input className="input" type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} />
      {errors[errKey] && <div className="field-error">{errors[errKey]}</div>}
    </div>
  );

  return (
    <div>
      <h1 className="page-title">Manage Pricing</h1>
      <p className="page-sub">Changes show on the public rate card. Fees already generated keep their old amount.</p>

      {error && <ErrorState message={error} onRetry={load} />}
      {!form && !error && <Loader />}

      {form && (
        <form className="card" style={{ maxWidth: 480 }} onSubmit={handleSubmit} noValidate>
          <div className="label mb">Monthly room rent</div>
          {RENT_FIELDS.map(([key, label]) => input(label, form.rents[key], (v) => setRent(key, v), key))}
          <div className="label mb mt">Other charges</div>
          {input('Mess charge (per month)', form.messCharge, (v) => setForm({ ...form, messCharge: v }), 'messCharge')}
          {input('Security deposit', form.securityDeposit, (v) => setForm({ ...form, securityDeposit: v }), 'securityDeposit')}
          <button className="btn btn-accent">Save pricing</button>
        </form>
      )}
    </div>
  );
}

export default ManagePricing;